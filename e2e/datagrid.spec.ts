import { expect, test, type Page } from '@playwright/test';
import path from 'node:path';
import * as XLSX from 'xlsx';

/**
 * Data-grid audit: toolbar import/export, CSV preview, transform operations,
 * row/column edits, type validation and missing values.
 */

const cell = (page: Page, r: number, c: number) => page.locator(`input[data-cell="${r}-${c}"]`);
const fileInput = (page: Page) => page.locator('input[type="file"][accept*=".csv"]');
const importDialog = (page: Page) => page.getByRole('dialog', { name: 'Smart Import' });
const exportDialog = (page: Page) => page.getByRole('dialog', { name: 'Export data' });
const transform = (page: Page, name: string) => page.locator(`[data-transform="${name}"]`);

const upload = async (page: Page, file: string) => {
  await fileInput(page).setInputFiles(path.resolve('e2e/fixtures', file));
  await expect(importDialog(page)).toBeVisible();
};

const downloadText = async (download: import('@playwright/test').Download): Promise<string> => {
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
};

test.describe('data grid — import and preview', () => {
  test.skip(({ isMobile }) => isMobile, 'file import is exercised on desktop');

  test('CSV preview, header/decimal detection, type override and merge columns', async ({ page }) => {
    await page.goto('/');
    await upload(page, 'preview-semicolon.csv');
    const dialog = importDialog(page);
    await expect(dialog).toContainText(/3 rows x 3 columns/);
    await expect(dialog.locator('[data-import="delimiter"]')).toHaveValue('auto');
    await expect(dialog).toContainText(/detected: ;/);
    await expect(dialog.locator('[data-import="decimals"]')).toHaveValue('comma');
    await expect(dialog.locator('[data-import="type"]').nth(1)).toHaveValue('dec');
    await expect(dialog).toContainText('1.5');

    // Preview type overrides survive the apply and become column metadata.
    await dialog.locator('[data-import="type"]').nth(0).selectOption('cat');
    await dialog.locator('[data-import="mode"]').selectOption('append-cols');
    await expect(dialog.locator('[data-import="mapping"]')).toContainText(/0 matched columns · 3 new/);
    await dialog.locator('[data-import="apply"]').click();
    await expect(dialog).toHaveCount(0);

    await expect(page.getByLabel('Type: Gruppo')).toHaveValue('cat');
    await expect(page.locator('[data-cell="0-4"]')).toHaveValue('A');
    await expect(cell(page, 0, 5)).toHaveValue('1.5');
    await expect(cell(page, 0, 6)).toHaveValue('ok');
    await expect(cell(page, 2, 6)).toHaveValue('a;b');
    // Existing dataset is preserved by merge columns.
    await expect(cell(page, 0, 0)).toHaveValue('50');
  });

  test('append rows keeps the grid and adds the imported rows by name', async ({ page }) => {
    await page.goto('/');
    await upload(page, 'grid-rows.tsv');
    const dialog = importDialog(page);
    await dialog.locator('[data-import="mode"]').selectOption('append-rows');
    await expect(dialog.locator('[data-import="mapping"]')).toContainText('Rows aligned by column position');
    await dialog.locator('[data-import="apply"]').click();
    await expect(dialog).toHaveCount(0);

    await expect(page.getByLabel('Type: Score_Pre')).toBeVisible();
    await expect(cell(page, 20, 0)).toHaveValue('61');
    await expect(cell(page, 21, 3)).toHaveValue('31');
    await expect(page.locator('input[data-cell="22-0"]')).toHaveCount(0);
  });

  test('an invalid payload is shown in the preview and cannot be applied', async ({ page }) => {
    await page.goto('/');
    await upload(page, 'invalid.json');
    const dialog = importDialog(page);
    await expect(dialog).toContainText('No data rows found');
    await expect(dialog.locator('[data-import="apply"]')).toBeDisabled();
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).toHaveCount(0);
  });
});

