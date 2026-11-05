import test from 'node:test';
import assert from 'node:assert/strict';
import { fitLogistic } from './kernels/logistic';
import { logisticEffects } from './kernels/logistic';
import { addIntercept, glmEffects, glmFit } from './kernels/glm';
import { countEffects, countRegressionStats } from './kernels/countreg';
import { ordinalEffects, ordinalStats } from './kernels/ordinal';
import { fitMultinomial, multinomialEffects } from './kernels/multinomial';
import { logisticTables } from './tables/logistic';

const close = (actual: number, expected: number, tolerance = 1e-6) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

const WT = [2.620, 2.875, 2.320, 3.215, 3.440, 3.460, 3.570, 3.190, 3.150, 3.440, 3.440, 4.070, 3.730, 3.780, 5.250, 5.424, 5.345, 2.200, 1.615, 1.835, 2.465, 3.520, 3.435, 3.840, 3.845, 1.935, 2.140, 1.513, 3.170, 2.770, 3.570, 2.780];
const HP = [110, 110, 93, 110, 175, 105, 245, 62, 95, 123, 123, 180, 180, 180, 205, 215, 230, 66, 52, 65, 97, 150, 150, 245, 175, 66, 91, 113, 264, 175, 335, 109];
const AM = [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1];
const CYL = [6, 6, 4, 6, 8, 6, 8, 4, 4, 6, 6, 8, 8, 8, 8, 8, 8, 4, 4, 4, 4, 8, 8, 8, 8, 4, 4, 4, 8, 6, 8, 4];
const CARB = [4, 4, 1, 1, 2, 1, 4, 2, 2, 4, 4, 3, 3, 3, 4, 4, 4, 1, 2, 1, 1, 2, 2, 4, 2, 1, 2, 2, 4, 6, 8, 2];

test('logistic effects reproduce R drop1(test = "LRT") on mtcars', () => {
  const effects = logisticEffects(AM, [
    { name: 'wt', values: WT },
    { name: 'hp', values: HP },
  ], 95);
  assert.equal(effects.length, 2);
  assert.equal(effects[0].df, 1);
  // R 4.5.2: glm(am ~ wt + hp, family = binomial); drop1(test = "LRT")
  close(effects[0].lr, 31.169, 5e-3);
  close(effects[0].p, 2.366e-8, 2e-9);
  close(effects[1].lr, 9.117, 5e-3);
  close(effects[1].p, 0.002532, 2e-6);
});

test('the ChiSquare column is the square of the Wald z', () => {
  const model = fitLogistic(AM, [{ name: 'wt', values: WT }, { name: 'hp', values: HP }], 95);
  assert.ok(model);
  const table = logisticTables(model!, 95, 0.5).find(spec => spec.id === 'logit-coefficients');
  assert.ok(table);
  const row = table!.rows.find(entry => String(entry.predictor) === 'hp');
  assert.ok(row);
  close(Number(row!.chi2), Math.pow(Number(row!.z), 2), 1e-9);
  close(Number(row!.z), 2.044394, 1e-4);
});

test('glm binomial effects agree with the logistic drop-one', () => {
  const x = addIntercept(WT.map((value, index) => [value, HP[index]]));
  const effects = glmEffects({ y: AM, x, family: 'binomial', link: 'logit' }, ['wt', 'hp']);
  assert.equal(effects.length, 2);
  close(effects[0].lr, 31.169, 5e-3);
  close(effects[1].lr, 9.117, 5e-3);
});

test('count effects equal the LR difference and use one degree of freedom', () => {
  const rows = WT.map((value, index) => [String(value), String(CARB[index])]);
  const options = { family: 'poisson' as const, rows, depIdx: 1, indepIdxs: [0], level: 95 };
  const full = countRegressionStats(options);
  assert.ok(full);
  const effects = countEffects(options);
  assert.equal(effects.length, 1);
  assert.equal(effects[0].df, 1);
  close(effects[0].lr, Math.max(0, 2 * (full!.logLik - full!.logLikNull)), 1e-6);
});

test('ordinal effects equal the LR difference against the null model', () => {
  const rows = WT.map((value, index) => [String(value), String(CYL[index])]);
  const options = { rows, depIdx: 1, indepIdxs: [0], level: 95 };
  const full = ordinalStats(options);
  assert.ok(full);
  const effects = ordinalEffects(options);
  assert.equal(effects.length, 1);
  assert.equal(effects[0].df, 1);
  close(effects[0].lr, Math.max(0, 2 * (full!.logLik - full!.logLikNull)), 1e-6);
});

const multinomialData = (n: number) => {
  const y: number[] = [];
  const x: number[][] = [];
  for (let index = 0; index < n; index += 1) {
    const first = Math.sin(index) * 1.5;
    const second = Math.cos(index * 0.7) * 1.2;
    const scores = [0, 0.9 * first - 0.4 * second, -0.5 * first + 0.8 * second];
    const top = Math.max(...scores);
    const weights = scores.map(value => Math.exp(value - top));
    const total = weights.reduce((sum, value) => sum + value, 0);
    // Balanced draw: each class gets its own slice of the simplex.
    let target = (((index % 3) + 0.5) / 3) * total;
    let chosen = 2;
    for (let k = 0; k < 3; k += 1) {
      if (target < weights[k]) {
        chosen = k;
        break;
      }
      target -= weights[k];
    }
    y.push(chosen);
    x.push([1, first, second]);
  }
  return { y, x };
};

test('multinomial effects equal the LR difference with K-1 degrees of freedom', () => {
  const data = multinomialData(150);
  const full = fitMultinomial(data);
  assert.ok(full);
  const effects = multinomialEffects(data, ['a', 'b']);
  assert.equal(effects.length, 2);
  assert.equal(effects[0].df, full!.classes.length - 1);
  const reducedX = data.x.map(row => row.filter((_, index) => index !== 1));
  const reduced = fitMultinomial({ y: data.y, x: reducedX });
  assert.ok(reduced);
  assert.ok(effects[0].lr > 0);
  close(effects[0].lr, 2 * (full!.logLik - reduced!.logLik), 1e-6);
});
