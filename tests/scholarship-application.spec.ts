
import { test, expect } from '@playwright/test';
import { LandingPage } from '../pages/landing.page';
import { AuthPage } from '../pages/auth.page';
import { ApplicationPage } from '../pages/application.page';
import { createApplicantData } from '../utils/testData';

test.describe('Kaleidoscope applicant application', () => {
  test('completes applicant details and progresses through the scholarship application', async ({ page }) => {
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
    });

    await test.step('Save High School Information', async () => {
      const saveButton = page.getByRole('button', {
        name: /^save$/i
      });

      await expect(saveButton).toBeVisible();
      await saveButton.click();

      console.log('Clicked Save on High School Information.');
    });

    await test.step('Navigate to the next application page', async () => {
      await application.goToNextPage();
      await application.inspectCurrentPage();
    });
  });
});
