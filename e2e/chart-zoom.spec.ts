import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Axis zoom, pan and reset on a real chart.
 *
 * The unit tests cover the compiled spec (`chartZoom` on the right layer, no
 * parameter when the switch is off); this spec drives the mounted Vega view
 * with trusted pointer input and reads the axis ticks back from the rendered
 * SVG, so the assertions check what the user sees: the wheel narrows the
 * domain, the drag slides it and "Reset zoom" restores the original ticks.
 */

test.describe.configure({ timeout: 120_000 });

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
};

const chartOf = (page: Page, id: string): Locator =>
  output(page).locator(`[data-chart-id="${id}"]`);

const waitReady = async (chart: Locator) => {
  await expect(chart.locator('[data-chart-surface]')).toHaveAttribute(
    'data-chart-state',
    'ready',
    { timeout: 20_000 }
  );
};

const surfaceBox = async (chart: Locator) => {
  await chart.scrollIntoViewIfNeeded();
  const box = await chart.locator('[data-chart-surface]').boundingBox();
  if (!box) throw new Error('chart surface has no size');
  return box;
};

type Orientation = 'horizontal' | 'vertical';

/** Tick labels rendered for the horizontal or vertical axis of the SVG. */
const tickLabels = async (chart: Locator, orientation: Orientation): Promise<string[]> =>
  chart.evaluate((el, want) => {
    const groups = [...el.querySelectorAll('svg g.role-axis')] as SVGGElement[];
    const axes = groups.map(group => {
      // getBBox ignores the group transform: a horizontal axis is wide and
      // short, a vertical one is tall and narrow.
      const box = group.getBBox();
      return {
        horizontal: box.width >= box.height,
        labels: [...group.querySelectorAll('g.role-axis-label text')]
          .map(node => (node.textContent ?? '').trim())
          .filter(label => label.length > 0),
      };
    });
    // Vega emits more than one axis group per channel (a layered spec can
    // repeat the grid-only axis), so ignore the ones without tick labels and
    // keep the richest match.
    const match = axes
      .filter(axis => axis.labels.length > 0 && axis.horizontal === (want === 'horizontal'))
      .sort((a, b) => b.labels.length - a.labels.length)[0];
    return match?.labels ?? [];
  }, orientation);

const numeric = (labels: string[]): number[] =>
  labels
    .map(label => label.replace(/[^\d.,-]/g, ''))
    .filter(text => /\d/.test(text))
    .map(text => Number(text.replace(',', '.')))
    .filter(value => Number.isFinite(value));

const span = (labels: string[]): number => {
  const values = numeric(labels);
  return values.length < 2 ? 0 : Math.max(...values) - Math.min(...values);
};

const zoomIn = async (page: Page, chart: Locator) => {
  const box = await surfaceBox(chart);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  for (let step = 0; step < 2; step += 1) {
    await page.mouse.wheel(0, -400);
    await page.waitForTimeout(300);
  }
};

const panRight = async (page: Page, chart: Locator) => {
  const box = await surfaceBox(chart);
  const y = box.y + box.height / 2;
  const centre = box.x + box.width / 2;
  await page.mouse.move(centre - 100, y);
  await page.mouse.down();
  await page.mouse.move(centre + 100, y, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(300);
};

/** Turn the zoom option on from the card editor; the card then offers the reset. */
const enableZoom = async (page: Page, chart: Locator) => {
  await chart.locator('button[aria-label^="Edit chart:"]').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-chart-surface]')).toHaveAttribute(
    'data-chart-state',
    'ready',
    { timeout: 20_000 }
  );
  const expand = dialog.locator('[data-chart-tree-expand]');
  if (await expand.isVisible().catch(() => false)) await expand.click();
  await dialog.locator('#chart-feature-general-enableZoom').check();
  await dialog.getByRole('button', { name: 'Done' }).click();
  await expect(dialog).toHaveCount(0);
  await waitReady(chart);
  await expect(chart.getByRole('button', { name: 'Reset zoom' })).toBeVisible();
};

/**
 * Shift+drag pans while the link overlay owns the plain drag: without the
 * modifier that gesture is the brush.
 */
const shiftPanRight = async (page: Page, chart: Locator) => {
  const box = await surfaceBox(chart);
  const y = box.y + box.height / 2;
  const centre = box.x + box.width / 2;
  await page.keyboard.down('Shift');
  await page.mouse.move(centre - 100, y);
  await page.mouse.down();
  await page.mouse.move(centre + 100, y, { steps: 12 });
  await page.mouse.up();
  await page.keyboard.up('Shift');
  await page.waitForTimeout(300);
};

/** The drag ends with a click, and a click on a chart opens its editor. */
const closeEditor = async (page: Page) => {
  const dialog = page.getByRole('dialog');
  if (await dialog.isVisible().catch(() => false)) {
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toHaveCount(0);
  }
};

