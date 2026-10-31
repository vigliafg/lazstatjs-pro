import { readFileSync } from 'node:fs';
import { expect, test, type Locator, type Page } from '@playwright/test';

test.describe.configure({ timeout: 120_000 });

const output = (page: Page) => page.locator('article.output-card');

const openAnalysis = async (page: Page, query: string, title: string) => {
  await page.getByRole('button', { name: 'Analysis', exact: true }).click();
  const search = page.getByLabel('Search analyses', { exact: true });
  const library = page.getByRole('button', { name: 'Library', exact: true });
  // Wait for the tab to mount before checking which pane is already open; an
  // early visibility check used to skip the click on the mobile layout.
  await expect(library).toBeVisible();
  if (!(await search.isVisible().catch(() => false))) await library.click();
  await expect(search).toBeVisible();
  await search.fill(query);
  await page.locator(`button[title="${title}"]`).click();
};

const runAnova = async (page: Page) => {
  await page.goto('/');
  await openAnalysis(page, 'ANOVA', 'Compare means across groups with post-hoc tests.');
  await page.getByRole('button', { name: 'Run analysis' }).click();
  await expect(output(page)).toHaveCount(1);
};

const runRegression = async (page: Page) => {
  await page.goto('/');
  await openAnalysis(page, 'Regression', 'Ordinary least squares with robust options.');
  await page.getByRole('button', { name: 'Run analysis' }).click();
  await expect(output(page)).toHaveCount(1);
};

const chartOf = (page: Page, id: string): Locator => output(page).locator(`[data-chart-id="${id}"]`);

const openEditor = async (page: Page, id = 'anova-box') => {
  const chart = chartOf(page, id);
  await expect(chart).toBeVisible();
  await expect(chart.locator('[data-chart-surface]')).toHaveAttribute(
    'data-chart-state',
    'ready',
    { timeout: 20000 }
  );
  await chart.locator('button[aria-label^="Edit chart:"]').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const preview = dialog.locator('[data-chart-surface]');
  await expect(preview).toHaveAttribute('data-chart-state', 'ready', { timeout: 20000 });
  return { chart, dialog, preview };
};

const enterAnnotations = async (dialog: Locator) => {
  await dialog.locator('[data-chart-annotations-toggle]').click();
  const surface = dialog.locator('[data-annotation-surface]');
  await expect(surface).toBeVisible();
  return surface;
};

const drag = async (
  page: Page,
  from: { x: number; y: number },
  to: { x: number; y: number }
) => {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 8 });
  await page.mouse.up();
};

const dragElement = async (page: Page, locator: Locator, dx: number, dy: number) => {
  const box = await locator.boundingBox();
  if (!box) throw new Error('Element has no bounding box');
  const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  await drag(page, start, { x: start.x + dx, y: start.y + dy });
};

const surfacePoint = async (surface: Locator, x: number, y: number) => {
  const box = await surface.boundingBox();
  if (!box) throw new Error('Annotation surface has no bounding box');
  return { x: box.x + box.width * x, y: box.y + box.height * y };
};

const annotationRows = (dialog: Locator) => dialog.locator('[data-annotation-row]');
const annotationHits = (surface: Locator) => surface.locator('[data-annotation-hit]');

/** Arrow marks are a line plus a polygon with the same annotation id. */
const staticAnnotationCount = (surface: Locator): Promise<number> =>
  surface
    .locator('[data-chart-annotations] [data-annotation-id]')
    .evaluateAll(nodes =>
      new Set(nodes.map(node => node.getAttribute('data-annotation-id'))).size
    );

