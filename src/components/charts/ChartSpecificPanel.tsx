import { t } from '../../i18n';
import type { AnalysisChart, ChartOptions } from '../../stats/charts';
import { ChartObjectPanel } from './ChartObjectPanel';

interface ChartSpecificPanelProps {
  chart: AnalysisChart;
  options: ChartOptions;
  onChange: (options: ChartOptions) => void;
  /** With ids resets one object; without ids resets every specific feature. */
  onReset: (featureIds?: string[]) => void;
}

/** Property panel: collapsible chart objects, with eyes for real toggles. */
export const ChartSpecificPanel = ({
  chart,
  options,
  onChange,
  onReset,
}: ChartSpecificPanelProps) => (
  <div className="flex flex-col gap-2">
    <p className="font-mono text-[9px] uppercase tracking-widest text-accent2">
      {`${t('chart.featuresFor')} ${chart.title}`}
    </p>
    <ChartObjectPanel
      chart={chart}
      options={options}
      onChange={onChange}
      onReset={featureIds => onReset(featureIds)}
    />
    <button
      type="button"
      className="tb-btn w-full px-2 py-1 text-[10px]"
      onClick={() => onReset()}
    >
      {t('chart.resetSection')}
    </button>
  </div>
);