test.describe('data grid — export', () => {
  test.skip(({ isMobile }) => isMobile, 'file export is exercised on desktop');

  test('CSV, JSON and XLSX are downloaded from the current grid', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Export', exact: true }).click();
    let dialog = exportDialog(page);
    await expect(dialog).toBeVisible();

    let pending = page.waitForEvent('download');
    await dialog.locator('[data-export="download"]').click();
    const csv = await downloadText(await pending);
    expect(csv).toContain('Score_Pre,Score_Post,Group,Age');
    expect(csv).toContain('50,60,1,20');

    await page.getByRole('button', { name: 'Export', exact: true }).click();
    dialog = exportDialog(page);
    await dialog.locator('[data-export="format"]').selectOption('json');
    pending = page.waitForEvent('download');
    await dialog.locator('[data-export="download"]').click();
    const json = JSON.parse(await downloadText(await pending));
    expect(json).toHaveLength(20);
    expect(json[0].Score_Pre).toBe('50');

    await page.getByRole('button', { name: 'Export', exact: true }).click();
    dialog = exportDialog(page);
    await dialog.locator('[data-export="format"]').selectOption('xlsx');
    pending = page.waitForEvent('download');
    await dialog.locator('[data-export="download"]').click();
    const download = await pending;
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    const workbook = XLSX.read(Buffer.concat(chunks), { type: 'buffer' });
    expect(workbook.SheetNames).toContain('Dati');
    expect(workbook.Sheets['Dati']['A1'].v).toBe('Score_Pre');
    expect(workbook.Sheets['Dati']['A2'].v).toBe(50);
  });

  test('export can restrict rows to the active analysis filter', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Filter' }).click();
    await page.getByPlaceholder('Value').fill('50');
    await page.getByRole('button', { name: 'View only' }).click();

    await page.getByRole('button', { name: 'Export', exact: true }).click();
    const dialog = exportDialog(page);
    await expect(dialog.getByLabel('Only rows passing the analysis filter')).toBeVisible();
    await dialog.getByLabel('Only rows passing the analysis filter').check();
    const pending = page.waitForEvent('download');
    await dialog.locator('[data-export="download"]').click();
    const csv = await downloadText(await pending);
    expect(csv.trim().split('\n')).toHaveLength(2);
    expect(csv).toContain('50,60,1,20');
  });
});

test.describe('data grid — transform operations', () => {
  test.skip(({ isMobile }) => isMobile, 'transform panel is exercised on desktop');

  test('split creates a new column and preserves the left values', async ({ page }) => {
    await page.goto('/');
    await cell(page, 0, 0).fill('x;y');
    await cell(page, 1, 0).fill('p;q');
    await page.getByRole('button', { name: 'Transform' }).click();
    await transform(page, 'split-col').selectOption('0');
    await transform(page, 'split-sep').fill(';');
    await transform(page, 'split-apply').click();

    await expect(page.getByLabel('Type: Score_Pre_2')).toBeVisible();
    await expect(cell(page, 0, 0)).toHaveValue('x');
    await expect(cell(page, 0, 1)).toHaveValue('y');
    await expect(cell(page, 1, 1)).toHaveValue('q');
  });

  test('split all creates every part as a new column', async ({ page }) => {
    await page.goto('/');
    await cell(page, 0, 0).fill('a;b;c');
    await page.getByRole('button', { name: 'Transform' }).click();
    await transform(page, 'split-col').selectOption('0');
    await transform(page, 'split-sep').fill(';');
    await transform(page, 'split-all').click();

    await expect(page.getByLabel('Type: Score_Pre_2')).toBeVisible();
    await expect(page.getByLabel('Type: Score_Pre_3')).toBeVisible();
    await expect(cell(page, 0, 0)).toHaveValue('a');
    await expect(cell(page, 0, 1)).toHaveValue('b');
    await expect(cell(page, 0, 2)).toHaveValue('c');
  });

  test('merge concatenates two columns as text and removes the right one', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Transform' }).click();
    await transform(page, 'merge-sep').fill('-');
    await transform(page, 'merge-apply').click();

    await expect(page.getByLabel('Type: Score_Pre_Score_Post')).toHaveValue('str');
    await expect(cell(page, 0, 0)).toHaveValue('50-60');
    await expect(page.locator('[data-cell="0-3"]')).toHaveCount(0);
  });

  test('recode maps values and reports the number of changed cells', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Transform' }).click();
    await transform(page, 'recode-col').selectOption('0');
    await transform(page, 'recode-map').fill('50=99');
    await transform(page, 'recode-apply').click();

    await expect(cell(page, 0, 0)).toHaveValue('99');
    await expect(cell(page, 1, 0)).toHaveValue('52');
    await expect(page.getByText(/1 cells recoded/)).toBeVisible();
  });
});

