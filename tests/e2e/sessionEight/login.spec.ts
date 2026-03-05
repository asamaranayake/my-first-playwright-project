import { test, expect } from '@playwright/test';

/**
 * Session 08: Basic E2E Tests for CI/CD Demo
 *
 * These tests demonstrate typical E2E scenarios that would
 * run in a CI pipeline. They target the SauceDemo application.
 */

test.describe('Login Page @smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the login page', async ({ page }) => {
    await expect(page.locator('.login_logo')).toBeVisible();
    await expect(page.getByPlaceholder('Username')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
    await expect(page.locator('#login-button')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.locator('#login-button').click();

    await expect(page).toHaveURL(/inventory/);
    await expect(page.locator('.title')).toHaveText('Products');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByPlaceholder('Username').fill('invalid_user');
    await page.getByPlaceholder('Password').fill('wrong_password');
    await page.locator('#login-button').click();

    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText(
      'Username and password do not match'
    );
  });

  test('should show error for locked out user', async ({ page }) => {
    await page.getByPlaceholder('Username').fill('locked_out_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.locator('#login-button').click();

    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText(
      'locked out'
    );
  });
});
