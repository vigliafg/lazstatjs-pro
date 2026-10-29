import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeText, stripBom } from './text';

const utf8 = (text: string): Uint8Array => new TextEncoder().encode(text);

test('strips a decoded BOM', () => {
  assert.equal(stripBom('\ufeffA,B'), 'A,B');
  assert.equal(stripBom('A,B'), 'A,B');
});

test('decodes UTF-8 with and without BOM', () => {
  assert.equal(decodeText(utf8('Peso;Età')).text, 'Peso;Età');
  assert.deepEqual(decodeText(new Uint8Array([0xef, 0xbb, 0xbf, ...utf8('A,B')])), {
    text: 'A,B',
    encoding: 'utf-8',
  });
});

test('decodes UTF-16LE with BOM', () => {
  const bytes = new Uint8Array([0xff, 0xfe, 0x41, 0x00, 0x2c, 0x00, 0x42, 0x00]);
  assert.deepEqual(decodeText(bytes), { text: 'A,B', encoding: 'utf-16le' });
});

test('falls back to Windows-1252 for non-UTF-8 text', () => {
  // "Età" in Windows-1252 is 45 74 E0.
  const bytes = new Uint8Array([0x50, 0x65, 0x73, 0x6f, 0x3b, 0x45, 0x74, 0xe0]);
  assert.deepEqual(decodeText(bytes), { text: 'Peso;Età', encoding: 'windows-1252' });
});
