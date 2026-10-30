import test from 'node:test';
import assert from 'node:assert/strict';
import { buildResamplingOutput } from './run';
import { chartOptions } from '../../charts/defaults';

const grid = {
  cols: [
    { name: 'Y', type: 'num' as const },
    { name: 'G', type: 'cat' as const },
  ],
  rows: Array.from({ length: 30 }, (_, index) => [
    String((index % 7) + (index % 2 === 0 ? 1 : 4)),
    index % 2 === 0 ? 'A' : 'B',
  ]),
};

test('resampling adds the bootstrap density and Q-Q diagnostics', () => {
  const result = buildResamplingOutput({
    grid,
    params: { outcome: 0, group: 1, statistic: 'mean', permutations: 200, bootstrap: 200 },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const ids = (result.charts ?? []).map(chart => chart.id);
  assert.deepEqual(ids, ['resampling-bootstrap', 'resampling-permutation', 'resampling-bootstrap-qq']);
  const bootstrap = (result.charts ?? []).find(chart => chart.id === 'resampling-bootstrap');
  const options = bootstrap ? chartOptions(bootstrap) : undefined;
  assert.equal(options?.kind === 'bootstrap' ? options.showDensity : undefined, true);
  const qq = (result.charts ?? []).find(chart => chart.id === 'resampling-bootstrap-qq');
  assert.ok((qq?.data.points ?? []).length > 2);
  assert.ok((qq?.data.reference ?? []).length === 2);
});
