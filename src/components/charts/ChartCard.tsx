import { useMemo, useState } from 'react';
import { Link2, Pencil } from 'lucide-react';
import { ToolbarButton } from '../ToolbarButton';
import { t } from '../../i18n';
import type { AnalysisChart, ChartOptions } from '../../stats/charts';
import { boxDisplayOf, mergeOptions } from '../../charts/defaults';
import { chartLinkable } from '../../charts/interaction';
import { ChartEditorDialog } from './ChartEditorDialog';
import { useChartLink } from './ChartLinkContext';
import { PredictionProfiler } from './PredictionProfiler';
import { VegaChart } from './VegaChart';

interface ChartCardProps {
  key?: string;
  chart: AnalysisChart;
  analysisName?: string;
  onOptionsChange?: (chartId: string, options: ChartOptions) => void;
  /** Chart editor: append a copy of this card to the run-report. */
  onChartInsert?: (chart: AnalysisChart) => void;
  className?: string;
  /**
   * Namespace for `data-chart-id` when the same model is also rendered
   * standalone. The panel uses its own id so DOM queries stay unambiguous;
   * editor callbacks still address the real chart id.
   */
  domIdPrefix?: string;
}

/**
 * A chart inside the report: rendered live by Vega-Lite and editable in place.
 * The model carries its own options so the card survives reload and `.lzs`.
 */
export const ChartCard = ({
  chart,
  analysisName,
  onOptionsChange,
  onChartInsert,
  className = '',
  domIdPrefix,
}: ChartCardProps) => {
  const [editing, setEditing] = useState(false);
  // Keep the option (and annotation) identity stable across parent renders so
  // the Vega view does not redraw its annotation layer unnecessarily.
  const options = useMemo(() => mergeOptions(chart.kind, chart.options), [chart.kind, chart.options]);
  const interactive = Boolean(onOptionsChange);
  // The analysis note describes the box (median line, whiskers): hide it for
  // the violin, where that wording would be wrong.
  const note =
    options.showNote && !(options.kind === 'box' && boxDisplayOf(options) === 'violin')
      ? chart.note
      : undefined;
  const link = useChartLink();
  const canLink = useMemo(() => chartLinkable(chart), [chart]);
  const linkable = Boolean(link?.linkMode && canLink && !link.exporting);
  const linkState =
    link && !link.exporting && canLink && (link.selection || link.hidden.length > 0)
      ? { keys: link.selection?.keys ?? [], hidden: link.hidden }
      : undefined;

  const open = () => {
    if (interactive) setEditing(true);
  };

  return (
    <section
      className={`output-chart mb-6 min-w-0 ${className}`}
      aria-label={chart.title}
      data-chart-id={domIdPrefix ? `${domIdPrefix}:${chart.id}` : chart.id}
    >
      <div
        className={`relative ${interactive ? 'cursor-pointer' : ''}`}
        onClick={event => {
          if ((event.target as HTMLElement).closest('button')) return;
          open();
        }}
      >
        <VegaChart
          chart={chart}
          options={options}
          link={linkState}
          interaction={
            linkable && link
              ? {
                  tool: link.tool,
                  onSelect: (keys, kind) => link.select(chart.id, kind, keys),
                  onClear: link.clearSelection,
                }
              : undefined
          }
        />
        {link?.linkMode && !link.exporting && (
          <span
            data-no-export
            data-chart-link={linkable ? 'ready' : 'none'}
            role="note"
            title={
              linkable ? t('chart.link.availableHint') : t('chart.link.unavailableHint')
            }
            aria-label={
              linkable ? t('chart.link.availableHint') : t('chart.link.unavailableHint')
            }
            className={`absolute left-2 top-2 z-10 flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider ${
              linkable
                ? 'border-accent/60 bg-accent/15 text-accent2'
                : 'border-border2 bg-surface3 text-text2'
            }`}
          >
            <Link2 className="h-3 w-3" aria-hidden="true" />
            {linkable ? t('chart.link.available') : t('chart.link.unavailable')}
          </span>
        )}
        {interactive && (
          <ToolbarButton
            icon={Pencil}
            label={t('chart.editShort')}
            size="sm"
            labelVisibility="always"
            className="absolute right-2 top-2 z-10 px-2 py-0.5 opacity-80 hover:opacity-100"
            onClick={event => {
              event.stopPropagation();
              open();
            }}
            title={`${t('chart.edit')}: ${chart.title}`}
            aria-label={`${t('chart.edit')}: ${chart.title}`}
          />
        )}
      </div>
      {chart.kind === 'surface' && <PredictionProfiler chart={chart} />}
      {note && <p className="mt-1 text-[10px] leading-snug text-text3">{note}</p>}
      {chart.sampled && <p className="mt-1 font-mono text-[9px] text-yellow">{t('chart.sampled')}</p>}
      {editing && interactive && (
        <ChartEditorDialog
          chart={chart}
          initialOptions={options}
          analysisName={analysisName}
          onDone={next => {
            onOptionsChange?.(chart.id, next);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
          {...(onChartInsert ? { onInsert: onChartInsert } : {})}
        />
      )}
    </section>
  );
};
