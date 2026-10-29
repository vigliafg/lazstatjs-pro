import test from 'node:test';
import assert from 'node:assert/strict';
import { clearBackup, loadBackup, saveBackup } from './backup';

test('backup helpers degrade safely without IndexedDB', async () => {
  assert.equal(await saveBackup('{}'), false);
  assert.equal(await loadBackup(), null);
  await clearBackup();
});
