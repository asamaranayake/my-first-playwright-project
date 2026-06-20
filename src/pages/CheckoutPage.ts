// src/pages/CheckoutPage.ts
// Checkout Page Object - Encapsulates multi-step checkout flow

import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export class CheckoutPage extends BasePage {
  // ==========================================
  // STEP 1: CUSTOMER INFORMATION LOCATORS
  // ==========================================
  
  /** First name input field */
  readonly firstNameInput: Locator;
  
  /** Last name input field */
  readonly lastNameInput: Locator;
  
  /** Postal code input field */
  readonly postalCodeInput: Locator;
  
  /** Continue button (step 1) */
  readonly continueButton: Locator;
  
  /** Cancel button */
  readonly cancelButton: Locator;
  
  /** Error message container */
  readonly errorMessage: Locator;
  
  /** Error close button */
  readonly errorButton: Locator;

  // ==========================================
  // STEP 2: OVERVIEW LOCATORS
  // ==========================================
  
  /** Summary section */
  readonly summarySection: Locator;
  
  /** Cart items in summary */
  readonly summaryItems: Locator;
  
  /** Item total (subtotal before tax) */
  readonly itemTotal: Locator;
  
  /** Tax amount */
  readonly taxAmount: Locator;
  
  /** Total amount (including tax) */
  readonly totalAmount: Locator;
  
  /** Payment info label */
  readonly paymentInfo: Locator;
  
  /** Shipping info label */
  readonly shippingInfo: Locator;
  
  /** Finish button (step 2) */
  readonly finishButton: Locator;

  // ==========================================
  // STEP 3: COMPLETE LOCATORS
  // ==========================================
  
  /** Completion header */
  readonly completeHeader: Locator;
  
  /** Completion message */
  readonly completeText: Locator;
  
  /** Pony Express image */
  readonly ponyExpressImage: Locator;
  
  /** Back to products button */
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Step 1: Customer Information
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.errorButton = page.locator('[data-test="error-button"]');

    // Step 2: Overview
    this.summarySection = page.locator('.summary_info');
    this.summaryItems = page.locator('.cart_item');
    this.itemTotal = page.locator('.summary_subtotal_label');
    this.taxAmount = page.locator('.summary_tax_label');
    this.totalAmount = page.locator('.summary_total_label');
    this.paymentInfo = page.locator('[data-test="payment-info-value"]');
    this.shippingInfo = page.locator('[data-test="shipping-info-value"]');
    this.finishButton = page.locator('[data-test="finish"]');

    // Step 3: Complete
    this.completeHeader = page.locator('.complete-header');
    this.completeText = page.locator('.complete-text');
    this.ponyExpressImage = page.locator('.pony_express');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
  }

  // ==========================================
  // STEP 1: CUSTOMER INFORMATION
  // ==========================================

  /**
   * Navigate to checkout step 1
   */
  async gotoStepOne(): Promise<void> {
    await this.navigate('/checkout-step-one.html');
  }

  /**
   * Fill the shipping information form
   * @param firstName - Customer's first name
   * @param lastName - Customer's last name
   * @param postalCode - Shipping postal code
   */
  async fillShippingInfo(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  /**
   * Fill shipping info using object
   * @param info - ShippingInfo object
   */
  async fillShippingInfoObject(info: ShippingInfo): Promise<void> {
    await this.fillShippingInfo(info.firstName, info.lastName, info.postalCode);
  }

  /**
   * Click continue to proceed to overview
   */
  async continueToOverview(): Promise<void> {
    await this.continueButton.click();
  }

  /**
   * Get the error message text
   * @returns Error message or null
   */
  async getErrorMessage(): Promise<string | null> {
    return await this.errorMessage.textContent();
  }

  /**
   * Check if error is displayed
   * @returns true if error visible
   */
  async isErrorVisible(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  /**
   * Dismiss the error message
   */
  async dismissError(): Promise<void> {
    if (await this.isErrorVisible()) {
      await this.errorButton.click();
    }
  }

  /**
   * Clear all form fields
   */
  async clearForm(): Promise<void> {
    await this.firstNameInput.clear();
    await this.lastNameInput.clear();
    await this.postalCodeInput.clear();
  }

  /**
   * Cancel checkout (go back)
   */
  async cancelCheckout(): Promise<void> {
    await this.cancelButton.click();
  }

  // ==========================================
  // STEP 2: OVERVIEW
  // ==========================================

  /**
   * Navigate to checkout step 2 (overview)
   */
  async gotoStepTwo(): Promise<void> {
    await this.navigate('/checkout-step-two.html');
  }

  /**
   * Get the item subtotal (before tax)
   * @returns Subtotal as number
   */
  async getItemTotal(): Promise<number> {
    const text = await this.itemTotal.textContent();
    const match = text?.match(/\$([0-9.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Get the tax amount
   * @returns Tax as number
   */
  async getTax(): Promise<number> {
    const text = await this.taxAmount.textContent();
    const match = text?.match(/\$([0-9.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Get the total price including tax
   * @returns Total as string (includes label)
   */
  async getTotalPrice(): Promise<string | null> {
    return await this.totalAmount.textContent();
  }

  /**
   * Get the total as a number
   * @returns Total as number
   */
  async getTotalAsNumber(): Promise<number> {
    const text = await this.totalAmount.textContent();
    const match = text?.match(/\$([0-9.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Get payment information
   * @returns Payment info text
   */
  async getPaymentInfo(): Promise<string | null> {
    return await this.paymentInfo.textContent();
  }

  /**
   * Get shipping information
   * @returns Shipping info text
   */
  async getShippingInfo(): Promise<string | null> {
    return await this.shippingInfo.textContent();
  }

  /**
   * Get the number of items in checkout
   * @returns Number of items
   */
  async getItemCount(): Promise<number> {
    return await this.summaryItems.count();
  }

  /**
   * Click finish to complete checkout
   */
  async finishCheckout(): Promise<void> {
    await this.finishButton.click();
  }

  // ==========================================
  // STEP 3: COMPLETE
  // ==========================================

  /**
   * Navigate to checkout complete page
   */
  async gotoComplete(): Promise<void> {
    await this.navigate('/checkout-complete.html');
  }

  /**
   * Check if order is complete
   * @returns true if completion header visible
   */
  async isOrderComplete(): Promise<boolean> {
    return await this.completeHeader.isVisible();
  }

  /**
   * Get the completion header text
   * @returns Header text (e.g., "Thank you for your order!")
   */
  async getCompletionMessage(): Promise<string | null> {
    return await this.completeHeader.textContent();
  }

  /**
   * Get the completion description text
   * @returns Description text
   */
  async getCompletionDescription(): Promise<string | null> {
    return await this.completeText.textContent();
  }

  /**
   * Click back to products
   */
  async backToProducts(): Promise<void> {
    await this.backHomeButton.click();
  }

  // ==========================================
  // COMPLETE CHECKOUT FLOW
  // ==========================================

  /**
   * Complete the entire checkout process
   * @param firstName - Customer's first name
   * @param lastName - Customer's last name
   * @param postalCode - Shipping postal code
   */
  async completeCheckout(firstName: string, lastName: string, postalCode: string): Promise<void> {
    // Step 1: Fill information
    await this.fillShippingInfo(firstName, lastName, postalCode);
    await this.continueToOverview();
    
    // Step 2: Finish
    await this.finishButton.waitFor({ state: 'visible' });
    await this.finishCheckout();
  }

  /**
   * Complete checkout with ShippingInfo object
   * @param info - Shipping information
   */
  async completeCheckoutWithInfo(info: ShippingInfo): Promise<void> {
    await this.completeCheckout(info.firstName, info.lastName, info.postalCode);
  }

  // ==========================================
  // VERIFICATION
  // ==========================================

  /**
   * Verify checkout step 1 is displayed
   */
  async verifyOnStepOne(): Promise<void> {
    await expect(this.firstNameInput).toBeVisible();
    await this.verifyUrl(/checkout-step-one/);
  }

  /**
   * Verify checkout step 2 is displayed
   */
  async verifyOnStepTwo(): Promise<void> {
    await expect(this.finishButton).toBeVisible();
    await this.verifyUrl(/checkout-step-two/);
  }

  /**
   * Verify checkout complete is displayed
   */
  async verifyOnComplete(): Promise<void> {
    await expect(this.completeHeader).toBeVisible();
    await this.verifyUrl(/checkout-complete/);
  }

  /**
   * Verify order completion success
   */
  async verifyOrderSuccess(): Promise<void> {
    await expect(this.completeHeader).toContainText('Thank you');
    await expect(this.ponyExpressImage).toBeVisible();
  }
}
