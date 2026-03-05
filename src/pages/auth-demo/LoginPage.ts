import { Page, Locator, expect } from '@playwright/test';

/**
 * LoginPage — Page Object for the SauceDemo login page.
 *
 * Encapsulates login form interactions and validation.
 */
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly errorButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.errorButton = page.locator('.error-button');
  }

  /** Navigate to the login page */
  async goto() {
    await this.page.goto('/');
  }

  /** Perform login with given credentials */
  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /** Verify that the error message is displayed */
  async expectError(errorText: string) {
    await expect(this.errorMessage).toContainText(errorText);
  }

  /** Dismiss the error message */
  async dismissError() {
    await this.errorButton.click();
  }
}
