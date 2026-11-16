
import { Page, expect } from '@playwright/test';
import type { ApplicantData } from '../utils/testData';

export class AuthPage {
  constructor(private readonly page: Page) {}

  async register(data: ApplicantData) {
    // Step 1: Enter email on the login page
    await this.page
      .getByPlaceholder(/email address/i)
      .fill(data.email);

    // Step 2: Click Next
    await this.page.getByRole('button').first().click();

    // Step 3: Wait for signup page
    await expect(this.page).toHaveURL(/signup/);

    // Step 4: Fill registration details
    await this.page.getByLabel('First Name').fill(data.firstName);
    await this.page.getByLabel('Last Name').fill(data.lastName);
    await this.page.getByPlaceholder(/702/).fill(data.phone);
    await this.page.getByLabel('Create a Password').fill(data.password);

    // Step 5: Accept mandatory age confirmation
    await this.page
      .getByLabel(/I confirm that I am at least 13 years old/i)
      .check();

    // Step 6: Submit registration
    await this.page
      .getByRole('button', { name: /submit/i })
      .click();

    // Step 7: Wait for signup form to disappear
    await expect(
      this.page.getByLabel('First Name')
    ).toBeHidden({ timeout: 15000 });

    // Step 8: Print registration result
    console.log('URL AFTER REGISTRATION:', this.page.url());

    console.log(
      'PAGE AFTER REGISTRATION:',
      await this.page.locator('body').innerText()
    );
  }
}
