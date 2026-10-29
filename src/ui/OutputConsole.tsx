import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Database,
  FileCode2,
  FileText,
  Image,
  Check,
  ClipboardCheck,
  Pin,
  PinOff,
  RotateCcw,
  SlidersHorizontal,
  Table2,
  Trash2,
} from 'lucide-react';
import { analysisLabel, analysisMeta } from '../analyses/registry';
import { isOutputStale, sanitizeOutputHtml, type StoredOutput } from '../io/outputs';
import { copyText } from '../io/clipboard';
import { awaitChartsReady } from '../io/chartReady';
import { AnalysisOutput } from '../components/AnalysisOutput';
import { AnalysisCharts } from '../components/AnalysisCharts';
import type { ChartOptions } from '../stats/charts';
import type { TableSpec } from '../stats/types';
import type { ReportSpec } from '../stats/report';
import { t } from '../i18n';
import { HelpButton } from '../help/HelpButton';
import { topicForAnalysis } from '../help/book';
import { analysisIdsOf, isValidFilter, selectOutputs } from './analysis/outputSelection';

export interface SessionOutputBody {
  title?: string;
  header?: string;
  tables: TableSpec[];
  report: ReportSpec | null;
  warnings?: string[];
  /** Complete chart list for the session; persistence keeps the capped one. */
  charts?: import('../stats/charts').AnalysisChart[];
  callout?: {
    title: string;
    badge?: string;
    headline: string;
    bullets?: string[];
  };
}

/** Un blocco della console: React live nella sessione, HTML quando ripristinato. */
export interface OutputEntry extends StoredOutput {
  /** Serializable result kept in session so charts can be edited. */
  session?: SessionOutputBody;
  /** In-session revision of the grid that produced the block. */
  dataRevision?: number;
  /** In-session dataset identity. */
  datasetId?: string;
  /** Signature of the analysis row filter used for the run. */
  filterSignature?: string;
  /** Session-only live-run card: replaced on the next live run. */
  live?: boolean;
}

/** I blocchi ripristinati sono statici: sanificati una volta e iniettati. */
export const restoredOutputs = (stored: StoredOutput[] | undefined): OutputEntry[] =>
  (stored ?? [])
    .map((entry) => ({ ...entry, html: sanitizeOutputHtml(entry.html) }))
    .filter((entry) => entry.html.length > 0);

