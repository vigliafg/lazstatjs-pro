import { t } from '../../i18n';
import type { ChartOptions } from '../../stats/charts';
import { featuresFor } from '../../charts/features';
import {
  COMMON_DEFAULTS,
  DEFAULT_CHART_DEFAULTS,
  commonOptionsOf,
  factoryOptions,
  type ChartDefaults,
} from '../../charts/defaults';
import { makeChart } from '../../charts/kits/common';
import { ChartControls } from './ChartControls';

interface ChartDefaultsEditorProps {
  defaults: ChartDefaults;
  onChange: (defaults: ChartDefaults) => void;
}

/**
 * Settings → Charts. It reuses the same feature registry and renderer as the
 * per-card editor; the result is merged into every future run, never into
 * cards that already exist.
 */
export const ChartDefaultsEditor = ({ defaults, onChange }: ChartDefaultsEditorProps) => {
  const chart = makeChart({
    id: 'chart-defaults',
    kind: 'scatter',
    title: t('settings.charts'),
    data: { points: [{ x: 0, y: 0 }] },
    options: { ...COMMON_DEFAULTS, ...defaults } as never,
  });
  const features = featuresFor(chart).filter(feature => feature.group !== 'specific');
  const options = { ...factoryOptions('scatter'), ...defaults } as ChartOptions;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
        <ChartControls
          features={features}
          options={options}
          onChange={next => onChange(commonOptionsOf(next))}
        />
      </div>
      <button
        type="button"
        className="tb-btn px-3 py-1 text-[11px]"
        onClick={() => onChange({ ...DEFAULT_CHART_DEFAULTS })}
      >
        {t('settings.chartsReset')}
      </button>
    </div>
  );
};
