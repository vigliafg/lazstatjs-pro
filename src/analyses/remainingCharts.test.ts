import test from 'node:test';
import assert from 'node:assert/strict';
import { compile } from 'vega-lite';
import { buildVegaSpec } from '../charts/vega/buildSpec';
import { DEFAULT_PARAMS } from '../io/project';
import type { AnalysisChart } from '../stats/charts';
import type { AnalysisRunResult } from './types';
import { buildCountOutput } from './countreg/run';
import { buildOrdinalOutput } from './ordinal/run';
import { buildGeeOutput } from './gee/run';
import { buildAgreementOutput } from './agreement/run';
import { buildParametricOutput } from './parametric/run';
import { buildTostOutput } from './tost/run';
import { buildAnovaOutput } from './anova/run';
import { buildAncovaOutput } from './ancova/run';
import { buildRepeatedAnovaOutput } from './repeatedanova/run';
import { buildSurvivalOutput } from './survival/run';
import { buildResamplingOutput } from './resampling/run';
import { buildTimeSeriesOutput } from './timeseries/run';

const numeric = (names: string[]) => names.map(name => ({ name, type: 'num' as const }));

const chartsOf = (result: AnalysisRunResult): AnalysisChart[] => {
  assert.ok('ok' in result && result.ok, 'reason' in result ? result.reason : 'failed');
  if (!('ok' in result) || !result.ok) return [];
  for (const chart of result.charts) {
    const warnings: string[] = [];
    compile(buildVegaSpec(chart), {
      logger: {
        warn: (message: string) => warnings.push(message),
        info: () => {},
        debug: () => {},
        level: () => ({ warn: () => {}, info: () => {}, debug: () => {} }),
      },
    } as never);
    assert.deepEqual(warnings, [], chart.id);
  }
  return result.charts;
};

const countGrid = {
  cols: numeric(['Y', 'X']),
  rows: Array.from({ length: 20 }, (_, index) => [String(index % 5), String((index % 3) + 1)]),
};
const ordinalGrid = {
  cols: numeric(['Y', 'X']),
  rows: Array.from({ length: 30 }, (_, index) => [String((index % 3) + 1), String((index % 5) + 1)]),
};
const geeGrid = {
  cols: [...numeric(['Y', 'X']), { name: 'C', type: 'cat' as const }],
  rows: Array.from({ length: 24 }, (_, index) => [
    String((index % 5) + (index % 3)),
    String((index % 4) + 1),
    `C${index % 6}`,
  ]),
};
const agreementGrid = {
  cols: numeric(['A', 'B']),
  rows: Array.from({ length: 20 }, (_, index) => [String(index + 1), String(index + 1 + (index % 2))]),
};
const kappaGrid = {
  cols: [
    { name: 'R1', type: 'cat' as const },
    { name: 'R2', type: 'cat' as const },
  ],
  rows: Array.from({ length: 20 }, (_, index) => [index % 2 ? 'A' : 'B', index % 3 ? 'A' : 'B']),
};
const survivalGrid = {
  cols: numeric(['T', 'X', 'E']),
  rows: Array.from({ length: 20 }, (_, index) => [String(index + 1), String((index % 4) + 1), String(index % 2)]),
};
const tostGrid = {
  cols: numeric(['A', 'B']),
  rows: Array.from({ length: 20 }, (_, index) => [String(index + 1), String(index + 1 + (index % 2))]),
};
const anovaGrid = {
  cols: [
    { name: 'Y', type: 'num' as const },
    { name: 'G', type: 'int' as const },
  ],
  rows: Array.from({ length: 60 }, (_, index) => [
    String((index % 6) + (index % 3) * 2),
    String(index % 3),
  ]),
};

test('the new regression, agreement and survival charts compile and are present', () => {
  const count = chartsOf(
    buildCountOutput({ grid: countGrid, params: DEFAULT_PARAMS.countreg, ciLevel: 95 })
  );
  assert.ok(count.some(chart => chart.id === 'count-irr-forest'));
  assert.ok(count.some(chart => chart.id === 'count-residual-qq'));
  assert.ok(count.some(chart => chart.id === 'count-dispersion'));
  assert.ok(count.some(chart => chart.id === 'count-rootogram'));

  const ordinal = chartsOf(
    buildOrdinalOutput({ grid: ordinalGrid, params: DEFAULT_PARAMS.ordinal, ciLevel: 95 })
  );
  assert.ok(ordinal.some(chart => chart.id === 'ordinal-or-forest'));
  assert.ok(ordinal.some(chart => chart.id === 'ordinal-thresholds'));
  assert.ok(ordinal.some(chart => chart.id === 'ordinal-probability-heatmap'));

  const gee = chartsOf(buildGeeOutput({ grid: geeGrid, params: DEFAULT_PARAMS.gee, ciLevel: 95 }));
  assert.ok(gee.some(chart => chart.id === 'gee-coefficient-forest'));
  assert.ok(gee.some(chart => chart.id === 'gee-cluster-residuals'));
  assert.ok(gee.some(chart => chart.id === 'gee-residual-qq'));
  assert.ok(gee.some(chart => chart.id === 'gee-marginal'));

  const parametric = chartsOf(
    buildParametricOutput({ grid: survivalGrid, params: DEFAULT_PARAMS.parametric, ciLevel: 95 })
  );
  assert.ok(parametric.some(chart => chart.id === 'parametric-coefficients'));
  assert.ok(parametric.some(chart => chart.id === 'parametric-median'));
});

