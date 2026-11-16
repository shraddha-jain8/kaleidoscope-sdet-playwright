import { expect, Page } from '@playwright/test';
import { firstVisible } from './helpers';

export class LandingPage {
  constructor(private readonly page: Page) {}
  async open() {
    await this.page.goto('/program/sdet-test-scholarship');
    await expect(this.page).toHaveTitle(/Kaleidoscope|SDET Scholarship/i);
    await expect(this.page.getByText(/SDET Scholarship/i).first()).toBeVisible();
  }
  async startApplication() {
    const cta = await firstVisible([
      this.page.getByRole('button', { name: /apply|start|begin/i }),
      this.page.getByRole('link', { name: /apply|start|begin/i })
    ]);
    await cta.click();
  }
}
