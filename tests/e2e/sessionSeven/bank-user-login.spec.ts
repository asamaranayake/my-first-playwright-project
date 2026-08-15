// import { test } from '../../../fixtures/bank-auth-fixtures';

import { test} from '@playwright/test';
import { BankDashBoard } from '../../../src/pages/bank-auth/BankDashBoard';


test.describe.only('Bank Dashboard Tests', () => {
    test('Verify account overview section is visible', async ({ page }) => {
        // Create a new page in the bank context
        const bankDashBoard = new BankDashBoard(page);
        await bankDashBoard.goto();
        await bankDashBoard.verifyAccountOverviewSection();
    });
});