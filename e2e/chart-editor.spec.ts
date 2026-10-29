import { expect, test, type Locator, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';

test.describe.configure({ timeout: 90_000 });

mkdirSync('test-results/chart-editor-audit', { recursive: true });

/**
 * Chart editor end-to-end audit.
 *
 * The tests drive every control exposed by the editor on the charts of two
 * representative procedures: ANOVA (box + bar) and simple linear regression
 * (scatter + residual box + Q–Q). Screenshots are written under
 * `test-results/chart-editor-audit/` for the visual review that accompanies
 * the audit; no baseline is committed because Vega layout depends on installed
 * fonts.
 */

const output = (page: Page) => page.locator('article.output-card');

const openAnalysis = async (page: Page, query: string, title: string) => {
  await page.getByRole('button', { name: 'Analysis', exact: true }).click();
  const library = page.getByRole('button', { name: 'Library', exact: true });
  if (await library.isVisible().catch(() => false)) await library.click();
  await page.getByLabel('Search analyses', { exact: true }).fill(query);
  await page.locator(`button[title="${title}"]`).click();
};

const run = async (page: Page) => {
  await page.getByRole('button', { name: 'Run analysis' }).click();
  await expect(output(page)).toHaveCount(1);
};

const runAnova = async (page: Page) => {
  await page.goto('/');
  await openAnalysis(page, 'ANOVA', 'Compare means across groups with post-hoc tests.');
  await run(page);
};

const runRegression = async (page: Page) => {
  await page.goto('/');
  await openAnalysis(page, 'Regression', 'Ordinary least squares with robust options.');
  await run(page);
};

const chartOf = (page: Page, id: string): Locator =>
  output(page).locator(`[data-chart-id="${id}"]`);

const waitCardChart = async (page: Page, id: string) => {
  const chart = chartOf(page, id);
  await expect(chart).toBeVisible();
  await expect(chart.locator('[data-chart-surface]')).toHaveAttribute(
    'data-chart-state',
    'ready',
    { timeout: 15000 }
  );
  return chart;
};

const editButton = (chart: Locator): Locator =>
  chart.locator('button[aria-label^="Edit chart:"]');

const openEditor = async (page: Page, id: string) => {
  const chart = await waitCardChart(page, id);
  await editButton(chart).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const preview = dialog.locator('[data-chart-surface]');
  await expect(preview).toHaveAttribute('data-chart-state', 'ready', { timeout: 15000 });
  return { chart, dialog, preview };
};

const moreStyle = async (dialog: Locator) => {
  await dialog.getByText('More style', { exact: true }).click();
};

const field = (dialog: Locator, id: string): Locator =>
  dialog.locator(`#chart-feature-${id}`);

const waitPreview = async (page: Page, preview: Locator) => {
  // The dialog debounces the live preview by 120 ms; wait past it before
  // asserting or taking the visual-audit screenshot.
  await page.waitForTimeout(250);
  await expect(preview).toHaveAttribute('data-chart-state', 'ready', { timeout: 15000 });
};

const shot = async (dialog: Locator, name: string) => {
  await dialog.screenshot({ path: `test-results/chart-editor-audit/${name}.png` });
};

test.describe('chart editor — ANOVA', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop editor audit; mobile covered separately');

  test('box chart: all general, style and box-specific controls update the preview', async ({ page }) => {
    await runAnova(page);
    const { chart, dialog, preview } = await openEditor(page, 'anova-box');

    await expect(dialog.getByRole('heading', { name: /ANOVA a una via/ })).toBeVisible();
    await expect(field(dialog, 'general-preset')).toHaveValue('default');
    await expect(field(dialog, 'general-theme')).toHaveValue('dark');
    await expect(field(dialog, 'general-palette')).toHaveValue('default');
    await expect(field(dialog, 'general-gridY')).toBeChecked();
    await expect(field(dialog, 'general-gridX')).not.toBeChecked();
    // No series: the legend controls must not be offered.
    await expect(field(dialog, 'general-showLegend')).toHaveCount(0);
    await expect(field(dialog, 'general-legendPosition')).toHaveCount(0);
    await shot(dialog, 'anova-box-default');

    // Reset returns to the card's initial options, not to the generic factory.
    await field(dialog, 'general-theme').selectOption('light');
    await expect(preview).toHaveAttribute('data-chart-background', '#ffffff');
    await dialog.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(field(dialog, 'general-theme')).toHaveValue('dark');
    await expect(preview).toHaveAttribute('data-chart-background', '#0d0f14');

    // Theme and size are visible immediately in the preview surface / SVG.
    await field(dialog, 'general-theme').selectOption('light');
    await expect(preview).toHaveAttribute('data-chart-background', '#ffffff');
    await moreStyle(dialog);
    await field(dialog, 'style-size').selectOption('wide');
    await expect(preview.locator('svg').first()).toHaveAttribute('width', '822');
    await field(dialog, 'general-gridX').check();
    await field(dialog, 'general-gridY').uncheck();
    await field(dialog, 'general-palette').selectOption('mono');
    await field(dialog, 'general-showTitle').uncheck();
    await expect(preview.locator('svg text').filter({ hasText: /ANOVA a una via/ })).toHaveCount(0);
    const subtitle = dialog.getByText('Confronto delle distribuzioni per gruppo', { exact: true });
    await field(dialog, 'general-showSubtitle').uncheck();
    await expect(subtitle).toHaveCount(0);
    await field(dialog, 'general-showSubtitle').check();
    await expect(subtitle).toBeVisible();
    await field(dialog, 'general-showXTitle').uncheck();
    await field(dialog, 'general-showYTitle').uncheck();
    await field(dialog, 'general-showXTitle').check();
    await field(dialog, 'general-showYTitle').check();
    await field(dialog, 'general-zeroBaseline').check();
    await field(dialog, 'general-zeroBaseline').uncheck();

    // Secondary style controls.
    await field(dialog, 'style-gridOpacity').fill('0.6');
    await field(dialog, 'style-pointShape').selectOption('square');
    await field(dialog, 'style-pointSize').fill('120');
    await field(dialog, 'style-pointOpacity').fill('0.5');
    await expect(field(dialog, 'style-lineWidth')).toHaveCount(0);
    await expect(field(dialog, 'style-lineDash')).toHaveCount(0);
    await field(dialog, 'general-tooltip').uncheck();
    await expect(field(dialog, 'style-gridOpacity')).toHaveValue('0.6');
    await expect(field(dialog, 'style-pointSize')).toHaveValue('120');
    const boxNote = dialog.getByText(/La linea centrale è la mediana/);
    await expect(boxNote).toBeVisible();
    await field(dialog, 'general-showNote').uncheck();
    await expect(boxNote).toHaveCount(0);
    await field(dialog, 'general-showNote').check();
    await expect(boxNote).toBeVisible();
    await shot(dialog, 'anova-box-styled');

    // Box-specific controls.
    await field(dialog, 'showPoints').check();
    await field(dialog, 'showOutliers').uncheck();
    await field(dialog, 'showMean').check();
    await field(dialog, 'labelMedian').check();
    await field(dialog, 'sort').selectOption('asc');
    await waitPreview(page, preview);
    await shot(dialog, 'anova-box-specific');

    await dialog.getByRole('button', { name: 'Done' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(chart.locator('[data-chart-surface]')).toHaveAttribute(
      'data-chart-background',
      '#ffffff'
    );

    // Autosave is debounced; then the editor must reopen with the saved draft.
    await page.waitForTimeout(1200);
    await page.reload();
    await page.getByRole('button', { name: 'Analysis', exact: true }).click();
    const reopened = await openEditor(page, 'anova-box');
    await expect(field(reopened.dialog, 'general-theme')).toHaveValue('light');
    await expect(field(reopened.dialog, 'style-size')).toHaveValue('wide');
    await expect(field(reopened.dialog, 'showPoints')).toBeChecked();
    await expect(field(reopened.dialog, 'showMean')).toBeChecked();
    await expect(field(reopened.dialog, 'labelMedian')).toBeChecked();
    await reopened.dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(reopened.dialog).toHaveCount(0);
  });

  test('bar chart: error bars, labels, order, reference line, reset section', async ({ page }) => {
    await runAnova(page);
    const { dialog, preview } = await openEditor(page, 'anova-means');

    await expect(field(dialog, 'error')).toHaveValue('ci');
    await expect(field(dialog, 'valueLabels')).toBeChecked();
    await expect(field(dialog, 'sort')).toHaveValue('none');
    await expect(field(dialog, 'referenceLine')).toHaveValue('none');
    await shot(dialog, 'anova-bar-default');

    await field(dialog, 'error').selectOption('se');
    await waitPreview(page, preview);
    await shot(dialog, 'anova-bar-se');
    await field(dialog, 'error').selectOption('sd');
    await waitPreview(page, preview);
    await shot(dialog, 'anova-bar-sd');
    await field(dialog, 'error').selectOption('ci');

    await field(dialog, 'error').selectOption('none');
    await field(dialog, 'valueLabels').uncheck();
    await field(dialog, 'sort').selectOption('desc');
    await field(dialog, 'referenceLine').selectOption('zero');
    await waitPreview(page, preview);
    await shot(dialog, 'anova-bar-modified');

    // The numbers disappear with value labels; the zero rule is an extra path.
    await expect(preview.locator('svg text').filter({ hasText: /^\d+\.\d{2}$/ })).toHaveCount(0);

    await dialog.getByRole('button', { name: 'Reset this section' }).click();
    await expect(field(dialog, 'error')).toHaveValue('ci');
    await expect(field(dialog, 'valueLabels')).toBeChecked();
    await expect(field(dialog, 'sort')).toHaveValue('none');
    await expect(field(dialog, 'referenceLine')).toHaveValue('none');
    await waitPreview(page, preview);
    await shot(dialog, 'anova-bar-reset');

    await dialog.getByRole('button', { name: 'Done' }).click();
    await expect(dialog).toHaveCount(0);
  });
});

test.describe('chart editor — simple linear regression', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop editor audit; mobile covered separately');

  test('scatter chart: fit, band, level, opacity, equation, R², N and reset', async ({ page }) => {
    await runRegression(page);
    const { dialog, preview } = await openEditor(page, 'reg-scatter');

    await expect(field(dialog, 'fit')).toHaveValue('both');
    await expect(field(dialog, 'band')).toHaveValue('none');
    await expect(field(dialog, 'bandLevel')).toHaveCount(0);
    await expect(field(dialog, 'bandOpacity')).toHaveCount(0);
    await expect(field(dialog, 'equation')).toHaveValue('none');
    await expect(field(dialog, 'showR2')).not.toBeChecked();
    await expect(field(dialog, 'showN')).not.toBeChecked();
    await expect(field(dialog, 'general-showLegend')).toHaveCount(0);
    await expect(field(dialog, 'pointLabels')).toHaveCount(0);
    await shot(dialog, 'regression-scatter-default');
    await moreStyle(dialog);
    await field(dialog, 'style-lineWidth').fill('4');
    await field(dialog, 'style-lineDash').selectOption('dashed');
    await expect(field(dialog, 'style-lineWidth')).toHaveValue('4');

    for (const fit of ['none', 'ols', 'robust', 'both'] as const) {
      await field(dialog, 'fit').selectOption(fit);
      await waitPreview(page, preview);
      await shot(dialog, `regression-scatter-fit-${fit}`);
    }

    await field(dialog, 'band').selectOption('ci');
    await expect(field(dialog, 'bandLevel')).toHaveValue('95');
    await expect(field(dialog, 'bandOpacity')).toBeVisible();
    await waitPreview(page, preview);
    await shot(dialog, 'regression-scatter-band-ci');
    await field(dialog, 'bandLevel').selectOption('99');
    await waitPreview(page, preview);
    await shot(dialog, 'regression-scatter-band-ci99');
    await field(dialog, 'band').selectOption('pi');
    await field(dialog, 'bandOpacity').fill('0.45');
    await waitPreview(page, preview);
    await shot(dialog, 'regression-scatter-band-pi');

    await field(dialog, 'equation').selectOption('short');
    await waitPreview(page, preview);
    const shortEquation = await preview.locator('svg text').filter({ hasText: /y =/ }).textContent();
    await field(dialog, 'equation').selectOption('full');
    await waitPreview(page, preview);
    const fullEquation = await preview.locator('svg text').filter({ hasText: /y =/ }).textContent();
    expect(shortEquation).not.toBe(fullEquation);
    expect(shortEquation).toMatch(/y = .*\d\.\d{2}/);
    expect(fullEquation).toMatch(/y = .*\d\.\d{3}/);
    await field(dialog, 'showR2').check();
    await field(dialog, 'showN').check();
    await waitPreview(page, preview);
    await expect(preview.locator('svg text').filter({ hasText: /R²/ })).toHaveCount(1);
    await expect(preview.locator('svg text').filter({ hasText: /N =/ })).toHaveCount(2);
    await shot(dialog, 'regression-scatter-annotations');

    await dialog.getByRole('button', { name: 'Reset this section' }).click();
    await expect(field(dialog, 'fit')).toHaveValue('both');
    await expect(field(dialog, 'band')).toHaveValue('none');
    await expect(field(dialog, 'bandLevel')).toHaveCount(0);
    await expect(field(dialog, 'bandOpacity')).toHaveCount(0);
    await expect(field(dialog, 'equation')).toHaveValue('none');
    await expect(field(dialog, 'showR2')).not.toBeChecked();
    await expect(field(dialog, 'showN')).not.toBeChecked();
    await waitPreview(page, preview);
    await shot(dialog, 'regression-scatter-reset-section');

    await dialog.getByRole('button', { name: 'Done' }).click();
    await expect(dialog).toHaveCount(0);
  });

  test('residual box and Q–Q charts expose their specific controls', async ({ page }) => {
    await runRegression(page);

    const box = await openEditor(page, 'reg-residual-box');
    await expect(field(box.dialog, 'showPoints')).not.toBeChecked();
    await field(box.dialog, 'showPoints').check();
    await field(box.dialog, 'showOutliers').uncheck();
    await field(box.dialog, 'showMean').check();
    await field(box.dialog, 'labelMedian').check();
    await field(box.dialog, 'sort').selectOption('desc');
    await waitPreview(page, box.preview);
    await shot(box.dialog, 'regression-residual-box');
    await box.dialog.getByRole('button', { name: 'Done' }).click();

    const qq = await openEditor(page, 'reg-residual-qq');
    await expect(field(qq.dialog, 'showReference')).toBeChecked();
    await field(qq.dialog, 'showReference').uncheck();
    await waitPreview(page, qq.preview);
    await shot(qq.dialog, 'regression-residual-qq');
    await expect(qq.preview.locator('svg text').filter({ hasText: /Quantili teorici/ })).toHaveCount(1);
    await qq.dialog.getByRole('button', { name: 'Done' }).click();
    await expect(qq.dialog).toHaveCount(0);
  });
});

test.describe('chart editor — dialog behaviour', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop focus/cancel audit');

  test('undo/redo history and direct PNG export', async ({ page }) => {
    await runAnova(page);
    const { dialog } = await openEditor(page, 'anova-box');
    const undo = dialog.getByRole('button', { name: 'Undo', exact: true });
    const redo = dialog.getByRole('button', { name: 'Redo', exact: true });
    await expect(undo).toBeDisabled();
    await expect(redo).toBeDisabled();

    await field(dialog, 'general-theme').selectOption('light');
    await expect(undo).toBeEnabled();
    await undo.click();
    await expect(field(dialog, 'general-theme')).toHaveValue('dark');
    await redo.click();
    await expect(field(dialog, 'general-theme')).toHaveValue('light');

    await page.keyboard.press('Control+z');
    await expect(field(dialog, 'general-theme')).toHaveValue('dark');
    await page.keyboard.press('Control+Shift+z');
    await expect(field(dialog, 'general-theme')).toHaveValue('light');

    const download = page.waitForEvent('download', item => item.suggestedFilename().endsWith('.png'));
    await dialog.getByRole('button', { name: 'PNG', exact: true }).click();
    expect(await download).toBeTruthy();
    await expect(dialog).toBeVisible();

    page.once('dialog', prompt => prompt.accept());
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toHaveCount(0);
  });

  test('opening by chart click, keyboard activation, dirty guard, Escape and focus trap', async ({ page }) => {
    await runAnova(page);
    const chart = await waitCardChart(page, 'anova-box');

    // Pointer click on the chart opens the editor; the explicit Edit button is
    // the keyboard-accessible control (no nested role=button on the wrapper).
    await chart.locator('[data-chart-surface]').click();
    let dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toHaveCount(0);

    const edit = editButton(chart);
    await edit.focus();
    await page.keyboard.press('Enter');
    dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toHaveCount(0);

    await edit.focus();
    await page.keyboard.press(' ');
    dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Dirty + Cancel asks before discarding.
    await field(dialog, 'general-theme').selectOption('light');
    page.once('dialog', prompt => prompt.dismiss());
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toBeVisible();
    page.once('dialog', prompt => prompt.accept());
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toHaveCount(0);
    // Nothing was committed: the card keeps its dark background.
    await expect(chart.locator('[data-chart-surface]')).toHaveAttribute(
      'data-chart-background',
      '#0d0f14'
    );

    // Escape follows the same dirty guard.
    await editButton(chart).click();
    dialog = page.getByRole('dialog');
    await field(dialog, 'general-theme').selectOption('light');
    page.once('dialog', prompt => prompt.accept());
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);

    // Focus stays inside the dialog across a full Tab cycle.
    await editButton(chart).click();
    dialog = page.getByRole('dialog');
    await expect(dialog).toBeFocused();
    for (let index = 0; index < 8; index += 1) {
      await page.keyboard.press('Tab');
      const inside = await dialog.evaluate(node => node.contains(document.activeElement));
      expect(inside).toBe(true);
    }
    await dialog.getByRole('button', { name: 'Cancel' }).click();
  });
});

