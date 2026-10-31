import test from 'node:test';
import assert from 'node:assert/strict';
import { base64ToBytes, bytesToBase64 } from './desktop';

test('the desktop bridge base64 helpers round-trip binary data', () => {
  const bytes = new Uint8Array(70_000);
  for (let index = 0; index < bytes.length; index += 1) bytes[index] = index % 256;
  const encoded = bytesToBase64(bytes);
  assert.equal(encoded.length, Math.ceil(bytes.length / 3) * 4);
  assert.deepEqual(base64ToBytes(encoded), bytes);
});
