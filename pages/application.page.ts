import { expect, Locator, Page } from '@playwright/test';
import path from 'node:path';
import { clickContinue, fillByLabel, firstVisible, selectOption } from './helpers';
import type { ApplicantData } from '../utils/testData';

export class ApplicationPage {
  constructor(private readonly page: Page) {}

  async fillPage1(d: ApplicantData) {
    const fields: Array<[RegExp, string]> = [
      [/first name/i, d.firstName], [/last name/i, d.lastName], [/phone/i, d.phone],
      [/address/i, d.address], [/city/i, d.city], [/(zip|postal)/i, d.postalCode],
      [/(school|institution)/i, d.school], [/(graduation year|class year)/i, d.graduationYear], [/(gpa|grade point)/i, d.gpa]
    ];
    for (const [label, value] of fields) {
      if (await this.page.getByLabel(label).count() || await this.page.getByPlaceholder(label).count())
        await fillByLabel(this.page, label, value);
    }
    const state = this.page.getByLabel(/state/i);
    if (await state.count()) await selectOption(this.page, /state/i, /Maharashtra|Other/i);
    await clickContinue(this.page);
  }

  private activityInputs(): Locator {
    return this.page.locator('input, textarea').filter({ has: this.page.locator('xpath=ancestor::*[self::fieldset or self::div][1][.//*[contains(translate(normalize-space(.), "ACTIVITY", "activity"), "activity")]]') });
  }

  async validateMinimumTwoActivities() {
    const inputs = this.page.getByLabel(/activity|extracurricular/i);
    const usable = (await inputs.count()) ? inputs : this.activityInputs();
    if (await usable.count()) await usable.first().fill('Robotics Club');
    await clickContinue(this.page);
    await expect(this.page.getByText(/at least.*2|minimum.*2|two.*required|provide.*2/i)).toBeVisible();
  }

  async provideFourActivities(activities: string[]) {
    for (let i = 0; i < activities.length; i++) {
      let inputs = this.page.getByLabel(/activity|extracurricular/i);
      if (i >= await inputs.count()) {
        const add = this.page.getByRole('button', { name: /add.*activity|add another/i });
        if (await add.count()) await add.click();
        inputs = this.page.getByLabel(/activity|extracurricular/i);
      }
      if (i >= await inputs.count()) throw new Error(`Activity input ${i + 1} not found`);
      await inputs.nth(i).fill(activities[i]);
    }
    await clickContinue(this.page);
  }

  async fillPage3AndUpload(d: ApplicantData) {
    const optionalFields: Array<[RegExp, string]> = [[/school/i, d.school], [/gpa/i, d.gpa], [/graduation/i, d.graduationYear]];
    for (const [label, value] of optionalFields)
      if (await this.page.getByLabel(label).count()) await fillByLabel(this.page, label, value);
    const upload = this.page.locator('input[type=file]');
    await expect(upload).toHaveCount(1);
    await upload.setInputFiles(path.resolve('fixtures/school-transcript.pdf'));
    await expect(this.page.getByText(/school-transcript\.pdf/i)).toBeVisible();
    await clickContinue(this.page);
  }

  async validateEssayTypeVisibility() {
    const cases = [
      { option: /cars/i, box: /essay.*cars|cars.*essay/i },
      { option: /animals/i, box: /essay.*animals|animals.*essay/i },
      { option: /school/i, box: /essay.*school|school.*essay/i },
      { option: /other/i, box: /essay.*other|other.*essay|any topic/i }
    ];
    for (const c of cases) {
      const option = await firstVisible([
        this.page.getByRole('checkbox', { name: c.option }),
        this.page.getByRole('radio', { name: c.option }),
        this.page.getByLabel(c.option)
      ]);
      await option.check();
      await expect(this.page.getByLabel(c.box).or(this.page.getByText(c.box))).toBeVisible();
      await option.uncheck().catch(async () => option.click());
    }
  }

  async selectAnimalsAndSchool(d: ApplicantData) {
    const animals = await firstVisible([this.page.getByRole('checkbox', { name: /animals/i }), this.page.getByLabel(/animals/i)]);
    const school = await firstVisible([this.page.getByRole('checkbox', { name: /school/i }), this.page.getByLabel(/school/i)]);
    await animals.check(); await school.check();
    await fillByLabel(this.page, /essay.*animals|animals.*essay/i, d.animalEssay);
    await fillByLabel(this.page, /essay.*school|school.*essay/i, d.schoolEssay);
    await expect(this.page.getByRole('checkbox', { name: /cars/i })).not.toBeChecked();
    await expect(this.page.getByRole('checkbox', { name: /other/i })).not.toBeChecked();
    await clickContinue(this.page);
  }

  async reviewAndSubmit(d: ApplicantData) {
    await expect(this.page.getByText(/review/i).first()).toBeVisible();
    for (const text of [d.firstName, ...d.activities, d.animalEssay, d.schoolEssay])
      await expect(this.page.getByText(text, { exact: false }).first()).toBeVisible();
    const unanswered = this.page.getByText(/not answered|incomplete|missing/i);
    await expect(unanswered).toHaveCount(0);
    const reviewUrl = this.page.url();
    await this.page.getByRole('button', { name: /submit application|submit/i }).click();
    const confirm = this.page.getByRole('button', { name: /confirm|yes.*submit|submit/i });
    if (await confirm.count()) await confirm.last().click();
    await expect(this.page.getByText(/submitted|application complete|thank you/i).first()).toBeVisible();
    return reviewUrl;
  }

  async validateSubmittedApplicationCannotBeEdited(reviewUrl: string) {
    await this.page.goto(reviewUrl);
    await expect(this.page.getByText(/submitted|editing.*not allowed|cannot.*edit|read.only/i).first()).toBeVisible();
    await expect(this.page.getByRole('button', { name: /save|continue|submit/i })).toHaveCount(0);
    const editable = this.page.locator('input:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly]), select:not([disabled])');
    await expect(editable).toHaveCount(0);
  }
}
