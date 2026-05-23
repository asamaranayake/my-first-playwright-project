import { test, expect } from '../../../fixtures/api-fixtures';
import { HttpStatusCodes } from '../../../src/api/HttpStatusCodes';
import {
  CreateUserResponse,
  LoginResponse,
  SingleUserResponse,
  UserListResponse,
} from '../../../src/api/UsersAPI';

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

  test('should setup data via API then verify in UI', async ({ usersAPI, page }) => {
    // ⚡ FAST: Create test data via API (no browser needed)
    const createResponse = await usersAPI.createUser({
      name: 'Combined Test User',
      job: 'Automation Specialist',
    });
    expect(createResponse.status()).toBe(HttpStatusCodes.CREATED);
    const userData = await usersAPI.getResponseBody<CreateUserResponse>(createResponse);
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

  test('should perform UI action then verify via API', async ({ usersAPI, page }) => {
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
    const apiCheck = await usersAPI.getUserById(1);
    expect(apiCheck.status()).toBe(HttpStatusCodes.OK);
    console.log('⚡ Backend API health check passed');
  });

  // ──────────────── Pattern 3: API Auth → Skip UI Login ────────────────

  test('should authenticate via API and use token', async ({ usersAPI }) => {
    // ⚡ Step 1: Login via API (skip slow UI login)
    const loginResponse = await usersAPI.login('eve.holt@reqres.in', 'cityslicka');
    expect(loginResponse.status()).toBe(HttpStatusCodes.OK);

    const { token } = await usersAPI.getResponseBody<LoginResponse>(loginResponse);
    expect(token).toBeTruthy();
    console.log(`⚡ Got auth token: ${token}`);

    // ⚡ Step 2: Use token for authenticated requests
    const protectedResponse = await usersAPI.getUserById(2, {
      Authorization: `Bearer ${token}`,
    });
    expect(protectedResponse.status()).toBe(HttpStatusCodes.OK);

    const user = await usersAPI.getResponseBody<SingleUserResponse>(protectedResponse);
    expect(user.data.id).toBe(2);
    console.log(`⚡ Accessed protected resource: ${user.data.email}`);
  });

  // ──────────────── Pattern 4: Parallel Verification ────────────────

  test('should verify both API and UI are serving correct data', async ({ usersAPI, page }) => {
    // ⚡ API: Check user data is available
    const apiResponse = await usersAPI.getUsers(1);
    expect(apiResponse.status()).toBe(HttpStatusCodes.OK);
    const apiData = await usersAPI.getResponseBody<UserListResponse>(apiResponse);
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

  test('should run full E2E: API setup → UI test → API verify', async ({ usersAPI, page }) => {
    // ════════════════════════════════════════════
    // STEP 1: Setup test data via API (FAST ⚡)
    // ════════════════════════════════════════════
    const createResponse = await usersAPI.createUser({
      name: 'E2E Test User',
      job: 'QA Engineer',
    });
    expect(createResponse.status()).toBe(HttpStatusCodes.CREATED);
    const testUser = await usersAPI.getResponseBody<CreateUserResponse>(createResponse);
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
    const verifyResponse = await usersAPI.getUserById(1);
    expect(verifyResponse.status()).toBe(HttpStatusCodes.OK);
    console.log('⚡ Step 3: Backend verified');

    console.log('🎉 Full E2E cycle complete: API → UI → API');
  });
});
