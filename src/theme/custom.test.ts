import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CUSTOM_THEME_PREFIX,
  MAX_CUSTOM_THEMES,
  createCustomTheme,
  customThemesByMode,
  deriveChartTokens,
  duplicateCustomTheme,
  normalizeCustomThemes,
  resolveThemeDefinition,
  resolveThemeId,
  themeNameExists,
  type CustomTheme,
} from './custom';
import { DEFAULT_THEME_ID, THEMES, isThemeId } from './themes';

const base = THEMES[0];
const custom = (): CustomTheme => createCustomTheme('Paper', base);

test('createCustomTheme copies a base theme and gives it a unique custom id', () => {
  const first = custom();
  const second = createCustomTheme('Another', base, [first]);
  assert.equal(first.custom, true);
  assert.ok(first.id.startsWith(CUSTOM_THEME_PREFIX));
  assert.notEqual(first.id, second.id);
  assert.equal(first.mode, base.mode);
  assert.deepEqual(first.tokens, base.tokens);
  assert.deepEqual(first.chart.palette, base.chart.palette);
  assert.equal(themeNameExists([first], 'paper'), true);
});

test('createCustomTheme makes duplicate names unique', () => {
  const first = custom();
  const second = createCustomTheme('Paper', base, [first]);
  assert.notEqual(first.name, second.name);
  assert.match(second.name, /^Paper 2/);
});

test('normalizeCustomThemes accepts a valid theme and drops malformed entries', () => {
  const valid = custom();
  const invalid = normalizeCustomThemes([
    valid,
    { ...valid, id: 'bad', name: 'Bad hex', tokens: { ...valid.tokens, bg: 'red' } },
    { ...valid, id: 'short', name: 'Short palette', chart: { ...valid.chart, palette: ['#000000'] } },
    { ...valid, id: 'mode', name: 'Bad mode', mode: 'neon' },
    { ...valid, id: 'no-name', name: '' },
  ]);
  assert.equal(invalid.length, 1);
  assert.equal(invalid[0].id, valid.id);
});

test('normalizeCustomThemes deduplicates ids and names and protects built-in ids', () => {
  const first = custom();
  const second = { ...custom(), name: 'Second' };
  const builtInCollision = { ...custom(), id: DEFAULT_THEME_ID, name: 'Collision' };
  const normalized = normalizeCustomThemes([first, { ...second, id: first.id }, builtInCollision, { ...second, name: 'paper' }]);
  assert.equal(normalized.length, 3);
  assert.equal(new Set(normalized.map(theme => theme.id)).size, normalized.length);
  assert.equal(normalized.some(theme => theme.id === DEFAULT_THEME_ID), false);
  assert.equal(normalized.every(theme => theme.id.startsWith(CUSTOM_THEME_PREFIX)), true);
  assert.equal(new Set(normalized.map(theme => theme.name.toLowerCase())).size, normalized.length);
});

test('normalizeCustomThemes caps the library', () => {
  const many = Array.from({ length: MAX_CUSTOM_THEMES + 4 }, (_, index) => ({
    ...custom(),
    id: `custom-${index}`,
    name: `Theme ${index}`,
  }));
  assert.equal(normalizeCustomThemes(many).length, MAX_CUSTOM_THEMES);
});

test('resolveThemeId and resolveThemeDefinition fall back safely', () => {
  const customTheme = custom();
  assert.equal(resolveThemeId(DEFAULT_THEME_ID, [customTheme]), DEFAULT_THEME_ID);
  assert.equal(resolveThemeId(customTheme.id, [customTheme]), customTheme.id);
  assert.equal(resolveThemeId('missing', [customTheme]), DEFAULT_THEME_ID);
  assert.equal(resolveThemeDefinition(customTheme.id, [customTheme]).id, customTheme.id);
  assert.equal(resolveThemeDefinition('dracula', [customTheme]).id, 'dracula');
  assert.equal(resolveThemeDefinition('missing', [customTheme]).id, DEFAULT_THEME_ID);
});

test('deriveChartTokens maps UI colours to chart tokens', () => {
  const derived = deriveChartTokens(base.tokens);
  assert.equal(derived.background, base.tokens.bg);
  assert.equal(derived.text, base.tokens.text);
  assert.equal(derived.muted, base.tokens.text2);
  assert.deepEqual(derived.palette, [
    base.tokens.accent,
    base.tokens.green,
    base.tokens.yellow,
    base.tokens.purple,
    base.tokens.red,
    base.tokens.accent2,
  ]);
});

test('duplicateCustomTheme copies the custom theme with a new id and name', () => {
  const first = custom();
  const copy = duplicateCustomTheme(first, [first]);
  assert.notEqual(copy.id, first.id);
  assert.notEqual(copy.name, first.name);
  assert.deepEqual(copy.tokens, first.tokens);
  assert.deepEqual(copy.chart.palette, first.chart.palette);
  assert.equal(customThemesByMode([first, copy], first.mode).length, 2);
});

test('custom ids never collide with a built-in id', () => {
  const normalized = normalizeCustomThemes([{ ...custom(), id: 'github-dark' }]);
  assert.equal(normalized.length, 1);
  assert.equal(isThemeId(normalized[0].id), false);
  assert.equal(normalized[0].id.startsWith(CUSTOM_THEME_PREFIX), true);
});
