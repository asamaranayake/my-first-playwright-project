import { test, expect } from '@playwright/test';

/**
 * Session 08: Inventory Page Tests
 *
 * These tests cover product listing, sorting, and cart operations.
 * They demonstrate parallel-safe test data isolation — each test
 * logs in independently and doesn't depend on other tests' state.
 */

test.describe('Inventory Page', () => {
  test.beforeEach(async ({ page }) => {
    // Each test logs in independently — safe for parallel execution
    await page.goto('/');
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.locator('#login-button').click();
    await expect(page).toHaveURL(/inventory/);
  });

  test('should display products list', async ({ page }) => {
    const items = page.locator('.inventory_item');
    await expect(items).toHaveCount(6);
  });

  test('should sort products by name (A to Z)', async ({ page }) => {
    await page.locator('[data-test="product-sort-container"]').selectOption('az');
    const firstItem = page.locator('.inventory_item_name').first();
    await expect(firstItem).toHaveText('Sauce Labs Backpack');
  });

  test('should sort products by name (Z to A)', async ({ page }) => {
    await page.locator('[data-test="product-sort-container"]').selectOption('za');
    const firstItem = page.locator('.inventory_item_name').first();
    await expect(firstItem).toHaveText('Test.allTheThings() T-Shirt (Red)');
  });

  test('should sort products by price (low to high)', async ({ page }) => {
    await page.locator('[data-test="product-sort-container"]').selectOption('lohi');
    const firstPrice = page.locator('.inventory_item_price').first();
    await expect(firstPrice).toHaveText('$7.99');
  });

  test('should sort products by price (high to low)', async ({ page }) => {
    await page.locator('[data-test="product-sort-container"]').selectOption('hilo');
    const firstPrice = page.locator('.inventory_item_price').first();
    await expect(firstPrice).toHaveText('$49.99');
  });

  test('should add item to cart', async ({ page }) => {
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

    // Verify cart badge shows 1
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    // Verify button changed to Remove
    await expect(
      page.locator('[data-test="remove-sauce-labs-backpack"]')
    ).toBeVisible();
  });

  test('should remove item from cart', async ({ page }) => {
    // Add first
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    // Remove
    await page.locator('[data-test="remove-sauce-labs-backpack"]').click();
    await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
  });

  test('should navigate to product detail page', async ({ page }) => {
    await page.locator('.inventory_item_name').first().click();
    await expect(page.locator('.inventory_details_name')).toBeVisible();
    await expect(page.locator('[data-test="back-to-products"]')).toBeVisible();
  });
});
