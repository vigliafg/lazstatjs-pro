import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildMediationOutput } from './run';
import type { ColType, GridData } from '../../grid/types';
import type { MediationParams } from '../../io/project';

/** mtcars sample used by the R-14 plan row and the reference fixture. */
const csv = readFileSync(
  fileURLToPath(new URL('../../../samples/regression/mtcars/data.csv', import.meta.url)),
  'utf8'
)
  .trim()
  .split(/\r?\n/)
  .map(line => line.split(',').map(cell => cell.replace(/^"|"$/g, '')));

const [header, ...body] = csv;
const cols: { name: string; type: ColType }[] = header.map(name => ({
  name,
  type: (name === 'Car' ? 'text' : 'num') as ColType,
}));
const grid: GridData = { cols, rows: body };

const column = (name: string): number => {
  const index = header.indexOf(name);
  assert.ok(index >= 0, `missing column ${name}`);
  return index;
};

const params: MediationParams = {
  outcome: column('mpg'),
  predictor: column('hp'),
  mediator: column('wt'),
  covariates: [],
  bootstrap: 500,
  seed: 20261103,
};

const reasonOf = (result: ReturnType<typeof buildMediationOutput>): string => {
  if ('reason' in result) return result.reason;
  throw new Error('expected the builder to reject the input');
};

test('mediation builder emits paths, effects, bootstrap, fit, report and two charts on mtcars', () => {
  const result = buildMediationOutput({ grid, params, ciLevel: 95 });
  assert.ok(result.ok);
  if (!result.ok) return;

  assert.deepEqual(
    result.tables.map(table => table.id),
    ['mediation-paths', 'mediation-effects', 'mediation-bootstrap', 'mediation-fit']
  );
  assert.equal(result.report?.id, 'report-mediation');

  const charts = result.charts ?? [];
  assert.deepEqual(
    charts.map(chart => chart.id),
    ['mediation-effects-forest', 'mediation-bootstrap']
  );
  assert.equal(charts[0].kind, 'forest');
  assert.equal(charts[0].data.points?.length, 3);
  assert.equal(charts[1].kind, 'bootstrap');
  assert.equal(charts[1].data.values?.length, params.bootstrap);
  assert.equal(charts[1].data.observed?.length, 1);
  assert.equal(charts[1].data.ci?.length, 2);

  const paths = result.tables[0].rows;
  assert.deepEqual(
    paths.map(row => row.path),
    ['a', 'b', 'c′', 'c']
  );
  assert.ok(Math.abs(Number(paths[0].beta) - 0.00940096) < 1e-6);
  assert.ok(Math.abs(Number(paths[1].beta) + 3.87783) < 1e-4);

  const effects = result.tables[1].rows;
  assert.equal(effects.length, 4);
  const indirect = effects.find(row => String(row.effect).includes('indiretto'));
  assert.ok(indirect);
  assert.ok(Math.abs(Number(indirect?.estimate) + 0.0364553) < 1e-6);

  const bootstrap = result.tables[2].rows;
  const metric = (label: string) =>
    bootstrap.find(row => String(row.metric) === label)?.value;
  assert.equal(Number(metric('Replicazioni')), params.bootstrap);
  assert.equal(Number(metric('Seme')), params.seed);
  assert.ok(Number(metric('IC low')) < Number(metric('IC high')));

  const fit = result.tables[3].rows;
  assert.equal(Number(fit[0].value), 32);
  assert.ok(Number(fit[1].value) > 0);
});

test('mediation builder rejects coincident roles, short samples and a disabled bootstrap', () => {
  assert.match(
    reasonOf(buildMediationOutput({ grid, params: { ...params, predictor: params.outcome }, ciLevel: 95 })),
    /different columns/
  );
  assert.match(
    reasonOf(buildMediationOutput({ grid, params: { ...params, mediator: params.predictor }, ciLevel: 95 })),
    /different columns/
  );
  assert.match(
    reasonOf(
      buildMediationOutput({
        grid,
        params: { ...params, covariates: [params.outcome] },
        ciLevel: 95,
      })
    ),
    /Covariates cannot/
  );
  assert.match(
    reasonOf(
      buildMediationOutput({
        grid: { cols, rows: body.slice(0, 4) },
        params,
        ciLevel: 95,
      })
    ),
    /Not enough complete rows/
  );
  assert.match(
    reasonOf(buildMediationOutput({ grid, params: { ...params, bootstrap: 0 }, ciLevel: 95 })),
    /Bootstrap replications/
  );
  assert.match(
    reasonOf(buildMediationOutput({ grid, params: { ...params, bootstrap: 6000 }, ciLevel: 95 })),
    /Bootstrap replications/
  );
});

test('mediation builder accepts extra covariates and a different seed', () => {
  const result = buildMediationOutput({
    grid,
    params: {
      ...params,
      covariates: [column('qsec')],
      bootstrap: 200,
      seed: 42,
    },
    ciLevel: 90,
  });
  assert.ok(result.ok);
  if (!result.ok) return;

  assert.equal(result.tables[2].subtitle?.includes('90'), true);
  const bootstrap = result.tables[2].rows;
  assert.equal(Number(bootstrap.find(row => row.metric === 'Seme')?.value), 42);
  const forest = result.charts?.[0];
  assert.equal(forest?.subtitle?.includes('90'), true);
});
