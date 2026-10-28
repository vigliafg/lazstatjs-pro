import test from 'node:test';
import assert from 'node:assert/strict';
import { parametricSurvivalStats } from './parametric';

const rows = [
  ['2.5444', '1', '-0.767'], ['0.3032', '1', '-0.816'], ['0.0506', '1', '-0.142'], ['1.3640', '0', '-0.278'],
  ['2.0776', '1', '0.436'], ['0.3577', '1', '-1.187'], ['2.6116', '0', '1.192'], ['0.5116', '1', '-0.018'],
  ['1.3252', '1', '-0.248'], ['0.9874', '1', '-0.363'], ['1.0652', '0', '1.278'], ['2.7250', '0', '-0.469'],
  ['1.6901', '0', '0.071'], ['2.2845', '0', '-0.266'], ['2.9473', '0', '1.845'], ['1.3241', '0', '-0.839'],
  ['0.7279', '1', '-0.077'], ['1.1832', '1', '-2.618'], ['2.2586', '0', '0.888'], ['1.6507', '0', '-0.707'],
  ['1.4786', '0', '1.757'], ['1.0449', '1', '0.182'], ['1.2871', '0', '-0.267'], ['3.1826', '0', '0.926'],
];

const close = (actual: number, expected: number, tolerance = 1e-4) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

test('Weibull AFT matches survival::survreg', () => {
  const stats = parametricSurvivalStats({ rows, timeIdx: 0, eventIdx: 1, indepIdxs: [2], distribution: 'weibull', level: 95 });
  assert.ok(stats);
  if (!stats) return;
  close(stats.mu, 1.21488230, 1e-4);
  close(stats.coefficients[0].beta, 0.58165733, 1e-4);
  close(stats.sigma, 0.8770537, 1e-4);
  close(stats.logLik, -21.63546, 1e-4);
  close(stats.aic, 49.27091, 1e-4);
});

test('exponential AFT matches survival::survreg', () => {
  const stats = parametricSurvivalStats({ rows, timeIdx: 0, eventIdx: 1, indepIdxs: [2], distribution: 'exponential', level: 95 });
  assert.ok(stats);
  if (!stats) return;
  close(stats.mu, 1.30378472, 1e-4);
  close(stats.coefficients[0].beta, 0.63964661, 1e-4);
  close(stats.sigma, 1, 1e-12);
  close(stats.logLik, -21.7481, 1e-4);
});

test('parametric survival rejects invalid times or too few events', () => {
  assert.equal(
    parametricSurvivalStats({ rows: [['-1', '1', '0'], ['1', '1', '1'], ['2', '0', '2']], timeIdx: 0, eventIdx: 1, indepIdxs: [2], distribution: 'weibull', level: 95 }),
    null
  );
});
