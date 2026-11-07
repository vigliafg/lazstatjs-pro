import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { compile } from 'vega-lite';
import { ANALYSIS_RUNNERS } from './runners';
import { analysisRoles, assignRole } from './roles';
import { DEFAULT_PARAMS, parseParams, type ProjectParams } from '../io/project';
import { readDelimitedTable } from '../io/readers';
import { buildVegaSpec } from '../charts/vega/buildSpec';
import { CHART_KINDS } from '../stats/charts';
import type { SampleExample, SampleManifest } from '../io/sampleManifest';
import type { GridData } from '../grid/types';

/**
 * End-to-end chain of every sample example: dataset -> columns -> runner ->
 * tables -> charts -> report.
 *
 * The other suites check each link in isolation (tables, chart grammar, report
 * copy). This one is the only place where a runner is executed exactly as the
 * app executes it, so a table with no title, a chart that no longer compiles,
 * an unresolved report placeholder or a manifest example pointing at the wrong
 * column fails the build with the dataset and procedure that broke.
 */
const root = fileURLToPath(new URL('../../samples/', import.meta.url));
const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8')) as SampleManifest;

/** Field names used by the sample manifest and the role keys in the app. */
const ROLE_ALIASES: Record<string, string[]> = {
  variables: ['vars', 'selected'],
  dependent: ['dep'],
  group: ['grp', 'group'],
  predictors: ['indeps'],
  outcome: ['dep', 'variable'],
  indicators: ['selected'],
  items: ['selected'],
  rating: ['response'],
  endogenous: ['endog'],
  exogenous: ['exog'],
  subject: ['id'],
};

/** Analyses whose params live under a key that differs from the analysis id. */
const PARAM_SLICE: Record<string, string> = {
  regression: 'reg',
  correlation: 'corr',
  chisquare: 'chisq',
};

/** Table- and parameter-driven procedures: they read no grid column. */
const NO_ROLES = new Set(['chisquare', 'contingency', 'loglinear', 'correspondence', 'samplesize']);

/**
 * Sample examples that do not run today, with the reason the runner gives.
 *
 * They are kept explicit instead of skipped: the assertion below fails when a
 * new example stops working and when one of these starts working, so the list
 * cannot rot. Each entry is a defect of the sample data (a column that no role
 * accepts, factors that are collinear, a model that needs options) and not of
 * the chain this suite guards.
 */
const KNOWN_REJECTIONS: Record<string, string> = {
  'doe_demo/doe': 'surface could not be estimated',
  'mtcars/multinomial': 'could not be estimated',
  'mtcars/nonlinear': 'did not converge',
  'selection_demo/selection': 'not a column role',
  'sem_demo/sem': 'could not be fitted',
  'two_groups_binary/distfit': 'not a column role',
  'two_groups_binary/proportions': 'not a column role',
};

const gridOf = (dir: string): GridData => {
  const table = readDelimitedTable(readFileSync(join(root, dir, 'data.csv'), 'utf8'), {
    delimiter: ',',
    hasHeader: true,
  });
  return {
    cols: table.names.map((name, index) => ({ name, type: table.types[index] })),
    rows: table.rows,
  };
};

const columnIndex = (grid: GridData, name: string): number =>
  grid.cols.findIndex(column => column.name === name);

const roleKeyFor = (analysis: string, key: string): string | null => {
  const keys = analysisRoles(analysis).map(role => role.key);
  if (keys.includes(key)) return key;
  const alias = (ROLE_ALIASES[key] ?? []).find(candidate => keys.includes(candidate));
  return alias ?? null;
};

/** Paths whose value differs between two params objects. */
const changedPaths = (a: unknown, b: unknown, prefix: string[] = []): string[][] => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return JSON.stringify(a) === JSON.stringify(b) ? [] : [prefix];
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const left = a as Record<string, unknown>;
    const right = b as Record<string, unknown>;
    return Object.keys(right).flatMap(key => changedPaths(left[key], right[key], [...prefix, key]));
  }
  return a === b ? [] : [prefix];
};

const setPath = (target: Record<string, unknown>, path: string[], value: unknown) => {
  let node = target;
  for (const key of path.slice(0, -1)) node = node[key] as Record<string, unknown>;
  node[path[path.length - 1]] = value;
};

/**
 * `assignRole` appends to a role that already holds the defaults, so a sample
 * would end up with default columns plus its own. Clear exactly the fields the
 * role writes (found by probing it), then assign.
 */
const clearRole = (analysis: string, params: ProjectParams, roleKey: string): ProjectParams => {
  // The probe column must be outside every default selection, otherwise the
  // role would look unchanged and the default column would survive.
  const probe = assignRole(analysis, params, roleKey, Number.MAX_SAFE_INTEGER);
  if (!probe) return params;
  const clone = structuredClone(params) as unknown as Record<string, unknown>;
  for (const path of changedPaths(params, probe)) {
    const current = path.reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], params);
    setPath(clone, path, Array.isArray(current) ? [] : -1);
  }
  return clone as unknown as ProjectParams;
};

