import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCompetingOutput } from './competing/run';
import { buildRecurrentOutput } from './recurrent/run';
import { buildAltOutput } from './alt/run';
import { buildReliabilityOutput } from './reliability/run';
import { buildParametricOutput } from './parametric/run';
import type { Dataset } from '../grid/types';

const grid = (names: string[], types: Dataset['cols'][number]['type'][], rows: string[][]): Dataset => ({
  cols: names.map((name, index) => ({ name, type: types[index] })),
  rows,
});

const competingGrid = (() => {
  const rows: string[][] = [];
  for (let index = 0; index < 180; index++) {
    const time = ((index * 37) % 23) + 1;
    const cause = index % 9 === 0 ? 0 : index % 6 === 0 ? 2 : 1;
    const age = 40 + (index % 45);
    const sex = index % 2 === 0 ? 'F' : 'M';
    rows.push([String(time), String(cause), String(age), sex]);
  }
  return grid(['Time', 'Cause', 'Age', 'Sex'], ['num', 'int', 'num', 'str'], rows);
})();

test('competing risks builder emits Fine–Gray tables and a CIF curve', () => {
  const result = buildCompetingOutput({
    grid: competingGrid,
    params: { time: 0, event: 1, cause: 1, covariates: [2] },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.ok(result.tables.some(spec => spec.id === 'competing-coefficients'));
  assert.ok((result.charts ?? []).some(chart => chart.id === 'competing-cif'));
  assert.ok(result.report);
});

const recurrentGrid = (() => {
  const rows: string[][] = [];
  for (let subject = 1; subject <= 70; subject++) {
    let start = 0;
    const count = 1 + (subject % 3);
    for (let eventIndex = 0; eventIndex < count; eventIndex++) {
      const stop = start + 1 + ((subject + eventIndex) % 4);
      rows.push([String(subject), String(start), String(stop), '1', String(1 + (subject % 3))]);
      start = stop;
    }
    rows.push([String(subject), String(start), String(start + 2 + (subject % 3)), '0', String(1 + (subject % 3))]);
  }
  return grid(['Id', 'Start', 'Stop', 'Event', 'X'], ['int', 'num', 'num', 'int', 'num'], rows);
})();

test('recurrent events builder runs both Andersen–Gill and WLW', () => {
  for (const model of ['ag', 'wlw'] as const) {
    const result = buildRecurrentOutput({
      grid: recurrentGrid,
      params: { id: 0, start: 1, stop: 2, event: 3, covariates: [4], model },
      ciLevel: 95,
    });
    assert.ok('ok' in result && result.ok, `${model}: ok`);
    if (!('ok' in result) || !result.ok) continue;
    assert.ok(result.tables.some(spec => spec.id === 'recurrent-coefficients'));
    assert.ok((result.charts ?? []).some(chart => chart.id === 'recurrent-forest'));
  }
});

const altGrid = (() => {
  const rows: string[][] = [];
  for (let index = 0; index < 160; index++) {
    const stress = [0.8, 1, 1.3, 1.8, 2.4][index % 5];
    const temperature = 55 + (index % 21);
    const time = 40 * Math.exp(-0.5 * Math.log(stress) + 0.01 * temperature) + (index % 7);
    rows.push([time.toFixed(3), index % 8 === 0 ? '0' : '1', String(stress), String(temperature)]);
  }
  return grid(['Time', 'Event', 'Stress', 'Temperature'], ['num', 'int', 'num', 'num'], rows);
})();

test('accelerated life builder emits the acceleration factor', () => {
  const result = buildAltOutput({
    grid: altGrid,
    params: {
      time: 0,
      event: 1,
      stress: 2,
      covariates: [3],
      model: 'inversePower',
      useStress: 0.7,
    },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.ok(result.tables.some(spec => spec.id === 'alt-summary'));
  assert.ok((result.charts ?? []).some(chart => chart.id === 'alt-acceleration'));
});

test('reliability builder handles growth and the block diagram', () => {
  const times = Array.from({ length: 18 }, (_, index) => (index + 1) * 25);
  const growthGrid = grid(
    ['Time', 'Failures'],
    ['num', 'int'],
    times.map((time, index) => [String(time), String(index + 1)])
  );
  const growth = buildReliabilityOutput({
    grid: growthGrid,
    params: { mode: 'growth', time: 0, failures: 1, stages: [['0.9']] },
    ciLevel: 95,
  });
  assert.ok('ok' in growth && growth.ok);
  if ('ok' in growth && growth.ok) {
    assert.ok(growth.tables.some(spec => spec.id === 'reliability-growth-summary'));
    assert.ok((growth.charts ?? []).some(chart => chart.id === 'reliability-growth'));
  }

  const rbd = buildReliabilityOutput({
    grid: growthGrid,
    params: { mode: 'rbd', time: 0, failures: 1, stages: [['0.95', '0.9'], ['0.99']] },
    ciLevel: 95,
  });
  assert.ok('ok' in rbd && rbd.ok);
  if ('ok' in rbd && rbd.ok) {
    assert.ok(rbd.tables.some(spec => spec.id === 'reliability-rbd-stages'));
    assert.ok((rbd.charts ?? []).some(chart => chart.id === 'reliability-rbd'));
  }
});

test('parametric builder runs the extra distributions', () => {
  const rows: string[][] = [];
  for (let index = 0; index < 100; index++) {
    const x = 20 + (index % 30);
    const time = Math.exp(5 - 0.02 * x) + (index % 11) * 0.3;
    rows.push([time.toFixed(3), index % 9 === 0 ? '0' : '1', String(x)]);
  }
  const parametricGrid = grid(['Time', 'Event', 'X'], ['num', 'int', 'num'], rows);
  for (const distribution of ['lognormal', 'loglogistic', 'gompertz'] as const) {
    const result = buildParametricOutput({
      grid: parametricGrid,
      params: { time: 0, event: 1, predictors: [2], distribution, upperVariable: -1 },
      ciLevel: 95,
    });
    assert.ok('ok' in result && result.ok, `${distribution}: ok`);
    if (!('ok' in result) || !result.ok) continue;
    assert.ok(result.tables.some(spec => spec.id === 'param-coefficients'));
    assert.ok((result.charts ?? []).length > 0);
  }
});
