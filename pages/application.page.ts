
import { Page, expect } from '@playwright/test';
import { fillByLabel } from './helpers';
import type { ApplicantData } from '../utils/testData';

export class ApplicationPage {
  constructor(private readonly page: Page) {}

  async fillPage1(data: ApplicantData) {
    await fillByLabel(this.page, /address/i, data.address);
    await fillByLabel(this.page, /city/i, data.city);
    await fillByLabel(this.page, /state/i, data.state);
    await fillByLabel(this.page, /zip|postal code/i, data.postalCode);

    const country = this.page.getByPlaceholder(/enter your country/i);
    await country.fill('India');

    const indiaOption = this.page.getByRole('option', {
      name: 'India',
      exact: true
    });

    await expect(indiaOption).toBeVisible();
    await indiaOption.click();
    await country.press('Tab');

    await expect(country).toHaveValue('India');

    await this.page.getByRole('button', {
      name: /next page/i
    }).click();
  }

  async validateMinimumTwoActivities() {
    await this.page.getByRole('button', {
      name: /add contributor/i
    }).click();

    await this.page.getByPlaceholder('First Name').fill('Automation');
    await this.page.getByPlaceholder('Last Name').fill('Contributor');

    const emails = this.page.getByPlaceholder('Email Address');
    await emails.nth(0).fill('sdet.contributor@example.com');
    await emails.nth(1).fill('sdet.contributor@example.com');

    await this.page.locator('textarea:visible').last().fill(
      'Please provide feedback and support for my scholarship application.'
    );

    await this.page.getByRole('button', {
      name: /^add$/i
    }).click();

    await expect(
      this.page.getByPlaceholder('First Name')
    ).toBeHidden();
  }

  async provideFourActivities(activities: string[]) {
    console.log('Activity count:', activities.length);

    await this.page.getByRole('button', {
      name: /next page/i
    }).click();

    await this.page.waitForTimeout(2500);

    console.log('CURRENT URL:', this.page.url());
    console.log('PAGE TEXT:', await this.page.locator('body').innerText());

    console.log(
      'VISIBLE FIELDS:',
      await this.page.locator(
        'input:visible, textarea:visible, select:visible, button:visible'
      ).evaluateAll(elements =>
        elements.map((element, index) => {
          const el = element as HTMLInputElement;
          return {
            index,
            tag: el.tagName,
            type: el.type || '',
            name: el.name || '',
            placeholder: el.placeholder || '',
            value: el.value || '',
            text: el.innerText || '',
            required: el.required,
            disabled: el.disabled
          };
        })
      )
    );

    await this.page.screenshot({
      path: 'application-page-after-next.png',
      fullPage: true
    });

    const html = await this.page.content();
    console.log('APPLICATION HTML:', html);
  }

  async fillPage3AndUpload(data: ApplicantData) {
    console.log('Academic page inspection required.');
    throw new Error('Waiting for academic page fields to be identified.');
  }

  async validateEssayTypeVisibility() {
    console.log('Essay page inspection required.');
  }

  async selectAnimalsAndSchool(data: ApplicantData) {
    console.log('Essay answers will be added after page inspection.');
  }

  async reviewAndSubmit(data: ApplicantData): Promise<string> {
    throw new Error('Review page inspection required.');
  }

  async validateSubmittedApplicationCannotBeEdited(url: string) {
    throw new Error('Submission verification is not implemented yet.');
  }
}