test.describe('annotation editor — workflow', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop workflow');

  test('add, drag, resize, reorder, hide, undo, delete and persist', async ({ page }) => {
    await runAnova(page);
    const { dialog, preview } = await openEditor(page);
    const surface = await enterAnnotations(dialog);

    // The editor's own overlay must never be part of the exported SVG.
    await expect(surface).toHaveAttribute('data-no-export', 'true');
    expect(await surface.evaluate(node => Boolean(node.closest('svg.marks')))).toBe(false);

    // Add text from the property panel.
    await dialog.locator('[data-annotation-add="text"]').click();
    await expect(annotationRows(dialog)).toHaveCount(1);
    await expect(annotationHits(surface)).toHaveCount(1);
    await expect(dialog.locator('[data-annotation-property="text"]')).toHaveValue('Note');
    await expect(preview.locator('[data-chart-annotations]')).toContainText('Note');

    // Property panel -> canvas.
    await dialog.locator('[data-annotation-property="text"]').fill('p = 0.03');
    await expect(surface.locator('text').filter({ hasText: 'p = 0.03' })).toBeVisible();
    await expect(preview.locator('[data-chart-annotations]')).toContainText('p = 0.03');

    const xBefore = await dialog.locator('#annotation-x').inputValue();
    const yBefore = await dialog.locator('#annotation-y').inputValue();
    const hitBoxBefore = await annotationHits(surface).first().boundingBox();
    await dragElement(page, annotationHits(surface).first(), 70, 45);
    await page.waitForTimeout(200);
    await expect(dialog.locator('#annotation-x')).not.toHaveValue(xBefore);
    await expect(dialog.locator('#annotation-y')).not.toHaveValue(yBefore);
    const hitBoxAfter = await annotationHits(surface).first().boundingBox();
    expect(hitBoxAfter!.x).toBeGreaterThan(hitBoxBefore!.x);
    expect(hitBoxAfter!.y).toBeGreaterThan(hitBoxBefore!.y);

    // One gesture = one history entry: a single undo restores both coordinates.
    await dialog.getByRole('button', { name: 'Undo', exact: true }).click();
    await expect(dialog.locator('#annotation-x')).toHaveValue(xBefore);
    await expect(dialog.locator('#annotation-y')).toHaveValue(yBefore);
    await dialog.getByRole('button', { name: 'Redo', exact: true }).click();
    await expect(dialog.locator('#annotation-x')).not.toHaveValue(xBefore);

    // Canvas -> property panel: drag the text back and check the fields again.
    const xDragged = await dialog.locator('#annotation-x').inputValue();
    await dialog.locator('#annotation-x').fill('0.42');
    await page.waitForTimeout(100);
    await expect(dialog.locator('#annotation-x')).toHaveValue('0.42');
    expect(xDragged).not.toBe('0.42');

    // Arrow created with the toolbar: pointer drag on the plot.
    await dialog.locator('[data-annotation-tool="arrow"]').click();
    const start = await surfacePoint(surface, 0.2, 0.25);
    const end = await surfacePoint(surface, 0.72, 0.62);
    await drag(page, start, end);
    await expect(annotationRows(dialog)).toHaveCount(2);
    await expect(surface.locator('[data-annotation-hit][data-annotation-type="arrow"]')).toHaveCount(1);

    // Rectangle from the panel, then resize with its south-east handle.
    await dialog.locator('[data-annotation-add="rect"]').click();
    await expect(annotationRows(dialog)).toHaveCount(3);
    const rectHit = surface.locator('[data-annotation-hit][data-annotation-type="rect"]');
    await rectHit.click();
    const x2Before = await dialog.locator('#annotation-x2').inputValue();
    await dragElement(page, surface.locator('[data-annotation-handle="se"]'), -40, -30);
    await expect(dialog.locator('#annotation-x2')).not.toHaveValue(x2Before);

    // Style properties reach the exported static layer, not only the overlay.
    await dialog.locator('[data-annotation-property="strokeWidth"]').fill('6');
    await expect(preview.locator('[data-chart-annotations] rect')).toHaveAttribute('stroke-width', '6');
    await dialog.locator('[data-annotation-property="fill"]').check();
    await expect(preview.locator('[data-chart-annotations] rect')).toHaveAttribute('fill-opacity', '1');

    // Z-order is the array order; send the rectangle behind the arrow.
    const lastBefore = await annotationRows(dialog).last().textContent();
    await dialog.getByRole('button', { name: 'Send backward', exact: true }).click();
    const lastAfter = await annotationRows(dialog).last().textContent();
    expect(lastAfter).not.toBe(lastBefore);

    // Eye toggles the static layer and the editing hit area together.
    await dialog.locator('[data-annotation-toggle]').first().click();
    await expect(annotationHits(surface)).toHaveCount(2);
    await page.waitForTimeout(250);
    await expect.poll(() => staticAnnotationCount(preview)).toBe(2);
    await dialog.locator('[data-annotation-toggle]').first().click();
    await expect(annotationHits(surface)).toHaveCount(3);

    // Delete from the list, then restore with one undo.
    await dialog
      .locator('[data-annotation-row]', { hasText: 'Arrow' })
      .locator('[data-annotation-delete]')
      .click();
    await expect(annotationRows(dialog)).toHaveCount(2);
    await dialog.getByRole('button', { name: 'Undo', exact: true }).click();
    await expect(annotationRows(dialog)).toHaveCount(3);

    // PNG export keeps the annotations inside the cloned Vega SVG.
    const download = page.waitForEvent('download', item => item.suggestedFilename().endsWith('.png'));
    await dialog.getByRole('button', { name: 'PNG', exact: true }).click();
    expect(await download).toBeTruthy();
    const exported = await preview.locator('svg.marks').evaluate(svg => {
      const clone = svg.cloneNode(true) as SVGSVGElement;
      const nodes = Array.from(clone.querySelectorAll('[data-chart-annotations] [data-annotation-id]'));
      return {
        marks: nodes.length,
        ids: nodes.map(node => node.getAttribute('data-annotation-id') ?? ''),
        text: clone.textContent ?? '',
      };
    });
    expect(exported.marks).toBe(4);
    expect(new Set(exported.ids).size).toBe(3);
    expect(exported.text).toContain('p = 0.03');

    // Commit, autosave, reload and reopen: type, text and order survive.
    await dialog.getByRole('button', { name: 'Done' }).click();
    await expect(dialog).toHaveCount(0);
    await expect
      .poll(() => staticAnnotationCount(chartOf(page, 'anova-box')))
      .toBe(3);
    await page.waitForTimeout(1400);
    await page.reload();
    const reopened = await openEditor(page);
    const reopenedSurface = await enterAnnotations(reopened.dialog);
    await expect(annotationRows(reopened.dialog)).toHaveCount(3);
    await expect(reopenedSurface.locator('text').filter({ hasText: 'p = 0.03' })).toBeVisible();
    await expect.poll(() => staticAnnotationCount(reopened.preview)).toBe(3);
    await reopened.dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(reopened.dialog).toHaveCount(0);
  });

  test('panel keyboard nudge, escape and text editing stay in one history', async ({ page }) => {
    await runAnova(page);
    const { dialog, preview } = await openEditor(page);
    const surface = await enterAnnotations(dialog);

    await dialog.locator('[data-annotation-add="text"]').click();
    const xBefore = Number(await dialog.locator('#annotation-x').inputValue());
    await surface.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    expect(Number(await dialog.locator('#annotation-x').inputValue())).toBeCloseTo(xBefore + 0.02, 2);
    await dialog.getByRole('button', { name: 'Undo', exact: true }).click();
    expect(Number(await dialog.locator('#annotation-x').inputValue())).toBeCloseTo(xBefore + 0.01, 2);
    await dialog.getByRole('button', { name: 'Undo', exact: true }).click();
    expect(Number(await dialog.locator('#annotation-x').inputValue())).toBeCloseTo(xBefore, 2);

    // Double-click opens a local textarea; Escape cancels without a history entry.
    await surface.locator('[data-annotation-hit]').first().dblclick();
    const editor = surface.locator('[data-annotation-text-editor]');
    await expect(editor).toBeVisible();
    await editor.fill('Discard me');
    await page.keyboard.press('Escape');
    await expect(editor).toHaveCount(0);
    await expect(dialog.locator('[data-annotation-property="text"]')).toHaveValue('Note');

    // Enter commits the text edit.
    await surface.locator('[data-annotation-hit]').first().dblclick();
    const committed = surface.locator('[data-annotation-text-editor]');
    await expect(committed).toBeVisible();
    await committed.fill('Key finding');
    await page.keyboard.press('Enter');
    await expect(committed).toHaveCount(0);
    await expect(dialog.locator('[data-annotation-property="text"]')).toHaveValue('Key finding');
    await expect(preview.locator('[data-chart-annotations]')).toContainText('Key finding');

    // Escape only clears the selection; the dialog stays open.
    await surface.focus();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();
    await expect(surface.locator('[data-annotation-selection]')).toHaveCount(0);
  });

  test('the rasterised PNG contains the annotation at the plotted position', async ({ page }) => {
    await runAnova(page);
    const { dialog, preview } = await openEditor(page);
    await enterAnnotations(dialog);
    await dialog.locator('[data-annotation-add="text"]').click();

    // A colour that cannot occur in the chart palette.
    await dialog.locator('[data-annotation-property="color"]').evaluate(input => {
      const element = input as HTMLInputElement;
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(element, '#ff00ff');
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await dialog.locator('#annotation-x').fill('0.5');
    await dialog.locator('#annotation-y').fill('0.5');
    await page.waitForTimeout(300);
    await expect(preview.locator('[data-chart-annotations] text')).toHaveAttribute('fill', '#ff00ff');

    const geometry = await preview.locator('svg.marks').evaluate(svg => {
      const svgRect = svg.getBoundingClientRect();
      const frame = svg.querySelector('.mark-group.role-frame.root .background');
      const frameRect = frame?.getBoundingClientRect();
      return {
        width: svgRect.width,
        height: svgRect.height,
        plot: frameRect
          ? {
              left: frameRect.left - svgRect.left,
              top: frameRect.top - svgRect.top,
              width: frameRect.width,
              height: frameRect.height,
            }
          : null,
      };
    });
    expect(geometry.plot).not.toBeNull();

    const download = page.waitForEvent('download', item => item.suggestedFilename().endsWith('.png'));
    await dialog.getByRole('button', { name: 'PNG', exact: true }).click();
    const file = await download;
    const path = await file.path();
    expect(path).toBeTruthy();
    const dataUrl = `data:image/png;base64,${readFileSync(path!).toString('base64')}`;

    // chartExport adds PADDING=12 and SCALE=2 around the cloned Vega SVG.
    const centerX = (geometry.plot!.left + geometry.plot!.width * 0.5 + 12) * 2;
    const centerY = (geometry.plot!.top + geometry.plot!.height * 0.5 + 12) * 2;
    const magenta = await page.evaluate(
      async ({ dataUrl: url, x, y }) => {
        const image = new Image();
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
          image.src = url;
        });
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d');
        if (!context) return -1;
        context.drawImage(image, 0, 0);
        const size = 70;
        const data = context.getImageData(
          Math.max(0, x - size / 2),
          Math.max(0, y - size / 2),
          size,
          size
        ).data;
        let count = 0;
        for (let index = 0; index < data.length; index += 4) {
          if (data[index] > 180 && data[index + 1] < 120 && data[index + 2] > 180) count += 1;
        }
        return count;
      },
      { dataUrl, x: centerX, y: centerY }
    );
    expect(magenta).toBeGreaterThan(0);
  });

  test('a scatter chart gets the same annotation layer and plot mapping', async ({ page }) => {
    await runRegression(page);
    const { dialog } = await openEditor(page, 'reg-scatter');
    const surface = await enterAnnotations(dialog);
    await dialog.locator('[data-annotation-add="text"]').click();
    await dialog.locator('[data-annotation-property="text"]').fill('High leverage');
    await expect(annotationHits(surface)).toHaveCount(1);
    await dialog.getByRole('button', { name: 'Done' }).click();
    await expect(dialog).toHaveCount(0);
    await expect.poll(() => staticAnnotationCount(chartOf(page, 'reg-scatter'))).toBe(1);
    await expect(chartOf(page, 'reg-scatter').locator('[data-chart-annotations]')).toContainText(
      'High leverage'
    );
  });

  test('annotation mode is confined to the editor and leaves chart controls intact', async ({ page }) => {
    await runAnova(page);
    const { dialog } = await openEditor(page);
    // Enter from the property-panel button, not only from the header toggle.
    await dialog.locator('[data-annotation-open-editor]').click();
    await expect(dialog.locator('[data-annotation-surface]')).toBeVisible();
    await expect(dialog.locator('#chart-feature-general-theme')).toHaveCount(0);
    await expect(dialog.locator('[data-annotation-toolbar]')).toBeVisible();
    // Back to chart properties.
    await dialog.locator('[data-chart-annotations-toggle]').click();
    await expect(dialog.locator('[data-annotation-toolbar]')).toHaveCount(0);
    await expect(dialog.locator('#chart-feature-general-theme')).toBeVisible();
    await dialog.getByRole('button', { name: 'Cancel' }).click();
  });
});

