/**
 * Session 02: Form Handling
 * 
 * This file demonstrates how to interact with various form elements.
 * 
 * Demo Site: https://demo.playwright.dev/todomvc (for todo input)
 * Additional patterns shown for other form types.
 */
import { test, expect } from '@playwright/test';

test.describe('Form Handling - TodoMVC', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/');
  });

  test.describe('Text Input', () => {
    test('fill() - set input value', async ({ page }) => {
      const input = page.getByPlaceholder('What needs to be done?');

      // fill() clears the field first, then types
      await input.fill('First task');
      await expect(input).toHaveValue('First task');

      // fill() again clears and replaces
      await input.fill('Replaced task');
      await expect(input).toHaveValue('Replaced task');
    });

    test('clear() - empty the input', async ({ page }) => {
      const input = page.getByPlaceholder('What needs to be done?');

      await input.fill('Some text');
      await expect(input).toHaveValue('Some text');

      await input.clear();
      await expect(input).toBeEmpty();
    });

    test('pressSequentially() - type character by character', async ({ page }) => {
      const input = page.getByPlaceholder('What needs to be done?');

      // Types each character with delay (useful for autocomplete testing)
      await input.pressSequentially('slow typing', { delay: 100 });
      await expect(input).toHaveValue('slow typing');
    });

    test('press() - keyboard keys', async ({ page }) => {
      const input = page.getByPlaceholder('What needs to be done?');

      await input.fill('Press Enter');
      await input.press('Enter');

      // Todo should be added
      await expect(page.getByTestId('todo-title')).toHaveText('Press Enter');

      // Input should be cleared after Enter
      await expect(input).toBeEmpty();
    });
  });

  test.describe('Checkbox Interactions', () => {
    test('check() and uncheck() - toggle checkbox', async ({ page }) => {
      // Add a todo first
      await page.getByPlaceholder('What needs to be done?').fill('Checkbox test');
      await page.getByPlaceholder('What needs to be done?').press('Enter');

      const checkbox = page.getByRole('checkbox', { name: 'Toggle Todo' });

      // Check
      await checkbox.check();
      await expect(checkbox).toBeChecked();

      // Uncheck
      await checkbox.uncheck();
      await expect(checkbox).not.toBeChecked();
    });

    test('setChecked() - set specific state', async ({ page }) => {
      await page.getByPlaceholder('What needs to be done?').fill('SetChecked test');
      await page.getByPlaceholder('What needs to be done?').press('Enter');

      const checkbox = page.getByRole('checkbox', { name: 'Toggle Todo' });

      // Set to checked
      await checkbox.setChecked(true);
      await expect(checkbox).toBeChecked();

      // Set to unchecked
      await checkbox.setChecked(false);
      await expect(checkbox).not.toBeChecked();
    });

    test('toggle all todos', async ({ page }) => {
      // Add multiple todos
      const input = page.getByPlaceholder('What needs to be done?');
      await input.fill('Task 1');
      await input.press('Enter');
      await input.fill('Task 2');
      await input.press('Enter');

      // Toggle all checkbox
      const toggleAll = page.getByLabel('Mark all as complete');
      await toggleAll.check();

      // All todos should be completed
      const checkboxes = page.getByRole('checkbox', { name: 'Toggle Todo' });
      await expect(checkboxes.nth(0)).toBeChecked();
      await expect(checkboxes.nth(1)).toBeChecked();
    });
  });

  test.describe('Click Interactions', () => {
    test('click() - basic click', async ({ page }) => {
      // Add a todo
      await page.getByPlaceholder('What needs to be done?').fill('Click test');
      await page.getByPlaceholder('What needs to be done?').press('Enter');

      // Click filter link
      await page.getByRole('link', { name: 'Active' }).click();
      await expect(page).toHaveURL(/active/);
    });

    test('dblclick() - double click to edit', async ({ page }) => {
      // Add a todo
      await page.getByPlaceholder('What needs to be done?').fill('Double click me');
      await page.getByPlaceholder('What needs to be done?').press('Enter');

      // Double click to edit
      await page.getByTestId('todo-title').dblclick();

      // Edit input should appear
      const editInput = page.getByTestId('todo-item').locator('input.edit');
      await expect(editInput).toBeVisible();
      await expect(editInput).toBeFocused();

      // Edit the todo
      await editInput.fill('Edited todo');
      await editInput.press('Enter');

      // Verify edit
      await expect(page.getByTestId('todo-title')).toHaveText('Edited todo');
    });

    test('hover() - reveal hidden elements', async ({ page }) => {
      // Add a todo
      await page.getByPlaceholder('What needs to be done?').fill('Hover test');
      await page.getByPlaceholder('What needs to be done?').press('Enter');

      // Destroy button is hidden until hover
      const todoItem = page.getByTestId('todo-item');
      await todoItem.hover();

      // Now destroy button should be visible
      const destroyBtn = page.getByRole('button', { name: 'Delete' });
      await expect(destroyBtn).toBeVisible();

      // Click to delete
      await destroyBtn.click();
      await expect(page.getByTestId('todo-item')).toHaveCount(0);
    });
  });

  test.describe('Focus Interactions', () => {
    test('focus() - set focus on element', async ({ page }) => {
      const input = page.getByPlaceholder('What needs to be done?');

      await input.focus();
      await expect(input).toBeFocused();
    });

    test('blur() - remove focus', async ({ page }) => {
      const input = page.getByPlaceholder('What needs to be done?');

      await input.focus();
      await expect(input).toBeFocused();

      await input.blur();
      await expect(input).not.toBeFocused();
    });
  });
});

