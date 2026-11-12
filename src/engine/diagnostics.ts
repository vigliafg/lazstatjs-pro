import { analysisRoles } from '../analyses/roles';
import type { ProjectParams } from '../io/project';
import type { Dataset } from '../grid/types';
import { isMissingCell, validateValue } from '../grid/types';
import { rank, svd } from '../stats/kernels/matrix';
import { isEngineError, type EngineErrorCode } from './errors';

export type DiagnosticsLevel = 'none' | 'summary' | 'full';

export interface DiagnosticsDropReasons {
  missing: number;
  type: number;
  empty: number;
  outOfRange: number;
}

export interface DiagnosticsDataset {
  rowsTotal: number;
  rowsUsed: number;
  completeCases: number;
  requiredColumns: number;
  droppedRows: number;
  dropReasons: DiagnosticsDropReasons;
  duplicateColumns: string[];
  parseWarnings: number;
}

export interface DiagnosticsColumn {
  name: string;
  index: number;
  role?: string;
  type: string;
  total: number;
  valid: number;
  missing: number;
  distinct: number;
  min?: number;
  max?: number;
  levels?: { value: string; n: number }[];
  constant: boolean;
  nonFinite?: number;
  negative?: number;
  zero?: number;
}

export interface DiagnosticsCheck {
  id: string;
  status: 'passed' | 'failed' | 'skipped';
  severity: 'info' | 'warning' | 'error';
  message: string;
  details: Record<string, unknown>;
}

export interface DiagnosticsProblem {
  kind: string;
  role?: string;
  columns?: string[];
  observed?: number;
  required?: number;
  deficit?: number;
}

export interface DiagnosticsSuggestion {
  action: string;
  message: string;
}

export interface DiagnosticsOutcome {
  distinct: number;
  counts: { value: string; n: number }[];
  minority?: { value: string; n: number };
}

export interface DiagnosticsGroups {
  column: string;
  levels: { value: string; n: number }[];
  emptyGroups: number;
  singletonGroups: number;
}

export interface DiagnosticsSurvival {
  events: number;
  censored: number;
  negativeTimes: number;
  zeroTimes: number;
}

export interface DiagnosticsDesign {
  rows: number;
  parameters: number;
  rank?: number;
  conditionNumber?: number;
  constantColumns: string[];
  aliasedColumns: string[];
}

export interface DiagnosticsBlock {
  schemaVersion: 1;
  level: 'summary' | 'full';
  dataset: DiagnosticsDataset & {
    groups?: DiagnosticsGroups;
    outcome?: DiagnosticsOutcome;
    survival?: DiagnosticsSurvival;
    design?: DiagnosticsDesign;
  };
  columns?: DiagnosticsColumn[];
  checks: DiagnosticsCheck[];
  problems: DiagnosticsProblem[];
  suggestions: DiagnosticsSuggestion[];
  rowNumbers: number[];
  truncated: boolean;
}

export interface BuildDiagnosticsOptions {
  error: unknown;
  grid?: Dataset | null;
  params?: ProjectParams | null;
  analysisId?: string;
  level: DiagnosticsLevel;
  includeRowNumbers: boolean;
}

const LIMIT_BYTES = 64 * 1024;

