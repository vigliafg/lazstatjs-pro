import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildMarsOutput } from './run';
import type { ColType, GridData } from '../../grid/types';
import type { MarsParams } from '../../io/project';

/** Legge il dataset mtcars committato senza dipendere dal loader dell'app. */
const mtcars = (): GridData => {
  const lines = readFileSync('samples/regression/mtcars/data.csv', 'utf8')
    .trim()
    .split(/\r?\n/)
    .map(line => line.split(',').map(cell => cell.replace(/^"|"$/g, '')));
  const [header, ...rows] = lines;
  const cols = header.map(name => ({
    name,
    type: (name === 'Car' ? 'text' : 'num') as ColType,
  }));
  return { cols, rows };
};

const grid = mtcars();
const column = (name: string): number => grid.cols.findIndex(col => col.name === name);

const params: MarsParams = {
  dep: column('mpg'),
  indeps: ['wt', 'hp', 'disp', 'qsec'].map(column),
  degree: 1,
  maxTerms: 13,
  penalty: 2,
  prune: false,
};

const reasonOf = (result: ReturnType<typeof buildMarsOutput>): string => {
  if ('reason' in result) return result.reason;
  throw new Error('expected the builder to reject the input');
};

test('mars builder emits terms, fit, importance, report and diagnostic charts on mtcars', () => {
  const result = buildMarsOutput({ grid, params, ciLevel: 95 });
  assert.ok(result.ok);
  if (!result.ok) return;

  assert.deepEqual(
    result.tables.map(table => table.id),
    ['mars-terms', 'mars-fit', 'mars-importance']
  );
  assert.equal(result.report?.id, 'report-mars');

  const terms = result.tables[0].rows;
  assert.equal(terms.length, 11);
  assert.equal(terms[0].term, '(Intercept)');
  assert.ok(terms.some(row => String(row.term).includes('disp-140.8')));

  const fit = result.tables[1].rows;
  const metric = (label: string) =>
    fit.find(row => String(row.metric).toLowerCase() === label.toLowerCase())?.value;
  assert.equal(Number(metric('Termini selezionati')), 11);
  assert.ok(Math.abs(Number(metric('R²')) - 0.9389) < 1e-3);
  assert.ok(Number(metric('Nodi')) >= 4);

  const importance = result.tables[2].rows;
  assert.equal(importance.length, 4);
  assert.ok(importance.every(row => Number(row.reduction) >= 0));

  const chartIds = (result.charts ?? []).map(chart => chart.id);
  assert.deepEqual(chartIds, ['mars-fitted', 'mars-profile', 'mars-residuals']);
  const fitted = result.charts?.find(chart => chart.id === 'mars-fitted');
  assert.equal(fitted?.kind, 'scatter');
  assert.equal((fitted?.data.series ?? []).length, 32);
  const profile = result.charts?.find(chart => chart.id === 'mars-profile');
  assert.equal(profile?.kind, 'line');
  assert.ok((profile?.data.series ?? []).length >= 32);
  const residuals = result.charts?.find(chart => chart.id === 'mars-residuals');
  assert.equal(residuals?.kind, 'residual');
  assert.equal((residuals?.data.points ?? []).length, 32);
});

test('mars builder prunes when requested and keeps fewer terms', () => {
  const full = buildMarsOutput({ grid, params, ciLevel: 95 });
  const pruned = buildMarsOutput({
    grid,
    params: { ...params, maxTerms: 13, prune: true },
    ciLevel: 95,
  });
  assert.ok(full.ok);
  assert.ok(pruned.ok);
  if (!full.ok || !pruned.ok) return;

  const fullTerms = full.tables[0].rows.length;
  const prunedTerms = pruned.tables[0].rows.length;
  assert.ok(prunedTerms < fullTerms);
  assert.equal(pruned.tables[1].rows.find(row => row.metric === 'Potatura')?.value, 'Sì');
});

test('mars builder rejects invalid model parameters', () => {
  assert.match(
    reasonOf(buildMarsOutput({ grid, params: { ...params, indeps: [] }, ciLevel: 95 })),
    /at least one predictor/
  );
  assert.match(
    reasonOf(
      buildMarsOutput({ grid, params: { ...params, indeps: [...params.indeps, params.dep] }, ciLevel: 95 })
    ),
    /cannot also be a predictor/
  );
  assert.match(
    reasonOf(buildMarsOutput({ grid, params: { ...params, degree: 3 }, ciLevel: 95 })),
    /degree must be 1 or 2/
  );
  assert.match(
    reasonOf(buildMarsOutput({ grid, params: { ...params, maxTerms: 2 }, ciLevel: 95 })),
    /at least 3/
  );
  assert.match(
    reasonOf(buildMarsOutput({ grid, params: { ...params, penalty: -1 }, ciLevel: 95 })),
    /non-negative/
  );
  assert.match(
    reasonOf(buildMarsOutput({ grid, params: { ...params, indeps: [999] }, ciLevel: 95 })),
    /valid numeric variables/
  );
});

test('mars builder rejects too few complete observations', () => {
  const short: GridData = { cols: grid.cols, rows: grid.rows.slice(0, 4) };
  assert.match(
    reasonOf(buildMarsOutput({ grid: short, params, ciLevel: 95 })),
    /at least 5 finite observations/
  );
});
