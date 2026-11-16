
import { test, expect } from '@playwright/test';
import { LandingPage } from '../pages/landing.page';
import { AuthPage } from '../pages/auth.page';
import { ApplicationPage } from '../pages/application.page';
import { createApplicantData } from '../utils/testData';

test.describe('Kaleidoscope applicant application', () => {
  test('signs in, completes applicant details, adds contributor and inspects activities form', async ({ page }) => {
    const data = createApplicantData();

    const landing = new LandingPage(page);
    const auth = new AuthPage(page);
    const application = new ApplicationPage(page);

    await test.step('Open scholarship and sign in', async () => {
      await landing.open();
      await landing.startApplication();
      await auth.register(data);
    });

    await test.step('Complete applicant details', async () => {
      await application.fillPage1(data);
    });

    await test.step('Add contributor request', async () => {
      await application.addContributorRequest();

      await expect(
        page.getByText('Automation', { exact: true })
      ).toBeVisible();
    });

    await test.step('Navigate to extracurricular activities', async () => {
      await application.goToActivitiesPage();

      await expect(
        page.getByTestId('page-title')
      ).toContainText(/Extracurricular Activities/i);
    });

    await test.step('Inspect minimum activities validation', async () => {
      const activitiesUrl = page.url();

      const nextButton = page.getByRole('button', {
        name: /next page/i
      });

      await expect(nextButton).toBeVisible();
      await nextButton.click();

      await expect.poll(
        () => page.url(),
        { timeout: 15000 }
      ).toBe(activitiesUrl);

      console.log('ACTIVITIES VALIDATION MESSAGE:');
      console.log(await page.locator('body').innerText());
    });

    await test.step('Inspect Add Entry form', async () => {
      const addEntryButton = page.getByRole('button', {
        name: /add entry/i
      });

      await expect(addEntryButton).toBeVisible();
      await addEntryButton.click();

      const visibleFields = await page.locator(
        'input:visible, textarea:visible, select:visible'
      ).evaluateAll(elements =>
        elements.map(element => {
          const field = element as HTMLInputElement;

          return {
            tag: field.tagName,
            type: field.type,
            placeholder: field.placeholder,
            ariaLabel: field.getAttribute('aria-label'),
            name: field.name
          };
        })
      );

      console.log('ACTIVITY FORM TEXT:');
      console.log(await page.locator('body').innerText());

      console.log('VISIBLE FORM FIELDS:');
      console.log(JSON.stringify(visibleFields, null, 2));

      console.log('VISIBLE BUTTONS:');
      console.log(
        await page.locator('button:visible').allTextContents()
      );
    });
  });
});
