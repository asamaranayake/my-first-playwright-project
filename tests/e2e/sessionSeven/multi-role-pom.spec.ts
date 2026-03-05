/**
 * multi-role-pom.spec.ts — Tests using POM + Auth fixtures for both roles.
 *
 * This file uses auth-pom-fixtures which provide InventoryPage instances
 * that are already pre-authenticated for each role.
 *
 * Demonstrates:
 * - Combining Page Object Model with role-based auth fixtures
 * - Using adminInventory and userInventory fixtures
 * - Clean separation between POM logic and auth logic
 * - Using loginPage fixture (no auth) for login tests
 */
import { test, expect } from '../../../fixtures/auth-pom-fixtures';

test.describe('Multi-Role POM Tests', () => {

  test('admin inventory loads correctly via POM', async ({ adminInventory }) => {
    await adminInventory.goto();
    await adminInventory.expectLoaded();
  });

  test('user inventory loads correctly via POM', async ({ userInventory }) => {
    await userInventory.goto();
    await userInventory.expectLoaded();
  });

  test('admin can add to cart using POM', async ({ adminInventory }) => {
    await adminInventory.goto();
    await adminInventory.addToCart('sauce-labs-backpack');

    const cartCount = await adminInventory.getCartCount();
    expect(cartCount).toBe(1);
  });

  test('admin can sort by price using POM', async ({ adminInventory }) => {
    await adminInventory.goto();
    await adminInventory.sortBy('lohi');

    const prices = await adminInventory.getItemPrices();
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });

  test('user can sort by name using POM', async ({ userInventory }) => {
    await userInventory.goto();
    await userInventory.sortBy('az');

    const names = await userInventory.getItemNames();
    const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sortedNames);
  });

  test('login page works with unauthenticated POM', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    // After login, we should be redirected
    await loginPage.page.waitForURL('**/inventory.html');
  });

  test('login page shows error for locked user via POM', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('locked_out_user', 'secret_sauce');
    await loginPage.expectError('Sorry, this user has been locked out');
  });
});
