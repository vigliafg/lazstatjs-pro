import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Style gallery of the chart editor.
 *
 * The strip under the preview lists the built-in styles of the chart kind.
 * Selecting one applies it to the card; the "+" action inserts a copy of the
 * chart with that style in the same run-report, one below the other.
 */

const output = (page: Page) => page.locator('article.output-card');

const openRegression = async (page: Page) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Analysis', exact: true }).click();
  const library = page.getByRole('button', { name: 'Library', exact: true });
  if (await library.isVisible().catch(() => false)) await library.click();
  await page.getByLabel('Search analyses', { exact: true }).fill('Regression');
  await page.locator('button[title="Ordinary least squares with robust options."]').click();
  await page.getByRole('button', { name: 'Run analysis' }).click();
  await expect(output(page)).toHaveCount(1);
};

const openEditor = async (page: Page, id: string): Promise<Locator> => {
  const chart = output(page).locator(`[data-chart-id="${id}"]`);
  await expect(chart).toBeVisible();
  await chart.locator('button[aria-label^="Edit chart:"]').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  return dialog;
};

test.describe('chart style gallery', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop strip; the same component renders on mobile');

  test('a Q-Q card offers the classic and the probability style, and inserts a copy', async ({ page }) => {
    await openRegression(page);
    const dialog = await openEditor(page, 'reg-residual-qq');

    const gallery = dialog.locator('[data-chart-style-gallery]');
    await expect(gallery).toBeVisible();
    const probability = dialog.locator('[data-chart-style="probability"]');
    const classic = dialog.locator('[data-chart-style="classic"]');
    await expect(probability).toBeVisible();
    await expect(classic).toBeVisible();
    // The procedures emit the probability style: it is the default and selected.
    await expect(probability).toHaveAttribute('data-chart-style-selected', 'true');
    // The Q-Q is the documented exception: its default is the JMP-like variant.
    await expect(
      probability.locator('[data-chart-style-origin-badge="jmp"]')
    ).toHaveText('JMP-like');
    await expect(
      classic.locator('[data-chart-style-origin-badge="lazstat"]')
    ).toHaveText('LazStats');
    await expect(probability.locator('[data-chart-style-description]')).toBeVisible();
    await expect(dialog.locator('[data-chart-style-filters]')).toBeVisible();

    await classic.locator('button').first().click();
    await expect(classic).toHaveAttribute('data-chart-style-selected', 'true');
    await expect(probability).not.toHaveAttribute('data-chart-style-selected', 'true');

    await dialog.locator('[data-chart-style-insert="classic"]').click();
    const copy = output(page).locator('[data-chart-id="reg-residual-qq-2"]');
    await expect(copy).toBeVisible();
    await expect(copy.locator('[data-chart-surface]')).toHaveAttribute(
      'data-chart-state',
      'ready',
      { timeout: 15000 }
    );

    // The original card keeps its own style: discard the draft and reopen it.
    page.once('dialog', confirm => void confirm.accept());
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toHaveCount(0);
    const reopened = await openEditor(page, 'reg-residual-qq');
    await expect(reopened.locator('[data-chart-style="probability"]')).toHaveAttribute(
      'data-chart-style-selected',
      'true'
    );
  });

  test('a box card offers the four box displays', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Analysis', exact: true }).click();
    const library = page.getByRole('button', { name: 'Library', exact: true });
    if (await library.isVisible().catch(() => false)) await library.click();
    await page.getByLabel('Search analyses', { exact: true }).fill('ANOVA');
    await page.locator('button[title="Compare means across groups with post-hoc tests."]').click();
    await page.getByRole('button', { name: 'Run analysis' }).click();

    const dialog = await openEditor(page, 'anova-box');
    for (const style of ['box', 'notched', 'violin', 'raincloud', 'jmp-oneway']) {
      await expect(dialog.locator(`[data-chart-style="${style}"]`)).toBeVisible();
    }
    const jmp = dialog.locator('[data-chart-style="jmp-oneway"]');
    await expect(jmp.locator('[data-chart-style-origin-badge="jmp"]')).toHaveText('JMP-like');
    await expect(jmp.locator('[data-chart-style-description]')).toBeVisible();

    // The family filter isolates the JMP-like tile without hiding its data.
    const filters = dialog.locator('[data-chart-style-filters]');
    await filters.locator('[data-chart-style-filter="jmp"]').click();
    await expect(jmp).toBeVisible();
    await expect(dialog.locator('[data-chart-style="box"]')).toHaveCount(0);
    await filters.locator('[data-chart-style-filter="lazstat"]').click();
    await expect(jmp).toHaveCount(0);
    await expect(dialog.locator('[data-chart-style="box"]')).toBeVisible();
    await filters.locator('[data-chart-style-filter="all"]').click();

    await jmp.locator('button').first().click();
    await expect(jmp).toHaveAttribute('data-chart-style-selected', 'true');
    await dialog.locator('[data-chart-style="violin"] button').first().click();
    await expect(dialog.locator('[data-chart-style="violin"]')).toHaveAttribute(
      'data-chart-style-selected',
      'true'
    );
  });

  test('the compare action inserts the LazStats and JMP-like variants side by side', async ({
    page,
  }) => {
    await openRegression(page);
    const dialog = await openEditor(page, 'reg-scatter');
    const jmp = dialog.locator('[data-chart-style="jmp-regression"]');
    await expect(jmp).toBeVisible();
    await expect(
      jmp.locator('[data-chart-style-origin-badge="jmp"]')
    ).toHaveText('JMP-like');

    await dialog.locator('[data-chart-style-compare]').click();
    const charts = output(page).locator('[data-chart-id^="reg-scatter"]');
    await expect(charts).toHaveCount(3);
    await expect(charts.nth(1)).toContainText('LazStats');
    await expect(charts.nth(2)).toContainText('JMP-like');

    // Repeating the action must not duplicate the two variants.
    await dialog.locator('[data-chart-style-compare]').click();
    await expect(charts).toHaveCount(3);

    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toHaveCount(0);
  });
});

