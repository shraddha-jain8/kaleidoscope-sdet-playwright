import { test } from '@playwright/test';
import { LandingPage } from '../pages/landing.page';
import { AuthPage } from '../pages/auth.page';
import { ApplicationPage } from '../pages/application.page';
import { createApplicantData } from '../utils/testData';

test.describe('Kaleidoscope applicant application', () => {
  test('registers, completes, submits, and locks an SDET scholarship application', async ({ page }) => {
    const data = createApplicantData();
    const landing = new LandingPage(page);
    const auth = new AuthPage(page);
    const application = new ApplicationPage(page);

    await test.step('Open program and register a new applicant', async () => {
      await landing.open();
      await landing.startApplication();
      await auth.register(data);
    });

    await test.step('Page 1: complete required applicant fields', async () => {
      await application.fillPage1(data);
    });

    await test.step('Page 2: validate minimum two activities, then provide four', async () => {
      await application.validateMinimumTwoActivities();
      await application.provideFourActivities(data.activities);
    });

    await test.step('Page 3: complete academic fields and upload transcript', async () => {
      await application.fillPage3AndUpload(data);
    });

    await test.step('Page 4: validate conditional essays and answer Animals + School', async () => {
      await application.validateEssayTypeVisibility();
      await application.selectAnimalsAndSchool(data);
    });

    await test.step('Review, submit, revisit captured URL, and validate lock', async () => {
      const reviewUrl = await application.reviewAndSubmit(data);
      await application.validateSubmittedApplicationCannotBeEdited(reviewUrl);
    });
  });
});
