import { BarChart3, Database, HelpCircle, Settings } from 'lucide-react';
import type { ProjectTab } from '../io/project';
import { t } from '../i18n';

export interface HeaderProps {
  activeTab: ProjectTab;
  setActiveTab: (tab: ProjectTab) => void;
}

/** Main navigation: brand plus the four top-level areas. */
export const Header = ({ activeTab, setActiveTab }: HeaderProps) => (
  <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-border bg-surface2 px-2 pt-1.5 scrollbar">
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
  </div>
);
