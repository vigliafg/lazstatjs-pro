/**
 * Pure model behind the session-report outline.
 *
 * The outline is an index over the run-report stack, not a second source of
 * truth: it groups the same `OutputEntry` objects by registry family and
 * analysis, keeps the stable run number, and applies search/state filters
 * without mutating the cards. Keeping it free of React makes the ordering and
 * filtering rules testable on their own.
 */
import {
  ANALYSIS_FAMILIES,
  analysisLabel,
  analysisMeta,
  familyLabel,
} from '../../analyses/registry';
import { t } from '../../i18n';

export type OutlineFilter = 'all' | 'pinned' | 'stale' | 'warning';

/** Minimal shape of a run-report that the outline needs. */
export interface OutlineSource {
  id: string;
  title: string;
  analysisId?: string;
  /** Persisted stable number; legacy entries fall back to their position. */
  runNumber?: number;
}

export interface OutlineRun {
  id: string;
  runNumber: number;
  title: string;
  analysisId?: string;
  analysisLabel: string;
  familyId: string;
  familyLabel: string;
  pinned: boolean;
  stale: boolean;
  warning: boolean;
}

export interface OutlineAnalysis {
  id: string;
  label: string;
  runs: OutlineRun[];
}

export interface OutlineFamily {
  id: string;
  label: string;
  analyses: OutlineAnalysis[];
}

export interface OutlineCounts {
  all: number;
  pinned: number;
  stale: number;
  warning: number;
}

export interface SessionOutline {
  /** Shortcuts shown at the top; the real nodes stay in `families`. */
  pinned: OutlineRun[];
  families: OutlineFamily[];
  /** Runs that survive both the query and the state filter. */
  total: number;
  /** Counts after the query, before the state filter. */
  counts: OutlineCounts;
}

export interface SessionOutlineOptions {
  pinnedIds?: ReadonlySet<string>;
  staleIds?: ReadonlySet<string>;
  warningIds?: ReadonlySet<string>;
  query?: string;
  filter?: OutlineFilter;
}

const OTHER_FAMILY = 'other';

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const queryTerms = (query: string | undefined): string[] =>
  normalize(query ?? '')
    .split(/\s+/)
    .filter(Boolean);

const matchesTerms = (haystack: string, terms: readonly string[]): boolean =>
  terms.every(term => haystack.includes(term));

/** A persisted run number is trusted only when it is a positive integer. */
const stableNumber = (value: number | undefined, index: number): number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1 ? value : index + 1;

const sortByNumber = (a: OutlineRun, b: OutlineRun): number => a.runNumber - b.runNumber;

/**
 * Group run-reports into family → analysis → run.
 *
 * Families follow the registry order and unknown analyses land in a final
 * "Other" group. Pinned runs are exposed as shortcuts in addition to their
 * real node, while runs inside every group stay sorted by their stable number.
 */
export const buildSessionOutline = (
  outputs: readonly OutlineSource[],
  options: SessionOutlineOptions = {}
): SessionOutline => {
  const pinnedIds = options.pinnedIds ?? new Set<string>();
  const staleIds = options.staleIds ?? new Set<string>();
  const warningIds = options.warningIds ?? new Set<string>();
  const filter = options.filter ?? 'all';
  const terms = queryTerms(options.query);

  const numbered = outputs.map((output, index) => {
    const meta = output.analysisId ? analysisMeta(output.analysisId) : undefined;
    const family = meta
      ? ANALYSIS_FAMILIES.find(item => item.id === meta.family)
      : undefined;
    const familyId = family?.id ?? OTHER_FAMILY;
    const familyText = family ? familyLabel(family) : t('output.outlineOtherFamily');
    const analysisText = output.analysisId
      ? analysisLabel(output.analysisId)
      : t('output.outlineOtherAnalysis');
    const runNumber = stableNumber(output.runNumber, index);
    const run: OutlineRun = {
      id: output.id,
      runNumber,
      title: output.title,
      ...(output.analysisId ? { analysisId: output.analysisId } : {}),
      analysisLabel: analysisText,
      familyId,
      familyLabel: familyText,
      pinned: pinnedIds.has(output.id),
      stale: staleIds.has(output.id),
      warning: warningIds.has(output.id),
    };
    const padded = String(runNumber).padStart(2, '0');
    const haystack = normalize(
      `${run.title} ${analysisText} ${familyText} ${runNumber} ${padded}`
    );
    return { run, analysisId: output.analysisId ?? 'other', terms: matchesTerms(haystack, terms) };
  });

  const matching = numbered.filter(item => item.terms).map(item => item.run);
  const counts: OutlineCounts = {
    all: matching.length,
    pinned: matching.filter(run => run.pinned).length,
    stale: matching.filter(run => run.stale).length,
    warning: matching.filter(run => run.warning).length,
  };
  const filtered = matching.filter(run => {
    if (filter === 'pinned') return run.pinned;
    if (filter === 'stale') return run.stale;
    if (filter === 'warning') return run.warning;
    return true;
  });

  const byFamily = new Map<string, Map<string, OutlineRun[]>>();
  for (const run of [...filtered].sort(sortByNumber)) {
    const analysisId = run.analysisId ?? 'other';
    const analyses = byFamily.get(run.familyId) ?? new Map<string, OutlineRun[]>();
    const runs = analyses.get(analysisId) ?? [];
    runs.push(run);
    analyses.set(analysisId, runs);
    byFamily.set(run.familyId, analyses);
  }

  const familyOrder = [
    ...ANALYSIS_FAMILIES.map(family => family.id as string),
    OTHER_FAMILY,
  ];
  const families: OutlineFamily[] = familyOrder
    .filter(familyId => byFamily.has(familyId))
    .map(familyId => {
      const family = ANALYSIS_FAMILIES.find(item => item.id === familyId);
      const analyses = Array.from(byFamily.get(familyId)?.entries() ?? [])
        .map(([analysisId, runs]) => {
          const first = runs.reduce(
            (min, run) => (run.runNumber < min ? run.runNumber : min),
            Number.POSITIVE_INFINITY
          );
          return {
            id: analysisId,
            label: runs[0]?.analysisLabel ?? t('output.outlineOtherAnalysis'),
            runs,
            first,
          };
        })
        .sort((a, b) => a.first - b.first)
        .map(({ first: _first, ...analysis }) => analysis);
      return {
        id: familyId,
        label: family ? familyLabel(family) : t('output.outlineOtherFamily'),
        analyses,
      };
    });

  return {
    pinned: filtered.filter(run => run.pinned).sort(sortByNumber),
    families,
    total: filtered.length,
    counts,
  };
};

/** Ids of every run visible in the outline, pinned shortcuts excluded. */
export const outlineRunIds = (outline: SessionOutline): Set<string> => {
  const ids = new Set<string>();
  for (const family of outline.families) {
    for (const analysis of family.analyses) {
      for (const run of analysis.runs) ids.add(run.id);
    }
  }
  return ids;
};
