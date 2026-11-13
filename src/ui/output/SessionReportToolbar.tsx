import {
  ChartScatter,
  Copy,
  Database,
  Filter,
  Image,
  Link2,
  RotateCcw,
  Table2,
  Trash2,
  Unlink,
  X,
} from 'lucide-react';
import { analysisLabel } from '../../analyses/registry';
import { ToolbarButton } from '../../components/ToolbarButton';
import { t } from '../../i18n';
import type { LinkTool } from '../../components/charts/ChartLinkContext';

interface SessionReportToolbarProps {
  analysisIds: readonly string[];
  filterId: string;
  onFilterChange: (id: string) => void;
  disabled: boolean;
  onRerunAll: () => void;
  onBackToData: () => void;
  onClear: () => void;
  onCopy: () => void;
  onExportCharts: () => void;
  onExportXlsx: () => void;
  linkMode: boolean;
  linkTool: LinkTool;
  linkCount: number;
  hiddenCount: number;
  onToggleLink: () => void;
  onLinkTool: (tool: LinkTool) => void;
  onClearLink: () => void;
  onOpenFilter: () => void;
  onOpenBuilder: () => void;
}

const actionClass =
  'px-2 disabled:cursor-not-allowed';

/**
 * Reading and export actions for the whole session. The analysis filter stays
 * here because it only hides cards that match a different procedure.
 */
export const SessionReportToolbar = ({
  analysisIds,
  filterId,
  onFilterChange,
  disabled,
  onRerunAll,
  onBackToData,
  onClear,
  onCopy,
  onExportCharts,
  onExportXlsx,
  linkMode,
  linkTool,
  linkCount,
  hiddenCount,
  onToggleLink,
  onLinkTool,
  onClearLink,
  onOpenFilter,
  onOpenBuilder,
}: SessionReportToolbarProps) => (
  <div
    data-button-group="output"
    className="flex flex-wrap items-center gap-1 border-b border-border bg-surface/70 px-1 py-1.5"
    data-no-print
  >
    {analysisIds.length > 1 && (
      <select
        aria-label={t('output.filterBy')}
        value={filterId}
        onChange={event => onFilterChange(event.target.value)}
        className="mr-1 rounded border border-border2 bg-surface3 px-1.5 py-0.5 text-[10px] text-text2"
      >
        <option value="all">{t('output.allAnalyses')}</option>
        {analysisIds.map(id => (
          <option key={id} value={id}>
            {analysisLabel(id)}
          </option>
        ))}
      </select>
    )}
    <ToolbarButton
      icon={linkMode ? Unlink : Link2}
      label={t('chart.link.mode')}
      size="sm"
      labelVisibility="2xl"
      className={linkMode ? 'px-2 bg-accent2/15 text-accent2' : actionClass}
      onClick={onToggleLink}
      title={t('chart.link.modeTitle')}
      aria-label={t('chart.link.modeTitle')}
      aria-pressed={linkMode}
    />
    {linkMode && (
      <select
        aria-label={t('chart.link.tool')}
        value={linkTool}
        onChange={event => onLinkTool(event.target.value as LinkTool)}
        className="rounded border border-border2 bg-surface3 px-1.5 py-0.5 text-[10px] text-text2"
      >
        <option value="brush">{t('chart.link.brush')}</option>
        <option value="lasso">{t('chart.link.lasso')}</option>
      </select>
    )}
    {linkCount > 0 && (
      <>
        <span
          className="font-mono text-[9px] text-accent2"
          data-link-count
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {linkCount} {t('chart.link.selected')}
        </span>
        <button
          type="button"
          className="flex h-5 w-5 items-center justify-center rounded text-text3 hover:bg-border hover:text-text"
          onClick={onClearLink}
          title={t('chart.link.clear')}
          aria-label={t('chart.link.clear')}
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      </>
    )}
    {hiddenCount > 0 && (
      <span
        className="font-mono text-[9px] text-text3"
        data-hidden-count
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {hiddenCount} {t('chart.link.hidden')}
      </span>
    )}
    <ToolbarButton
      icon={Filter}
      label={t('filter.open')}
      size="sm"
      labelVisibility="2xl"
      className={actionClass}
      onClick={onOpenFilter}
      title={t('filter.openTitle')}
      aria-label={t('filter.openTitle')}
    />
    <ToolbarButton
      icon={ChartScatter}
      label={t('builder.open')}
      size="sm"
      labelVisibility="2xl"
      className={actionClass}
      onClick={onOpenBuilder}
      title={t('builder.openTitle')}
      aria-label={t('builder.openTitle')}
    />
    <ToolbarButton
      icon={RotateCcw}
      label={t('output.rerunAll')}
      size="sm"
      labelVisibility="2xl"
      className={actionClass}
      onClick={onRerunAll}
      disabled={disabled}
      title={t('output.rerunAllHint')}
      aria-label={t('output.rerunAllHint')}
    />
    <ToolbarButton
      icon={Database}
      label={t('output.data')}
      size="sm"
      labelVisibility="xl"
      className={actionClass}
      onClick={onBackToData}
      title={t('output.openDataTitle')}
      aria-label={t('output.openDataTitle')}
    />
    <ToolbarButton
      icon={Trash2}
      label={t('output.clear')}
      group="output"
      size="sm"
      labelVisibility="xl"
      className={actionClass}
      onClick={onClear}
      disabled={disabled}
      title={t('output.clearAll')}
      aria-label={t('output.clearAll')}
    />
    <ToolbarButton
      icon={Copy}
      label={t('output.copy')}
      group="output"
      size="sm"
      labelVisibility="xl"
      className={actionClass}
      onClick={onCopy}
      disabled={disabled}
      title={t('output.copyText')}
      aria-label={t('output.copyText')}
    />
    <ToolbarButton
      icon={Image}
      label={t('output.charts')}
      group="output"
      size="sm"
      labelVisibility="xl"
      className={actionClass}
      onClick={onExportCharts}
      disabled={disabled}
      title={t('output.chartsHint')}
      aria-label={t('output.chartsHint')}
    />
    <ToolbarButton
      icon={Table2}
      label={t('output.xlsx')}
      group="output"
      size="sm"
      labelVisibility="xl"
      className={`${actionClass} ml-auto`}
      onClick={onExportXlsx}
      disabled={disabled}
      title={t('output.xlsxHint')}
      aria-label={t('output.xlsxHint')}
    />
  </div>
);
