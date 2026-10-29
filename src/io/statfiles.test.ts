import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { readStatFile } from './statfiles';

const fixture = (name: string): string =>
  fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));

const readFixture = async (name: string): Promise<ArrayBuffer> => {
  const bytes = await readFile(fixture(name));
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
};

test('reads SPSS .sav with labels, levels, dates and missing values', async () => {
  const table = await readStatFile('sample.sav', await readFixture('sample.sav'));
  assert.equal(table.source, 'spss');
  assert.deepEqual(table.names, ['id', 'score', 'group', 'age', 'when', 'flag']);
  assert.deepEqual(table.types, ['id', 'num', 'cat', 'int', 'dat', 'int']);
  assert.equal(table.rows.length, 6);
  assert.equal(table.rows[2][1], '');
  assert.equal(table.rows[3][3], '');
  assert.equal(table.rows[4][4], '2024-01-05');
  assert.equal(table.meta?.[1]?.label, 'Test score');
  assert.equal(table.meta?.[2]?.label, 'Sex');
  assert.deepEqual(table.meta?.[2]?.levels, [
    { value: '1', label: 'Male' },
    { value: '2', label: 'Female' },
  ]);
});

test('reads Stata .dta with the same semantics', async () => {
  const table = await readStatFile('sample.dta', await readFixture('sample.dta'));
  assert.equal(table.source, 'stata');
  assert.deepEqual(table.types, ['id', 'num', 'cat', 'int', 'dat', 'int']);
  assert.equal(table.rows[0][4], '2024-01-01');
  assert.equal(table.rows[2][1], '');
  assert.equal(table.meta?.[2]?.levels?.[1]?.label, 'Female');
});

test('rejects compressed and malformed statistical files', async () => {
  await assert.rejects(() => readStatFile('sample.zsav', new Uint8Array([1]).buffer), /\.zsav/);
  await assert.rejects(() => readStatFile('sample.por', new Uint8Array([1]).buffer), /expected \.sav or \.dta/);
  await assert.rejects(() => readStatFile('sample.sav', new Uint8Array([1]).buffer), /Could not read SAV/);
});
