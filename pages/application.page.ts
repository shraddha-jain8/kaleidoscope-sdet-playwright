
import { Page, expect } from '@playwright/test';
import { fillByLabel, clickContinue } from './helpers';
import type { ApplicantData } from '../utils/testData';

export class ApplicationPage {
  constructor(private readonly page: Page) {}

  async fillPage1(data: ApplicantData) {
    await fillByLabel(this.page, /address/i, data.address);
    await fillByLabel(this.page, /city/i, data.city);
    await fillByLabel(this.page, /state/i, data.state);
    await fillByLabel(this.page, /zip|postal code/i, data.postalCode);

    // Select Country from the dropdown.
    const country = this.page.getByPlaceholder(/enter your country/i);

    await country.click();
    await country.fill('India');

    const indiaOption = this.page.getByRole('option', {
      name: 'India',
      exact: true
    });

    await expect(indiaOption).toBeVisible();
    await indiaOption.click();

    // Ensure dropdown is closed before clicking Next Page.
    await expect(indiaOption).toBeHidden();

    await clickContinue(this.page);
  }

  async completeFirstPage(data: ApplicantData) {
    await this.fillPage1(data);
  }

  async validateMinimumTwoActivities() {
    const addContributorButton = this.page.getByRole('button', {
      name: /add contributor/i
    });

    await expect(addContributorButton).toBeVisible();
    await addContributorButton.click();

    await expect(
      this.page.getByPlaceholder('First Name')
    ).toBeVisible();

    await this.page.getByPlaceholder('First Name').fill('Automation');
    await this.page.getByPlaceholder('Last Name').fill('Contributor');

    const contributorEmail = 'sdet.contributor@example.com';
    const emailFields = this.page.getByPlaceholder('Email Address');

    await emailFields.nth(0).fill(contributorEmail);
    await emailFields.nth(1).fill(contributorEmail);

    await this.page.locator('textarea:visible').last().fill(
      'Please provide feedback and support for my scholarship application. Thank you.'
    );

    await this.page.getByRole('button', {
      name: /^add$/i
    }).click();

    console.log('Contributor request added successfully.');
    console.log(
      'CURRENT PAGE:',
      await this.page.locator('body').innerText()
    );
  }

  async provideFourActivities(activities: string[]) {
    console.log('Activity data received:', activities.length);

    const nextButton = this.page.getByRole('button', {
      name: /next page/i
    });

    await expect(nextButton).toBeVisible();
    await nextButton.click();

    await this.page.waitForTimeout(1500);

    console.log('NEXT APPLICATION PAGE URL:', this.page.url());
    console.log(
      'NEXT APPLICATION PAGE TEXT:',
      await this.page.locator('body').innerText()
    );

    console.log(
      'NEXT PAGE FORM FIELDS:',
      await this.page
        .locator('input:visible, textarea:visible, select:visible')
        .evaluateAll(elements =>
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
      'NEXT PAGE BUTTONS:',
      await this.page.locator('button:visible').allTextContents()
    );

    throw new Error(
      'Diagnostic checkpoint: inspect the next application page.'
    );
  }

  async completeEssays(data: ApplicantData) {
    await fillByLabel(this.page, /animal|animals/i, data.animalEssay);
    await fillByLabel(this.page, /school|education/i, data.schoolEssay);

    await clickContinue(this.page);
  }

  async submitApplication() {
    await this.page.getByRole('button', {
      name: /submit/i
    }).click();
  }

  async verifyApplicationLocked() {
    await expect(
      this.page.getByText(/submitted|locked/i).first()
    ).toBeVisible({ timeout: 20000 });
  }
}
