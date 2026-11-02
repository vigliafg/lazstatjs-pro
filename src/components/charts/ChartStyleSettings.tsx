import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { Trash2 } from 'lucide-react';
import { t } from '../../i18n';
import { CHART_KINDS } from '../../stats/charts';
import {
  MAX_USER_CHART_STYLE_NAME,
  MAX_USER_CHART_STYLES,
  deleteUserStyle,
  hasStyleGallery,
  renameUserStyle,
  resolvedStyle,
  stylesFor,
  type UserChartStyle,
} from '../../charts/styles';
import type {
  ChartStyleDefaults,
} from './ChartPresetsProvider';
import { chartKindLabel } from './chartKindLabel';

interface ChartStyleSettingsProps {
  styles: UserChartStyle[];
  setStyles: Dispatch<SetStateAction<UserChartStyle[]>>;
  defaults: ChartStyleDefaults;
  setDefaults: Dispatch<SetStateAction<ChartStyleDefaults>>;
}

const StyleRow = ({
  style,
  styles,
  setStyles,
}: {
  key?: string;
  style: UserChartStyle;
  styles: UserChartStyle[];
  setStyles: Dispatch<SetStateAction<UserChartStyle[]>>;
}) => {
  const [name, setName] = useState(style.name);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    setName(style.name);
    setInvalid(false);
  }, [style.name]);

  const commit = () => {
    const trimmed = name.trim().slice(0, MAX_USER_CHART_STYLE_NAME);
    if (!trimmed) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    if (trimmed !== style.name) setStyles(renameUserStyle(styles, style.id, trimmed));
    setName(trimmed);
  };

  return (
    <li
      className="flex items-center gap-2 rounded border border-border2 bg-surface2/40 px-2 py-1.5"
      data-chart-style-row={style.id}
    >
      <span className="w-24 shrink-0 truncate font-mono text-[9px] uppercase tracking-wider text-text3">
        {chartKindLabel(style.kind)}
      </span>
      <input
        value={name}
        maxLength={MAX_USER_CHART_STYLE_NAME}
        aria-label={t('chart.style.name')}
        aria-invalid={invalid}
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
            setName(style.name);
            setInvalid(false);
          }
        }}
        className={`min-w-0 flex-1 rounded border bg-surface3 px-1.5 py-0.5 text-[11px] text-text ${
          invalid ? 'border-red' : 'border-border2'
        }`}
        data-chart-style-name-input={style.id}
      />
      <button
        type="button"
        className="rounded p-1 text-text3 hover:bg-red hover:text-on-accent"
        title={t('chart.preset.delete')}
        aria-label={t('chart.preset.delete')}
        onClick={() => {
          if (!window.confirm(t('chart.preset.deleteConfirm', { name: style.name }))) return;
          setStyles(deleteUserStyle(styles, style.id));
        }}
        data-chart-style-delete={style.id}
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </li>
  );
};

/**
 * Settings → Charts: the project's per-kind styles and the style used by new
 * charts of each kind. Procedure overrides live in the run setup.
 */
export const ChartStyleSettings = ({
  styles,
  setStyles,
  defaults,
  setDefaults,
}: ChartStyleSettingsProps) => {
  const kinds = CHART_KINDS.filter(kind => hasStyleGallery(kind, styles));
  return (
    <>
      <div className="mt-4 border-t border-border2 pt-3" data-chart-style-defaults>
        <h3 className="font-mono text-[10px] uppercase tracking-wider text-text2">
          {t('settings.chartStyleDefaults')}
        </h3>
        <p className="mb-2 mt-1 text-[10px] leading-relaxed text-text3">
          {t('settings.chartStyleDefaultsHint')}
        </p>
        <div className="grid grid-cols-1 gap-x-5 gap-y-1.5 sm:grid-cols-2">
          {kinds.map(kind => {
            const list = stylesFor(kind, styles);
            const effective = resolvedStyle(kind, defaults[kind], undefined, styles);
            return (
              <label
                key={kind}
                className="flex items-center justify-between gap-2 text-[10px] text-text3"
              >
                <span className="truncate">{chartKindLabel(kind)}</span>
                <select
                  aria-label={chartKindLabel(kind)}
                  className="max-w-[180px] rounded border border-border2 bg-surface3 px-1.5 py-0.5 text-[10px] text-text2"
                  value={effective?.id ?? ''}
                  onChange={event => {
                    const value = event.target.value;
                    setDefaults(previous => {
                      const next = { ...previous };
                      if (!value) delete next[kind];
                      else next[kind] = value;
                      return next;
                    });
                  }}
                  data-chart-style-default={kind}
                >
                  {list.map(style => (
                    <option key={style.id} value={style.id}>
                      {style.name ?? (style.labelKey ? t(style.labelKey) : style.id)}
                    </option>
                  ))}
                </select>
              </label>
            );
          })}
        </div>
      </div>

      <div className="mt-4 border-t border-border2 pt-3" data-chart-style-list>
        <div className="mb-2 flex flex-wrap items-baseline gap-2">
          <h3 className="font-mono text-[10px] uppercase tracking-wider text-text2">
            {t('settings.chartStyles')}
          </h3>
          <span className="font-mono text-[9px] text-text3">
            {styles.length}/{MAX_USER_CHART_STYLES}
          </span>
        </div>
        <p className="mb-2 text-[10px] leading-relaxed text-text3">
          {t('settings.chartStylesHint')}
        </p>
        {styles.length === 0 ? (
          <p className="text-[10px] text-text3" data-chart-style-empty>
            {t('settings.chartStylesEmpty')}
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {styles.map(style => (
              <StyleRow
                key={style.id}
                style={style}
                styles={styles}
                setStyles={setStyles}
              />
            ))}
          </ul>
        )}
      </div>
    </>
  );
};
