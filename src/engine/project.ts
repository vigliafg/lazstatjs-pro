import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { PROJECT_VERSION, parseProject } from '../io/project';
import type { ProjectSnapshot } from '../io/project';
import { EngineError } from './errors';

export interface LoadedProject {
  source: string;
  sha256: string;
  snapshot: ProjectSnapshot;
}

export interface ProjectInspection {
  source: string;
  sha256: string;
  app: string;
  version: number;
  fileVersion: number | null;
  savedAt: string;
  rows: number;
  columns: number;
  datasetId?: string;
  dataRevision?: number;
  activeAnalysis: string;
  paramKeys: string[];
  outputCount: number;
  ignoredFields: string[];
  migration?: { fromVersion: number; toVersion: number };
}

const PROJECT_KEYS = new Set([
  'app',
  'version',
  'savedAt',
  'datasetId',
  'dataRevision',
  'grid',
  'prefs',
  'settings',
  'params',
  'outputs',
]);

export const loadProject = (path: string): LoadedProject => {
  let buffer: Buffer;
  try {
    buffer = readFileSync(path);
  } catch (error) {
    throw new EngineError({
      code: 'E_DATA',
      kind: 'file_not_found',
      stage: 'load',
      message: error instanceof Error ? error.message : `Cannot read ${path}`,
      details: { path },
    });
  }
  try {
    const snapshot = parseProject(buffer.toString('utf8'));
    return {
      source: path,
      sha256: createHash('sha256').update(buffer).digest('hex'),
      snapshot,
    };
  } catch (error) {
    throw new EngineError({
      code: 'E_DATA',
      kind: 'invalid_project',
      stage: 'load',
      message: error instanceof Error ? error.message : `Invalid project: ${path}`,
      details: { path },
    });
  }
};

/** Read-only project metadata; never runs an analysis or rewrites the file. */
export const inspectProject = (path: string): ProjectInspection => {
  const loaded = loadProject(path);
  const raw = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
  const fileVersion = typeof raw.version === 'number' ? raw.version : null;
  const rawParams =
    typeof raw.params === 'object' && raw.params !== null && !Array.isArray(raw.params)
      ? (raw.params as Record<string, unknown>)
      : undefined;
  return {
    source: loaded.source,
    sha256: loaded.sha256,
    app: loaded.snapshot.app,
    version: loaded.snapshot.version,
    fileVersion,
    savedAt: loaded.snapshot.savedAt,
    rows: loaded.snapshot.grid.rows.length,
    columns: loaded.snapshot.grid.cols.length,
    ...(loaded.snapshot.datasetId ? { datasetId: loaded.snapshot.datasetId } : {}),
    ...(loaded.snapshot.dataRevision !== undefined
      ? { dataRevision: loaded.snapshot.dataRevision }
      : {}),
    activeAnalysis: loaded.snapshot.settings.activeAnalysis,
    paramKeys: Object.keys(rawParams ?? loaded.snapshot.params),
    outputCount: loaded.snapshot.outputs.length,
    ignoredFields: Object.keys(raw).filter(key => !PROJECT_KEYS.has(key)),
    ...(fileVersion !== null && fileVersion !== PROJECT_VERSION
      ? { migration: { fromVersion: fileVersion, toVersion: PROJECT_VERSION } }
      : {}),
  };
};
