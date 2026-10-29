import { normalizePrefs, type IoPreferences } from '../prefs';
import {
  MAX_SINGLE_OUTPUT_CHARS, capStoredOutputs, parseStoredOutputs,
} from '../outputs';
import {
  MAX_AUTOSAVE_CHARS, PROJECT_APP, PROJECT_STORAGE_KEY, PROJECT_VERSION,
  type ProjectInput, type ProjectSnapshot,
} from './types';
import { isRecord, parseGrid, parseParams, parseSettings } from './parse';

export * from './types';
export * from './parse';

export const createProjectSnapshot = (input: ProjectInput, savedAt = new Date().toISOString()): ProjectSnapshot => ({
  app: PROJECT_APP,
  version: PROJECT_VERSION,
  savedAt,
  ...(input.datasetId ? { datasetId: input.datasetId } : {}),
  ...(input.dataRevision !== undefined ? { dataRevision: input.dataRevision } : {}),
  grid: {
    cols: input.grid.cols.map((col) => ({
      ...col,
      levels: col.levels?.map((level) => ({ ...level })),
    })),
    rows: input.grid.rows.map((row) => [...row]),
  },
  prefs: { ...input.prefs },
  settings: { ...input.settings },
  params: parseParams(input.params, input.grid.cols.length),
  outputs: capStoredOutputs(
    (input.outputs ?? [])
      .filter((entry) => entry.html.length > 0 && entry.html.length <= MAX_SINGLE_OUTPUT_CHARS)
      .map((entry) => ({
        id: entry.id,
        title: entry.title,
        createdAt: entry.createdAt,
        ...(entry.analysisId ? { analysisId: entry.analysisId } : {}),
        ...(entry.params !== undefined ? { params: entry.params } : {}),
        ...(entry.paramsSignature ? { paramsSignature: entry.paramsSignature } : {}),
        ...(entry.ciLevel !== undefined ? { ciLevel: entry.ciLevel } : {}),
        ...(entry.dataRevision !== undefined ? { dataRevision: entry.dataRevision } : {}),
        ...(entry.datasetId ? { datasetId: entry.datasetId } : {}),
        ...(entry.charts && entry.charts.length > 0 ? { charts: entry.charts } : {}),
        ...(entry.chartOverflow ? { chartOverflow: entry.chartOverflow } : {}),
        ...(entry.chartOmitted ? { chartOmitted: entry.chartOmitted } : {}),
        html: entry.html,
      }))
  ),
});

export const serializeProject = (snapshot: ProjectSnapshot): string => JSON.stringify(snapshot, null, 2);

/** Throws a user-facing Error when the file is not a valid LazStats project. */
export const parseProject = (text: string): ProjectSnapshot => {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('Not a valid .lzs file (invalid JSON)');
  }
  if (!isRecord(raw)) throw new Error('Not a valid .lzs project');
  if (raw.app !== PROJECT_APP) throw new Error('Not a LazStats project file');
  if (raw.version !== 1 && raw.version !== 2 && raw.version !== PROJECT_VERSION) {
    throw new Error(
      typeof raw.version === 'number'
        ? `Unsupported project version ${raw.version} (expected ${PROJECT_VERSION})`
        : 'The project file has no version'
    );
  }

  const grid = parseGrid(raw.grid);
  return {
    app: PROJECT_APP,
    version: PROJECT_VERSION,
    savedAt:
      typeof raw.savedAt === 'string' && Number.isFinite(Date.parse(raw.savedAt))
        ? raw.savedAt
        : new Date().toISOString(),
    ...(typeof raw.datasetId === 'string' && raw.datasetId.length > 0
      ? { datasetId: raw.datasetId.slice(0, 80) }
      : {}),
    ...(typeof raw.dataRevision === 'number' &&
    Number.isInteger(raw.dataRevision) &&
    raw.dataRevision >= 0
      ? { dataRevision: raw.dataRevision }
      : {}),
    grid,
    prefs: normalizePrefs(isRecord(raw.prefs) ? (raw.prefs as Partial<IoPreferences>) : {}),
    settings: parseSettings(raw.settings),
    params: parseParams(raw.params, grid.cols.length),
    outputs: parseStoredOutputs(raw.outputs),
  };
};

const getStorage = (): Storage | null => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
};

export const loadAutosaveProject = (): ProjectSnapshot | null => {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(PROJECT_STORAGE_KEY);
    return raw ? parseProject(raw) : null;
  } catch {
    return null;
  }
};

/** Serialize once and store, for callers that already compare the payload. */
export const saveAutosaveText = (text: string): boolean => {
  const storage = getStorage();
  if (!storage) return false;
  try {
    if (text.length > MAX_AUTOSAVE_CHARS) return false;
    storage.setItem(PROJECT_STORAGE_KEY, text);
    return true;
  } catch {
    return false;
  }
};

/** Returns false when autosave is unavailable, over quota or the data is too large. */
export const saveAutosaveProject = (snapshot: ProjectSnapshot): boolean =>
  saveAutosaveText(serializeProject(snapshot));

export const clearAutosaveProject = (): void => {
  const storage = getStorage();
  try {
    storage?.removeItem(PROJECT_STORAGE_KEY);
  } catch {
    // Private mode: nothing to clear.
  }
};
