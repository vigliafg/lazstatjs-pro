import { expect, test } from '@playwright/test';

const openAnova = async (page: import('@playwright/test').Page) => {
  await page.getByRole('button', { name: 'Analysis', exact: true }).click();
  const library = page.getByRole('button', { name: 'Library', exact: true });
  if (await library.isVisible().catch(() => false)) await library.click();
  await page.getByLabel('Search analyses', { exact: true }).fill('ANOVA');
  await page.locator('button[title="Compare means across groups with post-hoc tests."]').click();
};

const setColour = async (locator: import('@playwright/test').Locator, value: string) => {
  await locator.evaluate((element, colour) => {
    const input = element as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    setter?.call(input, colour);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
};

test('output appearance overrides the theme only inside the result window', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the output appearance editor is exercised on the desktop layout');

  await test.step('configure the output window', async () => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Output window' })).toBeVisible();

    await setColour(page.getByLabel('Background', { exact: true }), '#112233');
    await setColour(page.getByLabel('Text colour', { exact: true }), '#f0f0f0');
    await page.getByLabel('Font', { exact: true }).selectOption('serif');
    await page.getByLabel('Font size', { exact: true }).selectOption('16');

    const preview = page.locator('[data-output-appearance-preview]');
    await expect(preview).toHaveCSS('background-color', 'rgb(17, 34, 51)');
    await expect(preview).toHaveCSS('color', 'rgb(240, 240, 240)');
    await expect(preview).toHaveCSS('font-size', '16px');
  });

  await test.step('run an analysis and check the scoped styles', async () => {
    await openAnova(page);
    await page.getByRole('button', { name: 'Run analysis' }).click();
    await expect(page.locator('article.output-card')).toHaveCount(1);

    const output = page.locator('#output-content');
    await expect(output).toHaveCSS('background-color', 'rgb(17, 34, 51)');
    await expect(output).toHaveCSS('color', 'rgb(240, 240, 240)');
    await expect(output).toHaveCSS('font-size', '16px');
    await expect(output).toHaveCSS('font-family', /Georgia/);
    // The shell keeps the selected UI theme: only the result window changed.
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(13, 15, 20)');
  });

  await test.step('persist across reload and keep the result window themed', async () => {
    await page.waitForTimeout(1200);
    await page.reload();
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await expect(page.getByLabel('Background', { exact: true })).toHaveValue('#112233');
    await expect(page.getByLabel('Text colour', { exact: true })).toHaveValue('#f0f0f0');
    await expect(page.getByLabel('Font', { exact: true })).toHaveValue('serif');
    await expect(page.getByLabel('Font size', { exact: true })).toHaveValue('16');

    await page.getByRole('button', { name: 'Analysis', exact: true }).click();
    await expect(page.locator('#output-content')).toHaveCSS('background-color', 'rgb(17, 34, 51)');
    await expect(page.locator('#output-content')).toHaveCSS('font-size', '16px');
  });
});
