import { test as base, expect } from '@playwright/test';
import { UsersAPI } from '../src/api/UsersAPI';

// ──────────────────────────────────────────────
// Custom API Fixtures
// ──────────────────────────────────────────────

/**
 * Define the shape of our custom fixtures.
 * Each property becomes a fixture available in tests.
 */
type APIFixtures = {
  /** Pre-configured UsersAPI instance */
  usersAPI: UsersAPI;
};

/**
 * Extended test with API fixtures.
 *
 * Usage in tests:
 *   import { test, expect } from '../fixtures/api-fixtures';
 *
 *   test('my api test', async ({ usersAPI }) => {
 *     const response = await usersAPI.getUsers();
 *     // ...
 *   });
 */
export const test = base.extend<APIFixtures>({
  /**
   * UsersAPI fixture
   *
   * Lifecycle:
   * 1. Setup: Creates UsersAPI from Playwright's request context
   * 2. use(): Provides the instance to the test
   * 3. Teardown: Cleanup (logging in this case)
   *
   * Same pattern as UI fixtures from Session 04!
   */
  usersAPI: async ({ request }, use) => {
    // ── Setup Phase ──
    const usersAPI = new UsersAPI(request);

    // ── Provide to Test ──
    await use(usersAPI);

    // ── Teardown Phase ──
    // Optional: cleanup, logging, etc.
  },
});

export { expect };
