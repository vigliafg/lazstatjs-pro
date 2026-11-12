import { analysisParamsKey } from '../analyses/paramsSnapshot';
import { validateAnalysisColumnRefs } from '../analyses/params';
import { validateRoleTypes } from '../analyses/roles';
import type { Dataset, GridData } from '../grid/types';
import { DEFAULT_PARAMS, parseParams, type ProjectParams } from '../io/project';
import { EngineError } from './errors';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const deepMerge = (base: unknown, override: unknown): unknown => {
  if (override === undefined) return clone(base);
  if (!isRecord(base) || !isRecord(override)) return clone(override);
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    result[key] = deepMerge(base[key], value);
  }
  return result;
};

const readPath = (value: unknown, path: string[]): unknown => {
  let current: unknown = value;
  for (const key of path) {
    if (!isRecord(current)) return undefined;
    current = current[key];
  }
  return current;
};

const writePath = (value: unknown, path: string[], next: unknown): unknown => {
  if (path.length === 0) return next;
  const root = isRecord(value) ? { ...value } : {};
  const [head, ...rest] = path;
  root[head] = writePath(root[head], rest, next);
  return root;
};

export interface ParamsBuildOptions {
  analysisId: string;
  base?: ProjectParams;
  override?: unknown;
  set?: string[];
  width: number;
  grid: Dataset;
}

/** Parse a JSON/partial ProjectParams object on top of an existing base. */
export const buildParams = (options: ParamsBuildOptions): ProjectParams => {
  const base = options.base ?? DEFAULT_PARAMS;
  const merged = options.override === undefined ? base : deepMerge(base, options.override);
  let params = parseParams(merged, options.width);
  for (const spec of options.set ?? []) {
    params = applySetForAnalysis(params, options.analysisId, spec, options.width, options.grid);
  }
  return params;
};

const parseBoolean = (value: string): boolean | null => {
  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'y'].includes(normalized)) return true;
  if (['false', '0', 'no', 'n'].includes(normalized)) return false;
  return null;
};

const columnName = (value: string, width: number): number | null => {
  if (!value) return null;
  if (value.startsWith('@')) {
    const parsed = Number(value.slice(1));
    if (!Number.isInteger(parsed) || parsed < 0 || parsed >= width) return null;
    return parsed;
  }
  return null;
};

const normalizedName = (value: string): string =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');

const matchingColumns = (value: string, names: string[]): { name: string; index: number }[] => {
  const needle = normalizedName(value);
  return names
    .map((name, index) => ({ name, index }))
    .filter(entry => normalizedName(entry.name) === needle);
};

const resolveColumn = (value: string, width: number, names: string[]): number => {
  const forced = columnName(value, width);
  if (forced !== null) return forced;
  const matches = matchingColumns(value, names);
  if (matches.length === 1) return matches[0].index;
  if (matches.length > 1) {
    throw new EngineError({
      code: 'E_PARAMS',
      kind: 'ambiguous_column',
      stage: 'params',
      message: `Column name is ambiguous: ${value}`,
      details: { column: value, matches: matches.map(match => match.index), columns: names },
    });
  }
  throw new EngineError({
    code: 'E_PARAMS',
    kind: 'column_not_found',
    stage: 'params',
    message: `Unknown column: ${value}`,
    details: { column: value, columns: names },
  });
};

const parseScalar = (
  value: string,
  current: unknown,
  width: number,
  names: string[]
): unknown => {
  const trimmed = value.trim();
  if (typeof current === 'boolean') {
    const parsed = parseBoolean(trimmed);
    if (parsed === null) {
      throw new EngineError({
        code: 'E_PARAMS',
        kind: 'invalid_value',
        stage: 'params',
        message: `Expected a boolean value, received: ${value}`,
      });
    }
    return parsed;
  }
  if (typeof current === 'number') {
    const forced = columnName(trimmed, width);
    if (forced !== null) return forced;
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) return resolveColumn(trimmed, width, names);
    return parsed;
  }
  if (typeof current === 'string') return trimmed;
  const forced = columnName(trimmed, width);
  if (forced !== null) return forced;
  const parsed = Number(trimmed);
  if (trimmed !== '' && Number.isFinite(parsed)) return parsed;
  return trimmed;
};