test.describe('annotation editor — mobile', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile-only layout');

  test('third tab opens the annotation panel, chart tab shows the overlay', async ({ page }) => {
    await runAnova(page);
    const { dialog } = await openEditor(page);
    await dialog.locator('[data-chart-mobile-tab="annotations"]').click();
    await expect(dialog.locator('[data-annotation-panel]')).toBeVisible();
    await dialog.locator('[data-annotation-add="text"]').click();
    await expect(annotationRows(dialog)).toHaveCount(1);

    await dialog.locator('[data-chart-mobile-tab="chart"]').click();
    const surface = dialog.locator('[data-annotation-surface]');
    await expect(surface).toBeVisible();
    await expect(annotationHits(surface)).toHaveCount(1);
    await dragElement(page, annotationHits(surface).first(), 24, 18);

    await dialog.locator('[data-chart-mobile-tab="annotations"]').click();
    await expect(dialog.locator('[data-annotation-panel]')).toBeVisible();
    await expect(dialog.locator('[data-annotation-property="text"]')).toHaveValue('Note');
    await dialog.getByRole('button', { name: 'Done' }).click();
    await expect(dialog).toHaveCount(0);
    await expect.poll(() => staticAnnotationCount(chartOf(page, 'anova-box'))).toBe(1);
  });
});

