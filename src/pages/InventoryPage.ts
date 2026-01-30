// src/pages/InventoryPage.ts
// Inventory/Products Page Object - Encapsulates product listing interactions

import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

// Sort options type for better type safety
export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage extends BasePage {
  // ==========================================
  // LOCATORS
  // ==========================================
  
  /** Page title */
  readonly pageTitle: Locator;
  
  /** Product list container */
  readonly productList: Locator;
  
  /** Individual product items */
  readonly productItems: Locator;
  
  /** Sort dropdown */
  readonly sortDropdown: Locator;
  
  /** Shopping cart badge (shows item count) */
  readonly cartBadge: Locator;
  
  /** Shopping cart link */
  readonly cartLink: Locator;
  
  /** Hamburger menu button */
  readonly menuButton: Locator;
  
  /** Menu container */
  readonly menuContainer: Locator;
  
  /** Logout link in menu */
  readonly logoutLink: Locator;
  
  /** All Items link in menu */
  readonly allItemsLink: Locator;
  
  /** About link in menu */
  readonly aboutLink: Locator;
  
  /** Reset App State link in menu */
  readonly resetLink: Locator;
  
  /** Close menu button */
  readonly closeMenuButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Page elements
    this.pageTitle = page.locator('.title');
    this.productList = page.locator('.inventory_list');
    this.productItems = page.locator('.inventory_item');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    
    // Cart elements
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartLink = page.locator('.shopping_cart_link');
    
    // Menu elements
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.menuContainer = page.locator('.bm-menu');
    this.logoutLink = page.locator('#logout_sidebar_link');
    this.allItemsLink = page.locator('#inventory_sidebar_link');
    this.aboutLink = page.locator('#about_sidebar_link');
    this.resetLink = page.locator('#reset_sidebar_link');
    this.closeMenuButton = page.locator('#react-burger-cross-btn');
  }

  // ==========================================
  // NAVIGATION
  // ==========================================

  /**
   * Navigate directly to the inventory page
   * Note: User must be logged in for this to work
   */
  async goto(): Promise<void> {
    await this.navigate('/inventory.html');
  }

  // ==========================================
  // PRODUCT ACTIONS
  // ==========================================

  /**
   * Get the count of products displayed
   * @returns Number of products
   */
  async getProductCount(): Promise<number> {
    return await this.productItems.count();
  }

  /**
   * Get all product names
   * @returns Array of product names
   */
  async getProductNames(): Promise<string[]> {
    return await this.productItems
      .locator('.inventory_item_name')
      .allTextContents();
  }

  /**
   * Get all product descriptions
   * @returns Array of product descriptions
   */
  async getProductDescriptions(): Promise<string[]> {
    return await this.productItems
      .locator('.inventory_item_desc')
      .allTextContents();
  }

  /**
   * Get all product prices as numbers
   * @returns Array of prices (e.g., [29.99, 9.99, 15.99])
   */
  async getProductPrices(): Promise<number[]> {
    const priceTexts = await this.productItems
      .locator('.inventory_item_price')
      .allTextContents();
    
    return priceTexts.map(price => 
      parseFloat(price.replace('$', ''))
    );
  }

  /**
   * Add a specific product to the cart by name
   * @param productName - The exact product name
   */
  async addProductToCart(productName: string): Promise<void> {
    const product = this.productItems.filter({ hasText: productName });
    await product.locator('button', { hasText: 'Add to cart' }).click();
  }

  /**
   * Remove a specific product from the cart by name
   * @param productName - The exact product name
   */
  async removeProductFromCart(productName: string): Promise<void> {
    const product = this.productItems.filter({ hasText: productName });
    await product.locator('button', { hasText: 'Remove' }).click();
  }

  /**
   * Click on a product name to view details
   * @param productName - The exact product name
   */
  async clickProduct(productName: string): Promise<void> {
    const product = this.productItems.filter({ hasText: productName });
    await product.locator('.inventory_item_name').click();
  }

  /**
   * Check if a product has "Add to cart" button (not in cart)
   * @param productName - The exact product name
   * @returns true if product can be added
   */
  async canAddProductToCart(productName: string): Promise<boolean> {
    const product = this.productItems.filter({ hasText: productName });
    const addButton = product.locator('button', { hasText: 'Add to cart' });
    return await addButton.isVisible();
  }

  /**
   * Get product details by name
   * @param productName - The exact product name
   * @returns Object with product details
   */
  async getProductDetails(productName: string): Promise<{
    name: string | null;
    description: string | null;
    price: number;
  }> {
    const product = this.productItems.filter({ hasText: productName });
    
    const name = await product.locator('.inventory_item_name').textContent();
    const description = await product.locator('.inventory_item_desc').textContent();
    const priceText = await product.locator('.inventory_item_price').textContent();
    const price = parseFloat(priceText?.replace('$', '') || '0');

    return { name, description, price };
  }

  // ==========================================
  // SORTING
  // ==========================================

  /**
   * Sort products by the given option
   * @param option - Sort option: 'az', 'za', 'lohi', 'hilo'
   */
  async sortProducts(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  /**
   * Get the current sort selection
   * @returns The currently selected sort option
   */
  async getCurrentSort(): Promise<string> {
    return await this.sortDropdown.inputValue();
  }

  /**
   * Verify products are sorted by name A-Z
   */
  async verifyProductsSortedAZ(): Promise<void> {
    const names = await this.getProductNames();
    const sortedNames = [...names].sort();
    expect(names).toEqual(sortedNames);
  }

  /**
   * Verify products are sorted by name Z-A
   */
  async verifyProductsSortedZA(): Promise<void> {
    const names = await this.getProductNames();
    const sortedNames = [...names].sort().reverse();
    expect(names).toEqual(sortedNames);
  }

  /**
   * Verify products are sorted by price low to high
   */
  async verifyProductsSortedPriceLowHigh(): Promise<void> {
    const prices = await this.getProductPrices();
    const sortedPrices = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sortedPrices);
  }

  /**
   * Verify products are sorted by price high to low
   */
  async verifyProductsSortedPriceHighLow(): Promise<void> {
    const prices = await this.getProductPrices();
    const sortedPrices = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sortedPrices);
  }

  // ==========================================
  // CART
  // ==========================================

  /**
   * Get the number of items in the cart
   * @returns Number of items (0 if badge not visible)
   */
  async getCartCount(): Promise<number> {
    const isVisible = await this.cartBadge.isVisible();
    if (!isVisible) return 0;
    
    const text = await this.cartBadge.textContent();
    return text ? parseInt(text) : 0;
  }

  /**
   * Navigate to the shopping cart
   */
  async goToCart(): Promise<void> {
    await this.cartLink.click();
  }

  // ==========================================
  // MENU
  // ==========================================

  /**
   * Open the hamburger menu
   */
  async openMenu(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.waitFor({ state: 'visible' });
  }

  /**
   * Close the hamburger menu
   */
  async closeMenu(): Promise<void> {
    await this.closeMenuButton.click();
    await this.menuContainer.waitFor({ state: 'hidden' });
  }

  /**
   * Logout from the application
   */
  async logout(): Promise<void> {
    await this.openMenu();
    await this.logoutLink.click();
  }

  /**
   * Reset application state (clears cart, etc.)
   */
  async resetAppState(): Promise<void> {
    await this.openMenu();
    await this.resetLink.click();
    await this.closeMenu();
  }

  // ==========================================
  // VERIFICATION
  // ==========================================

  /**
   * Verify the page title text
   * @param expectedTitle - Expected title text
   */
  async verifyPageTitle(expectedTitle: string): Promise<void> {
    await expect(this.pageTitle).toHaveText(expectedTitle);
  }

  /**
   * Verify a product is displayed
   * @param productName - The product name to check
   */
  async verifyProductDisplayed(productName: string): Promise<void> {
    const product = this.productItems.filter({ hasText: productName });
    await expect(product).toBeVisible();
  }
}