const normalized = (value: string): string => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const numeric = (value: string): number | null => {
  if (String(value).trim() === '') return null;
  const parsed = Number(String(value).trim().replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
};

const errorDetails = (error: unknown): Record<string, unknown> =>
  isEngineError(error) ? error.details : {};

const selectedColumns = (
  analysisId: string | undefined,
  params: ProjectParams | null | undefined,
  grid: Dataset | null | undefined,
  error: unknown
): { indices: number[]; roles: Map<number, string> } => {
  if (!grid) return { indices: [], roles: new Map() };
  const roles = new Map<number, string>();
  if (analysisId && params) {
    try {
      for (const role of analysisRoles(analysisId)) {
        let values: number[] = [];
        try {
          values = role.get(params);
        } catch {
          values = [];
        }
        for (const index of values) {
          if (index >= 0 && index < grid.cols.length && !roles.has(index)) {
            roles.set(index, role.key);
          }
        }
      }
    } catch {
      // Diagnostics must never hide the original engine error.
    }
  }
  if (roles.size === 0) {
    const details = errorDetails(error);
    const rawColumn = details.column;
    if (typeof rawColumn === 'string' || typeof rawColumn === 'number') {
      const index =
        typeof rawColumn === 'number'
          ? rawColumn
          : grid.cols.findIndex(
              column => normalized(column.name) === normalized(rawColumn)
            );
      if (index >= 0 && index < grid.cols.length) roles.set(index, 'parameter');
    }
  }
  return { indices: [...roles.keys()], roles };
};

const profileColumn = (
  grid: Dataset,
  index: number,
  role: string | undefined
): DiagnosticsColumn => {
  const column = grid.cols[index];
  let valid = 0;
  let missing = 0;
  let nonFinite = 0;
  let negative = 0;
  let zero = 0;
  const values = new Set<string>();
  const levelCounts = new Map<string, number>();
  let min: number | undefined;
  let max: number | undefined;

  for (const row of grid.rows) {
    const raw = row[index] ?? '';
    if (isMissingCell(column, raw)) {
      missing += 1;
      continue;
    }
    if (!validateValue(raw, column.type)) continue;
    valid += 1;
    values.add(raw);
    levelCounts.set(raw, (levelCounts.get(raw) ?? 0) + 1);
    const value = ['num', 'int', 'dec'].includes(column.type) ? numeric(raw) : null;
    if (value === null) continue;
    if (min === undefined || value < min) min = value;
    if (max === undefined || value > max) max = value;
    if (!Number.isFinite(value)) nonFinite += 1;
    if (value < 0) negative += 1;
    if (value === 0) zero += 1;
  }

  return {
    name: column.name,
    index,
    ...(role ? { role } : {}),
    type: column.type,
    total: grid.rows.length,
    valid,
    missing,
    distinct: values.size,
    ...(min !== undefined ? { min } : {}),
    ...(max !== undefined ? { max } : {}),
    ...(['cat', 'bol', 'dat', 'dtm', 'tim', 'str', 'alp', 'chr'].includes(column.type)
      ? { levels: [...levelCounts.entries()].map(([value, n]) => ({ value, n })) }
      : {}),
    constant: values.size <= 1,
    ...(nonFinite > 0 ? { nonFinite } : {}),
    ...(negative > 0 ? { negative } : {}),
    ...(zero > 0 ? { zero } : {}),
  };
};

const rowStats = (
  grid: Dataset | null | undefined,
  indices: number[],
  includeRowNumbers: boolean
): { completeCases: number; dropReasons: DiagnosticsDropReasons; rowNumbers: number[] } => {
  const reasons: DiagnosticsDropReasons = { missing: 0, type: 0, empty: 0, outOfRange: 0 };
  if (!grid) return { completeCases: 0, dropReasons: reasons, rowNumbers: [] };
  const rowNumbers: number[] = [];
  let completeCases = 0;
  grid.rows.forEach((row, rowIndex) => {
    let reason: keyof DiagnosticsDropReasons | null = null;
    for (const index of indices) {
      const column = grid.cols[index];
      const raw = row[index] ?? '';
      if (String(raw).trim() === '') {
        reason = 'empty';
        break;
      }
      if (isMissingCell(column, raw)) {
        reason = 'missing';
        break;
      }
      if (!validateValue(raw, column.type)) {
        reason = 'type';
        break;
      }
    }
    if (reason) {
      reasons[reason] += 1;
      if (includeRowNumbers && rowNumbers.length < 20) rowNumbers.push(rowIndex + 1);
    } else {
      completeCases += 1;
    }
  });
  return { completeCases, dropReasons: reasons, rowNumbers };
};

const duplicateColumns = (grid: Dataset | null | undefined): string[] => {
  if (!grid) return [];
  const seen = new Map<string, number>();
  const duplicates: string[] = [];
  for (const column of grid.cols) {
    const key = normalized(column.name);
    const count = seen.get(key) ?? 0;
    seen.set(key, count + 1);
    if (count === 1) duplicates.push(column.name);
  }
  return duplicates;
};

const check = (
  id: string,
  status: DiagnosticsCheck['status'],
  severity: DiagnosticsCheck['severity'],
  message: string,
  details: Record<string, unknown> = {}
): DiagnosticsCheck => ({ id, status, severity, message, details });

const normalizedError = (error: unknown): { code: EngineErrorCode; kind: string; message: string } => {
  if (isEngineError(error)) return { code: error.code, kind: error.kind, message: error.message };
  return {
    code: 'E_INTERNAL',
    kind: 'unexpected',
    message: error instanceof Error ? error.message : 'Unexpected engine failure',
  };
};

const checksFor = (
  error: unknown,
  grid: Dataset | null | undefined,
  selected: number[],
  roles: Map<number, string>,
  completeCases: number,
  duplicates: string[]
): DiagnosticsCheck[] => {
  const normal = normalizedError(error);
  const checks: DiagnosticsCheck[] = [];
  if (!grid) {
    checks.push(
      check('input.parse', 'failed', 'error', normal.message, {
        code: normal.code,
        kind: normal.kind,
      })
    );
    return checks;
  }
  if (grid.rows.length === 0) {
    checks.push(check('input.rows', 'failed', 'error', 'The dataset has no rows', {}));
  }
  if (duplicates.length > 0) {
    checks.push(
      check('input.columns', 'failed', 'error', 'The dataset contains duplicate column names', {
        columns: duplicates,
      })
    );
  }
  if (selected.length > 0 && completeCases < grid.rows.length) {
    checks.push(
      check('analysis.complete_cases', 'failed', 'warning', 'Some rows are incomplete for the selected columns', {
        observed: completeCases,
        required: grid.rows.length,
      })
    );
  }
  if (normal.code === 'E_RUN' && normal.kind === 'runner_rejected') {
    const outcomeIndex = selected.find(index => roles.get(index) === 'outcome');
    if (outcomeIndex !== undefined) {
      const profile = profileColumn(grid, outcomeIndex, roles.get(outcomeIndex));
      if (profile.distinct > 2) {
        checks.push(
          check('outcome.binary', 'failed', 'error', normal.message, {
            observed: profile.distinct,
            required: 2,
          })
        );
      }
    }
    checks.push(
      check('runner.precondition', 'failed', 'error', normal.message, {
        kind: normal.kind,
      })
    );
  } else if (normal.code === 'E_PARAMS') {
    checks.push(
      check('analysis.parameters', 'failed', 'error', normal.message, {
        kind: normal.kind,
      })
    );
  }
  if (checks.length === 0) {
    checks.push(check('runner.precondition', 'failed', 'error', normal.message, { kind: normal.kind }));
  }
  return checks;
};

const problemsFor = (
  error: unknown,
  grid: Dataset | null | undefined,
  selected: number[],
  roles: Map<number, string>
): DiagnosticsProblem[] => {
  const normal = normalizedError(error);
  const details = errorDetails(error);
  if (normal.kind === 'runner_rejected' && grid) {
    const outcomeIndex = selected.find(index => roles.get(index) === 'outcome');
    if (outcomeIndex !== undefined) {
      const profile = profileColumn(grid, outcomeIndex, roles.get(outcomeIndex));
      if (profile.distinct > 2) {
        return [
          {
            kind: 'invalid_binary',
            columns: [profile.name],
            role: 'outcome',
            observed: profile.distinct,
            required: 2,
            deficit: Math.max(0, profile.distinct - 2),
          },
        ];
      }
    }
  }
  const columnIndex =
    typeof details.column === 'number'
      ? details.column
      : typeof details.column === 'string' && grid
        ? grid.cols.findIndex(column => normalized(column.name) === normalized(String(details.column)))
        : undefined;
  const requested =
    typeof details.column === 'string' && details.column.trim() ? details.column : undefined;
  const columns =
    columnIndex !== undefined && columnIndex >= 0 && grid
      ? [grid.cols[columnIndex].name]
      : requested
        ? [requested]
        : [...new Set(selected.map(index => grid?.cols[index]?.name).filter((name): name is string => !!name))];
  const observed = isFiniteNumber(details.observed) ? details.observed : undefined;
  const required = isFiniteNumber(details.required) ? details.required : undefined;
  return [
    {
      kind: normal.kind,
      ...(columns.length > 0 ? { columns } : {}),
      ...(observed !== undefined ? { observed } : {}),
      ...(required !== undefined ? { required } : {}),
      ...(observed !== undefined && required !== undefined
        ? { deficit: Math.max(0, required - observed) }
        : {}),
      ...(roles.size > 0 && columns.length > 0 && columnIndex !== undefined
        ? { role: roles.get(columnIndex) }
        : {}),
    },
  ];
};

const suggestionsFor = (
  error: unknown,
  grid: Dataset | null | undefined,
  selected: number[],
  roles: Map<number, string>
): DiagnosticsSuggestion[] => {
  const normal = normalizedError(error);
  if (normal.kind === 'runner_rejected' && grid) {
    const outcomeIndex = selected.find(index => roles.get(index) === 'outcome');
    if (outcomeIndex !== undefined) {
      const profile = profileColumn(grid, outcomeIndex, roles.get(outcomeIndex));
      if (profile.distinct > 2) {
        return [
          {
            action: 'select_binary_outcome',
            message: `The outcome has ${profile.distinct} levels; choose a binary outcome or a procedure that supports multiple classes.`,
          },
        ];
      }
    }
  }
  switch (normal.kind) {
    case 'invalid_binary':
      return [
        {
          action: 'select_binary_outcome',
          message: 'Choose a binary outcome or use a procedure that supports multiple classes.',
        },
      ];
    case 'column_not_found':
    case 'ambiguous_column':
    case 'column_out_of_range':
      return [
        {
          action: 'select_existing_column',
          message: 'Select a column that exists and is unambiguous in the current dataset.',
        },
      ];
    case 'not_enough_rows':
      return [
        {
          action: 'add_rows',
          message: 'Add more complete rows or reduce the number of required columns.',
        },
      ];
    default:
      return [
        {
          action: 'review_input',
          message: 'Review the selected columns and parameters, then run the analysis again.',
        },
      ];
  }
};

const fullDatasetDetails = (
  grid: Dataset,
  selected: number[],
  roles: Map<number, string>
): Pick<DiagnosticsBlock['dataset'], 'groups' | 'outcome' | 'survival' | 'design'> => {
  const result: Pick<DiagnosticsBlock['dataset'], 'groups' | 'outcome' | 'survival' | 'design'> = {};
  const roleIndex = (role: string): number | undefined =>
    selected.find(index => roles.get(index) === role);

  const outcomeIndex = roleIndex('outcome');
  if (outcomeIndex !== undefined) {
    const profile = profileColumn(grid, outcomeIndex, 'outcome');
    const counts = profile.levels ?? [];
    const minority = counts.length > 0
      ? counts.reduce((lowest, item) => (item.n < lowest.n ? item : lowest), counts[0])
      : undefined;
    result.outcome = {
      distinct: profile.distinct,
      counts,
      ...(minority ? { minority } : {}),
    };
  }

  const groupIndex = roleIndex('group');
  if (groupIndex !== undefined) {
    const profile = profileColumn(grid, groupIndex, 'group');
    const levels = profile.levels ?? [];
    result.groups = {
      column: profile.name,
      levels,
      emptyGroups: levels.filter(item => item.n === 0).length,
      singletonGroups: levels.filter(item => item.n === 1).length,
    };
  }

  const timeIndex = roleIndex('time');
  const eventIndex = roleIndex('event');
  if (timeIndex !== undefined && eventIndex !== undefined) {
    const time = grid.cols[timeIndex];
    const event = grid.cols[eventIndex];
    let events = 0;
    let censored = 0;
    let negativeTimes = 0;
    let zeroTimes = 0;
    for (const row of grid.rows) {
      const eventValue = String(row[eventIndex] ?? '').trim().toLowerCase();
      if (!isMissingCell(event, eventValue)) {
        if (eventValue === '1' || eventValue === 'true' || eventValue === 'yes' || eventValue === 'event' || eventValue === 'dead') {
          events += 1;
        } else {
          censored += 1;
        }
      }
      const rawTime = row[timeIndex] ?? '';
      if (!isMissingCell(time, rawTime)) {
        const parsed = numeric(rawTime);
        if (parsed !== null && parsed < 0) negativeTimes += 1;
        if (parsed === 0) zeroTimes += 1;
      }
    }
    result.survival = { events, censored, negativeTimes, zeroTimes };
  }

  const predictorIndices = selected.filter(index => {
    const role = roles.get(index) ?? '';
    return role === 'predictors' || role === 'predictor' || role === 'covariates';
  });
  if (predictorIndices.length > 0) {
    const constantColumns: string[] = [];
    const signatures = new Map<string, string[]>();
    for (const index of predictorIndices) {
      const profile = profileColumn(grid, index, roles.get(index));
      if (profile.constant) constantColumns.push(profile.name);
      const values: string[] = [];
      for (const row of grid.rows) {
        if (selected.some(selectedIndex => isMissingCell(grid.cols[selectedIndex], row[selectedIndex]))) {
          continue;
        }
        values.push(String(row[index] ?? ''));
      }
      const signature = values.join('\u0001');
      signatures.set(signature, [...(signatures.get(signature) ?? []), profile.name]);
    }
    const aliasedColumns = [...signatures.values()]
      .filter(names => names.length > 1)
      .flat();
    const completeRows = grid.rows.filter(row =>
      selected.every(index => !isMissingCell(grid.cols[index], row[index]))
    ).length;
    const numericPredictors = predictorIndices.filter(index =>
      ['num', 'int', 'dec'].includes(grid.cols[index].type)
    );
    const designMatrix: number[][] = [];
    if (numericPredictors.length > 0) {
      for (const row of grid.rows) {
        if (selected.some(index => isMissingCell(grid.cols[index], row[index]))) continue;
        const values = numericPredictors.map(index => numeric(row[index] ?? ''));
        if (values.some(value => value === null)) continue;
        designMatrix.push([1, ...(values as number[])]);
      }
    }
    let designRank: number | undefined;
    let conditionNumber: number | undefined;
    if (designMatrix.length > 0) {
      designRank = rank(designMatrix);
      const singular = svd(designMatrix).s;
      const largest = singular[0];
      const smallest = singular[Math.min(designMatrix[0].length, singular.length) - 1];
      if (largest !== undefined && smallest !== undefined && smallest > 0) {
        conditionNumber = largest / smallest;
      }
    }
    result.design = {
      rows: completeRows,
      parameters: predictorIndices.length + 1,
      ...(designRank !== undefined ? { rank: designRank } : {}),
      ...(conditionNumber !== undefined && Number.isFinite(conditionNumber)
        ? { conditionNumber }
        : {}),
      constantColumns,
      aliasedColumns,
    };
  }
  return result;
};

const utf8Length = (value: unknown): number =>
  new TextEncoder().encode(JSON.stringify(value)).length;

const truncate = (block: DiagnosticsBlock): DiagnosticsBlock => {
  if (utf8Length(block) <= LIMIT_BYTES) return block;
  block.truncated = true;
  block.columns = [];
  if (utf8Length(block) <= LIMIT_BYTES) return block;
  delete block.dataset.groups;
  delete block.dataset.outcome;
  delete block.dataset.survival;
  delete block.dataset.design;
  if (utf8Length(block) <= LIMIT_BYTES) return block;
  block.rowNumbers = [];
  for (const item of block.checks) item.details = {};
  if (utf8Length(block) <= LIMIT_BYTES) return block;
  block.suggestions = [];
  if (utf8Length(block) <= LIMIT_BYTES) return block;
  block.problems = [];
  return block;
};

export const buildDiagnostics = (options: BuildDiagnosticsOptions): DiagnosticsBlock | undefined => {
  if (options.level === 'none') return undefined;
  const grid = options.grid ?? null;
  const selected = selectedColumns(options.analysisId, options.params, grid, options.error);
  const stats = rowStats(grid, selected.indices, options.includeRowNumbers);
  const duplicates = duplicateColumns(grid);
  const dataset: DiagnosticsBlock['dataset'] = {
    rowsTotal: grid?.rows.length ?? 0,
    rowsUsed: grid?.rows.length ?? 0,
    completeCases: stats.completeCases,
    requiredColumns: selected.indices.length,
    droppedRows: grid ? grid.rows.length - stats.completeCases : 0,
    dropReasons: stats.dropReasons,
    duplicateColumns: duplicates,
    parseWarnings: 0,
    ...(options.level === 'full' && grid
      ? fullDatasetDetails(grid, selected.indices, selected.roles)
      : {}),
  };
  const block: DiagnosticsBlock = {
    schemaVersion: 1,
    level: options.level,
    dataset,
    ...(options.level === 'full' && grid
      ? {
          columns: selected.indices.map(index =>
            profileColumn(grid, index, selected.roles.get(index))
          ),
        }
      : {}),
    checks: checksFor(
      options.error,
      grid,
      selected.indices,
      selected.roles,
      stats.completeCases,
      duplicates
    ),
    problems: problemsFor(options.error, grid, selected.indices, selected.roles),
    suggestions: suggestionsFor(options.error, grid, selected.indices, selected.roles),
    rowNumbers: options.includeRowNumbers ? stats.rowNumbers : [],
    truncated: false,
  };
  return truncate(block);
};
