import { test as setup, expect } from '@playwright/test';
import { BankLoginPage } from '../../../src/pages/bank-auth/BankLoginPage';


setup('authenticate as bank admin user', async ({ page }) => {
     
    const bankAuthFile = 'playwright/.auth/bank-admin.json';
    const bankLoginPage = new BankLoginPage(page);

    // Step 1: Navigate to bank login page
    await bankLoginPage.goto();
    await bankLoginPage.waitForPageLoad();

    // Step 2: Fill in bank admin credentials
    await bankLoginPage.login('testAutomationOne', 'test@123');

    // Step 3: Wait for successful navigation to the bank dashboard
    await bankLoginPage.waitForUrl('**/dashboard');

    // Step 4: Verify login was successful by checking the page title
    await bankLoginPage.verifyTitle(/Bank Dashboard/);

    // Step 5: Save authentication state to file
    await page.context().storageState({ path: bankAuthFile });
});
