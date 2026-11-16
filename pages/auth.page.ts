
import { Page } from '@playwright/test';
import type { ApplicantData } from '../utils/testData';

export class AuthPage {
  constructor(private readonly page: Page) {}

  async register(data: ApplicantData) {
    // Open login page and enter email
    await this.page
      .getByPlaceholder(/email address/i)
      .fill(data.email);

    console.log('EMAIL USED:', data.email);

    // Click Next
    await this.page.getByRole('button').first().click();

    // Wait for the application response
    await this.page.waitForTimeout(3000);

    // Print diagnostic details
    console.log('URL AFTER NEXT:', this.page.url());

    console.log(
      'PAGE TEXT AFTER NEXT:',
      await this.page.locator('body').innerText()
    );

    console.log(
      'INPUT DETAILS:',
      await this.page.locator('input').evaluateAll(elements =>
        elements.map(el => ({
          type: el.getAttribute('type'),
          placeholder: el.getAttribute('placeholder'),
          ariaLabel: el.getAttribute('aria-label'),
          value: el.getAttribute('type') === 'password'
            ? '[hidden]'
            : (el as HTMLInputElement).value
        }))
      )
    );

    console.log(
      'BUTTON DETAILS:',
      await this.page.locator('button').allTextContents()
    );

    throw new Error('Login diagnostic checkpoint.');
  }
}
