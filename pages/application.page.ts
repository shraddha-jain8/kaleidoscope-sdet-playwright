
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

  async completeFirstPage(data: ApplicantData) {
    await this.fillPage1(data);
  }

  // Page 2: Inspect activity fields and validation
  async validateMinimumTwoActivities() {
    console.log('PAGE 2 URL:', this.page.url());

    console.log(
      'PAGE 2 TEXT:',
      await this.page.locator('body').innerText()
    );

    console.log(
      'ALL VISIBLE FORM FIELDS:',
      await this.page.locator(
        'input:visible, textarea:visible, select:visible'
      ).evaluateAll(elements =>
        elements.map((el, index) => {
          const input = el as HTMLInputElement;

          return {
            index,
            tag: el.tagName,
            type: input.type || '',
            name: input.name || '',
            placeholder: input.placeholder || '',
            ariaLabel: el.getAttribute('aria-label'),
            disabled: input.disabled,
            value: input.value || ''
          };
        })
      )
    );

    console.log(
      'BUTTONS:',
      await this.page.locator('button:visible').allTextContents()
    );

    throw new Error(
      'Page 2 diagnostic checkpoint: inspect activity fields.'
    );
  }

  // Page 2: Fill four activities
  async provideFourActivities(activities: string[]) {
    const fields = this.page.locator(
      'textarea:visible:enabled, input:visible:enabled:not([type="hidden"])'
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

  // Verify application is locked
  async verifyApplicationLocked() {
    await expect(
      this.page.getByText(/submitted|locked/i).first()
    ).toBeVisible({ timeout: 20000 });
  }
}
