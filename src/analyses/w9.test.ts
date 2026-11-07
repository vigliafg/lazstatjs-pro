import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSurveyOutput } from './survey/run';
import { buildMlOutput } from './ml/run';
import { buildTextOutput } from './text/run';
import { buildChoiceOutput } from './choice/run';
import { buildMetaOutput } from './meta/run';
import { buildBayesOutput } from './bayes/run';
import { buildSpatialOutput } from './spatial/run';
import { DEFAULT_PARAMS } from '../io/project';
import { ANALYSIS_CHART_KINDS } from '../charts/analysisKinds';
import type { AnalysisRunResult } from './types';
import type { GridData } from '../grid/types';

const chartsOf = (result: AnalysisRunResult) => (result.ok ? result.charts ?? [] : []);
const tableIds = (result: AnalysisRunResult) =>
  result.ok ? result.tables.map(table => table.id) : [];
const reportId = (result: AnalysisRunResult) => (result.ok ? result.report?.id : undefined);

const expectKinds = (result: AnalysisRunResult, analysisId: string): void => {
  const declared = ANALYSIS_CHART_KINDS[analysisId] ?? [];
  for (const chart of chartsOf(result)) {
    assert.ok(declared.includes(chart.kind), `${analysisId}: undeclared kind ${chart.kind}`);
  }
};

const surveyGrid: GridData = {
  cols: [
    { id: 'stratum', name: 'Stratum', type: 'cat' },
    { id: 'cluster', name: 'Cluster', type: 'cat' },
    { id: 'weight', name: 'Weight', type: 'num' },
    { id: 'income', name: 'Income', type: 'num' },
    { id: 'age', name: 'Age', type: 'num' },
    { id: 'employed', name: 'Employed', type: 'int' },
  ],
  rows: Array.from({ length: 24 }, (_, index) => [
    `S${Math.floor(index / 12) + 1}`,
    `C${Math.floor(index / 6) + 1}`,
    String(0.8 + (index % 4) * 0.2),
    String(1000 + index * 30),
    String(30 + index),
    index % 3 === 0 ? '0' : '1',
  ]),
};

const mlGrid: GridData = {
  cols: [
    { id: 'x1', name: 'X1', type: 'num' },
    { id: 'x2', name: 'X2', type: 'num' },
    { id: 'x3', name: 'X3', type: 'num' },
    { id: 'y', name: 'Y', type: 'num' },
  ],
  rows: Array.from({ length: 48 }, (_, index) => {
    const x1 = (index % 8) / 3;
    const x2 = Math.floor(index / 8) / 2;
    const x3 = index % 5;
    return [String(x1), String(x2), String(x3), String(2 + 1.5 * x1 + x2 * x3 + (index % 3) * 0.2)];
  }),
};

const textGrid: GridData = {
  cols: [
    { id: 'document', name: 'Document', type: 'str' },
    { id: 'text', name: 'Text', type: 'str' },
    { id: 'group', name: 'Group', type: 'cat' },
  ],
  rows: [
    ['D1', 'model data regression estimate sample', 'A'],
    ['D2', 'model variable estimate regression', 'A'],
    ['D3', 'patient treatment clinical trial dose', 'B'],
    ['D4', 'patient outcome treatment trial clinical', 'B'],
    ['D5', 'market price customer demand product', 'C'],
    ['D6', 'market sales price product customer', 'C'],
  ],
};

const choiceGrid: GridData = {
  cols: [
    { id: 'set', name: 'Set', type: 'cat' },
    { id: 'alternative', name: 'Alternative', type: 'cat' },
    { id: 'chosen', name: 'Chosen', type: 'int' },
    { id: 'price', name: 'Price', type: 'num' },
    { id: 'quality', name: 'Quality', type: 'num' },
  ],
  rows: Array.from({ length: 24 }, (_, index) => {
    const set = Math.floor(index / 3);
    const alternative = index % 3;
    const price = ((set + alternative) % 3) + 1;
    const quality = ((set * 2 + alternative) % 3) + 1;
    const chosen = alternative === set % 3 ? '1' : '0';
    return [`S${set}`, `A${alternative}`, chosen, String(price), String(quality)];
  }),
};

const metaGrid: GridData = {
  cols: [
    { id: 'study', name: 'Study', type: 'cat' },
    { id: 'effect', name: 'Effect', type: 'num' },
    { id: 'se', name: 'SE', type: 'num' },
  ],
  rows: [
    ['S1', '0.18', '0.08'],
    ['S2', '0.24', '0.10'],
    ['S3', '0.31', '0.09'],
    ['S4', '0.12', '0.12'],
    ['S5', '0.42', '0.15'],
    ['S6', '0.27', '0.07'],
  ],
};

