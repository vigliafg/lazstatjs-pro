import type { Dispatch, SetStateAction } from 'react';
import { RotateCcw } from 'lucide-react';
import { ToolbarButton } from '../components/ToolbarButton';
import { t } from '../i18n';
import type { ThemeDefinition } from '../theme';
import {
  DEFAULT_OUTPUT_APPEARANCE,
  OUTPUT_FONT_SIZES,
  outputFontStack,
  type OutputAppearance,
  type OutputFont,
} from '../theme/outputAppearance';

export interface OutputAppearanceSettingsProps {
  theme: ThemeDefinition;
  appearance: OutputAppearance;
  onChange: Dispatch<SetStateAction<OutputAppearance>>;
}

const rowClass = 'flex items-center justify-between gap-3';
const labelClass = 'text-[12px] text-text2';
const controlClass =
  'min-w-[140px] rounded border border-border2 bg-surface3 p-1 text-[11px] text-text';

/**
 * Settings for the result window only. Empty colours and `0` sizes mean
 * "follow the theme", so the defaults keep the current theme's exact look.
 */
export const OutputAppearanceSettings = ({
  theme,
  appearance,
  onChange,
}: OutputAppearanceSettingsProps) => {
  const background = appearance.background || theme.tokens.bg;
  const foreground = appearance.foreground || theme.tokens.text2;
  const fontSize = appearance.fontSize || 12;
  const update = (patch: Partial<OutputAppearance>) =>
    onChange(previous => ({ ...previous, ...patch }));

  return (
    <div className="space-y-4" data-output-appearance>
      <div className={rowClass}>
        <span className={labelClass}>{t('settings.outputBackground')}</span>
        <span className="flex items-center gap-1">
          <input
            type="color"
            aria-label={t('settings.outputBackground')}
            value={background}
            onChange={event => update({ background: event.target.value })}
            className="h-6 w-9 cursor-pointer rounded border border-border2 bg-surface3 p-0"
          />
          <span className="w-16 font-mono text-[9px] uppercase text-text3">{background}</span>
          {appearance.background && (
            <button
              type="button"
              className="tb-btn px-1 py-0.5"
              title={t('settings.outputFollowTheme')}
              aria-label={`${t('settings.outputBackground')} · ${t('settings.outputFollowTheme')}`}
              onClick={() => update({ background: '' })}
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          )}
        </span>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>{t('settings.outputForeground')}</span>
        <span className="flex items-center gap-1">
          <input
            type="color"
            aria-label={t('settings.outputForeground')}
            value={foreground}
            onChange={event => update({ foreground: event.target.value })}
            className="h-6 w-9 cursor-pointer rounded border border-border2 bg-surface3 p-0"
          />
          <span className="w-16 font-mono text-[9px] uppercase text-text3">{foreground}</span>
          {appearance.foreground && (
            <button
              type="button"
              className="tb-btn px-1 py-0.5"
              title={t('settings.outputFollowTheme')}
              aria-label={`${t('settings.outputForeground')} · ${t('settings.outputFollowTheme')}`}
              onClick={() => update({ foreground: '' })}
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          )}
        </span>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>{t('settings.outputFont')}</span>
        <select
          aria-label={t('settings.outputFont')}
          className={controlClass}
          value={appearance.font}
          onChange={event => update({ font: event.target.value as OutputFont })}
        >
          <option value="theme">{t('settings.outputFollowTheme')}</option>
          <option value="mono">IBM Plex Mono</option>
          <option value="sans">IBM Plex Sans</option>
          <option value="serif">Georgia</option>
        </select>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>{t('settings.outputFontSize')}</span>
        <select
          aria-label={t('settings.outputFontSize')}
          className={controlClass}
          value={appearance.fontSize}
          onChange={event => update({ fontSize: Number(event.target.value) })}
        >
          <option value={0}>{t('settings.outputFollowTheme')}</option>
          {OUTPUT_FONT_SIZES.map(size => (
            <option key={size} value={size}>
              {size} px
            </option>
          ))}
        </select>
      </div>

      <div
        className="rounded border border-border2 p-3 leading-relaxed"
        data-output-appearance-preview
        style={{
          background,
          color: foreground,
          fontFamily: outputFontStack(appearance.font),
          fontSize: `${fontSize}px`,
        }}
      >
        <div className="font-semibold">ANOVA: Score by Group</div>
        <div>F(2, 27) = 4.21 · p = .025</div>
        <div style={{ opacity: 0.8 }}>N = 30 · CI 95% · Aa 0123</div>
      </div>

      <ToolbarButton
        icon={RotateCcw}
        label={t('settings.outputReset')}
        size="sm"
        labelVisibility="always"
        className="px-2 py-1"
        onClick={() => onChange({ ...DEFAULT_OUTPUT_APPEARANCE })}
      />
    </div>
  );
};
