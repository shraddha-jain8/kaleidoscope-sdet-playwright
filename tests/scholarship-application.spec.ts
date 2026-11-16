
import { test, expect } from '@playwright/test';
import { LandingPage } from '../pages/landing.page';
import { AuthPage } from '../pages/auth.page';
import { ApplicationPage } from '../pages/application.page';
import { createApplicantData } from '../utils/testData';

test.describe('Kaleidoscope applicant application', () => {
  test('completes applicant details and saves the scholarship application', async ({ page }) => {
    const data = createApplicantData();

    const landing = new LandingPage(page);
    const auth = new AuthPage(page);
    const application = new ApplicationPage(page);

    await test.step('Open scholarship and authenticate', async () => {
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
    });

    await test.step('Add extracurricular activities', async () => {
      await application.addTwoActivities();
    });

    await test.step('Navigate to High School Information', async () => {
      await application.goToNextPage();

      await expect(
        page.getByTestId('page-title')
      ).toContainText(/High School Information/i);
    });

    await test.step('Complete High School Information', async () => {
      await application.fillHighSchoolPage(data);

      await expect(
        page.getByRole('button', {
          name: 'sample-transcript-test-only.pdf',
          exact: true
        })
      ).toBeVisible();
    });

    await test.step('Save and verify High School Information', async () => {
      // Allow the transcript upload and its metadata update to finish.
      await page.waitForLoadState('networkidle', {
        timeout: 15000
      });

      const pagePath = new URL(page.url()).pathname;

      const saveButton = page.getByRole('button', {
        name: /^save$/i
      });

      await expect(saveButton).toBeVisible();
      await expect(saveButton).toBeEnabled();

      // Wait for the application's save response before reloading.
      const saveResponsePromise = page.waitForResponse(response => {
        return (
          response.request().method() === 'POST' &&
          new URL(response.url()).pathname === pagePath &&
          response.status() === 200
        );
      }, {
        timeout: 20000
      });

      await saveButton.click();

      const saveResponse = await saveResponsePromise;
      expect(saveResponse.ok()).toBeTruthy();

      await page.waitForLoadState('networkidle', {
        timeout: 15000
      });

      console.log('High School Information save request completed.');

      // Reload to confirm that the values were actually saved.
      await page.reload();

      await expect(
        page.getByTestId('page-title')
      ).toContainText(/High School Information/i);

      await expect(
        page.getByPlaceholder('Enter high school street address')
      ).toHaveValue(data.address);

      await expect(
        page.getByPlaceholder('Enter high school city')
      ).toHaveValue(data.city);

      await expect(
        page.getByPlaceholder('Enter high school state')
      ).toHaveValue('Other');

      await expect(
        page.getByPlaceholder('e.g. 55413')
      ).toHaveValue(data.postalCode);

      await expect(
        page.getByPlaceholder('Enter your current GPA')
      ).toHaveValue('3');

      await expect(
        page.getByPlaceholder('Enter a date')
      ).toHaveValue('2027');

      await expect(
        page.getByRole('button', {
          name: 'sample-transcript-test-only.pdf',
          exact: true
        })
      ).toBeVisible();

      console.log(
        'High School Information saved and verified after reload.'
      );
    });
  });
});
