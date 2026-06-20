/**
 * admin.setup.ts — Authentication setup for the ADMIN role.
 *
 * This file runs ONCE before any admin-tests project.
 * It logs in as 'standard_user' (simulating admin role on saucedemo)
 * and saves the storage state to playwright/.auth/admin.json.
 *
 * Playwright will automatically run this before any project
 * with `dependencies: ['admin-setup']`.
 */
import { test as setup, expect } from '@playwright/test';

const adminAuthFile = 'playwright/.auth/admin.json';

setup('authenticate as admin user', async ({ page }) => {
  // Step 1: Navigate to login page
  await page.goto('https://www.saucedemo.com/');

  // Step 2: Fill in admin credentials
  // Using 'standard_user' to simulate admin (saucedemo has limited roles)
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');

  // Step 3: Click login
  await page.locator('[data-test="login-button"]').click();

  // Step 4: Wait for successful navigation
  await page.waitForURL('**/inventory.html');

  // Step 5: Verify login was successful
  await expect(page.locator('.title')).toHaveText('Products');

  // Step 6: Save the authentication state (cookies + localStorage)
  await page.context().storageState({ path: adminAuthFile });

  console.log('✅ Admin authentication state saved to:', adminAuthFile);
});
