import {
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Copy,
  Pin,
  PinOff,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import { analysisLabel, analysisMeta } from '../../analyses/registry';
import { AnalysisCharts } from '../../components/AnalysisCharts';
import { AnalysisOutput } from '../../components/AnalysisOutput';
import { HelpButton } from '../../help/HelpButton';
import { topicForAnalysis } from '../../help/book';
import { t } from '../../i18n';
import type { ChartOptions } from '../../stats/charts';
import { ExportMenu } from './ExportMenu';
import type { OutputEntry } from './types';

export interface RunReportCardProps {
  output: OutputEntry;
  /** Position in the unfiltered session, used by remove. */
  index: number;
  runNumber: number;
  stale: boolean;
  pinned: boolean;
  collapsed: boolean;
  copied: boolean;
  limitationsLabel?: string;
  canRerun: boolean;
  canApply: boolean;
  canSetup: boolean;
  onToggleCollapse: () => void;
  onTogglePin: () => void;
  onCopy: () => void;
  onRemove: () => void;
  onRerun?: () => void;
  onApplyParams?: () => void;
  onOpenAnalysis?: () => void;
  onExportHtml: () => void;
  onExportWord: () => void;
  onUpdateChart?: (entryId: string, chartId: string, options: ChartOptions) => void;
}

const formatTime = (iso: string): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/** One run-report: the unit that the outline indexes and that can be exported. */
export const RunReportCard = ({
  output,
  index,
  runNumber,
  stale,
  pinned,
  collapsed,
  copied,
  limitationsLabel,
  canRerun,
  canApply,
  canSetup,
  onToggleCollapse,
  onTogglePin,
  onCopy,
  onRemove,
  onRerun,
  onApplyParams,
  onOpenAnalysis,
  onExportHtml,
  onExportWord,
  onUpdateChart,
}: RunReportCardProps) => {
  const title = output.analysisId
    ? analysisLabel(output.analysisId)
    : `${t('output.result')} ${runNumber}`;
  const number = String(runNumber).padStart(2, '0');

  return (
    <article
      id={`output-block-${output.id}`}
      data-stale={stale ? 'true' : undefined}
      data-run-number={runNumber}
      className="output-card min-w-0 scroll-mt-4"
    >
      <header
        className="flex items-center gap-2 border-b border-border bg-surface2/50 px-2.5 py-1.5"
        data-no-print
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-expanded={!collapsed}
          aria-label={collapsed ? t('output.expand') : t('output.collapse')}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text3 hover:bg-border hover:text-text"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
        <span
          className="shrink-0 rounded border border-border2 bg-surface3 px-1 font-mono text-[9px] text-text3"
          title={`${t('output.runOne')} ${runNumber}`}
        >
          {number}
        </span>
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
          onClick={onTogglePin}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text3 hover:bg-border hover:text-text"
          title={pinned ? t('output.unpinTitle') : t('output.pinTitle')}
          aria-label={pinned ? t('output.unpin') : t('output.pin')}
        >
          {pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
        </button>
        <button
          type="button"
          onClick={onCopy}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text3 hover:bg-border hover:text-text"
          title={t('output.copyCardTitle')}
          aria-label={t('output.copyCard')}
        >
          {copied ? <Check className="h-3 w-3 text-green" /> : <Copy className="h-3 w-3" />}
        </button>
        <ExportMenu
          compact
          ariaLabel={t('output.exportRun')}
          label={t('output.exportRun')}
          items={[
            {
              label: t('output.exportHtml'),
              ariaLabel: t('output.runReportHtml'),
              onSelect: onExportHtml,
            },
            {
              label: t('output.exportWord'),
              ariaLabel: t('output.runReportWord'),
              onSelect: onExportWord,
            },
          ]}
        />
        {canRerun && onRerun && (
          <button
            type="button"
            onClick={onRerun}
            className="tb-btn flex shrink-0 items-center gap-1 px-1.5 py-0.5 text-[10px]"
            title={t('output.rerunTitle')}
            aria-label={t('output.rerunAria')}
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden xl:inline">{t('output.rerun')}</span>
          </button>
        )}
        {canApply && onApplyParams && (
          <button
            type="button"
            onClick={onApplyParams}
            className="tb-btn flex shrink-0 items-center gap-1 px-1.5 py-0.5 text-[10px]"
            title={t('output.applyTitle')}
            aria-label={t('output.applyAria')}
          >
            <ClipboardCheck className="h-3 w-3" />
            <span className="hidden xl:inline">{t('output.apply')}</span>
          </button>
        )}
        {canSetup && onOpenAnalysis && (
          <button
            type="button"
            onClick={onOpenAnalysis}
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
          onClick={onRemove}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text3 hover:bg-red hover:text-on-accent"
          title={t('output.remove')}
          aria-label={t('output.removeAria')}
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </header>
      <div className={collapsed ? 'hidden' : stale ? 'p-4 opacity-70' : 'p-4'}>
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
              <p className="mt-2 text-[10px] text-yellow">{t('chart.notStored')}</p>
            )}
          </>
        )}
      </div>
    </article>
  );
};
