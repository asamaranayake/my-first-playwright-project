/**
 * Session 06 - Custom Test Fixtures for Network Mocking
 *
 * These fixtures extend Playwright's built-in test with
 * reusable network mocking helpers.
 *
 * Trainer: Dhanushka Akila Samaranayake
 */

import { test as base, Page, Route } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Describes a mock route configuration */
interface MockRouteConfig {
  /** URL pattern (glob, regex, or predicate) */
  url: string | RegExp | ((url: URL) => boolean);
  /** JSON body to return */
  json?: unknown;
  /** HTTP status code (default 200) */
  status?: number;
  /** Custom headers */
  headers?: Record<string, string>;
  /** Plain-text body (used when json is not provided) */
  body?: string;
  /** Content type (default application/json when json provided) */
  contentType?: string;
}

/** Helper object provided to tests via the `mockHelper` fixture */
interface MockHelper {
  /** Register a mock route on the page */
  mockRoute(config: MockRouteConfig): Promise<void>;
  /** Load mock JSON data from the test-data/mock-responses directory */
  loadMockData<T = unknown>(fileName: string): T;
  /** Block all requests matching the URL pattern */
  blockRequests(urlPattern: string | RegExp): Promise<void>;
  /** Collect all request URLs that match a pattern */
  collectRequests(urlPattern: string | RegExp): string[];
}

// ---------------------------------------------------------------------------
// Fixture Definition
// ---------------------------------------------------------------------------

export const test = base.extend<{ mockHelper: MockHelper }>({
  mockHelper: async ({ page }, use) => {
    const collectedRequests: Map<string, string[]> = new Map();

    const helper: MockHelper = {
      /** Register a mock route that fulfills with the given config */
      async mockRoute(config: MockRouteConfig): Promise<void> {
        await page.route(config.url, async (route: Route) => {
          const fulfillOptions: Record<string, unknown> = {
            status: config.status ?? 200,
          };

          if (config.json !== undefined) {
            fulfillOptions.json = config.json;
          } else if (config.body !== undefined) {
            fulfillOptions.body = config.body;
            fulfillOptions.contentType = config.contentType ?? 'text/plain';
          }

          if (config.headers) {
            fulfillOptions.headers = config.headers;
          }

          await route.fulfill(fulfillOptions);
        });
      },

      /** Read a JSON file from test-data/mock-responses/ */
      loadMockData<T = unknown>(fileName: string): T {
        const filePath = path.resolve(
          __dirname,
          '..',
          'test-data',
          'mock-responses',
          fileName,
        );
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw) as T;
      },

      /** Block (abort) all requests matching the URL pattern */
      async blockRequests(urlPattern: string | RegExp): Promise<void> {
        await page.route(urlPattern, (route) => route.abort());
      },

      /** Start collecting request URLs that match a pattern */
      collectRequests(urlPattern: string | RegExp): string[] {
        const key =
          typeof urlPattern === 'string' ? urlPattern : urlPattern.source;
        if (!collectedRequests.has(key)) {
          collectedRequests.set(key, []);
          page.on('request', (request) => {
            const url = request.url();
            const matches =
              typeof urlPattern === 'string'
                ? url.includes(urlPattern)
                : urlPattern.test(url);
            if (matches) {
              collectedRequests.get(key)!.push(url);
            }
          });
        }
        return collectedRequests.get(key)!;
      },
    };

    await use(helper);
  },
});

export { expect } from '@playwright/test';
