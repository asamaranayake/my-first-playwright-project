// tests/e2e/checkout/purchase.spec.ts
// E2E Checkout flow tests using custom fixtures

import { test, expect } from '../../../fixtures/test-fixtures';

test.describe('Checkout Flow', () => {
  // ==========================================
  // FULL CHECKOUT E2E TESTS
  // ==========================================

  test('should complete full purchase flow', async ({ 
    inventoryPage, 
    cartPage, 
    checkoutPage 
  }) => {
    // Step 1: Add products to cart
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await inventoryPage.addProductToCart('Sauce Labs Bike Light');
    
    // Verify cart badge shows 2
    expect(await inventoryPage.getCartCount()).toBe(2);

    // Step 2: Navigate to cart
    await inventoryPage.goToCart();
    
    // Verify cart contents
    expect(await cartPage.getCartItemCount()).toBe(2);
    const itemNames = await cartPage.getCartItemNames();
    expect(itemNames).toContain('Sauce Labs Backpack');
    expect(itemNames).toContain('Sauce Labs Bike Light');

    // Step 3: Proceed to checkout
    await cartPage.proceedToCheckout();

    // Step 4: Fill shipping information
    await checkoutPage.fillShippingInfo('John', 'Doe', '12345');
    await checkoutPage.continueToOverview();

    // Step 5: Verify overview
    await checkoutPage.verifyOnStepTwo();
    const totalPrice = await checkoutPage.getTotalPrice();
    expect(totalPrice).toContain('$');
    expect(totalPrice).toContain('Total');

    // Step 6: Complete checkout
    await checkoutPage.finishCheckout();

    // Step 7: Verify completion
    expect(await checkoutPage.isOrderComplete()).toBe(true);
    const message = await checkoutPage.getCompletionMessage();
    expect(message).toContain('Thank you for your order');
  });

  test('should complete checkout using helper method', async ({ 
    inventoryWithItems, 
    cartPage, 
    checkoutPage 
  }) => {
    // inventoryWithItems already has 2 items in cart
    await inventoryWithItems.goToCart();
    await cartPage.proceedToCheckout();
    
    // Use the complete checkout helper
    await checkoutPage.completeCheckout('Jane', 'Smith', '67890');
    
    // Verify success
    await checkoutPage.verifyOrderSuccess();
  });

  // ==========================================
  // CART FIXTURE TESTS
  // ==========================================

  test('should use cart with items fixture', async ({ cartWithItems }) => {
    // cartWithItems already has 2 products and is on cart page
    const itemCount = await cartWithItems.getCartItemCount();
    expect(itemCount).toBe(2);
  });

  // ==========================================
  // CHECKOUT VALIDATION TESTS
  // ==========================================

  test('should show error when first name is empty', async ({ 
    inventoryWithItems, 
    cartPage, 
    checkoutPage 
  }) => {
    await inventoryWithItems.goToCart();
    await cartPage.proceedToCheckout();
    
    // Leave first name empty
    await checkoutPage.fillShippingInfo('', 'Doe', '12345');
    await checkoutPage.continueToOverview();
    
    const error = await checkoutPage.getErrorMessage();
    expect(error).toContain('First Name is required');
  });

  test('should show error when last name is empty', async ({ 
    inventoryWithItems, 
    cartPage, 
    checkoutPage 
  }) => {
    await inventoryWithItems.goToCart();
    await cartPage.proceedToCheckout();
    
    // Leave last name empty
    await checkoutPage.fillShippingInfo('John', '', '12345');
    await checkoutPage.continueToOverview();
    
    const error = await checkoutPage.getErrorMessage();
    expect(error).toContain('Last Name is required');
  });

  test('should show error when postal code is empty', async ({ 
    inventoryWithItems, 
    cartPage, 
    checkoutPage 
  }) => {
    await inventoryWithItems.goToCart();
    await cartPage.proceedToCheckout();
    
    // Leave postal code empty
    await checkoutPage.fillShippingInfo('John', 'Doe', '');
    await checkoutPage.continueToOverview();
    
    const error = await checkoutPage.getErrorMessage();
    expect(error).toContain('Postal Code is required');
  });

  // ==========================================
  // CART MANIPULATION TESTS
  // ==========================================

  test('should remove item from cart during checkout', async ({ 
    inventoryWithItems, 
    cartPage 
  }) => {
    await inventoryWithItems.goToCart();
    
    // Verify initial count
    expect(await cartPage.getCartItemCount()).toBe(2);
    
    // Remove one item
    await cartPage.removeItem('Sauce Labs Backpack');
    
    // Verify updated count
    expect(await cartPage.getCartItemCount()).toBe(1);
    
    // Verify correct item remains
    const remainingItems = await cartPage.getCartItemNames();
    expect(remainingItems).not.toContain('Sauce Labs Backpack');
    expect(remainingItems).toContain('Sauce Labs Bike Light');
  });

  test('should continue shopping from cart', async ({ 
    inventoryWithItems, 
    cartPage,
    page 
  }) => {
    await inventoryWithItems.goToCart();
    await cartPage.continueShopping();
    
    await expect(page).toHaveURL(/inventory/);
  });

  test('should cancel checkout and return to cart', async ({ 
    inventoryWithItems, 
    cartPage, 
    checkoutPage,
    page 
  }) => {
    await inventoryWithItems.goToCart();
    await cartPage.proceedToCheckout();
    
    // Cancel checkout
    await checkoutPage.cancelCheckout();
    
    await expect(page).toHaveURL(/cart/);
  });

  // ==========================================
  // PRICE CALCULATION TESTS
  // ==========================================

  test('should calculate correct cart total', async ({ inventoryWithItems, cartPage }) => {
    await inventoryWithItems.goToCart();
    
    // Known prices: Backpack $29.99, Bike Light $9.99
    const total = await cartPage.getCartTotal();
    expect(total).toBeCloseTo(39.98, 2);
  });

  test('should display correct totals in checkout overview', async ({ 
    inventoryWithItems, 
    cartPage, 
    checkoutPage 
  }) => {
    await inventoryWithItems.goToCart();
    await cartPage.proceedToCheckout();
    
    await checkoutPage.fillShippingInfo('Test', 'User', '12345');
    await checkoutPage.continueToOverview();
    
    // Verify subtotal
    const subtotal = await checkoutPage.getItemTotal();
    expect(subtotal).toBeCloseTo(39.98, 2);
    
    // Verify tax is calculated (8% tax rate on SauceDemo)
    const tax = await checkoutPage.getTax();
    expect(tax).toBeGreaterThan(0);
    
    // Verify total includes tax
    const total = await checkoutPage.getTotalAsNumber();
    expect(total).toBeCloseTo(subtotal + tax, 2);
  });

  // ==========================================
  // EDGE CASE TESTS
  // ==========================================

  test('should handle checkout with single item', async ({ 
    inventoryPage, 
    cartPage, 
    checkoutPage 
  }) => {
    // Add only one item
    await inventoryPage.addProductToCart('Sauce Labs Onesie');
    await inventoryPage.goToCart();
    
    expect(await cartPage.getCartItemCount()).toBe(1);
    
    await cartPage.proceedToCheckout();
    await checkoutPage.completeCheckout('Single', 'Item', '11111');
    
    expect(await checkoutPage.isOrderComplete()).toBe(true);
  });

  test('should be able to go back to products after checkout', async ({ 
    inventoryWithItems, 
    cartPage, 
    checkoutPage,
    page 
  }) => {
    await inventoryWithItems.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutPage.completeCheckout('Complete', 'Test', '99999');
    
    // Go back to products
    await checkoutPage.backToProducts();
    
    await expect(page).toHaveURL(/inventory/);
  });
});
