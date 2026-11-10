import { expect, test } from '@playwright/test';
import { ANALYSIS_TABS } from '../src/analyses/registry';

/**
 * Structural audit of every analysis setup form.
 *
 * The check is intentionally generic: each form must open, expose labelled
 * controls, avoid duplicate DOM ids and stay inside the 300px setup pane.
 */
test.describe('analysis forms — structure', () => {
  test.skip(({ isMobile }) => isMobile, 'the setup pane is audited on desktop');

  test('every form has unique ids, labelled controls and no horizontal overflow', async ({ page }) => {
    test.setTimeout(180_000);
    await page.goto('/');
    await page.getByRole('button', { name: 'Analysis', exact: true }).click();
    const failures: string[] = [];

    // The Assistant is a full-page workspace, not a setup form.
    for (const tab of ANALYSIS_TABS.filter(item => item.id !== 'assistant')) {
      await page.getByLabel('Search analyses').fill(tab.label);
      await page.locator(`button[title="${tab.description}"]`).first().click();
      await page.waitForTimeout(80);
      const pane = page.locator('#analysis-pane-options');
      await expect(pane).toBeVisible();
      const metrics = await pane.evaluate((root) => {
        const ids = new Map<string, number>();
        root.querySelectorAll<HTMLElement>('[id]').forEach((el) => {
          ids.set(el.id, (ids.get(el.id) ?? 0) + 1);
        });
        const duplicates = Array.from(ids.entries()).filter(([, n]) => n > 1).map(([id]) => id);
        const unlabeled = Array.from(root.querySelectorAll<HTMLElement>('input, select, textarea'))
          .filter((el) => {
            if (el.getAttribute('aria-label') || el.getAttribute('title')) return false;
            if (el.id && root.querySelector(`label[for="${el.id}"]`)?.textContent?.trim()) return false;
            if (el.closest('label')?.textContent?.trim()) return false;
            return !(el as HTMLInputElement).hidden;
          })
          .map((el) => `${el.tagName.toLowerCase()}${el.getAttribute('type') ? `[${el.getAttribute('type')}]` : ''}`);
        // Editable fields scroll their own value once the text is longer than the box (a
        // row label such as "Treatment" sits right at the edge), and that depends on the
        // font metrics of the runner. Layout overflow is measured on the containers.
        const overflow = Array.from(root.querySelectorAll<HTMLElement>('*'))
          .filter((el) => !['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))
          .filter((el) => el.scrollWidth > el.clientWidth + 1)
          .slice(0, 5)
          .map((el) => `${el.tagName}.${String(el.className).slice(0, 24)}`);
        const paneOverflow =
          root.scrollWidth > root.clientWidth + 1
            ? `${root.scrollWidth}>${root.clientWidth}`
            : null;
        return { duplicates, unlabeled, overflow, paneOverflow };
      });
      if (metrics.duplicates.length > 0) failures.push(`${tab.id}: duplicate ids ${metrics.duplicates.join(', ')}`);
      if (metrics.unlabeled.length > 0) failures.push(`${tab.id}: unlabeled ${metrics.unlabeled.join(', ')}`);
      if (metrics.overflow.length > 0) failures.push(`${tab.id}: overflow ${metrics.overflow.join(', ')}`);
      if (metrics.paneOverflow) failures.push(`${tab.id}: setup pane scrolls sideways ${metrics.paneOverflow}`);
    }

    expect(failures).toEqual([]);
  });
});

test.describe('analysis forms — group roles and duplication', () => {
  test.skip(({ isMobile }) => isMobile, 'form controls are exercised on desktop');

  test('the same column cannot be chosen in two roles', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Analysis', exact: true }).click();
    await page.getByLabel('Search analyses').fill('T-Test');
    await page.locator('button[title="Compare two means or paired measurements."]').click();
    await expect(page.getByLabel('Variable 2').locator('option[value="0"]')).toBeDisabled();

    await page.getByLabel('Search analyses').fill('Factorial ANOVA');
    await page.locator('button[title="Two between-subject factors and their interaction."]').click();
    await expect(page.getByLabel('Factor B').locator('option[value="2"]')).toBeDisabled();
  });

  test('group-based procedures expose the levels editor', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Analysis', exact: true }).click();
    for (const [id, search, groupLabel, groupValue] of [
      ['lmm', 'Mixed Model', 'Group (random intercept)', '2'],
      ['gee', 'GEE', 'Cluster', '2'],
      ['mixedanova', 'Mixed ANOVA', 'Between-subject group', '2'],
      ['resampling', 'Resampling', 'Group', '2'],
      ['stratcox', 'Stratified Cox', 'Stratum', '3'],
    ] as const) {
      await page.getByLabel('Search analyses').fill(search);
      await page.locator(`[data-analysis-item="${id}"]`).click();
      await page.getByLabel(groupLabel, { exact: true }).selectOption(groupValue);
      await expect(page.getByRole('button', { name: /Edit levels for/ }).first()).toBeVisible();
    }
  });

  test('confidence level is hidden where the runner ignores it', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Analysis', exact: true }).click();

    await page.getByLabel('Search analyses').fill('Descriptive');
    await page.locator('button[title="Means, spread, quantiles and per-variable summaries."]').click();
    await expect(page.getByLabel('Confidence level')).toHaveCount(0);

    await page.getByLabel('Search analyses').fill('Sample Size');
    await page.locator('button[title="Sample size and power for common designs."]').click();
    await expect(page.getByLabel('Confidence level')).toHaveCount(0);
  });
});
