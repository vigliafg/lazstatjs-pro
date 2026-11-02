import { useState } from 'react';
import { t } from '../i18n';
import type { AnalysisChart, ChartOptions, PanelChart } from '../stats/charts';
import { MAX_CHARTS_PER_OUTPUT } from '../stats/charts';
import { ChartCard } from './charts/ChartCard';
import { PanelCard } from './charts/PanelCard';

interface AnalysisChartsProps {
  charts?: AnalysisChart[];
  /** L3 composite cards rendered after the individual charts. */
  panels?: PanelChart[];
  analysisName?: string;
  onOptionsChange?: (chartId: string, options: ChartOptions) => void;
  /** Chart editor: append a copy of a chart to this run-report. */
  onChartInsert?: (chart: AnalysisChart) => void;
}

/** Renders each chart as an editable card; beyond the cap it stays opt-in. */
export const AnalysisCharts = ({
  charts,
  panels,
  analysisName,
  onOptionsChange,
  onChartInsert,
}: AnalysisChartsProps) => {
  const [showAll, setShowAll] = useState(false);
  const chartList = charts ?? [];
  const panelList = panels ?? [];
  if (chartList.length === 0 && panelList.length === 0) return null;
  const visible = showAll ? chartList : chartList.slice(0, MAX_CHARTS_PER_OUTPUT);
  const hidden = chartList.length - visible.length;
  const total = chartList.length + panelList.length;

  return (
    <div className="mt-6 flex flex-wrap gap-4">
      <div className="w-full font-mono text-[9px] uppercase tracking-wider text-text3">
        {total} {t('analysis.chartCount')}
      </div>
      {visible.map(chart => (
        <ChartCard
          key={chart.id}
          chart={chart}
          analysisName={analysisName}
          onOptionsChange={onOptionsChange}
          onChartInsert={onChartInsert}
          className={chart.layout === 'half' ? 'w-full lg:w-[calc(50%-0.5rem)]' : 'w-full'}
        />
      ))}
      {panelList.map(panel => (
        <PanelCard
          key={panel.id}
          panel={panel}
          analysisName={analysisName}
          onOptionsChange={onOptionsChange}
          onChartInsert={onChartInsert}
          className="w-full"
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
