import { expect, test, type Page } from '@playwright/test';

/**
 * Interface theme registry, persistence and the quick switch in the header.
 * The unit suite checks token completeness and contrast; these tests protect
 * the browser-only wiring (CSS variables, reload persistence and language
 * aware labels).
 */
const THEMES = [
  { id: 'one-dark-pro', bg: '#282c34', mode: 'dark' },
  { id: 'dracula', bg: '#282a36', mode: 'dark' },
  { id: 'monokai', bg: '#272822', mode: 'dark' },
  { id: 'night-owl', bg: '#011627', mode: 'dark' },
  { id: 'github-dark', bg: '#0d0f14', mode: 'dark' },
  { id: 'github-light', bg: '#ffffff', mode: 'light' },
  { id: 'solarized-light', bg: '#fdf6e3', mode: 'light' },
  { id: 'one-light', bg: '#fafafa', mode: 'light' },
  { id: 'quiet-light', bg: '#f5f5f5', mode: 'light' },
  { id: 'light-modern', bg: '#ffffff', mode: 'light' },
] as const;

const readVar = (page: Page, name: string) =>
  page.evaluate(cssName => getComputedStyle(document.documentElement).getPropertyValue(cssName).trim(), name);

test('all ten themes apply their tokens and persist across reloads', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the settings grid is exercised on the desktop layout');

  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'github-dark');

  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.locator('[data-theme-option]')).toHaveCount(10);

  for (const theme of THEMES) {
    const option = page.locator(`[data-theme-option="${theme.id}"]`);
    await option.scrollIntoViewIfNeeded();
    await option.click();
    await expect(option).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme.id);
    expect(await readVar(page, '--color-bg')).toBe(theme.bg);
    expect(
      await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)
    ).toBe(theme.mode);
  }

  // Use a light theme for the reload: it proves the persisted preference,
  // not just the dark default from the seed project.
  await page.waitForTimeout(1200);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light-modern');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.locator('[data-theme-option="light-modern"]')).toHaveAttribute('aria-checked', 'true');
  expect(await readVar(page, '--color-bg')).toBe('#ffffff');
  expect(await readVar(page, '--color-text')).toBe('#1f1f1f');
});

test('the header switches theme without opening settings', async ({ page }) => {
  await page.goto('/');
  const selector = page.getByLabel('Interface theme', { exact: true }).first();
  await expect(selector).toHaveValue('github-dark');

  await selector.selectOption('dracula');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dracula');
  expect(await readVar(page, '--color-accent')).toBe('#bd93f9');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dracula');
  await expect(page.getByLabel('Interface theme', { exact: true }).first()).toHaveValue('dracula');
});
