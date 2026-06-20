import { test, expect } from '@playwright/test';

/**
 * Session 05 - Part 4: Combined UI + API Testing
 *
 * Demonstrates the power of using both `request` (API) and `page` (UI)
 * together in the same test for speed and comprehensive coverage.
 *
 * Patterns:
 * 1. API Setup → UI Verification
 * 2. UI Action → API Verification
 * 3. API Auth → Skip UI Login
 * 4. Parallel API + UI Checks
 */
test.describe('Combined UI + API Testing', () => {

  // ──────────────── Pattern 1: API Setup → UI Test ────────────────

  test('should setup data via API then verify in UI', async ({ request, page }) => {
    // ⚡ FAST: Create test data via API (no browser needed)
    const createResponse = await request.post('https://reqres.in/api/users', {
      data: {
        name: 'Combined Test User',
        job: 'Automation Specialist',
      },
    });
    expect(createResponse.status()).toBe(201);
    const userData = await createResponse.json();
    console.log(`⚡ Created user ${userData.id} via API`);

    // 🖥️ THEN: Perform UI verification
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    // Verify UI is working
    await expect(page).toHaveURL(/inventory/);
    await expect(page.locator('.title')).toHaveText('Products');
    console.log('🖥️ UI verification passed after API setup');
  });

  // ──────────────── Pattern 2: UI Action → API Verify ────────────────

  test('should perform UI action then verify via API', async ({ request, page }) => {
    // 🖥️ Step 1: Perform UI action
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    await expect(page).toHaveURL(/inventory/);

    // Add item to cart via UI
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    const cartBadge = page.locator('.shopping_cart_badge');
    await expect(cartBadge).toHaveText('1');
    console.log('🖥️ Added item to cart via UI');

    // ⚡ Step 2: Verify backend is healthy via API
    const apiCheck = await request.get('https://reqres.in/api/users/1');
    expect(apiCheck.status()).toBe(200);
    console.log('⚡ Backend API health check passed');
  });

  // ──────────────── Pattern 3: API Auth → Skip UI Login ────────────────

  test('should authenticate via API and use token', async ({ request }) => {
    // ⚡ Step 1: Login via API (skip slow UI login)
    const loginResponse = await request.post('https://reqres.in/api/login', {
      data: {
        email: 'eve.holt@reqres.in',
        password: 'cityslicka',
      },
    });
    expect(loginResponse.status()).toBe(200);

    const { token } = await loginResponse.json();
    expect(token).toBeTruthy();
    console.log(`⚡ Got auth token: ${token}`);

    // ⚡ Step 2: Use token for authenticated requests
    const protectedResponse = await request.get('https://reqres.in/api/users/2', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(protectedResponse.status()).toBe(200);

    const user = await protectedResponse.json();
    expect(user.data.id).toBe(2);
    console.log(`⚡ Accessed protected resource: ${user.data.email}`);
  });

  // ──────────────── Pattern 4: Parallel Verification ────────────────

  test('should verify both API and UI are serving correct data', async ({ request, page }) => {
    // ⚡ API: Check user data is available
    const apiResponse = await request.get('https://reqres.in/api/users?page=1');
    expect(apiResponse.status()).toBe(200);
    const apiData = await apiResponse.json();
    const totalUsers = apiData.total;
    console.log(`⚡ API reports ${totalUsers} total users`);

    // 🖥️ UI: Verify SauceDemo has products
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    const productCount = await page.locator('.inventory_item').count();
    console.log(`🖥️ UI shows ${productCount} products`);

    // Both systems are up and returning data
    expect(totalUsers).toBeGreaterThan(0);
    expect(productCount).toBeGreaterThan(0);
    console.log('✅ Both API and UI verified successfully');
  });

  // ──────────────── Full E2E: API + UI + API ────────────────

  test('should run full E2E: API setup → UI test → API verify', async ({ request, page }) => {
    // ════════════════════════════════════════════
    // STEP 1: Setup test data via API (FAST ⚡)
    // ════════════════════════════════════════════
    const createResponse = await request.post('https://reqres.in/api/users', {
      data: { name: 'E2E Test User', job: 'QA Engineer' },
    });
    expect(createResponse.status()).toBe(201);
    const testUser = await createResponse.json();
    console.log(`⚡ Step 1: Created test user ${testUser.id}`);

    // ════════════════════════════════════════════
    // STEP 2: Perform UI actions (what we're testing)
    // ════════════════════════════════════════════
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();

    await expect(page).toHaveURL(/inventory/);

    // Add to cart and verify
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    console.log('🖥️ Step 2: UI actions completed');

    // ════════════════════════════════════════════
    // STEP 3: Verify via API (backend state check)
    // ════════════════════════════════════════════
    const verifyResponse = await request.get('https://reqres.in/api/users/1');
    expect(verifyResponse.status()).toBe(200);
    console.log('⚡ Step 3: Backend verified');

    console.log('🎉 Full E2E cycle complete: API → UI → API');
  });
});