const parseValue = (
  value: string,
  current: unknown,
  width: number,
  names: string[]
): unknown => {
  if (Array.isArray(current)) {
    return value
      .split(',')
      .map(part => part.trim())
      .filter(Boolean)
      .map(part => {
        const forced = columnName(part, width);
        if (forced !== null) return forced;
        const matching = matchingColumns(part, names);
        if (matching.length === 1) return matching[0].index;
        if (matching.length > 1) {
          throw new EngineError({
            code: 'E_PARAMS',
            kind: 'ambiguous_column',
            stage: 'params',
            message: `Column name is ambiguous: ${part}`,
            details: { column: part, matches: matching.map(match => match.index) },
          });
        }
        const parsed = Number(part);
        if (part !== '' && Number.isFinite(parsed)) return parsed;
        throw new EngineError({
          code: 'E_PARAMS',
          kind: 'column_not_found',
          stage: 'params',
          message: `Unknown column: ${part}`,
          details: { column: part, columns: names },
        });
      });
  }
  return parseScalar(value, current, width, names);
};

const splitSetSpec = (spec: string): { key: string; value: string } => {
  const equals = spec.indexOf('=');
  if (equals <= 0) {
    throw new EngineError({
      code: 'E_PARAMS',
      kind: 'invalid_value',
      stage: 'params',
      message: `Invalid --set value (expected key=value): ${spec}`,
    });
  }
  return { key: spec.slice(0, equals).trim(), value: spec.slice(equals + 1) };
};

const setPathFor = (analysisId: string, key: string, width: number): string[] => {
  const root = analysisParamsKey(analysisId);
  const parts = key.split('.').filter(Boolean);
  if (analysisId === 'descriptive') {
    if (parts.length === 1 && ['descVars', 'descMode'].includes(parts[0])) return parts;
    throw new EngineError({
      code: 'E_PARAMS',
      kind: 'unknown_parameter',
      stage: 'params',
      message: `Unknown descriptive parameter: ${key}`,
    });
  }
  if (!root) {
    throw new EngineError({
      code: 'E_PARAMS',
      kind: 'unknown_parameter',
      stage: 'params',
      message: `Analysis ${analysisId} has no parameters`,
    });
  }
  if (parts[0] === root) return parts;
  if (parts.length === 1) return [String(root), parts[0]];
  throw new EngineError({
    code: 'E_PARAMS',
    kind: 'unknown_parameter',
    stage: 'params',
    message: `Parameter ${key} does not belong to ${analysisId} (expected ${String(root)}.*)`,
    details: { analysisId, parameter: key, paramsKey: root, width },
  });
};

export const applySetForAnalysis = (
  params: ProjectParams,
  analysisId: string,
  spec: string,
  width: number,
  grid: Dataset
): ProjectParams => {
  const { key, value } = splitSetSpec(spec);
  const path = setPathFor(analysisId, key, width);
  const current = readPath(params, path);
  if (current === undefined) {
    throw new EngineError({
      code: 'E_PARAMS',
      kind: 'unknown_parameter',
      stage: 'params',
      message: `Unknown parameter: ${key}`,
      details: { analysisId, parameter: key },
    });
  }
  const names = grid.cols.map(col => col.name);
  const parsed = parseValue(value, current, width, names);
  return writePath(params, path, parsed) as ProjectParams;
};

export interface ValidateOptions {
  analysisId: string;
  params: ProjectParams;
  grid: Dataset;
}

/** Preflight checks that do not require running the statistical kernel. */
export const validateParams = ({ analysisId, params, grid }: ValidateOptions): void => {
  const refs = validateAnalysisColumnRefs(analysisId, params, grid.cols.length);
  const roles = validateRoleTypes(analysisId, params, grid as unknown as GridData);
  const errors = [...new Set([...refs, ...roles])];
  if (errors.length > 0) {
    throw new EngineError({
      code: 'E_PARAMS',
      kind: 'incompatible_columns',
      stage: 'preflight',
      message: errors.join(' · '),
      details: { analysisId, errors },
    });
  }
};

export const paramsForAnalysis = (analysisId: string, params: ProjectParams): unknown => {
  if (analysisId === 'descriptive') {
    return { descVars: params.descVars, descMode: params.descMode };
  }
  const key = analysisParamsKey(analysisId);
  return key ? params[key] : undefined;
};
