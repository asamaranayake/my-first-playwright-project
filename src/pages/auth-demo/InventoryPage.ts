import { Page, Locator, expect } from '@playwright/test';

/**
 * InventoryPage — Page Object for the SauceDemo Products/Inventory page.
 *
 * Provides methods for browsing products, adding/removing cart items,
 * sorting, and navigating to other pages.
 */
export class InventoryPage {
  readonly page: Page;
  readonly title: Locator;
  readonly inventoryItems: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly sortDropdown: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('.title');
    this.inventoryItems = page.locator('.inventory_item');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartLink = page.locator('.shopping_cart_link');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
  }

  /** Navigate to the inventory page */
  async goto() {
    await this.page.goto('/inventory.html');
  }

  /** Verify the page has loaded correctly */
  async expectLoaded() {
    await expect(this.title).toHaveText('Products');
  }

  /** Add an item to the cart by its data-test attribute name */
  async addToCart(itemTestId: string) {
    await this.page.locator(`[data-test="add-to-cart-${itemTestId}"]`).click();
  }

  /** Remove an item from the cart by its data-test attribute name */
  async removeFromCart(itemTestId: string) {
    await this.page.locator(`[data-test="remove-${itemTestId}"]`).click();
  }

  /** Get the current cart count (returns 0 if badge not visible) */
  async getCartCount(): Promise<number> {
    if (await this.cartBadge.isVisible()) {
      return parseInt(await this.cartBadge.textContent() ?? '0');
    }
    return 0;
  }

  /** Sort items by a given option value */
  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo') {
    await this.sortDropdown.selectOption(option);
  }

  /** Get all item names from the inventory list */
  async getItemNames(): Promise<string[]> {
    const items = this.page.locator('.inventory_item_name');
    return items.allTextContents();
  }

  /** Get all item prices from the inventory list */
  async getItemPrices(): Promise<number[]> {
    const prices = this.page.locator('.inventory_item_price');
    const texts = await prices.allTextContents();
    return texts.map((text) => parseFloat(text.replace('$', '')));
  }

  /** Open the sidebar menu */
  async openMenu() {
    await this.menuButton.click();
  }

  /** Logout from the application */
  async logout() {
    await this.openMenu();
    await this.logoutLink.click();
  }
}
