/**
 * Persisted reading state of the session-report.
 *
 * Pins, collapsed outline groups and filters are view state, not project
 * content: they live in a versioned `localStorage` entry keyed by dataset, so
 * the project autosave never restarts on a collapse and a reload (or a tab
 * switch, which unmounts the console) restores the same reading position.
 */
import type { OutlineFilter } from '../analysis/sessionOutline';

export const SESSION_VIEW_STORAGE_KEY = 'lazstats.sessionView.v1';
export const SESSION_VIEW_VERSION = 1;
/** Keep the last few datasets; older view states are disposable. */
export const MAX_SESSION_VIEW_DATASETS = 5;
const MAX_IDS = 200;
const MAX_ID_CHARS = 128;

export interface SessionViewState {
  pinned: string[];
  collapsedFamilies: string[];
  collapsedAnalyses: string[];
  filterId: string;
  outlineFilter: OutlineFilter;
}

export interface SessionViewStore {
  version: 1;
  /** Most recently used first. */
  order: string[];
  datasets: Record<string, SessionViewState>;
}

const FILTERS: readonly OutlineFilter[] = ['all', 'pinned', 'stale', 'warning'];

const emptyView = (): SessionViewState => ({
  pinned: [],
  collapsedFamilies: [],
  collapsedAnalyses: [],
  filterId: 'all',
  outlineFilter: 'all',
});

const emptyStore = (): SessionViewStore => ({
  version: SESSION_VIEW_VERSION,
  order: [],
  datasets: {},
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const stringIds = (value: unknown): string[] =>
  Array.isArray(value)
    ? Array.from(
        new Set(
          value.filter(
            (item): item is string =>
              typeof item === 'string' && item.length > 0 && item.length <= MAX_ID_CHARS
          )
        )
      ).slice(0, MAX_IDS)
    : [];

/** Validate one persisted view state; unknown fields and filters fall back. */
export const parseSessionView = (value: unknown): SessionViewState => {
  if (!isRecord(value)) return emptyView();
  const filterId =
    typeof value.filterId === 'string' && value.filterId.length > 0
      ? value.filterId.slice(0, MAX_ID_CHARS)
      : 'all';
  const outlineFilter = FILTERS.includes(value.outlineFilter as OutlineFilter)
    ? (value.outlineFilter as OutlineFilter)
    : 'all';
  return {
    pinned: stringIds(value.pinned),
    collapsedFamilies: stringIds(value.collapsedFamilies),
    collapsedAnalyses: stringIds(value.collapsedAnalyses),
    filterId,
    outlineFilter,
  };
};

/** Validate the whole store, dropping unknown versions and malformed entries. */
export const parseSessionViewStore = (raw: string | null): SessionViewStore => {
  if (!raw) return emptyStore();
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return emptyStore();
  }
  if (!isRecord(parsed) || parsed.version !== SESSION_VIEW_VERSION) return emptyStore();
  const datasets: Record<string, SessionViewState> = {};
  if (isRecord(parsed.datasets)) {
    for (const [datasetId, view] of Object.entries(parsed.datasets)) {
      if (datasetId.length === 0 || datasetId.length > MAX_ID_CHARS) continue;
      datasets[datasetId] = parseSessionView(view);
    }
  }
  const order = stringIds(parsed.order).filter(datasetId => datasetId in datasets);
  for (const datasetId of Object.keys(datasets)) {
    if (!order.includes(datasetId)) order.push(datasetId);
  }
  const kept = order.slice(0, MAX_SESSION_VIEW_DATASETS);
  const keptDatasets: Record<string, SessionViewState> = {};
  for (const datasetId of kept) keptDatasets[datasetId] = datasets[datasetId];
  return { version: SESSION_VIEW_VERSION, order: kept, datasets: keptDatasets };
};

export const sessionViewFor = (store: SessionViewStore, datasetId: string): SessionViewState =>
  store.datasets[datasetId] ?? emptyView();

/** Drop pins and filters that no longer refer to a run or an analysis. */
export const pruneSessionView = (
  view: SessionViewState,
  available: { runIds: ReadonlySet<string>; analysisIds: readonly string[] }
): SessionViewState => {
  const pinned = view.pinned.filter(id => available.runIds.has(id));
  const filterId =
    view.filterId === 'all' || available.analysisIds.includes(view.filterId)
      ? view.filterId
      : 'all';
  const outlineFilter =
    view.outlineFilter === 'pinned' && pinned.length === 0 ? 'all' : view.outlineFilter;
  return { ...view, pinned, filterId, outlineFilter };
};

/** Write one dataset state, keeping only the most recent datasets. */
export const withSessionView = (
  store: SessionViewStore,
  datasetId: string,
  view: SessionViewState
): SessionViewStore => {
  const order = [datasetId, ...store.order.filter(id => id !== datasetId)].slice(
    0,
    MAX_SESSION_VIEW_DATASETS
  );
  const datasets: Record<string, SessionViewState> = {};
  for (const id of order) {
    datasets[id] = id === datasetId ? view : store.datasets[id] ?? emptyView();
  }
  return { version: SESSION_VIEW_VERSION, order, datasets };
};

export const serializeSessionViewStore = (store: SessionViewStore): string =>
  JSON.stringify(store);

const storage = (): Storage | null => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
};

export const readSessionView = (datasetId: string): SessionViewState => {
  const target = storage();
  if (!target) return emptyView();
  try {
    return sessionViewFor(parseSessionViewStore(target.getItem(SESSION_VIEW_STORAGE_KEY)), datasetId);
  } catch {
    return emptyView();
  }
};

export const writeSessionView = (datasetId: string, view: SessionViewState): void => {
  const target = storage();
  if (!target) return;
  try {
    const store = parseSessionViewStore(target.getItem(SESSION_VIEW_STORAGE_KEY));
    target.setItem(
      SESSION_VIEW_STORAGE_KEY,
      serializeSessionViewStore(withSessionView(store, datasetId, view))
    );
  } catch {
    // Private mode or quota: view state simply does not persist.
  }
};