test.describe('chart style library', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop settings and setup; same components on mobile');

  test('save a style, set it for the procedure and use it in the next run', async ({ page }) => {
    await openRegression(page);
    const dialog = await openEditor(page, 'reg-residual-qq');

    // Start from the classic look and save it under a name.
    await dialog.locator('[data-chart-style="classic"] button').first().click();
    await dialog.locator('[data-chart-style-save]').click();
    await dialog.locator('[data-chart-style-name-input]').fill('Mio classico');
    await dialog.locator('[data-chart-style-save-confirm]').click();
    await expect(dialog.getByText('Mio classico', { exact: true })).toBeVisible();

    page.once('dialog', confirm => void confirm.accept());
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toHaveCount(0);

    // The saved style is listed in Settings → Charts.
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await expect(page.locator('[data-chart-style-row]')).toHaveCount(1);
    await expect(page.locator('[data-chart-style-row] input')).toHaveValue('Mio classico');
    await page.getByRole('button', { name: 'Analysis', exact: true }).click();

    // Choose it for the Q-Q charts of this procedure and run again.
    const setup = page.locator('[data-analysis-chart-style="qq"]');
    await expect(setup).toBeVisible();
    await setup.selectOption({ label: 'Mio classico' });
    await page.getByRole('button', { name: 'Run analysis' }).click();
    await expect(output(page)).toHaveCount(2);

    // The new card uses the saved style: reopening its editor shows it selected.
    const second = output(page).nth(1).locator('[data-chart-id="reg-residual-qq"]');
    await expect(second).toBeVisible();
    await second.locator('button[aria-label^="Edit chart:"]').click();
    const reopened = page.getByRole('dialog');
    await expect(reopened.getByText('Mio classico', { exact: true })).toBeVisible();
    await expect(
      reopened.locator('[data-chart-style]').filter({ hasText: 'Mio classico' })
    ).toHaveAttribute('data-chart-style-selected', 'true');
  });
});
