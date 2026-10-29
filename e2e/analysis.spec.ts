import { expect, test, type Page } from '@playwright/test';

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
