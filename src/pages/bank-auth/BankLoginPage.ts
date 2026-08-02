import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from '../BasePage';




export class BankLoginPage extends BasePage {


      // ==========================================
      // LOCATORS
      // ==========================================
  
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly errorMessage: Locator;


    constructor(page: Page) {
        super(page);
        this.usernameInput = page.locator('input[name="username"]');
        this.passwordInput = page.locator('input[name="password"]')
        this.loginButton = page.getByRole('button', { name: 'Log In' });
        this.errorMessage = page.locator('.error-message-container');
    }

    // ==========================================
    // NAVIGATION
    // ==========================================

    
    async goto(): Promise<void> {
        await this.navigate('https://parabank.parasoft.com/parabank/index.htm?ConnType=JDBC');
    }

    async login(username: string, password: string): Promise<void> {
        await this.waitAndFill(this.usernameInput, username);
        await this.waitAndFill(this.passwordInput, password);
        await this.waitAndClick(this.loginButton);
    }






}