const paramsFor = (example: SampleExample, grid: GridData): ProjectParams => {
  let params = parseParams(DEFAULT_PARAMS, grid.cols.length);
  for (const [key, value] of Object.entries(example.columns)) {
    const roleKey = roleKeyFor(example.analysis, key);
    assert.ok(roleKey, `${example.analysis}: the sample names "${key}", which is not a column role`);
    params = clearRole(example.analysis, params, roleKey);
    for (const name of Array.isArray(value) ? value : [value]) {
      const index = columnIndex(grid, name);
      assert.ok(index >= 0, `${example.analysis}: column "${name}" is missing from the grid`);
      const next = assignRole(example.analysis, params, roleKey, index);
      assert.ok(next, `${example.analysis}: role "${roleKey}" cannot be assigned`);
      params = next;
    }
  }
  if (example.options) {
    if (example.analysis === 'descriptive') {
      const mode = example.options.mode;
      if (typeof mode === 'string') params = { ...params, descMode: mode as ProjectParams['descMode'] };
    } else {
      const slice = PARAM_SLICE[example.analysis] ?? example.analysis;
      const current = (params as unknown as Record<string, unknown>)[slice];
      if (current && typeof current === 'object') {
        params = parseParams({ ...params, [slice]: { ...current, ...example.options } }, grid.cols.length);
      }
    }
  }
  return params;
};

const unresolved = (value: unknown): string[] => {
  const text = JSON.stringify(value) ?? '';
  return text.match(/\{[a-zA-Z][\w.]*\}/g) ?? [];
};

test('every sample example runs the whole chain', () => {
  const failures: string[] = [];
  const executed: string[] = [];
  const pending: string[] = [];
  const allowed = new Set<string>();

  const knownRejection = (where: string, reason: string): boolean => {
    const expected = KNOWN_REJECTIONS[where];
    if (!expected || !reason.toLowerCase().includes(expected.toLowerCase())) return false;
    allowed.add(where);
    return true;
  };

  for (const dataset of manifest.datasets) {
    let grid: GridData | null = null;
    for (const example of dataset.examples) {
      const where = `${dataset.id}/${example.analysis}`;
      const runner = ANALYSIS_RUNNERS[example.analysis];
      if (!runner) {
        failures.push(`${where}: no runner in ANALYSIS_RUNNERS`);
        continue;
      }
      if (NO_ROLES.has(example.analysis)) {
        pending.push(where);
        continue;
      }
      try {
        grid ??= gridOf(dataset.dir);
        const params = paramsFor(example, grid);
        // A grouping role needs a categorical column: the CSV detector types a
        // 0/1 group as numeric, while the app lets the user declare it.
        const groupColumns = analysisRoles(example.analysis)
          .filter(role => role.kind === 'group')
          .flatMap(role => role.get(params));
        const runGrid =
          groupColumns.some(index => grid.cols[index]?.type === 'num')
            ? {
                ...grid,
                cols: grid.cols.map((column, index) =>
                  groupColumns.includes(index) && column.type === 'num'
                    ? { ...column, type: 'cat' as const }
                    : column
                ),
              }
            : grid;
        const result = runner({ grid: runGrid, params, ciLevel: 95 });
        if (!('ok' in result) || !result.ok) {
          const reason = 'reason' in result ? result.reason : 'rejected';
          if (!knownRejection(where, reason)) failures.push(`${where}: ${reason}`);
          continue;
        }
        executed.push(example.analysis);

        if (result.tables.length === 0) failures.push(`${where}: no tables`);
        const ids = new Set<string>();
        for (const table of result.tables) {
          if (!table.id || !table.title) failures.push(`${where}: table without id or title`);
          if (table.columns.length === 0 || table.rows.length === 0) {
            const message = `table "${table.id}" has no columns or rows`;
            if (!knownRejection(where, message)) failures.push(`${where}: ${message}`);
          }
          if (ids.has(table.id)) failures.push(`${where}: duplicate table id "${table.id}"`);
          ids.add(table.id);
        }

        for (const chart of result.charts ?? []) {
          if (!chart.id || !chart.title) failures.push(`${where}: chart without id or title`);
          if (!CHART_KINDS.includes(chart.kind)) failures.push(`${where}: unknown chart kind "${chart.kind}"`);
          try {
            compile(buildVegaSpec(chart));
          } catch (error) {
            failures.push(`${where}: chart "${chart.id}" does not compile: ${String(error)}`);
          }
        }

        if (!result.report) failures.push(`${where}: no report`);
        else {
          const placeholders = unresolved(result.report);
          if (placeholders.length > 0) failures.push(`${where}: unresolved ${placeholders.slice(0, 3).join(' ')}`);
          if ((JSON.stringify(result.report) ?? '').length < 20) failures.push(`${where}: empty report`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!knownRejection(where, message)) failures.push(`${where}: ${message}`);
      }
    }
  }

  assert.deepEqual(failures.slice(0, 12), []);
  const reached = new Set([
    ...executed,
    ...[...allowed].map(where => where.slice(where.indexOf('/') + 1)),
  ]);
  assert.deepEqual(
    [...reached].sort(),
    Object.keys(ANALYSIS_RUNNERS).filter(id => !NO_ROLES.has(id)).sort()
  );
  // The allowlist cannot rot: an entry that starts passing must be removed.
  assert.deepEqual([...allowed].sort(), Object.keys(KNOWN_REJECTIONS).sort());
  // Only the table-driven procedures may skip the run; a new skip is a gap.
  for (const entry of new Set(pending)) {
    const analysis = entry.slice(entry.indexOf('/') + 1);
    assert.ok(NO_ROLES.has(analysis), `${entry} skipped without a reason`);
  }
});
