
import { Page, expect } from '@playwright/test';
import { fillByLabel } from './helpers';
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

    const country = this.page.getByPlaceholder(/enter your country/i);

    await country.click();
    await country.fill('India');

    const indiaOption = this.page.getByRole('option', {
      name: 'India',
      exact: true
    });

    await expect(indiaOption).toBeVisible({ timeout: 10000 });
    await indiaOption.click();
    await country.press('Tab');

    await expect(country).toHaveValue('India');

    console.log('Applicant details filled.');
  }

  // Page 1: Add the required contributor request
  async addContributorRequest() {
    const addContributorButton = this.page.getByRole('button', {
      name: /add contributor/i
    });

    await expect(addContributorButton).toBeVisible();
    await addContributorButton.click();

    const firstName = this.page.getByPlaceholder('First Name');
    const lastName = this.page.getByPlaceholder('Last Name');
    const emailFields = this.page.getByPlaceholder('Email Address');

    await expect(firstName).toBeVisible();

    await firstName.fill('Automation');
    await lastName.fill('Contributor');

    const contributorEmail = 'sdet.contributor@example.com';

    await emailFields.nth(0).fill(contributorEmail);
    await emailFields.nth(1).fill(contributorEmail);

    await this.page.locator('textarea:visible').last().fill(
      'Please provide feedback and support for my scholarship application. Thank you.'
    );

    await this.page.getByRole('button', {
      name: /^add$/i
    }).click();

    await expect(firstName).not.toBeVisible({ timeout: 10000 });

    await expect(
      this.page.getByText('Automation', { exact: true })
    ).toBeVisible();

    console.log('Contributor request added.');
  }

  // Navigate from applicant details to extracurricular activities
  async goToActivitiesPage() {
    const previousUrl = this.page.url();

    const nextButton = this.page.getByRole('button', {
      name: /next page/i
    });

    await expect(nextButton).toBeVisible();
    await nextButton.click();

    await expect.poll(
      () => this.page.url(),
      { timeout: 30000 }
    ).not.toBe(previousUrl);

    const pageTitle = this.page.getByTestId('page-title');

    await expect(pageTitle).toBeVisible({ timeout: 20000 });
    await expect(pageTitle).toHaveText(/Extracurricular Activities/i);

    console.log('Successfully navigated to Extracurricular Activities.');
    console.log('Current URL:', this.page.url());
  }
}
