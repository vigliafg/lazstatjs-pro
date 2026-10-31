import { AlertTriangle, FileText, PanelLeft } from 'lucide-react';
import { ToolbarButton } from '../../components/ToolbarButton';
import { t } from '../../i18n';
import { ExportMenu } from './ExportMenu';
import type { SessionReportMeta } from './types';

interface SessionReportHeaderProps {
  meta: SessionReportMeta;
  runs: number;
  stale: number;
  warnings: number;
  /** Below the container breakpoint the outline lives in a drawer. */
  narrow: boolean;
  outlineOpen: boolean;
  onToggleOutline: () => void;
  onExportHtml: () => void;
  onExportWord: () => void;
}

const MetaItem = ({ label, value }: { label: string; value: string }) => (
  <span className="flex min-w-0 items-baseline gap-1">
    <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.14em] text-text3">
      {label}
    </span>
    <span className="truncate font-mono text-[10px] text-text2" title={value}>
      {value}
    </span>
  </span>
);

/**
 * Identity of the whole session-report: dataset, row filter, number of runs
 * and the aggregate freshness. It stays pinned above the stack and is kept in
 * the printed session export.
 */
export const SessionReportHeader = ({
  meta,
  runs,
  stale,
  warnings,
  narrow,
  outlineOpen,
  onToggleOutline,
  onExportHtml,
  onExportWord,
}: SessionReportHeaderProps) => {
  const filter = meta.filterLabel
    ? `${meta.filterLabel} · ${
        meta.filterAffectsAnalysis ? t('data.alsoFilter') : t('data.viewOnly')
      }`
    : t('output.sessionFilterNone');
  const rows =
    meta.rows === meta.totalRows ? String(meta.rows) : `${meta.rows}/${meta.totalRows}`;

  return (
    <header
      data-session-header
      className="sticky top-0 z-20 border-b border-border bg-surface/95 px-3 py-2 backdrop-blur"
    >
      <div className="flex flex-wrap items-center gap-2">
        <FileText className="h-3.5 w-3.5 shrink-0 text-accent2" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-text">
          {t('output.sessionReport')}
        </span>
        <span className="rounded border border-border2 bg-surface3 px-1.5 py-0.5 font-mono text-[9px] text-text3">
          {runs} {runs === 1 ? t('output.runOne') : t('output.runMany')}
        </span>
        {stale > 0 && (
          <span
            className="flex items-center gap-1 rounded border border-yellow/30 bg-yellow/10 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-yellow"
            title={t('output.staleTitle')}
          >
            <AlertTriangle className="h-2.5 w-2.5" />
            {stale} {t('output.sessionStale')}
          </span>
        )}
        {warnings > 0 && (
          <span className="rounded border border-accent2/30 bg-accent2/10 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-accent2">
            {warnings} {t('output.outlineWarning')}
          </span>
        )}
        <div className="ml-auto flex items-center gap-1" data-no-print>
          {narrow && (
            <ToolbarButton
              icon={PanelLeft}
              label={t('output.outlineToggle')}
              size="sm"
              labelVisibility="always"
              className="px-2 py-0.5"
              onClick={onToggleOutline}
              aria-expanded={outlineOpen}
              aria-label={t('output.outlineToggle')}
              title={t('output.outlineToggle')}
            />
          )}
          <ExportMenu
            ariaLabel={t('output.exportSession')}
            label={t('output.exportSession')}
            items={[
              {
                label: t('output.exportHtml'),
                ariaLabel: t('output.reportHint'),
                onSelect: onExportHtml,
              },
              {
                label: t('output.exportWord'),
                ariaLabel: t('output.wordHint'),
                onSelect: onExportWord,
              },
            ]}
          />
        </div>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
        {meta.datasetId && <MetaItem label={t('output.sessionDataset')} value={meta.datasetId} />}
        <MetaItem label={t('output.sessionRows')} value={rows} />
        <MetaItem label={t('output.sessionColumns')} value={String(meta.columns)} />
        <MetaItem label={t('output.sessionFilter')} value={filter} />
        <MetaItem label={t('output.sessionAnalyses')} value={String(meta.analyses)} />
        <MetaItem label={t('output.ci')} value={`${meta.ciLevel}%`} />
      </div>
    </header>
  );
};
