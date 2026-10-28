import { useEffect, useState, type ReactNode } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Database,
  FileCode2,
  FileText,
  Image,
  SlidersHorizontal,
  Table2,
  Trash2,
} from 'lucide-react';
import { analysisLabel, analysisMeta } from '../analyses/registry';
import { sanitizeOutputHtml, type StoredOutput } from '../io/outputs';

/** Un blocco della console: React live nella sessione, HTML quando ripristinato. */
export interface OutputEntry extends StoredOutput {
  node?: ReactNode;
  /** In-session revision of the grid that produced the block. */
  dataRevision?: number;
  /** In-session dataset identity. */
  datasetId?: string;
  /** Signature of the analysis row filter used for the run. */
  filterSignature?: string;
}

/** I blocchi ripristinati sono statici: sanificati una volta e iniettati. */
export const restoredOutputs = (stored: StoredOutput[] | undefined): OutputEntry[] =>
  (stored ?? [])
    .map((entry) => ({ ...entry, html: sanitizeOutputHtml(entry.html) }))
    .filter((entry) => entry.html.length > 0);

export interface OutputConsoleProps {
  outputs: OutputEntry[];
  onRemove: (index: number) => void;
  onClear: () => void;
  onCopy: () => void;
  onExportCharts: () => void;
  onExportReport: () => void;
  onExportXlsx: () => void;
  onBackToData: () => void;
  onOpenAnalysis?: (analysisId: string) => void;
  currentRevision?: number;
  currentDatasetId?: string;
  currentFilterSignature?: string;
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
  return `Result ${index + 1}`;
};

const actionClass =
  'tb-btn flex items-center gap-1 px-2 py-0.5 text-[10px] disabled:cursor-not-allowed';

/**
 * Output document: one card per run, with an outline that stays visible while
 * the user reads, collapses or removes blocks.
 */
