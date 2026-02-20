/**
 * Session 06 - HAR File Recording & Replay
 *
 * Demonstrates recording network traffic to HAR files
 * and replaying them in tests for offline / deterministic runs.
 *
 * Demo site: https://demo.playwright.dev/api-mocking
 * Trainer: Dhanushka Akila Samaranayake
 */

import { test, expect } from '@playwright/test';
import path from 'path';

const HAR_DIR = path.resolve(__dirname, '..', '..', '..', 'hars');
const FRUITS_API_PATTERN = '*/**/api/v1/fruits';

// ---------------------------------------------------------------------------
// Test Suite: HAR Recording & Replay
// ---------------------------------------------------------------------------

test.describe('HAR Recording & Replay', () => {
  /**
   * STEP 1 – Record a HAR file.
   *
   * ⚠️  Run this test ONCE to record fresh network data.
   * After recording, subsequent tests replay from the saved file.
   *
   * Command:  npx playwright test -g "record"
   * Or CLI:   npx playwright open --save-har=hars/fruits.har \
   *             --save-har-glob="**\/api\/**" \
   *             https://demo.playwright.dev/api-mocking
   */
  test('record fruits API to HAR file', async ({ page }) => {
    // update: true  →  Playwright RECORDS rather than replays
    await page.routeFromHAR(path.join(HAR_DIR, 'demo.playwright.dev.har'), {
      url: FRUITS_API_PATTERN,
      update: true,
    });

    // Navigate and interact – everything matching the URL is recorded
    await page.goto('https://demo.playwright.dev/api-mocking');

    // Give the page time to fetch data
    await page.waitForTimeout(2000);

    // The HAR file is written when the browser context closes
    // (happens automatically at test teardown)
  });

  /**
   * STEP 2 – Replay from the HAR file.
   *
   * ⚠️  Requires the HAR file from Step 1 to exist.
   *     A pre-recorded sample is shipped in hars/fruits-sample.har
   */
  test('replay fruits API from HAR file', async ({ page }) => {
    // update: false (default) → replay mode
    await page.routeFromHAR(path.join(HAR_DIR, 'demo.playwright.dev.har'), {
      url: FRUITS_API_PATTERN,
      update: false,
    });

    await page.goto('https://demo.playwright.dev/api-mocking');

    // Assertions: data comes from the HAR file, not the live API
    await expect(page.locator('body')).toBeVisible();
  });

  /**
   * Demonstrate routeFromHAR at the context level with notFound option.
   */
  test('context-level HAR replay with notFound fallback', async ({
    context,
  }) => {
    await context.routeFromHAR(path.join(HAR_DIR, 'demo.playwright.dev.har'), {
      url: '**/api/**',
      notFound: 'fallback', // fall through to next handler if not in HAR
    });

    const page = await context.newPage();
    await page.goto('https://demo.playwright.dev/api-mocking');

    await expect(page.locator('body')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// NOTE: The tests above are marked test.skip because they depend on
// pre-recorded HAR files. To use them in a real setup:
//
//   1. Remove `test.skip` from the "record" test
//   2. Run it once:  npx playwright test -g "record"
//   3. Mark "record" as test.skip again
//   4. Remove test.skip from the "replay" tests
//   5. Run replay tests – no network calls to the real API!
// ---------------------------------------------------------------------------
