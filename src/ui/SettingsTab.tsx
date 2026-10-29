import type { Dispatch, SetStateAction } from 'react';
import { Clock3, FileDown, FilePlus2, FolderOpen, Save, Trash2 } from 'lucide-react';
import { savePrefs, type IoPreferences } from '../io/prefs';
import {
  ACTIVE_LOCALES,
  LOCALE_LABELS,
  PLANNED_LOCALES,
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
}

const sectionTitle =
  'text-accent2 font-mono text-[11px] font-bold uppercase tracking-widest mb-6 pb-2 border-b border-border';

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
                {ACTIVE_LOCALES.map(locale => (
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
              {t('settings.reportCoverage', { locales: ACTIVE_LOCALES.map(l => LOCALE_LABELS[l]).join(', ') })}.
              {' '}
              {t('settings.plannedNote', { locales: PLANNED_LOCALES.map(l => LOCALE_LABELS[l]).join(', ') })}.
            </p>
            <p className="text-[10px] leading-relaxed text-text3">{t('settings.reportSnapshotNote')}</p>
          </div>
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
