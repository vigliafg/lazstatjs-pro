import test from 'node:test';
import assert from 'node:assert/strict';
import { altLifeStressLine, altStressTransform } from '../../stats/alt/lifeStress';
import { buildAltOutput } from './run';

test('ALT stress transform follows the model', () => {
  assert.equal(altStressTransform(200, 'arrhenius'), 1 / 200);
  assert.equal(altStressTransform(Math.E, 'inversePower'), 1);
  assert.equal(altStressTransform(35, 'exponential'), 35);
  assert.equal(altStressTransform(0, 'exponential'), null);
  assert.equal(altStressTransform(Number.NaN, 'arrhenius'), null);
});

test('life-stress line keeps the fitted slope and passes the centroid', () => {
  const samples = [
    { stress: 1, time: 10 },
    { stress: 2, time: 5 },
    { stress: 3, time: 2.5 },
  ];
  const line = altLifeStressLine({ model: 'exponential', coefficients: [{ beta: -0.5 }] as never }, samples);
  assert.equal(line.length, 2);
  const meanZ = 2;
  const meanT = (1 + Math.log10(5) + Math.log10(2.5)) / 3;
  assert.equal(line[0].x, 1);
  assert.equal(line[1].x, 3);
  assert.ok(Math.abs(line[0].y - (meanT + (-0.5 * (1 - meanZ)) / Math.LN10)) < 1e-12);
  assert.ok(line[1].y < line[0].y, 'a negative stress coefficient shortens life as stress grows');
});

test('life-stress line needs a usable sample', () => {
  assert.deepEqual(altLifeStressLine({ model: 'exponential', coefficients: [] }, []), []);
  assert.deepEqual(
    altLifeStressLine(
      { model: 'arrhenius', coefficients: [{ beta: -1 }] as never },
      [
        { stress: 1, time: 3 },
        { stress: 1, time: 4 },
      ]
    ),
    []
  );
});

const grid = {
  cols: [
    { name: 'Failure time', type: 'num' as const },
    { name: 'Failed', type: 'int' as const },
    { name: 'Stress', type: 'num' as const },
  ],
  rows: Array.from({ length: 24 }, (_, index) => [
    String(1 + ((index * 13) % 40)),
    index % 4 === 0 ? '0' : '1',
    String(1 + ((index * 7) % 5)),
  ]),
};

test('accelerated life testing draws observed life against transformed stress', () => {
  const result = buildAltOutput({
    grid,
    params: { time: 0, event: 1, stress: 2, covariates: [], model: 'inversePower', useStress: 1 },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const chart = (result.charts ?? []).find(item => item.id === 'alt-life-stress');
  assert.ok(chart, 'the life-stress chart is present');
  if (!chart) return;
  assert.equal(chart.kind, 'scatter');
  const points = chart.data.points ?? [];
  assert.ok(points.length > 0);
  // Inverse power: the horizontal axis is log(stress), the vertical one log10(time).
  assert.ok(points.every(point => Math.exp(Number(point.x)) >= 1 && Number.isFinite(Number(point.y))));
  const line = chart.data.fit ?? [];
  assert.equal(line.length, 2);
  assert.ok(line[1].x > line[0].x);
});
