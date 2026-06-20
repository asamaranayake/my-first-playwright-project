/**
 * Session 06 - Mock API Responses
 *
 * Demonstrates how to use page.route() + route.fulfill()
 * to replace real API responses with mock data.
 *
 * Demo site: https://demo.playwright.dev/api-mocking
 * Trainer: Dhanushka Akila Samaranayake
 */

import { test, expect } from 'fixtures/mock-fixtures';

const FRUITS_API_PATTERN = '*/**/api/v1/fruits';

// ---------------------------------------------------------------------------
// Test Suite: Mock API Responses with route.fulfill()
// ---------------------------------------------------------------------------

test.describe('Mock API Responses', () => {
  test('mock fruits API with custom inline data', async ({ page }) => {
    // Define mock data
    const mockFruits = [
      { name: 'Strawberry', id: 21 },
      { name: 'Banana', id: 22 },
      { name: 'Mango', id: 23 },
    ];

    // Set up the route BEFORE navigating
    await page.route(FRUITS_API_PATTERN, async (route) => {
      await route.fulfill({ json: mockFruits });
    });

    // Navigate – the API call will be intercepted
    await page.goto('https://demo.playwright.dev/api-mocking');

    // Assert mock data appears on the page
    await expect(page.getByText('Strawberry')).toBeVisible();
    await expect(page.getByText('Banana')).toBeVisible();
    await expect(page.getByText('Mango')).toBeVisible();
  });

  test('mock fruits API from JSON file using mockHelper', async ({
    page,
    mockHelper,
  }) => {
    // Load mock data from test-data/mock-responses/fruits.json
    const fruits = mockHelper.loadMockData('fruits.json');

    await mockHelper.mockRoute({
      url: FRUITS_API_PATTERN,
      json: fruits,
    });

    await page.goto('https://demo.playwright.dev/api-mocking');

    // Verify one of the fruits from the file
    await expect(page.getByText('Dragon Fruit')).toBeVisible();
  });

  test('simulate a server error (500)', async ({ page }) => {
    await page.route(FRUITS_API_PATTERN, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.goto('https://demo.playwright.dev/api-mocking');

    // The page should not display any fruit data since the API failed
    await expect(page.getByText('Strawberry')).not.toBeVisible();
  });

  test('simulate an empty response', async ({ page }) => {
    await page.route(FRUITS_API_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        json: [], // No fruits
      });
    });

    await page.goto('https://demo.playwright.dev/api-mocking');

    // No fruit items should be rendered
    await expect(page.getByText('Strawberry')).not.toBeVisible();
  });

  test('simulate a slow API response', async ({ page }) => {
    await page.route(FRUITS_API_PATTERN, async (route) => {
      // Delay the response by 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await route.fulfill({
        json: [{ name: 'Delayed Fruit', id: 99 }],
      });
    });

    await page.goto('https://demo.playwright.dev/api-mocking');

    // The fruit should eventually appear
    await expect(page.getByText('Delayed Fruit')).toBeVisible({
      timeout: 10000,
    });
  });

  test('mock with custom headers', async ({ page }) => {
    await page.route(FRUITS_API_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'content-type': 'application/json',
          'x-mock-source': 'playwright-session-06',
        },
        body: JSON.stringify([{ name: 'Header Fruit', id: 50 }]),
      });
    });

    await page.goto('https://demo.playwright.dev/api-mocking');
    await expect(page.getByText('Header Fruit')).toBeVisible();
  });
});
