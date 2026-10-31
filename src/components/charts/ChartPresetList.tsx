import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { t } from '../../i18n';
import {
  MAX_CHART_PRESETS,
  MAX_CHART_PRESET_NAME,
  deleteChartPreset,
  presetNameExists,
  renameChartPreset,
  type ChartPreset,
} from '../../charts/presets';

interface ChartPresetListProps {
  presets: ChartPreset[];
  onChange: (presets: ChartPreset[]) => void;
}

const PresetRow = ({
  preset,
  presets,
  onChange,
}: {
  key?: string;
  preset: ChartPreset;
  presets: ChartPreset[];
  onChange: (presets: ChartPreset[]) => void;
}) => {
  const [name, setName] = useState(preset.name);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    setName(preset.name);
    setInvalid(false);
  }, [preset.name]);

  const commit = () => {
    const trimmed = name.trim().slice(0, MAX_CHART_PRESET_NAME);
    if (!trimmed || presetNameExists(presets, trimmed, preset.id)) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    if (trimmed !== preset.name) onChange(renameChartPreset(presets, preset.id, trimmed));
    setName(trimmed);
  };

  return (
    <li
      className="flex items-center gap-2 rounded border border-border2 bg-surface2/40 px-2 py-1.5"
      data-chart-preset-row={preset.id}
    >
      <input
        value={name}
        maxLength={MAX_CHART_PRESET_NAME}
        aria-label={t('chart.preset.rename')}
        aria-invalid={invalid}
        title={invalid ? t('chart.preset.renameInvalid') : undefined}
        onChange={event => {
          setName(event.target.value);
          setInvalid(false);
        }}
        onBlur={commit}
        onKeyDown={event => {
          if (event.key === 'Enter') {
            event.preventDefault();
            event.currentTarget.blur();
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            setName(preset.name);
            setInvalid(false);
          }
        }}
        className={`min-w-0 flex-1 rounded border bg-surface3 px-1.5 py-0.5 text-[11px] text-text ${
          invalid ? 'border-red' : 'border-border2'
        }`}
        data-chart-preset-name-input={preset.id}
      />
      <button
        type="button"
        className="rounded p-1 text-text3 hover:bg-red hover:text-on-accent"
        title={t('chart.preset.delete')}
        aria-label={t('chart.preset.delete')}
        onClick={() => {
          if (!window.confirm(t('chart.preset.deleteConfirm', { name: preset.name }))) return;
          onChange(deleteChartPreset(presets, preset.id));
        }}
        data-chart-preset-delete={preset.id}
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </li>
  );
};

/** Settings → Charts: rename and delete the project's named presets. */
export const ChartPresetList = ({ presets, onChange }: ChartPresetListProps) => (
  <div className="mt-4 border-t border-border2 pt-3" data-chart-preset-list>
    <div className="mb-2 flex flex-wrap items-baseline gap-2">
      <h3 className="font-mono text-[10px] uppercase tracking-wider text-text2">
        {t('settings.chartPresets')}
      </h3>
      <span className="font-mono text-[9px] text-text3">
        {t('chart.preset.count', { count: presets.length, max: MAX_CHART_PRESETS })}
      </span>
    </div>
    <p className="mb-2 text-[10px] leading-relaxed text-text3">
      {t('settings.chartPresetsHint')}
    </p>
    {presets.length === 0 ? (
      <p className="text-[10px] text-text3" data-chart-preset-empty>
        {t('settings.chartPresetsEmpty')}
      </p>
    ) : (
      <ul className="flex flex-col gap-1.5">
        {presets.map(preset => (
          <PresetRow
            key={preset.id}
            preset={preset}
            presets={presets}
            onChange={onChange}
          />
        ))}
      </ul>
    )}
  </div>
);
