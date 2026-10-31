import { expect, test, type Locator, type Page } from '@playwright/test';

test.describe.configure({ timeout: 120_000 });

const output = (page: Page) => page.locator('article.output-card');

const runAnova = async (page: Page) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Analysis', exact: true }).click();
  const search = page.getByLabel('Search analyses', { exact: true });
  const library = page.getByRole('button', { name: 'Library', exact: true });
  await expect(library).toBeVisible();
  if (!(await search.isVisible().catch(() => false))) await library.click();
  await expect(search).toBeVisible();
  await search.fill('ANOVA');
  await page.locator('button[title="Compare means across groups with post-hoc tests."]').click();
  await page.getByRole('button', { name: 'Run analysis' }).click();
  await expect(output(page)).toHaveCount(1);
};

const chartOf = (page: Page, id = 'anova-box'): Locator =>
  output(page).locator(`[data-chart-id="${id}"]`);

const openEditor = async (page: Page, id = 'anova-box') => {
  const chart = chartOf(page, id);
  await expect(chart).toBeVisible();
  await expect(chart.locator('[data-chart-surface]')).toHaveAttribute(
    'data-chart-state',
    'ready',
    { timeout: 20000 }
  );
  await chart.locator('button[aria-label^="Edit chart:"]').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-chart-surface]')).toHaveAttribute(
    'data-chart-state',
    'ready',
    { timeout: 20000 }
  );
  return { chart, dialog };
};

const field = (dialog: Locator, id: string): Locator =>
  dialog.locator(`#chart-feature-${id}`);

const selectPreset = async (dialog: Locator, value: string) => {
  await dialog.locator('[data-chart-preset-select]').selectOption(value);
};

const savePreset = async (dialog: Locator, name: string) => {
  await dialog.locator('[data-chart-preset-save]').click();
  await dialog.locator('[data-chart-preset-name]').fill(name);
  await dialog.locator('[data-chart-preset-save-confirm]').click();
  await expect(dialog.locator('[data-chart-preset-name]')).toHaveCount(0);
  await expect(dialog.locator('[data-chart-preset-select]')).toHaveValue(/^custom:/);
};

const presetSelect = (dialog: Locator) => dialog.locator('[data-chart-preset-select]');

test.describe('chart presets — editor workflow', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop workflow');

  test('save, load, undo and ignore annotations or specific options', async ({ page }) => {
    await runAnova(page);
    const { dialog } = await openEditor(page);

    await expect(presetSelect(dialog)).toHaveValue('builtin:default');

    // Create a preset from a style different from the factory one.
    await field(dialog, 'general-theme').selectOption('light');
    await field(dialog, 'general-palette').selectOption('mono');
    await field(dialog, 'style-size').selectOption('wide');
    await savePreset(dialog, 'Paper');
    await expect(presetSelect(dialog)).toHaveValue(/^custom:/);

    // Change the style; the select no longer claims the preset is active.
    await field(dialog, 'general-theme').selectOption('dark');
    await field(dialog, 'general-palette').selectOption('default');
    await field(dialog, 'style-size').selectOption('regular');
    await expect(presetSelect(dialog)).toHaveValue('builtin:default');

    // Load it again: all shared style keys return in one action.
    await selectPreset(dialog, 'Paper');
    await expect(field(dialog, 'general-theme')).toHaveValue('light');
    await expect(field(dialog, 'general-palette')).toHaveValue('mono');
    await expect(field(dialog, 'style-size')).toHaveValue('wide');

    // One undo restores the pre-preset style.
    await dialog.getByRole('button', { name: 'Undo', exact: true }).click();
    await expect(field(dialog, 'general-theme')).toHaveValue('dark');
    await expect(field(dialog, 'general-palette')).toHaveValue('default');
    await expect(field(dialog, 'style-size')).toHaveValue('regular');
    await expect(presetSelect(dialog)).toHaveValue('builtin:default');

    // A specific box option must survive preset application.
    await field(dialog, 'display').selectOption('notched');
    await selectPreset(dialog, 'builtin:print');
    await expect(field(dialog, 'general-theme')).toHaveValue('light');
    await expect(field(dialog, 'display')).toHaveValue('notched');

    // Built-in presets are snapshots: Default really resets Print.
    await selectPreset(dialog, 'builtin:default');
    await expect(field(dialog, 'general-theme')).toHaveValue('dark');
    await expect(field(dialog, 'general-palette')).toHaveValue('default');
    await expect(field(dialog, 'display')).toHaveValue('notched');

    // Minimal -> Print restores the options Minimal turned off.
    await selectPreset(dialog, 'builtin:minimal');
    await expect(field(dialog, 'general-gridY')).not.toBeChecked();
    await expect(field(dialog, 'general-showSubtitle')).not.toBeChecked();
    await selectPreset(dialog, 'builtin:print');
    await expect(field(dialog, 'general-gridY')).toBeChecked();
    await expect(field(dialog, 'general-showSubtitle')).toBeChecked();
    await expect(field(dialog, 'general-theme')).toHaveValue('light');

    // Overwrite by name: the inline warning appears and the library stays at one entry.
    await dialog.locator('[data-chart-preset-select]').selectOption({ label: 'Paper' });
    await field(dialog, 'general-theme').selectOption('dark');
    await dialog.locator('[data-chart-preset-save]').click();
    await dialog.locator('[data-chart-preset-name]').fill('paper');
    await expect(dialog.locator('[data-chart-preset-overwrite]')).toBeVisible();
    await dialog.locator('[data-chart-preset-save-confirm]').click();
    await expect(dialog.locator('[data-chart-preset-name]')).toHaveCount(0);
    await expect(presetSelect(dialog)).toHaveValue(/^custom:/);

    await dialog.getByRole('button', { name: 'Done' }).click();
    await expect(dialog).toHaveCount(0);
    await page.waitForTimeout(1400);
    await page.reload();

    const reopened = await openEditor(page);
    await expect(presetSelect(reopened.dialog).locator('option', { hasText: 'Paper' })).toHaveCount(1);
    await expect(presetSelect(reopened.dialog)).toHaveValue(/^custom:/);
    await expect(field(reopened.dialog, 'general-theme')).toHaveValue('dark');

    // The saved preset is visible and manageable in Settings → Charts.
    await reopened.dialog.getByRole('button', { name: 'Cancel' }).click();
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    const list = page.locator('[data-chart-preset-list]');
    await expect(list).toBeVisible();
    await expect(list.locator('[data-chart-preset-row]')).toHaveCount(1);
    const row = list.locator('[data-chart-preset-row]').first();
    const nameInput = row.locator('[data-chart-preset-name-input]');
    await expect(nameInput).toHaveValue('Paper');
    await nameInput.fill('Journal');
    await nameInput.press('Enter');
    await expect(nameInput).toHaveValue('Journal');
    await page.waitForTimeout(1400);
    await page.reload();
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await expect(page.locator('[data-chart-preset-list] [data-chart-preset-name-input]')).toHaveValue(
      'Journal'
    );

    page.once('dialog', prompt => prompt.accept());
    await page.locator('[data-chart-preset-row] [data-chart-preset-delete]').click();
    await expect(page.locator('[data-chart-preset-empty]')).toBeVisible();
  });

  test('presets survive a project round-trip and stay out of annotations', async ({ page }) => {
    await runAnova(page);
    const { dialog } = await openEditor(page);
    await field(dialog, 'general-theme').selectOption('light');
    await savePreset(dialog, 'Light paper');
    await dialog.getByRole('button', { name: 'Done' }).click();
    await expect(dialog).toHaveCount(0);
    await page.waitForTimeout(1400);
    await page.reload();

    const reopened = await openEditor(page);
    await expect(presetSelect(reopened.dialog).locator('option', { hasText: 'Light paper' })).toHaveCount(1);
    // Loading a preset must not add an annotation.
    await expect(
      reopened.dialog.locator('[data-chart-annotations] [data-annotation-id]')
    ).toHaveCount(0);
    await selectPreset(reopened.dialog, 'builtin:default');
    await expect(
      reopened.dialog.locator('[data-chart-annotations] [data-annotation-id]')
    ).toHaveCount(0);
    await reopened.dialog.getByRole('button', { name: 'Cancel' }).click();
  });
});

