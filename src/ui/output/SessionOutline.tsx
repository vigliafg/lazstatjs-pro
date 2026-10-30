import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Search, Star } from 'lucide-react';
import { t } from '../../i18n';
import type {
  OutlineFilter,
  OutlineRun,
  SessionOutline as SessionOutlineData,
} from '../analysis/sessionOutline';

interface SessionOutlineProps {
  outline: SessionOutlineData;
  activeId: string | null;
  onJump: (id: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
  filter: OutlineFilter;
  onFilterChange: (filter: OutlineFilter) => void;
  collapsedFamilies: ReadonlySet<string>;
  collapsedAnalyses: ReadonlySet<string>;
  onToggleFamily: (id: string) => void;
  onToggleAnalysis: (id: string) => void;
  /** Drawer mode: focus the first node as soon as the panel opens. */
  autoFocus?: boolean;
}

const PINNED = 'pinned';

const filterKeys = [
  { id: 'all', count: 'all' },
  { id: 'pinned', count: 'pinned' },
  { id: 'stale', count: 'stale' },
  { id: 'warning', count: 'warning' },
] as const;

const filterLabel = (id: OutlineFilter): string => {
  if (id === 'pinned') return t('output.outlinePinned');
  if (id === 'stale') return t('output.outlineStale');
  if (id === 'warning') return t('output.outlineWarning');
  return t('output.outlineAll');
};

const runKey = (run: OutlineRun): string => `run:${run.id}`;

/**
 * Tree index of the session-report: pinned shortcuts, then family → analysis →
 * run-report. Rendered only when the panel is wide enough; the same component
 * is reused inside the narrow drawer.
 */
export const SessionOutline = ({
  outline,
  activeId,
  onJump,
  query,
  onQueryChange,
  filter,
  onFilterChange,
  collapsedFamilies,
  collapsedAnalyses,
  onToggleFamily,
  onToggleAnalysis,
  autoFocus,
}: SessionOutlineProps) => {
  const tree = useRef<HTMLDivElement>(null);
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const searching = query.trim().length > 0;

  const familyOpen = (id: string): boolean => searching || !collapsedFamilies.has(id);
  const analysisOpen = (id: string): boolean => searching || !collapsedAnalyses.has(id);

  const visibleKeys = useMemo(() => {
    const keys: string[] = [];
    if (outline.pinned.length > 0) {
      keys.push(PINNED);
      if (familyOpen(PINNED)) outline.pinned.forEach(run => keys.push(runKey(run)));
    }
    for (const family of outline.families) {
      keys.push(`family:${family.id}`);
      if (!familyOpen(family.id)) continue;
      for (const analysis of family.analyses) {
        keys.push(`analysis:${family.id}:${analysis.id}`);
        if (!analysisOpen(`${family.id}:${analysis.id}`)) continue;
        analysis.runs.forEach(run => keys.push(runKey(run)));
      }
    }
    return keys;
    // familyOpen/analysisOpen read the same two sets through the closure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outline, collapsedFamilies, collapsedAnalyses, searching]);

  const activeRunKey = activeId ? `run:${activeId}` : null;
  const currentFocus =
    focusKey && visibleKeys.includes(focusKey)
      ? focusKey
      : activeRunKey && visibleKeys.includes(activeRunKey)
        ? activeRunKey
        : visibleKeys[0] ?? null;

  useEffect(() => {
    if (!autoFocus) return;
    const frame = requestAnimationFrame(() => {
      const item = tree.current?.querySelector<HTMLElement>('[role="treeitem"][tabindex="0"]');
      item?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [autoFocus]);

  // Keep the active node inside the outline viewport without scrolling the page.
  useEffect(() => {
    if (!activeId) return;
    const root = tree.current;
    const item = root?.querySelector<HTMLElement>(`[data-tree-key="run:${activeId}"]`);
    if (!root || !item) return;
    const rootRect = root.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    if (itemRect.top < rootRect.top) {
      root.scrollTop -= rootRect.top - itemRect.top;
    } else if (itemRect.bottom > rootRect.bottom) {
      root.scrollTop += itemRect.bottom - rootRect.bottom;
    }
  }, [activeId]);

  const keyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const item = (event.target as HTMLElement).closest<HTMLElement>('[role="treeitem"]');
    if (!item || !tree.current) return;
    const nodes = Array.from(
      tree.current.querySelectorAll('[role="treeitem"]')
    ) as HTMLElement[];
    const index = nodes.indexOf(item);
    if (index < 0) return;
    const focusAt = (next: number) => {
      const node = nodes[next];
      if (!node) return;
      event.preventDefault();
      setFocusKey(node.dataset.treeKey ?? null);
      node.focus();
    };
    const expanded = item.getAttribute('aria-expanded');

    if (event.key === 'ArrowDown') focusAt(index + 1);
    else if (event.key === 'ArrowUp') focusAt(index - 1);
    else if (event.key === 'Home') focusAt(0);
    else if (event.key === 'End') focusAt(nodes.length - 1);
    else if (event.key === 'ArrowRight' && expanded !== null) {
      if (expanded === 'false') {
        event.preventDefault();
        item.click();
      } else {
        focusAt(index + 1);
      }
    } else if (event.key === 'ArrowLeft') {
      if (expanded === 'true') {
        event.preventDefault();
        item.click();
        return;
      }
      const parentKey = item.dataset.treeParent;
      const parent = parentKey
        ? tree.current.querySelector<HTMLElement>(`[data-tree-key="${parentKey}"]`)
        : null;
      if (parent) {
        event.preventDefault();
        setFocusKey(parent.dataset.treeKey ?? null);
        parent.focus();
      }
    }
  };

  const baseClass = (active: boolean) =>
    `flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left transition-colors ${
      active ? 'bg-accent/10 text-text' : 'text-text3 hover:bg-surface3 hover:text-text2'
    }`;

  const runRow = (run: OutlineRun, level: number, parent?: string) => (
    <button
      key={run.id}
      type="button"
      role="treeitem"
      aria-level={level}
      aria-selected={activeId === run.id}
      data-tree-key={runKey(run)}
      {...(parent ? { 'data-tree-parent': parent } : {})}
      tabIndex={currentFocus === runKey(run) ? 0 : -1}
      onFocus={() => setFocusKey(runKey(run))}
      onClick={() => onJump(run.id)}
      className={baseClass(activeId === run.id)}
      title={`${String(run.runNumber).padStart(2, '0')} · ${run.title}`}
    >
      <span className="w-5 shrink-0 font-mono text-[9px] tabular-nums text-text3">
        {String(run.runNumber).padStart(2, '0')}
      </span>
      <span className="min-w-0 flex-1 truncate text-[10px]">{run.title}</span>
      {run.pinned && <Star className="h-2.5 w-2.5 shrink-0 text-accent2" />}
      {run.stale && (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-yellow" title={t('output.stale')} />
      )}
      {run.warning && (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" title={t('output.outlineWarning')} />
      )}
    </button>
  );

  return (
    <div className="flex h-full min-h-0 flex-col" data-no-print>
      <div className="mb-2 space-y-1.5">
        <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-text3">
          {t('output.outline')}
        </span>
        <label className="relative block">
          <Search className="pointer-events-none absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-text3" />
          <input
            type="search"
            value={query}
            onChange={event => onQueryChange(event.target.value)}
            aria-label={t('output.outlineSearch')}
            placeholder={t('output.outlineSearch')}
            className="w-full rounded border border-border2 bg-surface3 py-1 pl-6 pr-2 text-[10px] text-text placeholder:text-text3"
          />
        </label>
        <div className="flex flex-wrap gap-1">
          {filterKeys.map(item => {
            const active = filter === item.id;
            const count = outline.counts[item.count];
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                aria-label={`${filterLabel(item.id)} ${count}`}
                onClick={() => onFilterChange(item.id)}
                className={`rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider transition-colors ${
                  active
                    ? 'border-accent/60 bg-accent/10 text-text'
                    : 'border-border2 bg-surface3/40 text-text3 hover:text-text2'
                }`}
              >
                {filterLabel(item.id)}
                <span className="ml-1 tabular-nums opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        ref={tree}
        role="tree"
        aria-label={t('output.outline')}
        onKeyDown={keyDown}
        className="scrollbar min-h-0 flex-1 overflow-auto pr-1"
      >
        {outline.total === 0 ? (
          <p className="px-1 py-3 text-[10px] leading-relaxed text-text3">
            {t('output.outlineNoMatch')}
            {(query.length > 0 || filter !== 'all') && (
              <button
                type="button"
                className="mt-2 block rounded border border-border2 px-2 py-1 text-[10px] text-text2 hover:bg-surface3"
                onClick={() => {
                  onQueryChange('');
                  onFilterChange('all');
                }}
              >
                {t('output.showAll')}
              </button>
            )}
          </p>
        ) : (
          <>
            {outline.pinned.length > 0 && (
              <div role="none" className="mb-1">
                <button
                  type="button"
                  role="treeitem"
                  aria-level={1}
                  aria-expanded={familyOpen(PINNED)}
                  data-tree-key={PINNED}
                  tabIndex={currentFocus === PINNED ? 0 : -1}
                  onFocus={() => setFocusKey(PINNED)}
                  onClick={() => onToggleFamily(PINNED)}
                  className="flex w-full items-center gap-1 rounded px-1 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-accent2 hover:bg-surface3"
                >
                  <Star className="h-3 w-3" />
                  <span className="flex-1 text-left">{t('output.outlinePinned')}</span>
                  <span className="tabular-nums text-text3">{outline.pinned.length}</span>
                </button>
                {familyOpen(PINNED) && (
                  <div role="group" className="ml-2 border-l border-border2 pl-1">
                    {outline.pinned.map(run => runRow(run, 2, PINNED))}
                  </div>
                )}
              </div>
            )}

            {outline.families.map(family => {
              const familyKey = `family:${family.id}`;
              const open = familyOpen(family.id);
              const familyCount = family.analyses.reduce(
                (sum, analysis) => sum + analysis.runs.length,
                0
              );
              return (
                <div role="none" key={family.id} className="mb-0.5">
                  <button
                    type="button"
                    role="treeitem"
                    aria-level={1}
                    aria-expanded={open}
                    data-tree-key={familyKey}
                    tabIndex={currentFocus === familyKey ? 0 : -1}
                    onFocus={() => setFocusKey(familyKey)}
                    onClick={() => onToggleFamily(family.id)}
                    className="flex w-full items-center gap-1 rounded px-1 py-1 text-left text-[10px] text-text2 hover:bg-surface3"
                  >
                    <span className="w-2 text-[8px] text-text3">{open ? '▾' : '▸'}</span>
                    <span className="flex-1 truncate">{family.label}</span>
                    <span className="tabular-nums text-[9px] text-text3">{familyCount}</span>
                  </button>
                  {open && (
                    <div role="group" className="ml-2 border-l border-border2 pl-1">
                      {family.analyses.map(analysis => {
                        const analysisKey = `${family.id}:${analysis.id}`;
                        const treeKey = `analysis:${analysisKey}`;
                        const isOpen = analysisOpen(analysisKey);
                        return (
                          <div role="none" key={analysis.id}>
                            <button
                              type="button"
                              role="treeitem"
                              aria-level={2}
                              aria-expanded={isOpen}
                              data-tree-key={treeKey}
                              data-tree-parent={familyKey}
                              tabIndex={currentFocus === treeKey ? 0 : -1}
                              onFocus={() => setFocusKey(treeKey)}
                              onClick={() => onToggleAnalysis(analysisKey)}
                              className="flex w-full items-center gap-1 rounded px-1 py-1 text-left text-[10px] text-text3 hover:bg-surface3 hover:text-text2"
                            >
                              <span className="w-2 text-[8px]">{isOpen ? '▾' : '▸'}</span>
                              <span className="flex-1 truncate">{analysis.label}</span>
                              <span className="tabular-nums text-[9px]">{analysis.runs.length}</span>
                            </button>
                            {isOpen && (
                              <div role="group" className="ml-2">
                                {analysis.runs.map(run => runRow(run, 3, treeKey))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
