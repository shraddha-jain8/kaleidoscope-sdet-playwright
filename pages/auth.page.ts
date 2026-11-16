
import { Page, expect } from '@playwright/test';
import type { ApplicantData } from '../utils/testData';

export class AuthPage {
  constructor(private readonly page: Page) {}

  async register(data: ApplicantData) {
    // Enter email
    await this.page
      .getByPlaceholder(/email address/i)
      .fill(data.email);

    // Click Next
    await this.page.getByRole('button').first().click();

    // Wait for either signup or existing-account password screen
    const signupPassword = this.page.getByLabel('Create a Password');
    const loginPassword = this.page.getByLabel('Enter Your Password');

    await expect(
      signupPassword.or(loginPassword)
    ).toBeVisible({ timeout: 20000 });

    if (await loginPassword.isVisible().catch(() => false)) {
      console.log('Existing account detected. Signing in.');

      await loginPassword.fill(data.password);

      await this.page.getByRole('button', {
        name: /sign in/i
      }).click();

    } else {
      console.log('New account detected. Registering.');

      await this.page.getByLabel('First Name').fill(data.firstName);
      await this.page.getByLabel('Last Name').fill(data.lastName);
      await this.page.getByPlaceholder(/702/).fill(data.phone);
      await signupPassword.fill(data.password);

      await this.page
        .getByLabel(/I confirm that I am at least 13 years old/i)
        .check();

      await this.page.getByRole('button', {
        name: /submit/i
      }).click();
    }

    // Verify successful authentication
    await expect(
      this.page.getByText('Applications', { exact: true }).first()
    ).toBeVisible({ timeout: 30000 });

    console.log('Successfully authenticated.');
    console.log('Current URL:', this.page.url());
  }
}
