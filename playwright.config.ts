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
    // Headless mode: true = no browser window, false = see browser
    headless: false,
    
    // Slow down browser actions (in milliseconds) - useful for watching tests
    // Set to 0 for maximum speed, increase to slow down (e.g., 500, 1000)
    launchOptions: {
      slowMo: 0,
    },
    
    // Screenshot on failure
    screenshot: "only-on-failure",
    
    // Video on failure
    video: "retain-on-failure",
    
    // Navigation timeout
    navigationTimeout: 15000,
  },

  // Browser configuration
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
