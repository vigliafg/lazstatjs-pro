import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CSS_VARIABLE_NAMES,
  DEFAULT_THEME_ID,
  THEMES,
  cssVariablesOf,
  isThemeId,
  themeById,
  themesByMode,
  type ThemeDefinition,
} from './themes';

const parse = (hex: string): [number, number, number] => {
  const value = hex.replace('#', '');
  assert.equal(value.length, 6, `${hex} is not a six-digit hex colour`);
  return [0, 2, 4].map(offset => parseInt(value.slice(offset, offset + 2), 16) / 255) as [
    number,
    number,
    number,
  ];
};

const luminance = (hex: string): number => {
  const [r, g, b] = parse(hex).map(value =>
    value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string): number => {
  const [high, low] = [luminance(a), luminance(b)].sort((left, right) => right - left);
  return (high + 0.05) / (low + 0.05);
};

const assertContrast = (theme: ThemeDefinition, foreground: string, background: string, minimum: number) => {
  const ratio = contrast(foreground, background);
  assert.ok(
    ratio >= minimum,
    `${theme.id}: ${foreground} on ${background} = ${ratio.toFixed(2)}, expected >= ${minimum}`
  );
};

test('the registry ships exactly five dark and five light themes', () => {
  assert.equal(THEMES.length, 10);
  assert.equal(themesByMode('dark').length, 5);
  assert.equal(themesByMode('light').length, 5);
  assert.equal(new Set(THEMES.map(theme => theme.id)).size, THEMES.length);
  assert.equal(new Set(THEMES.map(theme => theme.name)).size, THEMES.length);
  assert.equal(isThemeId(DEFAULT_THEME_ID), true);
});

test('every theme declares every UI token and chart token', () => {
  for (const theme of THEMES) {
    for (const key of Object.keys(CSS_VARIABLE_NAMES)) {
      const colour = theme.tokens[key as keyof typeof theme.tokens];
      assert.match(colour, /^#[0-9a-f]{6}$/i, `${theme.id}.${key}`);
    }
    const variables = cssVariablesOf(theme);
    assert.equal(variables['--color-bg'], theme.tokens.bg);
    assert.equal(variables['--color-text3'], theme.tokens.text3);
    assert.equal(Object.keys(variables).length, Object.keys(CSS_VARIABLE_NAMES).length);
    assert.equal(theme.chart.palette.length >= 6, true, `${theme.id}: chart palette`);
    assert.match(theme.chart.background, /^#[0-9a-f]{6}$/i);
    assertContrast(theme, theme.tokens.onAccent, theme.tokens.accent, 4.5);
    assertContrast(theme, theme.tokens.onAccent2, theme.tokens.accent2, 4.5);
  }
});

test('text tokens keep AA contrast on every surface', () => {
  for (const theme of THEMES) {
    for (const background of [theme.tokens.bg, theme.tokens.surface, theme.tokens.surface3]) {
      assertContrast(theme, theme.tokens.text, background, 7);
      assertContrast(theme, theme.tokens.text2, background, 4.5);
      assertContrast(theme, theme.tokens.text3, background, 4.5);
    }
  }
});

test('accent tokens stay readable on the interface surfaces', () => {
  for (const theme of THEMES) {
    for (const background of [theme.tokens.bg, theme.tokens.surface]) {
      assertContrast(theme, theme.tokens.accent, background, 4.5);
      assertContrast(theme, theme.tokens.accent2, background, 4.5);
    }
  }
});

test('chart text and series colours remain visible on the chart surface', () => {
  for (const theme of THEMES) {
    assertContrast(theme, theme.chart.text, theme.chart.background, 7);
    assertContrast(theme, theme.chart.muted, theme.chart.background, 4.5);
    for (const colour of theme.chart.palette) {
      assertContrast(theme, colour, theme.chart.background, 3);
    }
  }
});

test('unknown ids fall back to the default theme', () => {
  assert.equal(themeById('missing').id, DEFAULT_THEME_ID);
  assert.equal(themeById(undefined).id, DEFAULT_THEME_ID);
  assert.equal(isThemeId('missing'), false);
  assert.equal(isThemeId(42), false);
});
