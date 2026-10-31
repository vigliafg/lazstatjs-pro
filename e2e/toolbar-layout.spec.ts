import { expect, test, type Page } from '@playwright/test';

/**
 * The data toolbar mixes icons, labels and group separators. It must wrap
 * inside the viewport instead of pushing the whole screen sideways, and every
 * button must stay inside the toolbar box at every supported width.
 */

const WIDTHS = [1440, 1280, 1024, 768, 640, 412, 360];

const metrics = (page: Page) =>
  page.evaluate(() => {
    const toolbar = document.querySelector<HTMLElement>('[role="toolbar"][aria-label]');
    if (!toolbar) throw new Error('data toolbar missing');
    const rect = toolbar.getBoundingClientRect();
    const buttons = [...toolbar.querySelectorAll('button')].map(button =>
      button.getBoundingClientRect()
    );
    return {
      overflowX: toolbar.scrollWidth > toolbar.clientWidth + 1,
      buttonOutside: buttons.some(
        button => button.right > rect.right + 1 || button.left < rect.left - 1
      ),
      bodyOverflowX: document.body.scrollWidth > document.body.clientWidth + 1,
    };
  });

test.describe('data toolbar layout', () => {
  test.skip(({ isMobile }) => isMobile, 'the data toolbar is a desktop layout');

  for (const width of WIDTHS) {
    test(`stays inside a ${width}px viewport`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await expect(page.locator('[role="toolbar"][aria-label]').first()).toBeVisible();

      const result = await metrics(page);
      expect(result.overflowX).toBe(false);
      expect(result.buttonOutside).toBe(false);
      expect(result.bodyOverflowX).toBe(false);
    });
  }

  for (const width of [1280, 1024]) {
    test(`stays inside a ${width}px viewport with German labels`, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem('lazstats.locale.v1', 'de'));
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await expect(page.locator('[role="toolbar"][aria-label]').first()).toBeVisible();

      const result = await metrics(page);
      expect(result.overflowX).toBe(false);
      expect(result.buttonOutside).toBe(false);
      expect(result.bodyOverflowX).toBe(false);
    });
  }
});
