import {
  Copy,
  Database,
  Image,
  RotateCcw,
  Table2,
  Trash2,
} from 'lucide-react';
import { analysisLabel } from '../../analyses/registry';
import { t } from '../../i18n';

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
}

const actionClass =
  'tb-btn flex items-center gap-1 px-2 py-0.5 text-[10px] disabled:cursor-not-allowed';

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
}: SessionReportToolbarProps) => (
  <div
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
    <button
      type="button"
      className={actionClass}
      onClick={onRerunAll}
      disabled={disabled}
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
      onClick={onClear}
      disabled={disabled}
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
      disabled={disabled}
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
      disabled={disabled}
      title={t('output.chartsHint')}
      aria-label={t('output.chartsHint')}
    >
      <Image className="h-3 w-3" />
      <span className="hidden xl:inline">{t('output.charts')}</span>
    </button>
    <button
      type="button"
      className={`${actionClass} ml-auto`}
      onClick={onExportXlsx}
      disabled={disabled}
      title={t('output.xlsxHint')}
      aria-label={t('output.xlsxHint')}
    >
      <Table2 className="h-3 w-3" />
      <span className="hidden xl:inline">{t('output.xlsx')}</span>
    </button>
  </div>
);
