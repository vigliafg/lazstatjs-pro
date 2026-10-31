import test from 'node:test';
import assert from 'node:assert/strict';
import { contrastRatio, themeContrastChecks, themeContrastReport } from './contrast';
import { createCustomTheme, type CustomTheme } from './custom';
import { THEMES } from './themes';

test('contrastRatio follows the WCAG scale', () => {
  assert.equal(Math.round(contrastRatio('#000000', '#ffffff')), 21);
  assert.equal(Math.round(contrastRatio('#ffffff', '#ffffff')), 1);
  assert.equal(contrastRatio('not-a-colour', '#ffffff'), 1);
});

test('the built-in themes pass the contrast report', () => {
  for (const theme of THEMES) {
    const report = themeContrastReport(theme);
    assert.equal(report.ok, true, `${theme.id}: ${JSON.stringify(report.checks.filter(c => !c.pass))}`);
    assert.ok(report.checks.some(check => check.id === 'chart-palette'));
  }
});

test('a low-contrast custom theme is reported with failed checks', () => {
  const base = THEMES[0];
  const low: CustomTheme = {
    ...createCustomTheme('Low contrast', base),
    tokens: {
      ...base.tokens,
      bg: '#777777',
      surface: '#777777',
      surface3: '#777777',
      text: '#888888',
      text2: '#888888',
      text3: '#888888',
    },
  };
  const report = themeContrastReport(low);
  assert.equal(report.ok, false);
  assert.ok(report.checks.some(check => check.id === 'text-bg' && !check.pass));
  assert.ok(report.checks.some(check => check.level === 'fail'));
});

test('themeContrastChecks covers the main interface and chart pairs', () => {
  const ids = themeContrastChecks(THEMES[0]).map(check => check.id);
  assert.deepEqual(ids, [
    'text-bg',
    'text-surface',
    'text-surface3',
    'text2-surface',
    'text3-surface',
    'onAccent-accent',
    'onAccent2-accent2',
    'accent-bg',
    'chart-text',
    'chart-muted',
    'chart-palette',
  ]);
});
