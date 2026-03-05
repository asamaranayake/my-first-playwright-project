/**
 * user-inventory.spec.ts — Tests that run as the STANDARD USER.
 *
 * This file is matched by the 'user-tests' project which uses
 * storageState: 'playwright/.auth/user.json'
 *
 * All tests in this file are authenticated as 'performance_glitch_user'.
 * This user type has slower page loads, which tests should account for.
 *
 * Demonstrates:
 * - Using a different user role via storageState
 * - Testing behaviors specific to different user types
 * - No login code in any test
 */
import { test, expect } from '@playwright/test';

test.describe('Standard User - Inventory Tests', () => {
  test.beforeEach(async ({ page }) => {
    // No login needed! storageState is loaded automatically.
    // performance_glitch_user may be slower, so we allow extra time
    await page.goto('/inventory.html', { timeout: 30000 });
  });

  test('user can view products page', async ({ page }) => {
    await expect(page.locator('.title')).toHaveText('Products');
  });

  test('user can see all inventory items', async ({ page }) => {
    const items = page.locator('.inventory_item');
    await expect(items).toHaveCount(6);
  });

  test('user can add item to cart', async ({ page }) => {
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  test('user can navigate to item detail page', async ({ page }) => {
    // Click on the first item name
    await page.locator('.inventory_item_name').first().click();

    // Verify we're on the item detail page
    await expect(page.locator('.inventory_details_name')).toBeVisible();
    await expect(page.locator('[data-test="back-to-products"]')).toBeVisible();
  });

  test('user can navigate to cart page', async ({ page }) => {
    // Add an item first
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

    // Go to cart
    await page.locator('.shopping_cart_link').click();

    // Verify cart page loaded
    await expect(page.locator('.title')).toHaveText('Your Cart');
    await expect(page.locator('.cart_item')).toHaveCount(1);
  });

  test('user can sort products by name (Z to A)', async ({ page }) => {
    // Sort by name Z-A
    await page.locator('[data-test="product-sort-container"]').selectOption('za');

    // Get item names
    const names = await page.locator('.inventory_item_name').allTextContents();

    // Verify sorted descending alphabetically
    const sortedNames = [...names].sort((a, b) => b.localeCompare(a));
    expect(names).toEqual(sortedNames);
  });
});
