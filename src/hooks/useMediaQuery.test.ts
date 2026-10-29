import test from 'node:test';
import assert from 'node:assert/strict';
import { useMediaQuery } from './useMediaQuery';

test('the media hook is callable outside the browser without throwing', () => {
  assert.equal(typeof useMediaQuery, 'function');
});
