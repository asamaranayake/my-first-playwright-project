# TodoMVC Comprehensive Test Plan

## Application Overview

A comprehensive test plan for the TodoMVC application (https://demo.playwright.dev/todomvc/) covering all core functionality including todo management, filtering, bulk operations, and edge cases. The application allows users to create, edit, complete, and delete todo items with various filtering and bulk operation capabilities.

## Test Scenarios

### 1. Todo Management - Basic CRUD Operations

**Seed:** `tests/seed/todomvc-setup.spec.ts`

#### 1.1. Add New Todo

**File:** `tests/todomvc/add-todo.spec.ts`

**Steps:**
  1. Navigate to the TodoMVC application at https://demo.playwright.dev/todomvc/
    - expect: Page loads successfully
    - expect: Title shows 'React • TodoMVC'
    - expect: Input field 'What needs to be done?' is visible
  2. Enter 'Buy groceries' in the todo input field
    - expect: Text is entered in the input field
  3. Press Enter to submit the todo
    - expect: New todo item 'Buy groceries' appears in the list
    - expect: Input field is cleared
    - expect: Todo counter shows '1 item left'
    - expect: Mark all as complete checkbox appears
  4. Add a second todo 'Walk the dog' using the same process
    - expect: Second todo appears in the list
    - expect: Counter updates to '2 items left'
  5. Add a todo with special characters 'Test & verify @functionality #123'
    - expect: Todo with special characters is saved correctly
    - expect: All characters display properly
  6. Try to add an empty todo (just press Enter without text)
    - expect: No new todo is created
    - expect: Input remains focused
    - expect: Todo list is unchanged

#### 1.2. Complete Todo Items

**File:** `tests/todomvc/complete-todo.spec.ts`

**Steps:**
  1. Add three todos: 'Task 1', 'Task 2', 'Task 3'
    - expect: All three todos appear in list
    - expect: Counter shows '3 items left'
  2. Click the checkbox next to 'Task 1' to complete it
    - expect: Task 1 checkbox becomes checked
    - expect: Counter updates to '2 items left'
    - expect: Clear completed button appears
  3. Complete 'Task 2' by clicking its checkbox
    - expect: Task 2 checkbox becomes checked
    - expect: Counter shows '1 item left'
    - expect: Clear completed button remains visible
  4. Click the completed checkbox of 'Task 1' to uncomplete it
    - expect: Task 1 checkbox becomes unchecked
    - expect: Counter increases to '2 items left'
  5. Complete all remaining todos
    - expect: All checkboxes are checked
    - expect: Counter shows '0 items left'

#### 1.3. Edit Todo Items

**File:** `tests/todomvc/edit-todo.spec.ts`

**Steps:**
  1. Add a todo 'Original task'
    - expect: Todo appears in the list
  2. Double-click on the todo text 'Original task'
    - expect: Todo enters edit mode with a text input field
    - expect: Current text is selected
    - expect: Edit input is focused
  3. Change the text to 'Updated task' and press Enter
    - expect: Todo exits edit mode
    - expect: Text is updated to 'Updated task'
    - expect: Todo remains in the same completion state
  4. Double-click another todo and press Escape without making changes
    - expect: Edit mode exits without saving changes
    - expect: Original text is preserved
  5. Edit a todo to empty text and press Enter
    - expect: Todo is deleted from the list
    - expect: Counter updates appropriately
  6. Edit a completed todo
    - expect: Can edit completed todos
    - expect: Completion state is preserved after edit

#### 1.4. Delete Todo Items

**File:** `tests/todomvc/delete-todo.spec.ts`

**Steps:**
  1. Add three todos: 'Delete me 1', 'Keep me', 'Delete me 2'
    - expect: All three todos are visible
    - expect: Counter shows '3 items left'
  2. Hover over 'Delete me 1' todo item
    - expect: Delete button (×) becomes visible on hover
  3. Click the delete button (×) for 'Delete me 1'
    - expect: Todo is removed from the list
    - expect: Counter updates to '2 items left'
    - expect: Remaining todos are still visible
  4. Complete 'Delete me 2' and then delete it
    - expect: Can delete completed todos
    - expect: Counter and clear completed button update correctly
  5. Try to delete the last remaining todo
    - expect: Last todo is deleted
    - expect: List becomes empty
    - expect: Todo input remains functional

### 2. Filtering and Views

**Seed:** `tests/seed/todomvc-setup.spec.ts`

#### 2.1. Filter All Todos

**File:** `tests/todomvc/filter-all.spec.ts`

**Steps:**
  1. Add todos: 'Active todo 1', 'Active todo 2', complete one of them
    - expect: Both active and completed todos are visible
    - expect: URL shows '#/'
    - expect: 'All' filter is active
  2. Click on 'All' filter when already selected
    - expect: All todos remain visible
    - expect: Filter style indicates it's active
  3. Navigate to other filters and return to 'All'
    - expect: All todos become visible again
    - expect: URL returns to '#/'

#### 2.2. Filter Active Todos

**File:** `tests/todomvc/filter-active.spec.ts`

**Steps:**
  1. Add three todos and complete one of them
    - expect: Setup: 2 active and 1 completed todo exist
  2. Click the 'Active' filter
    - expect: Only uncompleted todos are visible
    - expect: Completed todos are hidden
    - expect: URL shows '#/active'
    - expect: 'Active' filter appears selected
  3. Complete one of the visible active todos
    - expect: Newly completed todo disappears from view
    - expect: Counter updates correctly
    - expect: Only remaining active todos visible
  4. Complete all todos while on Active filter
    - expect: Active list becomes empty
    - expect: Message or empty state is appropriate

#### 2.3. Filter Completed Todos

**File:** `tests/todomvc/filter-completed.spec.ts`

**Steps:**
  1. Add three todos: 'Todo 1', 'Todo 2', 'Todo 3'
    - expect: All todos are active initially
  2. Complete 'Todo 1' and 'Todo 3'
    - expect: Two todos are now completed
  3. Click the 'Completed' filter
    - expect: Only completed todos are visible
    - expect: Active todos are hidden
    - expect: URL shows '#/completed'
    - expect: 'Completed' filter appears selected
  4. Uncomplete one todo while on Completed filter
    - expect: Uncompleted todo disappears from view
    - expect: Only remaining completed todos visible
  5. Clear all completed todos using clear completed button
    - expect: Completed list becomes empty
    - expect: Appropriate empty state shown

### 3. Bulk Operations

**Seed:** `tests/seed/todomvc-setup.spec.ts`

#### 3.1. Mark All as Complete

**File:** `tests/todomvc/mark-all-complete.spec.ts`

**Steps:**
  1. Add four todos: 'Bulk 1', 'Bulk 2', 'Bulk 3', 'Bulk 4'
    - expect: All todos are active
    - expect: Counter shows '4 items left'
    - expect: Mark all checkbox is unchecked
  2. Click the 'Mark all as complete' checkbox
    - expect: All todo checkboxes become checked
    - expect: Counter shows '0 items left'
    - expect: Clear completed button appears
    - expect: Mark all checkbox is checked
  3. Click 'Mark all as complete' checkbox again to uncheck it
    - expect: All todos become uncompleted
    - expect: Counter returns to '4 items left'
    - expect: Clear completed button disappears
  4. Complete some todos manually, then use mark all complete
    - expect: All todos become completed regardless of previous state
  5. Test mark all complete with empty todo list
    - expect: Mark all checkbox should not be visible or functional when no todos exist

#### 3.2. Clear Completed Todos

**File:** `tests/todomvc/clear-completed.spec.ts`

**Steps:**
  1. Add five todos and complete three of them
    - expect: 3 completed and 2 active todos exist
    - expect: Counter shows '2 items left'
    - expect: Clear completed button is visible
  2. Click the 'Clear completed' button
    - expect: All completed todos are removed
    - expect: Only active todos remain
    - expect: Clear completed button disappears
    - expect: Counter remains '2 items left'
  3. Complete all remaining todos and clear them
    - expect: All todos are removed
    - expect: Todo list becomes empty
    - expect: Counter shows '0 items left'
  4. Verify clear completed button visibility with no completed todos
    - expect: Button is not visible when no completed todos exist

### 4. Edge Cases and Error Handling

**Seed:** `tests/seed/todomvc-setup.spec.ts`

#### 4.1. Input Validation and Limits

**File:** `tests/todomvc/input-validation.spec.ts`

**Steps:**
  1. Try to add a todo with only whitespace characters
    - expect: No todo is created
    - expect: Input is cleared or shows validation
  2. Add a todo with very long text (500+ characters)
    - expect: Todo is created successfully
    - expect: Text is displayed properly
    - expect: UI handles long text gracefully
  3. Test special characters: quotes, HTML tags, emojis
    - expect: All special characters are handled correctly
    - expect: No XSS or HTML injection occurs
    - expect: Emojis display properly
  4. Test unicode characters and various languages
    - expect: Unicode text is saved and displayed correctly

#### 4.2. Navigation and URL Handling

**File:** `tests/todomvc/navigation.spec.ts`

**Steps:**
  1. Navigate directly to each filter URL: #/, #/active, #/completed
    - expect: Each URL loads the correct filter view
    - expect: Application state matches the URL
  2. Use browser back/forward buttons after changing filters
    - expect: Navigation works correctly
    - expect: URL and view stay synchronized
  3. Refresh page on different filter URLs
    - expect: Filter persists after page refresh
    - expect: Todo data is maintained (if applicable)
  4. Test invalid filter URLs like #/invalid
    - expect: Application handles gracefully
    - expect: Redirects or shows appropriate default view

#### 4.3. Counter and State Consistency

**File:** `tests/todomvc/counter-consistency.spec.ts`

**Steps:**
  1. Perform various operations and verify counter accuracy throughout
    - expect: Counter always reflects exact number of active todos
  2. Test counter with rapid add/delete/complete operations
    - expect: Counter remains accurate during rapid operations
  3. Verify pluralization: 1 item vs multiple items
    - expect: Text changes appropriately: '1 item left' vs 'X items left'
  4. Test counter when all todos are completed vs all deleted
    - expect: Counter shows '0 items left' in both scenarios
