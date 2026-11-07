import test from 'node:test';
import assert from 'node:assert/strict';
import { clearBackup, isNewerBackup, loadBackup, loadBackupRecord, saveBackup } from './backup';

test('backup helpers degrade safely without IndexedDB', async () => {
  assert.equal(await saveBackup('{}'), false);
  assert.equal(await loadBackup(), null);
  assert.equal(await loadBackupRecord(), null);
  await clearBackup();
});

test('isNewerBackup restores only a fresher IndexedDB copy', () => {
  assert.equal(isNewerBackup(null, '2026-11-07T10:00:00.000Z'), true);
  assert.equal(isNewerBackup('2026-11-07T09:00:00.000Z', '2026-11-07T10:00:00.000Z'), true);
  assert.equal(isNewerBackup('2026-11-07T11:00:00.000Z', '2026-11-07T10:00:00.000Z'), false);
  assert.equal(isNewerBackup('2026-11-07T10:00:00.000Z', '2026-11-07T10:00:00.000Z'), false);
  assert.equal(isNewerBackup(null, null), false);
  assert.equal(isNewerBackup(null, ''), false);
  assert.equal(isNewerBackup('not-a-date', '2026-11-07T10:00:00.000Z'), true);
  assert.equal(isNewerBackup('2026-11-07T10:00:00.000Z', 'not-a-date'), false);
});
