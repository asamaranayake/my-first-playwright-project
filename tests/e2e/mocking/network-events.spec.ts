/**
 * Session 06 - Network Events & Monitoring
 *
 * Demonstrates how to listen to network events (request, response,
 * requestfailed) and use waitForResponse() to synchronise with
 * specific API calls.
 *
 * Demo site: https://demo.playwright.dev/api-mocking
 * Trainer: Dhanushka Akila Samaranayake
 */

import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Test Suite: Network Events & Monitoring
// ---------------------------------------------------------------------------

test.describe('Network Events', () => {
  test.only('capture browser console logs', async ({ page }) => {
    const browserLogs: { type: string; text: string }[] = [];

    page.on('console', (msg) => {
      browserLogs.push({
        type: msg.type(),
        text: msg.text(),
      });
    });

    page.on('pageerror', (err) => {
      browserLogs.push({
        type: 'error',
        text: err.message,
      });
    });

    await page.goto('https://demo.playwright.dev/api-mocking');

    await page.evaluate(() => {
      console.log('PW_CONSOLE_LOG: hello');
      console.warn('PW_CONSOLE_WARN: check warning');
      console.error('PW_CONSOLE_ERROR: check error');
    });

    expect(
      browserLogs.some(
        (entry) =>
          entry.type === 'log' && entry.text.includes('PW_CONSOLE_LOG: hello'),
      ),
    ).toBe(true);

    expect(
      browserLogs.some(
        (entry) =>
          entry.type === 'warning' &&
          entry.text.includes('PW_CONSOLE_WARN: check warning'),
      ),
    ).toBe(true);

    expect(
      browserLogs.some(
        (entry) =>
          entry.type === 'error' &&
          entry.text.includes('PW_CONSOLE_ERROR: check error'),
      ),
    ).toBe(true);
  });

  test('log all outgoing requests during navigation', async ({ page }) => {
    const requestUrls: string[] = [];

    page.on('request', (request) => {
      requestUrls.push(`${request.method()} ${request.url()}`);
    });

    await page.goto('https://demo.playwright.dev/api-mocking');
    console.log('All outgoing requests during navigation:');
    console.log(requestUrls.join('\n'));
    // We should have captured at least the document request
    console.log(`Captured ${requestUrls.length} request(s)`);
    expect(requestUrls.length).toBeGreaterThan(0);

    // The main page request should be present
    const hasDocument = requestUrls.some((u) => u.startsWith('GET'));
    expect(hasDocument).toBe(true);
  });

  test('log response status codes', async ({ page }) => {
    const responses: { url: string; status: number }[] = [];

    page.on('response', (response) => {
      responses.push({
        url: response.url(),
        status: response.status(),
      });
    });

    await page.goto('https://demo.playwright.dev/api-mocking');

    // All responses should have valid HTTP status codes
    for (const resp of responses) {
      expect(resp.status).toBeGreaterThanOrEqual(200);
      expect(resp.status).toBeLessThan(600);
    }

    console.log(`Received ${responses.length} response(s)`);
  });

  test('detect failed requests', async ({ page }) => {
    const failedRequests: string[] = [];

    page.on('requestfailed', (request) => {
      failedRequests.push(
        `${request.url()} – ${request.failure()?.errorText}`,
      );
    });

    // Block images so we create some failed requests
    await page.route('**/*.{png,jpg,svg}', (route) => route.abort());

    await page.goto('https://demo.playwright.dev/api-mocking');

    console.log(`Failed requests: ${failedRequests.length}`);
    // Each aborted image becomes a "requestfailed" event
  });

  test('wait for a specific API response', async ({ page }) => {
    // Start waiting BEFORE triggering the action
    const responsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/v1/fruits') && resp.status() === 200,
    );

    // Navigate – this triggers the API call
    await page.goto('https://demo.playwright.dev/api-mocking');

    // Await the specific response
    const response = await responsePromise;

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    console.log(`Fruits API returned ${body.length} item(s)`);
  });

  test('wait for response with URL string pattern', async ({ page }) => {
    const responsePromise = page.waitForResponse('*/**/api/v1/fruits');

    await page.goto('https://demo.playwright.dev/api-mocking');

    const response = await responsePromise;
    expect(response.ok()).toBe(true);
  });

  test('collect requests using mockHelper fixture', async ({
    page,
  }) => {
    const apiCalls: string[] = [];

    page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        apiCalls.push(request.url());
      }
    });

    await page.goto('https://demo.playwright.dev/api-mocking');

    // At least one API call should have been made
    expect(apiCalls.length).toBeGreaterThan(0);
    console.log('API calls:', apiCalls);
  });
});