test.describe('chart presets — mobile', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile-only workflow');

  test('saves and loads a preset from the quick bar', async ({ page }) => {
    await runAnova(page);
    const { dialog } = await openEditor(page);
    await field(dialog, 'general-theme').selectOption('light');
    await savePreset(dialog, 'Mobile');
    await field(dialog, 'general-theme').selectOption('dark');
    await expect(presetSelect(dialog)).toHaveValue('builtin:default');
    await selectPreset(dialog, await presetSelect(dialog).locator('option', { hasText: 'Mobile' }).getAttribute('value') ?? '');
    await expect(field(dialog, 'general-theme')).toHaveValue('light');
    await dialog.getByRole('button', { name: 'Done' }).click();
    await expect(dialog).toHaveCount(0);
    await expect.poll(async () => chartOf(page).locator('[data-chart-surface]').getAttribute('data-chart-background')).toBe('#ffffff');
  });
});

test.describe('chart presets — visual baselines', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop baseline');
  test.skip(process.env.VISUAL !== '1', 'set VISUAL=1 to run visual baselines');

  test('chart preset editor baseline', async ({ page }) => {
    await runAnova(page);
    const { dialog } = await openEditor(page);
    await field(dialog, 'general-theme').selectOption('light');
    await field(dialog, 'general-palette').selectOption('mono');
    await savePreset(dialog, 'Paper');
    await page.waitForTimeout(250);
    await expect(dialog).toHaveScreenshot('chart-preset-editor.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });

  test('chart preset settings baseline', async ({ page }) => {
    await runAnova(page);
    const { dialog } = await openEditor(page);
    await field(dialog, 'general-theme').selectOption('light');
    await savePreset(dialog, 'Paper');
    await dialog.getByRole('button', { name: 'Done' }).click();
    await expect(dialog).toHaveCount(0);
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    const section = page.locator('[data-settings-charts]');
    await section.scrollIntoViewIfNeeded();
    await expect(section).toHaveScreenshot('chart-preset-settings.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });

});

test.describe('chart presets — mobile visual baseline', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile baseline');
  test.skip(process.env.VISUAL !== '1', 'set VISUAL=1 to run visual baselines');

  test('chart preset mobile baseline', async ({ page }) => {
    await runAnova(page);
    const { dialog } = await openEditor(page);
    await field(dialog, 'general-theme').selectOption('light');
    await savePreset(dialog, 'Mobile paper');
    await page.waitForTimeout(250);
    await expect(dialog).toHaveScreenshot('chart-preset-mobile.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });
});
