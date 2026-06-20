/**
 * user.setup.ts — Authentication setup for the STANDARD USER role.
 *
 * This file runs ONCE before any user-tests project.
 * It logs in as 'performance_glitch_user' (a different user type on saucedemo)
 * and saves the storage state to playwright/.auth/user.json.
 *
 * Playwright will automatically run this before any project
 * with `dependencies: ['user-setup']`.
 */
import { test as setup, expect } from '@playwright/test';

const userAuthFile = 'playwright/.auth/user.json';

setup('authenticate as standard user', async ({ page }) => {
  // Step 1: Navigate to login page
  await page.goto('https://www.saucedemo.com/');

  // Step 2: Fill in standard user credentials
  // Using 'performance_glitch_user' to demonstrate a different user role
  await page.locator('[data-test="username"]').fill('performance_glitch_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');

  // Step 3: Click login
  await page.locator('[data-test="login-button"]').click();

  // Step 4: Wait for successful navigation
  // Note: performance_glitch_user is slower, so we allow more time
  await page.waitForURL('**/inventory.html', { timeout: 30000 });

  // Step 5: Verify login was successful
  await expect(page.locator('.title')).toHaveText('Products');

  // Step 6: Save the authentication state (cookies + localStorage)
  await page.context().storageState({ path: userAuthFile });

  console.log('✅ Standard user authentication state saved to:', userAuthFile);
});
