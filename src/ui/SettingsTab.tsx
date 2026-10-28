import type { Dispatch, SetStateAction } from 'react';
import { savePrefs, type IoPreferences } from '../io/prefs';

export interface SettingsTabProps {
  ioPrefs: IoPreferences;
  setIoPrefs: Dispatch<SetStateAction<IoPreferences>>;
}

export const SettingsTab = ({ ioPrefs, setIoPrefs }: SettingsTabProps) => (
  <>
<div className="flex-1 overflow-auto scrollbar p-8">
  <div className="max-w-2xl mx-auto space-y-8">
    <section className="bg-surface border border-border rounded-lg p-6">
      <h2 className="text-accent2 font-mono text-[11px] font-bold uppercase tracking-widest mb-6 pb-2 border-b border-border">
        General Preferences
      </h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-text2 text-[12px]">Decimal Separator</span>
          <select className="bg-surface3 border border-border2 text-text text-[11px] p-1 rounded min-w-[120px]">
            <option value=".">Period (.)</option>
            <option value=",">Comma (,)</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text2 text-[12px]">Significant Digits</span>
          <input type="number" className="bg-surface3 border border-border2 text-text text-[11px] p-1 rounded w-20" defaultValue={4} />
        </div>
      </div>
    </section>

    <section className="bg-surface border border-border rounded-lg p-6">
      <h2 className="text-accent2 font-mono text-[11px] font-bold uppercase tracking-widest mb-6 pb-2 border-b border-border">
        Import / Export
      </h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-text2 text-[12px]">Default delimiter</span>
          <select
            className="bg-surface3 border border-border2 text-text text-[11px] p-1 rounded min-w-[120px]"
            value={ioPrefs.delimiter}
            onChange={(e) => {
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
          <span className="text-text2 text-[12px]">Decimal separator</span>
          <select
            className="bg-surface3 border border-border2 text-text text-[11px] p-1 rounded min-w-[120px]"
            value={ioPrefs.decimalSeparator}
            onChange={(e) => {
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
          <span className="text-text2 text-[12px]">Assume first row is header</span>
          <input
            type="checkbox"
            className="accent-accent"
            checked={ioPrefs.hasHeader}
            onChange={(e) => {
              const next = { ...ioPrefs, hasHeader: e.target.checked };
              setIoPrefs(next);
              savePrefs(next);
            }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text2 text-[12px]">Default export format</span>
          <select
            className="bg-surface3 border border-border2 text-text text-[11px] p-1 rounded min-w-[120px]"
            value={ioPrefs.exportFormat}
            onChange={(e) => {
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

    <section className="bg-surface border border-border rounded-lg p-6">
      <h2 className="text-accent2 font-mono text-[11px] font-bold uppercase tracking-widest mb-6 pb-2 border-b border-border">
        Output Settings
      </h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-text2 text-[12px]">Show Summary Interpretation</span>
          <input type="checkbox" className="accent-accent" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text2 text-[12px]">Include Plots in Output</span>
          <input type="checkbox" className="accent-accent" defaultChecked />
        </div>
      </div>
    </section>
  </div>
</div>
  </>
);
