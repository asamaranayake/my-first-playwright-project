import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from '../BasePage';


export class BankDashBoard extends BasePage {

    // ==========================================
    // LOCATORS
    // ==========================================

    readonly accountOverviewSection: Locator;

    constructor(page: Page) {
        super(page);
        this.accountOverviewSection = page.locator('#account-overview');
    }

    // ==========================================
    // NAVIGATION
    // ==========================================

    async goto(): Promise<void> {
        await this.navigate('https://parabank.parasoft.com/parabank/overview.htm');
    }

    async verifyAccountOverviewSection(): Promise<void> {
        await expect(this.accountOverviewSection).toBeVisible();
    }
}