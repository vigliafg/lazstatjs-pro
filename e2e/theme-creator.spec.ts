import { expect, test, type Page } from '@playwright/test';

const openSettings = async (page: Page) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
};

const openCreator = async (page: Page) => {
  const create = page.locator('[data-theme-create]');
  await create.scrollIntoViewIfNeeded();
  await create.click();
  const dialog = page.locator('[data-theme-creator-dialog]');
  await expect(dialog).toBeVisible();
  return dialog;
};

const readVar = (page: Page, name: string) =>
  page.evaluate(
    cssName => getComputedStyle(document.documentElement).getPropertyValue(cssName).trim(),
    name
  );

test.describe('theme creator — desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop workflow');

  test('creates, applies, persists, edits, duplicates and deletes a custom theme', async ({ page }) => {
    await openSettings(page);
    const dialog = await openCreator(page);

    await expect(dialog.locator('[data-theme-preview]')).toBeVisible();
    await expect(page.locator('[data-theme-preview-area]')).toHaveCount(10);
    await expect(page.locator('[data-theme-chart-preview]')).toHaveCount(1);
    await expect(page.locator('[data-contrast-check]')).toHaveCount(11);
    await dialog.locator('[data-theme-name]').fill('Test theme');
    await dialog.locator('[data-theme-color="accent"]').fill('#38bdf8');
    await expect
      .poll(() =>
        page.locator('[data-theme-preview]').evaluate(node =>
          getComputedStyle(node).getPropertyValue('--color-accent').trim()
        )
      )
      .toBe('#38bdf8');

    await dialog.locator('[data-theme-save]').click();
    await expect(dialog).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('data-theme', /^custom-/);
    expect(await readVar(page, '--color-accent')).toBe('#38bdf8');
    await expect(page.locator('[data-custom-theme]')).toHaveCount(1);
    await expect(page.locator('[data-custom-theme]')).toContainText('Test theme');

    // The header quick switch includes the custom theme.
    const headerTheme = page.getByLabel('Interface theme', { exact: true }).first();
    await expect(headerTheme).toHaveValue(/^custom-/);
    await expect(headerTheme.locator('option', { hasText: 'Test theme' })).toHaveCount(1);

    // Autosave carries both the definition and the selected id.
    await page.waitForTimeout(1400);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', /^custom-/);
    await expect(page.getByLabel('Interface theme', { exact: true }).first()).toHaveValue(/^custom-/);
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await expect(page.locator('[data-custom-theme]')).toContainText('Test theme');

    // Edit the name and keep the same id.
    const themeId = await page.locator('html').getAttribute('data-theme');
    await page.locator('[data-theme-edit]').click();
    const edit = page.locator('[data-theme-creator-dialog]');
    await expect(edit).toBeVisible();
    await edit.locator('[data-theme-name]').fill('Paper theme');
    await edit.locator('[data-theme-save]').click();
    await expect(edit).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('data-theme', themeId ?? '');
    await expect(page.locator('[data-custom-theme]')).toContainText('Paper theme');

    // Duplicate creates a second custom theme and activates it.
    await page.locator('[data-theme-duplicate]').click();
    const duplicate = page.locator('[data-theme-creator-dialog]');
    await expect(duplicate).toBeVisible();
    await expect(duplicate.locator('[data-theme-name]')).toHaveValue(/copy/);
    await duplicate.locator('[data-theme-save]').click();
    await expect(duplicate).toHaveCount(0);
    await expect(page.locator('[data-custom-theme]')).toHaveCount(2);
    const activeId = await page.locator('html').getAttribute('data-theme');
    expect(activeId).not.toBe(themeId);

    // Deleting the active theme falls back to the default, keeping the other one.
    page.once('dialog', prompt => prompt.accept());
    await page.locator('[data-custom-theme]').filter({ hasText: 'Paper theme copy' }).locator('[data-theme-delete]').click();
    await expect(page.locator('[data-custom-theme]')).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'github-dark');
  });

  test('cancel and contrast warnings do not change the app theme', async ({ page }) => {
    await openSettings(page);
    const before = await page.locator('html').getAttribute('data-theme');
    const dialog = await openCreator(page);
    await dialog.locator('[data-theme-color="accent"]').fill('#ff0000');
    await expect(page.locator('html')).toHaveAttribute('data-theme', before ?? '');
    page.once('dialog', prompt => prompt.accept());
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('data-theme', before ?? '');
    await expect(page.locator('[data-custom-theme]')).toHaveCount(0);

    const low = await openCreator(page);
    await low.locator('[data-theme-color="text"]').fill('#888888');
    await expect(
      page.locator('[data-contrast-check="text-bg"]')
    ).toHaveAttribute('data-contrast-pass', 'false');
    page.once('dialog', prompt => prompt.accept());
    await low.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(low).toHaveCount(0);
  });
});

test.describe('theme creator — mobile', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile-only workflow');

  test('switches between edit and preview and saves a theme', async ({ page }) => {
    await openSettings(page);
    const dialog = await openCreator(page);
    await dialog.locator('[data-theme-name]').fill('Mobile theme');
    await expect(page.locator('[data-theme-preview]')).toHaveCount(0);
    await dialog.locator('[data-theme-mobile-toggle]').click();
    await expect(page.locator('[data-theme-preview]')).toBeVisible();
    await dialog.locator('[data-theme-mobile-toggle]').click();
    await expect(page.locator('[data-theme-preview]')).toHaveCount(0);
    await dialog.locator('[data-theme-save]').click();
    await expect(dialog).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('data-theme', /^custom-/);
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await expect(page.locator('[data-custom-theme]')).toContainText('Mobile theme');
  });
});

test.describe('theme creator — visual baselines', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop baseline');
  test.skip(process.env.VISUAL !== '1', 'set VISUAL=1 to run visual baselines');

  test('theme creator desktop baseline', async ({ page }) => {
    await openSettings(page);
    const dialog = await openCreator(page);
    await dialog.locator('[data-theme-color="accent"]').fill('#38bdf8');
    await page.waitForTimeout(200);
    await expect(dialog).toHaveScreenshot('theme-creator-desktop.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });

  test('custom theme settings baseline', async ({ page }) => {
    await openSettings(page);
    const dialog = await openCreator(page);
    await dialog.locator('[data-theme-name]').fill('Paper theme');
    await dialog.locator('[data-theme-save]').click();
    await expect(dialog).toHaveCount(0);
    const library = page.locator('[data-custom-theme-library]');
    await library.scrollIntoViewIfNeeded();
    await expect(library).toHaveScreenshot('theme-custom-settings.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });
});

test.describe('theme creator — mobile visual baseline', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile baseline');
  test.skip(process.env.VISUAL !== '1', 'set VISUAL=1 to run visual baselines');

  test('theme creator mobile baseline', async ({ page }) => {
    await openSettings(page);
    const dialog = await openCreator(page);
    await dialog.locator('[data-theme-mobile-toggle]').click();
    await page.waitForTimeout(200);
    await expect(dialog).toHaveScreenshot('theme-creator-mobile.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });
});
