import test from 'node:test';
import assert from 'node:assert/strict';
import type { SuccessEnvelope } from '../engine';
import { ResultCache } from './resultCache';

const envelope = (index: number): SuccessEnvelope =>
  ({
    schemaVersion: 1,
    status: 'ok',
    engine: { name: 'lazstats', version: 'test', runners: 1, chartKinds: 1 },
    analysis: { id: 'descriptive', label: 'Descriptive', family: 'descriptive' },
    input: { source: 'x', format: 'csv', sha256: 'x', rows: index, columns: 1 },
    params: {},
    ciLevel: 0.95,
    reportLocale: 'it',
    result: { ok: true, tables: [], report: null },
    warnings: [],
    artifacts: [],
  }) as SuccessEnvelope;

test('keeps at most the configured number of results, evicting the least recently used', () => {
  const cache = new ResultCache(60_000, 2, 1_000_000);
  const first = cache.put(envelope(1), 'one');
  const second = cache.put(envelope(2), 'two');
  assert.ok(first && second);
  assert.equal(cache.get(first)?.summary, 'one');
  const third = cache.put(envelope(3), 'three');
  assert.ok(third);
  assert.equal(cache.get(second), undefined);
  assert.equal(cache.get(first)?.envelope.input.rows, 1);
  assert.equal(cache.get(third)?.envelope.input.rows, 3);
});

test('expires entries and never caches oversized results', async () => {
  const cache = new ResultCache(5, 2, 1_000_000);
  const id = cache.put(envelope(1), 'one');
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(cache.get(id), undefined);

  const tiny = new ResultCache(60_000, 2, 10);
  assert.equal(tiny.put(envelope(1), 'one'), '');
  assert.equal(tiny.size, 0);
});
