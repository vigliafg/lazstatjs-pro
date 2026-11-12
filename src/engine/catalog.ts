import { ANALYSIS_ALL, ANALYSIS_TABS, analysisDescription, analysisLabel, analysisMeta, familyOf } from '../analyses/registry';
import { ANALYSIS_RUNNERS } from '../analyses/runners';
import { analysisRoles, type AnalysisRole } from '../analyses/roles';
import { analysisParamsKey, analysisParamsOf } from '../analyses/paramsSnapshot';
import { DEFAULT_PARAMS, type ProjectParams } from '../io/project';
import { CHART_KINDS } from '../stats/charts';

export interface CatalogEntry {
  id: string;
  label: string;
  family: string;
  familyLabel: string;
  description: string;
  cost: 'instant' | 'heavy';
  heavy: boolean;
  runnable: true;
  hidden: boolean;
}

export interface AnalysisSchemaRole {
  key: string;
  label: string;
  kind: AnalysisRole['kind'];
  columns: number[];
}

export interface AnalysisSchema {
  id: string;
  label: string;
  family: string;
  description: string;
  cost: 'instant' | 'heavy';
  heavy: boolean;
  paramsKey: string | null;
  defaultParams: unknown;
  fields: string[];
  exampleSet: string;
  roles: AnalysisSchemaRole[];
  runnable: true;
}

export const RUNNER_COUNT = Object.keys(ANALYSIS_RUNNERS).length;
export const CHART_KIND_COUNT = CHART_KINDS.length;

const isRunnable = (id: string): boolean =>
  Object.prototype.hasOwnProperty.call(ANALYSIS_RUNNERS, id);

const entryFor = (id: string, hidden: boolean): CatalogEntry | null => {
  const meta = analysisMeta(id);
  if (!meta || !isRunnable(id)) return null;
  const family = familyOf(id);
  return {
    id,
    label: analysisLabel(id),
    family: meta.family,
    familyLabel: family?.label ?? meta.family,
    description: analysisDescription(meta),
    cost: meta.cost,
    heavy: meta.cost === 'heavy',
    runnable: true,
    hidden,
  };
};

/** 71 visible procedures by default; `includeHidden` adds the legacy wizard. */
export const catalogEntries = (includeHidden = false): CatalogEntry[] => {
  const source = includeHidden ? ANALYSIS_ALL : ANALYSIS_TABS;
  return source
    .map(meta => entryFor(meta.id, meta.id === 'wizard'))
    .filter((entry): entry is CatalogEntry => entry !== null);
};

export const catalogEntry = (id: string): CatalogEntry | null => {
  const meta = analysisMeta(id);
  return meta ? entryFor(id, meta.id === 'wizard') : null;
};

export const isRunnableAnalysis = (id: string): boolean =>
  isRunnable(id) && analysisMeta(id) !== undefined;

export const analysisSchema = (id: string): AnalysisSchema | null => {
  const entry = catalogEntry(id);
  if (!entry) return null;
  const key = analysisParamsKey(id);
  const defaults: unknown = analysisParamsOf(id, DEFAULT_PARAMS);
  const roles = analysisRoles(id);
  const fields =
    defaults && typeof defaults === 'object' && !Array.isArray(defaults)
      ? Object.keys(defaults as Record<string, unknown>)
      : [];
  const firstRole = roles[0]?.key;
  const firstField = fields[0];
  const exampleSet =
    key === 'descVars'
      ? '--set descVars=<column>'
      : key && firstRole
        ? `--set ${key}.${firstRole}=<column>`
        : firstRole
        ? `--set ${firstRole}=<column>`
        : key && firstField
          ? `--set ${key}.${firstField}=<value>`
          : firstField
            ? `--set ${firstField}=<value>`
            : '--set <key>=<value>';
  return {
    id,
    label: entry.label,
    family: entry.family,
    description: entry.description,
    cost: entry.cost,
    heavy: entry.heavy,
    paramsKey: key ?? null,
    defaultParams: defaults,
    fields,
    exampleSet,
    roles: roles.map(role => ({
      key: role.key,
      label: role.label,
      kind: role.kind,
      columns: role.get(DEFAULT_PARAMS),
    })),
    runnable: true,
  };
};

export const defaultParamsFor = (): ProjectParams => DEFAULT_PARAMS;
