import test from 'node:test';
import assert from 'node:assert/strict';
import { compile } from 'vega-lite';
import { buildMixedAnovaOutput } from './mixedanova/run';
import { buildTostOutput } from './tost/run';
import { buildCountOutput } from './countreg/run';
import { buildOrdinalOutput } from './ordinal/run';
import { buildLmmOutput } from './lmm/run';
import { buildGeeOutput } from './gee/run';
import { buildStratifiedCoxOutput } from './stratcox/run';
import { buildTdCoxOutput } from './tdcox/run';
import { buildParametricOutput } from './parametric/run';
import { buildContingencyOutput } from './contingency/run';
import { buildMiOutput } from './mi/run';
import { buildResamplingOutput } from './resampling/run';
import { buildAgreementOutput } from './agreement/run';
import { buildNonParamOutput } from './nonparamrm/run';
import { DEFAULT_PARAMS } from '../io/project';
import { buildVegaSpec } from '../charts/vega/buildSpec';
import type { AnalysisRunResult } from './types';
import type { ColType } from '../grid/types';

const cols = (names: string[], type: ColType = 'num') => names.map(name => ({ name, type }));

const assertCharts = (name: string, result: AnalysisRunResult) => {
  assert.ok('ok' in result && result.ok, `${name}: ${'reason' in result ? result.reason : 'failed'}`);
  if (!('ok' in result) || !result.ok) return;
  assert.ok((result.charts?.length ?? 0) > 0, `${name}: no charts`);
  for (const chart of result.charts ?? []) {
    assert.doesNotThrow(() => compile(buildVegaSpec(chart)), `${name}/${chart.id}`);
  }
};