test.describe('annotation editor — visual baselines', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop baseline');
  test.skip(process.env.VISUAL !== '1', 'set VISUAL=1 to run visual baselines');

  test('annotation editor desktop baseline', async ({ page }) => {
    await runAnova(page);
    const { dialog } = await openEditor(page);
    const surface = await enterAnnotations(dialog);
    await dialog.locator('[data-annotation-add="text"]').click();
    await dialog.locator('[data-annotation-property="text"]').fill('Outlier 2024');
    await dialog.locator('[data-annotation-tool="arrow"]').click();
    const start = await surfacePoint(surface, 0.22, 0.28);
    const end = await surfacePoint(surface, 0.62, 0.55);
    await drag(page, start, end);
    await dialog.locator('[data-annotation-add="rect"]').click();
    await page.waitForTimeout(300);
    await expect(dialog).toHaveScreenshot('annotation-editor-desktop.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });
});

test.describe('annotation editor — mobile visual baseline', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile baseline');
  test.skip(process.env.VISUAL !== '1', 'set VISUAL=1 to run visual baselines');

  test('annotation editor mobile baseline', async ({ page }) => {
    await runAnova(page);
    const { dialog } = await openEditor(page);
    await dialog.locator('[data-chart-mobile-tab="annotations"]').click();
    await dialog.locator('[data-annotation-add="text"]').click();
    await dialog.locator('[data-annotation-property="text"]').fill('Outlier 2024');
    await dialog.locator('[data-chart-mobile-tab="chart"]').click();
    const surface = dialog.locator('[data-annotation-surface]');
    await expect(surface).toBeVisible();
    await page.waitForTimeout(300);
    await expect(dialog).toHaveScreenshot('annotation-editor-mobile.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });
});
