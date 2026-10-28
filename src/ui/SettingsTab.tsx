import type { Dispatch, SetStateAction } from 'react';
import { Clock3, FileDown, FilePlus2, FolderOpen, Save, Trash2 } from 'lucide-react';
import { savePrefs, type IoPreferences } from '../io/prefs';

export interface SettingsTabProps {
  ioPrefs: IoPreferences;
  setIoPrefs: Dispatch<SetStateAction<IoPreferences>>;
  onNewDataset: () => void;
  onSaveProject: () => void;
  onOpenProject: () => void;
  onExport: () => void;
  recentProjects: readonly string[];
  onClearRecent: () => void;
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
  recentProjects,
  onClearRecent,
}: SettingsTabProps) => (
  <>
    <div className="flex-1 overflow-auto scrollbar p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <section className="rounded-lg border border-border bg-surface p-6">
          <h2 className={sectionTitle}>Session</h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="tb-btn flex items-center gap-1 px-3 py-1.5 text-[11px]" onClick={onNewDataset}>
              <FilePlus2 className="h-3 w-3" />
              New dataset
            </button>
            <button type="button" className="tb-btn flex items-center gap-1 px-3 py-1.5 text-[11px]" onClick={onOpenProject}>
              <FolderOpen className="h-3 w-3" />
              Open project
            </button>
            <button type="button" className="tb-btn flex items-center gap-1 px-3 py-1.5 text-[11px]" onClick={onSaveProject}>
              <Save className="h-3 w-3" />
              Save project
            </button>
            <button type="button" className="tb-btn flex items-center gap-1 px-3 py-1.5 text-[11px]" onClick={onExport}>
              <FileDown className="h-3 w-3" />
              Export data
            </button>
          </div>
          <div className="mt-5">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-text3">
                <Clock3 className="h-3 w-3" />
                Recent projects
              </span>
              {recentProjects.length > 0 && (
                <button
                  type="button"
                  onClick={onClearRecent}
                  className="tb-btn flex items-center gap-1 px-2 py-0.5 text-[10px]"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear
                </button>
              )}
            </div>
            {recentProjects.length === 0 ? (
              <p className="mt-1 text-[10px] leading-relaxed text-text3">
                No opened projects yet. Files you open appear here for reference; use Open project
                to reload one.
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
          <h2 className={sectionTitle}>Import / Export</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-text2">Default delimiter</span>
              <select
                aria-label="Default delimiter"
                className="min-w-[120px] rounded border border-border2 bg-surface3 p-1 text-[11px] text-text"
                value={ioPrefs.delimiter}
                onChange={e => {
                  const next = { ...ioPrefs, delimiter: e.target.value };
                  setIoPrefs(next);
                  savePrefs(next);
                }}
              >
                <option value="auto">Auto-detect</option>
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="tab">Tab</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-text2">Decimal separator</span>
              <select
                aria-label="Decimal separator"
                className="min-w-[120px] rounded border border-border2 bg-surface3 p-1 text-[11px] text-text"
                value={ioPrefs.decimalSeparator}
                onChange={e => {
                  const next = { ...ioPrefs, decimalSeparator: e.target.value as '.' | ',' };
                  setIoPrefs(next);
                  savePrefs(next);
                }}
              >
                <option value=".">Period (12.5)</option>
                <option value=",">Comma (12,5)</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-text2">Assume first row is header</span>
              <input
                type="checkbox"
                aria-label="Assume first row is header"
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
              <span className="text-[12px] text-text2">Default export format</span>
              <select
                aria-label="Default export format"
                className="min-w-[120px] rounded border border-border2 bg-surface3 p-1 text-[11px] text-text"
                value={ioPrefs.exportFormat}
                onChange={e => {
                  const next = { ...ioPrefs, exportFormat: e.target.value };
                  setIoPrefs(next);
                  savePrefs(next);
                }}
              >
                <option value="csv">CSV</option>
                <option value="tsv">TSV</option>
                <option value="pipe">Pipe TXT</option>
                <option value="json">JSON</option>
                <option value="spss">SPSS (CSV + .sps)</option>
                <option value="xlsx">Excel (.xlsx)</option>
              </select>
            </div>
          </div>
        </section>
      </div>
    </div>
  </>
);
