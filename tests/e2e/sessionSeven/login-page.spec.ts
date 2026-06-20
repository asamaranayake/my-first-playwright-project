/**
 * login-page.spec.ts — Tests for the LOGIN page itself.
 *
 * This file is matched by the 'login-tests' project which uses
 * storageState: { cookies: [], origins: [] }
 *
 * These tests start with NO authentication — a clean browser state.
 * This is essential for testing the login page UI and validation.
 *
 * Demonstrates:
 * - Skipping authentication with empty storageState
 * - Testing login page functionality
 * - Verifying error messages for invalid credentials
 * - Testing the complete login flow
 */
import { test, expect } from '@playwright/test';

test.describe('Login Page - No Auth Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('login page displays all form elements', async ({ page }) => {
    // Verify login form elements are present
    await expect(page.locator('[data-test="username"]')).toBeVisible();
    await expect(page.locator('[data-test="password"]')).toBeVisible();
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });

  test('login page has correct title', async ({ page }) => {
    await expect(page.locator('.login_logo')).toHaveText('Swag Labs');
  });

  test('successful login redirects to inventory', async ({ page }) => {
    // Perform a valid login
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    // Verify redirect to inventory page
    await page.waitForURL('**/inventory.html');
    await expect(page.locator('.title')).toHaveText('Products');
  });

  test('shows error for invalid username', async ({ page }) => {
    await page.locator('[data-test="username"]').fill('invalid_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    // Verify error message
    await expect(page.locator('[data-test="error"]')).toContainText(
      'Username and password do not match any user in this service'
    );
  });

  test('shows error for invalid password', async ({ page }) => {
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('wrong_password');
    await page.locator('[data-test="login-button"]').click();

    // Verify error message
    await expect(page.locator('[data-test="error"]')).toContainText(
      'Username and password do not match any user in this service'
    );
  });

  test('shows error for empty username', async ({ page }) => {
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    await expect(page.locator('[data-test="error"]')).toContainText(
      'Username is required'
    );
  });

  test('shows error for empty password', async ({ page }) => {
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="login-button"]').click();

    await expect(page.locator('[data-test="error"]')).toContainText(
      'Password is required'
    );
  });

  test('shows error for locked out user', async ({ page }) => {
    await page.locator('[data-test="username"]').fill('locked_out_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    await expect(page.locator('[data-test="error"]')).toContainText(
      'Sorry, this user has been locked out'
    );
  });
});
