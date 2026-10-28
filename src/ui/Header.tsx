import { BarChart3, Database, HelpCircle, Settings } from 'lucide-react';
import type { ProjectTab } from '../io/project';

export interface HeaderProps {
  activeTab: ProjectTab;
  setActiveTab: (tab: ProjectTab) => void;
}

/** Barra delle schede principali. Nessuno stato proprio: solo navigazione. */
export const Header = ({ activeTab, setActiveTab }: HeaderProps) => (
  <div className="bg-surface2 border-b border-border px-2 pt-1.5 flex gap-0.5 shrink-0 sticky top-0 z-50">
    <button
      onClick={() => setActiveTab('data')}
      className={`main-tab ${activeTab === 'data' ? 'active' : ''}`}
    >
      <Database className="w-3 h-3 inline mr-2" />
      Data Editor
    </button>
    <button
      onClick={() => setActiveTab('analysis')}
      className={`main-tab ${activeTab === 'analysis' ? 'active' : ''}`}
    >
      <BarChart3 className="w-3 h-3 inline mr-2" />
      Analysis & Output
    </button>
    <button
      onClick={() => setActiveTab('settings')}
      className={`main-tab ${activeTab === 'settings' ? 'active' : ''}`}
    >
      <Settings className="w-3 h-3 inline mr-2" />
      Settings
    </button>
    <button
      onClick={() => setActiveTab('help')}
      className={`main-tab ${activeTab === 'help' ? 'active' : ''}`}
    >
      <HelpCircle className="w-3 h-3 inline mr-2" />
      Help
    </button>
  </div>
);
