import type { Dispatch, SetStateAction } from 'react';
import { Check, Clock3, FileDown, FilePlus2, FolderOpen, Save, Trash2 } from 'lucide-react';
import { savePrefs, type IoPreferences } from '../io/prefs';
import { ChartDefaultsEditor } from '../components/charts/ChartDefaultsEditor';
import { ChartPresetList } from '../components/charts/ChartPresetList';
import type { ChartDefaults } from '../charts/defaults';
import type { ChartPreset } from '../charts/presets';
import { themesByMode, type ThemeId } from '../theme';
import type { OutputAppearance } from '../theme/outputAppearance';
import { OutputAppearanceSettings } from './OutputAppearanceSettings';
import {
  ACTIVE_LOCALES,
  LOCALE_LABELS,
  PLANNED_LOCALES,
  REPORT_LOCALES,
  t,
  type HelpLocale,
  type Locale,
} from '../i18n';

export interface SettingsTabProps {
  ioPrefs: IoPreferences;
  setIoPrefs: Dispatch<SetStateAction<IoPreferences>>;
  onNewDataset: () => void;
  onSaveProject: () => void;
  onOpenProject: () => void;
  onExport: () => void;
  onRestoreBackup: () => void;
  recentProjects: readonly string[];
  onClearRecent: () => void;
  uiLocale: Locale;
  setUiLocale: (locale: Locale) => void;
  reportLocale: Locale;
  setReportLocale: (locale: Locale) => void;
  helpLocale: HelpLocale;
  setHelpLocale: (locale: HelpLocale) => void;
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  outputAppearance: OutputAppearance;
  setOutputAppearance: Dispatch<SetStateAction<OutputAppearance>>;
  chartDefaults: ChartDefaults;
  setChartDefaults: Dispatch<SetStateAction<ChartDefaults>>;
  chartPresets: ChartPreset[];
  setChartPresets: Dispatch<SetStateAction<ChartPreset[]>>;
}

const sectionTitle =
  'text-accent2 font-mono text-[11px] font-bold uppercase tracking-widest mb-6 pb-2 border-b border-border';

const themeModeLabel = (mode: 'dark' | 'light') =>
  mode === 'dark' ? t('settings.themeDark') : t('settings.themeLight');