test.describe('chart editor — mobile layout', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile-only layout');

  test('full-screen dialog exposes specific options in the disclosure', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Analysis', exact: true }).click();
    await page.getByRole('button', { name: 'Library', exact: true }).click();
    await page.getByLabel('Search analyses', { exact: true }).fill('ANOVA');
    await page.locator('button[title="Compare means across groups with post-hoc tests."]').click();
    await expect(page.getByRole('heading', { name: 'ANOVA' })).toBeVisible();
    await page.getByRole('button', { name: 'Run analysis' }).click();
    await expect(output(page)).toHaveCount(1);
    const chart = await waitCardChart(page, 'anova-box');
    await editButton(chart).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const viewport = page.viewportSize();
    const box = await dialog.boundingBox();
    // The dialog uses the visual viewport (100dvw) even when the surrounding
    // console has a wider layout viewport.
    expect(box?.width).toBeCloseTo(viewport?.width ?? 0, 0);
    expect(box?.height).toBeCloseTo(viewport?.height ?? 0, 0);

    await dialog.getByText('Specific options', { exact: true }).click();
    await expect(field(dialog, 'showPoints')).toBeVisible();
    await field(dialog, 'showMean').check();
    const preview = dialog.locator('[data-chart-surface]');
    await waitPreview(page, preview);
    await page.screenshot({ path: 'test-results/chart-editor-audit/anova-box-mobile.png' });
    await dialog.getByRole('button', { name: 'Done' }).click();
    await expect(dialog).toHaveCount(0);
  });
});

test.describe('chart editor — visual baselines', () => {
  test.skip(({ isMobile }) => isMobile, 'baselines are captured on desktop');

  test('ANOVA box editor baseline', async ({ page }) => {
    test.skip(process.env.VISUAL !== '1', 'set VISUAL=1 to run visual baselines');
    await runAnova(page);
    const { dialog } = await openEditor(page, 'anova-box');
    await expect(dialog).toHaveScreenshot('anova-box-editor.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });

  test('regression scatter annotations baseline', async ({ page }) => {
    test.skip(process.env.VISUAL !== '1', 'set VISUAL=1 to run visual baselines');
    await runRegression(page);
    const { dialog, preview } = await openEditor(page, 'reg-scatter');
    await field(dialog, 'equation').selectOption('full');
    await field(dialog, 'showR2').check();
    await field(dialog, 'showN').check();
    await waitPreview(page, preview);
    await expect(dialog).toHaveScreenshot('regression-scatter-annotations.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });
});
