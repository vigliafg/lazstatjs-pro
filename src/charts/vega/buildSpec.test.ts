import test from 'node:test';
import assert from 'node:assert/strict';
import { compile } from 'vega-lite';
import { buildVegaSpec } from './buildSpec';
import { bandRows } from './encoding';
import { factoryOptions } from '../defaults';
import { makeChart } from '../kits/common';
import type { ChartKind, ScatterOptions } from '../../stats/charts';

const kinds: ChartKind[] = ['scatter', 'line', 'bar', 'box', 'histogram', 'interval', 'dot', 'ecdf', 'qq', 'forest', 'survival', 'risk', 'mosaic', 'acf', 'heatmap', 'residual', 'scree', 'score', 'bland', 'power', 'bootstrap', 'missingness'];

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
      cells: [{ x: 'A', y: 'B', value: 2, label: '2', x0: 0, x1: 0.5, y0: 0, y1: 1 }],
      line: [{ x: 1, y: 2 }],
      targets: [{ value: 80 }],
      rules: [{ y: 0 }],
      rows: [{ time: 0, group: 'A', atRisk: 10, events: 0 }],
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

test('box, notched and violin displays compile without warnings', () => {
  const chart = makeChart({
    id: 'box-display',
    kind: 'box',
    title: 'Box display',
    data: {
      summary: [
        { category: 'B', n: 20, min: 1, q1: 2, median: 10, q3: 11, max: 12, mean: 6 },
        { category: 'A', n: 20, min: 1, q1: 2, median: 2, q3: 3, max: 4, mean: 2 },
      ],
      points: Array.from({ length: 20 }, (_, index) => [
        { category: 'A', value: 1 + index * 0.15 },
        { category: 'B', value: 5 + index * 0.3 },
      ]).flat(),
      outliers: [],
    },
    fields: { xLabel: 'Group', yLabel: 'Value' },
  });
  const compileBox = (display: 'box' | 'notched' | 'violin') => {
    const warnings: string[] = [];
    const spec = buildVegaSpec(chart, { ...factoryOptions('box'), display } as never);
    compile(spec, { logger: { warn: (message: string) => warnings.push(message), info: () => {}, debug: () => {}, level: () => ({ warn: () => {}, info: () => {}, debug: () => {} }) } as never });
    return { spec: spec as never as { layer: Array<{ data?: { values?: Array<Record<string, unknown>> }; mark?: { type?: string } }> }, warnings };
  };
  for (const display of ['box', 'notched', 'violin'] as const) {
    assert.deepEqual(compileBox(display).warnings, [], display);
  }
  const notched = compileBox('notched').spec;
  assert.ok(notched.layer.some(layer => layer.mark?.type === 'area'));
  const violin = compileBox('violin').spec;
  const area = violin.layer[0];
  assert.ok(area.data.values?.length);
  assert.ok(area.data.values!.every(row => 'x1' in row && 'x2' in row));
});

test('histogram KDE and detrended Q-Q compile without warnings', () => {
  const histogram = makeChart({
    id: 'hist-kde',
    kind: 'histogram',
    title: 'Histogram',
    data: { values: [1, 2, 3, 4, 5, 6, 7, 8].map(value => ({ value })) },
  });
  const qq = makeChart({
    id: 'qq-detrended',
    kind: 'qq',
    title: 'Q-Q',
    data: {
      points: [{ x: -1, y: -1.2 }, { x: 0, y: 0.1 }, { x: 1, y: 0.9 }],
      reference: [{ x: -1, y: -1 }, { x: 1, y: 1 }],
    },
  });
  const cases = [
    buildVegaSpec(histogram, { ...factoryOptions('histogram'), showKde: true } as never),
    buildVegaSpec(qq, { ...factoryOptions('qq'), detrended: true } as never),
  ];
  for (const spec of cases) {
    const warnings: string[] = [];
    compile(spec, { logger: { warn: (message: string) => warnings.push(message), info: () => {}, debug: () => {}, level: () => ({ warn: () => {}, info: () => {}, debug: () => {} }) } as never });
    assert.deepEqual(warnings, []);
  }
});

test('sorted bars with labels and error bars keep the value order after compilation', () => {
  const chart = makeChart({
    id: 'bar-sorted',
    kind: 'bar',
    title: 'Bar',
    data: {
      bars: [
        { category: 'A', value: 10, lo: 8, hi: 12 },
        { category: 'B', value: 1, lo: 0, hi: 2 },
      ],
    },
  });
  const warnings: string[] = [];
  const spec = buildVegaSpec(chart, {
    ...factoryOptions('bar'),
    sort: 'asc',
    error: 'ci',
    valueLabels: true,
  } as never);
  const compiled = compile(spec, { logger: { warn: (message: string) => warnings.push(message), info: () => {}, debug: () => {}, level: () => ({ warn: () => {}, info: () => {}, debug: () => {} }) } as never }).spec as {
    scales?: Array<{ name: string; domain?: { sort?: unknown } }>;
  };
  assert.deepEqual(warnings, []);
  const x = compiled.scales?.find(scale => scale.name === 'x');
  // A conflicting sort collapses to `true`, i.e. alphabetical.
  assert.notEqual(x?.domain?.sort, true);
  assert.equal(typeof x?.domain?.sort, 'object');
});

test('a step line with a non-step reference diagonal compiles without warnings', () => {
  const chart = makeChart({
    id: 'roc',
    kind: 'line',
    title: 'ROC',
    data: {
      series: [
        { x: 0, y: 0, series: 'ROC' },
        { x: 50, y: 80, series: 'ROC' },
        { x: 100, y: 100, series: 'ROC' },
        { x: 0, y: 0, series: 'Diagonal', step: 0 },
        { x: 100, y: 100, series: 'Diagonal', step: 0 },
      ],
    },
  });
  const warnings: string[] = [];
  const spec = buildVegaSpec(chart, { ...factoryOptions('line'), step: true } as never);
  compile(spec, { logger: { warn: (message: string) => warnings.push(message), info: () => {}, debug: () => {}, level: () => ({ warn: () => {}, info: () => {}, debug: () => {} }) } as never });
  assert.deepEqual(warnings, []);
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
