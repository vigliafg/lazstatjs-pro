import test from 'node:test';
import assert from 'node:assert/strict';
import { compile } from 'vega-lite';
import { buildVegaSpec } from './buildSpec';
import { bandRows } from './encoding';
import { factoryOptions } from '../defaults';
import { makeChart } from '../kits/common';
import type { ChartKind, ScatterOptions } from '../../stats/charts';

const kinds: ChartKind[] = ['scatter', 'line', 'bar', 'box', 'histogram', 'qq', 'forest', 'survival', 'acf', 'heatmap', 'mosaic', 'residual', 'scree', 'score', 'bland', 'power', 'bootstrap', 'missingness'];

const modelFor = (kind: ChartKind) =>
  makeChart({
    id: kind,
    kind,
    title: `Test ${kind}`,
    subtitle: 'Subtitle',
    note: 'Note',
    data: {
      points: [{ x: 1, y: 2 }, { x: 2, y: 3 }],
      fit: [{ x: 1, y: 1 }, { x: 2, y: 2 }],
      robust: [{ x: 1, y: 1.1 }, { x: 2, y: 2.1 }],
      series: [{ x: 1, y: 2, series: 'A' }, { x: 2, y: 3, series: 'A' }],
      markers: [{ x: 1, y: 2, series: 'A' }],
      bars: [{ category: 'A', value: 2 }, { category: 'B', value: 3 }],
      summary: [{ category: 'A', min: 1, q1: 1.5, median: 2, q3: 2.5, max: 3, mean: 2 }],
      values: [{ value: 1 }, { value: 2 }, { value: 3 }],
      reference: [{ x: 1, y: 1 }, { x: 2, y: 2 }],
      curves: [{ x: 1, y: 0.8, series: 'A', lo: 0.7, hi: 0.9 }],
      censored: [{ x: 1, y: 0.8, series: 'A' }],
      medians: [{ x: 1, series: 'A' }],
      band: [{ lag: 1, value: 0.2 }],
      cells: [{ x: 'A', y: 'B', value: 2, label: '2' }],
      line: [{ x: 1, y: 2 }],
      targets: [{ value: 80 }],
      rules: [{ y: 0 }],
    },
    fields: { xLabel: 'X', yLabel: 'Y', series: 'Series' },
    stats: { df: 10, equation: 'y = 1 + x', r2: 0.9, n: 20 },
  });

test('every chart kind compiles to Vega-Lite without warnings', () => {
  for (const kind of kinds) {
    const warnings: string[] = [];
    const spec = buildVegaSpec(modelFor(kind), factoryOptions(kind));
    compile(spec, { logger: { warn: (message: string) => warnings.push(message), info: () => {}, debug: () => {}, level: () => ({ warn: () => {}, info: () => {}, debug: () => {} }) } as never });
    assert.deepEqual(warnings, [], `${kind}: ${warnings.join(' · ')}`);
  }
});

test('the scatter band is narrower than the prediction band and grows with the level', () => {
  const chart = makeChart({
    id: 'band',
    kind: 'scatter',
    title: 'Band',
    data: { points: [{ x: 0, y: 0 }, { x: 1, y: 1 }], grid: [
      { x: 0, yhat: 0, seMean: 0.1, sePred: 0.2 },
      { x: 1, yhat: 1, seMean: 0.1, sePred: 0.2 },
    ] },
    stats: { df: 20 },
  });
  const ci = (level: ScatterOptions['bandLevel']) =>
    bandRows(chart, { ...factoryOptions('scatter'), kind: 'scatter', band: 'ci', bandLevel: level } as ScatterOptions);
  const pi = (level: ScatterOptions['bandLevel']) =>
    bandRows(chart, { ...factoryOptions('scatter'), kind: 'scatter', band: 'pi', bandLevel: level } as ScatterOptions);
  const width = (rows: { lo?: unknown; hi?: unknown }[]) =>
    Number(rows[0].hi) - Number(rows[0].lo);
  assert.ok(width(pi(95)) > width(ci(95)));
  assert.ok(width(ci(99)) > width(ci(90)));
  assert.ok(width(pi(99)) > width(pi(90)));
});
