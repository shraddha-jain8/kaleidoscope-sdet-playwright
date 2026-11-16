# Kaleidoscope SDET Playwright Challenge

A TypeScript Playwright project covering registration, the four-page scholarship application, validation, transcript upload, review, submission, URL capture, and post-submission edit protection.

## Important execution note

The public landing page is reachable, but registration may require a real inbox, email verification, CAPTCHA, or rate-limit handling. Automated tests must not bypass those controls. Set `TEST_EMAIL` to an inbox you control. If the UI labels have changed, use the retained Playwright trace to update the semantic locators in `pages/`.

## Project design

- Page objects separate navigation/auth/application behavior.
- Semantic role/label selectors are preferred over CSS classes.
- Unique test data avoids collisions.
- A generated sample transcript is included at `fixtures/school-transcript.pdf`.
- Trace, screenshot, and video are retained on failure.
- One worker prevents test users from racing through a stateful submission flow.
- GitHub Actions runs Chromium and uploads the HTML report.

## Run locally

Prerequisites: Node.js 20+ and Git.

```bash
npm install
npx playwright install --with-deps chromium
cp .env.example .env
# Edit .env and set a real TEST_EMAIL if verification is required
npm test
```

Useful commands:

```bash
npm run test:headed
npm run test:ui
npm run test:debug
npm run report
npm run typecheck
```

## Publish to GitHub

1. Sign in to GitHub and create a new empty repository named `kaleidoscope-sdet-playwright`. Do not add a README, `.gitignore`, or license because those files already exist locally.
2. From the extracted project folder run:

```bash
git init
git add .
git commit -m "Add Kaleidoscope SDET Playwright challenge"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/kaleidoscope-sdet-playwright.git
git push -u origin main
```

3. In GitHub, open **Settings > Secrets and variables > Actions** and add repository secrets `TEST_EMAIL` and `TEST_PASSWORD` if the workflow needs a real account.
4. Open **Actions** to review the run. Download the `playwright-report` artifact for failures.

Alternative with GitHub CLI:

```bash
gh auth login
gh repo create kaleidoscope-sdet-playwright --public --source=. --remote=origin --push
```

## Test mapping

| Requirement | Implementation |
|---|---|
| Register new user | `AuthPage.register` |
| Page 1 required fields | `ApplicationPage.fillPage1` |
| Minimum two activities validation | `validateMinimumTwoActivities` |
| Four activities | `provideFourActivities` |
| Transcript upload | `fillPage3AndUpload` |
| Every essay option reveals box | `validateEssayTypeVisibility` |
| Only Animals + School answered | `selectAnimalsAndSchool` |
| Review answers | `reviewAndSubmit` |
| Capture URL + lock after submit | `reviewAndSubmit` and `validateSubmittedApplicationCannotBeEdited` |
