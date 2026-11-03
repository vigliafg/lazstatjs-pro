import test from 'node:test';
import assert from 'node:assert/strict';
import { fitPanel, type PanelInput } from './panel';

interface Row {
  entity: string;
  time: number;
  x1: number;
  x2: number;
  y: number;
}

/**
 * Four entities observed for four periods (the between regression needs
 * `G > K + 1`, so three entities would leave no residual degrees of freedom),
 * entity effects 1.5 / -0.5 / 2.5 / 0 and slopes 0.5 / -0.25.
 */
const effects = [1.5, -0.5, 2.5, 0];
const rows: Row[] = [];
for (let group = 0; group < effects.length; group += 1) {
  for (let period = 0; period < 4; period += 1) {
    const x1 = group + period + 1;
    const x2 = (group + period) % 3 - 1;
    const noise = ((group * 4 + period) % 5 - 2) * 0.05;
    rows.push({
      entity: `E${group + 1}`,
      time: period + 1,
      x1,
      x2,
      y: effects[group] + 0.5 * x1 - 0.25 * x2 + noise,
    });
  }
}

const input = (overrides: Partial<PanelInput> = {}): PanelInput => ({
  y: rows.map(row => row.y),
  x: rows.map(row => [row.x1, row.x2]),
  entity: rows.map(row => row.entity),
  time: rows.map(row => row.time),
  model: 'both',
  ...overrides,
});

const close = (actual: number | undefined, expected: number, tolerance = 1e-9) =>
  assert.ok(
    typeof actual === 'number' && Math.abs(actual - expected) <= tolerance,
    `${actual} != ${expected} (${tolerance})`
  );

const rejects = (overrides: Partial<PanelInput>) =>
  assert.equal(fitPanel(input(overrides)), null);

test('fixed effects recover the within slopes and the entity effects', () => {
  const fit = fitPanel(input());
  assert.ok(fit?.fe);
  if (!fit?.fe) return;

  close(fit.fe.coefficients[0].beta, 0.5, 0.02);
  close(fit.fe.coefficients[1].beta, -0.25, 0.02);
  assert.deepEqual(fit.fe.terms, ['x1', 'x2']);
  assert.equal(fit.fe.dfResidual, 16 - 4 - 2);

  for (const coefficient of fit.fe.coefficients) {
    assert.ok(coefficient.se > 0);
    assert.ok(coefficient.seClassic > 0);
    assert.notEqual(coefficient.se, coefficient.seClassic);
    assert.ok(coefficient.ciLo < coefficient.beta && coefficient.beta < coefficient.ciHi);
    assert.ok(Number.isFinite(coefficient.p));
  }

  const returned = fit.fe.entityEffects ?? [];
  assert.equal(returned.length, 4);
  effects.forEach((effect, group) => {
    const found = returned.find(entry => entry.entity === `E${group + 1}`);
    assert.ok(found);
    close(found?.effect, effect, 0.1);
  });

  // Full prediction = alpha_i + x'b, so residuals reproduce y - fitted and sum
  // to zero inside each entity (the within transformation absorbs the mean).
  assert.equal(fit.fe.fitted.length, 16);
  fit.fe.residuals.forEach((residual, index) => close(residual, rows[index].y - fit.fe.fitted[index]));
  for (const entity of ['E1', 'E2', 'E3', 'E4']) {
    const total = fit.fe.residuals
      .filter((_, index) => rows[index].entity === entity)
      .reduce((sum, value) => sum + value, 0);
    close(total, 0, 1e-9);
  }

  assert.ok(fit.fe.r2Within > 0.98);
  assert.ok(fit.fe.r2Overall >= fit.fe.r2Within);
  assert.equal(fit.n, 16);
  assert.equal(fit.entities, 4);
  assert.equal(fit.periods, 4);
  assert.equal(fit.balanced, true);
});

