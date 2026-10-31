import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { t, type MessageKey } from '../../i18n';
import {
  deriveChartTokens,
  type CustomTheme,
  type ThemeChartTokens,
  type ThemeDefinition,
  type ThemeTokens,
} from '../../theme';

const HEX = /^#[0-9a-f]{6}$/i;

const TOKEN_LABEL: Record<keyof ThemeTokens, MessageKey> = {
  bg: 'settings.themeToken.bg',
  surface: 'settings.themeToken.surface',
  surface2: 'settings.themeToken.surface2',
  surface3: 'settings.themeToken.surface3',
  border: 'settings.themeToken.border',
  border2: 'settings.themeToken.border2',
  accent: 'settings.themeToken.accent',
  accent2: 'settings.themeToken.accent2',
  onAccent: 'settings.themeToken.onAccent',
  onAccent2: 'settings.themeToken.onAccent2',
  green: 'settings.themeToken.green',
  yellow: 'settings.themeToken.yellow',
  red: 'settings.themeToken.red',
  purple: 'settings.themeToken.purple',
  text: 'settings.themeToken.text',
  text2: 'settings.themeToken.text2',
  text3: 'settings.themeToken.text3',
};

const CHART_LABEL: Record<Exclude<keyof ThemeChartTokens, 'palette'>, MessageKey> = {
  background: 'settings.themeChart.background',
  surface: 'settings.themeChart.surface',
  text: 'settings.themeChart.text',
  muted: 'settings.themeChart.muted',
  grid: 'settings.themeChart.grid',
  axis: 'settings.themeChart.axis',
};

const GROUPS: { id: string; labelKey: MessageKey; tokens: (keyof ThemeTokens)[] }[] = [
  {
    id: 'surfaces',
    labelKey: 'settings.themeGroupSurfaces',
    tokens: ['bg', 'surface', 'surface2', 'surface3'],
  },
  { id: 'borders', labelKey: 'settings.themeGroupBorders', tokens: ['border', 'border2'] },
  { id: 'text', labelKey: 'settings.themeGroupText', tokens: ['text', 'text2', 'text3'] },
  {
    id: 'accents',
    labelKey: 'settings.themeGroupAccents',
    tokens: ['accent', 'accent2', 'onAccent', 'onAccent2'],
  },
  {
    id: 'semantic',
    labelKey: 'settings.themeGroupSemantic',
    tokens: ['green', 'yellow', 'red', 'purple'],
  },
];

