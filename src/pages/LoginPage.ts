// src/pages/LoginPage.ts
// Login Page Object - Encapsulates all login page interactions

import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // ==========================================
  // LOCATORS
  // ==========================================
  
  /** Username input field */
  readonly usernameInput: Locator;
  
  /** Password input field */
  readonly passwordInput: Locator;
  
  /** Login button */
  readonly loginButton: Locator;
  
  /** Error message container */
  readonly errorMessage: Locator;
  
  /** Error close button */
  readonly errorButton: Locator;
  
  /** Login logo */
  readonly loginLogo: Locator;
  
  /** Accepted usernames list */
  readonly acceptedUsernames: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators using data-test attributes (best practice)
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.errorButton = page.locator('[data-test="error-button"]');
    this.loginLogo = page.locator('.login_logo');
    this.acceptedUsernames = page.locator('#login_credentials');
  }

  // ==========================================
  // NAVIGATION
  // ==========================================

  /**
   * Navigate to the login page
   */
  async goto(): Promise<void> {
    await this.navigate('/');
  }

  // ==========================================
  // ACTIONS
  // ==========================================

  /**
   * Login with provided credentials
   * @param username - The username to enter
   * @param password - The password to enter
   */
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Enter username only
   * @param username - The username to enter
   */
  async enterUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  /**
   * Enter password only
   * @param password - The password to enter
   */
  async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /**
   * Click the login button
   */
  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  /**
   * Clear the login form
   */
  async clearForm(): Promise<void> {
    await this.usernameInput.clear();
    await this.passwordInput.clear();
  }

  /**
   * Dismiss the error message
   */
  async dismissError(): Promise<void> {
    if (await this.errorButton.isVisible()) {
      await this.errorButton.click();
    }
  }

  // ==========================================
  // GETTERS
  // ==========================================

  /**
   * Get the error message text
   * @returns The error message or null if not visible
   */
  async getErrorMessage(): Promise<string | null> {
    return await this.errorMessage.textContent();
  }

  /**
   * Check if error message is visible
   * @returns true if error is visible
   */
  async isErrorVisible(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  /**
   * Check if login form is displayed
   * @returns true if login form is visible
   */
  async isLoginFormVisible(): Promise<boolean> {
    return await this.loginButton.isVisible();
  }

  /**
   * Get the list of accepted usernames displayed on the page
   * @returns Array of usernames
   */
  async getAcceptedUsernames(): Promise<string[]> {
    const text = await this.acceptedUsernames.textContent();
    if (!text) return [];
    
    // Parse the usernames from the text
    return text
      .replace('Accepted usernames are:', '')
      .split('\n')
      .map(u => u.trim())
      .filter(u => u.length > 0);
  }
}
