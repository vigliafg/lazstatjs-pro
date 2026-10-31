import type { AnalysisChart, ChartOptions } from '../../stats/charts';
import { featuresFor } from '../../charts/features';
import { ChartControls } from './ChartControls';
import { ChartPresetPicker } from './ChartPresetPicker';

interface ChartGeneralToolbarProps {
  chart: AnalysisChart;
  options: ChartOptions;
  onChange: (options: ChartOptions) => void;
}

/** Quick bar only: the full set of properties lives in the right-hand panel. */
const QUICK_FEATURES = new Set([
  'general.theme',
  'general.palette',
  'style.size',
]);

export const ChartGeneralToolbar = ({ chart, options, onChange }: ChartGeneralToolbarProps) => {
  const all = featuresFor(chart).filter(
    feature =>
      feature.group !== 'specific' &&
      QUICK_FEATURES.has(feature.id) &&
      (!feature.visible || feature.visible(options, chart))
  );

  return (
    <div className="sticky top-0 z-10 -mx-1 mb-2 border-b border-border bg-surface/95 px-1 pb-2 pt-1 backdrop-blur">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <ChartPresetPicker options={options} onChange={onChange} />
        <ChartControls features={all} options={options} onChange={onChange} chart={chart} />
      </div>
    </div>
  );
};