interface ColorFieldProps {
  key?: string;
  id: string;
  label: string;
  value: string;
  baseValue: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

const ColorField = ({
  id,
  label,
  value,
  baseValue,
  disabled = false,
  onChange,
}: ColorFieldProps) => {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const inputId = `theme-token-${id.replace(/[^a-z0-9-]/gi, '-')}`;
  return (
    <div
      className="flex items-center gap-1.5 text-[9px] text-text3"
      data-theme-token={id}
    >
      <label htmlFor={inputId} className="min-w-0 flex-1 truncate">
        {label}
      </label>
      <input
        type="color"
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={event => {
          setDraft(event.target.value);
          onChange(event.target.value);
        }}
        data-theme-color={id}
        className="h-6 w-8 shrink-0 cursor-pointer rounded border border-border2 bg-surface3 p-0.5 disabled:opacity-40"
      />
      <input
        id={inputId}
        type="text"
        value={draft}
        disabled={disabled}
        maxLength={7}
        spellCheck={false}
        onChange={event => {
          const next = event.target.value;
          setDraft(next);
          if (HEX.test(next)) onChange(next);
        }}
        onBlur={() => {
          if (!HEX.test(draft)) setDraft(value);
        }}
        data-theme-hex={id}
        className="w-[62px] rounded border border-border2 bg-surface3 px-1 py-0.5 font-mono text-[9px] uppercase text-text2 disabled:opacity-40"
      />
      <button
        type="button"
        className="shrink-0 rounded p-0.5 text-text3 hover:bg-surface3 hover:text-text disabled:opacity-30"
        disabled={disabled || value === baseValue}
        onClick={() => {
          setDraft(baseValue);
          onChange(baseValue);
        }}
        title={t('settings.themeResetRow')}
        aria-label={`${label} · ${t('settings.themeResetRow')}`}
      >
        <RotateCcw className="h-3 w-3" />
      </button>
    </div>
  );
};

interface ThemeTokenEditorProps {
  theme: CustomTheme;
  baseTheme: ThemeDefinition;
  deriveChart: boolean;
  onDeriveChange: (value: boolean) => void;
  onChange: (theme: CustomTheme) => void;
}

/** Token rows for the UI and the chart block. */
export const ThemeTokenEditor = ({
  theme,
  baseTheme,
  deriveChart,
  onDeriveChange,
  onChange,
}: ThemeTokenEditorProps) => {
  const updateToken = (key: keyof ThemeTokens, value: string) => {
    const tokens = { ...theme.tokens, [key]: value };
    onChange({
      ...theme,
      tokens,
      chart: deriveChart ? deriveChartTokens(tokens) : theme.chart,
    });
  };

  const updateChart = (
    key: Exclude<keyof ThemeChartTokens, 'palette'>,
    value: string
  ) => onChange({ ...theme, chart: { ...theme.chart, [key]: value } });

  const updatePalette = (index: number, value: string) => {
    const palette = [...theme.chart.palette];
    palette[index] = value;
    onChange({ ...theme, chart: { ...theme.chart, palette } });
  };

  const resetAll = () => {
    onChange({
      ...theme,
      tokens: { ...baseTheme.tokens },
      chart: deriveChart
        ? deriveChartTokens(baseTheme.tokens)
        : { ...baseTheme.chart, palette: [...baseTheme.chart.palette] },
    });
  };

  return (
    <div className="flex flex-col gap-2" data-theme-token-editor>
      {GROUPS.map(group => (
        <details key={group.id} open className="rounded border border-border2 bg-surface2/40">
          <summary className="cursor-pointer list-none px-2 py-1.5 font-mono text-[9px] uppercase tracking-wider text-text3">
            {t(group.labelKey)}
          </summary>
          <div className="flex flex-col gap-1 border-t border-border2/60 px-2 py-1.5">
            {group.tokens.map(token => (
              <ColorField
                key={token}
                id={token}
                label={t(TOKEN_LABEL[token])}
                value={theme.tokens[token]}
                baseValue={baseTheme.tokens[token]}
                onChange={value => updateToken(token, value)}
              />
            ))}
          </div>
        </details>
      ))}

      <details open className="rounded border border-border2 bg-surface2/40">
        <summary className="cursor-pointer list-none px-2 py-1.5 font-mono text-[9px] uppercase tracking-wider text-text3">
          {t('settings.themeGroupChart')}
        </summary>
        <div className="flex flex-col gap-1.5 border-t border-border2/60 px-2 py-1.5">
          <label className="flex cursor-pointer items-center gap-2 text-[10px] text-text2">
            <input
              type="checkbox"
              checked={deriveChart}
              onChange={event => onDeriveChange(event.target.checked)}
              className="accent-accent"
              data-theme-derive
            />
            {t('settings.themeDeriveChart')}
          </label>
          <p className="text-[9px] leading-relaxed text-text3">
            {t('settings.themeDeriveChartHint')}
          </p>
          {(Object.keys(CHART_LABEL) as (keyof typeof CHART_LABEL)[]).map(key => (
            <ColorField
              key={key}
              id={`chart-${key}`}
              label={t(CHART_LABEL[key])}
              value={theme.chart[key]}
              baseValue={baseTheme.chart[key]}
              disabled={deriveChart}
              onChange={value => updateChart(key, value)}
            />
          ))}
          <div className="mt-1 grid grid-cols-2 gap-1">
            {theme.chart.palette.map((colour, index) => (
              <ColorField
                key={`palette-${index}`}
                id={`palette-${index}`}
                label={t('settings.themePalette', { index: index + 1 })}
                value={colour}
                baseValue={baseTheme.chart.palette[index] ?? colour}
                disabled={deriveChart}
                onChange={value => updatePalette(index, value)}
              />
            ))}
          </div>
          <button
            type="button"
            className="tb-btn self-start px-2 py-0.5 text-[9px]"
            onClick={resetAll}
            data-theme-reset-all
          >
            {t('settings.themeResetAll')}
          </button>
        </div>
      </details>
    </div>
  );
};
