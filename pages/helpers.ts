import { expect, Locator, Page } from '@playwright/test';

export async function firstVisible(locators: Locator[]): Promise<Locator> {
  for (const locator of locators) {
    const first = locator.first();
    if (await first.isVisible().catch(() => false)) return first;
  }
  throw new Error('No expected locator is visible. Inspect the retained trace and update the semantic locator aliases.');
}

export async function fillByLabel(page: Page, label: RegExp, value: string) {
  const control = await firstVisible([
    page.getByLabel(label),
    page.getByPlaceholder(label),
    page.locator('input, textarea').filter({ has: page.locator('xpath=preceding::label[1]') }).filter({ hasText: label })
  ]);
  await control.fill(value);
}

export async function clickContinue(page: Page) {
  const button = await firstVisible([
    page.getByRole('button', { name: /continue|next|save.*continue|review/i }),
    page.getByRole('link', { name: /continue|next|review/i })
  ]);
  await expect(button).toBeEnabled();
  await button.click();
}

export async function selectOption(page: Page, name: RegExp, option: RegExp) {
  const select = page.getByLabel(name);
  if (await select.count()) {
    const labels = await select.locator('option').allTextContents();
    const matchingLabel = labels.find(label => option.test(label));
    if (!matchingLabel) throw new Error(`No option matching ${option} for ${name}`);
    await select.selectOption({ label: matchingLabel });
    return;
  }
  const combobox = page.getByRole('combobox', { name });
  if (await combobox.count()) {
    await combobox.click();
    await page.getByRole('option', { name: option }).click();
    return;
  }
  throw new Error(`Unable to locate select control for ${name}`);
}
