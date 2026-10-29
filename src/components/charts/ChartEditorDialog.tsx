import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { t } from '../../i18n';
import type { AnalysisChart, ChartOptions } from '../../stats/charts';
import { factoryOptions } from '../../charts/defaults';
import { ChartGeneralToolbar } from './ChartGeneralToolbar';
import { ChartSpecificPanel } from './ChartSpecificPanel';
import { VegaChart } from './VegaChart';

interface ChartEditorDialogProps {
  chart: AnalysisChart;
  initialOptions: ChartOptions;
  analysisName?: string;
  onDone: (options: ChartOptions) => void;
  onCancel: () => void;
}

const sameOptions = (a: ChartOptions, b: ChartOptions): boolean =>
  JSON.stringify(a) === JSON.stringify(b);

/**
 * Focused chart editor: live preview on the left, general toolbar above it and
 * procedure-specific controls on the right. The draft never mutates the card
 * until Done; Cancel and Escape discard it.
 */
export const ChartEditorDialog = ({
  chart,
  initialOptions,
  analysisName,
  onDone,
  onCancel,
}: ChartEditorDialogProps) => {
  const [draft, setDraft] = useState<ChartOptions>(initialOptions);
  const [preview, setPreview] = useState<ChartOptions>(initialOptions);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const dirty = !sameOptions(draft, initialOptions);

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      cancelAnimationFrame(frame);
      previousFocus.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setPreview(draft), 120);
    return () => window.clearTimeout(timer);
  }, [draft]);

  const requestClose = (action: () => void) => {
    if (dirty && !window.confirm(t('chart.discardConfirm'))) return;
    action();
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        requestClose(onCancel);
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = (Array.from(
        panelRef.current.querySelectorAll(
          'button, [href], input, select, textarea, summary, [tabindex]:not([tabindex="-1"])'
        )
      ) as HTMLElement[]).filter(node => !node.hasAttribute('disabled') && node.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  });

  const reset = () => setDraft(factoryOptions(chart.kind));
  const resetSection = () => {
    const defaults = factoryOptions(chart.kind);
    const next: Record<string, unknown> = { ...draft };
    Object.entries(defaults).forEach(([key, value]) => {
      if (key !== 'kind' && !(key in commonKeys)) next[key] = value;
    });
    setDraft(next as unknown as ChartOptions);
  };

  const header = useMemo(
    () => (
      <header className="flex flex-wrap items-center gap-2 border-b border-border bg-surface2 px-3 py-2">
        <div className="min-w-0">
          <h2 id="chart-editor-title" className="truncate text-[12px] font-semibold text-text">
            {chart.title}
            {dirty && <span className="ml-2 font-mono text-[9px] text-yellow">●</span>}
          </h2>
          {analysisName && <p className="truncate font-mono text-[9px] text-text3">{analysisName}</p>}
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <button type="button" className="tb-btn px-2 py-1 text-[10px]" onClick={reset}>
            {t('chart.reset')}
          </button>
          <button
            type="button"
            className="tb-btn px-2 py-1 text-[10px]"
            onClick={() => requestClose(onCancel)}
          >
            {t('chart.cancel')}
          </button>
          <button
            type="button"
            className="tb-btn border-accent bg-accent px-3 py-1 text-[10px] text-white hover:bg-accent2"
            onClick={() => onDone(draft)}
          >
            {t('chart.done')}
          </button>
        </div>
      </header>
    ),
    [analysisName, chart.title, dirty, draft, onCancel, onDone]
  );

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/70 p-0 sm:p-4">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chart-editor-title"
        tabIndex={-1}
        className="flex h-full w-full max-w-[1400px] flex-col overflow-hidden border border-border2 bg-bg outline-none sm:h-auto sm:max-h-[95vh] sm:rounded-lg"
      >
        {header}
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-auto lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 p-3">
            <ChartGeneralToolbar chart={chart} options={draft} onChange={setDraft} />
            <VegaChart chart={chart} options={preview} className="min-h-[240px]" />
            {chart.note && <p className="mt-1 text-[10px] text-text3">{chart.note}</p>}
            <details className="mt-3 lg:hidden">
              <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-accent2">
                {t('chart.specificOptions')}
              </summary>
              <div className="mt-2">
                <ChartSpecificPanel
                  chart={chart}
                  options={draft}
                  onChange={setDraft}
                  onReset={resetSection}
                />
              </div>
            </details>
          </div>
          <aside className="hidden min-h-0 overflow-auto border-l border-border bg-surface p-3 lg:block">
            <ChartSpecificPanel chart={chart} options={draft} onChange={setDraft} onReset={resetSection} />
          </aside>
        </div>
      </div>
    </div>,
    document.body
  );
};

/** Common option keys are reset by the global Reset, not by "Reset this section". */
const commonKeys: Record<string, true> = {
  preset: true,
  theme: true,
  gridX: true,
  gridY: true,
  gridOpacity: true,
  palette: true,
  showLegend: true,
  legendPosition: true,
  showTitle: true,
  showSubtitle: true,
  showNote: true,
  showXTitle: true,
  showYTitle: true,
  zeroBaseline: true,
  pointShape: true,
  pointSize: true,
  pointOpacity: true,
  lineWidth: true,
  lineDash: true,
  size: true,
  tooltip: true,
};
