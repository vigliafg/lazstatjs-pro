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

test('edits a chart in the popup and keeps the choice after reload', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the chart editor is exercised on the desktop layout');

  await page.goto('/');
  await openAnova(page);
  await page.getByRole('button', { name: 'Run analysis' }).click();
  const card = page.locator('article.output-card');
  await expect(card).toHaveCount(1);
  const surface = card.locator('[data-chart-surface]').first();
  await expect(surface).toHaveAttribute('data-chart-state', 'ready', { timeout: 15000 });

  await page.getByRole('button', { name: /Edit chart/ }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Theme').selectOption('light');
  await dialog.getByRole('button', { name: 'Done' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(card.locator('[data-chart-surface]').first()).toHaveAttribute('data-chart-background', '#ffffff');

  await page.waitForTimeout(1200);
  await page.reload();
  await page.getByRole('button', { name: 'Analysis', exact: true }).click();
  await expect(page.locator('article.output-card')).toHaveCount(1);
  await expect(page.locator('article.output-card [data-chart-surface]').first()).toHaveAttribute(
    'data-chart-background',
    '#ffffff',
    { timeout: 15000 }
  );
});

test('chart defaults apply to new runs and survive reload', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the settings defaults are exercised on the desktop layout');

  await page.goto('/');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Charts' })).toBeVisible();
  const chartsSection = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Charts' }) });
  await chartsSection.getByLabel('Theme').selectOption('light');
  await page.waitForTimeout(1200);
  await page.reload();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(chartsSection.getByLabel('Theme')).toHaveValue('light');

  await page.getByRole('button', { name: 'Analysis', exact: true }).click();
  await openAnova(page);
  await page.getByRole('button', { name: 'Run analysis' }).click();
  await expect(page.locator('[data-chart-surface]').first()).toHaveAttribute(
    'data-chart-background',
    '#ffffff',
    { timeout: 15000 }
  );
});

test('exports ready charts as PNG and in the printable report', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the export toolbar is exercised on the desktop layout');

  await page.goto('/');
  await openAnova(page);
  await page.getByRole('button', { name: 'Run analysis' }).click();
  await expect(page.locator('article.output-card [data-chart-surface]').first()).toHaveAttribute(
    'data-chart-state',
    'ready',
    { timeout: 15000 }
  );

  const png = page.waitForEvent('download', download => download.suggestedFilename().endsWith('.png'));
  await page.getByRole('button', { name: 'Download every chart as PNG' }).click();
  await expect(await png).toBeTruthy();

  const report = page.waitForEvent('download', download => download.suggestedFilename().endsWith('.html'));
  await page.getByRole('button', { name: 'Export session report' }).click();
  await page.getByRole('menuitem', { name: 'Download a printable HTML report' }).click();
  const download = await report;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const html = Buffer.concat(chunks).toString('utf8');
  expect(html).toContain('<svg');
  expect(html).toContain('data-chart-surface');
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
  const firstNumber = await page.locator('article.output-card').getAttribute('data-run-number');
  await page.getByLabel('ANOVA dependent variable').selectOption('3');
  await expect(page.locator('article.output-card')).toHaveCount(1, { timeout: 5000 });
  await expect(page.locator('article.output-card')).toHaveAttribute('data-run-number', firstNumber ?? '1');
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
  await expect(page.locator('article.output-card:visible')).toHaveCount(1);
  await filter.selectOption({ label: 'All analyses' });

  await page.getByRole('button', { name: 'Pin result' }).first().click();
  await expect(page.getByRole('button', { name: 'Unpin result' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy result card' })).toHaveCount(2);

  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Clear every result block' }).click();
  await expect(page.locator('article.output-card')).toHaveCount(0);
});

test('shows the session identity and navigates the outline tree', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the side outline is exercised on the desktop layout');

  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/');
  await openAnova(page);
  await page.getByRole('button', { name: 'Run analysis' }).click();
  await page.getByLabel('Search analyses').fill('T-Test');
  await page.locator('button[title="Compare two means or paired measurements."]').click();
  await page.getByRole('button', { name: 'Run analysis' }).click();
  await expect(page.locator('article.output-card')).toHaveCount(2);

  const header = page.locator('[data-session-header]');
  await expect(header).toContainText('Session report');
  await expect(header).toContainText('Dataset');
  await expect(header).toContainText('Analyses');

  const tree = page.getByRole('tree', { name: 'Outline' });
  await expect(tree).toBeVisible();
  await expect(tree.getByRole('treeitem', { name: /Compare groups/ })).toBeVisible();
  await expect(tree.getByRole('treeitem', { name: /ANOVA/ }).first()).toBeVisible();
  await expect(tree.locator('[data-tree-key^="run:"]')).toHaveCount(2);

  // Search narrows both the outline and the cards without unmounting them.
  await page.getByLabel('Search run reports').fill('T-Test');
  await expect(tree.locator('[data-tree-key^="run:"]')).toHaveCount(1);
  await expect(page.locator('article.output-card:visible')).toHaveCount(1);
  await page.getByLabel('Search run reports').fill('');

  // State filters keep their counts and only hide non-matching runs.
  await expect(page.getByRole('button', { name: /^All 2$/ })).toBeVisible();
  await page.locator('[data-tree-key^="run:"]').first().click();
  await expect(tree.locator('[aria-selected="true"]')).toHaveCount(1);

  // Collapse and re-expand a family from the tree.
  const family = tree.getByRole('treeitem', { name: /Compare groups/ });
  await family.click();
  await expect(tree.locator('[data-tree-key^="analysis:"]')).toHaveCount(0);
  await family.click();
  await expect(tree.locator('[data-tree-key^="analysis:"]')).toHaveCount(2);

  // Arrow keys move the roving focus between visible nodes.
  await family.focus();
  await page.keyboard.press('ArrowDown');
  await expect(tree.locator('[data-tree-key^="analysis:"]:focus')).toHaveCount(1);
});

test('restores pins, closed groups and outline filters after reload', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the side outline is exercised on the desktop layout');

  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/');
  await openAnova(page);
  await page.getByRole('button', { name: 'Run analysis' }).click();
  await page.getByLabel('Search analyses').fill('T-Test');
  await page.locator('button[title="Compare two means or paired measurements."]').click();
  await page.getByRole('button', { name: 'Run analysis' }).click();
  await expect(page.locator('article.output-card')).toHaveCount(2);

  await page.getByRole('button', { name: 'Pin result' }).first().click();
  const tree = page.getByRole('tree', { name: 'Outline' });
  await tree.getByRole('treeitem', { name: /Compare groups/ }).click();
  await expect(tree.locator('[data-tree-key^="analysis:"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Pinned 1' }).click();
  await expect(page.locator('article.output-card:visible')).toHaveCount(1);

  // Switching tabs unmounts the console: the state must come back on return.
  await page.getByRole('button', { name: 'Data', exact: true }).click();
  await page.getByRole('button', { name: 'Analysis', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Unpin result' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pinned 1' })).toHaveAttribute('aria-pressed', 'true');

  // View state is written synchronously, so an immediate reload keeps it.
  await page.reload();
  await page.getByRole('button', { name: 'Analysis', exact: true }).click();

  await expect(page.getByRole('button', { name: 'Unpin result' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pinned 1' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('article.output-card:visible')).toHaveCount(1);
  await expect(tree.getByRole('treeitem', { name: /Compare groups/ })).toHaveAttribute('aria-expanded', 'false');
  await expect(tree.locator('[data-tree-key^="analysis:"]')).toHaveCount(0);
});

test('opens the outline as a drawer on a narrow output pane', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the drawer is exercised on the desktop layout with narrow panes');

  await page.goto('/');
  await openAnova(page);
  await page.getByRole('button', { name: 'Run analysis' }).click();
  await expect(page.locator('article.output-card')).toHaveCount(1);

  const toggle = page.getByRole('button', { name: 'Outline', exact: true });
  await expect(toggle).toBeVisible();
  await expect(page.getByRole('tree', { name: 'Outline' })).toHaveCount(0);
  await toggle.click();
  const dialog = page.getByRole('dialog', { name: 'Outline' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('treeitem', { name: /ANOVA/ }).first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('exports a single run-report without other cards', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the export toolbar is exercised on the desktop layout');

  await page.goto('/');
  await openAnova(page);
  await page.getByRole('button', { name: 'Run analysis' }).click();
  await expect(page.locator('article.output-card')).toHaveCount(1);
  await page.getByLabel('Search analyses').fill('T-Test');
  await page.locator('button[title="Compare two means or paired measurements."]').click();
  await page.getByRole('button', { name: 'Run analysis' }).click();
  await expect(page.locator('article.output-card')).toHaveCount(2);

  const card = page.locator('article.output-card').first();
  const download = page.waitForEvent('download', item => item.suggestedFilename().endsWith('.html'));
  await card.getByRole('button', { name: 'Export run report' }).click();
  await card.getByRole('menuitem', { name: 'Download this run report as HTML' }).click();
  const stream = await (await download).createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const html = Buffer.concat(chunks).toString('utf8');
  expect(html).toContain('ANOVA');
  expect(html).not.toContain('T-Test');
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