test('agreement, TOST, ANOVA, survival and selected time-series charts expose the new objects', () => {
  const bland = chartsOf(
    buildAgreementOutput({
      grid: agreementGrid,
      params: { ...DEFAULT_PARAMS.agreement, mode: 'bland' },
      ciLevel: 95,
    })
  );
  assert.ok(bland.some(chart => chart.id === 'agreement-bland-ci'));

  const kappa = chartsOf(
    buildAgreementOutput({
      grid: kappaGrid,
      params: { ...DEFAULT_PARAMS.agreement, mode: 'kappa' },
      ciLevel: 95,
    })
  );
  assert.ok(kappa.some(chart => chart.id === 'agreement-kappa-ci'));

  const tost = chartsOf(
    buildTostOutput({ grid: tostGrid, params: DEFAULT_PARAMS.tost, ciLevel: 95 })
  );
  assert.ok((tost[0]?.data.regions ?? []).length === 1);

  const anova = chartsOf(
    buildAnovaOutput({
      grid: anovaGrid,
      anovaParams: { ...DEFAULT_PARAMS.anova, grp: 1 },
      ciLevel: 95,
    })
  );
  assert.ok(anova.some(chart => chart.id === 'anova-posthoc-forest'));
  assert.ok(anova.some(chart => chart.id === 'anova-residual-qq'));

  const survivalGrid2 = {
    cols: [...numeric(['T']), { name: 'E', type: 'int' as const }, { name: 'G', type: 'cat' as const }],
    rows: Array.from({ length: 30 }, (_, index) => [
      String((index % 10) + 1),
      String(index % 3 === 0 ? 1 : 0),
      index % 2 === 0 ? 'A' : 'B',
    ]),
  };
  const survival = chartsOf(
    buildSurvivalOutput({
      grid: survivalGrid2,
      params: { timeVariable: 0, eventVariable: 1, groupVariable: 2 },
      ciLevel: 95,
    } as never)
  );
  const km = survival.find(chart => chart.id === 'survival-km');
  assert.ok((km?.data.annotations ?? []).length === 1);

  const seriesGrid = {
    cols: numeric(['Y']),
    rows: Array.from({ length: 24 }, (_, index) => [String(10 + index + (index % 4) * 2)]),
  };
  const series = chartsOf(
    buildTimeSeriesOutput({
      grid: seriesGrid,
      params: {
        variable: 0,
        period: 4,
        horizon: 3,
        differenceMode: 'auto',
        seasonalDifferenceMode: 'auto',
      },
      ciLevel: 95,
    })
  );
  assert.ok(series.some(chart => chart.id === 'ts-spectrum'));
  assert.ok(series.some(chart => chart.id === 'ts-rolling'));
});

test('ANCOVA and repeated ANOVA expose the adjusted profile and change plot', () => {
  const ancovaGrid = {
    cols: [
      { name: 'Y', type: 'num' as const },
      { name: 'G', type: 'int' as const },
      { name: 'X', type: 'num' as const },
    ],
    rows: Array.from({ length: 40 }, (_, index) => [
      String((index % 3) * 2 + (index % 5) + 1),
      String(index % 3),
      String((index % 7) + 1),
    ]),
  };
  const ancova = chartsOf(
    buildAncovaOutput({
      grid: ancovaGrid,
      params: { ...DEFAULT_PARAMS.ancova, factor: 1, covariates: [2] },
      ciLevel: 95,
    })
  );
  assert.ok(ancova.some(chart => chart.id === 'ancova-profile'));
  assert.ok(ancova.some(chart => chart.id === 'ancova-residual-qq'));

  const repeatedGrid = {
    cols: numeric(['A', 'B', 'C']),
    rows: Array.from({ length: 12 }, (_, index) => [
      String(index + 1),
      String(index + 2 + (index % 2)),
      String(index + 3 + (index % 3)),
    ]),
  };
  const repeated = chartsOf(
    buildRepeatedAnovaOutput({
      grid: repeatedGrid,
      params: { selected: [0, 1, 2] },
      ciLevel: 95,
    })
  );
  assert.ok(repeated.some(chart => chart.id === 'repeated-change'));
});

test('resampling reports the BCa interval', () => {
  const grid = {
    cols: [...numeric(['Y']), { name: 'G', type: 'cat' as const }],
    rows: Array.from({ length: 30 }, (_, index) => [
      String((index % 7) + (index % 2 === 0 ? 1 : 4)),
      index % 2 === 0 ? 'A' : 'B',
    ]),
  };
  const result = buildResamplingOutput({
    grid,
    params: { ...DEFAULT_PARAMS.resampling, group: 1, permutations: 200, bootstrap: 200 },
    ciLevel: 95,
  });
  const charts = chartsOf(result);
  const bootstrap = charts.find(chart => chart.id === 'resampling-bootstrap');
  assert.equal((bootstrap?.data.bca ?? []).length, 2);
  const testTable = 'ok' in result && result.ok
    ? result.tables.find(table => table.id === 'resampling-test')
    : undefined;
  assert.ok(testTable?.rows.some(row => String(row.metric).includes('BCa')));
});
