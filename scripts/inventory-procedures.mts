/**
 * Inventory of every analysis: which tables it produces and how many rows.
 *
 * The manifest already pairs each analysis with a sample dataset and the
 * columns for its roles, so the census runs the real runners instead of
 * guessing from the source. Output is JSON lines on stdout: one object per
 * run with `analysis`, `dataset`, `tables` (id, title, rows, columns) and an
 * optional `error`.
 *
 *   node --import tsx scripts/inventory-procedures.mts > /tmp/inventory.json
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readDelimitedTable } from '../src/io/readers';
import { DEFAULT_PARAMS, type ProjectParams } from '../src/io/project';
import { analysisParamsKey } from '../src/analyses/paramsSnapshot';
import { ANALYSIS_RUNNERS } from '../src/analyses/runners';
import { analysisRoles, assignRole } from '../src/analyses/roles';
import type { Dataset } from '../src/grid/types';
import type { TableSpec } from '../src/stats/types';

const root = 'samples';

interface ManifestExample {
  analysis: string;
  columns: Record<string, string | string[]>;
}

interface ManifestDataset {
  id: string;
  dir: string;
  family: string;
  columns: string[];
  examples?: ManifestExample[];
}

const manifest = JSON.parse(
  readFileSync(join(root, 'manifest.json'), 'utf8')
) as { datasets: ManifestDataset[] };

const gridFor = (dataset: ManifestDataset): Dataset => {
  const text = readFileSync(join(root, dataset.dir, 'data.csv'), 'utf8');
  const table = readDelimitedTable(text, { delimiter: ',', hasHeader: true });
  return {
    cols: table.names.map((name, index) => ({ name, type: table.types[index] })),
    rows: table.rows,
  };
};

/** Column index by name, case-insensitive because manifest names are authored. */
const indexOf = (grid: Dataset, name: string): number =>
  grid.cols.findIndex(col => col.name.toLowerCase() === name.toLowerCase());

/**
 * The manifest names roles semantically (dependent, predictors, variables) and
 * the app names them by their parameter slot (dep, indeps, vars). Maps both
 * directions so an authored example reaches the right slot.
 */
const ROLE_ALIASES: Record<string, string[]> = {
  dep: ['dependent', 'response', 'outcome', 'y'],
  indeps: ['predictors', 'predictor', 'xreg'],
  vars: ['variables', 'selected', 'columns'],
  selected: ['variables', 'selected', 'indicators'],
  columns: ['columns', 'variables', 'selected'],
  grp: ['factor', 'group'],
  group: ['group', 'factor'],
  cluster: ['cluster'],
  stratum: ['stratum', 'strata'],
  strata: ['strata', 'stratum'],
  predictor: ['predictor', 'predictors'],
  predictors: ['predictors'],
  variable: ['variable', 'outcome', 'response', 'dependent'],
  variables: ['variables', 'selected'],
  endog: ['endogenous'],
  exog: ['exogenous'],
  instruments: ['instruments'],
  failures: ['failures'],
  outcome: ['outcome', 'dependent', 'response'],
  id: ['id', 'entity'],
};

/**
 * Empty one role before assigning it. Defaults point at columns of whatever
 * data the app last held, so an example that reuses one of them would end up
 * with the dependent variable also listed as a predictor.
 */
/**
 * Parameter field a role writes to, found by diffing the slot around a probe
 * assignment. Role keys and storage names do not always match (`predictors`
 * lives in `indeps`, `selected` in `variables`).
 */
/**
 * Parameter slot of an analysis. `analysisParamsKey` covers the procedures
 * registered in the project snapshot; the rest (glm, glmm, multinomial,
 * quantile, nonlinear) keep their parameters under the analysis id itself.
 */
const slotOf = (analysis: string): keyof ProjectParams | undefined =>
  analysisParamsKey(analysis) ??
  ((analysis in DEFAULT_PARAMS ? analysis : undefined) as keyof ProjectParams | undefined);

const fieldOfRole = (analysis: string, role: { set: (p: ProjectParams, c: number) => ProjectParams }): string | undefined => {
  const slot = slotOf(analysis);
  if (!slot) return undefined;
  const read = (params: ProjectParams) =>
    (params as unknown as Record<string, Record<string, unknown>>)[slot];
  const before = read(DEFAULT_PARAMS);
  const after = read(role.set(DEFAULT_PARAMS, 999));
  if (!before || !after) return undefined;
  return Object.keys(after).find(
    key => JSON.stringify(before[key]) !== JSON.stringify(after[key])
  );
};

/** Empty the array behind a role; scalar roles are overwritten by `set`. */
const clearField = (
  analysis: string,
  params: ProjectParams,
  field: string | undefined
): ProjectParams => {
  const slot = slotOf(analysis);
  if (!slot || !field) return params;
  const value = (params as unknown as Record<string, Record<string, unknown>>)[slot];
  if (!value || !Array.isArray(value[field])) return params;
  return { ...params, [slot]: { ...value, [field]: [] } } as ProjectParams;
};

