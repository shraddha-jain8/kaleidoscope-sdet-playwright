
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

  // Page 1: Add contributor request
  async addContributorRequest() {
    await this.page.getByRole('button', {
      name: /add contributor/i
    }).click();

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

  // Navigate to Extracurricular Activities
  async goToActivitiesPage() {
    const previousUrl = this.page.url();

    await this.page.getByRole('button', {
      name: /next page/i
    }).click();

    await expect.poll(
      () => this.page.url(),
      { timeout: 30000 }
    ).not.toBe(previousUrl);

    const pageTitle = this.page.getByTestId('page-title');

    await expect(pageTitle).toBeVisible();
    await expect(pageTitle).toHaveText(/Extracurricular Activities/i);

    console.log('Successfully navigated to Extracurricular Activities.');
    console.log('Current URL:', this.page.url());
  }

  // Add one extracurricular activity
  async addActivity(
    name: string,
    years: string,
    leadership: string,
    description: string
  ) {
    await this.page.getByRole('button', {
      name: /add entry/i
    }).click();

    const activityName = this.page.getByPlaceholder('Short Input');
    const yearsInvolved = this.page.getByPlaceholder('123');
    const textAreas = this.page.locator('textarea:visible');

    await expect(activityName).toBeVisible();

    await activityName.fill(name);
    await yearsInvolved.fill(years);
    await textAreas.nth(0).fill(leadership);
    await textAreas.nth(1).fill(description);

    await this.page.getByRole('button', {
      name: /^add$/i
    }).click();

    await expect(activityName).not.toBeVisible({ timeout: 10000 });

    await expect(
      this.page.getByText(name, { exact: true })
    ).toBeVisible({ timeout: 10000 });

    console.log(`Activity added: ${name}`);
  }

  // Add two required extracurricular activities
  async addTwoActivities() {
    await this.addActivity(
      'Robotics Club',
      '2',
      'Served as Team Leader and received recognition for project participation.',
      'Participated in robotics projects, collaborated with team members, designed solutions, and helped prepare the team for school competitions.'
    );

    await this.addActivity(
      'Community Tutoring',
      '2',
      'Volunteered as a student tutor and supported younger students.',
      'Provided academic support to younger students, helped them understand lessons, and participated in community learning activities.'
    );

    console.log('Two extracurricular activities added.');
  }

  // Navigate to the next application page
  async goToNextPage() {
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

    console.log('Successfully navigated to the next application page.');
    console.log('Next page URL:', this.page.url());

    const pageTitle = this.page.getByTestId('page-title');

    if (await pageTitle.isVisible().catch(() => false)) {
      console.log('NEXT PAGE TITLE:', await pageTitle.innerText());
    }

    console.log('NEXT PAGE CONTENT:');
    console.log(await this.page.locator('body').innerText());
  }

  // Inspect High School Information page
  async inspectHighSchoolPage() {
    const pageTitle = this.page.getByTestId('page-title');

    await expect(pageTitle).toBeVisible();
    await expect(pageTitle).toContainText(/High School Information/i);

    console.log('HIGH SCHOOL PAGE TITLE:');
    console.log(await pageTitle.innerText());

    const fields = await this.page.locator(
      'input:visible, textarea:visible, select:visible'
    ).evaluateAll(elements =>
      elements.map(element => {
        const field = element as HTMLInputElement;

        return {
          tag: field.tagName,
          type: field.type,
          placeholder: field.placeholder,
          name: field.name,
          required: field.required,
          ariaLabel: field.getAttribute('aria-label')
        };
      })
    );

    console.log('HIGH SCHOOL FORM FIELDS:');
    console.log(JSON.stringify(fields, null, 2));

    const fileInputs = await this.page.locator(
      'input[type="file"]'
    ).evaluateAll(elements =>
      elements.map(element => {
        const field = element as HTMLInputElement;

        return {
          name: field.name,
          accept: field.accept,
          multiple: field.multiple,
          required: field.required
        };
      })
    );

    console.log('TRANSCRIPT FILE INPUTS:');
    console.log(JSON.stringify(fileInputs, null, 2));

    console.log('HIGH SCHOOL BUTTONS:');
    console.log(
      await this.page.locator('button:visible').allTextContents()
    );

    console.log('HIGH SCHOOL PAGE CONTENT:');
    console.log(await this.page.locator('body').innerText());
  }
}
