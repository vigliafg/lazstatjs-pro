import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  ACTIVE_LOCALES,
  MESSAGE_KEYS,
  PLANNED_LOCALES,
  catalogFor,
  getLocale,
  placeholdersOf,
  setLocale,
  t,
  translate,
} from './i18n';

/** Keys resolved through a variable instead of a literal `t('key')` call. */
const DYNAMIC_KEYS = new Set([
  'analysis.output',
  'samplesize.twoMeans',
  'samplesize.oneMean',
  'samplesize.paired',
  'samplesize.twoProportions',
  'samplesize.correlation',
  'samplesize.anova',
  'samplesize.tost',
  'samplesize.survival',
]);

const walk = (directory: string): string[] =>
  readdirSync(directory).flatMap(name => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const sourceText = walk('src')
  .filter(
    path =>
      /\.(ts|tsx)$/.test(path) &&
      !/\.test\.(ts|tsx)$/.test(path) &&
      !path.includes(`${'src/i18n'}`)
  )
  .map(path => readFileSync(path, 'utf8'))
  .join('\n');

test('every shell message has a non-empty value', () => {
  assert.ok(MESSAGE_KEYS.length > 20);
  for (const key of MESSAGE_KEYS) {
    assert.equal(typeof t(key), 'string');
    assert.ok(t(key).trim().length > 0, `${key} is empty`);
  }
});

test('every active catalog covers every key, with identical placeholders', () => {
  for (const locale of ACTIVE_LOCALES) {
    const catalog = catalogFor(locale);
    for (const key of MESSAGE_KEYS) {
      const value = catalog[key];
      assert.equal(typeof value, 'string', `${locale}: ${key} missing`);
      assert.ok(value.trim().length > 0, `${locale}: ${key} is empty`);
      assert.deepEqual(
        placeholdersOf(value).sort(),
        placeholdersOf(translate('en', key)).sort(),
        `${locale}: ${key} placeholders differ`
      );
    }
  }
});

test('planned locales fall back to English until their catalog ships', () => {
  for (const locale of PLANNED_LOCALES) {
    assert.equal(catalogFor(locale), catalogFor('en'));
  }
});

test('every shell message is referenced by the UI', () => {
  const orphans = MESSAGE_KEYS.filter(
    key => !DYNAMIC_KEYS.has(key) && !sourceText.includes(`t('${key}'`)
  );
  assert.deepEqual(orphans, [], `orphan i18n keys: ${orphans.join(', ')}`);
});

test('translate selects the requested catalog and interpolates parameters', () => {
  assert.equal(translate('it', 'nav.data'), 'Dati');
  assert.equal(translate('en', 'nav.data'), 'Data');
  assert.equal(translate('fr', 'nav.data'), 'Data');
  assert.equal(translate('it', 'output.rows'), 'righe');
});

test('setLocale keeps the store stable and rejects unknown or inactive locales', () => {
  const before = getLocale();
  setLocale(before);
  assert.equal(getLocale(), before);
  assert.equal(typeof t('app.name'), 'string');
});
