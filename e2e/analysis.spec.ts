import { expect, test, type Page } from '@playwright/test';
import path from 'node:path';

const openAnova = async (page: Page) => {
  await page.getByRole('button', { name: 'Analysis', exact: true }).click();
  await page.getByLabel('Search analyses').fill('ANOVA');
  await page.locator('button[title="Compare means across groups with post-hoc tests."]').click();
};

test('search, select and run an analysis', async ({ page, isMobile }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Analysis', exact: true }).click();
  if (isMobile) await page.getByRole('button', { name: 'Library', exact: true }).click();
  await page.getByLabel('Search analyses').fill('ANOVA');
  await page.locator('button[title="Compare means across groups with post-hoc tests."]').click();
  await expect(page.getByRole('heading', { name: 'ANOVA' })).toBeVisible();
  await page.getByRole('button', { name: 'Run analysis' }).click();

  await expect(page.locator('article.output-card')).toHaveCount(1);
  await expect(page.getByText('Outline')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open the setup of this analysis' })).toBeVisible();
});

test('collapses a result and reopens it from the setup shortcut', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the setup panel is exercised on the desktop layout');

  await page.goto('/');
  await openAnova(page);
  await page.getByRole('button', { name: 'Run analysis' }).click();

  await page.getByRole('button', { name: 'Collapse result' }).click();
  await expect(page.getByRole('button', { name: 'Expand result' })).toBeVisible();

  await page.getByRole('button', { name: 'Open the setup of this analysis' }).click();
  await expect(page.getByRole('heading', { name: 'ANOVA' })).toBeVisible();
  await page.getByRole('button', { name: 'Run analysis' }).click();
  await expect(page.locator('article.output-card')).toHaveCount(2);
});

test('onboards a new user through the three goals', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the library onboarding is exercised on the desktop layout');

  await page.goto('/');
  await page.getByRole('button', { name: 'Analysis', exact: true }).click();
  await expect(page.getByText('Start here', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Compare groups', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'T-Test' })).toBeVisible();
  await expect(page.getByText('Start here', { exact: true })).toHaveCount(0);
});

test('hides advanced sections in Guided mode and shows them in Expert mode', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the mode switch is exercised on the desktop layout');

  await page.goto('/');
  await page.getByRole('button', { name: 'Analysis', exact: true }).click();
  await page.getByLabel('Search analyses').fill('Regression');
  await page.locator('button[title="Ordinary least squares with robust options."]').click();

  await expect(page.getByText('Robust SE', { exact: true })).toHaveCount(0);
  await page.getByLabel('Interface mode').selectOption('expert');
  await expect(page.getByText('Robust SE', { exact: true })).toHaveCount(1);
});

test('shows an inline error when a numeric field is empty', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the setup form is exercised on the desktop layout');

  await page.goto('/');
  await page.getByRole('button', { name: 'Analysis', exact: true }).click();
  await page.getByLabel('Search analyses').fill('T-Test');
  await page.locator('button[title="Compare two means or paired measurements."]').click();
  await page.getByLabel('Test type').selectOption('one');
  await page.getByLabel('Test mean (μ₀)').fill('');

  await expect(page.getByText('Enter a number')).toBeVisible();
});

test('associates a form label with its control', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the setup form is exercised on the desktop layout');

  await page.goto('/');
  await page.getByRole('button', { name: 'Analysis', exact: true }).click();
  await page.getByLabel('Search analyses').fill('T-Test');
  await page.locator('button[title="Compare two means or paired measurements."]').click();

  await page.locator('label', { hasText: 'Test type' }).click();
  await expect(page.getByLabel('Test type')).toBeFocused();
});

test('marks cards stale when the CI changes and re-runs with the saved level', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the CI selector is exercised on the desktop layout');

  await page.goto('/');
  await openAnova(page);
  await page.getByRole('button', { name: 'Run analysis' }).click();
  await expect(page.getByText('stale', { exact: true })).toHaveCount(0);

  await page.getByLabel('Confidence level').selectOption('99');
  await expect(page.getByText('stale', { exact: true })).toHaveCount(1);

  await page.getByRole('button', { name: 'Re-run with saved parameters' }).click();
  await expect(page.locator('article.output-card')).toHaveCount(2);
  // Re-run restores the card's CI in the setup, so neither card is stale.
  await expect(page.getByText('stale', { exact: true })).toHaveCount(0);
});