test.describe('Form Handling - Additional Patterns', () => {
  // These demonstrate patterns for other form types
  // Using a different demo site with more form elements

  test.describe('Dropdown Select', () => {
    test.skip('selectOption() examples', async ({ page }) => {
      // Note: TodoMVC doesn't have dropdowns, so this is a pattern example
      // await page.goto('https://example.com/forms');

      // Select by value
      // await page.getByLabel('Country').selectOption('usa');

      // Select by visible text
      // await page.getByLabel('Country').selectOption({ label: 'United States' });

      // Select by index
      // await page.getByLabel('Country').selectOption({ index: 0 });

      // Multi-select
      // await page.getByLabel('Colors').selectOption(['red', 'blue', 'green']);
    });
  });

  test.describe('Radio Buttons', () => {
    test.skip('radio button examples', async ({ page }) => {
      // Note: Pattern example only
      // await page.goto('https://example.com/forms');

      // Select radio by label
      // await page.getByLabel('Male').check();
      // await page.getByLabel('Female').check();

      // Or by role
      // await page.getByRole('radio', { name: 'Premium' }).check();

      // Verify selection
      // await expect(page.getByLabel('Male')).toBeChecked();
    });
  });
});

test.describe('Navigation', () => {
  test('goto() - navigate to URL', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/');
    await expect(page).toHaveURL(/todomvc/);
  });

  test('goBack() and goForward()', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/');
    
    // Add a todo and navigate to filter
    await page.getByPlaceholder('What needs to be done?').fill('Nav test');
    await page.getByPlaceholder('What needs to be done?').press('Enter');
    await page.getByRole('link', { name: 'Active' }).click();
    
    await expect(page).toHaveURL(/active/);

    // Go back
    await page.goBack();
    await expect(page).toHaveURL('https://demo.playwright.dev/todomvc/');

    // Go forward
    await page.goForward();
    await expect(page).toHaveURL(/active/);
  });

  test('reload() - refresh the page', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/');
    
    // Add a todo
    await page.getByPlaceholder('What needs to be done?').fill('Reload test');
    await page.getByPlaceholder('What needs to be done?').press('Enter');
    
    // Reload page
    await page.reload();
    
    // Todo should persist (stored in localStorage)
    await expect(page.getByTestId('todo-title')).toHaveText('Reload test');
  });

  test('waitForURL() - wait for navigation', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/');
    
    // Add a todo
    await page.getByPlaceholder('What needs to be done?').fill('Wait test');
    await page.getByPlaceholder('What needs to be done?').press('Enter');
    
    // Click and wait for URL
    await page.getByRole('link', { name: 'Completed' }).click();
    await page.waitForURL('**/completed');
    
    await expect(page).toHaveURL(/completed/);
  });
});
