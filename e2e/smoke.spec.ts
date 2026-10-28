import { expect, test } from '@playwright/test';

test('loads the seed grid', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('input[data-cell="0-0"]')).toHaveValue('50');
  await expect(page.getByRole('button', { name: 'Data' })).toHaveClass(/active/);
});

test('edits a cell and undoes it', async ({ page }) => {
  await page.goto('/');
  const cell = page.locator('input[data-cell="0-0"]');
  await cell.fill('123');
  await expect(cell).toHaveValue('123');

  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(cell).toHaveValue('50');
});

test('declares a missing code from the variable inspector', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the inspector is hidden at mobile widths');

  await page.goto('/');
  await page.getByRole('button', { name: 'Variables' }).click();
  await page.getByLabel('Add a missing code').fill('50');
  await page.getByLabel('Add a missing code').press('Enter');

  await expect(page.getByText('-9 or NA')).toHaveCount(0);
  await expect(page.getByText('50', { exact: true })).toBeVisible();
  await expect(page.getByText(/excluded from analyses/)).toBeVisible();
});

test('assigns the focused column to a non-primary role', async ({ page, isMobile }) => {
  test.skip(isMobile, 'role assignment is exercised on the desktop layout');

  await page.goto('/');
  await page.locator('input[data-cell="0-3"]').click();
  await page.getByRole('button', { name: 'Analysis' }).click();

  await page.getByLabel('Search analyses').fill('ANOVA');
  await page.locator('button[title="Compare means across groups with post-hoc tests."]').click();
  await expect(page.getByText('Focused: Age')).toBeVisible();

  await page.getByRole('button', { name: 'Data peek' }).click();
  await expect(page.getByText('group variable: Group')).toBeVisible();

  await page.getByLabel('Role to assign the focused column to').selectOption('grp');
  await page.getByRole('button', { name: 'Assign' }).click();
  await expect(page.getByText('group variable: Age')).toBeVisible();
});

test('blocks the run after a type change makes a role incompatible', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the desktop layout keeps the setup panel visible');

  await page.goto('/');
  await page.getByLabel('Data type for Score_Pre').selectOption('cat');
  await page.getByRole('button', { name: 'Analysis' }).click();

  await page.getByLabel('Search analyses').fill('ANOVA');
  await page.locator('button[title="Compare means across groups with post-hoc tests."]').click();

  await expect(page.getByText('Reselect variables')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Run analysis' })).toBeDisabled();
});
