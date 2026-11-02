import { expect, test, type Page } from '@playwright/test';

/**
 * Milestone E — dynamic linking, Data Filter, Prediction Profiler and the
 * limited Graph Builder. The tests exercise the real Vega views: a brush or a
 * lasso must produce a non-empty row selection and dim the other marks.
 */

const output = (page: Page) => page.locator('article.output-card');

const openAnalysis = async (page: Page, query: string, title: string) => {
  await page.getByRole('button', { name: 'Analysis', exact: true }).click();
  const library = page.getByRole('button', { name: 'Library', exact: true });
  if (await library.isVisible().catch(() => false)) await library.click();
  await page.getByLabel('Search analyses', { exact: true }).fill(query);
  await page.locator(`button[title="${title}"]`).click();
};

const runRegression = async (page: Page) => {
  await openAnalysis(page, 'Regression', 'Ordinary least squares with robust options.');
  await page.getByRole('button', { name: 'Run analysis' }).click();
  await expect(output(page)).toHaveCount(1);
  await expect(
    page.locator('[data-chart-id="reg-scatter"] [data-chart-surface]').first()
  ).toHaveAttribute('data-chart-state', 'ready', { timeout: 20000 });
};

const brush = async (page: Page) => {
  const surface = page.locator('[data-chart-id="reg-scatter"] [data-chart-link-surface]').first();
  await expect(surface).toBeVisible();
  await surface.scrollIntoViewIfNeeded();
  const box = await surface.boundingBox();
  if (!box) throw new Error('link surface has no size');
  await page.mouse.move(box.x + box.width * 0.15, box.y + box.height * 0.15);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.75, { steps: 12 });
  await page.mouse.up();
};

const lasso = async (page: Page) => {
  const surface = page.locator('[data-chart-id="reg-scatter"] [data-chart-link-surface]').first();
  await expect(surface).toBeVisible();
  await surface.scrollIntoViewIfNeeded();
  const box = await surface.boundingBox();
  if (!box) throw new Error('link surface has no size');
  await page.mouse.move(box.x + box.width * 0.1, box.y + box.height * 0.1);
  await page.mouse.down();
  for (const [fx, fy] of [
    [0.8, 0.1],
    [0.8, 0.8],
    [0.1, 0.8],
    [0.1, 0.1],
  ]) {
    await page.mouse.move(box.x + box.width * fx, box.y + box.height * fy, { steps: 5 });
  }
  await page.mouse.up();
};