test('Milestone B charts are produced and compile', () => {
  assertCharts(
    'mixedanova',
    buildMixedAnovaOutput({
      grid: {
        cols: cols(['G', 'C1', 'C2', 'C3']),
        rows: [
          ['A', '1', '2', '3'], ['A', '2', '3', '4'], ['A', '3', '4', '5'],
          ['B', '2', '4', '6'], ['B', '3', '5', '7'], ['B', '4', '6', '8'],
        ],
      },
      params: { group: 0, conditions: [1, 2, 3] } as never,
      ciLevel: 95,
    })
  );
  assertCharts(
    'tost',
    buildTostOutput({
      grid: { cols: cols(['A', 'B']), rows: [['1', '2'], ['2', '3'], ['3', '4'], ['4', '5'], ['5', '6'], ['6', '7']] },
      params: { design: 'ind', var1: 0, var2: 1, mu: 0, margin: 2, equalVar: true } as never,
      ciLevel: 95,
    })
  );
  assertCharts(
    'countreg',
    buildCountOutput({
      grid: { cols: cols(['Y', 'X']), rows: Array.from({ length: 20 }, (_, i) => [String((i % 5) + 1), String(i + 1)]) },
      params: { family: 'poisson', dep: 0, indeps: [1] } as never,
      ciLevel: 95,
    })
  );
  assertCharts(
    'ordinal',
    buildOrdinalOutput({
      grid: { cols: cols(['Y', 'X']), rows: Array.from({ length: 30 }, (_, i) => [String((i % 3) + 1), String((i % 5) + 1)]) },
      params: { dep: 0, indeps: [1] } as never,
      ciLevel: 95,
    })
  );
  assertCharts(
    'lmm',
    buildLmmOutput({
      grid: {
        cols: [...cols(['Y', 'X']), { name: 'G', type: 'cat' }],
        rows: Array.from({ length: 20 }, (_, i) => [String(10 + (i % 3)), String(i % 5), String.fromCharCode(65 + (i % 3))]),
      },
      params: { dep: 0, indeps: [1], group: 2 } as never,
      ciLevel: 95,
    })
  );
  assertCharts(
    'gee',
    buildGeeOutput({
      grid: {
        cols: [...cols(['Y', 'X']), { name: 'C', type: 'cat' }],
        rows: Array.from({ length: 20 }, (_, i) => [String(i % 2), String(i % 5), String.fromCharCode(65 + (i % 4))]),
      },
      params: { dep: 0, indeps: [1], cluster: 2, family: 'binomial', correlation: 'exchangeable' } as never,
      ciLevel: 95,
    })
  );
  assertCharts(
    'stratcox',
    buildStratifiedCoxOutput({
      grid: {
        cols: cols(['T', 'E', 'S', 'X']),
        rows: Array.from({ length: 40 }, (_, i) => [String((i % 10) + 1), String(i % 3 === 0 ? 1 : 0), String.fromCharCode(65 + (i % 2)), String((i % 7) / 7)]),
      },
      params: { time: 0, event: 1, covariates: [3], stratum: 2 } as never,
      ciLevel: 95,
    })
  );
  assertCharts(
    'tdcox',
    buildTdCoxOutput({
      grid: {
        cols: cols(['S', 'T', 'E', 'X']),
        rows: Array.from({ length: 40 }, (_, i) => {
          const start = i / 2;
          return [String(start), String(start + 1), String(i % 3 === 0 ? 1 : 0), String(((i * 13) % 7) / 7)];
        }),
      },
      params: { start: 0, stop: 1, event: 2, covariates: [3] } as never,
      ciLevel: 95,
    })
  );
  assertCharts(
    'parametric',
    buildParametricOutput({
      grid: { cols: cols(['T', 'E', 'X']), rows: Array.from({ length: 20 }, (_, i) => [String(i + 1), String(i % 2), String(i % 5)]) },
      params: { time: 0, event: 1, predictors: [2], distribution: 'weibull' } as never,
      ciLevel: 95,
    })
  );
  assertCharts('contingency', buildContingencyOutput({ params: DEFAULT_PARAMS.contingency, ciLevel: 95 }));
  assertCharts(
    'mi',
    buildMiOutput({
      grid: { cols: cols(['X', 'Y']), rows: [['1', '2'], ['', '3'], ['3', ''], ['4', '5'], ['', '6'], ['6', '7']] },
      params: { variables: [0, 1], imputations: 3, iterations: 2, model: 'descriptives', outcome: 0, predictors: [1] } as never,
      ciLevel: 95,
    })
  );
  assertCharts(
    'resampling',
    buildResamplingOutput({
      grid: {
        cols: [...cols(['Y']), { name: 'G', type: 'cat' }],
        rows: Array.from({ length: 20 }, (_, i) => [String((i % 5) + 1), i % 2 === 0 ? 'A' : 'B']),
      },
      params: { outcome: 0, group: 1, statistic: 'mean', permutations: 99, bootstrap: 99 } as never,
      ciLevel: 95,
    })
  );
  assertCharts(
    'agreement-icc',
    buildAgreementOutput({
      grid: { cols: cols(['A', 'B', 'C']), rows: [['1', '1.1', '0.9'], ['2', '2.1', '2.2'], ['3', '2.9', '3.2'], ['4', '4.2', '3.8'], ['5', '5.1', '4.9']] },
      params: { mode: 'icc', columns: [0, 1, 2], weight: 'none' } as never,
      ciLevel: 95,
    })
  );
  assertCharts(
    'agreement-kappa',
    buildAgreementOutput({
      grid: { cols: cols(['A', 'B']), rows: [['yes', 'yes'], ['no', 'no'], ['yes', 'no'], ['no', 'yes'], ['yes', 'yes']] },
      params: { mode: 'kappa', columns: [0, 1], weight: 'none' } as never,
      ciLevel: 95,
    })
  );
  const nonparamGrid = {
    cols: cols(['C1', 'C2', 'C3', 'B1', 'B2']),
    rows: [['10', '12', '14', '0', '1'], ['11', '13', '15', '1', '1'], ['9', '11', '13', '0', '0'], ['10', '12', '14', '1', '0'], ['11', '13', '15', '0', '1'], ['8', '10', '12', '1', '0']],
  };
  assertCharts(
    'mcnemar',
    buildNonParamOutput({ grid: nonparamGrid, params: { mode: 'mcnemar', selected: [0, 1, 2], left: 3, right: 4, outcome: 0, group: 3 } as never, ciLevel: 95 })
  );
  assertCharts(
    'jonckheere',
    buildNonParamOutput({
      grid: { cols: cols(['Y', 'G']), rows: Array.from({ length: 20 }, (_, i) => [String((i % 5) + 1), String.fromCharCode(65 + (i % 3))]) },
      params: { mode: 'jonckheere', selected: [0, 1, 2], left: 0, right: 1, outcome: 0, group: 1 } as never,
      ciLevel: 95,
    })
  );
});
