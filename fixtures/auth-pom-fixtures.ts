/**
 * auth-pom-fixtures.ts — Combines Page Object Model with role-based auth fixtures.
 *
 * Provides `adminInventory` and `userInventory` fixtures that give you
 * pre-authenticated InventoryPage instances for each role.
 *
 * Usage:
 *   import { test, expect } from '../../../fixtures/auth-pom-fixtures';
 *
 *   test('admin inventory', async ({ adminInventory }) => {
 *     await adminInventory.goto();
 *     await adminInventory.expectLoaded();
 *   });
 */
import { test as base, Page, BrowserContext } from '@playwright/test';
import { InventoryPage } from '../src/pages/auth-demo/InventoryPage';
import { LoginPage } from '../src/pages/auth-demo/LoginPage';

/**
 * Type definitions for POM + Auth fixtures.
 */
interface AuthPOMFixtures {
  /** An InventoryPage instance authenticated as admin */
  adminInventory: InventoryPage;
  /** An InventoryPage instance authenticated as standard user */
  userInventory: InventoryPage;
  /** A LoginPage instance with NO auth (clean state) */
  loginPage: LoginPage;
}

export const test = base.extend<AuthPOMFixtures>({
  /**
   * Admin inventory page — pre-authenticated as admin.
   * Automatically creates and tears down the BrowserContext.
   */
  adminInventory: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/admin.json',
    });
    const page = await context.newPage();
    const inventoryPage = new InventoryPage(page);
    await use(inventoryPage);
    await context.close();
  },

  /**
   * User inventory page — pre-authenticated as standard user.
   * Automatically creates and tears down the BrowserContext.
   */
  userInventory: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
    });
    const page = await context.newPage();
    const inventoryPage = new InventoryPage(page);
    await use(inventoryPage);
    await context.close();
  },

  /**
   * Login page — NO authentication state loaded.
   * Use this for testing the login page itself.
   */
  loginPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    const loginPage = new LoginPage(page);
    await use(loginPage);
    await context.close();
  },
});

export { expect } from '@playwright/test';
