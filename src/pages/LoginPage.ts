// src/pages/LoginPage.ts
// Login Page Object - Encapsulates all login page interactions

import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { InventoryPage } from './InventoryPage';



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

  // ==========================================
  // CONSTRUCTOR
  // constructor initializes locators and inherits from BasePage
  // ==========================================
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
  // async goto(): Promise<void> {
  //   await this.navigate('https://www.saucedemo.com/');
  // }

  async navigate(path: string = 'https://www.saucedemo.com/'): Promise<void> {
    await super.navigate(path);
  }
  // ==========================================
  // ACTIONS
  // ==========================================

  /**
   * Login with provided credentials
   * @param username - The username to enter
   * @param password - The password to enter
   */
  async login(username: string, password: string): Promise<InventoryPage> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
    return new InventoryPage(this.page);
  }

  /**
   * Enter username only
   * @param username - The username to enter
   */
  async enterUsername(username: string): Promise<void> {
    await super.waitAndFill(this.usernameInput, username);

  }

  /**
   * Enter password only
   * @param password - The password to enter
   */
  async enterPassword(password: string): Promise<void> {
    await super.waitAndFill(this.passwordInput, password);
  }

  /**
   * Click the login button
   */
  async clickLogin(): Promise<void> {
    await super.waitAndClick(this.loginButton);
  }

  /**
   * Clear the login form
   */
  async clearForm(): Promise<void> {
    await super.clearText(this.usernameInput);
    await super.clearText(this.passwordInput);
  }

  /**
   * Dismiss the error message
   */
  async dismissError(): Promise<void> {
    if (await this.errorButton.isVisible()) {
      await super.waitAndClick(this.errorButton);
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
