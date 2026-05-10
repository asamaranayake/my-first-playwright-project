/**
 * Session 03: Multi-Tab and Multi-Page Handling
 * 
 * This file demonstrates handling multiple browser tabs/windows.
 * 
 * Demo Site: https://the-internet.herokuapp.com/windows
 */
import { test, expect } from '@playwright/test';

test.describe.only('Multi-Tab Handling', () => {
  test.describe.only('New Tab/Window', () => {
    test.only('handle link that opens new tab', async ({ page, context }) => {
      await page.goto('https://the-internet.herokuapp.com/windows');

      // Start waiting for new page BEFORE clicking
      const newPagePromise = context.waitForEvent('page');

      // Click link that opens new tab
      await page.getByRole('link', { name: 'Click Here' }).click();

      // Get the new page
      const newPage = await newPagePromise;

      // Wait for new page to load
      await newPage.waitForLoadState();

      // Verify content on new page
      await expect(newPage).toHaveURL(/windows\/new/);
      await expect(newPage.locator('h3')).toHaveText('New Window');

      // You can interact with both pages
      await expect(page.locator('h3')).toHaveText('Opening a new window');

      // Close new page when done
      await newPage.close();
    });

    test('switch between tabs', async ({ page, context }) => {
      await page.goto('https://the-internet.herokuapp.com/windows');

      // Open new tab
      const newPagePromise = context.waitForEvent('page');
      await page.getByRole('link', { name: 'Click Here' }).click();
      const newPage = await newPagePromise;
      await newPage.waitForLoadState();

      // List all pages
      const pages = context.pages();
      console.log('Total pages:', pages.length); // 2

      // Work on original page
      await page.bringToFront();
      await expect(page.locator('h3')).toContainText('Opening');

      // Switch to new page
      await newPage.bringToFront();
      await expect(newPage.locator('h3')).toContainText('New Window');
    });

    test('open multiple new tabs', async ({ page, context }) => {
      await page.goto('https://the-internet.herokuapp.com/');

      // Open multiple tabs by navigating
      const [page2] = await Promise.all([
        context.waitForEvent('page'),
        page.evaluate(() => window.open('https://the-internet.herokuapp.com/checkboxes'))
      ]);

      const [page3] = await Promise.all([
        context.waitForEvent('page'),
        page.evaluate(() => window.open('https://the-internet.herokuapp.com/dropdown'))
      ]);

      await page2.waitForLoadState();
      await page3.waitForLoadState();

      // Verify all pages
      await expect(page2.locator('h3')).toHaveText('Checkboxes');
      await expect(page3.locator('h3')).toHaveText('Dropdown List');

      console.log('Total pages:', context.pages().length); // 3

      // Clean up
      await page2.close();
      await page3.close();
    });
  });

  test.describe('Popup Windows', () => {
    test('handle popup window', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/windows');

      // Use popup event for windows opened via window.open()
      const popupPromise = page.waitForEvent('popup');
      await page.getByRole('link', { name: 'Click Here' }).click();
      const popup = await popupPromise;

      await popup.waitForLoadState();
      await expect(popup.locator('h3')).toHaveText('New Window');

      await popup.close();
    });
  });
});

test.describe('Multiple Browser Contexts', () => {
  test('create isolated contexts (like incognito)', async ({ browser }) => {
    // Create two isolated contexts (like two incognito windows)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Navigate both
    await page1.goto('https://the-internet.herokuapp.com/login');
    await page2.goto('https://the-internet.herokuapp.com/login');

    // Login in context1
    await page1.locator('#username').fill('tomsmith');
    await page1.locator('#password').fill('SuperSecretPassword!');
    await page1.getByRole('button', { name: 'Login' }).click();

    // Verify context1 is logged in
    await expect(page1.locator('.flash.success')).toBeVisible();

    // context2 is still on login page (isolated)
    await expect(page2.locator('#login')).toBeVisible();

    // Clean up
    await context1.close();
    await context2.close();
  });

  test('share authentication between pages in same context', async ({ browser }) => {
    const context = await browser.newContext();
    
    const page1 = await context.newPage();
    await page1.goto('https://the-internet.herokuapp.com/login');
    await page1.locator('#username').fill('tomsmith');
    await page1.locator('#password').fill('SuperSecretPassword!');
    await page1.getByRole('button', { name: 'Login' }).click();

    // Open new page in SAME context - shares cookies/auth
    const page2 = await context.newPage();
    await page2.goto('https://the-internet.herokuapp.com/secure');

    // Both pages should be authenticated
    await expect(page2.locator('.flash.success')).toBeVisible();

    await context.close();
  });
});

test.describe('Tab Navigation Patterns', () => {
  test('click link with Ctrl to open in new tab', async ({ page, context }) => {
    await page.goto('https://the-internet.herokuapp.com/');

    // Ctrl+Click opens in new tab
    const pagePromise = context.waitForEvent('page');
    await page.getByRole('link', { name: 'Checkboxes' }).click({
      modifiers: ['Control'] // or 'Meta' for Mac
    });
    
    const newPage = await pagePromise;
    await newPage.waitForLoadState();

    await expect(newPage.locator('h3')).toHaveText('Checkboxes');

    // Original page is still on home
    await expect(page.locator('h2')).toContainText('Available Examples');

    await newPage.close();
  });

  test('get page by URL or title', async ({ page, context }) => {
    await page.goto('https://the-internet.herokuapp.com/windows');

    // Open new tab
    const newPagePromise = context.waitForEvent('page');
    await page.getByRole('link', { name: 'Click Here' }).click();
    const newPage = await newPagePromise;
    await newPage.waitForLoadState();

    // Find page by URL
    const pages = context.pages();
    const targetPage = pages.find(p => p.url().includes('/new'));
    
    if (targetPage) {
      await expect(targetPage.locator('h3')).toHaveText('New Window');
    }

    await newPage.close();
  });
});

test.describe('Closing Pages', () => {
  test('close specific page', async ({ page, context }) => {
    await page.goto('https://the-internet.herokuapp.com/windows');

    const newPagePromise = context.waitForEvent('page');
    await page.getByRole('link', { name: 'Click Here' }).click();
    const newPage = await newPagePromise;

    // Close the new page
    await newPage.close();

    // Verify only original page remains
    expect(context.pages().length).toBe(1);
  });

  test('close all pages except one', async ({ page, context }) => {
    await page.goto('https://the-internet.herokuapp.com/');

    // Open multiple tabs
    await page.evaluate(() => window.open('https://the-internet.herokuapp.com/checkboxes'));
    await page.evaluate(() => window.open('https://the-internet.herokuapp.com/dropdown'));

    // Wait for pages
    await page.waitForTimeout(1000);

    // Close all except the original
    const allPages = context.pages();
    for (const p of allPages) {
      if (p !== page) {
        await p.close();
      }
    }

    expect(context.pages().length).toBe(1);
  });
});
