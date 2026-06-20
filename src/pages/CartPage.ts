// src/pages/CartPage.ts
// Shopping Cart Page Object - Encapsulates cart interactions

import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  // ==========================================
  // LOCATORS
  // ==========================================
  
  /** Page title */
  readonly pageTitle: Locator;
  
  /** Cart list container */
  readonly cartList: Locator;
  
  /** Individual cart items */
  readonly cartItems: Locator;
  
  /** Checkout button */
  readonly checkoutButton: Locator;
  
  /** Continue Shopping button */
  readonly continueShoppingButton: Locator;
  
  /** Quantity labels */
  readonly quantityLabels: Locator;

  constructor(page: Page) {
    super(page);
    
    this.pageTitle = page.locator('.title');
    this.cartList = page.locator('.cart_list');
    this.cartItems = page.locator('.cart_item');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.quantityLabels = page.locator('.cart_quantity');
  }

  // ==========================================
  // NAVIGATION
  // ==========================================

  /**
   * Navigate directly to the cart page
   * Note: User must be logged in for this to work
   */
  async goto(): Promise<void> {
    await this.navigate('/cart.html');
  }

  // ==========================================
  // CART INFO
  // ==========================================

  /**
   * Get the number of items in the cart
   * @returns Number of cart items
   */
  async getCartItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  /**
   * Get all item names in the cart
   * @returns Array of item names
   */
  async getCartItemNames(): Promise<string[]> {
    return await this.cartItems
      .locator('.inventory_item_name')
      .allTextContents();
  }

  /**
   * Get all item prices in the cart
   * @returns Array of prices as numbers
   */
  async getCartItemPrices(): Promise<number[]> {
    const priceTexts = await this.cartItems
      .locator('.inventory_item_price')
      .allTextContents();
    
    return priceTexts.map(price => 
      parseFloat(price.replace('$', ''))
    );
  }

  /**
   * Get the total price of all items in cart
   * @returns Sum of all item prices
   */
  async getCartTotal(): Promise<number> {
    const prices = await this.getCartItemPrices();
    return prices.reduce((sum, price) => sum + price, 0);
  }

  /**
   * Get details for a specific item in the cart
   * @param itemName - The item name to get details for
   * @returns Object with item details
   */
  async getCartItemDetails(itemName: string): Promise<{
    name: string | null;
    description: string | null;
    price: number;
    quantity: number;
  }> {
    const item = this.cartItems.filter({ hasText: itemName });
    
    const name = await item.locator('.inventory_item_name').textContent();
    const description = await item.locator('.inventory_item_desc').textContent();
    const priceText = await item.locator('.inventory_item_price').textContent();
    const price = parseFloat(priceText?.replace('$', '') || '0');
    const quantityText = await item.locator('.cart_quantity').textContent();
    const quantity = parseInt(quantityText || '0');

    return { name, description, price, quantity };
  }

  /**
   * Check if a specific item is in the cart
   * @param itemName - The item name to check
   * @returns true if item is in cart
   */
  async isItemInCart(itemName: string): Promise<boolean> {
    const item = this.cartItems.filter({ hasText: itemName });
    return await item.isVisible();
  }

  // ==========================================
  // CART ACTIONS
  // ==========================================

  /**
   * Remove a specific item from the cart
   * @param itemName - The item name to remove
   */
  async removeItem(itemName: string): Promise<void> {
    const item = this.cartItems.filter({ hasText: itemName });
    await item.locator('button', { hasText: 'Remove' }).click();
  }

  /**
   * Remove all items from the cart
   */
  async removeAllItems(): Promise<void> {
    const count = await this.getCartItemCount();
    
    for (let i = 0; i < count; i++) {
      // Always remove the first item (list shrinks after each removal)
      await this.cartItems.first().locator('button', { hasText: 'Remove' }).click();
    }
  }

  /**
   * Click on an item name to view its details
   * @param itemName - The item name to click
   */
  async clickItemName(itemName: string): Promise<void> {
    const item = this.cartItems.filter({ hasText: itemName });
    await item.locator('.inventory_item_name').click();
  }

  // ==========================================
  // CHECKOUT FLOW
  // ==========================================

  /**
   * Proceed to checkout
   */
  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  /**
   * Continue shopping (go back to inventory)
   */
  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  // ==========================================
  // VERIFICATION
  // ==========================================

  /**
   * Verify the cart page title
   */
  async verifyPageTitle(): Promise<void> {
    await expect(this.pageTitle).toHaveText('Your Cart');
  }

  /**
   * Verify the cart is empty
   */
  async verifyCartIsEmpty(): Promise<void> {
    const count = await this.getCartItemCount();
    expect(count).toBe(0);
  }

  /**
   * Verify a specific item is in the cart
   * @param itemName - The item name to verify
   */
  async verifyItemInCart(itemName: string): Promise<void> {
    const item = this.cartItems.filter({ hasText: itemName });
    await expect(item).toBeVisible();
  }

  /**
   * Verify the number of items in cart
   * @param expectedCount - Expected number of items
   */
  async verifyItemCount(expectedCount: number): Promise<void> {
    const count = await this.getCartItemCount();
    expect(count).toBe(expectedCount);
  }
}
