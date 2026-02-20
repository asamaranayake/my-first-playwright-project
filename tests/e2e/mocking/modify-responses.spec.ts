/**
 * Session 06 - Modify Real API Responses
 *
 * Demonstrates how to use route.fetch() + route.fulfill()
 * to intercept real responses and modify them, as well as
 * route.continue() to modify outgoing requests.
 *
 * Demo site: https://demo.playwright.dev/api-mocking
 * Trainer: Dhanushka Akila Samaranayake
 */

import { test, expect } from '@playwright/test';

const FRUITS_API_PATTERN = '*/**/api/v1/fruits';

// ---------------------------------------------------------------------------
// Test Suite: Modify Responses (route.fetch + route.fulfill)
// ---------------------------------------------------------------------------

test.describe('Modify Real API Responses', () => {
  test('add a custom fruit to the real response', async ({ page }) => {
    await page.route(FRUITS_API_PATTERN, async (route) => {
      // 1. Fetch the REAL response
      const response = await route.fetch();

      // 2. Parse the real JSON
      const json = await response.json();

      // 3. Add our custom item
      json.push({ name: 'Playwright Passion Fruit', id: 999 });

      // 4. Fulfill with modified data
      await route.fulfill({ response, json });
    });

    await page.goto('https://demo.playwright.dev/api-mocking');

    // Our custom fruit should appear alongside real ones
    await expect(page.getByText('Playwright Passion Fruit')).toBeVisible();
  });

  test('replace one fruit name in the real response', async ({ page }) => {
    await page.route(FRUITS_API_PATTERN, async (route) => {
      const response = await route.fetch();
      const json = await response.json();

      // Replace the first fruit's name
      if (json.length > 0) {
        json[0].name = 'Mock-Replaced Fruit';
      }

      await route.fulfill({ response, json });
    });

    await page.goto('https://demo.playwright.dev/api-mocking');

    await expect(page.getByText('Mock-Replaced Fruit')).toBeVisible();
  });

  test('limit the number of items in the response', async ({ page }) => {
    await page.route(FRUITS_API_PATTERN, async (route) => {
      const response = await route.fetch();
      const json = await response.json();

      // Only return the first 2 items
      const limited = json.slice(0, 2);

      await route.fulfill({ response, json: limited });
    });

    await page.goto('https://demo.playwright.dev/api-mocking');
    // We can't assert exact count without knowing the UI structure,
    // but we verify the page renders without errors.
    await expect(page.locator('body')).toBeVisible();
  });

  test('add a response header to the real response', async ({ page }) => {
    let capturedHeaders: Record<string, string> = {};

    await page.route(FRUITS_API_PATTERN, async (route) => {
      const response = await route.fetch();
      const body = await response.text();

      const headers = {
        ...response.headers(),
        'x-mock-injected': 'true',
      };

      capturedHeaders = headers;

      await route.fulfill({
        status: response.status(),
        headers,
        body,
      });
    });

    await page.goto('https://demo.playwright.dev/api-mocking');

    // Verify our injected header was set
    expect(capturedHeaders['x-mock-injected']).toBe('true');
  });
});

// ---------------------------------------------------------------------------
// Test Suite: Modify Outgoing Requests (route.continue)
// ---------------------------------------------------------------------------

test.describe('Modify Outgoing Requests', () => {
  test('add a custom header to outgoing API requests', async ({ page }) => {
    let sentHeaders: Record<string, string> | undefined;

    await page.route(FRUITS_API_PATTERN, async (route) => {
      const headers = {
        ...route.request().headers(),
        'x-test-session': 'session-06',
        'x-test-run': new Date().toISOString(),
      };

      sentHeaders = headers;

      await route.continue({ headers });
    });

    await page.goto('https://demo.playwright.dev/api-mocking');

    // Verify our headers were sent
    expect(sentHeaders).toBeDefined();
    expect(sentHeaders!['x-test-session']).toBe('session-06');
  });

  test('remove a request header before forwarding', async ({ page }) => {
    await page.route('**/*', async (route) => {
      const headers = { ...route.request().headers() };
      // Remove user-agent header for demonstration
      delete headers['user-agent'];
      await route.continue({ headers });
    });

    // Page should still load successfully
    await page.goto('https://demo.playwright.dev/api-mocking');
    await expect(page.locator('body')).toBeVisible();
  });
});
