import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { MESSAGE_KEYS, t } from './i18n';

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
  'analysis.phase.starting',
  'analysis.phase.computing',
  'analysis.phase.finishing',
]);

const walk = (directory: string): string[] =>
  readdirSync(directory).flatMap(name => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const sourceText = walk('src')
  .filter(path => /\.(ts|tsx)$/.test(path) && !/\.test\.(ts|tsx)$/.test(path) && !path.endsWith('i18n.ts'))
  .map(path => readFileSync(path, 'utf8'))
  .join('\n');

test('every shell message has a non-empty value', () => {
  assert.ok(MESSAGE_KEYS.length > 20);
  for (const key of MESSAGE_KEYS) {
    assert.equal(typeof t(key), 'string');
    assert.ok(t(key).trim().length > 0, `${key} is empty`);
  }
});

test('every shell message is referenced by the UI', () => {
  const orphans = MESSAGE_KEYS.filter(
    key => !DYNAMIC_KEYS.has(key) && !sourceText.includes(`t('${key}')`)
  );
  assert.deepEqual(orphans, [], `orphan i18n keys: ${orphans.join(', ')}`);
});
