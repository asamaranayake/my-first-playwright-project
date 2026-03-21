// spec: specs/todomvc-comprehensive.plan.md

import { test, expect } from '@playwright/test';

test.describe('Todo Management - Basic CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the TodoMVC application to start testing
    await page.goto('https://demo.playwright.dev/todomvc/');
  });

  test('Add New Todo', async ({ page }) => {
    // Verify the todo input field is visible
    await expect(page.getByRole('textbox', { name: 'What needs to be done?' })).toBeVisible();
    await expect(page).toHaveTitle('React • TodoMVC');

    // Enter the first todo item 'Buy groceries'
    await page.getByRole('textbox', { name: 'What needs to be done?' }).fill('Buy groceries');
    await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');
    
    // Verify new todo item appears and counter updates
    await expect(page.getByText('Buy groceries')).toBeVisible();
    await expect(page.getByText('1 item left')).toBeVisible();
    await expect(page.getByRole('checkbox', { name: '❯Mark all as complete' })).toBeVisible();

    // Add a second todo 'Walk the dog'
    await page.getByRole('textbox', { name: 'What needs to be done?' }).fill('Walk the dog');
    await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');
    
    // Verify second todo appears and counter updates
    await expect(page.getByText('Walk the dog')).toBeVisible();
    await expect(page.getByText('2 items left')).toBeVisible();

    // Add a todo with special characters to test input validation
    await page.getByRole('textbox', { name: 'What needs to be done?' }).fill('Test & verify @functionality #123');
    await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');
    
    // Verify special characters are saved correctly
    await expect(page.getByText('Test & verify @functionality #123')).toBeVisible();
    await expect(page.getByText('3 items left')).toBeVisible();

    // Try to add an empty todo by just pressing Enter
    await page.getByRole('textbox', { name: 'What needs to be done?' }).fill('');
    await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');
    
    // Verify no new todo is created and list remains unchanged
    await expect(page.getByText('3 items left')).toBeVisible();
  });

  test('Complete Todo Items', async ({ page }) => {
    // Setup: Add three todos
    const todos = ['Task 1', 'Task 2', 'Task 3'];
    const input = page.getByRole('textbox', { name: 'What needs to be done?' });
    
    for (const todo of todos) {
      await input.fill(todo);
      await input.press('Enter');
    }
    
    // Verify all three todos appear in list
    await expect(page.getByText('3 items left')).toBeVisible();

    // Complete the first todo item to test completion functionality
    await page.getByRole('listitem').filter({ hasText: 'Task 1' }).getByLabel('Toggle Todo').click();
    
    // Verify first todo checkbox becomes checked and counter updates
    await expect(page.getByRole('listitem').filter({ hasText: 'Task 1' }).getByLabel('Toggle Todo')).toBeChecked();
    await expect(page.getByText('2 items left')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear completed' })).toBeVisible();

    // Complete the second todo item
    await page.getByRole('listitem').filter({ hasText: 'Task 2' }).getByLabel('Toggle Todo').click();
    
    // Verify second todo checkbox becomes checked and counter updates
    await expect(page.getByRole('listitem').filter({ hasText: 'Task 2' }).getByLabel('Toggle Todo')).toBeChecked();
    await expect(page.getByText('1 item left')).toBeVisible();

    // Uncomplete the first todo by clicking its checked checkbox
    await page.getByRole('listitem').filter({ hasText: 'Task 1' }).getByLabel('Toggle Todo').click();
    
    // Verify first todo checkbox becomes unchecked and counter increases
    await expect(page.getByRole('listitem').filter({ hasText: 'Task 1' }).getByLabel('Toggle Todo')).not.toBeChecked();
    await expect(page.getByText('2 items left')).toBeVisible();
  });

  test('Edit Todo Items', async ({ page }) => {
    // Add a todo 'Original task'
    await page.getByRole('textbox', { name: 'What needs to be done?' }).fill('Original task');
    await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');
    
    // Verify todo appears in the list
    await expect(page.getByText('Original task')).toBeVisible();

    // Double-click on the todo text to enter edit mode
    await page.getByText('Original task').dblclick();
    
    // Verify todo enters edit mode with text input field
    const editInput = page.getByRole('textbox', { name: 'Edit' });
    await expect(editInput).toBeVisible();
    await expect(editInput).toBeFocused();
    await expect(editInput).toHaveValue('Original task');

    // Change the todo text and save
    await editInput.fill('Updated task');
    await editInput.press('Enter');
    
    // Verify todo exits edit mode and text is updated
    await expect(page.getByText('Updated task')).toBeVisible();
    await expect(page.getByText('Original task')).not.toBeVisible();
    await expect(editInput).not.toBeVisible();
  });

  test('Delete Todo Items', async ({ page }) => {
    // Add three todos for deletion testing
    const todos = ['Delete me 1', 'Keep me', 'Delete me 2'];
    const input = page.getByRole('textbox', { name: 'What needs to be done?' });
    
    for (const todo of todos) {
      await input.fill(todo);
      await input.press('Enter');
    }
    
    // Verify all three todos are visible
    await expect(page.getByText('3 items left')).toBeVisible();
    for (const todo of todos) {
      await expect(page.getByText(todo)).toBeVisible();
    }

    // Hover over the first todo to reveal the delete button
    await page.getByText('Delete me 1').hover();
    
    // Delete the first todo by clicking its delete button
    await page.getByRole('listitem').filter({ hasText: 'Delete me 1' }).getByRole('button', { name: 'Delete' }).click();
    
    // Verify todo is removed and counter updates
    await expect(page.getByText('Delete me 1')).not.toBeVisible();
    await expect(page.getByText('2 items left')).toBeVisible();
    await expect(page.getByText('Keep me')).toBeVisible();
    await expect(page.getByText('Delete me 2')).toBeVisible();

    // Complete and then delete the second 'Delete me 2' todo
    await page.getByRole('listitem').filter({ hasText: 'Delete me 2' }).getByLabel('Toggle Todo').click();
    await expect(page.getByRole('listitem').filter({ hasText: 'Delete me 2' }).getByLabel('Toggle Todo')).toBeChecked();
    
    await page.getByText('Delete me 2').hover();
    await page.getByRole('listitem').filter({ hasText: 'Delete me 2' }).getByRole('button', { name: 'Delete' }).click();
    
    // Verify completed todo can be deleted
    await expect(page.getByText('Delete me 2')).not.toBeVisible();
    await expect(page.getByText('1 item left')).toBeVisible();
    await expect(page.getByText('Keep me')).toBeVisible();
  });
});