test.describe('chart axis zoom and pan', () => {
  test.skip(({ isMobile }) => isMobile, 'the wheel and the drag are desktop interactions');

  test('wheel zooms, drag pans and Reset zoom restores the original ticks', async ({ page }) => {
    await page.goto('/');
    await runRegression(page);
    const chart = chartOf(page, 'reg-scatter');
    await waitReady(chart);

    // Without the option the view is not bound and offers no reset control.
    const initial = await tickLabels(chart, 'horizontal');
    expect(initial.length).toBeGreaterThanOrEqual(3);
    await expect(chart.getByRole('button', { name: 'Reset zoom' })).toHaveCount(0);

    // The switch reached the mounted view: the reset button is now there.
    await enableZoom(page, chart);

    const reset = chart.getByRole('button', { name: 'Reset zoom' });
    const before = await tickLabels(chart, 'horizontal');
    expect(before).toEqual(initial);

    // Wheel up: the axis keeps fewer units, so its span shrinks. Wait for the
    // redraw instead of reading the ticks once: the wheel runs through Vega's
    // own event loop.
    await zoomIn(page, chart);
    await expect
      .poll(() => tickLabels(chart, 'horizontal').then(labels => labels.join('|')), {
        timeout: 20_000,
      })
      .not.toBe(before.join('|'));
    const zoomed = await tickLabels(chart, 'horizontal');
    expect(span(zoomed)).toBeLessThan(span(before));

    // Drag right: the domain moves, the visible window keeps its width.
    await panRight(page, chart);
    await closeEditor(page);
    await waitReady(chart);
    const panned = await tickLabels(chart, 'horizontal');
    expect(panned).not.toEqual(zoomed);
    const shift = Math.abs(Math.min(...numeric(panned)) - Math.min(...numeric(zoomed)));
    expect(shift).toBeGreaterThan(0);
    expect(Math.abs(span(panned) - span(zoomed))).toBeLessThanOrEqual(span(zoomed) * 0.2 + 1);

    // Reset remounts the view: the original ticks come back.
    await reset.click();
    await waitReady(chart);
    await expect.poll(() => tickLabels(chart, 'horizontal'), { timeout: 20_000 }).toEqual(before);
  });

  test('wheel and Shift+drag navigate under the brush overlay', async ({ page }) => {
    await page.goto('/');
    await runRegression(page);
    const chart = chartOf(page, 'reg-scatter');
    await waitReady(chart);
    await enableZoom(page, chart);
    const before = await tickLabels(chart, 'horizontal');

    // Linking puts the transparent brush surface on top of the plot; the
    // ticks do not move on their own.
    await page.getByRole('button', { name: 'Turn dynamic linking on or off' }).click();
    const overlay = chart.locator('[data-chart-link-surface]');
    await expect(overlay).toBeVisible();
    expect(await tickLabels(chart, 'horizontal')).toEqual(before);

    // The cursor announces the pan gesture before it starts.
    const cursor = () => overlay.evaluate(el => getComputedStyle(el).cursor);
    await expect.poll(cursor).toBe('crosshair');
    await page.keyboard.down('Shift');
    await expect.poll(cursor).toBe('grab');
    await page.keyboard.up('Shift');
    await expect.poll(cursor).toBe('crosshair');

    // The wheel hits the overlay, which drives the same bound domains Vega
    // would: the visible span still shrinks.
    await zoomIn(page, chart);
    await expect
      .poll(() => tickLabels(chart, 'horizontal').then(labels => labels.join('|')), {
        timeout: 20_000,
      })
      .not.toBe(before.join('|'));
    const zoomed = await tickLabels(chart, 'horizontal');
    expect(span(zoomed)).toBeLessThan(span(before));

    // Shift+drag pans instead of brushing: no selection appears and the
    // window keeps its width while moving.
    await shiftPanRight(page, chart);
    await expect(page.locator('[data-link-count]')).toHaveCount(0);
    const panned = await tickLabels(chart, 'horizontal');
    expect(panned).not.toEqual(zoomed);
    const shift = Math.abs(Math.min(...numeric(panned)) - Math.min(...numeric(zoomed)));
    expect(shift).toBeGreaterThan(0);
    expect(Math.abs(span(panned) - span(zoomed))).toBeLessThanOrEqual(span(zoomed) * 0.2 + 1);

    // Reset restores the initial ticks and leaves linking on.
    await chart.getByRole('button', { name: 'Reset zoom' }).click();
    await waitReady(chart);
    await expect(overlay).toBeVisible();
    await expect.poll(() => tickLabels(chart, 'horizontal'), { timeout: 20_000 }).toEqual(before);
  });
});
