
import { Page, expect } from '@playwright/test';
import type { ApplicantData } from '../utils/testData';

export class AuthPage {
  constructor(private readonly page: Page) {}

  async register(data: ApplicantData) {
    // Enter applicant email
    await this.page
      .getByPlaceholder(/email address/i)
      .fill(data.email);

    // Continue to registration
    await this.page.getByRole('button').first().click();

    // Wait for signup page
    await expect(this.page).toHaveURL(/signup/);

    // Fill registration details
    await this.page.getByLabel('First Name').fill(data.firstName);
    await this.page.getByLabel('Last Name').fill(data.lastName);
    await this.page.getByPlaceholder(/702/).fill(data.phone);
    await this.page.getByLabel('Create a Password').fill(data.password);

    // Accept mandatory age confirmation
    await this.page
      .getByLabel(/I confirm that I am at least 13 years old/i)
      .check();

    // Submit registration
    await this.page.getByRole('button', { name: /submit/i }).click();

    // Wait for the authenticated application dashboard
    await expect(
      this.page.getByText('Applications', { exact: true }).first()
    ).toBeVisible({ timeout: 20000 });

    console.log('Registration completed successfully.');
    console.log('Current URL:', this.page.url());
  }
}
