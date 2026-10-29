import { test, expect } from '@playwright/test';

// The three checks share the same dev server and the same iframe surface: run
// them in order so the first-load of the book cannot race the server start.
test.describe.configure({ mode: 'serial' });

/**
 * Language menu and handbook integration.
 *
 * The catalogs are unit-tested; these checks protect the parts that only exist
 * in the browser: the reactive language switch, its persistence and the iframe
 * of the generated book (tab and popup).
 */
test('the interface language switches and persists across reloads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Data', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('main').getByLabel('Interface language').selectOption('it');

  await expect(page.getByRole('button', { name: 'Dati', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Analisi', exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('button', { name: 'Dati', exact: true })).toBeVisible();
});

test('the help tab hosts the generated book', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Help', exact: true }).click();

  const book = page.frameLocator('iframe[title="Help handbook"]');
  await expect(book.locator('h1')).toHaveText('LazStats Handbook');
  await expect(book.getByRole('link', { name: 'T-Test' }).first()).toBeVisible();
});

test('the procedure popup deep-links to the handbook page', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the analysis panel is exercised on the desktop layout');
  await page.goto('/');
  await page.getByRole('button', { name: 'Analysis', exact: true }).click();
  await page.getByPlaceholder('Search analyses…').fill('T-Test');
  await page.getByText('T-Test', { exact: true }).first().click();

  await page.getByRole('button', { name: 'Open the handbook page for this procedure' }).click();
  const dialog = page.getByRole('dialog', { name: 'Help handbook' });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('iframe')).toHaveAttribute('src', /\/help\/en\/ttest\.html#tutorial$/);

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('the report language switches the written card, not just the interface', async ({ page, isMobile }) => {
  test.skip(isMobile, 'analysis runs are exercised on the desktop layout');
  await page.goto('/');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('main').getByLabel('Report language').selectOption('en');

  await page.getByRole('button', { name: 'Analysis', exact: true }).click();
  await page.getByPlaceholder('Search analyses…').fill('T-Test');
  await page.getByText('T-Test', { exact: true }).first().click();
  await page.getByRole('button', { name: 'Run analysis' }).click();

  await expect(page.getByText('Reading report — T-Test')).toBeVisible();
  await expect(page.getByText('The main test')).toBeVisible();
  await expect(page.getByText('Report di lettura — Test t')).toHaveCount(0);
});

test('the German wave reaches the interface, the handbook and the report', async ({ page, isMobile }) => {
  test.skip(isMobile, 'analysis runs are exercised on the desktop layout');
  await page.goto('/');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('main').getByLabel('Report language').selectOption('de');
  await page.getByRole('main').getByLabel('Interface language').selectOption('de');

  await expect(page.getByRole('button', { name: 'Daten', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Hilfe', exact: true }).click();
  const book = page.frameLocator('iframe[title="Hilfehandbuch"]');
  await expect(book.locator('h1')).toHaveText('LazStats Handbuch');

  await page.getByRole('button', { name: 'Analyse', exact: true }).click();
  await page.getByPlaceholder('Analysen suchen…').fill('T-Test');
  await page.getByText('T-Test', { exact: true }).first().click();
  await page.getByRole('button', { name: 'Analyse ausführen' }).click();
  await expect(page.getByText('Lesetext — t-Test')).toBeVisible();
});

for (const [locale, nav, helpTab, bookTitle] of [
  ['fr', 'Données', 'Aide', 'Manuel LazStats'],
  ['es', 'Datos', 'Ayuda', 'Manual de LazStats'],
  ['pt-PT', 'Dados', 'Ajuda', 'Manual do LazStats'],
] as const) {
  test(`the ${locale} wave reaches the interface and the handbook`, async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await page.getByRole('main').getByLabel('Interface language').selectOption(locale);

    await expect(page.getByRole('button', { name: nav, exact: true })).toBeVisible();
    await page.getByRole('button', { name: helpTab, exact: true }).click();
    const book = page.frameLocator('main iframe');
    await expect(book.locator('h1')).toHaveText(bookTitle);
    await expect(book.locator('a[href$=".html"]').first()).toBeVisible();
  });
}
