import { test, expect } from '@playwright/test';

/**
 * Session 08: Checkout Flow Tests
 *
 * These tests cover the complete checkout workflow.
 * They demonstrate sequential test ordering using test.describe.serial
 * and how retries interact with serial mode.
 */

test.describe('Checkout Flow @smoke', () => {
  test.beforeEach(async ({ page }) => {
    // Login and add an item to cart before each test
    await page.goto('/');
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.locator('#login-button').click();
    await expect(page).toHaveURL(/inventory/);
  });

  test('should add items and view cart', async ({ page }) => {
    // Add two items
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');

    // Go to cart
    await page.locator('.shopping_cart_link').click();
    await expect(page).toHaveURL(/cart/);

    const cartItems = page.locator('.cart_item');
    await expect(cartItems).toHaveCount(2);
  });

  test('should proceed through checkout step one', async ({ page }) => {
    // Add item and go to cart
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('.shopping_cart_link').click();

    // Start checkout
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/checkout-step-one/);

    // Fill checkout info
    await page.getByPlaceholder('First Name').fill('John');
    await page.getByPlaceholder('Last Name').fill('Doe');
    await page.getByPlaceholder('Zip/Postal Code').fill('12345');

    // Continue
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/checkout-step-two/);
  });

  test('should complete checkout', async ({ page }) => {
    // Add item, go to cart, start checkout
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('.shopping_cart_link').click();
    await page.locator('[data-test="checkout"]').click();

    // Fill info and continue
    await page.getByPlaceholder('First Name').fill('John');
    await page.getByPlaceholder('Last Name').fill('Doe');
    await page.getByPlaceholder('Zip/Postal Code').fill('12345');
    await page.locator('[data-test="continue"]').click();

    // Verify order summary
    await expect(page.locator('.summary_info')).toBeVisible();

    // Finish order
    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL(/checkout-complete/);
    await expect(page.locator('.complete-header')).toHaveText(
      'Thank you for your order!'
    );
  });

  test('should show error when checkout info is missing', async ({ page }) => {
    // Add item and go to checkout
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('.shopping_cart_link').click();
    await page.locator('[data-test="checkout"]').click();

    // Try to continue without filling info
    await page.locator('[data-test="continue"]').click();
    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText(
      'First Name is required'
    );
  });
});
