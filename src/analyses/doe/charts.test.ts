import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDoeOutput, designAliasCells } from './run';
import type { DoeParams } from '../../io/project';

const designParams = (overrides: Partial<DoeParams> = {}): DoeParams => ({
  mode: 'design',
  response: 0,
  factorA: 1,
  factorB: 2,
  model: 'linear',
  designType: 'half',
  factors: 3,
  centerPoints: 0,
  ...overrides,
});

const grid = { cols: [], rows: [] };

/** Correlation cell of the alias matrix: rows/columns are design terms. */
const cellOf = (cells: { x?: unknown; y?: unknown; value?: unknown }[], row: string, column: string) =>
  cells.find(cell => String(cell.y) === row && String(cell.x) === column);

test('the design mode draws the map and the alias matrix', () => {
  const result = buildDoeOutput({ grid, params: designParams(), ciLevel: 95 });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const ids = (result.charts ?? []).map(chart => chart.id);
  assert.deepEqual(ids, ['doe-design-map', 'doe-alias']);
  const alias = (result.charts ?? []).find(chart => chart.id === 'doe-alias');
  assert.equal(alias?.kind, 'heatmap');
  assert.ok((alias?.data.cells ?? []).length > 0);
});

test('the half fraction aliases each main effect with a two-factor interaction', () => {
  const result = buildDoeOutput({ grid, params: designParams(), ciLevel: 95 });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const cells = (result.charts ?? []).find(chart => chart.id === 'doe-alias')?.data.cells ?? [];
  // Three factors: A, B, C and the interactions AB, AC, BC.
  assert.equal(cells.length, 36);
  const aliasOfA = cellOf(cells, 'A', 'BC');
  assert.ok(aliasOfA, 'A is aliased with BC in the half fraction');
  assert.equal(Math.abs(Number(aliasOfA?.value)), 1);
  const aliasOfB = cellOf(cells, 'B', 'AC');
  assert.equal(Math.abs(Number(aliasOfB?.value)), 1);
});

test('an orthogonal design has zero off-diagonal correlations', () => {
  const result = buildDoeOutput({
    grid,
    params: designParams({ designType: 'full', factors: 2, centerPoints: 0 }),
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const cells = (result.charts ?? []).find(chart => chart.id === 'doe-alias')?.data.cells ?? [];
  assert.equal(cells.length, 9);
  for (const cell of cells) {
    const value = Number(cell.value);
    if (String(cell.x) === String(cell.y)) assert.equal(value, 1);
    else assert.ok(Math.abs(value) < 1e-12);
  }
});

test('beyond four factors the alias matrix keeps the main effects only', () => {
  const design = buildDoeOutput({
    grid,
    params: designParams({ designType: 'full', factors: 5, centerPoints: 0 }),
    ciLevel: 95,
  });
  assert.ok('ok' in design && design.ok);
  if (!('ok' in design) || !design.ok) return;
  const cells = (design.charts ?? []).find(chart => chart.id === 'doe-alias')?.data.cells ?? [];
  assert.equal(cells.length, 25);
  assert.ok(cells.every(cell => String(cell.x).length === 1 && String(cell.y).length === 1));
});

test('designAliasCells works straight from the design matrix', () => {
  const design = {
    design: 'half' as const,
    factors: 3,
    factorNames: ['A', 'B', 'C'],
    rows: [
      { run: 1, kind: 'corner' as const, levels: [-1, -1, 1] },
      { run: 2, kind: 'corner' as const, levels: [1, -1, -1] },
      { run: 3, kind: 'corner' as const, levels: [-1, 1, -1] },
      { run: 4, kind: 'corner' as const, levels: [1, 1, 1] },
    ],
    runs: 4,
    cornerRuns: 4,
    axialRuns: 0,
    centerRuns: 0,
    resolution: 3,
    alpha: null,
    aliases: [],
  };
  const cells = designAliasCells(design);
  assert.equal(cells.length, 36);
  assert.equal(Math.abs(Number(cellOf(cells, 'C', 'AB')?.value)), 1);
});
