import test from 'node:test';
import assert from 'node:assert/strict';
import { lmmStats } from './lmm';

const GROUPS = ['1','1','1','1','1','2','2','2','2','2','3','3','3','3','3','4','4','4','4','4'];
const X = [1,2,3,4,5,0.5,1.5,2.5,3.5,4.5,1.2,2.2,3.2,4.2,5.2,0.8,1.8,2.8,3.8,4.8];
const Y = [2.1,3.9,6.2,8.1,9.8,1.2,2.4,4.1,5.9,7.7,2.4,4.0,6.1,8.3,10.1,1.6,3.1,4.9,6.8,8.9];
const rows = Y.map((value, index) => [String(value), String(X[index]), GROUPS[index]]);

const close = (actual: number, expected: number, tolerance: number, what: string) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${what}: ${actual} != ${expected}`);

const fit = () => lmmStats({ rows, depIdx: 0, indepIdxs: [1], groupIdx: 2, level: 0.95 })!;

test('variance components match lme4 and their intervals are the REML profile', () => {
  const stats = fit();
  const intercept = stats.varianceComponents.find(entry => entry.component === 'intercept')!;
  const residual = stats.varianceComponents.find(entry => entry.component === 'residual')!;
  // lme4::lmer(y ~ x + (1 | g)); as.data.frame(VarCorr(m))$vcov
  close(stats.sigmaU2, 0.124245263115, 1e-6, 'varianza intercetta');
  close(stats.sigmaE2, 0.075338832761, 1e-6, 'varianza residua');
  close(intercept.estimate, stats.sigmaU2, 1e-12, 'stima intercetta');
  close(residual.estimate, stats.sigmaE2, 1e-12, 'stima residua');
  // Deviance profile: the endpoints are where 2 * (logLik(opt) - logLik) = qchisq(0.95, 1).
  close(intercept.lo, 0.0241253418, 1e-6, 'CI low intercetta');
  close(intercept.hi, 1.1136227601, 1e-6, 'CI high intercetta');
  close(residual.lo, 0.0640900622, 1e-6, 'CI low residuo');
  close(residual.hi, 0.1202535285, 1e-6, 'CI high residuo');
  assert.ok(intercept.lo < intercept.estimate && intercept.estimate < intercept.hi);
  assert.ok(residual.lo < residual.estimate && residual.estimate < residual.hi);
  assert.ok(intercept.se > 0 && Number.isFinite(intercept.se));
  assert.ok(residual.se > 0 && Number.isFinite(residual.se));
});

test('a lower level gives a narrower profile interval', () => {
  const wide = fit();
  const narrow = lmmStats({ rows, depIdx: 0, indepIdxs: [1], groupIdx: 2, level: 0.9 })!;
  for (const component of ['intercept', 'residual'] as const) {
    const a = wide.varianceComponents.find(entry => entry.component === component)!;
    const b = narrow.varianceComponents.find(entry => entry.component === component)!;
    assert.ok(b.lo > a.lo && b.hi < a.hi, `${component}: 90% non piu stretto del 95%`);
    assert.ok(b.lo < b.estimate && b.estimate < b.hi);
  }
});
