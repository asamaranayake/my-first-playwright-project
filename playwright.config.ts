import path from "path";
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: path.resolve(__dirname, "tests"),

  // Test execution speed settings
  timeout: 30000, // 30 seconds per test
  fullyParallel: true, // Run tests in parallel (faster)
  workers: 3, // Number of parallel workers (adjust based on your CPU)

  // Retry failed tests
  retries: 1,

  // Reporter
  reporter: "html",

  // Global test settings
  use: {

    // Required for downloads
    acceptDownloads: true,

    // Headless mode: true = no browser window, false = see browser
    headless: false,

    // Slow down browser actions (in milliseconds) - useful for watching tests
    // Set to 0 for maximum speed, increase to slow down (e.g., 500, 1000)
    launchOptions: {
      slowMo: 1000,
    },

    // Screenshot on failure
    screenshot: "only-on-failure",

    // Video on failure
    video: "retain-on-failure",

    // Navigation timeout
    navigationTimeout: 15000,

    // Base URL for API requests (reqres.in)
    //baseURL: 'https://reqres.in',
    
    // Base URL for the demo mocking site
    baseURL: 'https://www.saucedemo.com',

    // Extra HTTP headers sent with every request
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'x-api-key': 'reqres-free-v1',
    },
  },

  // Browser configuration
  projects: [
    // ──────────────────────────────────────────────
    // SETUP PROJECTS: Run first to create auth state
    // ──────────────────────────────────────────────
    {
      name: 'admin-setup',
      testMatch: /.*admin\.setup\.ts/,
    },
    {
      name: 'user-setup',
      testMatch: /.*user\.setup\.ts/,
    },

    {
      name: 'bank-user-setup',
      testMatch: /.*bank\.setup\.ts/,

    },

    // ──────────────────────────────────────────────
    // TEST PROJECTS: Use saved auth state
    // ──────────────────────────────────────────────

    // Admin tests — uses admin.json auth state
    {
      name: 'admin-tests',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/admin.json',
      },
      dependencies: ['admin-setup'],
      testMatch: /.*admin.*\.spec\.ts/,
    },

    // User tests — uses user.json auth state
    {
      name: 'user-tests',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['user-setup'],
      testMatch: /.*user.*\.spec\.ts/,
    },

    // Login page tests — NO auth (clean state)
    {
      name: 'login-tests',
      use: {
        ...devices['Desktop Chrome'],
        // Start with empty state — no cookies, no localStorage
        storageState: { cookies: [], origins: [] },
      },
      testMatch: /.*login.*\.spec\.ts/,
    },

    // API tests — runs request-based examples such as GraphQL and gRPC samples
    {
      name: 'api-tests',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: /.*api.*\.spec\.ts/,
    },

    // Multi-role tests — depend on BOTH setups
    {
      name: 'multi-role-tests',
      use: {
        ...devices['Desktop Chrome'],
      },
      dependencies: ['admin-setup', 'user-setup'],
      testMatch: /.*multi-role.*\.spec\.ts/,
    },

    // Bank user tests — uses bank-admin.json auth state
    {
      name: 'bank-user-tests',
      use: {
        ...devices['Desktop Chrome']
      },
      dependencies: ['bank-user-setup'],
      testMatch: /.*bank-user.*\.spec\.ts/,
    },
  ],
});
