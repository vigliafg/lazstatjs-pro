import test from 'node:test';
import assert from 'node:assert/strict';
import { themeById } from './themes';
import {
  DEFAULT_OUTPUT_APPEARANCE,
  normalizeOutputAppearance,
  outputAppearanceStyle,
  outputFontStack,
} from './outputAppearance';

const theme = themeById('github-dark');

test('output appearance defaults to the theme', () => {
  const style = outputAppearanceStyle(DEFAULT_OUTPUT_APPEARANCE, theme);
  assert.equal(style['--output-bg'], theme.tokens.bg);
  assert.equal(style['--output-fg'], theme.tokens.text2);
  assert.equal(style['--output-surface'], theme.tokens.surface);
  assert.equal(style['--output-border'], theme.tokens.border);
  assert.equal(style['--output-size'], '12px');
  assert.equal(style['--output-font'], outputFontStack('theme'));
});

test('explicit colours, font and size override the theme only through the output variables', () => {
  const style = outputAppearanceStyle(
    { background: '#112233', foreground: '#f0f0f0', font: 'serif', fontSize: 16 },
    theme
  );
  assert.equal(style['--output-bg'], '#112233');
  assert.equal(style['--output-fg'], '#f0f0f0');
  assert.equal(style['--output-size'], '16px');
  assert.equal(style['--output-font'], outputFontStack('serif'));
  assert.notEqual(style['--output-surface'], theme.tokens.surface);
  assert.notEqual(style['--output-border'], theme.tokens.border);
  assert.equal(style['--output-text'], '#f0f0f0');
});

test('normalisation rejects junk and keeps valid values', () => {
  assert.deepEqual(normalizeOutputAppearance(null), DEFAULT_OUTPUT_APPEARANCE);
  assert.deepEqual(normalizeOutputAppearance({ background: 'red', fontSize: 99, font: 'comic' }), {
    ...DEFAULT_OUTPUT_APPEARANCE,
  });
  assert.deepEqual(
    normalizeOutputAppearance({
      background: '#AABBCC',
      foreground: '#010203',
      font: 'sans',
      fontSize: 14,
    }),
    { background: '#AABBCC', foreground: '#010203', font: 'sans', fontSize: 14 }
  );
});
