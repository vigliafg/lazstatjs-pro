import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPropensityOutput } from './run';
import type { ColType, GridData } from '../../grid/types';
import type { PropensityParams } from '../../io/project';

const cols: { name: string; type: ColType }[] = [
  { name: 'Treatment', type: 'num' },
  { name: 'Outcome', type: 'num' },
  { name: 'Age', type: 'num' },
  { name: 'Score', type: 'num' },
  { name: 'Sex', type: 'num' },
];

/** Deterministic observational sample with a real treatment effect. */
const rows: string[][] = Array.from({ length: 220 }, (_, index) => {
  const age = -2 + ((index % 22) / 21) * 4;
  const score = -1.5 + (((index * 7) % 23) / 22) * 4;
  const sex = index % 2;
  const latent =
    -0.2 + 0.85 * age - 0.45 * score + 0.5 * sex + 0.35 * Math.sin(index * 1.7);
  const treatment = latent > 0 ? 1 : 0;
  const outcome =
    2 * treatment + 0.7 * age - 0.25 * score + 0.3 * sex + 0.6 * Math.cos(index * 0.9);
  return [
    String(treatment),
    String(outcome),
    String(age),
    String(score),
    String(sex),
  ];
});

const grid: GridData = { cols, rows };

const nearestParams: PropensityParams = {
  treatment: 0,
  outcome: 1,
  covariates: [2, 3, 4],
  method: 'nearest',
  caliper: 0.2,
  ratio: 1,
};

const ipwParams: PropensityParams = { ...nearestParams, method: 'ipw' };

const reasonOf = (result: ReturnType<typeof buildPropensityOutput>): string => {
  if ('reason' in result) return result.reason;
  throw new Error('expected the builder to reject the input');
};

test('the nearest-matching builder emits model, balance, ATT, sample and four charts', () => {
  const result = buildPropensityOutput({ grid, params: nearestParams, ciLevel: 95 });
  assert.ok(result.ok);
  if (!result.ok) return;

  assert.deepEqual(
    result.tables.map(table => table.id),
    ['propensity-model', 'propensity-balance', 'propensity-att', 'propensity-sample']
  );
  assert.equal(result.report?.id, 'report-propensity');
  assert.deepEqual(
    (result.charts ?? []).map(chart => chart.id),
    [
      'propensity-love',
      'propensity-score-treated',
      'propensity-score-control',
      'propensity-att',
    ]
  );

  const model = result.tables[0].rows;
  assert.equal(model.length, 4);
  assert.equal(model[0].term, '(Intercept)');
  assert.deepEqual(
    model.slice(1).map(row => row.term),
    ['Age', 'Score', 'Sex']
  );

  const balance = result.tables[1].rows;
  assert.equal(balance.length, 3);
  balance.forEach(row => {
    assert.ok(Number.isFinite(Number(row.smdBefore)));
    assert.ok(Number.isFinite(Number(row.smdAfter)));
    assert.ok(Number.isFinite(Number(row.meanControlAfter)));
  });

  const att = result.tables[2].rows[0];
  assert.equal(att.method, 'Matching');
  assert.ok(Number(att.estimate) > 0);
  assert.ok(Number(att.se) > 0);
  assert.ok(Number(att.lo) < Number(att.estimate));
  assert.ok(Number(att.hi) > Number(att.estimate));

  const sampleTable = result.tables[3].rows;
  assert.equal(sampleTable.length, 7);
  assert.ok(sampleTable.some(row => row.metric === 'N trattati' && Number(row.value) > 0));
  assert.ok(sampleTable.some(row => row.metric === 'N controlli' && Number(row.value) > 0));
  assert.ok(
    sampleTable.some(
      row => row.metric === 'Trattati scartati (fuori caliper)' && Number(row.value) >= 0
    )
  );

  const love = (result.charts ?? []).find(chart => chart.id === 'propensity-love');
  assert.equal(love?.kind, 'dot');
  assert.equal((love?.data.points ?? []).length, 6);

  const treated = (result.charts ?? []).find(chart => chart.id === 'propensity-score-treated');
  const control = (result.charts ?? []).find(chart => chart.id === 'propensity-score-control');
  assert.equal(treated?.kind, 'histogram');
  assert.equal(control?.kind, 'histogram');
  assert.ok((treated?.data.values ?? []).length > 0);
  assert.ok((control?.data.values ?? []).length > 0);

  const attChart = (result.charts ?? []).find(chart => chart.id === 'propensity-att');
  assert.equal(attChart?.kind, 'interval');
  assert.equal((attChart?.data.intervals ?? []).length, 1);
});

test('the IPW builder emits the weighted ATT and balance', () => {
  const result = buildPropensityOutput({ grid, params: ipwParams, ciLevel: 90 });
  assert.ok(result.ok);
  if (!result.ok) return;

  const att = result.tables[2].rows[0];
  assert.equal(att.method, 'IPW');
  assert.ok(Number(att.estimate) > 0);
  assert.ok(Number(att.se) > 0);
  assert.equal(result.tables[1].rows.length, 3);
  assert.equal(result.report?.id, 'report-propensity');
  assert.equal((result.charts ?? []).length, 4);
});

test('the builder rejects a non-binary treatment indicator', () => {
  const broken = rows.map((row, index) => {
    if (index !== 0) return row;
    const copy = [...row];
    copy[0] = '2';
    return copy;
  });
  assert.match(
    reasonOf(
      buildPropensityOutput({
        grid: { cols, rows: broken },
        params: nearestParams,
        ciLevel: 95,
      })
    ),
    /only 0 and 1/
  );
});

test('the builder rejects a treatment with no control or no treated rows', () => {
  const allTreated = rows.map(row => {
    const copy = [...row];
    copy[0] = '1';
    return copy;
  });
  const allControl = rows.map(row => {
    const copy = [...row];
    copy[0] = '0';
    return copy;
  });
  assert.match(
    reasonOf(
      buildPropensityOutput({
        grid: { cols, rows: allTreated },
        params: nearestParams,
        ciLevel: 95,
      })
    ),
    /two treated and two control/
  );
  assert.match(
    reasonOf(
      buildPropensityOutput({
        grid: { cols, rows: allControl },
        params: nearestParams,
        ciLevel: 95,
      })
    ),
    /two treated and two control/
  );
});

test('the builder rejects a negative caliper and an out-of-range ratio', () => {
  assert.match(
    reasonOf(
      buildPropensityOutput({
        grid,
        params: { ...nearestParams, caliper: -0.1 },
        ciLevel: 95,
      })
    ),
    /caliper/
  );
  assert.match(
    reasonOf(
      buildPropensityOutput({
        grid,
        params: { ...nearestParams, ratio: 0 },
        ciLevel: 95,
      })
    ),
    /ratio/
  );
  assert.match(
    reasonOf(
      buildPropensityOutput({
        grid,
        params: { ...nearestParams, ratio: 11 },
        ciLevel: 95,
      })
    ),
    /ratio/
  );
});
