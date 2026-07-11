// fixtures/test-fixtures.ts
// Custom test fixtures for SauceDemo application

import { test as base, expect } from '@playwright/test';
import { 
  LoginPage, 
  InventoryPage, 
  CartPage, 
  CheckoutPage 
} from '../src/pages';

// ==========================================
// FIXTURE TYPES
// ==========================================

/**
 * Type definition for custom fixtures
 */
type SauceDemoFixtures = {
  /** Login page instance */
  loginPage: LoginPage;
  
  /** Inventory page with automatic login */
  inventoryPage: InventoryPage;
  
  /** Cart page instance */
  cartPage: CartPage;
  
  /** Checkout page instance */
  checkoutPage: CheckoutPage;
  
  /** Inventory page with items already in cart */
  inventoryWithItems: InventoryPage;
  
  /** Cart page with items pre-added */
  cartWithItems: CartPage;

};

// ==========================================
// TEST CREDENTIALS
// ==========================================

const CREDENTIALS = {
  standard: {
    username: 'standard_user',
    password: 'secret_sauce',
  },
  locked: {
    username: 'locked_out_user',
    password: 'secret_sauce',
  },
  problem: {
    username: 'problem_user',
    password: 'secret_sauce',
  },
  performance: {
    username: 'performance_glitch_user',
    password: 'secret_sauce',
  },
};

// ==========================================
// CUSTOM TEST WITH FIXTURES
// ==========================================

/**
 * Extended test with custom page object fixtures
 * 
 * @example
 * // Using fixtures in tests:
 * import { test, expect } from '../fixtures/test-fixtures';
 * 
 * test('my test', async ({ inventoryPage }) => {
 *   // inventoryPage is automatically logged in and ready to use
 *   await inventoryPage.addProductToCart('Backpack');
 * });
 */
export const test = base.extend<SauceDemoFixtures>({
  // ==========================================
  // LOGIN PAGE FIXTURE
  // ==========================================
  
  /**
   * Provides a LoginPage instance
   * No automatic login - use for testing login functionality
   */
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  // ==========================================
  // INVENTORY PAGE FIXTURE
  // ==========================================
  
  /**
   * Provides an InventoryPage instance with automatic login
   * User is logged in as 'standard_user' before the test runs
   */
  inventoryPage: async ({ page }, use) => {
    // Setup: Create page objects
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    
    // Setup: Login
    await loginPage.navigate();
    await loginPage.login(CREDENTIALS.standard.username, CREDENTIALS.standard.password);
    
    // Wait for inventory page to load
    await page.waitForURL(/inventory/);
    
    // Provide fixture to test
    await use(inventoryPage);
    
    // Teardown: Optional - could logout or clean up
    // Note: Each test gets a fresh browser context, so cleanup is often unnecessary
  },

  // ==========================================
  // CART PAGE FIXTURE
  // ==========================================
  
  /**
   * Provides a CartPage instance
   * Note: Does not navigate to cart automatically
   */
  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await use(cartPage);
  },

  // ==========================================
  // CHECKOUT PAGE FIXTURE
  // ==========================================
  
  /**
   * Provides a CheckoutPage instance
   * Note: Does not navigate to checkout automatically
   */
  checkoutPage: async ({ page }, use) => {
    const checkoutPage = new CheckoutPage(page);
    await use(checkoutPage);
  },

  // ==========================================
  // INVENTORY WITH ITEMS FIXTURE
  // ==========================================
  
  /**
   * Provides an InventoryPage with 2 products already in cart
   * Useful for testing cart and checkout without adding items
   */
  inventoryWithItems: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    
    // Login
    await loginPage.navigate();
    await loginPage.login(CREDENTIALS.standard.username, CREDENTIALS.standard.password);
    await page.waitForURL(/inventory/);
    
    // Add default items to cart
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await inventoryPage.addProductToCart('Sauce Labs Bike Light');
    
    await use(inventoryPage);
  },

  // ==========================================
  // CART WITH ITEMS FIXTURE
  // ==========================================
  
  /**
   * Provides a CartPage with items already added
   * Navigates directly to the cart with 2 products
   */
  cartWithItems: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    
    // Login
    await loginPage.navigate();
    await loginPage.login(CREDENTIALS.standard.username, CREDENTIALS.standard.password);
    await page.waitForURL(/inventory/);
    
    // Add items
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await inventoryPage.addProductToCart('Sauce Labs Bike Light');
    
    // Navigate to cart
    await inventoryPage.goToCart();
    
    await use(cartPage);
  },
});

// ==========================================
// EXPORTS
// ==========================================

export { expect };
export { CREDENTIALS };
