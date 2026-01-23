/**
 * Session 02: Selector Strategies
 * 
 * This file demonstrates different locator strategies in Playwright.
 * We test from BEST (most reliable) to WORST (fragile).
 * 
 * Demo Site: https://demo.playwright.dev/todomvc
 */
import { test, expect } from '@playwright/test';

test.describe('Selector Strategies', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/');
  });

  test.describe('1. getByRole() - The Gold Standard', () => {
    test('find elements by ARIA role', async ({ page }) => {
      // Find heading by role
      await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible();

      // Find textbox by role
      const input = page.getByRole('textbox', { name: 'What needs to be done?' });
      await expect(input).toBeVisible();

      // Add a todo to get more elements
      await input.fill('Learn getByRole');
      await input.press('Enter');

      // Find checkbox by role
      const checkbox = page.getByRole('checkbox', { name: 'Toggle Todo' });
      await expect(checkbox).toBeVisible();

      // Find link by role
      await expect(page.getByRole('link', { name: 'All' })).toBeVisible();
    });

    test('use exact matching for precision', async ({ page }) => {
      // Exact match - only matches exact text
      await expect(page.getByRole('heading', { name: 'todos', exact: true })).toBeVisible();
    });
  });

  test.describe('2. getByPlaceholder() - Input Fields', () => {
    test('find input by placeholder text', async ({ page }) => {
      const input = page.getByPlaceholder('What needs to be done?');
      
      await expect(input).toBeVisible();
      await expect(input).toBeEmpty();
      
      // Can interact with it
      await input.fill('Placeholder located!');
      await expect(input).toHaveValue('Placeholder located!');
    });
  });

  test.describe('3. getByTestId() - Testing-Specific', () => {
    test('find elements by data-testid attribute', async ({ page }) => {
      // Add a todo first
      await page.getByPlaceholder('What needs to be done?').fill('Test todo');
      await page.getByPlaceholder('What needs to be done?').press('Enter');

      // Find by test ID (data-testid attribute)
      const todoItem = page.getByTestId('todo-item');
      await expect(todoItem).toBeVisible();

      const todoTitle = page.getByTestId('todo-title');
      await expect(todoTitle).toHaveText('Test todo');
    });
  });

  test.describe('4. getByText() - Content-Based', () => {
    test('find elements by visible text', async ({ page }) => {
      // Add todos
      const input = page.getByPlaceholder('What needs to be done?');
      await input.fill('Buy groceries');
      await input.press('Enter');
      await input.fill('Walk the dog');
      await input.press('Enter');

      // Find by exact text
      await expect(page.getByText('Buy groceries')).toBeVisible();
      
      // Find by partial text (regex)
      await expect(page.getByText(/Walk/)).toBeVisible();
      
      // Case insensitive search
      await expect(page.getByText(/buy groceries/i)).toBeVisible();
    });
  });

  test.describe('5. nth() and first()/last() - Position-Based', () => {
    test('find elements by position', async ({ page }) => {
      // Add multiple todos
      const input = page.getByPlaceholder('What needs to be done?');
      await input.fill('First task');
      await input.press('Enter');
      await input.fill('Second task');
      await input.press('Enter');
      await input.fill('Third task');
      await input.press('Enter');

      // Get all todo items
      const todos = page.getByTestId('todo-item');
      await expect(todos).toHaveCount(3);

      // Get by position (0-indexed)
      await expect(todos.nth(0)).toContainText('First task');
      await expect(todos.nth(1)).toContainText('Second task');
      await expect(todos.nth(2)).toContainText('Third task');

      // first() and last() shortcuts
      await expect(todos.first()).toContainText('First task');
      await expect(todos.last()).toContainText('Third task');
    });
  });

  test.describe('6. CSS Selectors - Last Resort', () => {
    test('use CSS selectors when needed', async ({ page }) => {
      // Class selector
      await expect(page.locator('.todoapp')).toBeVisible();

      // ID selector (if available)
      // await page.locator('#unique-id')

      // Attribute selector
      await expect(page.locator('[placeholder="What needs to be done?"]')).toBeVisible();

      // Compound selector
      await expect(page.locator('header.header')).toBeVisible();
    });
  });

  test.describe('7. Chaining Locators', () => {
    test('chain locators for precision', async ({ page }) => {
      // Add a todo
      await page.getByPlaceholder('What needs to be done?').fill('Chained todo');
      await page.getByPlaceholder('What needs to be done?').press('Enter');

      // Chain: find todo item, then find checkbox within it
      const todoItem = page.getByTestId('todo-item');
      const checkbox = todoItem.getByRole('checkbox');
      
      await expect(checkbox).not.toBeChecked();
      await checkbox.check();
      await expect(checkbox).toBeChecked();
    });

    test('filter locators', async ({ page }) => {
      // Add multiple todos
      const input = page.getByPlaceholder('What needs to be done?');
      await input.fill('Active todo');
      await input.press('Enter');
      await input.fill('Completed todo');
      await input.press('Enter');

      // Complete the second todo
      await page.getByTestId('todo-item').nth(1).getByRole('checkbox').check();

      // Filter by has (contains element)
      const completedItems = page.getByTestId('todo-item').filter({
        has: page.getByRole('checkbox', { checked: true })
      });
      await expect(completedItems).toHaveCount(1);

      // Filter by hasText
      const activeItem = page.getByTestId('todo-item').filter({
        hasText: 'Active todo'
      });
      await expect(activeItem).toHaveCount(1);
    });
  });
});
