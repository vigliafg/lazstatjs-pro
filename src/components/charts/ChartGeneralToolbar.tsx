import { t } from '../../i18n';
import type { AnalysisChart, ChartOptions } from '../../stats/charts';
import { featuresFor, prominentFeatures } from '../../charts/features';
import { ChartControls } from './ChartControls';

interface ChartGeneralToolbarProps {
  chart: AnalysisChart;
  options: ChartOptions;
  onChange: (options: ChartOptions) => void;
}

/**
 * Sticky top toolbar: frequent choices stay inline, the rest live in the same
 * disclosure pattern used by the analysis forms (`<details>` + fieldset).
 */
export const ChartGeneralToolbar = ({ chart, options, onChange }: ChartGeneralToolbarProps) => {
  const all = featuresFor(chart).filter(
    feature =>
      feature.group !== 'specific' &&
      (!feature.visible || feature.visible(options, chart))
  );
  const prominent = new Set(prominentFeatures(chart).map(feature => feature.id));
  const secondary = all.filter(feature => !prominent.has(feature.id));

  return (
    <div className="sticky top-0 z-10 -mx-1 mb-2 border-b border-border bg-surface/95 px-1 pb-2 pt-1 backdrop-blur">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <ChartControls features={all.filter(feature => prominent.has(feature.id))} options={options} onChange={onChange} chart={chart} />
      </div>
      {secondary.length > 0 && (
        <details className="mt-1.5">
          <summary className="cursor-pointer font-mono text-[9px] uppercase tracking-wider text-accent2">
            {t('chart.moreStyle')}
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 rounded border border-border2 bg-surface2/60 p-2 md:grid-cols-3">
            <ChartControls features={secondary} options={options} onChange={onChange} chart={chart} />
          </div>
        </details>
      )}
    </div>
  );
};
