import { test, expect } from '../../../fixtures/api-fixtures';
import testData from '../../test-data/api/users.json';


/**
 * Session 05 - Part 2: CRUD Operations with API Helper Class
 *
 * These tests use the UsersAPI helper class (injected via fixture).
 * This demonstrates the API equivalent of the Page Object Model.
 */
test.describe('Users API - CRUD with Helper Class', () => {

  // ──────────────── CREATE ────────────────

  test('should create a new user', async ({ usersAPI }) => {
    const response = await usersAPI.createUser(testData.newUser);

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.name).toBe(testData.newUser.name);
    expect(body.job).toBe(testData.newUser.job);
    expect(body.id).toBeTruthy();
    expect(body.createdAt).toBeTruthy();
  });

  // ──────────────── READ ────────────────

  test('should list users using helper', async ({ usersAPI }) => {
    const response = await usersAPI.getUsers(1);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.page).toBe(1);
    expect(body.data).toHaveLength(6);

    // Verify each user has required fields
    for (const user of body.data) {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('first_name');
      expect(user).toHaveProperty('last_name');
    }
  });

  test('should get single user using helper', async ({ usersAPI }) => {
    const response = await usersAPI.getUserById(2);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.data.id).toBe(2);
    expect(body.data.email).toContain('@');
  });

  test('should get 404 for missing user', async ({ usersAPI }) => {
    const response = await usersAPI.getUserById(99999);
    expect(response.status()).toBe(404);
  });

  // ──────────────── UPDATE (full) ────────────────

  test('should fully update a user', async ({ usersAPI }) => {
    const response = await usersAPI.updateUser(2, testData.updatedUser);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.name).toBe(testData.updatedUser.name);
    expect(body.job).toBe(testData.updatedUser.job);
    expect(body.updatedAt).toBeTruthy();
  });

  // ──────────────── UPDATE (partial) ────────────────

  test('should partially update a user', async ({ usersAPI }) => {
    const response = await usersAPI.patchUser(2, testData.partialUpdate);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.job).toBe(testData.partialUpdate.job);
    expect(body.updatedAt).toBeTruthy();
  });

  // ──────────────── DELETE ────────────────

  test('should delete a user', async ({ usersAPI }) => {
    const response = await usersAPI.deleteUser(2);
    expect(response.status()).toBe(204);
  });

  // ──────────────── FULL LIFECYCLE ────────────────

  test('should perform complete CRUD lifecycle', async ({ usersAPI }) => {
    // ── Step 1: CREATE ──
    const createRes = await usersAPI.createUser({
      name: 'Lifecycle User',
      job: 'Junior Tester',
    });
    expect(createRes.status()).toBe(201);
    const created = await createRes.json();
    const userId = Number(created.id);
    console.log(`✅ Created user with ID: ${userId}`);

    // ── Step 2: READ ──
    const readRes = await usersAPI.getUserById(2); // Using existing user for read
    expect(readRes.status()).toBe(200);
    console.log('✅ Read user successfully');

    // ── Step 3: UPDATE (full) ──
    const updateRes = await usersAPI.updateUser(userId, {
      name: 'Lifecycle User Updated',
      job: 'Senior Tester',
    });
    expect(updateRes.status()).toBe(200);
    const updated = await updateRes.json();
    expect(updated.name).toBe('Lifecycle User Updated');
    expect(updated.job).toBe('Senior Tester');
    console.log(`✅ Updated user: ${updated.name} - ${updated.job}`);

    // ── Step 4: UPDATE (partial) ──
    const patchRes = await usersAPI.patchUser(userId, {
      job: 'Lead Tester',
    });
    expect(patchRes.status()).toBe(200);
    const patched = await patchRes.json();
    expect(patched.job).toBe('Lead Tester');
    console.log(`✅ Patched user job to: ${patched.job}`);

    // ── Step 5: DELETE ──
    const deleteRes = await usersAPI.deleteUser(userId);
    expect(deleteRes.status()).toBe(204);
    console.log(`✅ Deleted user: ${userId}`);

    console.log('🎉 Complete CRUD lifecycle passed!');
  });

  // ──────────────── TYPED HELPER METHODS ────────────────

  test('should use typed helper methods', async ({ usersAPI }) => {
    // getUserList returns typed UserListResponse
    const userList = await usersAPI.getUserList(1);

    expect(userList.page).toBe(1);
    expect(userList.data.length).toBeGreaterThan(0);

    // Access typed user data
    const firstUser = userList.data[0];
    expect(firstUser.id).toBeGreaterThan(0);
    expect(firstUser.email).toContain('@');
    expect(firstUser.first_name).toBeTruthy();

    // getUser returns typed SingleUserResponse
    const singleUser = await usersAPI.getUser(2);
    expect(singleUser.data.id).toBe(2);
    expect(singleUser.support).toBeDefined();
  });
});