test('restores cards and their saved parameters after reload', async ({ page, isMobile }) => {
  test.skip(isMobile, 'reload persistence is covered on desktop');

  await page.goto('/');
  await openAnova(page);
  await page.getByLabel('ANOVA dependent variable').selectOption('3');
  await page.getByRole('button', { name: 'Run analysis' }).click();
  await expect(page.locator('article.output-card')).toHaveCount(1);

  // Autosave is debounced by 800 ms.
  await page.waitForTimeout(1200);
  await page.reload();

  await page.getByRole('button', { name: 'Analysis', exact: true }).click();
  const card = page.locator('article.output-card');
  await expect(card).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Re-run with saved parameters' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Apply parameters to setup' })).toBeVisible();
  // The persisted dataset/revision must make an untouched project fresh.
  await expect(page.getByText('stale', { exact: true })).toHaveCount(0);

  await page.getByRole('button', { name: 'Data', exact: true }).click();
  await page.locator('input[data-cell="0-0"]').fill('51');
  await page.getByRole('button', { name: 'Analysis', exact: true }).click();
  await expect(page.getByText('stale', { exact: true })).toHaveCount(1);
});

test('runs an analysis on the mobile layout', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile-only flow');

  await page.goto('/');
  await page.getByRole('button', { name: 'Analysis', exact: true }).click();
  await page.getByRole('button', { name: 'Library', exact: true }).click();
  await page.getByLabel('Search analyses').fill('ANOVA');
  await page.locator('button[title="Compare means across groups with post-hoc tests."]').click();
  await page.getByRole('button', { name: 'Run analysis' }).click();

  await expect(page.locator('article.output-card')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Collapse result' })).toBeVisible();
});

test('live-run replaces one card when parameters change', async ({ page, isMobile }) => {
  test.skip(isMobile, 'live-run toggle is exercised on the desktop layout');

  await page.goto('/');
  await openAnova(page);
  await page.getByRole('button', { name: 'Live run' }).click();

  await expect(page.locator('article.output-card')).toHaveCount(1, { timeout: 5000 });
  await page.getByLabel('ANOVA dependent variable').selectOption('3');
  await expect(page.locator('article.output-card')).toHaveCount(1, { timeout: 5000 });
  await expect(page.getByRole('button', { name: 'Live run' })).toHaveAttribute('aria-pressed', 'true');
});

test('turning Live off invalidates the pending run', async ({ page, isMobile }) => {
  test.skip(isMobile, 'live-run toggle is exercised on the desktop layout');

  await page.goto('/');
  await openAnova(page);
  await page.getByRole('button', { name: 'Live run' }).click();
  await expect(page.locator('article.output-card')).toHaveCount(1, { timeout: 5000 });

  await page.getByLabel('ANOVA dependent variable').selectOption('3');
  await page.getByRole('button', { name: 'Live run' }).click();
  await page.waitForTimeout(800);

  await expect(page.locator('article.output-card')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Live run' })).toHaveAttribute('aria-pressed', 'false');
});

test('re-runs every stored card in one action', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the output workspace is exercised on the desktop layout');

  await page.goto('/');
  await openAnova(page);
  await page.getByRole('button', { name: 'Run analysis' }).click();
  await page.getByLabel('Search analyses').fill('T-Test');
  await page.locator('button[title="Compare two means or paired measurements."]').click();
  await page.getByRole('button', { name: 'Run analysis' }).click();
  await expect(page.locator('article.output-card')).toHaveCount(2);

  await page.getByLabel('Run every stored card again with its saved parameters').click();
  await expect(page.locator('article.output-card')).toHaveCount(4);
});

