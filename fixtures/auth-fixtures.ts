/**
 * auth-fixtures.ts — Custom Playwright fixtures for role-based authentication.
 *
 * Provides `adminPage` and `userPage` fixtures that create separate
 * BrowserContexts with pre-loaded authentication state for each role.
 *
 * Usage:
 *   import { test, expect } from '../../../fixtures/auth-fixtures';
 *
 *   test('admin test', async ({ adminPage }) => { ... });
 *   test('user test', async ({ userPage }) => { ... });
 *   test('multi-role', async ({ adminPage, userPage }) => { ... });
 */
import { test as base, Page, BrowserContext } from '@playwright/test';

/**
 * Type definitions for our custom auth fixtures.
 */
interface AuthFixtures {
  /** A Page instance authenticated as an admin user */
  adminPage: Page;
  /** A Page instance authenticated as a standard user */
  userPage: Page;
  /** The admin BrowserContext (if you need direct context access) */
  adminContext: BrowserContext;
  /** The user BrowserContext (if you need direct context access) */
  userContext: BrowserContext;
}

export const test = base.extend<AuthFixtures>({
  /**
   * Admin context — creates a new BrowserContext loaded with admin auth state.
   * Automatically closes after the test.
   */
  adminContext: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/admin.json',
    });
    await use(context);
    await context.close();
  },

  /**
   * Admin page — creates a new Page within the admin context.
   * Already authenticated as admin when the test receives it.
   */
  adminPage: async ({ adminContext }, use) => {
    const page = await adminContext.newPage();
    await use(page);
    // Page is closed when adminContext closes
  },

  /**
   * User context — creates a new BrowserContext loaded with user auth state.
   * Automatically closes after the test.
   */
  userContext: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
    });
    await use(context);
    await context.close();
  },

  /**
   * User page — creates a new Page within the user context.
   * Already authenticated as standard user when the test receives it.
   */
  userPage: async ({ userContext }, use) => {
    const page = await userContext.newPage();
    await use(page);
    // Page is closed when userContext closes
  },
});

export { expect } from '@playwright/test';
