import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PARAMS } from '../../io/project';
import { runHeavyAnalysis } from './client';

test('the worker client degrades to unavailable outside a browser worker', async () => {
  const outcome = await runHeavyAnalysis(
    'lmm',
    { cols: [{ name: 'Y', type: 'num' }], rows: [['1']] },
    DEFAULT_PARAMS,
    95
  );
  assert.equal(outcome.status, 'unavailable');
});

test('aborting a run terminates the worker and reports cancellation', async () => {
  let terminated = false;
  const fake = {
    onmessage: null,
    onerror: null,
    onmessageerror: null,
    postMessage: () => undefined,
    terminate: () => {
      terminated = true;
    },
  } as unknown as Worker;
  const controller = new AbortController();
  const pending = runHeavyAnalysis(
    'lmm',
    { cols: [{ name: 'Y', type: 'num' }], rows: [['1']] },
    DEFAULT_PARAMS,
    95,
    { workerFactory: () => fake, signal: controller.signal }
  );
  controller.abort();
  assert.equal((await pending).status, 'cancelled');
  assert.equal(terminated, true);
});

test('maps worker progress and results to the serialisable outcome', async () => {
  let posted: { id: number; reportLocale?: string } | null = null;
  const phases: string[] = [];
  let terminated = false;
  const fake = {
    onmessage: null,
    onerror: null,
    onmessageerror: null,
    postMessage: (message: { id: number }) => {
      posted = message;
    },
    terminate: () => {
      terminated = true;
    },
  } as unknown as Worker;
  const pending = runHeavyAnalysis(
    'lmm',
    { cols: [{ name: 'Y', type: 'num' }], rows: [['1']] },
    DEFAULT_PARAMS,
    95,
    { workerFactory: () => fake, reportLocale: 'de', onProgress: phase => phases.push(phase) }
  );
  const id = (posted as { id: number }).id;
  assert.equal(posted?.reportLocale, 'de', 'the worker receives the report language');
  (fake as unknown as { onmessage: (event: { data: unknown }) => void }).onmessage({
    data: { type: 'progress', id, phase: 'computing', progress: 0.4 },
  });
  (fake as unknown as { onmessage: (event: { data: unknown }) => void }).onmessage({
    data: {
      type: 'result',
      id,
      ok: true,
      tables: [],
      report: null,
      charts: [],
      elapsedMs: 12,
    },
  });
  const outcome = await pending;
  assert.deepEqual(phases, ['starting', 'computing']);
  assert.equal(outcome.status, 'ok');
  assert.equal(terminated, true);
});