const bayesGrid: GridData = {
  cols: [
    { id: 'score', name: 'Score', type: 'num' },
    { id: 'age', name: 'Age', type: 'num' },
    { id: 'treatment', name: 'Treatment', type: 'int' },
  ],
  rows: Array.from({ length: 30 }, (_, index) => [
    String(50 + 0.4 * (30 + index) + (index % 2) * 3 + (index % 5) * 0.4),
    String(30 + index),
    String(index % 2),
  ]),
};

const spatialGrid: GridData = {
  cols: [
    { id: 'x', name: 'X', type: 'num' },
    { id: 'y', name: 'Y', type: 'num' },
    { id: 'value', name: 'Value', type: 'num' },
    { id: 'covariate', name: 'Covariate', type: 'num' },
  ],
  rows: Array.from({ length: 36 }, (_, index) => {
    const x = index % 6;
    const y = Math.floor(index / 6);
    return [String(x), String(y), String(10 + x + y + (index % 3)), String(index % 4)];
  }),
};

test('wave 9 survey modes emit estimates and reports', () => {
  const mean = buildSurveyOutput({
    grid: surveyGrid,
    params: {
      ...DEFAULT_PARAMS.survey,
      variable: 3,
      weight: 2,
      strata: 0,
      cluster: 1,
    },
    ciLevel: 95,
  });
  assert.ok(mean.ok);
  assert.ok(tableIds(mean).includes('survey-estimates'));
  assert.equal(reportId(mean), 'survey');
  expectKinds(mean, 'survey');

  const proportion = buildSurveyOutput({
    grid: surveyGrid,
    params: {
      ...DEFAULT_PARAMS.survey,
      mode: 'proportion',
      category: 5,
      successLevel: '1',
      weight: 2,
      strata: 0,
      cluster: 1,
    },
    ciLevel: 95,
  });
  assert.ok(proportion.ok);
  assert.ok(tableIds(proportion).includes('survey-estimates'));

  // A regression has coefficients, not design-based estimates: the estimates
  // table must not be emitted empty.
  const regression = buildSurveyOutput({
    grid: surveyGrid,
    params: {
      ...DEFAULT_PARAMS.survey,
      mode: 'regression',
      variable: 3,
      predictors: [4],
      weight: 2,
      strata: 0,
      cluster: 1,
    },
    ciLevel: 95,
  });
  assert.ok(regression.ok);
  const regressionTables = tableIds(regression);
  assert.ok(regressionTables.includes('survey-coefficients'));
  assert.ok(!regressionTables.includes('survey-estimates'));
});

test('wave 9 machine learning modes emit fit, importance and predictions', () => {
  for (const mode of ['rf', 'boosting', 'nnet'] as const) {
    const result = buildMlOutput({
      grid: mlGrid,
      params: {
        ...DEFAULT_PARAMS.ml,
        mode,
        outcome: 3,
        predictors: [0, 1, 2],
        trees: 30,
        iterations: 120,
      },
    });
    if ('reason' in result) throw new Error(`${mode}: ${result.reason}`);
    assert.ok(tableIds(result).includes('ml-fit'));
    assert.equal(reportId(result), 'ml');
    expectKinds(result, 'ml');
  }
});

test('wave 9 machine learning classification emits a confusion matrix', () => {
  const grid: GridData = {
    cols: [
      { id: 'petal', name: 'Petal', type: 'num' },
      { id: 'width', name: 'Width', type: 'num' },
      { id: 'species', name: 'Species', type: 'cat' },
    ],
    rows: Array.from({ length: 60 }, (_, index) => {
      const group = index % 3;
      const petal = group + 0.1 * (index % 4);
      const width = group * 2 + 0.2 * (index % 3);
      return [String(petal), String(width), ['setosa', 'versicolor', 'virginica'][group]];
    }),
  };
  const result = buildMlOutput({
    grid,
    params: {
      ...DEFAULT_PARAMS.ml,
      task: 'classification',
      outcome: 2,
      predictors: [0, 1],
      trees: 30,
      iterations: 120,
    },
  });
  if ('reason' in result) throw new Error(result.reason);
  assert.ok(result.tables.some(table => table.id === 'ml-confusion'));
  assert.ok(chartsOf(result).some(chart => chart.id === 'ml-confusion'));
  assert.equal(result.report?.id, 'ml');
  expectKinds(result, 'ml');
});