test.describe('data grid — rows, columns and validation', () => {
  test.skip(({ isMobile }) => isMobile, 'grid menus are exercised on desktop');

  test('inserts and deletes a column through the header menu', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('columnheader').filter({ hasText: 'Score_Pre' }).first().click({ button: 'right' });
    await page.getByRole('button', { name: 'Insert column right' }).click();
    await expect(page.getByLabel('Type: Var5')).toBeVisible();

    await page.getByRole('columnheader').filter({ hasText: 'Var5' }).first().click({ button: 'right' });
    page.once('dialog', prompt => prompt.accept());
    await page.getByRole('button', { name: 'Delete column' }).click();
    await expect(page.getByLabel('Type: Var5')).toHaveCount(0);
  });

  test('inserts and deletes a row through the row menu', async ({ page }) => {
    await page.goto('/');
    await page.locator('tbody th[scope="row"]').first().click({ button: 'right' });
    await page.getByRole('button', { name: 'Insert row above' }).click();
    await expect(cell(page, 0, 0)).toHaveValue('');
    await expect(cell(page, 1, 0)).toHaveValue('50');

    await page.locator('tbody th[scope="row"]').first().click({ button: 'right' });
    page.once('dialog', prompt => prompt.accept());
    await page.getByRole('button', { name: 'Delete row' }).click();
    await expect(cell(page, 0, 0)).toHaveValue('50');
  });

  test('type changes mark invalid cells and Validate reports them', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/Type.*Score_Pre/).selectOption('int');
    await cell(page, 0, 0).fill('abc');
    await expect(cell(page, 0, 0)).toHaveClass(/cell-invalid/);
    await page.getByRole('button', { name: 'Validate' }).click();
    await expect(page.getByText(/1 INVALID/)).toBeVisible();

    await page.getByLabel(/Type.*Score_Pre/).selectOption('cat');
    await expect(page.locator('[data-cell="0-0"]')).not.toHaveClass(/cell-invalid/);
  });

  test('a missing code is declared per column and survives validation', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Variables' }).click();
    await page.getByLabel('Add a missing code').fill('50');
    await page.getByLabel('Add a missing code').press('Enter');
    await expect(page.getByText(/excluded from analyses/)).toBeVisible();
    await expect(page.getByText('50', { exact: true })).toBeVisible();
  });
});

test.describe('data grid — grouping variables', () => {
  test.skip(({ isMobile }) => isMobile, 'group pickers are exercised on desktop');

  test('categorical columns join the group picker; identifiers do not', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/Type.*Age/).selectOption('cat');
    await page.getByRole('button', { name: 'Analysis', exact: true }).click();
    await page.getByLabel('Search analyses').fill('ANOVA');
    await page.locator('button[title="Compare means across groups with post-hoc tests."]').click();
    await expect(page.getByLabel('ANOVA group variable').locator('option', { hasText: 'Age' })).toHaveCount(1);

    await page.getByRole('button', { name: 'Data', exact: true }).click();
    await page.getByLabel(/Type.*Age/).selectOption('id');
    await page.getByRole('button', { name: 'Analysis', exact: true }).click();
    await expect(page.getByLabel('ANOVA group variable').locator('option', { hasText: 'Age' })).toHaveCount(0);
  });
});
