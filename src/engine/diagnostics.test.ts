import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDiagnostics } from './diagnostics';
import { EngineError } from './errors';
import type { Dataset } from '../grid/types';

test('full diagnostics are capped at 64 KB and keep counts and failed checks', () => {
  const rows = Array.from({ length: 5000 }, (_, index) => [`level-${index}`]);
  const grid: Dataset = {
    cols: [{ name: 'wide', type: 'cat' }],
    rows,
  };
  const error = new EngineError({
    code: 'E_PARAMS',
    kind: 'column_not_found',
    stage: 'params',
    message: 'Unknown column: wide',
    details: { column: 'wide' },
  });
  const diagnostics = buildDiagnostics({
    error,
    grid,
    level: 'full',
    includeRowNumbers: true,
  });
  assert.ok(diagnostics);
  assert.equal(diagnostics.truncated, true);
  assert.equal(diagnostics.dataset.rowsTotal, 5000);
  assert.equal(diagnostics.dataset.requiredColumns, 1);
  assert.ok(diagnostics.checks.some(item => item.status === 'failed'));
  assert.ok(Buffer.byteLength(JSON.stringify(diagnostics), 'utf8') <= 64 * 1024);
  assert.deepEqual(diagnostics.columns, []);
});
