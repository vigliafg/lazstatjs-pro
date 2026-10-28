import test from 'node:test';
import assert from 'node:assert/strict';
import { fitLogistic } from './logistic';

const x = [-1.2, -0.9, -0.7, -0.5, -0.4, -0.3, -0.2, -0.1, 0.1, 0.2, 0.3, 0.4, 0.5, 0.7, 0.9, 1.1, 1.3, 1.5, 1.7, 2.0];
const y = x.map(value => (value > 0 ? 1 : 0));

const close = (actual: number, expected: number, tolerance = 1e-5) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

test('Firth logistic matches brglm2 on separated data', () => {
  const model = fitLogistic(y, [{ name: 'x', values: x }], 95, 0.5, true);
  assert.ok(model);
  if (!model) return;
  assert.equal(model.penalized, true);
  close(model.beta[0], -0.00092778149, 1e-4);
  close(model.beta[1], 8.0356819847, 1e-4);
  close(model.se[0], 1.0130257, 1e-4);
  close(model.se[1], 4.2802586, 1e-4);
  assert.ok(Number.isFinite(model.penalizedLogLik ?? NaN));
});
