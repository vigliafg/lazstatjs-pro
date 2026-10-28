import type { ReactNode } from 'react';
import { Database, FileText, Trash2 } from 'lucide-react';
import { sanitizeOutputHtml, type StoredOutput } from '../io/outputs';

/** Un blocco della console: React live nella sessione, HTML quando ripristinato. */
export interface OutputEntry extends StoredOutput {
  node?: ReactNode;
}

/** I blocchi ripristinati sono statici: sanificati una volta e iniettati. */
export const restoredOutputs = (stored: StoredOutput[] | undefined): OutputEntry[] =>
  (stored ?? [])
    .map((entry) => ({ ...entry, html: sanitizeOutputHtml(entry.html) }))
    .filter((entry) => entry.html.length > 0);

export interface OutputConsoleProps {
  outputs: OutputEntry[];
  onRemove: (index: number) => void;
  onClear: () => void;
  onCopy: () => void;
  onExportCharts: () => void;
  onExportReport: () => void;
  onExportXlsx: () => void;
  onBackToData: () => void;
}

export const OutputConsole = ({
  outputs,
  onRemove,
  onClear,
  onCopy,
  onExportCharts,
  onExportReport,
  onExportXlsx,
  onBackToData,
}: OutputConsoleProps) => (
    <>
      <div className="bg-surface border-b border-border px-3 py-1 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <span className="font-mono text-[10px] text-text3 uppercase tracking-widest">Output Console</span>
        <div className="flex flex-wrap gap-2">
          <button
            className="tb-btn flex items-center gap-1"
            onClick={onBackToData}
            aria-label="Back to Data Editor"
          >
            <Database className="w-3 h-3" /> Data Editor
          </button>
          <button className="tb-btn" onClick={onClear}>Clear</button>
          <button className="tb-btn" onClick={onCopy}>Copy</button>
          <button
            className="tb-btn"
            onClick={onExportCharts}
            disabled={outputs.length === 0}
            title="Download every chart in the output console as a PNG"
          >
            Charts PNG
          </button>
          <button
            className="tb-btn"
            onClick={onExportReport}
            disabled={outputs.length === 0}
            title="Download a self-contained printable HTML report"
          >
            Report HTML
          </button>
          <button
            className="tb-btn"
            onClick={onExportXlsx}
            disabled={outputs.length === 0}
            title="Download an Excel workbook with the dataset and every result table"
          >
            Results XLSX
          </button>
        </div>
      </div>

      {/* THE FIX: Margine di rispetto inferiore applicato via ID in index.css */}
      <div id="output-content" className="scrollbar">
        {outputs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text3 opacity-50 gap-4">
            <FileText className="w-12 h-12" />
            <p className="text-[11px] uppercase tracking-widest">No analysis output yet</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {outputs.map((output, i) => (
              <div key={output.id} className="relative output-run group">
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  data-no-print
                  title="Remove this result"
                  aria-label="Remove this result block"
                  className="output-remove"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                {i > 0 && (
                  <div className="output-separator">
                    <div className="output-separator-dot">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                )}
                {output.node ?? (
                  <div
                    className="restored-output"
                    dangerouslySetInnerHTML={{ __html: output.html }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {outputs.length > 0 && (
        <button
          type="button"
          onClick={onBackToData}
          className="lg:hidden fixed bottom-4 right-4 z-50 tb-btn shadow-lg bg-surface2 border-accent text-accent"
          aria-label="Back to Data Editor"
        >
          <Database className="w-3 h-3 inline mr-1" /> Data Editor
        </button>
      )}
    </>
);
