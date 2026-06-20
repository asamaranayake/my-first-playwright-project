/**
 * Session 02: Web-First Assertions
 * 
 * This file demonstrates Playwright's auto-retrying assertions.
 * These assertions automatically wait and retry until the condition is met.
 * 
 * Demo Site: https://demo.playwright.dev/todomvc
 */
import { test, expect } from '@playwright/test';

test.describe('Web-First Assertions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/');
  });

  test.describe('Page Assertions', () => {
    test('toHaveTitle - verify page title', async ({ page }) => {
      // Exact title
      await expect(page).toHaveTitle('React • TodoMVC');

      // Partial match with regex
      await expect(page).toHaveTitle(/TodoMVC/);
    });

    test('toHaveURL - verify current URL', async ({ page }) => {
      // Exact URL
      await expect(page).toHaveURL('https://demo.playwright.dev/todomvc/');

      // Partial match with regex
      await expect(page).toHaveURL(/todomvc/);

      // Navigate and verify URL change
      await page.getByPlaceholder('What needs to be done?').fill('Test');
      await page.getByPlaceholder('What needs to be done?').press('Enter');
      await page.getByRole('link', { name: 'Active' }).click();
      
      await expect(page).toHaveURL(/active/);
    });
  });

  test.describe('Visibility Assertions', () => {
    test('toBeVisible - element is visible', async ({ page }) => {
      await expect(page.getByPlaceholder('What needs to be done?')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible();
    });

    test('toBeHidden - element is hidden', async ({ page }) => {
      // Footer is hidden when no todos
      await expect(page.getByTestId('todo-count')).toBeHidden();

      // Add a todo - footer becomes visible
      await page.getByPlaceholder('What needs to be done?').fill('Test');
      await page.getByPlaceholder('What needs to be done?').press('Enter');

      await expect(page.getByTestId('todo-count')).toBeVisible();
    });

    test('not.toBeVisible - negation', async ({ page }) => {
      await expect(page.getByText('Clear completed')).not.toBeVisible();
    });
  });

  test.describe('Text Assertions', () => {
    test('toHaveText - exact text match', async ({ page }) => {
      // Add a todo
      await page.getByPlaceholder('What needs to be done?').fill('My task');
      await page.getByPlaceholder('What needs to be done?').press('Enter');

      await expect(page.getByTestId('todo-title')).toHaveText('My task');
    });

    test('toContainText - partial text match', async ({ page }) => {
      await page.getByPlaceholder('What needs to be done?').fill('Learn Playwright automation');
      await page.getByPlaceholder('What needs to be done?').press('Enter');

      await expect(page.getByTestId('todo-title')).toContainText('Playwright');
      await expect(page.getByTestId('todo-title')).toContainText(/playwright/i);
    });

    test('toHaveText with array - multiple elements', async ({ page }) => {
      const input = page.getByPlaceholder('What needs to be done?');
      await input.fill('Task 1');
      await input.press('Enter');
      await input.fill('Task 2');
      await input.press('Enter');
      await input.fill('Task 3');
      await input.press('Enter');

      // Verify all todo titles
      await expect(page.getByTestId('todo-title')).toHaveText([
        'Task 1',
        'Task 2', 
        'Task 3'
      ]);
    });
  });

  test.describe('Form State Assertions', () => {
    test('toHaveValue - input value', async ({ page }) => {
      const input = page.getByPlaceholder('What needs to be done?');
      
      await input.fill('Checking value');
      await expect(input).toHaveValue('Checking value');
    });

    test('toBeEmpty - empty input', async ({ page }) => {
      const input = page.getByPlaceholder('What needs to be done?');
      
      await expect(input).toBeEmpty();
      
      await input.fill('Not empty');
      await expect(input).not.toBeEmpty();
    });

    test('toBeChecked - checkbox state', async ({ page }) => {
      // Add a todo
      await page.getByPlaceholder('What needs to be done?').fill('Checkbox test');
      await page.getByPlaceholder('What needs to be done?').press('Enter');

      const checkbox = page.getByRole('checkbox', { name: 'Toggle Todo' });
      
      await expect(checkbox).not.toBeChecked();
      
      await checkbox.check();
      await expect(checkbox).toBeChecked();
    });

    test('toBeEnabled / toBeDisabled', async ({ page }) => {
      const input = page.getByPlaceholder('What needs to be done?');
      
      // Input should be enabled
      await expect(input).toBeEnabled();
      
      // Note: This demo app doesn't have disabled elements,
      // but the assertion would look like:
      // await expect(disabledButton).toBeDisabled();
    });

    test('toBeFocused - element has focus', async ({ page }) => {
      const input = page.getByPlaceholder('What needs to be done?');
      
      await input.focus();
      await expect(input).toBeFocused();
    });
  });

  test.describe('Count Assertions', () => {
    test('toHaveCount - number of elements', async ({ page }) => {
      // No todos initially
      await expect(page.getByTestId('todo-item')).toHaveCount(0);

      // Add todos
      const input = page.getByPlaceholder('What needs to be done?');
      await input.fill('Todo 1');
      await input.press('Enter');
      await input.fill('Todo 2');
      await input.press('Enter');

      await expect(page.getByTestId('todo-item')).toHaveCount(2);

      // Add one more
      await input.fill('Todo 3');
      await input.press('Enter');

      await expect(page.getByTestId('todo-item')).toHaveCount(3);
    });
  });

  test.describe('CSS Assertions', () => {
    test('toHaveClass - CSS class', async ({ page }) => {
      // Add and complete a todo
      await page.getByPlaceholder('What needs to be done?').fill('Completed task');
      await page.getByPlaceholder('What needs to be done?').press('Enter');
      await page.getByRole('checkbox', { name: 'Toggle Todo' }).check();

      // Completed todo should have 'completed' class
      await expect(page.getByTestId('todo-item')).toHaveClass(/completed/);
    });

    test('toHaveAttribute - element attribute', async ({ page }) => {
      const input = page.getByPlaceholder('What needs to be done?');
      
      await expect(input).toHaveAttribute('placeholder', 'What needs to be done?');
      await expect(input).toHaveAttribute('class', /new-todo/);
    });

    test('toHaveCSS - CSS property', async ({ page }) => {
      const heading = page.getByRole('heading', { name: 'todos' });
      
      // Check CSS properties
      await expect(heading).toHaveCSS('font-weight', '200');
    });
  });

  test.describe('Soft Assertions', () => {
    test('continue test after soft assertion fails', async ({ page }) => {
      // Soft assertions don't stop the test immediately
      // The test continues and fails at the end if any soft assertion failed
      
      await expect.soft(page).toHaveTitle(/TodoMVC/);
      
      const input = page.getByPlaceholder('What needs to be done?');
      await expect.soft(input).toBeVisible();
      await expect.soft(input).toBeEmpty();
      
      // This would fail but test continues
      // await expect.soft(page).toHaveTitle('Wrong Title');
      
      // Test continues here...
      await input.fill('Soft assertion test');
      await input.press('Enter');
      
      await expect.soft(page.getByTestId('todo-title')).toHaveText('Soft assertion test');
    });
  });

  test.describe('Custom Timeout', () => {
    test('assertion with custom timeout', async ({ page }) => {
      await page.getByPlaceholder('What needs to be done?').fill('Timeout test');
      await page.getByPlaceholder('What needs to be done?').press('Enter');

      // Custom timeout for slow elements
      await expect(page.getByTestId('todo-title')).toHaveText('Timeout test', {
        timeout: 10000 // 10 seconds
      });
    });
  });

  test.describe('Assertion Messages', () => {
    test('add custom message for debugging', async ({ page }) => {
      // Custom message helps identify failures
      await expect(page, 'Page should load with correct title').toHaveTitle(/TodoMVC/);

      const input = page.getByPlaceholder('What needs to be done?');
      await expect(input, 'Input should be visible on page load').toBeVisible();
    });
  });
});
