
import { Page, expect } from '@playwright/test';
import { fillByLabel } from './helpers';
import type { ApplicantData } from '../utils/testData';

function createTestTranscriptPdf(): Buffer {
  const content =
    'BT /F1 18 Tf 50 740 Td (SDET Scholarship - TEST DATA ONLY) Tj ' +
    '0 -30 Td /F1 12 Tf (Synthetic transcript for automated testing.) Tj ET';

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(content, 'ascii')} >>\nstream\n${content}\nendstream`
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, 'ascii'));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, 'ascii');

  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';

  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, 'ascii');
}

export class ApplicationPage {
  constructor(private readonly page: Page) {}

  async fillPage1(data: ApplicantData) {
    await fillByLabel(this.page, /address/i, data.address);
    await fillByLabel(this.page, /city/i, data.city);
    await fillByLabel(this.page, /state/i, data.state);
    await fillByLabel(this.page, /zip|postal code/i, data.postalCode);

    const country = this.page.getByPlaceholder(
      /enter your country/i
    );

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

    const email = 'sdet.contributor@example.com';

    await emailFields.nth(0).fill(email);
    await emailFields.nth(1).fill(email);

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

    console.log('Contributor request added.');
  }

  async goToActivitiesPage() {
    const previousUrl = this.page.url();

    await this.page.getByRole('button', {
      name: /next page/i
    }).click();

    await expect.poll(
      () => this.page.url(),
      { timeout: 30000 }
    ).not.toBe(previousUrl);

    const title = this.page.getByTestId('page-title');

    await expect(title).toHaveText(
      /Extracurricular Activities/i
    );

    console.log('Successfully navigated to Extracurricular Activities.');
    console.log('Current URL:', this.page.url());
  }

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

    await expect(activityName).not.toBeVisible({
      timeout: 10000
    });

    await expect(
      this.page.getByText(name, { exact: true })
    ).toBeVisible();

    console.log(`Activity added: ${name}`);
  }

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

    const title = this.page.getByTestId('page-title');

    if (await title.isVisible().catch(() => false)) {
      console.log('NEXT PAGE TITLE:', await title.innerText());
    }

    console.log('NEXT PAGE CONTENT:');
    console.log(await this.page.locator('body').innerText());
  }

  async fillHighSchoolPage(data: ApplicantData) {
    const street = this.page.getByPlaceholder(
      'Enter high school street address'
    );

    const city = this.page.getByPlaceholder(
      'Enter high school city'
    );

    const state = this.page.getByPlaceholder(
      'Enter high school state'
    );

    const zip = this.page.getByPlaceholder('e.g. 55413');

    const gpa = this.page.getByPlaceholder(
      'Enter your current GPA'
    );

    const graduationDate = this.page.getByPlaceholder(
      'Enter a date'
    );

    await street.fill(data.address);
    await city.fill(data.city);

    await state.fill(data.state);

    const stateOption = this.page.getByRole('option', {
      name: data.state,
      exact: true
    });

    if (await stateOption.isVisible().catch(() => false)) {
      await stateOption.click();
    } else {
      await state.press('Tab');
    }

    await zip.fill(data.postalCode);

    await gpa.fill('3');
    await gpa.press('Tab');

    await expect(gpa).toHaveValue('3');

    console.log('GPA entered: 3');

    // Open the graduation date calendar.
    await graduationDate.click();

    await expect(graduationDate).toBeVisible();

    // The latest test log showed November 2026.
    // The calendar header contains previous/next month controls.
    const calendarHeaderControls = this.page.locator(
      '.mantine-CalendarHeader-control'
    );

    await expect(calendarHeaderControls).toHaveCount(2);

    const nextMonthButton = calendarHeaderControls.last();

    // Move from November 2026 to June 2027.
    for (let month = 0; month < 7; month++) {
      await nextMonthButton.click();
    }

    // Confirm the calendar reached the intended month.
    await expect(
      this.page.getByText('June 2027', { exact: true })
    ).toBeVisible();

    // Select the first day of June 2027.
    const graduationDay = this.page.getByRole('button', {
      name: '1 June 2027',
      exact: true
    });

    await expect(graduationDay).toBeVisible();
    await graduationDay.click();

    // Confirm the date field is populated.
    await expect(graduationDate).toHaveValue(/.+/);

    console.log(
      'Graduation date selected:',
      await graduationDate.inputValue()
    );

    // Upload synthetic transcript for automated testing only.
    const transcriptInput = this.page.locator(
      'input[type="file"]'
    );

    await expect(transcriptInput).toHaveCount(1);

    await transcriptInput.setInputFiles({
      name: 'sample-transcript-test-only.pdf',
      mimeType: 'application/pdf',
      buffer: createTestTranscriptPdf()
    });

    console.log('Synthetic test transcript selected.');
    console.log('High School Information fields completed.');
  }

  async inspectCurrentPage() {
    const title = this.page.getByTestId('page-title');

    await expect(title).toBeVisible({
      timeout: 15000
    });

    console.log('NEXT PAGE TITLE:', await title.innerText());

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
          required: field.required
        };
      })
    );

    console.log('NEXT PAGE FORM FIELDS:');
    console.log(JSON.stringify(fields, null, 2));

    console.log('NEXT PAGE CONTENT:');
    console.log(await this.page.locator('body').innerText());
  }
}
