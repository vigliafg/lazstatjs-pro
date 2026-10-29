import { t } from '../../i18n';
import type { AnalysisChart, ChartOptions } from '../../stats/charts';
import type { FeatureDescriptor } from '../../charts/features';

interface ChartControlsProps {
  features: FeatureDescriptor[];
  options: ChartOptions;
  onChange: (options: ChartOptions) => void;
  chart?: AnalysisChart;
}

const controlId = (feature: FeatureDescriptor): string =>
  `chart-feature-${feature.id.replace(/\./g, '-')}`;

/** The single renderer of a feature descriptor: toolbar and panel only compose. */
export const ChartControls = ({ features, options, onChange, chart }: ChartControlsProps) => (
  <>
    {features.map(feature => {
      const id = controlId(feature);
      const value = feature.get(options);
      const label = t(feature.labelKey);
      const choices = chart && feature.choicesFor ? feature.choicesFor(chart) : feature.choices;
      if (feature.type === 'checkbox') {
        return (
          <label key={feature.id} htmlFor={id} className="flex cursor-pointer items-center gap-1.5 text-[10px] text-text2">
            <input
              id={id}
              type="checkbox"
              checked={Boolean(value)}
              onChange={event => onChange(feature.set(options, event.target.checked))}
              className="accent-accent"
            />
            {label}
          </label>
        );
      }
      if (feature.type === 'select') {
        return (
          <label key={feature.id} htmlFor={id} className="flex items-center gap-1.5 text-[10px] text-text3">
            <span>{label}</span>
            <select
              id={id}
              value={String(value)}
              onChange={event => {
                const raw = event.target.value;
                const selected = choices?.find(item => String(item.value) === raw);
                onChange(feature.set(options, selected ? selected.value : raw));
              }}
              className="rounded border border-border2 bg-surface3 px-1.5 py-0.5 text-[10px] text-text2"
            >
              {(choices ?? []).map(item => (
                <option key={String(item.value)} value={String(item.value)}>
                  {t(item.labelKey)}
                </option>
              ))}
            </select>
          </label>
        );
      }
      const numeric = Number(value);
      return (
        <label key={feature.id} htmlFor={id} className="flex items-center gap-1.5 text-[10px] text-text3">
          <span className="whitespace-nowrap">{label}</span>
          <input
            id={id}
            type="range"
            min={feature.min ?? 0}
            max={feature.max ?? 1}
            step={feature.step ?? 1}
            value={Number.isFinite(numeric) ? numeric : feature.min ?? 0}
            onChange={event => onChange(feature.set(options, Number(event.target.value)))}
            className="h-1 w-20 accent-accent"
          />
          <span className="w-8 text-right font-mono text-[9px] text-text3">
            {Number.isFinite(numeric) ? Number(numeric.toFixed(2)) : ''}
          </span>
        </label>
      );
    })}
  </>
);
