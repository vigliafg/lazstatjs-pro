import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDiscriminantOutput } from './run';
import { DEFAULT_PARAMS } from '../../io/project';
import type { ColType, GridData } from '../../grid/types';

const cols: { name: string; type: ColType }[] = [
  { name: 'Y1', type: 'num' },
  { name: 'Y2', type: 'num' },
  { name: 'Group', type: 'cat' },
  { name: 'Covariate', type: 'num' },
];

const groups = ['A', 'B', 'C'];
const rows: string[][] = groups.flatMap((group, groupIndex) =>
  Array.from({ length: 12 }, (_, index) => {
    const covariate = index / 3 + groupIndex;
    const y1 = 2 * covariate + groupIndex * 1.5 + 0.2 * Math.sin(index);
    const y2 = -covariate + groupIndex * 2 + 0.3 * Math.cos(index);
    return [String(y1), String(y2), group, String(covariate)];
  })
);

const grid: GridData = { cols, rows };

test('MANCOVA mode emits multivariate, univariate and adjusted-mean tables', () => {
  const result = buildDiscriminantOutput({
    grid,
    params: {
      ...DEFAULT_PARAMS.discriminant,
      mode: 'mancova',
      group: 2,
      predictors: [0, 1],
      covariates: [3],
    },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.deepEqual(
    (result.tables ?? []).map(table => table.id),
    ['mancova-multivariate', 'mancova-univariate', 'mancova-adjusted']
  );
  assert.equal(result.charts?.[0].id, 'mancova-adjusted-means');
  assert.equal(result.report?.id, 'report-mancova');
  const univariate = result.tables!.find(table => table.id === 'mancova-univariate')!;
  assert.equal(univariate.rows.length, 2);
  assert.ok(univariate.rows.every(row => Number(row.f) > 0));
});

test('MANCOVA mode validates the covariate set and the group', () => {
  const noCovariate = buildDiscriminantOutput({
    grid,
    params: { ...DEFAULT_PARAMS.discriminant, mode: 'mancova', group: 2, predictors: [0, 1], covariates: [] },
    ciLevel: 95,
  });
  assert.ok('reason' in noCovariate);

  const noGroup = buildDiscriminantOutput({
    grid,
    params: { ...DEFAULT_PARAMS.discriminant, mode: 'mancova', group: -1, predictors: [0, 1], covariates: [3] },
    ciLevel: 95,
  });
  assert.ok('reason' in noGroup);

  const tooFew = buildDiscriminantOutput({
    grid: { cols, rows: rows.slice(0, 4) },
    params: { ...DEFAULT_PARAMS.discriminant, mode: 'mancova', group: 2, predictors: [0, 1], covariates: [3] },
    ciLevel: 95,
  });
  assert.ok('reason' in tooFew);
});
