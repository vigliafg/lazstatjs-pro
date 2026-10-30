import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { FileText, X } from 'lucide-react';
import { analysisMeta } from '../analyses/registry';
import { isOutputStale } from '../io/outputs';
import { copyText } from '../io/clipboard';
import { awaitChartsReady } from '../io/chartReady';
import { t } from '../i18n';
import { useContainerWidth } from '../hooks/useContainerWidth';
import type { ChartOptions } from '../stats/charts';
import { analysisIdsOf, isValidFilter } from './analysis/outputSelection';
import {
  buildSessionOutline,
  outlineRunIds,
} from './analysis/sessionOutline';
import { RunReportCard } from './output/RunReportCard';
import { SessionOutline } from './output/SessionOutline';
import { SessionReportHeader } from './output/SessionReportHeader';
import { SessionReportToolbar } from './output/SessionReportToolbar';
import { useSessionViewState } from './output/useSessionViewState';
import type { OutputEntry, SessionReportMeta } from './output/types';

export type { OutputEntry, SessionOutputBody } from './output/types';
export { restoredOutputs } from './output/types';

export interface OutputConsoleProps {
  id?: string;
  outputs: OutputEntry[];
  meta: SessionReportMeta;
  onRemove: (index: number) => void;
  onClear: () => void;
  onCopy: () => void;
  onExportCharts: () => void;
  onExportReport: () => void;
  onExportWord: () => void;
  onExportXlsx: () => void;
  onExportRunHtml: (entryId: string) => void;
  onExportRunWord: (entryId: string) => void;
  onBackToData: () => void;
  onOpenAnalysis?: (analysisId: string) => void;
  onRerun?: (entry: OutputEntry) => void;
  onRerunAll?: () => void;
  onApplyParams?: (entry: OutputEntry) => void;
  /** Current signature of an analysis' parameters, for the params-stale badge. */
  paramsSignatureFor?: (analysisId: string) => string;
  currentRevision?: number;
  currentDatasetId?: string;
  currentFilterSignature?: string;
  currentCiLevel?: number;
  /** Localised "Limitations and caveats" label for the report body. */
  limitationsLabel?: string;
  /** Presentation overrides scoped to `#output-content`. */
  outputStyle?: Record<string, string>;
  /** Done in the chart editor: persist new options without re-running. */
  onUpdateChart?: (entryId: string, chartId: string, options: ChartOptions) => void;
}

const OUTLINE_BREAKPOINT = 720;

/**
 * Output document: one card per run, with an outline that stays visible while
 * the user reads, collapses or removes blocks.
 */
