import { Page } from '@playwright/test';
import { fillByLabel, firstVisible } from './helpers';
import type { ApplicantData } from '../utils/testData';

export class AuthPage {
  constructor(private readonly page: Page) {}
  async register(data: ApplicantData) {
    const register = await firstVisible([
      this.page.getByRole('link', { name: /register|sign up|create account/i }),
      this.page.getByRole('button', { name: /register|sign up|create account/i })
    ]);
    await register.click();
    
await this.page.waitForLoadState('domcontentloaded');

console.log('CURRENT URL:', this.page.url());

console.log(
  'PAGE TEXT:',
  await this.page.locator('body').innerText()
);

console.log(
  'LINKS:',
  await this.page.locator('a').allTextContents()
);

console.log(
  'BUTTONS:',
  await this.page.locator('button').allTextContents()
);

    await fillByLabel(this.page, /first name/i, data.firstName);
    await fillByLabel(this.page, /last name/i, data.lastName);
    await fillByLabel(this.page, /email/i, data.email);
    await fillByLabel(this.page, /^password/i, data.password);
    const confirm = this.page.getByLabel(/confirm password/i);
    if (await confirm.count()) await confirm.fill(data.password);
    await this.page.getByRole('button', { name: /register|sign up|create account/i }).click();
  }
}