export interface OutputConsoleProps {
  id?: string;
  outputs: OutputEntry[];
  onRemove: (index: number) => void;
  onClear: () => void;
  onCopy: () => void;
  onExportCharts: () => void;
  onExportReport: () => void;
  onExportWord: () => void;
  onExportXlsx: () => void;
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

const formatTime = (iso: string): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const outlineLabel = (entry: OutputEntry, index: number): string => {
  if (entry.title && entry.title !== 'Analysis output') return entry.title;
  if (entry.analysisId) return analysisLabel(entry.analysisId);
  return `${t('output.result')} ${index + 1}`;
};

const actionClass =
  'tb-btn flex items-center gap-1 px-2 py-0.5 text-[10px] disabled:cursor-not-allowed';

/**
 * Output document: one card per run, with an outline that stays visible while
 * the user reads, collapses or removes blocks.
 */
export const OutputConsole = ({
  id,
  outputs,
  onRemove,
  onClear,
  onCopy,
  onExportCharts,
  onExportReport,
  onExportWord,
  onExportXlsx,
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
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [pinned, setPinned] = useState<Set<string>>(() => new Set());
  const [filterId, setFilterId] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const analysisIds = useMemo(() => analysisIdsOf(outputs), [outputs]);
  const visibleOutputs = useMemo(() => selectOutputs(outputs, filterId), [outputs, filterId]);
  // Keep filtered cards mounted but hidden: exports, reports and PNG need the
  // whole console, while the filter is only a reading aid.
  const orderedOutputs = useMemo(() => {
    const all = selectOutputs(outputs, 'all');
    return all.slice().sort(
      (a, b) => Number(pinned.has(b.output.id)) - Number(pinned.has(a.output.id))
    );
  }, [outputs, pinned]);
  const lastId = outputs.length > 0 ? outputs[outputs.length - 1].id : null;
  const [activeId, setActiveId] = useState<string | null>(lastId);

  useEffect(() => {
    setActiveId(lastId);
  }, [lastId]);

  // Removing the last card of the filtered analysis leaves a filter that no
  // longer exists: return to "all" instead of showing a dead select value.
  useEffect(() => {
    if (!isValidFilter(filterId, analysisIds)) setFilterId('all');
  }, [filterId, analysisIds]);

  const toggle = (id: string) => {
    setCollapsed(previous => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePin = (id: string) => {
    setPinned(previous => {
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

  const jumpTo = (id: string) => {
    setActiveId(id);
    const container = document.getElementById('output-content');
    const target = document.getElementById(`output-block-${id}`);
    if (!container || !target) return;
    const offset = target.getBoundingClientRect().top - container.getBoundingClientRect().top;
    container.scrollTo({
      top: Math.max(0, container.scrollTop + offset - 8),
      behavior: 'smooth',
    });
  };

  return (
    <div
      id={id}
      tabIndex={-1}
      aria-label={t('output.aria')}
      className="flex h-full min-h-0 w-full flex-col bg-bg outline-none"
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border bg-surface px-3 py-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="h-3.5 w-3.5 shrink-0 text-accent2" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-text3">
            {t('output.title')}
          </span>
          <span className="rounded border border-border2 bg-surface3 px-1.5 py-0.5 font-mono text-[9px] text-text3">
            {outputs.length} {outputs.length === 1 ? t('output.runOne') : t('output.runMany')}
          </span>
          {analysisIds.length > 1 && (
            <select
              aria-label={t('output.filterBy')}
              value={filterId}
              onChange={event => setFilterId(event.target.value)}
              className="rounded border border-border2 bg-surface3 px-1.5 py-0.5 text-[10px] text-text2"
            >
              <option value="all">{t('output.allAnalyses')}</option>
              {analysisIds.map(id => (
                <option key={id} value={id}>
                  {analysisLabel(id)}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            className={actionClass}
            onClick={onRerunAll}
            disabled={outputs.length === 0}
            title={t('output.rerunAllHint')}
            aria-label={t('output.rerunAllHint')}
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden 2xl:inline">{t('output.rerunAll')}</span>
          </button>
          <button
            type="button"
            className={actionClass}
            onClick={onBackToData}
            title={t('output.openDataTitle')}
            aria-label={t('output.openDataTitle')}
          >
            <Database className="h-3 w-3" />
            <span className="hidden xl:inline">{t('output.data')}</span>
          </button>
          <button
            type="button"
            className={actionClass}
            onClick={confirmClear}
            disabled={outputs.length === 0}
            title={t('output.clearAll')}
            aria-label={t('output.clearAll')}
          >
            <Trash2 className="h-3 w-3" />
            <span className="hidden xl:inline">{t('output.clear')}</span>
          </button>
          <button
            type="button"
            className={actionClass}
            onClick={onCopy}
            disabled={outputs.length === 0}
            title={t('output.copyText')}
            aria-label={t('output.copyText')}
          >
            <Copy className="h-3 w-3" />
            <span className="hidden xl:inline">{t('output.copy')}</span>
          </button>
          <button
            type="button"
            className={actionClass}
            onClick={onExportCharts}
            disabled={outputs.length === 0}
            title={t('output.chartsHint')}
            aria-label={t('output.chartsHint')}
          >
            <Image className="h-3 w-3" />
            <span className="hidden xl:inline">{t('output.charts')}</span>
          </button>
          <button
            type="button"
            className={actionClass}
            onClick={onExportReport}
            disabled={outputs.length === 0}
            title={t('output.reportHint')}
            aria-label={t('output.reportHint')}
          >
            <FileCode2 className="h-3 w-3" />
            <span className="hidden xl:inline">{t('output.report')}</span>
          </button>
          <button
            type="button"
            className={actionClass}
            onClick={onExportWord}
            disabled={outputs.length === 0}
            title={t('output.wordHint')}
            aria-label={t('output.wordHint')}
          >
            <FileText className="h-3 w-3" />
            <span className="hidden xl:inline">{t('output.word')}</span>
          </button>
          <button
            type="button"
            className={actionClass}
            onClick={onExportXlsx}
            disabled={outputs.length === 0}
            title={t('output.xlsxHint')}
            aria-label={t('output.xlsxHint')}
          >
            <Table2 className="h-3 w-3" />
            <span className="hidden xl:inline">{t('output.xlsx')}</span>
          </button>
        </div>
      </div>

      {outputs.length > 0 && (
        <div
          className="flex shrink-0 items-center gap-1 overflow-x-auto scrollbar border-b border-border bg-surface/70 px-2 py-1.5"
          data-no-print
        >
          <span className="shrink-0 pr-1 font-mono text-[8px] uppercase tracking-[0.18em] text-text3">
            {t('output.outline')}
          </span>
          {outputs.map((entry, index) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => jumpTo(entry.id)}
              title={outlineLabel(entry, index)}
              className={`flex shrink-0 items-center gap-1.5 rounded border px-2 py-0.5 text-left transition-colors ${
                activeId === entry.id
                  ? 'border-accent/60 bg-accent/10 text-text'
                  : 'border-transparent bg-surface3/50 text-text3 hover:border-border2 hover:text-text2'
              }`}
            >
              <span className="font-mono text-[8px] text-text3">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="max-w-[160px] truncate text-[10px]">{outlineLabel(entry, index)}</span>
            </button>
          ))}
        </div>
      )}

      <div
        id="output-content"
        className="scrollbar min-h-0 flex-1 overflow-auto p-4"
        style={outputStyle as CSSProperties | undefined}
      >
        {outputs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-text3 opacity-70">
            <FileText className="h-10 w-10" />
            <p className="font-mono text-[11px] uppercase tracking-widest">{t('output.empty')}</p>
            <p className="max-w-xs text-center text-[10px] leading-relaxed">
              {t('output.emptyHint')}
            </p>
          </div>
        ) : visibleOutputs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-text3">
            <p className="text-[11px]">{t('output.emptyFilter')}</p>
            <button type="button" className="tb-btn px-2 py-1 text-[10px]" onClick={() => setFilterId('all')}>
              {t('output.showAll')}
            </button>
          </div>
        ) : (
          <div className="mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-4">
            {orderedOutputs
              .map(({ output, index }) => {
              const isVisible = filterId === 'all' || output.analysisId === filterId;
              const isCollapsed = collapsed.has(output.id);
              const title = output.analysisId
                ? analysisLabel(output.analysisId)
                : `${t('output.result')} ${index + 1}`;
              const stale = isOutputStale(output, {
                dataRevision: currentRevision,
                datasetId: currentDatasetId,
                filterSignature: currentFilterSignature,
                paramsSignature:
                  output.analysisId && paramsSignatureFor
                    ? paramsSignatureFor(output.analysisId)
                    : undefined,
                ciLevel: currentCiLevel,
              });
              return (
                <article
                  key={output.id}
                  id={`output-block-${output.id}`}
                  data-stale={stale ? 'true' : undefined}
                  className={`output-card min-w-0 scroll-mt-4 ${isVisible ? '' : 'hidden'}`}
                >
                  <header
                    className="flex items-center gap-2 border-b border-border bg-surface2/50 px-2.5 py-1.5"
                    data-no-print
                  >
                    <button
                      type="button"
                      onClick={() => toggle(output.id)}
                      aria-expanded={!isCollapsed}
                      aria-label={isCollapsed ? t('output.expand') : t('output.collapse')}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text3 hover:bg-border hover:text-text"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <span className="shrink-0 font-mono text-[9px] uppercase tracking-widest text-accent2">
                      {title}
                    </span>
                    {output.analysisId && (
                      <HelpButton topicId={topicForAnalysis(output.analysisId)} level="advanced" />
                    )}
                    <span className="shrink-0 font-mono text-[9px] text-text3">
                      {formatTime(output.createdAt)}
                    </span>
                    {stale && (
                      <span
                        className="shrink-0 rounded border border-yellow/30 bg-yellow/10 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-yellow"
                        title={t('output.staleTitle')}
                      >
                        {t('output.stale')}
                      </span>
                    )}
                    {output.title !== 'Analysis output' && (
                      <span className="ml-auto hidden min-w-0 truncate text-[10px] text-text3 xl:block">
                        {output.title}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => togglePin(output.id)}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text3 hover:bg-border hover:text-text"
                      title={pinned.has(output.id) ? t('output.unpinTitle') : t('output.pinTitle')}
                      aria-label={pinned.has(output.id) ? t('output.unpin') : t('output.pin')}
                    >
                      {pinned.has(output.id) ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => void copyCard(output)}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text3 hover:bg-border hover:text-text"
                      title={t('output.copyCardTitle')}
                      aria-label={t('output.copyCard')}
                    >
                      {copiedId === output.id ? <Check className="h-3 w-3 text-green" /> : <Copy className="h-3 w-3" />}
                    </button>
                    {output.analysisId && output.params !== undefined && onRerun && (
                      <button
                        type="button"
                        onClick={() => onRerun(output)}
                        className="tb-btn flex shrink-0 items-center gap-1 px-1.5 py-0.5 text-[10px]"
                        title={t('output.rerunTitle')}
                        aria-label={t('output.rerunAria')}
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span className="hidden xl:inline">{t('output.rerun')}</span>
                      </button>
                    )}
                    {output.analysisId && output.params !== undefined && onApplyParams && (
                      <button
                        type="button"
                        onClick={() => onApplyParams(output)}
                        className="tb-btn flex shrink-0 items-center gap-1 px-1.5 py-0.5 text-[10px]"
                        title={t('output.applyTitle')}
                        aria-label={t('output.applyAria')}
                      >
                        <ClipboardCheck className="h-3 w-3" />
                        <span className="hidden xl:inline">{t('output.apply')}</span>
                      </button>
                    )}
                    {output.analysisId && analysisMeta(output.analysisId) && onOpenAnalysis && (
                      <button
                        type="button"
                        onClick={() => onOpenAnalysis(output.analysisId as string)}
                        className="tb-btn flex shrink-0 items-center gap-1 px-1.5 py-0.5 text-[10px]"
                        title={t('output.setupTitle')}
                        aria-label={t('output.setupAria')}
                      >
                        <SlidersHorizontal className="h-3 w-3" />
                        <span className="hidden xl:inline">{t('output.setup')}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onRemove(index)}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text3 hover:bg-red hover:text-on-accent"
                      title={t('output.remove')}
                      aria-label={t('output.removeAria')}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </header>
                  <div className={isCollapsed ? 'hidden' : stale ? 'p-4 opacity-70' : 'p-4'}>
                    {output.session ? (
                        <AnalysisOutput
                          title={output.session.title}
                          header={output.session.header}
                          tables={output.session.tables}
                          report={output.session.report}
                          warnings={output.session.warnings}
                          callout={output.session.callout}
                          charts={output.session.charts ?? output.charts}
                          limitationsLabel={limitationsLabel}
                          analysisName={output.title}
                          onChartOptionsChange={(chartId, options) =>
                            onUpdateChart?.(output.id, chartId, options)
                          }
                        />
                      ) : (
                        <>
                          <div
                            className="restored-output"
                            dangerouslySetInnerHTML={{ __html: output.html }}
                          />
                          {output.charts && output.charts.length > 0 && (
                            <AnalysisCharts
                              charts={output.charts}
                              analysisName={output.title}
                              onOptionsChange={
                                onUpdateChart
                                  ? (chartId, options) => onUpdateChart(output.id, chartId, options)
                                  : undefined
                              }
                            />
                          )}
                          {((output.chartOverflow ?? 0) > 0 || (output.chartOmitted ?? 0) > 0) && (
                            <p className="mt-2 text-[10px] text-yellow">
                              {t('chart.notStored')}
                            </p>
                          )}
                        </>
                      )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
