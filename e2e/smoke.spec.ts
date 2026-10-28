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

test('virtualises large grids and scrolls to the last row', async ({ page, isMobile }) => {
  test.skip(isMobile, 'large paste is exercised on the desktop layout');

  await page.goto('/');
  await page.locator('input[data-cell="0-0"]').focus();
  await page.evaluate(() => {
    const block = Array.from({ length: 500 }, (_, i) => `r${i}\t${i}`).join('\n');
    const data = new DataTransfer();
    data.setData('text/plain', block);
    document
      .querySelector('input[data-cell="0-0"]')
      ?.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
  });

  await expect(page.locator('input[data-cell="10-1"]')).toHaveValue('10');
  expect(await page.locator('input[data-cell]').count()).toBeLessThan(300);

  await page.locator('table').evaluate(table => {
    const scroller = table.parentElement;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  });
  await expect(page.locator('input[data-cell="499-0"]')).toHaveValue('r499');
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

test('keeps a computed column in sync when its source changes', async ({ page, isMobile }) => {
  test.skip(isMobile, 'transform panel is exercised on the desktop layout');

  await page.goto('/');
  await page.getByRole('button', { name: 'Transform' }).click();
  await page.getByLabel('Formula expression').fill('Score_Post - Score_Pre');
  await page.getByLabel('New column name').fill('Diff');
  await page.getByRole('button', { name: 'Compute' }).click();

  await expect(page.locator('input[data-cell="0-4"]')).toHaveValue('10');
  await page.locator('input[data-cell="0-0"]').fill('51');
  await expect(page.locator('input[data-cell="0-4"]')).toHaveValue('9');
});

test('fills a selection down with the keyboard and restores it with undo', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard fill is exercised on the desktop layout');

  await page.goto('/');
  await page.locator('input[data-cell="0-0"]').click();
  await page.locator('input[data-cell="0-0"]').press('Shift+ArrowDown');
  await page.locator('input[data-cell="1-0"]').press('Control+d');
  await expect(page.locator('input[data-cell="0-0"]')).toHaveValue('50');
  await expect(page.locator('input[data-cell="1-0"]')).toHaveValue('50');

  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.locator('input[data-cell="1-0"]')).toHaveValue('52');
});

test('typing into a multi-cell selection overwrites every selected cell', async ({ page, isMobile }) => {
  test.skip(isMobile, 'multi-cell editing is exercised on the desktop layout');

  await page.goto('/');
  await page.locator('input[data-cell="0-0"]').click();
  await page.locator('input[data-cell="0-0"]').press('Shift+ArrowDown');
  await page.locator('input[data-cell="1-0"]').fill('7');
  await expect(page.locator('input[data-cell="0-0"]')).toHaveValue('7');
  await expect(page.locator('input[data-cell="1-0"]')).toHaveValue('7');
});

test('re-runs and applies a stored analysis card', async ({ page, isMobile }) => {
  test.skip(isMobile, 'analysis cards are exercised on the desktop layout');

  await page.goto('/');
  await page.getByRole('button', { name: 'Analysis' }).click();
  await page.getByLabel('Search analyses').fill('ANOVA');
  await page.locator('button[title="Compare means across groups with post-hoc tests."]').click();
  await page.getByRole('button', { name: 'Run analysis' }).click();

  await expect(page.getByRole('button', { name: 'Re-run with saved parameters' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Re-run with saved parameters' })).toHaveCount(1);

  await page.getByLabel('ANOVA dependent variable').selectOption('3');
  await expect(page.getByText('stale', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Apply parameters to setup' }).click();
  await expect(page.getByText('Parameters restored in the setup panel')).toBeVisible();
  await expect(page.getByLabel('ANOVA dependent variable')).toHaveValue('0');
  await expect(page.getByText('stale', { exact: true })).toHaveCount(0);

  await page.getByRole('button', { name: 'Re-run with saved parameters' }).first().click();
  await expect(page.getByRole('button', { name: 'Re-run with saved parameters' })).toHaveCount(2);
});
