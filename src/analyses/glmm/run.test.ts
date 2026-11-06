import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGlmmOutput } from './run';
import { DEFAULT_PARAMS } from '../../io/project';
import type { ColType, GridData } from '../../grid/types';

const cols: { name: string; type: ColType }[] = [
  { name: 'Y', type: 'num' },
  { name: 'Time', type: 'num' },
  { name: 'Subject', type: 'cat' },
  { name: 'Group', type: 'cat' },
];

const subjects = Array.from({ length: 8 }, (_, index) => `S${index + 1}`);
const gaussianRows: string[][] = subjects.flatMap((subject, subjectIndex) =>
  Array.from({ length: 6 }, (_, time) => {
    const intercept = 10 + subjectIndex * 2;
    const slope = 1.5 + (subjectIndex % 3) * 0.4;
    const y = intercept + slope * time + 0.2 * Math.sin(subjectIndex * 3 + time);
    return [String(y), String(time), subject, subjectIndex % 2 === 0 ? 'A' : 'B'];
  })
);

const grid: GridData = { cols, rows: gaussianRows };

test('Gaussian GLMM with a random slope emits tables, report and charts', () => {
  const result = buildGlmmOutput({
    grid,
    params: { ...DEFAULT_PARAMS.glmm, dep: 0, indeps: [1], group: 2, slope: 1 },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok, 'reason' in result ? result.reason : 'failed');
  if (!('ok' in result) || !result.ok) return;

  assert.deepEqual(
    (result.tables ?? []).map(table => table.id),
    ['glmm-coefficients', 'glmm-random', 'glmm-blups', 'glmm-fixed-tests']
  );
  const coefficients = result.tables!.find(table => table.id === 'glmm-coefficients')!.rows;
  assert.ok(Math.abs(Number(coefficients[1].beta) - 1.5) < 0.5);
  const variance = result.tables!.find(table => table.id === 'glmm-random')!.rows;
  assert.ok(
    variance.some(row => String(row.component).toLowerCase().includes('pendenza')),
    'the random-slope variance must be reported'
  );
  assert.equal(result.report?.id, 'report-glmm');
  assert.deepEqual(result.charts?.map(chart => chart.id), [
    'glmm-observed-fitted',
    'glmm-random-effects',
    'glmm-residual-fitted',
    'glmm-random-slopes',
  ]);
  assert.equal(result.charts?.[3].kind, 'interval');
});

test('GLMM without a random slope keeps only the intercept columns', () => {
  const result = buildGlmmOutput({
    grid,
    params: { ...DEFAULT_PARAMS.glmm, dep: 0, indeps: [1], group: 2, slope: -1 },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.deepEqual(result.charts?.map(chart => chart.id), [
    'glmm-observed-fitted',
    'glmm-random-effects',
    'glmm-residual-fitted',
  ]);
  const blups = result.tables!.find(table => table.id === 'glmm-blups')!;
  assert.equal(blups.columns.length, 4);
});

const binaryRows: string[][] = subjects.flatMap((subject, subjectIndex) =>
  Array.from({ length: 8 }, (_, time) => {
    const latent = -2 + 0.6 * time + subjectIndex * 0.35 + 0.4 * Math.sin(subjectIndex + time);
    return [latent > 0 ? '1' : '0', String(time), subject, 'A'];
  })
);

test('binomial GLMM accepts a 0/1 outcome and reports the ICC', () => {
  const result = buildGlmmOutput({
    grid: { cols, rows: binaryRows },
    params: { ...DEFAULT_PARAMS.glmm, dep: 0, indeps: [1], group: 2, family: 'binomial', link: 'logit' },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok, 'reason' in result ? result.reason : 'failed');
  if (!('ok' in result) || !result.ok) return;
  const variance = result.tables!.find(table => table.id === 'glmm-random')!.rows;
  assert.ok(variance.some(row => String(row.component).toUpperCase() === 'ICC'));
});

test('GLMM validates family support, columns and sample size', () => {
  const notBinary = buildGlmmOutput({
    grid,
    params: { ...DEFAULT_PARAMS.glmm, dep: 0, indeps: [1], group: 2, family: 'binomial', link: 'logit' },
    ciLevel: 95,
  });
  assert.ok('reason' in notBinary);

  const negative = buildGlmmOutput({
    grid: { cols, rows: gaussianRows.map(row => [String(-1), row[1], row[2], row[3]]) },
    params: { ...DEFAULT_PARAMS.glmm, dep: 0, indeps: [1], group: 2, family: 'poisson', link: 'log' },
    ciLevel: 95,
  });
  assert.ok('reason' in negative);

  const sameColumn = buildGlmmOutput({
    grid,
    params: { ...DEFAULT_PARAMS.glmm, dep: 2, indeps: [1], group: 2 },
    ciLevel: 95,
  });
  assert.ok('reason' in sameColumn);

  const tooFew = buildGlmmOutput({
    grid: { cols, rows: gaussianRows.slice(0, 3) },
    params: { ...DEFAULT_PARAMS.glmm, dep: 0, indeps: [1], group: 2 },
    ciLevel: 95,
  });
  assert.ok('reason' in tooFew);
});
