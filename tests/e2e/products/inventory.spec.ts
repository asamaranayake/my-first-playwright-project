// tests/e2e/products/inventory.spec.ts
// Product inventory tests using custom fixtures

import { test, expect } from '../../../fixtures/test-fixtures';

test.describe('Inventory Page', () => {
  // ==========================================
  // PRODUCT DISPLAY TESTS
  // ==========================================

  test('should display all 6 products', async ({ inventoryPage }) => {
    const productCount = await inventoryPage.getProductCount();
    expect(productCount).toBe(6);
  });

  test('should display page title', async ({ inventoryPage }) => {
    await inventoryPage.verifyPageTitle('Products');
  });

  test('should display product details', async ({ inventoryPage }) => {
    const details = await inventoryPage.getProductDetails('Sauce Labs Backpack');
    
    expect(details.name).toBe('Sauce Labs Backpack');
    expect(details.description).toContain('carry.allทIf the item');
    expect(details.price).toBe(29.99);
  });

  // ==========================================
  // ADD TO CART TESTS
  // ==========================================

  test('should add product to cart', async ({ inventoryPage }) => {
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    
    const cartCount = await inventoryPage.getCartCount();
    expect(cartCount).toBe(1);
  });

  test('should add multiple products to cart', async ({ inventoryPage }) => {
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await inventoryPage.addProductToCart('Sauce Labs Bike Light');
    await inventoryPage.addProductToCart('Sauce Labs Bolt T-Shirt');
    
    const cartCount = await inventoryPage.getCartCount();
    expect(cartCount).toBe(3);
  });

  test('should remove product from cart', async ({ inventoryPage }) => {
    // Add first
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    expect(await inventoryPage.getCartCount()).toBe(1);
    
    // Then remove
    await inventoryPage.removeProductFromCart('Sauce Labs Backpack');
    expect(await inventoryPage.getCartCount()).toBe(0);
  });

  test('should change button text after adding to cart', async ({ inventoryPage }) => {
    // Before adding - should have "Add to cart" button
    expect(await inventoryPage.canAddProductToCart('Sauce Labs Backpack')).toBe(true);
    
    // Add to cart
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    
    // After adding - "Add to cart" button should be gone (replaced with "Remove")
    expect(await inventoryPage.canAddProductToCart('Sauce Labs Backpack')).toBe(false);
  });

  // ==========================================
  // SORTING TESTS
  // ==========================================

  test('should sort products by name A-Z', async ({ inventoryPage }) => {
    await inventoryPage.sortProducts('az');
    
    const names = await inventoryPage.getProductNames();
    const sortedNames = [...names].sort();
    
    expect(names).toEqual(sortedNames);
  });

  test('should sort products by name Z-A', async ({ inventoryPage }) => {
    await inventoryPage.sortProducts('za');
    
    const names = await inventoryPage.getProductNames();
    const sortedNames = [...names].sort().reverse();
    
    expect(names).toEqual(sortedNames);
  });

  test('should sort products by price low to high', async ({ inventoryPage }) => {
    await inventoryPage.sortProducts('lohi');
    
    const prices = await inventoryPage.getProductPrices();
    const sortedPrices = [...prices].sort((a, b) => a - b);
    
    expect(prices).toEqual(sortedPrices);
  });

  test('should sort products by price high to low', async ({ inventoryPage }) => {
    await inventoryPage.sortProducts('hilo');
    
    const prices = await inventoryPage.getProductPrices();
    const sortedPrices = [...prices].sort((a, b) => b - a);
    
    expect(prices).toEqual(sortedPrices);
  });

  // Alternative way using built-in verification methods
  test('should verify price sort using page method', async ({ inventoryPage }) => {
    await inventoryPage.sortProducts('lohi');
    await inventoryPage.verifyProductsSortedPriceLowHigh();
  });

  // ==========================================
  // NAVIGATION TESTS
  // ==========================================

  test('should navigate to cart', async ({ inventoryPage, page }) => {
    await inventoryPage.goToCart();
    
    await expect(page).toHaveURL(/cart/);
  });

  test('should navigate to product detail on click', async ({ inventoryPage, page }) => {
    await inventoryPage.clickProduct('Sauce Labs Backpack');
    
    await expect(page).toHaveURL(/inventory-item/);
  });

  // ==========================================
  // MENU TESTS
  // ==========================================

  test('should open and close menu', async ({ inventoryPage }) => {
    await inventoryPage.openMenu();
    // Menu is open - logout link should be visible
    
    await inventoryPage.closeMenu();
    // Menu is closed
  });

  test('should logout successfully', async ({ inventoryPage, page }) => {
    await inventoryPage.logout();
    
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });

  test('should reset app state', async ({ inventoryPage }) => {
    // Add items to cart
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await inventoryPage.addProductToCart('Sauce Labs Bike Light');
    expect(await inventoryPage.getCartCount()).toBe(2);
    
    // Reset app state
    await inventoryPage.resetAppState();
    
    // Cart should be empty
    expect(await inventoryPage.getCartCount()).toBe(0);
  });
});