test.describe('dynamic linking and interaction', () => {
  test.skip(({ isMobile }) => isMobile, 'pointer brush and lasso are desktop interactions');

  test('brush selects rows, dims the rest and clears', async ({ page }) => {
    await page.goto('/');
    await runRegression(page);
    await page.getByRole('button', { name: 'Turn dynamic linking on or off' }).click();

    // Every point chart in the run-report is linkable and says so.
    await expect(
      page.locator('[data-chart-id="reg-scatter"] [data-chart-link="ready"]')
    ).toBeVisible();
    // A residual box without raw points has nothing to brush: the chip says so.
    await expect(
      page.locator('[data-chart-id="reg-residual-box"] [data-chart-link="none"]')
    ).toBeVisible();
    // L3 panels share the same row state as the standalone charts.
    await expect(
      page.locator('[data-chart-id="panel-fit-model:reg-scatter"] [data-chart-link="ready"]')
    ).toBeVisible();

    await brush(page);

    const count = page.locator('[data-link-count]');
    await expect(count).toBeVisible();
    await expect(count).toContainText('selected');
    await expect(count).not.toContainText('0 selected');

    // The selected marks stay opaque while the others are dimmed by the
    // generated Vega opacity encoding.
    const dimmed = await page
      .locator('[data-chart-id="reg-scatter"] svg')
      .first()
      .evaluate(el =>
        [...el.querySelectorAll('path')].some(node => {
          const opacity = Number(node.getAttribute('opacity'));
          return Number.isFinite(opacity) && opacity > 0 && opacity < 0.5;
        })
      );
    expect(dimmed).toBe(true);

    // Panels share the selection: the same marks are dimmed inside the panel.
    const panelDimmed = await page
      .locator('[data-chart-id="panel-fit-model:reg-scatter"] svg')
      .first()
      .evaluate(el =>
        [...el.querySelectorAll('path')].some(node => {
          const opacity = Number(node.getAttribute('opacity'));
          return Number.isFinite(opacity) && opacity > 0 && opacity < 0.5;
        })
      );
    expect(panelDimmed).toBe(true);

    await page.getByRole('button', { name: 'Clear selection' }).click();
    await expect(count).toHaveCount(0);
  });

  test('lasso selects rows inside the drawn polygon', async ({ page }) => {
    await page.goto('/');
    await runRegression(page);
    await page.getByRole('button', { name: 'Turn dynamic linking on or off' }).click();
    await page.locator('select[aria-label="Selection tool"]').selectOption('lasso');
    await lasso(page);
    await expect(page.locator('[data-link-count]')).toContainText('selected');
    await expect(page.locator('[data-link-count]')).not.toContainText('0 selected');
  });

  test('Data Filter hides rows and dims their marks', async ({ page }) => {
    await page.goto('/');
    await runRegression(page);
    await page.getByRole('button', { name: 'Choose the rows shown in linked charts' }).click();
    const dialog = page.locator('[data-data-filter]');
    await expect(dialog).toBeVisible();

    await dialog.locator('[data-filter-column]').selectOption('2');
    const slider = dialog.locator('[data-filter-threshold]');
    await expect(slider).toBeVisible();
    await slider.focus();
    await slider.press('Home');
    await expect(dialog.locator('[data-filter-summary]')).toContainText('10 of 20 rows hidden');
    await expect(page.locator('[data-hidden-count]').first()).toContainText('10 hidden');

    const hiddenMarks = await page
      .locator('[data-chart-id="reg-scatter"] svg')
      .first()
      .evaluate(el =>
        [...el.querySelectorAll('path')].some(node => {
          const opacity = Number(node.getAttribute('opacity'));
          return Number.isFinite(opacity) && opacity < 0.1;
        })
      );
    expect(hiddenMarks).toBe(true);

    await dialog.locator('[data-filter-clear]').click();
    await expect(dialog.locator('[data-filter-summary]')).toContainText('0 of 20 rows hidden');

    // The animation starts from the lowest value and walks the ordered values.
    await dialog.locator('[data-filter-animate]').click();
    await expect(dialog.locator('[data-filter-summary]')).toContainText('10 of 20 rows hidden');
    await dialog.locator('[data-filter-animate]').click();

    await dialog.locator('button[aria-label="Close"]').click();
    await expect(dialog).toHaveCount(0);
  });

  test('exports the full data while a selection is active', async ({ page }) => {
    await page.goto('/');
    await runRegression(page);
    await page.getByRole('button', { name: 'Turn dynamic linking on or off' }).click();
    await brush(page);
    await expect(page.locator('[data-link-count]')).toBeVisible();

    const report = page.waitForEvent('download', download =>
      download.suggestedFilename().endsWith('.html')
    );
    await page.getByRole('button', { name: 'Export session report' }).click();
    await page.getByRole('menuitem', { name: 'Download a printable HTML report' }).click();
    const download = await report;
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    const html = Buffer.concat(chunks).toString('utf8');

    // The export suspends linking: the interactive layer and the dimming must
    // not travel into the report, while the charts and tables remain.
    expect(html).toContain('data-chart-surface');
    expect(html).not.toContain('data-chart-link-surface');
    expect(html).not.toContain('data-chart-link="ready"');
    expect(html).not.toContain('data-prediction-profiler');
    expect(html).not.toContain('data-graph-builder');
    expect(html).not.toContain('data-data-filter');
    expect(html).not.toContain('opacity="0.14"');

    // The live selection comes back once the export finishes.
    await expect(page.locator('[data-link-count]')).toBeVisible();
  });

  test('Prediction Profiler moves the factors without re-running the model', async ({ page }) => {
    await page.goto('/');
    await openAnalysis(
      page,
      'Response Surface',
      'Quadratic response surface with contour plot and stationary point.'
    );
    // The default AGE column gives the second factor enough distinct levels.
    await page.getByLabel('Factor B').selectOption('3');
    await page.getByRole('button', { name: 'Run analysis' }).click();
    await expect(output(page)).toHaveCount(1);
    const profiler = page.locator('[data-prediction-profiler]').first();
    await expect(profiler).toBeVisible();

    const prediction = profiler.locator('[data-profiler-prediction]');
    const before = await prediction.textContent();
    const slider = profiler.locator('[data-profiler-a]');
    await slider.focus();
    await slider.press('End');
    await expect(prediction).not.toHaveText(before ?? '');
    await expect(page.locator('article.output-card')).toHaveCount(1);
  });

  test('Graph Builder previews and appends a chart to the report', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Analysis', exact: true }).click();
    await page.getByRole('button', { name: 'Build a chart from the current data' }).click();
    const dialog = page.locator('[data-graph-builder]');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[data-builder-preview] svg')).toHaveCount(1);

    // Reassign the group column by clicking a column chip and then the slot.
    await dialog.locator('[data-builder-column="2"]').click();
    await dialog.locator('[data-builder-slot="group"]').click();
    await expect(dialog.locator('[data-builder-slot="group"]')).toContainText('Group');

    await dialog.locator('[data-builder-add]').click();
    await expect(dialog).toHaveCount(0);
    await expect(page.locator('article.output-card')).toHaveCount(1);
    await expect(
      page.locator('article.output-card [data-chart-surface]').first()
    ).toHaveAttribute('data-chart-state', 'ready', { timeout: 20000 });
  });
});
