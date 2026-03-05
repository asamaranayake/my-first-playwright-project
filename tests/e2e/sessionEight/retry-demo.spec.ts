import { test, expect } from '@playwright/test';

/**
 * Session 08: Test Retry Demonstration
 *
 * These tests demonstrate how retries work in Playwright.
 * Some tests are intentionally designed to show retry behavior.
 */

test.describe('Retry Behavior Demo', () => {
  // Configure retries for this specific describe block
  test.describe.configure({ retries: 2 });

  test('should demonstrate testInfo.retry usage', async ({ page }, testInfo) => {
    // On retry, we can do cleanup or take different actions
    if (testInfo.retry > 0) {
      console.log(`This is retry attempt ${testInfo.retry}`);
      // You could clear caches, reset state, etc.
    }

    await page.goto('https://www.saucedemo.com');
    await expect(page.locator('.login_logo')).toBeVisible();
  });

  test('should handle slow network gracefully', async ({ page }) => {
    // Increase timeout for this specific test
    test.setTimeout(30_000);

    await page.goto('https://www.saucedemo.com');
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.locator('#login-button').click();
    await expect(page).toHaveURL(/inventory/);
  });
});

test.describe('Worker Index Demo', () => {
  test('should demonstrate workerIndex for test data isolation', async (
    { page },
    testInfo
  ) => {
    /**
     * testInfo.workerIndex can be used to generate unique test data
     * per worker, avoiding conflicts in parallel execution.
     *
     * For example:
     *   Worker 0 → uses test-user-0@example.com
     *   Worker 1 → uses test-user-1@example.com
     */
    const uniqueUsername = `worker-${testInfo.workerIndex}`;
    console.log(`Test running in worker ${testInfo.workerIndex}, ` +
      `parallel index ${testInfo.parallelIndex}`);
    console.log(`Would use unique test data: ${uniqueUsername}`);

    // Actual test
    await page.goto('https://www.saucedemo.com');
    await expect(page.locator('.login_logo')).toBeVisible();
  });
});