test('random effects follow the Swamy–Arora closed form', () => {
  const fit = fitPanel(input({ model: 're' }));
  assert.ok(fit?.re);
  if (!fit?.re) return;

  assert.equal(fit.fe, null);
  assert.equal(fit.hausman, null);
  assert.deepEqual(fit.re.terms.slice(0, 1), ['(Intercept)']);
  assert.equal(fit.re.coefficients.length, 3);
  assert.equal(fit.re.dfResidual, 16 - 3);
  // Both standard errors are always available: the classical GLS one is the
  // primary `se`, the cluster-robust one is reported alongside.
  for (const coefficient of fit.re.coefficients) {
    assert.ok(coefficient.se > 0);
    assert.ok(coefficient.seCluster > 0);
    close(coefficient.seClassic, coefficient.se, 1e-12);
  }
  assert.notEqual(fit.re.coefficients[1].se, fit.re.coefficients[1].seCluster);

  const { idiosyncratic, entity } = fit.variance;
  assert.ok(idiosyncratic > 0);
  assert.ok(entity >= 0);
  assert.equal(fit.theta.length, 4);
  for (const theta of fit.theta) {
    close(theta, 1 - Math.sqrt(idiosyncratic / (4 * entity + idiosyncratic)), 1e-12);
    assert.ok(theta >= 0 && theta <= 1);
  }

  // The request asked only for the random-effects fit.
  assert.ok(fit.re.r2Within > 0.9);
  assert.ok(Number.isFinite(fit.re.r2Overall));
});

test('the fixed-effects-only request omits the random-effects fit', () => {
  const fit = fitPanel(input({ model: 'fe' }));
  assert.ok(fit?.fe);
  assert.equal(fit?.re, null);
  assert.equal(fit?.hausman, null);
  // The variance components are still reported: they do not depend on the fit.
  assert.ok(fit!.variance.idiosyncratic > 0);
  assert.equal(fit!.theta.length, 4);
});

test('Hausman compares the two models when both are requested', () => {
  const fit = fitPanel(input());
  assert.ok(fit?.hausman);
  if (!fit?.hausman) return;
  assert.equal(fit.hausman.df, 2);
  assert.ok(Number.isFinite(fit.hausman.statistic));
  assert.ok(fit.hausman.statistic >= 0);
  assert.ok(fit.hausman.p >= 0 && fit.hausman.p <= 1);
  assert.equal(typeof fit.hausman.valid, 'boolean');
});

test('the confidence level changes only the intervals', () => {
  const narrow = fitPanel(input({ model: 'fe', level: 90 }));
  const wide = fitPanel(input({ model: 'fe', level: 99 }));
  assert.ok(narrow?.fe && wide?.fe);
  if (!narrow?.fe || !wide?.fe) return;
  narrow.fe.coefficients.forEach((coefficient, index) => {
    close(coefficient.beta, wide.fe!.coefficients[index].beta, 1e-12);
    assert.ok(
      coefficient.ciHi - coefficient.ciLo <
        wide.fe!.coefficients[index].ciHi - wide.fe!.coefficients[index].ciLo
    );
  });
});

test('unbalanced panels are accepted with a per-entity theta', () => {
  const keep = rows.filter((row, index) => !(row.entity === 'E4' && index === rows.length - 1));
  const fit = fitPanel({
    y: keep.map(row => row.y),
    x: keep.map(row => [row.x1, row.x2]),
    entity: keep.map(row => row.entity),
    time: keep.map(row => row.time),
    model: 'both',
  });
  assert.ok(fit);
  if (!fit) return;
  assert.equal(fit.balanced, false);
  assert.equal(fit.n, 15);
  assert.equal(fit.entities, 4);
  assert.equal(fit.theta.length, 4);
  const distinct = new Set(fit.theta.map(value => value.toFixed(9)));
  assert.equal(distinct.size, 2);
  assert.equal(fit.fe?.dfResidual, 15 - 4 - 2);
});

test('invalid panels are rejected', () => {
  // A single entity, a single period per entity and duplicated entity–periods.
  rejects({ entity: rows.map(() => 'A') });
  rejects({ time: rows.map(() => 1) });
  const duplicated = rows.map(row => row.time);
  duplicated[1] = duplicated[0];
  rejects({ time: duplicated });

  // Collinear designs: an exact multiple within entities, and a column that is
  // constant inside every entity (no within variation).
  rejects({ x: rows.map(row => [row.x1, row.x1 * 2]) });
  rejects({
    x: rows.map(row => [row.x1, Number(row.entity.slice(1))]),
  });

  // Non-finite values, mismatched lengths and empty designs.
  rejects({ y: rows.map((row, index) => (index === 3 ? Number.NaN : row.y)) });
  rejects({ entity: rows.slice(1).map(row => row.entity) });
  rejects({ x: rows.map(() => []) });

  // An invalid confidence level.
  rejects({ level: 100 });
});
