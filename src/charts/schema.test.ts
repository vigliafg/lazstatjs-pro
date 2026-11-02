import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appendChartCopy,
  downsampleRows,
  fitChartBudget,
  fitPanelBudget,
  parseChartModel,
  parseChartModels,
  parsePanelModel,
  parsePanelModels,
} from './schema';
import { factoryOptions } from './defaults';
import {
  MAX_CHARTS_PER_OUTPUT,
  MAX_CHART_POINTS,
  MAX_PANEL_CHILDREN,
} from '../stats/charts';
import type { PanelChart } from '../stats/charts';
import { makeChart } from './kits/common';

const base = () =>
  makeChart({
    id: 'c1',
    kind: 'scatter',
    title: 'Chart',
    data: { points: [{ x: 1, y: 2 }] },
    fields: { xLabel: 'X', yLabel: 'Y' },
  });

test('parseChartModel accepts a valid model and restores factory options', () => {
  const parsed = parseChartModel({ ...base(), options: { kind: 'scatter' } });
  assert.ok(parsed);
  assert.equal(parsed?.options.kind, 'scatter');
  assert.equal(parsed?.options.theme, 'dark');
});

test('the new JMP-like options survive a parse/reload round trip', () => {
  const box = makeChart({
    id: 'box',
    kind: 'box',
    title: 'Box',
    data: { summary: [{ category: 'A', n: 5, min: 1, p10: 2, q1: 3, median: 4, q3: 5, p90: 6, max: 7, mean: 4 }] },
    options: {
      kind: 'box',
      whisker: 'percentile',
      showMeanInterval: true,
      jitter: true,
    },
  });
  const parsedBox = parseChartModel(box);
  assert.equal(parsedBox?.options.kind, 'box');
  if (parsedBox?.options.kind === 'box') {
    assert.equal(parsedBox.options.whisker, 'percentile');
    assert.equal(parsedBox.options.showMeanInterval, true);
    assert.equal(parsedBox.options.jitter, true);
  }

  const scatter = makeChart({
    id: 'scatter',
    kind: 'scatter',
    title: 'Scatter',
    data: { points: [{ x: 1, y: 2 }] },
    options: { kind: 'scatter', showMeanLine: true },
  });
  const parsedScatter = parseChartModel(scatter);
  assert.equal(
    parsedScatter?.options.kind === 'scatter' ? parsedScatter.options.showMeanLine : null,
    true
  );
});

test('the Milestone B kinds and options survive a parse/reload round trip', () => {
  const interval = makeChart({
    id: 'interval',
    kind: 'interval',
    title: 'Interval',
    data: { intervals: [{ category: 'A', estimate: 2, lo: 1, hi: 3 }] },
    options: { kind: 'interval', showMeanDiamond: true } as never,
  });
  const parsedInterval = parseChartModel(interval);
  assert.equal(
    parsedInterval?.options.kind === 'interval' ? parsedInterval.options.showMeanDiamond : null,
    true
  );

  const dot = makeChart({
    id: 'dot',
    kind: 'dot',
    title: 'Dot',
    data: { points: [{ category: 'A', value: 1 }] },
    options: { kind: 'dot', jitter: 'wide' } as never,
  });
  const parsedDot = parseChartModel(dot);
  assert.equal(parsedDot?.options.kind === 'dot' ? parsedDot.options.jitter : null, 'wide');

  const residual = makeChart({
    id: 'residual',
    kind: 'residual',
    title: 'Residual',
    data: { points: [{ x: 1, y: 0 }] },
    stats: { residSd: 1.1 },
    options: { kind: 'residual', showStdBand: true } as never,
  });
  const parsedResidual = parseChartModel(residual);
  assert.equal(
    parsedResidual?.options.kind === 'residual' ? parsedResidual.options.showStdBand : null,
    true
  );

  const matrix = makeChart({
    id: 'matrix',
    kind: 'scattermatrix',
    title: 'Matrix',
    data: {
      points: [{ x: 0.2, y: 0.3 }],
      panels: [{ px: 0, px2: 1, py: 0, py2: 1 }],
    },
    stats: { dim: 2 },
    options: { kind: 'scattermatrix', showEllipses: false } as never,
  });
  const parsedMatrix = parseChartModel(matrix);
  assert.equal(parsedMatrix?.kind, 'scattermatrix');
  assert.equal(
    parsedMatrix?.options.kind === 'scattermatrix' ? parsedMatrix.options.showEllipses : null,
    false
  );
  assert.equal(parsedMatrix?.stats?.dim, 2);
});

test('parseChartModel rejects unknown kinds, missing data and non-finite cells', () => {
  assert.equal(parseChartModel({ ...base(), kind: 'nope' }), null);
  assert.equal(parseChartModel({ ...base(), data: {} }), null);
  const parsed = parseChartModel({
    ...base(),
    data: { points: [{ x: Number.NaN, y: 2 }] },
  });
  assert.ok(parsed);
  assert.deepEqual(parsed?.data.points, [{ x: null, y: 2 }]);
});

test('downsampleRows keeps the endpoints and caps the layer', () => {
  const rows = Array.from({ length: MAX_CHART_POINTS + 500 }, (_, i) => ({ x: i, y: i }));
  const result = downsampleRows(rows);
  assert.equal(result.rows.length, MAX_CHART_POINTS);
  assert.equal(result.sampled, true);
  assert.equal(result.rows[0].x, 0);
  assert.equal(result.rows[result.rows.length - 1].x, rows.length - 1);
});

