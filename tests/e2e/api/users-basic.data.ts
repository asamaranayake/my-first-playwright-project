import { test, expect } from '../../../fixtures/api-fixtures';
import { HttpStatusCodes } from '../../../src/api/HttpStatusCodes';
import {
  CreateUserResponse,
  SingleUserResponse,
  UpdateUserResponse,
  UserListResponse,
} from '../../../src/api/UsersAPI';

/**
 * Session 05 - Part 1: Basic API Tests
 *
 * These tests demonstrate fundamental API testing with Playwright's
 * built-in `request` fixture. No extra libraries needed!
 */
test.describe('Users API - Basic Operations', () => {

  // ──────────────── GET Requests ────────────────

  test('GET - should list users from page 1', async ({ usersAPI }) => {
    const response = await usersAPI.getUsers(1);

    // Level 1: Status code validation
    expect(response.status()).toBe(HttpStatusCodes.OK);
    expect(response.ok()).toBeTruthy();

    // Level 2: Response structure validation
    const body = await usersAPI.getResponseBody<UserListResponse>(response);
    expect(body).toHaveProperty('page');
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('total');

    // Level 3: Data value validation
    expect(body.page).toBe(1);
    expect(body.data).toHaveLength(6);
    expect(body.per_page).toBe(6);
  });

  test('GET - should get a single user by ID', async ({ usersAPI }) => {
    const response = await usersAPI.getUserById(2);

    expect(response.status()).toBe(HttpStatusCodes.OK);

    const body = await usersAPI.getResponseBody<SingleUserResponse>(response);

    // Verify user data structure
    expect(body.data).toHaveProperty('id');
    expect(body.data).toHaveProperty('email');
    expect(body.data).toHaveProperty('first_name');
    expect(body.data).toHaveProperty('last_name');
    expect(body.data).toHaveProperty('avatar');

    // Verify specific values
    expect(body.data.id).toBe(2);
    expect(body.data.email).toContain('@');
  });

  test('GET - should return 404 for non-existent user', async ({ usersAPI }) => {
    const response = await usersAPI.getUserById(99999);

    // 404 = Resource Not Found
    expect(response.status()).toBe(HttpStatusCodes.NOT_FOUND);
    expect(response.ok()).toBeFalsy();

    // Body should be empty object
    const body = await usersAPI.getResponseBody<Record<string, never>>(response);
    expect(Object.keys(body)).toHaveLength(0);
  });

  test('GET - should support query parameters', async ({ usersAPI }) => {
    const response = await usersAPI.getUsers(2);

    expect(response.status()).toBe(HttpStatusCodes.OK);

    const body = await usersAPI.getResponseBody<UserListResponse>(response);
    expect(body.page).toBe(2);
  });

  // ──────────────── POST Requests ────────────────

  test('POST - should create a new user', async ({ usersAPI }) => {
    const newUser = {
      name: 'Akila Samaranayake',
      job: 'Senior SDET Engineer',
    };

    const response = await usersAPI.createUser(newUser);

    // 201 = Created
    expect(response.status()).toBe(HttpStatusCodes.CREATED);

    const body = await usersAPI.getResponseBody<CreateUserResponse>(response);

    // Verify our data is in the response
    expect(body.name).toBe(newUser.name);
    expect(body.job).toBe(newUser.job);

    // Verify server-generated fields
    expect(body.id).toBeTruthy();
    expect(body.createdAt).toBeTruthy();
  });

  // ──────────────── PUT Requests ────────────────

  test('PUT - should fully update a user', async ({ usersAPI }) => {
    const updatedData = {
      name: 'Updated User',
      job: 'Lead Engineer',
    };

    const response = await usersAPI.updateUser(2, updatedData);

    expect(response.status()).toBe(HttpStatusCodes.OK);

    const body = await usersAPI.getResponseBody<UpdateUserResponse>(response);
    expect(body.name).toBe(updatedData.name);
    expect(body.job).toBe(updatedData.job);
    expect(body.updatedAt).toBeTruthy();
  });

  // ──────────────── PATCH Requests ────────────────

  test('PATCH - should partially update a user', async ({ usersAPI }) => {
    const partialUpdate = {
      job: 'QA Architect', // Only updating the job
    };

    const response = await usersAPI.patchUser(2, partialUpdate);

    expect(response.status()).toBe(HttpStatusCodes.OK);

    const body = await usersAPI.getResponseBody<UpdateUserResponse>(response);
    expect(body.job).toBe('QA Architect');
    expect(body.updatedAt).toBeTruthy();
  });

  // ──────────────── DELETE Requests ────────────────

  test('DELETE - should remove a user', async ({ usersAPI }) => {
    const response = await usersAPI.deleteUser(2);

    // 204 = No Content (successfully deleted, no body returned)
    expect(response.status()).toBe(HttpStatusCodes.NO_CONTENT);
  });

  // ──────────────── Response Details ────────────────

  test('should inspect response headers', async ({ usersAPI }) => {
    const response = await usersAPI.getUserById(2);

    // Check headers
    expect(response.headers()['content-type']).toContain('application/json');
    expect(response.statusText()).toBe('OK');

    // Log for debugging
    console.log('Status:', response.status());
    console.log('Content-Type:', response.headers()['content-type']);
  });
});
