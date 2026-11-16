
import { Page, expect } from '@playwright/test';
import { fillByLabel, clickContinue } from './helpers';
import type { ApplicantData } from '../utils/testData';

export class ApplicationPage {
  constructor(private readonly page: Page) {}

  // PAGE 1: Applicant Details
  async fillPage1(data: ApplicantData) {
    await fillByLabel(this.page, /address/i, data.address);
    await fillByLabel(this.page, /city/i, data.city);
    await fillByLabel(this.page, /state/i, data.state);
    await fillByLabel(
      this.page,
      /zip|postal code/i,
      data.postalCode
    );

    const country = this.page.getByPlaceholder(
      /enter your country/i
    );

    await country.click();
    await country.fill('India');

    const indiaOption = this.page.getByRole('option', {
      name: 'India',
      exact: true
    });

    await expect(indiaOption).toBeVisible();
    await indiaOption.click();
    await country.press('Tab');

    await expect(country).toHaveValue('India');

    await clickContinue(this.page);

    await expect(
      this.page.getByText('Extracurricular Activities', {
        exact: true
      }).first()
    ).toBeVisible({ timeout: 20000 });
  }

  async completeFirstPage(data: ApplicantData) {
    await this.fillPage1(data);
  }

  // CONTRIBUTOR REQUEST
  async validateMinimumTwoActivities() {
    const addContributorButton = this.page.getByRole(
      'button',
      { name: /add contributor/i }
    );

    await expect(addContributorButton).toBeVisible();
    await addContributorButton.click();

    const firstName = this.page.getByPlaceholder('First Name');
    const lastName = this.page.getByPlaceholder('Last Name');

    await expect(firstName).toBeVisible();

    await firstName.fill('Automation');
    await lastName.fill('Contributor');

    const emailFields = this.page.getByPlaceholder('Email Address');
    const contributorEmail = 'sdet.contributor@example.com';

    await emailFields.nth(0).fill(contributorEmail);
    await emailFields.nth(1).fill(contributorEmail);

    await this.page.locator('textarea:visible').last().fill(
      'Please provide feedback and support for my scholarship application. Thank you.'
    );

    await this.page.getByRole('button', {
      name: /^add$/i
    }).click();

    await expect(firstName).not.toBeVisible({
      timeout: 10000
    });

    await expect(
      this.page.getByText('Automation', { exact: true })
    ).toBeVisible();

    console.log('Contributor successfully added.');
  }

  // PAGE 2: EXTRACURRICULAR ACTIVITIES
  async provideFourActivities(activities: string[]) {
    console.log('Activity count:', activities.length);

    await expect(
      this.page.getByRole('button', {
        name: 'Add Entry',
        exact: true
      })
    ).toBeVisible();

    // Open the activity entry form
    await this.page.getByRole('button', {
      name: 'Add Entry',
      exact: true
    }).click();

    await this.page.waitForTimeout(1000);

    console.log('PAGE AFTER ADD ENTRY:');
    console.log(
      await this.page.locator('body').innerText()
    );

    console.log('VISIBLE INPUT FIELDS:');

    const fields = await this.page.locator(
      'input:visible, textarea:visible, select:visible'
    ).evaluateAll(elements =>
      elements.map((element, index) => {
        const input = element as HTMLInputElement;

        return {
          index,
          tag: element.tagName,
          name: input.name || '',
          placeholder: input.placeholder || '',
          type: input.type || '',
          value: input.value || ''
        };
      })
    );

    console.log(JSON.stringify(fields, null, 2));

    console.log('VISIBLE BUTTONS:');
    console.log(
      await this.page.locator('button:visible').allTextContents()
    );

    // Diagnostic stop:
    // We need to identify the actual activity form fields
    // before entering the four activities.
  }

  // PAGE 3: Academic Details
  async fillPage3AndUpload(data: ApplicantData) {
    console.log('Academic page fields are not identified yet.');
    console.log('Applicant data available:', data);
    throw new Error(
      'Academic page implementation is pending field inspection.'
    );
  }

  // PAGE 4: Essays
  async validateEssayTypeVisibility() {
    console.log('Essay page implementation is pending field inspection.');
    throw new Error(
      'Essay page implementation is pending field inspection.'
    );
  }

  async selectAnimalsAndSchool(data: ApplicantData) {
    console.log('Essay data available:', {
      animalEssay: data.animalEssay,
      schoolEssay: data.schoolEssay
    });

    throw new Error(
      'Essay entry implementation is pending field inspection.'
    );
  }

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

  // SUBMISSION
  async reviewAndSubmit(data: ApplicantData): Promise<string> {
    console.log('Review and submission implementation is pending.');
    console.log('Applicant:', data.email);

    throw new Error(
      'Review and submission implementation is pending field inspection.'
    );
  }

  async submitApplication() {
    await this.page.getByRole('button', {
      name: /submit/i
    }).click();
  }

  async validateSubmittedApplicationCannotBeEdited(
    reviewUrl: string
  ) {
    await this.page.goto(reviewUrl);

    await expect(
      this.page.getByText(/submitted|locked/i).first()
    ).toBeVisible({ timeout: 20000 });
  }

  async verifyApplicationLocked() {
    await expect(
      this.page.getByText(/submitted|locked/i).first()
    ).toBeVisible({ timeout: 20000 });
  }
}
