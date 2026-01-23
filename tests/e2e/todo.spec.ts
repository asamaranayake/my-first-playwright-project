/**
 * Session 02: Complete Todo App Test Suite
 * 
 * This file combines all concepts from Session 02 into
 * a comprehensive test suite for the TodoMVC application. */


import { test, expect } from '@playwright/test';

test.describe('Todo App - Complete Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/');
  });

  test.describe('Adding Todos', () => {
    test('should add a single todo', async ({ page }) => {
      const newTodoInput = page.getByPlaceholder('What needs to be done?');

      await newTodoInput.fill('Learn Playwright');
      await newTodoInput.press('Enter');

      await expect(page.getByTestId('todo-title')).toHaveText('Learn Playwright');
      await expect(page.getByTestId('todo-count')).toContainText('1 item left');
    });

    test('should add multiple todos', async ({ page }) => {
      const newTodoInput = page.getByPlaceholder('What needs to be done?');
      const todos = ['Task 1', 'Task 2', 'Task 3'];

      for (const todo of todos) {
        await newTodoInput.fill(todo);
        await newTodoInput.press('Enter');
      }

      await expect(page.getByTestId('todo-item')).toHaveCount(3);
      await expect(page.getByTestId('todo-title')).toHaveText(todos);
      await expect(page.getByTestId('todo-count')).toContainText('3 items left');
    });

    test('should clear input after adding todo', async ({ page }) => {
      const newTodoInput = page.getByPlaceholder('What needs to be done?');

      await newTodoInput.fill('Test todo');
      await newTodoInput.press('Enter');

      await expect(newTodoInput).toBeEmpty();
    });

    test('should not add empty todo', async ({ page }) => {
      const newTodoInput = page.getByPlaceholder('What needs to be done?');

      await newTodoInput.fill('   '); // Only spaces
      await newTodoInput.press('Enter');

      await expect(page.getByTestId('todo-item')).toHaveCount(0);
    });
  });

  test.describe('Completing Todos', () => {
    test('should mark a todo as complete', async ({ page }) => {
      await page.getByPlaceholder('What needs to be done?').fill('Complete me');
      await page.getByPlaceholder('What needs to be done?').press('Enter');

      await page.getByRole('checkbox', { name: 'Toggle Todo' }).check();

      await expect(page.getByTestId('todo-item')).toHaveClass(/completed/);
      await expect(page.getByTestId('todo-count')).toContainText('0 items left');
    });

    test('should unmark a completed todo', async ({ page }) => {
      await page.getByPlaceholder('What needs to be done?').fill('Toggle me');
      await page.getByPlaceholder('What needs to be done?').press('Enter');

      const checkbox = page.getByRole('checkbox', { name: 'Toggle Todo' });
      await checkbox.check();
      await checkbox.uncheck();

      await expect(page.getByTestId('todo-item')).not.toHaveClass(/completed/);
      await expect(page.getByTestId('todo-count')).toContainText('1 item left');
    });

    test('should toggle all todos at once', async ({ page }) => {
      const input = page.getByPlaceholder('What needs to be done?');
      await input.fill('Todo 1');
      await input.press('Enter');
      await input.fill('Todo 2');
      await input.press('Enter');

      await page.getByLabel('Mark all as complete').check();

      const items = page.getByTestId('todo-item');
      await expect(items.nth(0)).toHaveClass(/completed/);
      await expect(items.nth(1)).toHaveClass(/completed/);
    });
  });

  test.describe('Editing Todos', () => {
    test('should edit a todo by double-clicking', async ({ page }) => {
      await page.getByPlaceholder('What needs to be done?').fill('Original text');
      await page.getByPlaceholder('What needs to be done?').press('Enter');

      await page.getByTestId('todo-title').dblclick();

      const editInput = page.getByTestId('todo-item').locator('input.edit');
      await editInput.fill('Edited text');
      await editInput.press('Enter');

      await expect(page.getByTestId('todo-title')).toHaveText('Edited text');
    });

    test('should cancel edit on Escape', async ({ page }) => {
      await page.getByPlaceholder('What needs to be done?').fill('Original text');
      await page.getByPlaceholder('What needs to be done?').press('Enter');

      await page.getByTestId('todo-title').dblclick();

      const editInput = page.getByTestId('todo-item').locator('input.edit');
      await editInput.fill('Changed text');
      await editInput.press('Escape');

      await expect(page.getByTestId('todo-title')).toHaveText('Original text');
    });
  });

  test.describe('Deleting Todos', () => {
    test('should delete a todo', async ({ page }) => {
      await page.getByPlaceholder('What needs to be done?').fill('Delete me');
      await page.getByPlaceholder('What needs to be done?').press('Enter');

      await page.getByTestId('todo-item').hover();
      await page.getByRole('button', { name: 'Delete' }).click();

      await expect(page.getByTestId('todo-item')).toHaveCount(0);
    });

    test('should clear all completed todos', async ({ page }) => {
      const input = page.getByPlaceholder('What needs to be done?');
      await input.fill('Active todo');
      await input.press('Enter');
      await input.fill('Completed todo');
      await input.press('Enter');

      // Complete the second todo
      await page.getByRole('checkbox', { name: 'Toggle Todo' }).nth(1).check();

      // Clear completed
      await page.getByRole('button', { name: 'Clear completed' }).click();

      await expect(page.getByTestId('todo-item')).toHaveCount(1);
      await expect(page.getByTestId('todo-title')).toHaveText('Active todo');
    });
  });

  test.describe('Filtering Todos', () => {
    test.beforeEach(async ({ page }) => {
      const input = page.getByPlaceholder('What needs to be done?');
      await input.fill('Active task');
      await input.press('Enter');
      await input.fill('Completed task');
      await input.press('Enter');

      // Complete the second todo
      await page.getByRole('checkbox', { name: 'Toggle Todo' }).nth(1).check();
    });

    test('should filter active todos', async ({ page }) => {
      await page.getByRole('link', { name: 'Active' }).click();

      await expect(page.getByTestId('todo-item')).toHaveCount(1);
      await expect(page.getByTestId('todo-title')).toHaveText('Active task');
    });

    test('should filter completed todos', async ({ page }) => {
      await page.getByRole('link', { name: 'Completed' }).click();

      await expect(page.getByTestId('todo-item')).toHaveCount(1);
      await expect(page.getByTestId('todo-title')).toHaveText('Completed task');
    });

    test('should show all todos', async ({ page }) => {
      await page.getByRole('link', { name: 'Completed' }).click();
      await page.getByRole('link', { name: 'All' }).click();

      await expect(page.getByTestId('todo-item')).toHaveCount(2);
    });
  });

  test.describe('Persistence', () => {
    test('should persist todos after page reload', async ({ page }) => {
      await page.getByPlaceholder('What needs to be done?').fill('Persistent todo');
      await page.getByPlaceholder('What needs to be done?').press('Enter');

      await page.reload();

      await expect(page.getByTestId('todo-title')).toHaveText('Persistent todo');
    });
  });
});
