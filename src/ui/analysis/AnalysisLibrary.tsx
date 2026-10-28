import { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Clock3,
  Compass,
  DatabaseZap,
  FlaskConical,
  GitCompare,
  Grid3x3,
  HeartPulse,
  Layers,
  LineChart,
  Search,
  Table2,
  TrendingUp,
  X,
  type LucideIcon,
} from 'lucide-react';
import {
  ANALYSIS_FAMILIES,
  ANALYSIS_TABS,
  analysisMeta,
  filterAnalyses,
  groupByFamily,
  type AnalysisFamilyId,
  type AnalysisMeta,
} from '../../analyses/registry';

const FAMILY_ICONS: Record<AnalysisFamilyId, LucideIcon> = {
  guided: Compass,
  descriptive: Table2,
  compare: GitCompare,
  regression: TrendingUp,
  multivariate: Layers,
  categorical: Grid3x3,
  survival: HeartPulse,
  timeseries: LineChart,
  missing: DatabaseZap,
  design: FlaskConical,
};

export interface AnalysisLibraryProps {
  activeAnalysis: string;
  recent: readonly string[];
  onSelect: (id: string) => void;
  onClose?: () => void;
}

const AnalysisItem = ({
  meta,
  active,
  onSelect,
}: {
  key?: string;
  meta: AnalysisMeta;
  active: boolean;
  onSelect: (id: string) => void;
}) => (
  <button
    type="button"
    onClick={() => onSelect(meta.id)}
    title={meta.description}
    aria-current={active ? 'true' : undefined}
    className={`group w-full rounded border-l-2 px-2 py-1.5 text-left transition-colors ${
      active
        ? 'border-accent bg-accent/10 text-text'
        : 'border-transparent text-text2 hover:bg-surface3 hover:text-text'
    }`}
  >
    <span className="flex items-center gap-1.5">
      <span className="truncate text-[11px] font-medium">{meta.label}</span>
      {meta.cost === 'heavy' && (
        <span
          className="ml-auto shrink-0 rounded border border-yellow/25 bg-yellow/5 px-1 font-mono text-[8px] uppercase tracking-wider text-yellow/80"
          title="Heavy computation: run explicitly"
        >
          heavy
        </span>
      )}
    </span>
    <span className="mt-0.5 block truncate text-[9px] leading-tight text-text3">
      {meta.description}
    </span>
  </button>
);

/** Searchable, family-grouped analysis chooser. */
export const AnalysisLibrary = ({
  activeAnalysis,
  recent,
  onSelect,
  onClose,
}: AnalysisLibraryProps) => {
  const [query, setQuery] = useState('');
  const activeFamily = analysisMeta(activeAnalysis)?.family;
  const [collapsed, setCollapsed] = useState<Set<AnalysisFamilyId>>(
    () =>
      new Set(
        ANALYSIS_FAMILIES.filter(family => family.id !== activeFamily).map(family => family.id)
      )
  );

  useEffect(() => {
    if (!activeFamily) return;
    setCollapsed(previous => {
      if (!previous.has(activeFamily)) return previous;
      const next = new Set(previous);
      next.delete(activeFamily);
      return next;
    });
  }, [activeFamily]);

  const groups = useMemo(() => groupByFamily(filterAnalyses(query)), [query]);
  const normalizedQuery = query.trim();
  const recentItems = normalizedQuery
    ? []
    : recent
        .filter(id => id !== activeAnalysis)
        .map(id => analysisMeta(id))
        .filter((meta): meta is AnalysisMeta => Boolean(meta))
        .filter((meta, index, list) => list.findIndex(item => item.id === meta.id) === index);

  const toggle = (id: AnalysisFamilyId) => {
    setCollapsed(previous => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const count = groups.reduce((sum, group) => sum + group.analyses.length, 0);

  return (
    <div className="flex h-full min-h-0 w-full flex-col border-r border-border bg-surface">
      <div className="shrink-0 border-b border-border p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-text3">
              Analysis library
            </p>
            <p className="mt-0.5 text-[10px] text-text3">
              {normalizedQuery
                ? `${count} match${count === 1 ? '' : 'es'}`
                : `${ANALYSIS_TABS.length} procedures · ${ANALYSIS_FAMILIES.length} families`}
            </p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="tb-btn flex h-6 w-6 items-center justify-center px-0 lg:hidden"
              aria-label="Close analysis library"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-text3" />
          <input
            id="analysis-search"
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                const first = groups[0]?.analyses[0];
                if (first) {
                  event.preventDefault();
                  onSelect(first.id);
                }
              }
              if (event.key === 'Escape') setQuery('');
            }}
            placeholder="Search analyses…"
            aria-label="Search analyses"
            className="w-full rounded border border-border2 bg-surface3 py-1.5 pl-7 pr-7 text-[11px] text-text placeholder:text-text3 focus:border-accent focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-text3 hover:bg-border hover:text-text"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto scrollbar p-2">
        {recentItems.length > 0 && (
          <section className="mb-3">
            <div className="flex items-center gap-1.5 px-2 py-1">
              <Clock3 className="h-3 w-3 text-text3" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-text3">
                Recent
              </span>
            </div>
            <div className="space-y-0.5">
              {recentItems.map(meta => (
                <AnalysisItem
                  key={`recent-${meta.id}`}
                  meta={meta}
                  active={meta.id === activeAnalysis}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </section>
        )}

        {groups.map(group => {
          const Icon = FAMILY_ICONS[group.family.id];
          const open = normalizedQuery.length > 0 || !collapsed.has(group.family.id);
          return (
            <section key={group.family.id} className="mb-0.5">
              <button
                type="button"
                onClick={() => toggle(group.family.id)}
                aria-expanded={open}
                className="flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-left hover:bg-surface3/70"
              >
                <Icon className="h-3 w-3 shrink-0 text-text3" />
                <span className="font-mono text-[9px] uppercase tracking-widest text-text3">
                  {group.family.label}
                </span>
                <span className="ml-auto font-mono text-[9px] text-text3/70">
                  {group.analyses.length}
                </span>
                {open ? (
                  <ChevronDown className="h-3 w-3 text-text3" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-text3" />
                )}
              </button>
              {open && (
                <div className="mt-0.5 space-y-0.5">
                  {group.analyses.map(meta => (
                    <AnalysisItem
                      key={meta.id}
                      meta={meta}
                      active={meta.id === activeAnalysis}
                      onSelect={onSelect}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}

        {count === 0 && (
          <div className="px-3 py-8 text-center">
            <p className="text-[11px] text-text2">No analysis found.</p>
            <p className="mt-1 text-[10px] text-text3">
              Try a model name, a data problem or a keyword.
            </p>
          </div>
        )}
      </div>

      <div
        className="shrink-0 border-t border-border px-3 py-2 font-mono text-[9px] uppercase tracking-wider text-text3"
        title="Ctrl/Cmd+K: search · Ctrl/Cmd+Enter: run"
      >
        Ctrl/⌘K search
      </div>
    </div>
  );
};
