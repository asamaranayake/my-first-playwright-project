/**
 * admin-inventory.spec.ts — Tests that run as the ADMIN user.
 *
 * This file is matched by the 'admin-tests' project which uses
 * storageState: 'playwright/.auth/admin.json'
 *
 * All tests in this file are already authenticated — no login needed!
 *
 * Demonstrates:
 * - Using saved auth state with storageState
 * - Admin role capabilities
 * - No login code in any test
 */
import { test, expect } from '@playwright/test';

test.describe('Admin User - Inventory Tests', () => {
  test.beforeEach(async ({ page }) => {
    // No login needed! storageState is loaded automatically.
    await page.goto('/inventory.html');
  });

  test('admin can view products page', async ({ page }) => {
    // Verify the products page loaded (already authenticated!)
    await expect(page.locator('.title')).toHaveText('Products');
  });

  test('admin can see all inventory items', async ({ page }) => {
    const items = page.locator('.inventory_item');
    // SauceDemo has 6 inventory items
    await expect(items).toHaveCount(6);
  });

  test('admin can add item to cart', async ({ page }) => {
    // Add Sauce Labs Backpack to cart
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

    // Verify cart badge shows 1
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  test('admin can add multiple items to cart', async ({ page }) => {
    // Add two items
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();

    // Verify cart badge shows 2
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');
  });

  test('admin can remove item from cart', async ({ page }) => {
    // Add an item
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    // Remove the item
    await page.locator('[data-test="remove-sauce-labs-backpack"]').click();

    // Badge should no longer be visible
    await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
  });

  test('admin can sort products by price (low to high)', async ({ page }) => {
    // Sort by price: low to high
    await page.locator('[data-test="product-sort-container"]').selectOption('lohi');

    // Get all prices
    const priceTexts = await page.locator('.inventory_item_price').allTextContents();
    const prices = priceTexts.map((text) => parseFloat(text.replace('$', '')));

    // Verify sorted ascending
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });
});
