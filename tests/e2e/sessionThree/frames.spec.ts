/**
 * Session 03: Frame/Iframe Handling
 * 
 * This file demonstrates how to interact with elements inside iframes.
 * 
 * Demo Site: https://the-internet.herokuapp.com/iframe
 *            https://the-internet.herokuapp.com/nested_frames
 */
import { test, expect } from '@playwright/test';

test.describe('Frame Handling', () => {

  test.describe('Basic iframe', () => {
    test('interact with elements inside an iframe', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/iframe');

      // Method 1: Using frameLocator() - Recommended
      const frame = page.frameLocator('#mce_0_ifr');
      
      // Find the editor body inside the frame
      const editor = frame.locator('#tinymce');
      
      // Clear existing content and type new text
      await editor.clear();
      await editor.fill('Hello from Playwright!');
      
      // Verify the text was entered
      await expect(editor).toContainText('Hello from Playwright!');
    });

    test('use frame toolbar buttons', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/iframe');

      // Toolbar buttons are outside the iframe (in main page)
      const boldButton = page.locator('[aria-label="Bold"]');
      
      // Frame content
      const frame = page.frameLocator('#mce_0_ifr');
      const editor = frame.locator('#tinymce');

      // Clear and type text
      await editor.clear();
      await editor.fill('Make this bold');
      
      // Select all text (Ctrl+A)
      await editor.press('Control+a');
      
      // Click bold button (outside frame)
      await boldButton.click();
      
      // Verify bold tag was applied
      await expect(frame.locator('strong, b')).toBeVisible();
    });

    test('switch between frames using contentFrame()', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/iframe');

      // Method 2: Using contentFrame() on iframe element
      const iframeElement = page.locator('#mce_0_ifr');
      const frame = await iframeElement.contentFrame();
      
      if (frame) {
        await frame.locator('#tinymce').fill('Using contentFrame method');
        await expect(frame.locator('#tinymce')).toContainText('Using contentFrame');
      }
    });
  });

  test.describe('Nested frames', () => {
    test('access nested frames', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/nested_frames');

      // Top frame contains left, middle, right frames
      const topFrame = page.frameLocator('frame[name="frame-top"]');
      
      // Access frames inside top frame
      const leftFrame = topFrame.frameLocator('frame[name="frame-left"]');
      const middleFrame = topFrame.frameLocator('frame[name="frame-middle"]');
      const rightFrame = topFrame.frameLocator('frame[name="frame-right"]');

      // Verify content in each nested frame
      await expect(leftFrame.locator('body')).toContainText('LEFT');
      await expect(middleFrame.locator('body')).toContainText('MIDDLE');
      await expect(rightFrame.locator('body')).toContainText('RIGHT');

      // Access bottom frame (not nested)
      const bottomFrame = page.frameLocator('frame[name="frame-bottom"]');
      await expect(bottomFrame.locator('body')).toContainText('BOTTOM');
    });
  });

  test.describe('Frame by different attributes', () => {
    test('locate frame by various selectors', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/iframe');

      // By ID
      const frameById = page.frameLocator('#mce_0_ifr');
      
      // By name (if available)
      // const frameByName = page.frameLocator('iframe[name="editor"]');
      
      // By src attribute
      // const frameBySrc = page.frameLocator('iframe[src*="editor"]');
      
      // By index (nth)
      const firstFrame = page.frameLocator('iframe').first();
      
      // Verify we can access the frame
      await expect(frameById.locator('#tinymce')).toBeVisible();
    });
  });

  test.describe('Waiting for frames', () => {
    test('wait for frame content to load', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/iframe');

      const frame = page.frameLocator('#mce_0_ifr');
      
      // Wait for specific element inside frame
      await expect(frame.locator('#tinymce')).toBeVisible({ timeout: 10000 });
      
      // Now interact with it
      await frame.locator('#tinymce').fill('Frame content loaded!');
    });
  });
});
