import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { copyFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { closeWorkerPool } from '../engine';
import { PathGuard } from './paths';
import { ResultCache } from './resultCache';
import { RunGate } from './gate';
import { runAnalysisTool } from './tools/run';

let directory = '';
let guard: PathGuard;

before(() => {
  directory = mkdtempSync(join(tmpdir(), 'lazstats-mcp-run-'));
  copyFileSync('samples/descriptive/iris/data.csv', join(directory, 'iris.csv'));
  guard = new PathGuard(directory);
});

after(() => {
  closeWorkerPool();
  rmSync(directory, { recursive: true, force: true });
});

const resamplingArgs = (timeoutMs: number) => ({
  analysisId: 'resampling',
  dataPath: 'iris.csv',
  set: {
    'resampling.outcome': 'Sepal_Length',
    'resampling.group': 'Species' as string,
  },
  timeoutMs,
});

test('returns E_TIMEOUT and never caches a timed-out heavy run', async () => {
  const cache = new ResultCache();
  const result = await runAnalysisTool(
    resamplingArgs(100),
    guard,
    cache,
    new RunGate(),
    new AbortController().signal
  );
  assert.equal(result.isError, true);
  assert.equal((result.structuredContent as { code?: string }).code, 'E_TIMEOUT');
  assert.equal(cache.size, 0);
});

test('returns E_CANCELLED, leaves the cache empty and keeps the server usable', async () => {
  const cache = new ResultCache();
  const controller = new AbortController();
  const pending = runAnalysisTool(
    resamplingArgs(120_000),
    guard,
    cache,
    new RunGate(),
    controller.signal
  );
  await new Promise(resolve => setTimeout(resolve, 50));
  controller.abort();
  const result = await pending;
  assert.equal(result.isError, true);
  assert.equal((result.structuredContent as { code?: string }).code, 'E_CANCELLED');
  assert.equal(cache.size, 0);

  const afterCancel = await runAnalysisTool(
    { analysisId: 'descriptive', dataPath: 'iris.csv' },
    guard,
    cache,
    new RunGate(),
    new AbortController().signal
  );
  assert.equal(afterCancel.isError, undefined);
  assert.match((afterCancel.structuredContent as { resultId?: string }).resultId ?? '', /^res_/);
});
