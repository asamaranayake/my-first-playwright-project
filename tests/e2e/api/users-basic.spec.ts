import { test, expect } from '@playwright/test';

/**
 * Session 05 - Part 1: Basic API Tests
 *
 * These tests demonstrate fundamental API testing with Playwright's
 * built-in `request` fixture. No extra libraries needed!
 */
test.describe('Users API - Basic Operations', () => {

  // ──────────────── GET Requests ────────────────

  test('GET - should list users from page 1', async ({ request }) => {
    // Send GET request (uses baseURL from config)
    const response = await request.get('/api/users?page=1');

    // Level 1: Status code validation
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    // Level 2: Response structure validation
    const body = await response.json();
    expect(body).toHaveProperty('page');
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('total');

    // Level 3: Data value validation
    expect(body.page).toBe(1);
    expect(body.data).toHaveLength(6);
    expect(body.per_page).toBe(6);
  });

  test('GET - should get a single user by ID', async ({ request }) => {
    const response = await request.get('/api/users/2');

    expect(response.status()).toBe(200);

    const body = await response.json();

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

  test('GET - should return 404 for non-existent user', async ({ request }) => {
    const response = await request.get('/api/users/99999');

    // 404 = Resource Not Found
    expect(response.status()).toBe(404);
    expect(response.ok()).toBeFalsy();

    // Body should be empty object
    const body = await response.json();
    expect(Object.keys(body)).toHaveLength(0);
  });

  test('GET - should support query parameters', async ({ request }) => {
    // Using params option (cleaner than URL string)
    const response = await request.get('/api/users', {
      params: { page: 2 },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.page).toBe(2);
  });

  // ──────────────── POST Requests ────────────────

  test('POST - should create a new user', async ({ request }) => {
    const newUser = {
      name: 'Akila Samaranayake',
      job: 'Senior SDET Engineer',
    };

    const response = await request.post('/api/users', {
      data: newUser,
    });

    // 201 = Created
    expect(response.status()).toBe(201);

    const body = await response.json();

    // Verify our data is in the response
    expect(body.name).toBe(newUser.name);
    expect(body.job).toBe(newUser.job);

    // Verify server-generated fields
    expect(body.id).toBeTruthy();
    expect(body.createdAt).toBeTruthy();
  });

  // ──────────────── PUT Requests ────────────────

  test('PUT - should fully update a user', async ({ request }) => {
    const updatedData = {
      name: 'Updated User',
      job: 'Lead Engineer',
    };

    const response = await request.put('/api/users/2', {
      data: updatedData,
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.name).toBe(updatedData.name);
    expect(body.job).toBe(updatedData.job);
    expect(body.updatedAt).toBeTruthy();
  });

  // ──────────────── PATCH Requests ────────────────

  test('PATCH - should partially update a user', async ({ request }) => {
    const partialUpdate = {
      job: 'QA Architect', // Only updating the job
    };

    const response = await request.patch('/api/users/2', {
      data: partialUpdate,
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.job).toBe('QA Architect');
    expect(body.updatedAt).toBeTruthy();
  });

  // ──────────────── DELETE Requests ────────────────

  test('DELETE - should remove a user', async ({ request }) => {
    const response = await request.delete('/api/users/2');

    // 204 = No Content (successfully deleted, no body returned)
    expect(response.status()).toBe(204);
  });

  // ──────────────── Response Details ────────────────

  test('should inspect response headers', async ({ request }) => {
    const response = await request.get('/api/users/2');

    // Check headers
    expect(response.headers()['content-type']).toContain('application/json');
    expect(response.statusText()).toBe('OK');

    // Log for debugging
    console.log('Status:', response.status());
    console.log('Content-Type:', response.headers()['content-type']);
  });
});