export const OutputConsole = ({
  outputs,
  onRemove,
  onClear,
  onCopy,
  onExportCharts,
  onExportReport,
  onExportXlsx,
  onBackToData,
  onOpenAnalysis,
  currentRevision,
  currentDatasetId,
  currentFilterSignature,
}: OutputConsoleProps) => {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const lastId = outputs.length > 0 ? outputs[outputs.length - 1].id : null;
  const [activeId, setActiveId] = useState<string | null>(lastId);

  useEffect(() => {
    setActiveId(lastId);
  }, [lastId]);

  const toggle = (id: string) => {
    setCollapsed(previous => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
    <div className="flex h-full min-h-0 w-full flex-col bg-bg">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border bg-surface px-3 py-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="h-3.5 w-3.5 shrink-0 text-accent2" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-text3">
            Output
          </span>
          <span className="rounded border border-border2 bg-surface3 px-1.5 py-0.5 font-mono text-[9px] text-text3">
            {outputs.length} run{outputs.length === 1 ? '' : 's'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            className={actionClass}
            onClick={onBackToData}
            title="Open the data editor"
            aria-label="Open the data editor"
          >
            <Database className="h-3 w-3" />
            <span className="hidden xl:inline">Data</span>
          </button>
          <button
            type="button"
            className={actionClass}
            onClick={onClear}
            disabled={outputs.length === 0}
            title="Clear every result block"
            aria-label="Clear every result block"
          >
            <Trash2 className="h-3 w-3" />
            <span className="hidden xl:inline">Clear</span>
          </button>
          <button
            type="button"
            className={actionClass}
            onClick={onCopy}
            disabled={outputs.length === 0}
            title="Copy the output as text"
            aria-label="Copy the output as text"
          >
            <Copy className="h-3 w-3" />
            <span className="hidden xl:inline">Copy</span>
          </button>
          <button
            type="button"
            className={actionClass}
            onClick={onExportCharts}
            disabled={outputs.length === 0}
            title="Download every chart as PNG"
            aria-label="Download every chart as PNG"
          >
            <Image className="h-3 w-3" />
            <span className="hidden xl:inline">Charts</span>
          </button>
          <button
            type="button"
            className={actionClass}
            onClick={onExportReport}
            disabled={outputs.length === 0}
            title="Download a printable HTML report"
            aria-label="Download a printable HTML report"
          >
            <FileCode2 className="h-3 w-3" />
            <span className="hidden xl:inline">Report</span>
          </button>
          <button
            type="button"
            className={actionClass}
            onClick={onExportXlsx}
            disabled={outputs.length === 0}
            title="Download the dataset and result tables as Excel"
            aria-label="Download the dataset and result tables as Excel"
          >
            <Table2 className="h-3 w-3" />
            <span className="hidden xl:inline">XLSX</span>
          </button>
        </div>
      </div>

      {outputs.length > 0 && (
        <div
          className="flex shrink-0 items-center gap-1 overflow-x-auto scrollbar border-b border-border bg-surface/70 px-2 py-1.5"
          data-no-print
        >
          <span className="shrink-0 pr-1 font-mono text-[8px] uppercase tracking-[0.18em] text-text3">
            Outline
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

      <div id="output-content" className="scrollbar min-h-0 flex-1 overflow-auto bg-bg p-4">
        {outputs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-text3 opacity-70">
            <FileText className="h-10 w-10" />
            <p className="font-mono text-[11px] uppercase tracking-widest">No analysis output yet</p>
            <p className="max-w-xs text-center text-[10px] leading-relaxed">
              Choose a procedure from the library, set the variables, then run it.
            </p>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
            {outputs.map((output, index) => {
              const isCollapsed = collapsed.has(output.id);
              const title = output.analysisId
                ? analysisLabel(output.analysisId)
                : `Result ${index + 1}`;
              const stale =
                (output.dataRevision !== undefined &&
                  currentRevision !== undefined &&
                  output.dataRevision !== currentRevision) ||
                (output.datasetId !== undefined &&
                  currentDatasetId !== undefined &&
                  output.datasetId !== currentDatasetId) ||
                (output.filterSignature !== undefined &&
                  currentFilterSignature !== undefined &&
                  output.filterSignature !== currentFilterSignature);
              return (
                <article
                  key={output.id}
                  id={`output-block-${output.id}`}
                  className="output-card scroll-mt-4"
                >
                  <header
                    className="flex items-center gap-2 border-b border-border bg-surface2/50 px-2.5 py-1.5"
                    data-no-print
                  >
                    <button
                      type="button"
                      onClick={() => toggle(output.id)}
                      aria-expanded={!isCollapsed}
                      aria-label={isCollapsed ? 'Expand result' : 'Collapse result'}
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
                    <span className="shrink-0 font-mono text-[9px] text-text3">
                      {formatTime(output.createdAt)}
                    </span>
                    {stale && (
                      <span
                        className="shrink-0 rounded border border-yellow/30 bg-yellow/10 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-yellow"
                        title="The grid changed after this result was produced"
                      >
                        stale
                      </span>
                    )}
                    {output.title !== 'Analysis output' && (
                      <span className="ml-auto hidden min-w-0 truncate text-[10px] text-text3 xl:block">
                        {output.title}
                      </span>
                    )}
                    {output.analysisId && analysisMeta(output.analysisId) && onOpenAnalysis && (
                      <button
                        type="button"
                        onClick={() => onOpenAnalysis(output.analysisId as string)}
                        className="tb-btn flex shrink-0 items-center gap-1 px-1.5 py-0.5 text-[10px]"
                        title="Open the setup of this analysis"
                        aria-label="Open the setup of this analysis"
                      >
                        <SlidersHorizontal className="h-3 w-3" />
                        <span className="hidden xl:inline">Setup</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onRemove(index)}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text3 hover:bg-red hover:text-white"
                      title="Remove this result"
                      aria-label="Remove this result block"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </header>
                  <div className={isCollapsed ? 'hidden' : stale ? 'p-4 opacity-70' : 'p-4'}>
                    {output.node ?? (
                      <div
                        className="restored-output"
                        dangerouslySetInnerHTML={{ __html: output.html }}
                      />
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
