// src/pages/BasePage.ts
// Base Page Class - Contains common methods shared across all page objects

import { type Page, type Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ==========================================
  // NAVIGATION METHODS
  // ==========================================

  /**
   * Navigate to a specific path
   * @param path - The URL path to navigate to (e.g., '/inventory.html')
   */
  async navigate(path: string): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Get the current page URL
   * @returns The current URL as a string
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Get the page title
   * @returns The page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Go back to the previous page
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
  }

  /**
   * Refresh the current page
   */
  async refreshPage(): Promise<void> {
    await this.page.reload();
  }

  // ==========================================
  // WAIT METHODS
  // ==========================================

  /**
   * Wait for the page to fully load (network idle)
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for DOM content to be loaded
   */
  async waitForDomLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Wait for a specific URL pattern
   * @param urlPattern - URL or pattern to wait for
   */
  async waitForUrl(urlPattern: string | RegExp): Promise<void> {
    await this.page.waitForURL(urlPattern);
  }

  // ==========================================
  // VERIFICATION METHODS
  // ==========================================

  /**
   * Verify the page URL matches expected
   * @param expectedUrl - Expected URL or pattern
   */
  async verifyUrl(expectedUrl: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(expectedUrl);
  }

  /**
   * Verify the page title matches expected
   * @param expectedTitle - Expected title or pattern
   */
  async verifyTitle(expectedTitle: string | RegExp): Promise<void> {
    await expect(this.page).toHaveTitle(expectedTitle);
  }

  // ==========================================
  // ELEMENT HELPER METHODS
  // ==========================================

  /**
   * Check if an element is visible
   * @param locator - The element locator
   * @returns true if visible, false otherwise
   */
  async isElementVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  /**
   * Wait for element to be visible and then click
   * @param locator - The element to click
   */
  async waitAndClick(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  /**
   * Wait for element and type text
   * @param locator - The input element
   * @param text - Text to type
   */
  async waitAndFill(locator: Locator, text: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.fill(text);
  }

  async clearText(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.clear();
  }

  /**
   * Get text content from an element
   * @param locator - The element locator
   * @returns The text content
   */
  async getText(locator: Locator): Promise<string | null> {
    return await locator.textContent();
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Take a screenshot with a given name
   * @param name - Screenshot file name (without extension)
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ 
      path: `screenshots/${name}.png`,
      fullPage: true 
    });
  }

  /**
   * Scroll to the bottom of the page
   */
  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  /**
   * Scroll to the top of the page
   */
  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  /**
   * Scroll element into view
   * @param locator - The element to scroll into view
   */
  async scrollIntoView(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }
}