export const OutputConsole = ({
  id,
  outputs,
  meta,
  onRemove,
  onClear,
  onCopy,
  onExportCharts,
  onExportReport,
  onExportWord,
  onExportXlsx,
  onExportRunHtml,
  onExportRunWord,
  onBackToData,
  onOpenAnalysis,
  onRerun,
  onRerunAll,
  onApplyParams,
  paramsSignatureFor,
  currentRevision,
  currentDatasetId,
  currentFilterSignature,
  currentCiLevel,
  limitationsLabel,
  outputStyle,
  onUpdateChart,
}: OutputConsoleProps) => {
  const [rootRef, width] = useContainerWidth<HTMLDivElement>();
  const narrow = width > 0 && width < OUTLINE_BREAKPOINT;
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [outlineOpen, setOutlineOpen] = useState(false);

  const analysisIds = analysisIdsOf(outputs);
  const {
    pinned,
    collapsedFamilies,
    collapsedAnalyses,
    filterId,
    outlineFilter,
    setPinned,
    setCollapsedFamilies,
    setCollapsedAnalyses,
    setFilterId,
    setOutlineFilter,
  } = useSessionViewState({
    datasetId: meta.datasetId ?? 'session',
    outputs,
    analysisIds,
  });
  const lastId = outputs.length > 0 ? outputs[outputs.length - 1].id : null;
  const [activeId, setActiveId] = useState<string | null>(lastId);

  // Freshness and warnings are needed both by the cards and by the outline.
  const staleIds = new Set<string>();
  const warningIds = new Set<string>();
  for (const output of outputs) {
    if (
      isOutputStale(output, {
        dataRevision: currentRevision,
        datasetId: currentDatasetId,
        filterSignature: currentFilterSignature,
        paramsSignature:
          output.analysisId && paramsSignatureFor
            ? paramsSignatureFor(output.analysisId)
            : undefined,
        ciLevel: currentCiLevel,
      })
    ) {
      staleIds.add(output.id);
    }
    if ((output.session?.warnings?.length ?? 0) > 0) warningIds.add(output.id);
  }

  const outline = buildSessionOutline(outputs, {
    pinnedIds: pinned,
    staleIds,
    warningIds,
    query,
    filter: outlineFilter,
  });
  const matchingIds = outlineRunIds(outline);
  const outlineFilterActive = query.trim().length > 0 || outlineFilter !== 'all';

  // Never restore a state filter that now matches nothing (e.g. "Stale" after
  // a reload of a fresh session): the empty view would look like data loss.
  useEffect(() => {
    const empty =
      (outlineFilter === 'pinned' && outline.counts.pinned === 0) ||
      (outlineFilter === 'stale' && outline.counts.stale === 0) ||
      (outlineFilter === 'warning' && outline.counts.warning === 0);
    if (empty) setOutlineFilter('all');
  }, [outlineFilter, outline.counts.pinned, outline.counts.stale, outline.counts.warning, setOutlineFilter]);

  const orderedOutputs = outputs
    .map((output, index) => ({ output, index }))
    .sort(
      (a, b) =>
        Number(pinned.has(b.output.id)) - Number(pinned.has(a.output.id))
    );

  const visibleIds = new Set(
    orderedOutputs
      .filter(({ output }) => filterId === 'all' || output.analysisId === filterId)
      .filter(({ output }) => !outlineFilterActive || matchingIds.has(output.id))
      .map(({ output }) => output.id)
  );

  const programmaticScroll = useRef(false);

  useEffect(() => {
    setActiveId(lastId);
  }, [lastId]);

  // Removing the last card of the filtered analysis leaves a filter that no
  // longer exists: return to "all" instead of showing a dead select value.
  useEffect(() => {
    if (!isValidFilter(filterId, analysisIds)) setFilterId('all');
  }, [filterId, analysisIds]);

  // Keep the outline in sync with the scroll position. The flag avoids the
  // feedback loop between a programmatic jump and the observer-like handler.
  useEffect(() => {
    const container = document.getElementById('output-content');
    if (!container) return;
    let frame = 0;
    const update = () => {
      if (programmaticScroll.current) return;
      const cards = Array.from(
        container.querySelectorAll<HTMLElement>('article.output-card')
      ).filter(card => card.offsetParent !== null);
      if (cards.length === 0) return;
      const threshold = container.getBoundingClientRect().top + 88;
      let current = cards[0];
      for (const card of cards) {
        if (card.getBoundingClientRect().top <= threshold) current = card;
      }
      const next = current.id.replace('output-block-', '');
      setActiveId(previous => (previous === next ? previous : next));
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    container.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      container.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [outputs.length, filterId, query, outlineFilter, pinned]);

  const toggle = (setter: typeof setCollapsed, id: string) => {
    setter(previous => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyCard = async (entry: OutputEntry) => {
    const card = document.getElementById(`output-block-${entry.id}`);
    if (!card) return;
    await awaitChartsReady(card);
    const clone = card.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('button, [data-no-print]').forEach(node => node.remove());
    const ok = await copyText(clone.innerText);
    if (ok) {
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(current => (current === entry.id ? null : current)), 1500);
    }
  };

  const confirmClear = () => {
    if (window.confirm(t('output.confirmClear'))) onClear();
  };

  const jumpTo = (targetId: string) => {
    setActiveId(targetId);
    const container = document.getElementById('output-content');
    const target = document.getElementById(`output-block-${targetId}`);
    if (!container || !target) return;
    const entry = outputs.find(item => item.id === targetId);
    // Clicking an outline node for another analysis must reveal its card first.
    const hiddenByAnalysis = filterId !== 'all' && entry?.analysisId !== filterId;
    if (hiddenByAnalysis) setFilterId('all');
    const scroll = () => {
      programmaticScroll.current = true;
      const offset = target.getBoundingClientRect().top - container.getBoundingClientRect().top;
      container.scrollTo({
        top: Math.max(0, container.scrollTop + offset - 8),
        behavior: 'smooth',
      });
      window.setTimeout(() => {
        programmaticScroll.current = false;
      }, 500);
    };
    if (hiddenByAnalysis) requestAnimationFrame(scroll);
    else scroll();
    if (narrow) setOutlineOpen(false);
  };

  const resetReadingFilters = () => {
    setQuery('');
    setOutlineFilter('all');
    setFilterId('all');
  };

  const outlinePanel = (
    <SessionOutline
      outline={outline}
      activeId={activeId}
      onJump={jumpTo}
      query={query}
      onQueryChange={setQuery}
      filter={outlineFilter}
      onFilterChange={setOutlineFilter}
      collapsedFamilies={collapsedFamilies}
      collapsedAnalyses={collapsedAnalyses}
      onToggleFamily={familyId => toggle(setCollapsedFamilies, familyId)}
      onToggleAnalysis={analysisId => toggle(setCollapsedAnalyses, analysisId)}
      autoFocus={narrow && outlineOpen}
    />
  );

  return (
    <div
      ref={rootRef}
      id={id}
      tabIndex={-1}
      aria-label={t('output.aria')}
      className="relative flex h-full min-h-0 w-full flex-col bg-bg outline-none"
    >
      <div
        id="output-content"
        className="scrollbar min-h-0 flex-1 overflow-auto"
        style={outputStyle as CSSProperties | undefined}
      >
        <SessionReportHeader
          meta={{ ...meta, analyses: analysisIds.length }}
          runs={outputs.length}
          stale={staleIds.size}
          warnings={warningIds.size}
          narrow={narrow}
          outlineOpen={outlineOpen}
          onToggleOutline={() => setOutlineOpen(value => !value)}
          onExportHtml={onExportReport}
          onExportWord={onExportWord}
        />

        <div className="px-4 pb-8 pt-3">
          <SessionReportToolbar
            analysisIds={analysisIds}
            filterId={filterId}
            onFilterChange={setFilterId}
            disabled={outputs.length === 0}
            onRerunAll={onRerunAll ?? (() => undefined)}
            onBackToData={onBackToData}
            onClear={confirmClear}
            onCopy={onCopy}
            onExportCharts={onExportCharts}
            onExportXlsx={onExportXlsx}
          />

          {outputs.length === 0 ? (
            <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-3 text-text3 opacity-70">
              <FileText className="h-10 w-10" />
              <p className="font-mono text-[11px] uppercase tracking-widest">{t('output.empty')}</p>
              <p className="max-w-xs text-center text-[10px] leading-relaxed">
                {t('output.emptyHint')}
              </p>
            </div>
          ) : (
            <div
              className={narrow ? 'mt-3 block' : 'mt-3 grid items-start gap-4'}
              style={
                narrow
                  ? undefined
                  : { gridTemplateColumns: 'minmax(200px, 240px) minmax(0, 1fr)' }
              }
            >
              {!narrow && (
                <aside className="sticky top-20 z-10 max-h-[calc(100vh-140px)] min-h-0 overflow-hidden rounded border border-border bg-surface/60 p-2">
                  {outlinePanel}
                </aside>
              )}
              <div className="min-w-0">
                {visibleIds.size === 0 ? (
                  <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-text3">
                    <p className="text-[11px]">{t('output.emptyFilter')}</p>
                    <button
                      type="button"
                      className="tb-btn px-2 py-1 text-[10px]"
                      onClick={resetReadingFilters}
                    >
                      {t('output.showAll')}
                    </button>
                  </div>
                ) : (
                  <div className="mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-4">
                    {orderedOutputs.map(({ output, index }) => (
                      <div key={output.id} className={visibleIds.has(output.id) ? '' : 'hidden'}>
                        <RunReportCard
                          output={output}
                          index={index}
                          runNumber={output.runNumber ?? index + 1}
                          stale={staleIds.has(output.id)}
                          pinned={pinned.has(output.id)}
                          collapsed={collapsed.has(output.id)}
                          copied={copiedId === output.id}
                          limitationsLabel={limitationsLabel}
                          canRerun={Boolean(
                            output.analysisId && output.params !== undefined && onRerun
                          )}
                          canApply={Boolean(
                            output.analysisId && output.params !== undefined && onApplyParams
                          )}
                          canSetup={Boolean(
                            output.analysisId && analysisMeta(output.analysisId) && onOpenAnalysis
                          )}
                          onToggleCollapse={() => toggle(setCollapsed, output.id)}
                          onTogglePin={() => toggle(setPinned, output.id)}
                          onCopy={() => void copyCard(output)}
                          onRemove={() => onRemove(index)}
                          onRerun={() => onRerun?.(output)}
                          onApplyParams={() => onApplyParams?.(output)}
                          onOpenAnalysis={() => {
                            if (output.analysisId) onOpenAnalysis?.(output.analysisId);
                          }}
                          onExportHtml={() => onExportRunHtml(output.id)}
                          onExportWord={() => onExportRunWord(output.id)}
                          onUpdateChart={onUpdateChart}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {narrow && outlineOpen && (
        <>
          <div
            className="absolute inset-0 z-30 bg-black/40"
            onClick={() => setOutlineOpen(false)}
            data-no-print
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={t('output.outline')}
            data-no-print
            className="absolute inset-y-0 left-0 z-40 flex w-[290px] max-w-[85%] flex-col border-r border-border bg-surface p-2 shadow-xl"
            onKeyDown={event => {
              if (event.key === 'Escape') {
                setOutlineOpen(false);
                return;
              }
              if (event.key !== 'Tab') return;
              const focusable = Array.from(
                event.currentTarget.querySelectorAll(
                  'button, input, [href], [tabindex]:not([tabindex="-1"])'
                )
              ) as HTMLElement[];
              if (focusable.length === 0) return;
              const first = focusable[0];
              const last = focusable[focusable.length - 1];
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
              }
            }}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text3">
                {t('output.outline')}
              </span>
              <button
                type="button"
                onClick={() => setOutlineOpen(false)}
                aria-label={t('output.outlineClose')}
                className="flex h-6 w-6 items-center justify-center rounded text-text3 hover:bg-surface3 hover:text-text"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            {outlinePanel}
          </aside>
        </>
      )}
    </div>
  );
};
