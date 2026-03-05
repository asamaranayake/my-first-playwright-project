import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

/**
 * Session 08: CI/CD Integration — Playwright Configuration
 *
 * This config demonstrates CI-optimized settings:
 * - Different reporters for CI vs local
 * - Worker count tuned for CI stability
 * - Retries enabled on CI for flaky test handling
 * - Fail-fast with maxFailures on CI
 * - fullyParallel for balanced shard distribution
 */

// Load .env file for local development
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './tests',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only — catches flaky tests */
  retries: process.env.CI ? 2 : 0,

  /* Limit workers on CI for stability; auto-detect locally */
  workers: process.env.CI ? 1 : undefined,

  /* Stop after N failures on CI to save CI minutes */
  maxFailures: process.env.CI ? 10 : undefined,

  /**
   * Reporter configuration:
   * - CI: blob (for shard merging) + dot (minimal output) + junit (CI integration)
   * - Local: list (verbose) + html (visual report)
   */
  reporter: process.env.CI
    ? [
        ['dot'],
        ['blob'],
        ['junit', { outputFile: 'test-results/junit-results.xml' }],
        ['html', { open: 'on-failure', outputFolder: 'playwright-report' }],
        ['github'],
      ]
    : [
        ['list'],
        ['html', { open: 'on-failure', outputFolder: 'playwright-report' }],
      ],

  /* Shared settings for all projects */
  use: {
    /* Base URL from environment or default */
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',

    /* Collect trace on first retry for debugging CI failures */
    trace: 'on-first-retry',

    /* Take screenshots only on failure to save space */
    screenshot: 'only-on-failure',

    /* Record video only on first retry */
    video: 'on-first-retry',
  },

  /* Configure projects for different browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], headless: true },
    }
  ],
});
