
import { Page, expect } from '@playwright/test';
import { fillByLabel, clickContinue } from './helpers';
import type { ApplicantData } from '../utils/testData';

export class ApplicationPage {
  constructor(private readonly page: Page) {}

  // Page 1: Applicant details
  async fillPage1(data: ApplicantData) {
    await fillByLabel(this.page, /address/i, data.address);
    await fillByLabel(this.page, /city/i, data.city);
    await fillByLabel(this.page, /state/i, data.state);
    await fillByLabel(
      this.page,
      /zip|postal code/i,
      data.postalCode
    );

    await clickContinue(this.page);
  }

  // Alias for compatibility
  async completeFirstPage(data: ApplicantData) {
    await this.fillPage1(data);
  }

  // Page 2: Validate minimum two activities
  async validateMinimumTwoActivities() {
    const usable = this.page.locator(
      'textarea:visible, input:not([type="hidden"]):visible'
    );

    if (await usable.count()) {
      await usable.first().fill('Robotics Club');
    }

    await clickContinue(this.page);
    await this.page.waitForTimeout(2000);

    console.log(
      'URL AFTER ACTIVITIES VALIDATION:',
      this.page.url()
    );

    console.log(
      'PAGE TEXT AFTER ACTIVITIES VALIDATION:',
      await this.page.locator('body').innerText()
    );

    console.log(
      'VISIBLE INPUTS:',
      await this.page.locator(
        'input:visible, textarea:visible'
      ).evaluateAll(elements =>
        elements.map(el => ({
          tag: el.tagName,
          type: el.getAttribute('type'),
          placeholder: el.getAttribute('placeholder'),
          label: el.getAttribute('aria-label'),
          value: (el as HTMLInputElement).value
        }))
      )
    );

    throw new Error(
      'Activities validation diagnostic checkpoint.'
    );
  }

  // Page 2: Provide four activities
  async provideFourActivities(activities: string[]) {
    const fields = this.page.locator(
      'textarea:visible, input:not([type="hidden"]):visible'
    );

    for (let i = 0; i < activities.length; i++) {
      await fields.nth(i).fill(activities[i]);
    }

    await clickContinue(this.page);
  }

  // Essay questions
  async completeEssays(data: ApplicantData) {
    await fillByLabel(
      this.page,
      /animal|animals/i,
      data.animalEssay
    );

    await fillByLabel(
      this.page,
      /school|education/i,
      data.schoolEssay
    );

    await clickContinue(this.page);
  }

  // Submit application
  async submitApplication() {
    await this.page.getByRole('button', {
      name: /submit/i
    }).click();
  }

  // Verify application is submitted and locked
  async verifyApplicationLocked() {
    await expect(
      this.page.getByText(/submitted|locked/i).first()
    ).toBeVisible({ timeout: 20000 });
  }
}