const paramsFor = (
  analysis: string,
  grid: Dataset,
  columns: Record<string, string | string[]>
): ProjectParams => {
  let params: ProjectParams = DEFAULT_PARAMS;
  const used = new Set<string>();
  for (const role of analysisRoles(analysis)) {
    const keys = [role.key, ...(ROLE_ALIASES[role.key] ?? [])];
    const key = keys.find(candidate => columns[candidate] !== undefined && !used.has(candidate));
    if (key === undefined) continue;
    const wanted = columns[key];
    used.add(key);
    params = clearField(analysis, params, fieldOfRole(analysis, role));
    for (const name of Array.isArray(wanted) ? wanted : [wanted]) {
      if (grid.cols[indexOf(grid, name)]?.type !== undefined) {
        const index = indexOf(grid, name);
        params = assignRole(analysis, params, role.key, index) ?? params;
      }
    }
  }
  return params;
};

/** Fallback for the analyses the manifest documents without an example. */
const guessColumns = (analysis: string, grid: Dataset): Record<string, string | string[]> => {
  const numeric = grid.cols
    .filter(col => col.type === 'num' || col.type === 'int' || col.type === 'dec')
    .map(col => col.name);
  const grouped = grid.cols.filter(col => !numeric.includes(col.name)).map(col => col.name);
  const columns: Record<string, string | string[]> = {};
  for (const role of analysisRoles(analysis)) {
    const pool = role.kind === 'continuous' ? numeric : role.kind === 'group' ? [...grouped, ...numeric] : numeric;
    const name = pool[0];
    if (name === undefined) continue;
    columns[role.key] = role.key.includes('indep') || role.key.includes('pred') || role.key === 'vars'
      ? pool.slice(0, Math.min(2, pool.length))
      : name;
  }
  return columns;
};

const tablesOf = (tables: TableSpec[]) =>
  tables.map((table: TableSpec) => ({
    id: table.id,
    title: table.title,
    rows: table.rows.length,
    columns: table.columns.map(column => column.key),
  }));

/**
 * SEM needs the factor structure spelled out: the manifest lists the six
 * indicators, the model wants them split in two factors of three.
 */
const adjustParams = (analysis: string, params: ProjectParams): ProjectParams => {
  if (analysis === 'nonlinear') {
    // The default logistic curve needs a 0/1 response; a continuous outcome
    // converges with the exponential form.
    return { ...params, nonlinear: { ...params.nonlinear, model: 'exponential' } };
  }
  if (analysis !== 'sem') return params;
  const selected = params.sem.selected;
  if (selected.length < 4) return params;
  const half = Math.floor(selected.length / 2);
  return {
    ...params,
    sem: {
      ...params.sem,
      factors: 2,
      groups: selected.map((_, index) => (index < half ? 0 : 1)),
    },
  };
};

const ids = Object.keys(ANALYSIS_RUNNERS).sort();

/** Every authored example for one analysis, in manifest order. */
const examplesFor = (analysis: string) =>
  manifest.datasets.flatMap(dataset =>
    (dataset.examples ?? [])
      .filter(example => example.analysis === analysis)
      .map(example => ({ dataset, columns: example.columns }))
  );

for (const analysis of ids) {
  const candidates = examplesFor(analysis);
  if (analysis === 'multinomial') {
    // The authored example separates perfectly (cyl on 32 rows) and Petal
    // separates Iris just as well; the housing satisfaction survey is the
    // sample where a three-class model is estimable.
    const housing = manifest.datasets.find(dataset => dataset.id === 'housing');
    if (housing) {
      candidates.push({
        dataset: housing,
        columns: { outcome: 'Sat', predictors: ['Infl_num', 'Cont_num'] },
      });
    }
  }
  if (candidates.length === 0) {
    const dataset =
      manifest.datasets.find(item => item.family === 'design') ?? manifest.datasets[0];
    const grid = gridFor(dataset);
    candidates.push({ dataset, columns: guessColumns(analysis, grid) });
  }
  let lastError = '';
  let done = false;
  for (const candidate of candidates) {
    try {
      const grid = gridFor(candidate.dataset);
      const params = adjustParams(analysis, paramsFor(analysis, grid, candidate.columns));
      const result = ANALYSIS_RUNNERS[analysis]({ grid, params, ciLevel: 0.95 });
      if (!result.ok) {
        lastError = 'reason' in result ? result.reason : 'run non riuscito';
        continue;
      }
      console.log(
        JSON.stringify({
          analysis,
          dataset: candidate.dataset.dir,
          columns: candidate.columns,
          tables: tablesOf(result.tables),
        })
      );
      done = true;
      break;
    } catch (error) {
      lastError = (error as Error).message;
    }
  }
  if (!done) {
    console.log(
      JSON.stringify({ analysis, dataset: candidates[0].dataset.dir, error: lastError })
    );
  }
}