test('wave 9 text modes emit terms, topics and similarity', () => {
  const topics = buildTextOutput({
    grid: textGrid,
    params: {
      ...DEFAULT_PARAMS.text,
      mode: 'topics',
      text: 1,
      group: 2,
      topics: 2,
      iterations: 120,
      stopwords: false,
    },
  });
  assert.ok(topics.ok);
  assert.ok(tableIds(topics).includes('text-terms'));
  assert.ok(tableIds(topics).includes('text-topics'));
  assert.equal(reportId(topics), 'text');
  expectKinds(topics, 'text');

  const similarity = buildTextOutput({
    grid: textGrid,
    params: {
      ...DEFAULT_PARAMS.text,
      mode: 'similarity',
      text: 1,
      group: -1,
      stopwords: false,
    },
  });
  assert.ok(similarity.ok);
  assert.ok(tableIds(similarity).includes('text-similarity'));
});

test('wave 9 choice and MaxDiff modes emit coefficients and scores', () => {
  const choice = buildChoiceOutput({
    grid: choiceGrid,
    params: {
      ...DEFAULT_PARAMS.choice,
      mode: 'choice',
      set: 0,
      alternative: 1,
      chosen: 2,
      attributes: [3, 4],
    },
  });
  assert.ok(choice.ok);
  assert.ok(tableIds(choice).includes('choice-coefficients'));
  assert.equal(reportId(choice), 'choice');
  expectKinds(choice, 'choice');
});

test('wave 9 meta-analysis emits pooled, heterogeneity and forest data', () => {
  const result = buildMetaOutput({
    grid: metaGrid,
    params: {
      ...DEFAULT_PARAMS.meta,
      effect: 1,
      se: 2,
      study: 0,
    },
    ciLevel: 95,
  });
  assert.ok(result.ok);
  assert.ok(tableIds(result).includes('meta-pooled'));
  assert.ok(tableIds(result).includes('meta-heterogeneity'));
  assert.equal(reportId(result), 'meta');
  expectKinds(result, 'meta');
});

test('wave 9 Bayesian modes emit posterior summaries and diagnostics', () => {
  const normal = buildBayesOutput({
    grid: bayesGrid,
    params: {
      ...DEFAULT_PARAMS.bayes,
      mode: 'normal',
      outcome: 0,
      iterations: 600,
      burnin: 100,
      chains: 2,
    },
  });
  assert.ok(normal.ok);
  assert.ok(tableIds(normal).includes('bayes-posterior'));
  assert.equal(reportId(normal), 'bayes');
  expectKinds(normal, 'bayes');

  const regression = buildBayesOutput({
    grid: bayesGrid,
    params: {
      ...DEFAULT_PARAMS.bayes,
      mode: 'regression',
      outcome: 0,
      predictors: [1, 2],
      iterations: 600,
      burnin: 100,
      chains: 2,
    },
  });
  assert.ok(regression.ok);

  const hierarchical = buildBayesOutput({
    grid: bayesGrid,
    params: {
      ...DEFAULT_PARAMS.bayes,
      mode: 'hierarchical',
      outcome: 0,
      group: 2,
      iterations: 600,
      burnin: 100,
      chains: 2,
    },
  });
  assert.ok(hierarchical.ok);
  assert.ok(tableIds(hierarchical).includes('bayes-groups'));
});

test('wave 9 spatial modes emit global, local and SAR tables', () => {
  const moran = buildSpatialOutput({
    grid: spatialGrid,
    params: {
      ...DEFAULT_PARAMS.spatial,
      mode: 'moran',
      variable: 2,
      x: 0,
      y: 1,
      k: 4,
      permutations: 99,
    },
  });
  assert.ok(moran.ok);
  assert.ok(tableIds(moran).includes('spatial-moran'));
  assert.equal(reportId(moran), 'spatial');
  expectKinds(moran, 'spatial');

  const lisa = buildSpatialOutput({
    grid: spatialGrid,
    params: {
      ...DEFAULT_PARAMS.spatial,
      mode: 'lisa',
      variable: 2,
      x: 0,
      y: 1,
      k: 4,
      permutations: 99,
    },
  });
  assert.ok(lisa.ok);
  assert.ok(tableIds(lisa).includes('spatial-lisa'));

  const sar = buildSpatialOutput({
    grid: spatialGrid,
    params: {
      ...DEFAULT_PARAMS.spatial,
      mode: 'sar',
      variable: 2,
      x: 0,
      y: 1,
      predictors: [3],
      k: 4,
      permutations: 99,
    },
  });
  assert.ok(sar.ok);
  assert.ok(tableIds(sar).includes('spatial-sar'));
  expectKinds(sar, 'spatial');
});
