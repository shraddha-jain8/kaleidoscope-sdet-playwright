
import { Page } from '@playwright/test';
import type { ApplicantData } from '../utils/testData';

export class AuthPage {
  constructor(private readonly page: Page) {}

  async register(data: ApplicantData) {
    // Step 1: Enter email on the login page
    const email = this.page.getByPlaceholder(/email address/i);
    await email.fill(data.email);

    // Step 2: Click Next
    await this.page.getByRole('button').first().click();

    // Step 3: Wait for the next screen
    await this.page.waitForTimeout(2000);

    // Step 4: Print the next screen details
    console.log('URL AFTER NEXT:', this.page.url());

    console.log(
      'PAGE AFTER NEXT:',
      await this.page.locator('body').innerText()
    );

    console.log(
      'FIELDS AFTER NEXT:',
      await this.page.locator('input').evaluateAll(elements =>
        elements.map(el => ({
          type: el.getAttribute('type'),
          name: el.getAttribute('name'),
          placeholder: el.getAttribute('placeholder'),
          ariaLabel: el.getAttribute('aria-label')
        }))
      )
    );

    // Temporary checkpoint: remove after inspecting the output
    throw new Error(
      'Registration checkpoint: inspect the next screen before continuing.'
    );
  }
}
