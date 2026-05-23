import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  
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
    baseURL: 'https://reqres.in',

    // Extra HTTP headers sent with every request
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'x-api-key': process.env.REQRES_API_KEY ?? 'free_user_3E75Ai3rComzXI0NWpSXIL6LG7b',
    },
  },

  // Browser configuration
  projects: [

    {
      name: 'api-tests',
      testMatch: /.*\/(users-basic|users-crud|users-validation)\.spec\.ts/,
      use: {
        // API-only tests don't need a browser
      },
    },
    // {
    //   name: "chromium",
    //   use: { ...devices["Desktop Chrome"] },
    // },
  ],
});
