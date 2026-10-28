import test from 'node:test';
import assert from 'node:assert/strict';
import { geeStats } from './gee';

const rows = [
  ['1.2711', '0.793', '1'], ['1.4895', '0.522', '1'], ['2.3906', '1.746', '1'],
  ['0.8361', '-1.271', '2'], ['3.2849', '2.197', '2'], ['1.6959', '0.433', '2'],
  ['0.9821', '-1.570', '3'], ['1.3156', '-0.935', '3'], ['1.2535', '0.063', '3'],
  ['-0.2823', '-0.002', '4'], ['-0.8324', '-2.277', '4'], ['0.6183', '0.757', '4'],
  ['1.1406', '-0.548', '5'], ['0.7438', '0.173', '5'], ['1.0649', '0.563', '5'],
  ['1.9907', '1.512', '6'], ['1.0471', '0.659', '6'], ['0.6117', '1.122', '6'],
  ['-0.7259', '-0.785', '7'], ['0.3961', '-0.426', '7'], ['0.0116', '0.393', '7'],
  ['0.6330', '0.037', '8'], ['0.4735', '-1.032', '8'], ['0.5284', '-1.265', '8'],
];

const close = (actual: number, expected: number, tolerance = 1e-3) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

test('Gaussian exchangeable GEE matches geepack', () => {
  const stats = geeStats({
    rows,
    depIdx: 0,
    indepIdxs: [1],
    clusterIdx: 2,
    family: 'gaussian',
    correlation: 'exchangeable',
    level: 95,
  });
  assert.ok(stats);
  if (!stats) return;
  assert.equal(stats.clusters, 8);
  close(stats.coefficients[0].beta, 0.89561701, 2e-3);
  close(stats.coefficients[1].beta, 0.51640490, 5e-3);
  close(stats.coefficients[0].se, 0.204128279, 5e-3);
  close(stats.coefficients[1].se, 0.096279223, 5e-3);
  assert.ok(stats.alpha > 0 && stats.alpha < 1);
});

test('GEE rejects invalid cluster structures', () => {
  assert.equal(
    geeStats({
      rows: [['1', '1', 'A'], ['2', '2', 'A'], ['3', '3', 'A']],
      depIdx: 0,
      indepIdxs: [1],
      clusterIdx: 2,
      family: 'gaussian',
      correlation: 'independence',
      level: 95,
    }),
    null
  );
});
