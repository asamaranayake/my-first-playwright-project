// tests/e2e/auth/login.spec.ts
// Login functionality tests using Page Object Model

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../src/pages/LoginPage';

test.describe('Login Page', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // ==========================================
  // SUCCESSFUL LOGIN TESTS new
  // ==========================================

  test('should login successfully with standard_user credentials', async ({ page }) => {
    await loginPage.login('standard_user', 'secret_sauce');
    
    // Verify redirect to inventory page
    await expect(page).toHaveURL(/inventory/);
  });

  test('should display login form on initial load', async () => {
    const isFormVisible = await loginPage.isLoginFormVisible();
    expect(isFormVisible).toBe(true);
  });

  // ==========================================
  // ERROR HANDLING TESTS
  // ==========================================

  test('should show error for invalid credentials', async () => {
    await loginPage.login('invalid_user', 'wrong_password');
    
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toContain('Username and password do not match');
  });

  test('should show error for locked out user', async () => {
    await loginPage.login('locked_out_user', 'secret_sauce');
    
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toContain('Sorry, this user has been locked out');
  });

  test('should show error when username is empty', async () => {
    await loginPage.login('', 'secret_sauce');
    
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toContain('Username is required');
  });

  test('should show error when password is empty', async () => {
    await loginPage.login('standard_user', '');
    
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toContain('Password is required');
  });

  test('should show error when both fields are empty', async () => {
    await loginPage.clickLogin();
    
    const isErrorVisible = await loginPage.isErrorVisible();
    expect(isErrorVisible).toBe(true);
    
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toContain('Username is required');
  });

  // ==========================================
  // FORM INTERACTION TESTS
  // ==========================================

  test('should clear form fields', async () => {
    await loginPage.enterUsername('test_user');
    await loginPage.enterPassword('test_password');
    
    await loginPage.clearForm();
    
    // Verify fields are empty (by trying to login with empty fields)
    await loginPage.clickLogin();
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toContain('Username is required');
  });

  test('should be able to dismiss error message', async () => {
    await loginPage.login('invalid', 'invalid');
    
    // Error should be visible
    expect(await loginPage.isErrorVisible()).toBe(true);
    
    // Dismiss error
    await loginPage.dismissError();
    
    // Error should no longer be visible
    expect(await loginPage.isErrorVisible()).toBe(false);
  });
});
