import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { t } from '../../i18n';
import type { AnalysisChart, ChartOptions } from '../../stats/charts';
import { mergeOptions } from '../../charts/defaults';
import { ChartEditorDialog } from './ChartEditorDialog';
import { VegaChart } from './VegaChart';

interface ChartCardProps {
  key?: string;
  chart: AnalysisChart;
  analysisName?: string;
  onOptionsChange?: (chartId: string, options: ChartOptions) => void;
  className?: string;
}

/**
 * A chart inside the report: rendered live by Vega-Lite and editable in place.
 * The model carries its own options so the card survives reload and `.lzs`.
 */
export const ChartCard = ({ chart, analysisName, onOptionsChange, className = '' }: ChartCardProps) => {
  const [editing, setEditing] = useState(false);
  const options = mergeOptions(chart.kind, chart.options);
  const interactive = Boolean(onOptionsChange);

  const open = () => {
    if (interactive) setEditing(true);
  };

  return (
    <section
      className={`output-chart mb-6 ${className}`}
      aria-label={chart.title}
      data-chart-id={chart.id}
    >
      <div
        className={`relative ${interactive ? 'cursor-pointer' : ''}`}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={interactive ? `${t('chart.edit')}: ${chart.title}` : chart.title}
        onClick={event => {
          if ((event.target as HTMLElement).closest('button')) return;
          open();
        }}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            open();
          }
        }}
      >
        <VegaChart chart={chart} options={options} />
        {interactive && (
          <button
            type="button"
            onClick={event => {
              event.stopPropagation();
              open();
            }}
            className="tb-btn absolute right-2 top-2 z-10 flex items-center gap-1 px-2 py-0.5 text-[10px] opacity-80 hover:opacity-100"
            title={`${t('chart.edit')}: ${chart.title}`}
            aria-label={`${t('chart.edit')}: ${chart.title}`}
          >
            <Pencil className="h-3 w-3" />
            <span>{t('chart.editShort')}</span>
          </button>
        )}
      </div>
      {options.showSubtitle === false && chart.subtitle && (
        <p className="mt-1 font-mono text-[9px] text-text3">{chart.subtitle}</p>
      )}
      {options.showNote && chart.note && <p className="mt-1 text-[10px] leading-snug text-text3">{chart.note}</p>}
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
        />
      )}
    </section>
  );
};
