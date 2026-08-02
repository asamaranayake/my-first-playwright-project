import { test as base, Page, BrowserContext } from '@playwright/test';
import { BankLoginPage } from '../src/pages/bank-auth/bankLoginPage';


interface BankAuthFixtures {
  bankLoginPage: BankLoginPage;
  bankContext: BrowserContext;
  dashboardPage: Page;
}

export const test = base.extend<BankAuthFixtures>({
 
   bankContext: async ({ browser }, use) => {
    // Create a new browser context for bank authentication tests
    const context = await browser.newContext({
      storageState: 'playwright/.auth/bank-admin.json',
    });
    await use(context);
    await context.close();
  },
  
  bankLoginPage: async ({ browser }, use) => {
    // Create a new page in the bank context and instantiate the BankLoginPage
    const context = await browser.newContext();
    const page = await context.newPage();
    const bankLoginPage = new BankLoginPage(page);
    await use(bankLoginPage);
    await context.close();
  },
});