import test from 'node:test';
import assert from 'node:assert/strict';
import { MESSAGE_KEYS, t } from './i18n';

test('every shell message has a non-empty value', () => {
  assert.ok(MESSAGE_KEYS.length > 20);
  for (const key of MESSAGE_KEYS) {
    assert.equal(typeof t(key), 'string');
    assert.ok(t(key).trim().length > 0, `${key} is empty`);
  }
});
