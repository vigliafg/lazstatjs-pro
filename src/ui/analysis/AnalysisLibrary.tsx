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
  Star,
  Table2,
  TrendingUp,
  X,
  type LucideIcon,
} from 'lucide-react';
import {
  ANALYSIS_FAMILIES,
  ANALYSIS_TABS,
  alphabeticalAnalyses,
  analysisMeta,
  filterAnalyses,
  groupByFamily,
  type AnalysisFamilyId,
  type AnalysisMeta,
} from '../../analyses/registry';
import { loadFavorites, saveFavorites } from './favorites';
import { t } from '../../i18n';

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
  id?: string;
  activeAnalysis: string;
  recent: readonly string[];
  onSelect: (id: string) => void;
  onClose?: () => void;
}

const AnalysisItem = ({
  meta,
  active,
  favorite,
  onSelect,
  onToggleFavorite,
}: {
  key?: string;
  meta: AnalysisMeta;
  active: boolean;
  favorite: boolean;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}) => (
  <div className="group relative">
  <button
    type="button"
    data-analysis-item={meta.id}
    onClick={() => onSelect(meta.id)}
    title={meta.description}
    aria-current={active ? 'true' : undefined}
    className={`w-full rounded border-l-2 px-2 py-1.5 pr-7 text-left transition-colors ${
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
          title={t('analysis.heavyHint')}
        >
          {t('analysis.heavy')}
        </span>
      )}
    </span>
    <span className="mt-0.5 block truncate text-[9px] leading-tight text-text3">
      {meta.description}
    </span>
  </button>
  <button
    type="button"
    onClick={() => onToggleFavorite(meta.id)}
    aria-label={favorite ? `${t('analysis.favoriteRemove')} ${meta.label} ${t('analysis.favoriteRemoveSuffix')}` : `${t('analysis.favoriteAdd')} ${meta.label} ${t('analysis.favoriteSuffix')}`}
    aria-pressed={favorite}
    className={`absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded ${
      favorite ? 'text-yellow' : 'text-text3/60 opacity-0 group-hover:opacity-100 focus:opacity-100'
    }`}
  >
    <Star className="h-3 w-3" fill={favorite ? 'currentColor' : 'none'} />
  </button>
  </div>
);

/** Searchable, family-grouped analysis chooser. */
export const AnalysisLibrary = ({
  id,
  activeAnalysis,
  recent,
  onSelect,
  onClose,
}: AnalysisLibraryProps) => {
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() =>
    loadFavorites(ANALYSIS_TABS.map(meta => meta.id))
  );
  const [alphabetical, setAlphabetical] = useState(false);

  const toggleFavorite = (id: string) => {
    setFavorites(previous => {
      const next = previous.includes(id)
        ? previous.filter(item => item !== id)
        : [...previous, id];
      saveFavorites(next);
      return next;
    });
  };

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

  const results = useMemo(() => filterAnalyses(query), [query]);
  const groups = useMemo(() => groupByFamily(results), [results]);
  const flat = useMemo(
    () => (alphabetical ? alphabeticalAnalyses(results) : null),
    [alphabetical, results]
  );
  const favoriteItems = favorites
    .map(id => analysisMeta(id))
    .filter((meta): meta is AnalysisMeta => Boolean(meta));
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
    <div
      id={id}
      tabIndex={-1}
      aria-label={t('analysis.libraryTitle')}
      className="flex h-full min-h-0 w-full flex-col border-r border-border bg-surface outline-none"
    >
      <div className="shrink-0 border-b border-border p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-text3">
              {t('analysis.libraryTitle')}
            </p>
            <p className="mt-0.5 flex items-center gap-2 text-[10px] text-text3">
              <span>
                {normalizedQuery
                  ? `${count} ${count === 1 ? t('analysis.matchOne') : t('analysis.matchMany')}`
                  : `${ANALYSIS_TABS.length} ${t('analysis.procedures')} · ${ANALYSIS_FAMILIES.length} ${t('analysis.families')}`}
              </span>
              <button
                type="button"
                onClick={() => setAlphabetical(value => !value)}
                aria-pressed={alphabetical}
                aria-label={t('analysis.sortAz')}
                title={t('analysis.flatAz')}
                className={`rounded border px-1 font-mono text-[8px] ${
                  alphabetical ? 'border-accent text-accent' : 'border-border2 text-text3'
                }`}
              >
                {t('analysis.az')}
              </button>
            </p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="tb-btn flex h-6 w-6 items-center justify-center px-0 lg:hidden"
              aria-label={t('analysis.closeLibrary')}
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
            placeholder={t('analysis.searchPlaceholder')}
            aria-label={t('analysis.searchAria')}
            className="w-full rounded border border-border2 bg-surface3 py-1.5 pl-7 pr-7 text-[11px] text-text placeholder:text-text3 focus:border-accent focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-text3 hover:bg-border hover:text-text"
              aria-label={t('analysis.clearSearch')}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <div
        className="min-h-0 flex-1 overflow-auto scrollbar p-2"
        onKeyDown={event => {
          if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
          const items = Array.from(
            document.querySelectorAll<HTMLButtonElement>('[data-analysis-item]')
          );
          if (items.length === 0) return;
          const current = items.indexOf(document.activeElement as HTMLButtonElement);
          let next = current;
          if (event.key === 'ArrowDown') next = current < 0 ? 0 : Math.min(items.length - 1, current + 1);
          if (event.key === 'ArrowUp') next = current < 0 ? 0 : Math.max(0, current - 1);
          if (event.key === 'Home') next = 0;
          if (event.key === 'End') next = items.length - 1;
          event.preventDefault();
          items[next]?.focus();
        }}
      >
        {normalizedQuery.length === 0 && favoriteItems.length > 0 && (
          <section className="mb-3">
            <div className="flex items-center gap-1.5 px-2 py-1">
              <Star className="h-3 w-3 text-yellow" fill="currentColor" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-text3">
                {t('analysis.favorites')}
              </span>
            </div>
            <div className="space-y-0.5">
              {favoriteItems.map(meta => (
                <AnalysisItem
                  key={`favorite-${meta.id}`}
                  meta={meta}
                  active={meta.id === activeAnalysis}
                  favorite={favorites.includes(meta.id)}
                  onSelect={onSelect}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </section>
        )}

        {recentItems.length > 0 && (
          <section className="mb-3">
            <div className="flex items-center gap-1.5 px-2 py-1">
              <Clock3 className="h-3 w-3 text-text3" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-text3">
                {t('analysis.recent')}
              </span>
            </div>
            <div className="space-y-0.5">
              {recentItems.map(meta => (
                <AnalysisItem
                  key={`recent-${meta.id}`}
                  meta={meta}
                  active={meta.id === activeAnalysis}
                  favorite={favorites.includes(meta.id)}
                  onSelect={onSelect}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </section>
        )}

        {flat && (
          <section>
            <div className="mb-1 px-2 font-mono text-[9px] uppercase tracking-widest text-text3">
              {t('analysis.az')}
            </div>
            <div className="space-y-0.5">
              {flat.map(meta => (
                <AnalysisItem
                  key={`az-${meta.id}`}
                  meta={meta}
                  active={meta.id === activeAnalysis}
                  favorite={favorites.includes(meta.id)}
                  onSelect={onSelect}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </section>
        )}

        {!flat && groups.map(group => {
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
                      favorite={favorites.includes(meta.id)}
                      onSelect={onSelect}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}

        {count === 0 && (
          <div className="px-3 py-8 text-center">
            <p className="text-[11px] text-text2">{t('analysis.noResults')}</p>
            <p className="mt-1 text-[10px] text-text3">
              {t('analysis.noResultsHint')}
            </p>
          </div>
        )}
      </div>

      <div
        className="shrink-0 border-t border-border px-3 py-2 font-mono text-[9px] uppercase tracking-wider text-text3"
        title={t('analysis.shortcutTitle')}
      >
        {t('analysis.shortcutSearch')}
      </div>
    </div>
  );
};
