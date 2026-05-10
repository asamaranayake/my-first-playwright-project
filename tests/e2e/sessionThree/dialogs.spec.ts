/**
 * Session 03: Dialog Handling (Alerts, Confirms, Prompts)
 * 
 * This file demonstrates how to handle JavaScript dialogs.
 * 
 * Demo Site: https://the-internet.herokuapp.com/javascript_alerts
 */
import { test, expect } from '@playwright/test';

test.describe('Dialog Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://the-internet.herokuapp.com/javascript_alerts');
  });
  
//test.describe.configure({ mode: 'serial' });

  test.describe('Alert Dialog', () => {
    test('handle simple alert', async ({ page }) => {
      // Set up dialog handler BEFORE triggering the dialog
      page.on('dialog', async dialog => {
        // Verify dialog type and message
        expect(dialog.type()).toBe('alert');
        expect(dialog.message()).toBe('I am a JS Alert');
        
        // Accept the alert (click OK)
        await dialog.accept();
      });

      // Click button to trigger alert
      await page.getByRole('button', { name: 'Click for JS Alert' }).click();

      // Verify result message
      await expect(page.locator('#result')).toHaveText('You successfully clicked an alert');
    });

    test('handle alert with once handler', async ({ page }) => {
      // Use once() for single dialog handling
      page.once('dialog', dialog => dialog.accept());

      await page.getByRole('button', { name: 'Click for JS Alert' }).click();

      await expect(page.locator('#result')).toHaveText('You successfully clicked an alert');
    });
  });

  test.describe('Confirm Dialog', () => {
    test('accept confirm dialog', async ({ page }) => {
      page.on('dialog', async dialog => {
        expect(dialog.type()).toBe('confirm');
        expect(dialog.message()).toBe('I am a JS Confirm');
        await dialog.accept(); // Click OK
      });

      await page.getByRole('button', { name: 'Click for JS Confirm' }).click();

      await expect(page.locator('#result')).toHaveText('You clicked: Ok');
    });

    test('dismiss confirm dialog', async ({ page }) => {
      page.on('dialog', async dialog => {
        expect(dialog.type()).toBe('confirm');
        await dialog.dismiss(); // Click Cancel
      });

      await page.getByRole('button', { name: 'Click for JS Confirm' }).click();

      await expect(page.locator('#result')).toHaveText('You clicked: Cancel');
    });
  });

  test.describe('Prompt Dialog', () => {
    test('enter text in prompt dialog', async ({ page }) => {
      page.on('dialog', async dialog => {
        expect(dialog.type()).toBe('prompt');
        expect(dialog.message()).toBe('I am a JS prompt');
        
        // Enter text and accept
        await dialog.accept('Playwright is awesome!');
      });

      await page.getByRole('button', { name: 'Click for JS Prompt' }).click();

      await expect(page.locator('#result')).toHaveText('You entered: Playwright is awesome!');
    });

    test('dismiss prompt without entering text', async ({ page }) => {
      page.on('dialog', async dialog => {
        await dialog.dismiss();
      });

      await page.getByRole('button', { name: 'Click for JS Prompt' }).click();

      await expect(page.locator('#result')).toHaveText('You entered: null');
    });

    test('accept prompt with empty text', async ({ page }) => {
      page.on('dialog', async dialog => {
        await dialog.accept(''); // Empty string
      });

      await page.getByRole('button', { name: 'Click for JS Prompt' }).click();

      await expect(page.locator('#result')).toHaveText('You entered:');
    });

    test('get default prompt value', async ({ page }) => {
      page.on('dialog', async dialog => {
        // Get default value (if any)
        const defaultValue = dialog.defaultValue();
        console.log('Default value:', defaultValue);
        
        await dialog.accept('Custom value');
      });

      await page.getByRole('button', { name: 'Click for JS Prompt' }).click();
    });
  });

  test.describe('Multiple Dialogs', () => {
    test('handle multiple sequential dialogs', async ({ page }) => {
      let dialogCount = 0;
      
      page.on('dialog', async dialog => {
        dialogCount++;
        
        if (dialog.type() === 'alert') {
          await dialog.accept();
        } else if (dialog.type() === 'confirm') {
          await dialog.accept();
        } else if (dialog.type() === 'prompt') {
          await dialog.accept('Test input');
        }
      });

      // Trigger all three dialogs
      await page.getByRole('button', { name: 'Click for JS Alert' }).click();
      await page.getByRole('button', { name: 'Click for JS Confirm' }).click();
      await page.getByRole('button', { name: 'Click for JS Prompt' }).click();

      expect(dialogCount).toBe(3);
    });
  });

  test.describe('Auto-dismiss dialogs', () => {
    test('setup auto-dismiss for all dialogs', async ({ page }) => {
      // This pattern auto-accepts all dialogs
      page.on('dialog', dialog => dialog.accept());

      // Now all dialogs are automatically handled
      await page.getByRole('button', { name: 'Click for JS Alert' }).click();
      await expect(page.locator('#result')).toContainText('successfully');

      await page.getByRole('button', { name: 'Click for JS Confirm' }).click();
      await expect(page.locator('#result')).toContainText('Ok');
    });
  });
});

test.describe('Before Unload Dialog', () => {
  test('handle beforeunload event', async ({ page }) => {
    // Navigate to a page that might have beforeunload
    await page.goto('https://the-internet.herokuapp.com/javascript_alerts');

    // Set up beforeunload handler
    await page.evaluate(() => {
      window.addEventListener('beforeunload', (e) => {
        e.preventDefault();
        e.returnValue = '';
      });
    });

    // Handle the beforeunload dialog
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('beforeunload');
      await dialog.accept();
    });

    // Navigate away - this triggers beforeunload
    await page.goto('https://the-internet.herokuapp.com/');
  });
});
