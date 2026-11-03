import test from 'node:test';
import assert from 'node:assert/strict';
import { lifeTable, turnbull } from '../kernels/survival';
import { parametricSurvivalStats } from '../kernels/parametric';
import { fitFrailtyCox } from '../kernels/cox';
import { assertClose, assertCloseVector, loadFixture, TOLERANCES } from './harness';

interface SurvivalFixture {
  source: string;
  data: {
    time: number[];
    event: number[];
    age: number[];
    sex: number[];
    group: number[];
  };
  life: {
    intervals: number;
    rows: {
      start: number;
      end: number;
      atRisk: number;
      events: number;
      censored: number;
      effective: number;
      q: number;
      p: number;
      survival: number;
      se: number;
    }[];
  };
  turnbull: { lower: number[]; upper: number[]; time: number[]; surv: number[] };
  parametric: {
    weibull: { coef: number[]; scale: number; logLik: number };
    lognormal: { coef: number[]; scale: number; logLik: number };
    loglogistic: { coef: number[]; scale: number; logLik: number };
    gompertz: { par: number[]; logLik: number; convergence: number };
  };
  frailty: { coef: number[]; se: number[]; theta: number; logLik: number };
}

const fixture = loadFixture<SurvivalFixture>('survival-w6.json');

test('life table matches the R actuarial calculation', () => {
  const rows = lifeTable(fixture.data.time, fixture.data.event, fixture.life.intervals);
  assert.equal(rows.length, fixture.life.rows.length);
  rows.forEach((row, index) => {
    const expected = fixture.life.rows[index];
    assert.equal(row.atRisk, expected.atRisk);
    assert.equal(row.events, expected.events);
    assert.equal(row.censored, expected.censored);
    assertClose(row.effective, expected.effective, TOLERANCES.r, `effective[${index}]`);
    assertClose(row.q, expected.q, TOLERANCES.r, `q[${index}]`);
    assertClose(row.p, expected.p, TOLERANCES.r, `p[${index}]`);
    assertClose(row.survival, expected.survival, TOLERANCES.r, `survival[${index}]`);
    assertClose(row.se, expected.se, TOLERANCES.r, `se[${index}]`);
  });
});

test('Turnbull interval-censored NPMLE matches survival::survfit', () => {
  const result = turnbull(
    fixture.turnbull.lower.map((lower, index) => ({ lower, upper: fixture.turnbull.upper[index] }))
  );
  // survfit returns the midpoint of each Turnbull interval and the survival
  // after it; the kernel reports the right endpoint and the same step value.
  assert.equal(result.points.length, fixture.turnbull.surv.length);
  result.points.forEach((point, index) => {
    assertClose(point.survival, fixture.turnbull.surv[index], { absolute: 1e-6 }, `turnbull S[${index}]`);
  });
});

test('Weibull, log-normal and log-logistic AFT match survival::survreg', () => {
  const rows = fixture.data.time.map((time, index) => [
    String(time),
    String(fixture.data.event[index]),
    String(fixture.data.age[index]),
    String(fixture.data.sex[index]),
  ]);
  for (const distribution of ['weibull', 'lognormal', 'loglogistic'] as const) {
    const expected = fixture.parametric[distribution];
    const fit = parametricSurvivalStats({
      rows,
      timeIdx: 0,
      eventIdx: 1,
      indepIdxs: [2, 3],
      distribution,
      level: 95,
    });
    assert.ok(fit, `${distribution}: fit`);
    assertClose(fit!.mu, expected.coef[0], TOLERANCES.r, `${distribution} intercept`);
    assertCloseVector(
      fit!.coefficients.map(coefficient => coefficient.beta),
      expected.coef.slice(1),
      TOLERANCES.r,
      `${distribution} coefficients`
    );
    assertClose(fit!.sigma, expected.scale, TOLERANCES.rProbability, `${distribution} scale`);
    assertClose(fit!.logLik, expected.logLik, TOLERANCES.rProbability, `${distribution} logLik`);
  }
});

test('Gompertz model matches an independent R maximum likelihood fit', () => {
  const expected = fixture.parametric.gompertz;
  const rows = fixture.data.time.map((time, index) => [
    String(time),
    String(fixture.data.event[index]),
    String(fixture.data.age[index]),
    String(fixture.data.sex[index]),
  ]);
  const fit = parametricSurvivalStats({
    rows,
    timeIdx: 0,
    eventIdx: 1,
    indepIdxs: [2, 3],
    distribution: 'gompertz',
    level: 95,
  });
  assert.ok(fit);
  assert.equal(fit!.parameterization, 'ph');
  assertClose(fit!.mu, expected.par[0], { absolute: 0.1 }, 'gompertz alpha');
  assertClose(fit!.sigma, Math.exp(expected.par[3]), { absolute: 1e-4 }, 'gompertz gamma');
  assertCloseVector(
    fit!.coefficients.map(coefficient => coefficient.beta),
    expected.par.slice(1, 3),
    { absolute: 0.1 },
    'gompertz coefficients'
  );
  assertClose(fit!.logLik, expected.logLik, { absolute: 1e-2 }, 'gompertz logLik');
});

test('shared gamma frailty matches survival::coxph', () => {
  const groups = fixture.data.group;
  const names = Array.from(new Set(groups)).sort((a, b) => a - b).map(String);
  const index = groups.map(value => names.indexOf(String(value)));
  const fit = fitFrailtyCox({
    time: fixture.data.time,
    event: fixture.data.event,
    covariates: [
      { name: 'age', values: fixture.data.age },
      { name: 'sex', values: fixture.data.sex },
    ],
    groups: index,
    groupNames: names,
    level: 95,
  });
  assert.ok(fit);
  assertCloseVector(
    fit!.coefficients.map(coefficient => coefficient.beta),
    fixture.frailty.coef,
    { absolute: 5e-3 },
    'frailty coefficients'
  );
  assertClose(fit!.theta, fixture.frailty.theta, { absolute: 5e-3 }, 'frailty theta');
});
