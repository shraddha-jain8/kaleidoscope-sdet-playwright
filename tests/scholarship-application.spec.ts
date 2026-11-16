
import { test, expect } from '@playwright/test';
import { LandingPage } from '../pages/landing.page';
import { AuthPage } from '../pages/auth.page';
import { ApplicationPage } from '../pages/application.page';
import { createApplicantData } from '../utils/testData';

test.describe('Kaleidoscope applicant application', () => {
  test('signs in, completes applicant details, adds contributor and opens activities page', async ({ page }) => {
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
    });
  });
});
