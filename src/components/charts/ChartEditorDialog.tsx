import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { t } from '../../i18n';
import type { AnalysisChart, ChartOptions } from '../../stats/charts';
import { factoryOptions } from '../../charts/defaults';
import { exportChartsAsPng } from '../../io/chartExport';
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
 * Only one copy of the specific panel exists in the DOM at a time. Rendering
 * both the desktop aside and the mobile disclosure duplicated every control
 * id, which broke labels, keyboard traversal and any DOM query by id.
 */
const useWideDialog = (): boolean => {
  const [wide, setWide] = useState(() =>
    typeof window === 'undefined' ? true : window.matchMedia('(min-width: 1024px)').matches
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(min-width: 1024px)');
    const update = () => setWide(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return wide;
};

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
  const [history, setHistory] = useState<{ items: ChartOptions[]; index: number }>({
    items: [initialOptions],
    index: 0,
  });
  const draft = history.items[history.index];
  const [preview, setPreview] = useState<ChartOptions>(initialOptions);
  const [exporting, setExporting] = useState(false);
  const wide = useWideDialog();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const dirty = !sameOptions(draft, initialOptions);
  const canUndo = history.index > 0;
  const canRedo = history.index < history.items.length - 1;

  const applyDraft = (next: ChartOptions) => {
    setHistory(previous => {
      if (sameOptions(next, previous.items[previous.index])) return previous;
      const items = [...previous.items.slice(0, previous.index + 1), next];
      const capped = items.length > 60 ? items.slice(items.length - 60) : items;
      return { items: capped, index: capped.length - 1 };
    });
  };

  const undo = () =>
    setHistory(previous =>
      previous.index > 0 ? { ...previous, index: previous.index - 1 } : previous
    );

  const redo = () =>
    setHistory(previous =>
      previous.index < previous.items.length - 1
        ? { ...previous, index: previous.index + 1 }
        : previous
    );

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
      const modifier = event.metaKey || event.ctrlKey;
      if (modifier && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if (modifier && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
        return;
      }
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

  const reset = () => applyDraft(initialOptions);
  const resetSection = () => {
    const defaults = factoryOptions(chart.kind);
    const next: Record<string, unknown> = { ...draft };
    Object.keys(defaults).forEach((key) => {
      if (key !== 'kind' && !(key in commonKeys)) {
        next[key] = (initialOptions as unknown as Record<string, unknown>)[key];
      }
    });
    applyDraft(next as unknown as ChartOptions);
  };

  const exportPng = async () => {
    if (!panelRef.current || exporting) return;
    setExporting(true);
    // Make sure the rasteriser sees the latest draft, not the debounced preview.
    setPreview(draft);
    await new Promise(resolve => window.setTimeout(resolve, 180));
    try {
      await exportChartsAsPng(panelRef.current, `lazstats-${chart.id}`);
    } finally {
      setExporting(false);
    }
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
          <button
            type="button"
            className="tb-btn px-2 py-1 text-[10px]"
            disabled={!canUndo}
            onClick={undo}
            title={t('chart.undo')}
          >
            {t('chart.undo')}
          </button>
          <button
            type="button"
            className="tb-btn px-2 py-1 text-[10px]"
            disabled={!canRedo}
            onClick={redo}
            title={t('chart.redo')}
          >
            {t('chart.redo')}
          </button>
          <button
            type="button"
            className="tb-btn px-2 py-1 text-[10px]"
            disabled={exporting}
            onClick={() => void exportPng()}
            title={t('chart.exportPng')}
          >
            {t('chart.exportPng')}
          </button>
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
    [analysisName, chart.title, dirty, draft, canUndo, canRedo, exporting, onCancel, onDone]
  );

  return createPortal(
    <div className="fixed left-0 top-0 z-50 flex h-[100dvh] w-[100dvw] items-stretch justify-center bg-black/70 p-0 sm:inset-0 sm:h-auto sm:w-auto sm:p-4">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chart-editor-title"
        tabIndex={-1}
        className="flex h-full min-h-0 w-full min-w-0 max-w-[100dvw] flex-col overflow-hidden border border-border2 bg-bg outline-none sm:h-auto sm:max-h-[95vh] sm:max-w-[1400px] sm:rounded-lg"
      >
        {header}
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-auto lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 p-3">
            <ChartGeneralToolbar chart={chart} options={draft} onChange={applyDraft} />
            <VegaChart chart={chart} options={preview} className="min-h-[240px]" />
            {chart.note && preview.showNote && <p className="mt-1 text-[10px] text-text3">{chart.note}</p>}
            {!wide && (
              <details className="mt-3">
                <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-accent2">
                  {t('chart.specificOptions')}
                </summary>
                <div className="mt-2">
                  <ChartSpecificPanel
                    chart={chart}
                    options={draft}
                    onChange={applyDraft}
                    onReset={resetSection}
                  />
                </div>
              </details>
            )}
          </div>
          {wide && (
            <aside className="min-h-0 overflow-auto border-l border-border bg-surface p-3">
              <ChartSpecificPanel chart={chart} options={draft} onChange={applyDraft} onReset={resetSection} />
            </aside>
          )}
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