test('filters, pins and clears result cards', async ({ page, isMobile }) => {
  test.skip(isMobile, 'output workspace is exercised on the desktop layout');

  await page.goto('/');
  await openAnova(page);
  await page.getByRole('button', { name: 'Run analysis' }).click();

  await page.getByLabel('Search analyses').fill('T-Test');
  await page.locator('button[title="Compare two means or paired measurements."]').click();
  await page.getByRole('button', { name: 'Run analysis' }).click();
  await expect(page.locator('article.output-card')).toHaveCount(2);

  const filter = page.getByLabel('Filter results by analysis');
  await expect(filter).toBeVisible();
  await filter.selectOption({ label: 'ANOVA' });
  await expect(page.locator('article.output-card')).toHaveCount(1);
  await filter.selectOption({ label: 'All analyses' });

  await page.getByRole('button', { name: 'Pin result' }).first().click();
  await expect(page.getByRole('button', { name: 'Unpin result' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy result card' })).toHaveCount(2);

  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Clear every result block' }).click();
  await expect(page.locator('article.output-card')).toHaveCount(0);
});

test('hides categorical columns from continuous predictors', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the setup form is exercised on the desktop layout');

  await page.goto('/');
  await page.getByLabel(/Type.*Score_Pre/).selectOption('cat');
  await page.getByRole('button', { name: 'Analysis', exact: true }).click();
  await page.getByLabel('Search analyses').fill('Logistic');
  await page.locator('button[title="Binary outcome with odds ratios and cutoff analysis."]').click();

  await expect(page.locator('aside').locator('label', { hasText: 'Score_Pre' })).toHaveCount(0);
});

test('returns to all analyses when the filtered card is removed', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the output workspace is exercised on the desktop layout');

  await page.goto('/');
  await openAnova(page);
  await page.getByRole('button', { name: 'Run analysis' }).click();

  await page.getByLabel('Search analyses').fill('T-Test');
  await page.locator('button[title="Compare two means or paired measurements."]').click();
  await page.getByRole('button', { name: 'Run analysis' }).click();
  await expect(page.locator('article.output-card')).toHaveCount(2);

  await page.getByLabel('Filter results by analysis').selectOption({ label: 'ANOVA' });
  await page.getByRole('button', { name: 'Remove this result block' }).click();

  await expect(page.locator('article.output-card')).toHaveCount(1);
  await expect(page.getByLabel('Filter results by analysis')).toHaveCount(0);
  await expect(page.getByText('No results match this filter')).toHaveCount(0);
});

test('follows the wide breakpoint and keeps an explicit library choice', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop breakpoints are exercised here');

  await page.setViewportSize({ width: 1100, height: 800 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Analysis', exact: true }).click();
  await expect(page.getByLabel('Analysis library', { exact: true })).toBeHidden();

  await page.setViewportSize({ width: 1400, height: 800 });
  await expect(page.getByLabel('Analysis library', { exact: true })).toBeVisible();

  await page.getByTitle('Hide the analysis library').click();
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.setViewportSize({ width: 1400, height: 800 });
  await expect(page.getByLabel('Analysis library', { exact: true })).toBeHidden();
});

test('favorites, A–Z index and keyboard navigation in the library', async ({ page, isMobile }) => {
  test.skip(isMobile, 'library interactions are exercised on the desktop layout');

  await page.goto('/');
  await page.getByRole('button', { name: 'Analysis', exact: true }).click();
  await page.getByLabel('Search analyses').fill('ANOVA');
  await page.getByRole('button', { name: 'Add ANOVA to favorites' }).click();
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(page.getByText('Favorites')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Remove ANOVA from favorites' }).first()).toBeVisible();

  await page.getByRole('button', { name: 'Sort alphabetically' }).click();
  await expect(page.getByRole('button', { name: 'Sort alphabetically' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );

  const first = page.locator('[data-analysis-item]').first();
  await first.focus();
  await page.keyboard.press('ArrowDown');
  const second = await page.evaluate(() =>
    (document.activeElement as HTMLElement | null)?.dataset.analysisItem ?? null
  );
  expect(second).not.toBeNull();
});

test('runs a heavy analysis in a worker without blocking the setup', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the worker path is exercised on the desktop layout');

  await page.goto('/');
  await page.getByRole('button', { name: 'Analysis', exact: true }).click();
  await page.getByLabel('Search analyses').fill('Mixed Model');
  await page.locator('button[title="Linear mixed model with a random intercept."]').click();
  const worker = page.waitForEvent('worker', { timeout: 10000 });
  await page.getByRole('button', { name: 'Run analysis' }).click();
  expect((await worker).url()).toContain('heavy.worker');

  await expect(page.locator('article.output-card')).toHaveCount(1, { timeout: 20000 });
  await expect(page.getByRole('button', { name: 'Run analysis' })).toBeVisible();
});

test('renders chart-heavy worker output for a time series', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the worker charts are exercised on the desktop layout');

  await page.goto('/');
  await page.getByRole('button', { name: 'Analysis', exact: true }).click();
  await page.getByLabel('Search analyses').fill('ARIMA');
  await page.locator('button[title="ARIMA/SARIMA, trend and forecasting."]').click();
  const worker = page.waitForEvent('worker', { timeout: 10000 });
  await page.getByRole('button', { name: 'Run analysis' }).click();
  expect((await worker).url()).toContain('heavy.worker');

  await expect(page.locator('article.output-card')).toHaveCount(1, { timeout: 20000 });
  await expect(page.getByRole('heading', { name: 'Autocorrelazione', exact: true }).first()).toBeVisible();
});

test('imports a sample dataset and runs an analysis end to end', async ({ page, isMobile }) => {
  test.skip(isMobile, 'sample import is exercised on the desktop layout');

  await page.goto('/');
  // A small plain CSV takes the fast path and lands directly in the grid.
  const input = page.locator('input[type="file"][accept*=".csv"]');
  await input.setInputFiles(path.resolve('samples/compare/plantgrowth/data.csv'));

  await expect(page.locator('input[data-cell="0-0"]')).toHaveValue('4.17');
  await expect(page.locator('input[data-cell="0-1"]')).toHaveValue('ctrl');
  await page.getByRole('button', { name: 'Analysis', exact: true }).click();
  await page.getByLabel('Search analyses').fill('ANOVA');
  await page.locator('button[title="Compare means across groups with post-hoc tests."]').click();
  await page.getByRole('button', { name: 'Run analysis' }).click();

  await expect(page.locator('article.output-card')).toHaveCount(1);
  await expect(page.getByText('Outline')).toBeVisible();
});

test('imports an SPSS .sav file and keeps its values', async ({ page, isMobile }) => {
  test.skip(isMobile, 'binary import is exercised on the desktop layout');

  await page.goto('/');
  const input = page.locator('input[type="file"][accept*=".sav"]');
  await input.setInputFiles(path.resolve('src/io/fixtures/sample.sav'));
  const dialog = page.getByRole('dialog', { name: 'Smart Import' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('SPSS .sav')).toBeVisible();
  await expect(dialog.getByText('6 rows x 6 columns')).toBeVisible();
  await dialog.getByRole('button', { name: /^Import/ }).click();

  await expect(page.locator('input[data-cell="0-1"]')).toHaveValue('12.5');
  await expect(page.locator('input[data-cell="2-1"]')).toHaveValue('');
  await expect(page.locator('input[data-cell="4-4"]')).toHaveValue('2024-01-05');
});

test('imports a Stata .dta file and keeps its values', async ({ page, isMobile }) => {
  test.skip(isMobile, 'binary import is exercised on the desktop layout');

  await page.goto('/');
  const input = page.locator('input[type="file"][accept*=".dta"]');
  await input.setInputFiles(path.resolve('src/io/fixtures/sample.dta'));
  const dialog = page.getByRole('dialog', { name: 'Smart Import' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Stata .dta')).toBeVisible();
  await dialog.getByRole('button', { name: /^Import/ }).click();

  await expect(page.locator('input[data-cell="0-4"]')).toHaveValue('2024-01-01');
  await expect(page.locator('input[data-cell="3-3"]')).toHaveValue('');
});
