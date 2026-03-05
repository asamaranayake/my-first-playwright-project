/**
 * multi-role-interaction.spec.ts — Tests using BOTH admin and user roles together.
 *
 * This file is matched by the 'multi-role-tests' project which depends on
 * BOTH 'admin-setup' and 'user-setup'.
 *
 * Tests in this file create separate BrowserContexts for each role,
 * allowing admin and user actions to be tested side by side.
 *
 * Demonstrates:
 * - Multiple BrowserContexts in a single test
 * - Role-based fixture usage (adminPage + userPage)
 * - Testing that different contexts are isolated
 * - Using auth-fixtures.ts for clean role separation
 */
import { test, expect } from '../../../fixtures/auth-fixtures';

test.describe('Multi-Role Interaction Tests', () => {

  test('admin and user have separate cart states', async ({ adminPage, userPage }) => {
    // Both pages navigate to inventory
    await adminPage.goto('https://www.saucedemo.com/inventory.html');
    await userPage.goto('https://www.saucedemo.com/inventory.html');

    // Admin adds an item to cart
    await adminPage.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(adminPage.locator('.shopping_cart_badge')).toHaveText('1');

    // User's cart should still be empty (different context!)
    await expect(userPage.locator('.shopping_cart_badge')).not.toBeVisible();
  });

  test('admin and user both see the same products', async ({ adminPage, userPage }) => {
    await adminPage.goto('https://www.saucedemo.com/inventory.html');
    await userPage.goto('https://www.saucedemo.com/inventory.html');

    // Both should see the same number of items
    const adminItemCount = await adminPage.locator('.inventory_item').count();
    const userItemCount = await userPage.locator('.inventory_item').count();

    expect(adminItemCount).toBe(userItemCount);
    expect(adminItemCount).toBe(6);
  });

  test('admin and user can add different items simultaneously', async ({
    adminPage,
    userPage,
  }) => {
    await adminPage.goto('https://www.saucedemo.com/inventory.html');
    await userPage.goto('https://www.saucedemo.com/inventory.html');

    // Admin adds backpack
    await adminPage.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

    // User adds bike light
    await userPage.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();

    // Each has separate cart state
    await expect(adminPage.locator('.shopping_cart_badge')).toHaveText('1');
    await expect(userPage.locator('.shopping_cart_badge')).toHaveText('1');

    // Navigate to cart to verify different items
    await adminPage.locator('.shopping_cart_link').click();
    await userPage.locator('.shopping_cart_link').click();

    // Admin should have backpack
    await expect(adminPage.locator('.inventory_item_name')).toHaveText(
      'Sauce Labs Backpack'
    );

    // User should have bike light
    await expect(userPage.locator('.inventory_item_name')).toHaveText(
      'Sauce Labs Bike Light'
    );
  });

  test('contexts are fully isolated - sorting in one does not affect the other', async ({
    adminPage,
    userPage,
  }) => {
    await adminPage.goto('https://www.saucedemo.com/inventory.html');
    await userPage.goto('https://www.saucedemo.com/inventory.html');

    // Admin sorts by price high-to-low
    await adminPage
      .locator('[data-test="product-sort-container"]')
      .selectOption('hilo');

    // User sorts by name Z-to-A
    await userPage
      .locator('[data-test="product-sort-container"]')
      .selectOption('za');

    // Get first item for each
    const adminFirstItem = await adminPage
      .locator('.inventory_item_name')
      .first()
      .textContent();
    const userFirstItem = await userPage
      .locator('.inventory_item_name')
      .first()
      .textContent();

    // They should be different (different sort orders)
    expect(adminFirstItem).not.toBe(userFirstItem);
  });
});