export const SettingsTab = ({
  ioPrefs,
  setIoPrefs,
  onNewDataset,
  onSaveProject,
  onOpenProject,
  onExport,
  onRestoreBackup,
  recentProjects,
  onClearRecent,
  uiLocale,
  setUiLocale,
  reportLocale,
  setReportLocale,
  helpLocale,
  setHelpLocale,
  theme,
  setTheme,
  outputAppearance,
  setOutputAppearance,
  chartDefaults,
  setChartDefaults,
  chartPresets,
  setChartPresets,
}: SettingsTabProps) => (
  <>
    <div className="flex-1 overflow-auto scrollbar p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <section className="rounded-lg border border-border bg-surface p-6">
          <h2 className={sectionTitle}>{t('settings.session')}</h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="tb-btn flex items-center gap-1 px-3 py-1.5 text-[11px]" onClick={onNewDataset}>
              <FilePlus2 className="h-3 w-3" />
              {t('settings.newDataset')}
            </button>
            <button type="button" className="tb-btn flex items-center gap-1 px-3 py-1.5 text-[11px]" onClick={onOpenProject}>
              <FolderOpen className="h-3 w-3" />
              {t('settings.openProject')}
            </button>
            <button type="button" className="tb-btn flex items-center gap-1 px-3 py-1.5 text-[11px]" onClick={onSaveProject}>
              <Save className="h-3 w-3" />
              {t('settings.saveProject')}
            </button>
            <button type="button" className="tb-btn flex items-center gap-1 px-3 py-1.5 text-[11px]" onClick={onExport}>
              <FileDown className="h-3 w-3" />
              {t('settings.export')}
            </button>
            <button type="button" className="tb-btn flex items-center gap-1 px-3 py-1.5 text-[11px]" onClick={onRestoreBackup}>
              <Clock3 className="h-3 w-3" />
              {t('settings.restoreBackup')}
            </button>
          </div>
          <div className="mt-5">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-text3">
                <Clock3 className="h-3 w-3" />
                {t('settings.recent')}
              </span>
              {recentProjects.length > 0 && (
                <button
                  type="button"
                  onClick={onClearRecent}
                  className="tb-btn flex items-center gap-1 px-2 py-0.5 text-[10px]"
                >
                  <Trash2 className="h-3 w-3" />
                  {t('settings.clear')}
                </button>
              )}
            </div>
            {recentProjects.length === 0 ? (
              <p className="mt-1 text-[10px] leading-relaxed text-text3">
                {t('settings.recentEmpty')}
              </p>
            ) : (
              <ul className="mt-1.5 space-y-0.5">
                {recentProjects.map(name => (
                  <li
                    key={name}
                    className="rounded border border-border bg-surface3/50 px-2 py-1 font-mono text-[10px] text-text2"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>


        <section className="rounded-lg border border-border bg-surface p-6">
          <h2 className={sectionTitle}>{t('settings.appearance')}</h2>
          <p className="mb-4 text-[11px] leading-relaxed text-text3">{t('settings.themeHint')}</p>
          <div className="space-y-5">
            {(['dark', 'light'] as const).map(mode => (
              <div key={mode}>
                <h3 className="mb-2 font-mono text-[9px] uppercase tracking-widest text-text3">
                  {themeModeLabel(mode)}
                </h3>
                <div
                  role="radiogroup"
                  aria-label={themeModeLabel(mode)}
                  className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                >
                  {themesByMode(mode).map(option => {
                    const selected = theme === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        aria-label={`${option.name} · ${themeModeLabel(mode)}`}
                        data-theme-option={option.id}
                        onClick={() => setTheme(option.id as ThemeId)}
                        className={`flex items-center gap-3 rounded border p-2 text-left transition-all ${
                          selected
                            ? 'border-accent bg-accent/10 shadow-[inset_0_0_0_1px_var(--color-accent)]'
                            : 'border-border bg-surface3/40 hover:border-border2 hover:bg-surface3'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className="flex h-11 w-16 shrink-0 overflow-hidden rounded border border-border2"
                          style={{ background: option.tokens.bg }}
                        >
                          <span
                            className="m-1 flex flex-1 flex-col justify-between rounded-sm p-1"
                            style={{ background: option.tokens.surface }}
                          >
                            <span className="flex gap-0.5">
                              {option.chart.palette.slice(0, 4).map(color => (
                                <span
                                  key={color}
                                  className="h-1.5 flex-1 rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </span>
                            <span
                              className="font-mono text-[8px] font-semibold leading-none"
                              style={{ color: option.tokens.text }}
                            >
                              Aa
                            </span>
                          </span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1 text-[12px] font-medium text-text">
                            {option.name}
                            {selected && <Check className="h-3 w-3 shrink-0 text-accent" aria-hidden="true" />}
                          </span>
                          <span className="block font-mono text-[9px] uppercase tracking-widest text-text3">
                            {themeModeLabel(mode)}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface p-6">
          <h2 className={sectionTitle}>{t('settings.outputStyle')}</h2>
          <p className="mb-4 text-[11px] leading-relaxed text-text3">{t('settings.outputStyleHint')}</p>
          <OutputAppearanceSettings
            theme={theme}
            appearance={outputAppearance}
            onChange={setOutputAppearance}
          />
        </section>

        <section className="rounded-lg border border-border bg-surface p-6">
          <h2 className={sectionTitle}>{t('settings.language')}</h2>
          <p className="mb-4 text-[11px] leading-relaxed text-text3">{t('settings.languageHint')}</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px] text-text2">{t('settings.uiLanguage')}</span>
              <select
                aria-label={t('settings.uiLanguage')}
                className="min-w-[140px] rounded border border-border2 bg-surface3 p-1 text-[11px] text-text"
                value={uiLocale}
                onChange={e => setUiLocale(e.target.value as Locale)}
              >
                {ACTIVE_LOCALES.map(locale => (
                  <option key={locale} value={locale}>
                    {LOCALE_LABELS[locale]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px] text-text2">{t('settings.reportLanguage')}</span>
              <select
                aria-label={t('settings.reportLanguage')}
                className="min-w-[140px] rounded border border-border2 bg-surface3 p-1 text-[11px] text-text"
                value={reportLocale}
                onChange={e => setReportLocale(e.target.value as Locale)}
              >
                {REPORT_LOCALES.map(locale => (
                  <option key={locale} value={locale}>
                    {LOCALE_LABELS[locale]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px] text-text2">{t('settings.helpLanguage')}</span>
              <select
                aria-label={t('settings.helpLanguage')}
                className="min-w-[140px] rounded border border-border2 bg-surface3 p-1 text-[11px] text-text"
                value={helpLocale}
                onChange={e => setHelpLocale(e.target.value as HelpLocale)}
              >
                <option value="auto">{t('settings.helpFollowsUi')}</option>
                {ACTIVE_LOCALES.map(locale => (
                  <option key={locale} value={locale}>
                    {LOCALE_LABELS[locale]}
                  </option>
                ))}
              </select>
            </div>
            <p className="rounded border border-border2 bg-surface3/40 px-2 py-1.5 text-[10px] leading-relaxed text-text3">
              {t('settings.reportCoverage', { locales: REPORT_LOCALES.map(l => LOCALE_LABELS[l]).join(', ') })}.
              {PLANNED_LOCALES.length > 0 && (
                <> {t('settings.plannedNote', { locales: PLANNED_LOCALES.map(l => LOCALE_LABELS[l]).join(', ') })}.</>
              )}
            </p>
            <p className="text-[10px] leading-relaxed text-text3">{t('settings.reportSnapshotNote')}</p>
          </div>
        </section>

        <section data-settings-charts className="rounded-lg border border-border bg-surface p-6">
          <h2 className={sectionTitle}>{t('settings.charts')}</h2>
          <p className="mb-4 text-[11px] leading-relaxed text-text3">{t('settings.chartsHint')}</p>
          <ChartDefaultsEditor defaults={chartDefaults} onChange={setChartDefaults} />
          <ChartPresetList
            presets={chartPresets}
            onChange={next => setChartPresets(next)}
          />
        </section>

        <section className="rounded-lg border border-border bg-surface p-6">
          <h2 className={sectionTitle}>{t('settings.io')}</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-text2">{t('settings.defaultDelimiter')}</span>
              <select
                aria-label={t('settings.defaultDelimiter')}
                className="min-w-[120px] rounded border border-border2 bg-surface3 p-1 text-[11px] text-text"
                value={ioPrefs.delimiter}
                onChange={e => {
                  const next = { ...ioPrefs, delimiter: e.target.value };
                  setIoPrefs(next);
                  savePrefs(next);
                }}
              >
                <option value="auto">{t('io.delimiterAuto')}</option>
                <option value=",">{t('io.commaSep')}</option>
                <option value=";">{t('io.semicolon')}</option>
                <option value="tab">{t('io.tab')}</option>
                <option value="|">{t('io.pipeSep')}</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-text2">{t('settings.decimalSeparator')}</span>
              <select
                aria-label={t('settings.decimalSeparator')}
                className="min-w-[120px] rounded border border-border2 bg-surface3 p-1 text-[11px] text-text"
                value={ioPrefs.decimalSeparator}
                onChange={e => {
                  const next = { ...ioPrefs, decimalSeparator: e.target.value as '.' | ',' };
                  setIoPrefs(next);
                  savePrefs(next);
                }}
              >
                <option value=".">{t('settings.period')}</option>
                <option value=",">{t('io.comma')}</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-text2">{t('settings.assumeHeader')}</span>
              <input
                type="checkbox"
                aria-label={t('settings.assumeHeader')}
                className="accent-accent"
                checked={ioPrefs.hasHeader}
                onChange={e => {
                  const next = { ...ioPrefs, hasHeader: e.target.checked };
                  setIoPrefs(next);
                  savePrefs(next);
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-text2">{t('settings.defaultFormat')}</span>
              <select
                aria-label={t('settings.defaultFormat')}
                className="min-w-[120px] rounded border border-border2 bg-surface3 p-1 text-[11px] text-text"
                value={ioPrefs.exportFormat}
                onChange={e => {
                  const next = { ...ioPrefs, exportFormat: e.target.value };
                  setIoPrefs(next);
                  savePrefs(next);
                }}
              >
                <option value="csv">{t('settings.csv')}</option>
                <option value="tsv">{t('settings.tsv')}</option>
                <option value="pipe">{t('io.pipe')}</option>
                <option value="json">{t('io.json')}</option>
                <option value="spss">{t('io.spss')}</option>
                <option value="xlsx">{t('io.xlsx')}</option>
              </select>
            </div>
          </div>
        </section>
      </div>
    </div>
  </>
);