test('parseChartModels caps the number of charts and fitChartBudget reports overflow', () => {
  const charts = Array.from({ length: MAX_CHARTS_PER_OUTPUT + 3 }, (_, i) =>
    makeChart({
      id: `c${i}`,
      kind: 'bar',
      title: `Chart ${i}`,
      data: { bars: [{ category: 'A', value: i }] },
    })
  );
  assert.equal(parseChartModels(charts).length, MAX_CHARTS_PER_OUTPUT);
  const budget = fitChartBudget(charts, 0);
  assert.equal(budget.overflow, 3);
  assert.equal(budget.charts.length, MAX_CHARTS_PER_OUTPUT);
});

test('fitChartBudget drops charts that do not fit the card budget', () => {
  const chart = makeChart({
    id: 'big',
    kind: 'bar',
    title: 'Big',
    data: { bars: [{ category: 'A', value: 1 }] },
  });
  const budget = fitChartBudget([chart], 599_990, 600_000);
  assert.equal(budget.charts.length, 0);
  assert.equal(budget.omitted, 1);
});

const panel = (): PanelChart => ({
  version: 1,
  id: 'panel-1',
  kind: 'panel',
  title: 'Distribution',
  subtitle: 'One variable',
  note: 'Histogram and box come from the same run.',
  layout: 'grid',
  children: [base(), { ...base(), id: 'c2', kind: 'box' as never }],
  tables: [
    {
      id: 'summary',
      title: 'Summary',
      columns: [{ key: 'mean', label: 'Mean', format: 'dec2' }],
      rows: [{ mean: 2.5 }],
    },
  ],
});

test('parsePanelModel accepts a valid panel and sanitizes children and tables', () => {
  const parsed = parsePanelModel(panel());
  assert.ok(parsed);
  assert.equal(parsed?.kind, 'panel');
  assert.equal(parsed?.layout, 'grid');
  assert.equal(parsed?.children.length, 2);
  assert.equal(parsed?.children[0].options.kind, 'scatter');
  assert.equal(parsed?.tables?.[0].columns[0].key, 'mean');
  assert.equal(parsed?.tables?.[0].rows[0].mean, 2.5);
});

test('a panel is depth 1 and drops nested panels, malformed children and empty panels', () => {
  const nested = { ...panel(), children: [panel()] };
  assert.equal(parsePanelModel(nested), null);
  assert.equal(parsePanelModel({ ...panel(), children: [{ kind: 'nope' }] }), null);
  assert.equal(parsePanelModel({ ...panel(), children: [] }), null);
  assert.equal(parsePanelModel({ ...panel(), title: '' }), null);
  // A panel is not a chart kind: the ordinary chart parser refuses it.
  assert.equal(parseChartModel(panel()), null);
});

test('panel children and tables are capped', () => {
  const children = Array.from({ length: MAX_PANEL_CHILDREN + 3 }, (_, index) => ({
    ...base(),
    id: `child-${index}`,
  }));
  const rows = Array.from({ length: 400 }, (_, index) => ({ mean: index }));
  const parsed = parsePanelModel({
    ...panel(),
    children,
    tables: [
      {
        id: 'big',
        title: 'Big',
        columns: [{ key: 'mean', label: 'Mean' }],
        rows,
      },
    ],
  });
  assert.equal(parsed?.children.length, MAX_PANEL_CHILDREN);
  assert.equal(parsed?.tables?.[0].rows.length, 200);
  assert.equal(parsePanelModels([panel(), { kind: 'panel' }]).length, 1);
});

test('fitPanelBudget applies the same card budget as charts', () => {
  const panels = [panel(), { ...panel(), id: 'panel-2' }];
  const budget = fitPanelBudget(panels, 0, 200_000);
  assert.equal(budget.panels.length, 2);
  const tight = fitPanelBudget(panels, 199_990, 200_000);
  assert.equal(tight.panels.length, 0);
  assert.equal(tight.omitted, 2);
});

test('a chart model crosses a structuredClone boundary unchanged', () => {
  const model = base();
  assert.deepEqual(structuredClone(model), model);
});

test('factory options are valid for every kind', () => {
  for (const kind of ['scatter', 'line', 'bar', 'box', 'histogram', 'qq', 'forest', 'survival', 'acf', 'heatmap', 'residual', 'scree', 'score', 'bland', 'power', 'bootstrap', 'missingness'] as const) {
    assert.equal(factoryOptions(kind).kind, kind);
  }
});

test('a style-gallery insert appends a copy with a fresh id and respects the cap', () => {
  const first = base();
  const next = appendChartCopy([first], first);
  assert.ok(next);
  assert.equal(next.length, 2);
  assert.equal(next[1].id, 'c1-2');
  assert.deepEqual(next[1].data, first.data);
  // The original card is untouched (React state stays immutable).
  assert.equal(first.id, 'c1');
  assert.equal(next[0], first);

  const again = appendChartCopy(next!, first);
  assert.equal(again?.[2].id, 'c1-3');

  const full = Array.from({ length: MAX_CHARTS_PER_OUTPUT }, (_, index) => ({
    ...first,
    id: `c${index}`,
  }));
  assert.equal(appendChartCopy(full, first), null);
});
