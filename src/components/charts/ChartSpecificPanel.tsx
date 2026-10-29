import { Fragment } from 'react';
import { t } from '../../i18n';
import type { AnalysisChart, ChartOptions } from '../../stats/charts';
import { specificFeatures } from '../../charts/features';
import { ChartControls } from './ChartControls';

interface ChartSpecificPanelProps {
  chart: AnalysisChart;
  options: ChartOptions;
  onChange: (options: ChartOptions) => void;
  onReset: () => void;
}

/** Procedure-specific options, grouped by responsibility. */
export const ChartSpecificPanel = ({ chart, options, onChange, onReset }: ChartSpecificPanelProps) => {
  const features = specificFeatures(chart).filter(
    feature => !feature.visible || feature.visible(options, chart)
  );
  if (features.length === 0) {
    return (
      <p className="rounded border border-border2 bg-surface2/60 p-3 text-[10px] text-text3">
        {t('chart.noSpecific')}
      </p>
    );
  }

  const sections = new Map<string, typeof features>();
  features.forEach(feature => {
    const key = feature.section ? t(feature.section) : t('chart.section.options');
    sections.set(key, [...(sections.get(key) ?? []), feature]);
  });

  return (
    <div className="space-y-3">
      <p className="font-mono text-[9px] uppercase tracking-widest text-accent2">
        {`${t('chart.featuresFor')} ${chart.title}`}
      </p>
      {Array.from(sections.entries()).map(([title, group]) => (
        <fieldset key={title} className="rounded border border-border2 bg-surface2/50 p-2">
          <legend className="px-1 font-mono text-[9px] uppercase tracking-wider text-text3">{title}</legend>
          <div className="grid gap-1.5">
            {group.map(feature => (
              <Fragment key={feature.id}>
                <ChartControls features={[feature]} options={options} onChange={onChange} chart={chart} />
              </Fragment>
            ))}
          </div>
        </fieldset>
      ))}
      <button type="button" className="tb-btn w-full px-2 py-1 text-[10px]" onClick={onReset}>
        {t('chart.resetSection')}
      </button>
    </div>
  );
};
