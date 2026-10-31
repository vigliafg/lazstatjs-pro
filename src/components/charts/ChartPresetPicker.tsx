import { useId, useState } from 'react';
import { BookmarkPlus } from 'lucide-react';
import { t } from '../../i18n';
import type { ChartOptions, CommonChartOptions } from '../../stats/charts';
import { applyPreset } from '../../charts/defaults';
import {
  MAX_CHART_PRESETS,
  MAX_CHART_PRESET_NAME,
  applyChartPreset,
  matchingChartPreset,
  presetNameExists,
  saveChartPreset,
} from '../../charts/presets';
import { useChartPresets } from './ChartPresetsProvider';

interface ChartPresetPickerProps {
  options: ChartOptions;
  onChange: (options: ChartOptions) => void;
}

const BUILT_INS: readonly CommonChartOptions['preset'][] = ['default', 'minimal', 'print'];

const BUILT_IN_LABEL: Record<CommonChartOptions['preset'], 'chart.preset.default' | 'chart.preset.minimal' | 'chart.preset.print'> = {
  default: 'chart.preset.default',
  minimal: 'chart.preset.minimal',
  print: 'chart.preset.print',
};

/**
 * Combined preset selector: the three built-ins plus the project's named
 * presets in the same control. Saving stores only the shared style options.
 */
export const ChartPresetPicker = ({ options, onChange }: ChartPresetPickerProps) => {
  const { presets, setPresets, available } = useChartPresets();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [invalid, setInvalid] = useState(false);
  const inputId = useId();

  const matching = matchingChartPreset(options, presets);
  const value = matching ? `custom:${matching.id}` : `builtin:${options.preset}`;
  const cleanName = name.trim().slice(0, MAX_CHART_PRESET_NAME);
  const duplicate = cleanName.length > 0 && presetNameExists(presets, cleanName);
  const atLimit = presets.length >= MAX_CHART_PRESETS && !duplicate;

  const select = (next: string) => {
    setSaving(false);
    setName('');
    setInvalid(false);
    if (next.startsWith('custom:')) {
      const preset = presets.find(item => item.id === next.slice('custom:'.length));
      if (preset) onChange(applyChartPreset(options, preset));
      return;
    }
    const builtIn = next.slice('builtin:'.length) as CommonChartOptions['preset'];
    if (BUILT_INS.includes(builtIn)) onChange(applyPreset(options, builtIn));
  };

  const openSave = () => {
    setSaving(true);
    setInvalid(false);
    setName(matching?.name ?? '');
  };

  const save = () => {
    if (!cleanName) {
      setInvalid(true);
      return;
    }
    if (presets.length >= MAX_CHART_PRESETS && !duplicate) {
      setInvalid(true);
      return;
    }
    setPresets(previous => saveChartPreset(previous, cleanName, options));
    setSaving(false);
    setName('');
    setInvalid(false);
  };

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5" data-chart-preset-picker>
      <label htmlFor={`${inputId}-select`} className="flex items-center gap-1.5 text-[10px] text-text3">
        <span className="whitespace-nowrap">{t('chart.feature.preset')}</span>
        <select
          id={`${inputId}-select`}
          data-chart-preset-select
          value={value}
          onChange={event => select(event.target.value)}
          className="max-w-[190px] rounded border border-border2 bg-surface3 px-1.5 py-0.5 text-[10px] text-text2"
        >
          <optgroup label={t('chart.preset.builtIn')}>
            {BUILT_INS.map(preset => (
              <option key={preset} value={`builtin:${preset}`}>
                {t(BUILT_IN_LABEL[preset])}
              </option>
            ))}
          </optgroup>
          {available && presets.length > 0 && (
            <optgroup label={t('chart.preset.customGroup')}>
              {presets.map(preset => (
                <option key={preset.id} value={`custom:${preset.id}`}>
                  {preset.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </label>
      {available && (
        <button
          type="button"
          className="tb-btn flex items-center gap-1 px-1.5 py-0.5 text-[9px]"
          onClick={openSave}
          title={t('chart.preset.save')}
          aria-label={t('chart.preset.save')}
          data-chart-preset-save
        >
          <BookmarkPlus className="h-3 w-3" aria-hidden="true" />
          {t('chart.preset.save')}
        </button>
      )}
      {available && saving && (
        <form
          className="flex basis-full flex-wrap items-center gap-1.5 border-t border-border2/60 pt-1.5"
          onSubmit={event => {
            event.preventDefault();
            save();
          }}
          onKeyDown={event => {
            if (event.key !== 'Escape') return;
            event.preventDefault();
            event.stopPropagation();
            setSaving(false);
            setName('');
            setInvalid(false);
          }}
        >
          <label htmlFor={inputId} className="text-[9px] text-text3">
            {t('chart.preset.name')}
          </label>
          <input
            id={inputId}
            autoFocus
            value={name}
            maxLength={MAX_CHART_PRESET_NAME}
            placeholder={t('chart.preset.namePlaceholder')}
            aria-invalid={invalid}
            onChange={event => {
              setName(event.target.value);
              setInvalid(false);
            }}
            className={`min-w-[140px] flex-1 rounded border bg-surface3 px-1.5 py-0.5 text-[10px] text-text ${
              invalid ? 'border-red' : 'border-border2'
            }`}
            data-chart-preset-name
          />
          <button
            type="submit"
            className="tb-btn px-2 py-0.5 text-[9px]"
            disabled={atLimit}
            title={atLimit ? t('chart.preset.limit') : undefined}
            data-chart-preset-save-confirm
          >
            {t('chart.preset.saveConfirm')}
          </button>
          <button
            type="button"
            className="tb-btn px-2 py-0.5 text-[9px]"
            onClick={() => {
              setSaving(false);
              setName('');
              setInvalid(false);
            }}
          >
            {t('chart.preset.cancel')}
          </button>
          {duplicate && (
            <p className="basis-full text-[9px] text-yellow" role="status" data-chart-preset-overwrite>
              {t('chart.preset.overwrite')}
            </p>
          )}
          {invalid && (
            <p className="basis-full text-[9px] text-red" role="alert" data-chart-preset-error>
              {atLimit ? t('chart.preset.limit') : t('chart.preset.nameRequired')}
            </p>
          )}
        </form>
      )}
    </div>
  );
};
