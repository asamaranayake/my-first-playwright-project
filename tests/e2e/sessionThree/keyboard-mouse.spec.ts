/**
 * Session 03: Keyboard and Mouse Interactions
 * 
 * This file demonstrates advanced keyboard and mouse interactions.
 * 
 * Demo Site: https://the-internet.herokuapp.com/key_presses
 *            https://the-internet.herokuapp.com/drag_and_drop
 *            https://the-internet.herokuapp.com/hovers
 */
import { test, expect } from '@playwright/test';

test.describe('Keyboard Interactions', () => {
  test.describe('Key Press', () => {
    test('press individual keys', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/key_presses');

      const input = page.locator('#target');
      await input.focus();

      // Press a key
      await input.press('A');
      await expect(page.locator('#result')).toContainText('A');

      // Press Enter
      await input.press('Enter');
      await expect(page.locator('#result')).toContainText('ENTER');

      // Press Tab
      await input.press('Tab');
      await expect(page.locator('#result')).toContainText('TAB');

      // Press Escape
      await input.press('Escape');
      await expect(page.locator('#result')).toContainText('ESCAPE');
    });

    test('press special keys', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/key_presses');

      const input = page.locator('#target');
      await input.focus();

      // Function keys
      await input.press('F1');
      await input.press('F12');

      // Arrow keys
      await input.press('ArrowUp');
      await input.press('ArrowDown');
      await input.press('ArrowLeft');
      await input.press('ArrowRight');

      // Navigation keys
      await input.press('Home');
      await input.press('End');
      await input.press('PageUp');
      await input.press('PageDown');
    });

    test('keyboard shortcuts with modifiers', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/key_presses');

      const input = page.locator('#target');
      await input.focus();

      // Ctrl+A (Select All)
      await input.press('Control+a');

      // Ctrl+C (Copy)
      await input.press('Control+c');

      // Ctrl+V (Paste)
      await input.press('Control+v');

      // Shift+Tab (Reverse Tab)
      await input.press('Shift+Tab');

      // Alt+Key
      await input.press('Alt+a');

      // Multiple modifiers
      await input.press('Control+Shift+a');
    });

    test('type text with keyboard.type()', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/key_presses');

      const input = page.locator('#target');
      await input.focus();

      // Type text
      await page.keyboard.type('Hello Playwright');

      // Type with delay between characters
      await page.keyboard.type('Slow typing', { delay: 100 });
    });

    test('hold and release keys', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/key_presses');

      // Hold Shift
      await page.keyboard.down('Shift');

      // Type while holding Shift (uppercase)
      await page.keyboard.type('hello');

      // Release Shift
      await page.keyboard.up('Shift');

      // Type without Shift (lowercase)
      await page.keyboard.type(' world');
    });

    test('insertText for special characters', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/key_presses');

      const input = page.locator('#target');
      await input.focus();

      // Insert text directly (useful for special characters)
      await page.keyboard.insertText('Special: 你好 🎉');
    });
  });
});

test.describe('Mouse Interactions', () => {
  test.describe('Click variations', () => {
    test('single, double, and right click', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/context_menu');

      const hotSpot = page.locator('#hot-spot');

      // Single click
      await hotSpot.click();

      // Double click
      await hotSpot.dblclick();

      // Right click (context menu)
      // Note: This will trigger a JavaScript alert on this page
      page.once('dialog', dialog => dialog.accept());
      await hotSpot.click({ button: 'right' });
    });

    test('click with position', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/hovers');

      const figure = page.locator('.figure').first();

      // Click at specific position within element
      await figure.click({ position: { x: 10, y: 10 } }); // Top-left
      await figure.click({ position: { x: 50, y: 50 } }); // Center area
    });

    test('click with modifiers', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/');

      const link = page.getByRole('link', { name: 'Hovers' });

      // Ctrl+Click (usually opens in new tab)
      // Note: This opens new tab, covered in multi-tab tests
      // await link.click({ modifiers: ['Control'] });

      // Shift+Click
      await link.click({ modifiers: ['Shift'] });
    });

    test('force click on obscured elements', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/');

      // Force click bypasses actionability checks
      // Use with caution - only when element is visually obscured but functional
      await page.getByRole('link', { name: 'Hovers' }).click({ force: true });
    });
  });

  test.describe('Hover', () => {
    test('hover to reveal hidden elements', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/hovers');

      // Get all user figures
      const figures = page.locator('.figure');
      
      // Hover over first figure
      await figures.nth(0).hover();
      
      // Hidden caption should now be visible
      const caption = figures.nth(0).locator('.figcaption');
      await expect(caption).toBeVisible();
      await expect(caption).toContainText('user1');

      // Hover over second figure
      await figures.nth(1).hover();
      await expect(figures.nth(1).locator('.figcaption')).toContainText('user2');
    });
  });

  test.describe('Drag and Drop', () => {
    test('drag and drop between elements', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/drag_and_drop');

      // Method 1: Using dragTo()
      const columnA = page.locator('#column-a');
      const columnB = page.locator('#column-b');

      // Verify initial state
      await expect(columnA.locator('header')).toHaveText('A');
      await expect(columnB.locator('header')).toHaveText('B');

      // Drag A to B
      await columnA.dragTo(columnB);

      // Verify swap
      await expect(columnA.locator('header')).toHaveText('B');
      await expect(columnB.locator('header')).toHaveText('A');
    });

    test('drag and drop with mouse actions', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/drag_and_drop');

      const columnA = page.locator('#column-a');
      const columnB = page.locator('#column-b');

      // Method 2: Manual mouse actions
      const sourceBox = await columnA.boundingBox();
      const targetBox = await columnB.boundingBox();

      if (sourceBox && targetBox) {
        // Move to source center
        await page.mouse.move(
          sourceBox.x + sourceBox.width / 2,
          sourceBox.y + sourceBox.height / 2
        );

        // Press mouse down
        await page.mouse.down();

        // Move to target center
        await page.mouse.move(
          targetBox.x + targetBox.width / 2,
          targetBox.y + targetBox.height / 2
        );

        // Release mouse
        await page.mouse.up();
      }
    });

    test('drag with steps (smooth dragging)', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/drag_and_drop');

      const columnA = page.locator('#column-a');
      const columnB = page.locator('#column-b');

      const sourceBox = await columnA.boundingBox();
      const targetBox = await columnB.boundingBox();

      if (sourceBox && targetBox) {
        // Move in steps for smoother animation
        await page.mouse.move(
          sourceBox.x + sourceBox.width / 2,
          sourceBox.y + sourceBox.height / 2
        );
        await page.mouse.down();

        // Move with steps
        await page.mouse.move(
          targetBox.x + targetBox.width / 2,
          targetBox.y + targetBox.height / 2,
          { steps: 10 } // 10 intermediate steps
        );

        await page.mouse.up();
      }
    });
  });

  test.describe('Scroll', () => {
    test('scroll element into view', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/infinite_scroll');

      // Scroll to bottom of page
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      // Wait for more content to load
      await page.waitForTimeout(1000);

      // Scroll specific element into view
      // await page.locator('.jscroll-added').last().scrollIntoViewIfNeeded();
    });

    test('mouse wheel scroll', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/infinite_scroll');

      // Scroll using mouse wheel
      await page.mouse.wheel(0, 500); // Scroll down 500px
      await page.waitForTimeout(500);

      await page.mouse.wheel(0, 500); // Scroll more
      await page.waitForTimeout(500);

      // Scroll up
      await page.mouse.wheel(0, -300);
    });
  });
});
