
import { Page, expect } from '@playwright/test';
import type { ApplicantData } from '../utils/testData';

export class AuthPage {
  constructor(private readonly page: Page) {}

  async register(data: ApplicantData) {
    // Step 1: Enter email
    await this.page
      .getByPlaceholder(/email address/i)
      .fill(data.email);

    // Step 2: Click Next
    await this.page.getByRole('button').first().click();

    // Step 3: Verify signup page
    await expect(this.page).toHaveURL(/signup/);

    // Step 4: Fill registration details
    await this.page.getByLabel('First Name').fill(data.firstName);
    await this.page.getByLabel('Last Name').fill(data.lastName);
    await this.page.getByPlaceholder(/702/).fill(data.phone);
    await this.page.getByLabel('Create a Password').fill(data.password);

    // Step 5: Accept age confirmation
    await this.page
      .getByLabel(/I confirm that I am at least 13 years old/i)
      .check();

    // Step 6: Submit
    await this.page.getByRole('button', { name: /submit/i }).click();

    // Step 7: Wait for response
    await this.page.waitForTimeout(3000);

    // Step 8: Print diagnostic information
    console.log('CURRENT URL:', this.page.url());

    console.log(
      'PAGE TEXT AFTER SUBMIT:',
      await this.page.locator('body').innerText()
    );

    console.log(
      'INPUT VALUES:',
      await this.page.locator('input').evaluateAll(elements =>
        elements.map(el => ({
          type: el.getAttribute('type'),
          value: el.getAttribute('type') === 'password'
            ? '[hidden]'
            : (el as HTMLInputElement).value,
          ariaLabel: el.getAttribute('aria-label')
        }))
      )
    );

    console.log(
      'BUTTONS:',
      await this.page.locator('button').allTextContents()
    );

    throw new Error(
      'Registration diagnostic checkpoint: inspect output.'
    );
  }
}
