import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGlmOutput } from './run';
import { DEFAULT_PARAMS } from '../../io/project';
import type { ColType, GridData } from '../../grid/types';

const cols: { name: string; type: ColType }[] = [
  { name: 'X', type: 'num' },
  { name: 'Y', type: 'num' },
];

const gammaRows: string[][] = Array.from({ length: 20 }, (_, index) => {
  const x = index / 4;
  return [String(x), String(Math.exp(1 + 0.4 * x))];
});

const binomialRows: string[][] = Array.from({ length: 40 }, (_, index) => {
  const x = index / 10 - 2;
  // Deterministic noise keeps the classes overlapping, so a finite MLE exists.
  const latent = 0.5 + 1.5 * x + 0.9 * Math.sin(index * 2.3);
  return [String(x), latent > 0 ? '1' : '0'];
});

test('Gamma GLM with a log link recovers the mean structure', () => {
  const result = buildGlmOutput({
    grid: { cols, rows: gammaRows },
    params: { ...DEFAULT_PARAMS.glm, dep: 1, indeps: [0], family: 'gamma', link: 'log' },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const coefficients = result.tables?.find(table => table.id === 'glm-coefficients')?.rows ?? [];
  assert.equal(coefficients.length, 2);
  assert.ok(Math.abs(Number(coefficients[0].beta) - 1) < 1e-3);
  assert.ok(Math.abs(Number(coefficients[1].beta) - 0.4) < 1e-3);
  assert.deepEqual(result.charts?.map(chart => chart.id), ['glm-fitted', 'glm-residuals', 'glm-profile']);
  assert.equal(result.report?.id, 'report-glm');
});

test('binomial GLM accepts a 0/1 response', () => {
  const result = buildGlmOutput({
    grid: { cols, rows: binomialRows },
    params: { ...DEFAULT_PARAMS.glm, dep: 1, indeps: [0], family: 'binomial', link: 'logit' },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const fit = result.tables?.find(table => table.id === 'glm-fit')?.rows ?? [];
  assert.equal(String(fit.find(row => String(row.metric) === 'Convergenza')?.value), 'Sì');
});

test('GLM validates the response support and the predictor set', () => {
  const notBinary = buildGlmOutput({
    grid: { cols, rows: gammaRows },
    params: { ...DEFAULT_PARAMS.glm, dep: 1, indeps: [0], family: 'binomial', link: 'logit' },
    ciLevel: 95,
  });
  assert.ok('reason' in notBinary);

  const selfPredictor = buildGlmOutput({
    grid: { cols, rows: gammaRows },
    params: { ...DEFAULT_PARAMS.glm, dep: 1, indeps: [1], family: 'gamma', link: 'log' },
    ciLevel: 95,
  });
  assert.ok('reason' in selfPredictor);

  const noPredictors = buildGlmOutput({
    grid: { cols, rows: gammaRows },
    params: { ...DEFAULT_PARAMS.glm, dep: 1, indeps: [], family: 'gamma', link: 'log' },
    ciLevel: 95,
  });
  assert.ok('reason' in noPredictors);
});
