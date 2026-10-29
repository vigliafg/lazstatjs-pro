import { useState } from 'react';
import { t } from '../i18n';
import type { AnalysisChart, ChartOptions } from '../stats/charts';
import { MAX_CHARTS_PER_OUTPUT } from '../stats/charts';
import { ChartCard } from './charts/ChartCard';

interface AnalysisChartsProps {
  charts?: AnalysisChart[];
  analysisName?: string;
  onOptionsChange?: (chartId: string, options: ChartOptions) => void;
}

/** Renders each chart as an editable card; beyond the cap it stays opt-in. */
export const AnalysisCharts = ({ charts, analysisName, onOptionsChange }: AnalysisChartsProps) => {
  const [showAll, setShowAll] = useState(false);
  if (!charts || charts.length === 0) return null;
  const visible = showAll ? charts : charts.slice(0, MAX_CHARTS_PER_OUTPUT);
  const hidden = charts.length - visible.length;

  return (
    <div className="mt-6 flex flex-wrap gap-4">
      {visible.map(chart => (
        <ChartCard
          key={chart.id}
          chart={chart}
          analysisName={analysisName}
          onOptionsChange={onOptionsChange}
          className={chart.layout === 'half' ? 'w-full lg:w-[calc(50%-0.5rem)]' : 'w-full'}
        />
      ))}
      {hidden > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded border border-border2 bg-surface2/60 p-2 text-[10px] text-text3">
          <span>{`${hidden} ${t('chart.overflow')}`}</span>
          <button type="button" className="tb-btn px-2 py-0.5 text-[10px]" onClick={() => setShowAll(true)}>
            {t('chart.showAll')}
          </button>
        </div>
      )}
    </div>
  );
};
