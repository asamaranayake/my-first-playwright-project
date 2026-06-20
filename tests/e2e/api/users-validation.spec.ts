import { test, expect } from '../../../fixtures/api-fixtures';

/**
 * Session 05 - Part 3: Advanced Response Validation
 *
 * Demonstrates multi-level API validation:
 * Level 1: Status codes
 * Level 2: Response structure (fields exist)
 * Level 3: Data values (correct content)
 * Level 4: Business logic (rules are followed)
 */
test.describe('Advanced API Validation', () => {

  // ──────────────── Header Validation ────────────────

  test('should validate response headers', async ({ request }) => {
    const response = await request.get('/api/users/2');

    // Check content type
    expect(response.headers()['content-type']).toContain('application/json');

    // Check response status
    expect(response.ok()).toBeTruthy();
    expect(response.statusText()).toBe('OK');
  });

  // ──────────────── Data Type Validation ────────────────

  test('should validate data types of response fields', async ({ request }) => {
    const response = await request.get('/api/users/2');
    const body = await response.json();

    // Verify types of each field
    expect(typeof body.data.id).toBe('number');
    expect(typeof body.data.email).toBe('string');
    expect(typeof body.data.first_name).toBe('string');
    expect(typeof body.data.last_name).toBe('string');
    expect(typeof body.data.avatar).toBe('string');

    // Verify format patterns
    expect(body.data.email).toContain('@');
    expect(body.data.avatar).toMatch(/^https:\/\//);
    expect(body.data.first_name.length).toBeGreaterThan(0);
    expect(body.data.last_name.length).toBeGreaterThan(0);
  });

  // ──────────────── Array Validation ────────────────

  test('should validate all users in list have correct structure', async ({ request }) => {
    const response = await request.get('/api/users?page=1');
    const body = await response.json();

    expect(body.data.length).toBeGreaterThan(0);

    // Validate EVERY user in the array
    for (const user of body.data) {
      // Structure checks
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('first_name');
      expect(user).toHaveProperty('last_name');
      expect(user).toHaveProperty('avatar');

      // Value checks
      expect(user.id).toBeGreaterThan(0);
      expect(user.email).toContain('@reqres.in');
      expect(user.first_name).toBeTruthy();
      expect(user.last_name).toBeTruthy();
      expect(user.avatar).toMatch(/^https:\/\//);
    }
  });

  // ──────────────── Pagination Logic ────────────────

  test('should validate pagination business logic', async ({ request }) => {
    // Fetch two different pages
    const page1Res = await request.get('/api/users?page=1');
    const body1 = await page1Res.json();

    const page2Res = await request.get('/api/users?page=2');
    const body2 = await page2Res.json();

    // ✅ Correct page numbers
    expect(body1.page).toBe(1);
    expect(body2.page).toBe(2);

    // ✅ Same metadata across pages
    expect(body1.total).toBe(body2.total);
    expect(body1.total_pages).toBe(body2.total_pages);
    expect(body1.per_page).toBe(body2.per_page);

    // ✅ No overlapping user IDs between pages
    const page1Ids = body1.data.map((u: any) => u.id);
    const page2Ids = body2.data.map((u: any) => u.id);

    for (const id of page1Ids) {
      expect(page2Ids).not.toContain(id);
    }

    // ✅ Total users = sum of all pages
    const totalFromPages = body1.data.length + body2.data.length;
    expect(totalFromPages).toBeLessThanOrEqual(body1.total);
  });

  // ──────────────── Error Response Validation ────────────────

  test('should validate 404 error response', async ({ request }) => {
    const response = await request.get('/api/users/99999');

    expect(response.status()).toBe(404);
    expect(response.ok()).toBeFalsy();

    const body = await response.json();
    // reqres.in returns empty object for 404
    expect(Object.keys(body)).toHaveLength(0);
  });

  // ──────────────── Auth Validation ────────────────

  test('should validate successful login', async ({ request }) => {
    const response = await request.post('/api/login', {
      data: {
        email: 'eve.holt@reqres.in',
        password: 'cityslicka',
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('token');
    expect(typeof body.token).toBe('string');
    expect(body.token.length).toBeGreaterThan(0);
  });

  test('should validate login with missing password returns 400', async ({ request }) => {
    const response = await request.post('/api/login', {
      data: {
        email: 'eve.holt@reqres.in',
        // Password intentionally missing
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body).toHaveProperty('error');
    expect(body.error).toBe('Missing password');
  });

  test('should validate registration with missing password returns 400', async ({ request }) => {
    const response = await request.post('/api/register', {
      data: {
        email: 'eve.holt@reqres.in',
        // Password intentionally missing
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body).toHaveProperty('error');
    expect(body.error).toBe('Missing password');
  });

  // ──────────────── POST Response Validation ────────────────

  test('should validate POST response matches request data', async ({ request }) => {
    const payload = {
      name: 'Validation Test User',
      job: 'Test Engineer',
    };

    const response = await request.post('/api/users', {
      data: payload,
    });

    expect(response.status()).toBe(201);

    const body = await response.json();

    // Response should echo back our data
    expect(body.name).toBe(payload.name);
    expect(body.job).toBe(payload.job);

    // Plus auto-generated fields
    expect(body.id).toBeTruthy();
    expect(typeof body.id).toBe('string');
    expect(body.createdAt).toBeTruthy();

    // Validate timestamp format (ISO 8601)
    const timestamp = new Date(body.createdAt);
    expect(timestamp.getTime()).not.toBeNaN();
  });

  // ──────────────── Complete Multi-Level Validation ────────────────

  test('should perform complete multi-level validation', async ({ request }) => {
    const response = await request.get('/api/users/2');

    // Level 1: Status
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    // Level 1.5: Headers
    expect(response.headers()['content-type']).toContain('application/json');

    // Level 2: Structure
    const body = await response.json();
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('support');
    expect(body.data).toHaveProperty('id');
    expect(body.data).toHaveProperty('email');
    expect(body.data).toHaveProperty('first_name');
    expect(body.data).toHaveProperty('last_name');
    expect(body.data).toHaveProperty('avatar');

    // Level 3: Values
    expect(body.data.id).toBe(2);
    expect(body.data.email).toContain('@');
    expect(body.data.first_name).toBeTruthy();
    expect(body.data.last_name).toBeTruthy();
    expect(body.data.avatar).toMatch(/^https:\/\//);

    // Level 4: Business Logic
    expect(typeof body.data.id).toBe('number');
    expect(body.data.id).toBeGreaterThan(0);
    expect(body.support.url).toContain('https://');
    expect(body.support.text).toBeTruthy();
  });
});
