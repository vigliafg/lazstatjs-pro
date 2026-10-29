import { BarChart3, Database, Globe, HelpCircle, Settings } from 'lucide-react';
import type { ProjectTab } from '../io/project';
import type { UiMode } from '../components/UiMode';
import { ACTIVE_LOCALES, LOCALE_LABELS, t, type Locale } from '../i18n';

export interface HeaderProps {
  activeTab: ProjectTab;
  setActiveTab: (tab: ProjectTab) => void;
  uiMode: UiMode;
  setUiMode: (mode: UiMode) => void;
  uiLocale: Locale;
  setUiLocale: (locale: Locale) => void;
  /** Shown as a hint: the report language can differ from the interface one. */
  reportLocale: Locale;
}

/** Main navigation: brand plus the four top-level areas. */
export const Header = ({
  activeTab,
  setActiveTab,
  uiMode,
  setUiMode,
  uiLocale,
  setUiLocale,
  reportLocale,
}: HeaderProps) => (
  <div className="flex w-full min-w-0 max-w-full shrink-0 items-center gap-1 overflow-x-auto border-b border-border bg-surface2 px-2 pt-1.5 scrollbar">
    <div className="mr-1 flex shrink-0 items-center gap-2 border-r border-border px-2 pb-1.5">
      <div className="flex h-5 w-5 items-center justify-center rounded border border-accent/30 bg-accent/10">
        <BarChart3 className="h-3 w-3 text-accent" />
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text2">{t('app.name')}</span>
    </div>

    <button
      onClick={() => setActiveTab('data')}
      className={`main-tab ${activeTab === 'data' ? 'active' : ''}`}
      title={t('header.dataTitle')}
    >
      <Database className="mr-2 inline h-3 w-3" />
      {t('nav.data')}
    </button>
    <button
      onClick={() => setActiveTab('analysis')}
      className={`main-tab ${activeTab === 'analysis' ? 'active' : ''}`}
      title={t('header.analysisTitle')}
    >
      <BarChart3 className="mr-2 inline h-3 w-3" />
      {t('nav.analysis')}
    </button>
    <button
      onClick={() => setActiveTab('settings')}
      className={`main-tab ${activeTab === 'settings' ? 'active' : ''}`}
      title={t('header.settingsTitle')}
    >
      <Settings className="mr-2 inline h-3 w-3" />
      {t('nav.settings')}
    </button>
    <button
      onClick={() => setActiveTab('help')}
      className={`main-tab ${activeTab === 'help' ? 'active' : ''}`}
      title={t('header.helpTitle')}
    >
      <HelpCircle className="mr-2 inline h-3 w-3" />
      {t('nav.help')}
    </button>
    <label className="ml-auto flex shrink-0 items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-text3">
      <Globe className="h-3 w-3" aria-hidden="true" />
      <span className="sr-only">{t('settings.uiLanguage')}</span>
      <select
        aria-label={t('settings.uiLanguage')}
        title={`${t('settings.uiLanguage')} · ${t('settings.reportLanguage')}: ${LOCALE_LABELS[reportLocale]}`}
        className="rounded border border-border2 bg-surface3 px-1 py-0.5 text-[10px] text-text"
        value={uiLocale}
        onChange={event => setUiLocale(event.target.value as Locale)}
      >
        {ACTIVE_LOCALES.map(locale => (
          <option key={locale} value={locale}>
            {LOCALE_LABELS[locale]}
          </option>
        ))}
      </select>
    </label>
    <label className="flex shrink-0 items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-text3">
      <span className="hidden sm:inline">{t('mode.label')}</span>
      <select
        aria-label={t('mode.label')}
        className="rounded border border-border2 bg-surface3 px-1 py-0.5 text-[10px] text-text"
        value={uiMode}
        onChange={event => setUiMode(event.target.value as UiMode)}
      >
        <option value="guided">{t('mode.guided')}</option>
        <option value="expert">{t('mode.expert')}</option>
      </select>
    </label>
  </div>
);
