import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ImageDown, Redo2, RotateCcw, SquarePen, Undo2, X } from 'lucide-react';
import { t } from '../../i18n';
import { ToolbarButton } from '../ToolbarButton';
import type { AnalysisChart, ChartOptions } from '../../stats/charts';
import type { ChartAnnotation } from '../../charts/annotations';
import { boxDisplayOf, factoryOptions } from '../../charts/defaults';
import { exportChartsAsPng } from '../../io/chartExport';
import { AnnotationPanel } from './AnnotationPanel';
import { AnnotationSurface } from './AnnotationSurface';
import { AnnotationToolbar, type AnnotationTool } from './AnnotationToolbar';
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
  const [mobileView, setMobileView] = useState<'chart' | 'properties' | 'annotations'>('chart');
  const [mode, setMode] = useState<'chart' | 'annotations'>('chart');
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [annotationTool, setAnnotationTool] = useState<AnnotationTool>('select');
  const wide = useWideDialog();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const dirty = !sameOptions(draft, initialOptions);
  const canUndo = history.index > 0;
  const canRedo = history.index < history.items.length - 1;
  const annotations = draft.annotations ?? [];

  const applyDraft = (next: ChartOptions) => {
    setHistory(previous => {
      if (sameOptions(next, previous.items[previous.index])) return previous;
      const items = [...previous.items.slice(0, previous.index + 1), next];
      const capped = items.length > 60 ? items.slice(items.length - 60) : items;
      return { items: capped, index: capped.length - 1 };
    });
  };

  const setAnnotations = (next: ChartAnnotation[]) => {
    applyDraft({ ...draft, annotations: next } as ChartOptions);
  };

  const enterAnnotations = () => {
    setMode('annotations');
    setAnnotationTool('select');
    setMobileView('chart');
    setSelectedAnnotationId(current => current ?? draft.annotations?.[0]?.id ?? null);
  };

  const leaveAnnotations = () => {
    setMode('chart');
    setAnnotationTool('select');
    if (!wide) setMobileView('properties');
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

  const reset = () => {
    applyDraft(initialOptions);
    setSelectedAnnotationId(null);
  };
  const featureKey = (id: string): string =>
    id.startsWith('general.') ? id.slice('general.'.length) : id.startsWith('style.') ? id.slice('style.'.length) : id;
  const resetSection = (featureIds?: string[]) => {
    const next: Record<string, unknown> = { ...draft };
    if (featureIds && featureIds.length > 0) {
      featureIds.forEach((id) => {
        const key = featureKey(id);
        if (key in (initialOptions as unknown as Record<string, unknown>)) {
          next[key] = (initialOptions as unknown as Record<string, unknown>)[key];
        }
      });
    } else {
      const defaults = factoryOptions(chart.kind);
      Object.keys(defaults).forEach((key) => {
        if (key !== 'kind' && !(key in commonKeys)) {
          next[key] = (initialOptions as unknown as Record<string, unknown>)[key];
        }
      });
    }
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
          <ToolbarButton
            icon={SquarePen}
            label={t('chart.annotation.title')}
            active={mode === 'annotations'}
            toggle
            size="md"
            onClick={() => (mode === 'annotations' ? leaveAnnotations() : enterAnnotations())}
            title={
              mode === 'annotations'
                ? t('chart.annotation.closeEditor')
                : t('chart.annotation.openEditor')
            }
            data-chart-annotations-toggle=""
          />
          <ToolbarButton
            icon={Undo2}
            label={t('chart.undo')}
            size="md"
            disabled={!canUndo}
            onClick={undo}
          />
          <ToolbarButton
            icon={Redo2}
            label={t('chart.redo')}
            size="md"
            disabled={!canRedo}
            onClick={redo}
          />
          <ToolbarButton
            icon={ImageDown}
            label={t('chart.exportPng')}
            size="md"
            disabled={exporting}
            onClick={() => void exportPng()}
          />
          <ToolbarButton
            icon={RotateCcw}
            label={t('chart.reset')}
            size="md"
            onClick={reset}
          />
          <ToolbarButton
            icon={X}
            label={t('chart.cancel')}
            size="md"
            onClick={() => requestClose(onCancel)}
          />
          <ToolbarButton
            icon={Check}
            label={t('chart.done')}
            size="md"
            tone="primary"
            onClick={() => onDone(draft)}
          />
        </div>
      </header>
    ),
    [analysisName, chart.title, dirty, draft, canUndo, canRedo, exporting, mode, wide, onCancel, onDone]
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
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-auto lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 p-3">
            {!wide && (
              <div className="mb-2 flex flex-wrap gap-1">
                {(['chart', 'properties', 'annotations'] as const).map(view => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => {
                      if (view === 'annotations') {
                        setMode('annotations');
                        setMobileView('annotations');
                        setSelectedAnnotationId(
                          current => current ?? draft.annotations?.[0]?.id ?? null
                        );
                      } else if (view === 'properties') {
                        setMode('chart');
                        setMobileView('properties');
                      } else {
                        setMobileView('chart');
                      }
                    }}
                    className={`tb-btn px-2 py-0.5 text-[10px] ${
                      mobileView === view ? 'border-accent bg-accent/10 text-text' : ''
                    }`}
                    data-chart-mobile-tab={view}
                  >
                    {t(
                      view === 'chart'
                        ? 'chart.tabChart'
                        : view === 'properties'
                          ? 'chart.tabProperties'
                          : 'chart.annotation.mobileTab'
                    )}
                  </button>
                ))}
              </div>
            )}
            {wide || mobileView === 'chart' ? (
              <>
                {mode === 'annotations' ? (
                  <AnnotationToolbar tool={annotationTool} onChange={setAnnotationTool} />
                ) : (
                  <ChartGeneralToolbar chart={chart} options={draft} onChange={applyDraft} />
                )}
                <VegaChart
                  chart={chart}
                  options={preview}
                  className="min-h-[240px]"
                  annotationEditing={mode === 'annotations'}
                  overlay={area =>
                    mode === 'annotations' && area ? (
                      <AnnotationSurface
                        area={area}
                        annotations={annotations}
                        selectedId={selectedAnnotationId}
                        tool={annotationTool}
                        onChange={setAnnotations}
                        onSelect={setSelectedAnnotationId}
                        onToolChange={setAnnotationTool}
                        theme={draft.theme}
                      />
                    ) : null
                  }
                />
                {chart.note &&
                  preview.showNote &&
                  !(preview.kind === 'box' && boxDisplayOf(preview) === 'violin') && (
                    <p className="mt-1 text-[10px] text-text3">{chart.note}</p>
                  )}
              </>
            ) : mobileView === 'properties' ? (
              <>
                <ChartGeneralToolbar chart={chart} options={draft} onChange={applyDraft} />
                <ChartSpecificPanel
                  chart={chart}
                  options={draft}
                  onChange={applyDraft}
                  onReset={resetSection}
                  selectedAnnotationId={selectedAnnotationId}
                  onSelectAnnotation={setSelectedAnnotationId}
                  onOpenAnnotations={enterAnnotations}
                />
              </>
            ) : (
              <AnnotationPanel
                annotations={annotations}
                selectedId={selectedAnnotationId}
                onChange={setAnnotations}
                onSelect={setSelectedAnnotationId}
                theme={draft.theme}
              />
            )}
          </div>
          {wide && (
            <aside className="min-h-0 overflow-auto border-l border-border bg-surface p-3">
              {mode === 'annotations' ? (
                <AnnotationPanel
                  annotations={annotations}
                  selectedId={selectedAnnotationId}
                  onChange={setAnnotations}
                  onSelect={setSelectedAnnotationId}
                  theme={draft.theme}
                />
              ) : (
                <ChartSpecificPanel
                  chart={chart}
                  options={draft}
                  onChange={applyDraft}
                  onReset={resetSection}
                  selectedAnnotationId={selectedAnnotationId}
                  onSelectAnnotation={setSelectedAnnotationId}
                  onOpenAnnotations={enterAnnotations}
                />
              )}
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
