/**
 * Session 06 - Block Unwanted Resources
 *
 * Demonstrates how to use route.abort() to block images,
 * stylesheets, tracking scripts, and other resources.
 *
 * Trainer: Dhanushka Akila Samaranayake
 */

import { test, expect } from '../../fixtures/mock-fixtures';

// ---------------------------------------------------------------------------
// Test Suite: Block Resources with route.abort()
// ---------------------------------------------------------------------------

test.describe('Block Resources', () => {
  test('block all image requests by extension', async ({ page }) => {
    // Track how many images were blocked
    let blockedCount = 0;

    await page.route('**/*.{png,jpg,jpeg,gif,svg,webp}', async (route) => {
      blockedCount++;
      await route.abort();
    });

    await page.goto('https://playwright.dev');

    // Page should still load – just without images
    await expect(page.locator('h1')).toBeVisible();
    console.log(`Blocked ${blockedCount} image request(s)`);
  });

  test('block resources by resource type', async ({ page }) => {
    const blockedTypes: string[] = [];

    await page.route('**/*', async (route) => {
      const resourceType = route.request().resourceType();

      if (resourceType === 'image' || resourceType === 'font') {
        blockedTypes.push(resourceType);
        return route.abort();
      }
      return route.continue();
    });

    await page.goto('https://playwright.dev');

    await expect(page.locator('h1')).toBeVisible();
    console.log('Blocked resource types:', [...new Set(blockedTypes)]);
  });

  test('block third-party analytics scripts', async ({ page }) => {
    // Block common analytics / tracking domains
    await page.route('**/*google-analytics*/**', (route) => route.abort());
    await page.route('**/*googletagmanager*/**', (route) => route.abort());
    await page.route('**/*facebook.net/**', (route) => route.abort());

    await page.goto('https://playwright.dev');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('block CSS for all pages via context route', async ({ context }) => {
    // Context-level route: applies to every page opened in this context
    await context.route(/\.css$/i, (route) => route.abort());

    const page = await context.newPage();
    await page.goto('https://playwright.dev');

    // Page loads without styling
    await expect(page.locator('h1')).toBeVisible();
  });

  test('block requests using mockHelper.blockRequests()', async ({
    page,
    mockHelper,
  }) => {
    // Use the fixture helper for a cleaner API
    await mockHelper.blockRequests('**/*.{png,jpg,jpeg,gif,svg,webp}');
    await mockHelper.blockRequests('**/*.css');

    await page.goto('https://playwright.dev');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('selectively block – allow only document and script', async ({
    page,
  }) => {
    const allowedTypes = new Set(['document', 'script', 'xhr', 'fetch']);

    await page.route('**/*', async (route) => {
      if (allowedTypes.has(route.request().resourceType())) {
        return route.continue();
      }
      return route.abort();
    });

    await page.goto('https://playwright.dev');
    await expect(page.locator('h1')).toBeVisible();
  });
});
