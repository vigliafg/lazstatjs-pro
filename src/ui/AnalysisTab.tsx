import { useEffect, useState } from 'react';
import { BarChart3, Maximize2, Minimize2, PanelLeft, SlidersHorizontal } from 'lucide-react';
import { ToolbarButton } from '../components/ToolbarButton';
import { analysisLabel, analysisMeta } from '../analyses/registry';
import { AnalysisLibrary } from './analysis/AnalysisLibrary';
import { AnalysisOptions } from './analysis/AnalysisOptions';
import { useRecentAnalyses } from './analysis/useRecentAnalyses';
import { useMediaQuery } from '../hooks/useMediaQuery';
import type { AnalysisTabProps } from './analysis/types';
import { AnalysisStoreProvider } from './analysis/store';
import { OutputConsole } from './OutputConsole';
import type { SessionReportMeta } from './output/types';
import { t } from '../i18n';

type Pane = 'library' | 'options' | 'output';


/**
 * Three-zone analysis workbench: library, setup and output.
 *
 * On wide screens the three panes live side by side and can be hidden
 * independently; below `lg` the segmented control shows one pane at a time.
 */
export const AnalysisTab = (props: AnalysisTabProps) => {
  const narrow = useMediaQuery('(max-width: 1023px)');
  const wide = useMediaQuery('(min-width: 1280px)');
  const [pane, setPane] = useState<Pane>('options');
  const [showLibrary, setShowLibrary] = useState(wide);
  const [libraryTouched, setLibraryTouched] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [focusOutput, setFocusOutput] = useState(false);
  const recent = useRecentAnalyses(props.activeAnalysis);

  // The responsive default follows the breakpoint until the user makes an
  // explicit choice; after that, resizing must not reopen a hidden library.
  useEffect(() => {
    if (!libraryTouched) setShowLibrary(wide);
  }, [wide, libraryTouched]);

  const focusPane = (next: Pane) => {
    requestAnimationFrame(() => document.getElementById(`analysis-pane-${next}`)?.focus());
  };

  const go = (next: Pane) => {
    setFocusOutput(false);
    setPane(next);
    if (next === 'library') {
      setShowLibrary(true);
      setLibraryTouched(true);
    }
    if (next === 'options') setShowOptions(true);
    focusPane(next);
  };

  const toggleLibrary = () => {
    setLibraryTouched(true);
    if (focusOutput) {
      setFocusOutput(false);
      setShowLibrary(true);
      return;
    }
    const next = !showLibrary;
    setShowLibrary(next);
    if (!next && pane === 'library') setPane('output');
  };

  const toggleOptions = () => {
    if (focusOutput) {
      setFocusOutput(false);
      setShowOptions(true);
      return;
    }
    const next = !showOptions;
    setShowOptions(next);
    if (!next && pane === 'options') setPane('output');
  };

  const toggleFocus = () => {
    if (focusOutput) {
      setFocusOutput(false);
      // Never restore an empty workbench: the label promises the setup panel.
      if (!showLibrary && !showOptions) setShowOptions(true);
      return;
    }
    setFocusOutput(true);
  };

  const selectAnalysis = (id: string) => {
    props.setActiveAnalysis(id);
    if (narrow) {
      setPane('options');
      focusPane('options');
    }
  };

  const run = async (): Promise<boolean> => {
    const ok = await props.runAnalysis();
    if (ok && narrow) {
      setFocusOutput(false);
      setPane('output');
    }
    return ok;
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        void run();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        go('library');
        requestAnimationFrame(() => {
          document.getElementById('analysis-search')?.focus();
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // `run` reads the latest props through the closure of this render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.runAnalysis, props.activeAnalysis]);

  const libraryVisibility =
    focusOutput || !showLibrary
      ? 'hidden'
      : `${pane === 'library' ? 'flex' : 'hidden'} lg:flex`;
  const optionsVisibility =
    focusOutput || !showOptions
      ? 'hidden'
      : `${pane === 'options' ? 'flex' : 'hidden'} lg:flex`;
  // A pane hidden from the desktop toolbar must not leave a blank mobile view.
  const selectedPaneHidden =
    (pane === 'library' && !showLibrary) || (pane === 'options' && !showOptions);
  const outputVisibility = pane === 'output' || selectedPaneHidden ? 'flex' : 'hidden';

  const sessionMeta: SessionReportMeta = {
    datasetId: props.datasetId,
    rows: props.visibleRowCount,
    totalRows: props.grid.rows.length,
    columns: props.grid.cols.length,
    ...(props.activeRowFilter
      ? {
          filterLabel: `${props.grid.cols[props.activeRowFilter.col]?.name ?? ''} ${
            props.activeRowFilter.op === 'contains'
              ? t('data.contains')
              : props.activeRowFilter.op === 'equals'
                ? '='
                : props.activeRowFilter.op === 'notEquals'
                  ? '≠'
                  : props.activeRowFilter.op === 'gt'
                    ? '>'
                    : props.activeRowFilter.op === 'gte'
                      ? '≥'
                      : props.activeRowFilter.op === 'lt'
                        ? '<'
                        : props.activeRowFilter.op === 'lte'
                          ? '≤'
                          : props.activeRowFilter.op === 'empty'
                            ? t('data.isEmpty')
                            : t('data.isNotEmpty')
          } ${props.activeRowFilter.value}`.trim(),
          filterAffectsAnalysis: props.filterAffectsAnalysis,
        }
      : {}),
    analyses: new Set(props.outputs.map(output => output.analysisId).filter(Boolean)).size,
    ciLevel: props.ciLevel,
  };

  return (
    <AnalysisStoreProvider params={props.params} onChange={props.setParams}>
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex h-9 shrink-0 items-center gap-1 border-b border-border bg-surface px-2">
        <div className="flex items-center gap-0.5 rounded border border-border2 bg-surface3/60 p-0.5 lg:hidden">
          {(['library', 'options', 'output'] as const).map(item => (
            <button
              key={item}
              type="button"
              onClick={() => go(item)}
              aria-pressed={pane === item}
              className={`rounded px-2 py-1 font-mono text-[9px] uppercase tracking-wider transition-colors ${
                pane === item ? 'bg-accent text-on-accent' : 'text-text3 hover:text-text2'
              }`}
            >
              {item === 'options' ? t('analysis.setup') : t(`analysis.${item}` as 'analysis.library' | 'analysis.output')}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-1 lg:flex">
          <ToolbarButton
            icon={PanelLeft}
            label={t('analysis.library')}
            size="sm"
            labelVisibility="always"
            className={showLibrary ? 'text-text' : 'text-text3'}
            aria-pressed={showLibrary}
            onClick={toggleLibrary}
            title={showLibrary ? t('analysis.hideLibrary') : t('analysis.showLibrary')}
          />
          <ToolbarButton
            icon={SlidersHorizontal}
            label={t('analysis.setup')}
            size="sm"
            labelVisibility="always"
            className={showOptions ? 'text-text' : 'text-text3'}
            aria-pressed={showOptions}
            onClick={toggleOptions}
            title={showOptions ? t('analysis.hideSetup') : t('analysis.showSetup')}
          />
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-2">
          <span className="hidden min-w-0 items-center gap-1.5 text-[10px] text-text3 sm:flex">
            <BarChart3 className="h-3 w-3 shrink-0 text-accent2" />
            <span className="truncate">{analysisLabel(props.activeAnalysis)}</span>
          </span>
          <ToolbarButton
            icon={focusOutput ? Minimize2 : Maximize2}
            label={focusOutput ? t('analysis.showSetup') : t('analysis.focusOutput')}
            size="sm"
            labelVisibility="xl"
            className={focusOutput ? 'border-accent bg-accent/10 text-text' : ''}
            aria-pressed={focusOutput}
            onClick={toggleFocus}
            aria-label={focusOutput ? t('analysis.showPanels') : t('analysis.focusOutput')}
            title={focusOutput ? t('analysis.showPanelsTitle') : t('analysis.focusOutputTitle')}
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div
          className={`${libraryVisibility} min-h-0 w-full shrink-0 lg:w-[210px] xl:w-[238px] 2xl:w-[258px]`}
        >
          <AnalysisLibrary
            id="analysis-pane-library"
            activeAnalysis={props.activeAnalysis}
            recent={recent}
            onSelect={selectAnalysis}
            onClose={() => go('options')}
          />
        </div>

        <div
          className={`${optionsVisibility} min-h-0 w-full shrink-0 lg:w-[300px] xl:w-[330px] 2xl:w-[360px]`}
        >
          <AnalysisOptions {...props} runAnalysis={run} paneId="analysis-pane-options" />
        </div>

        <div
          className={`${outputVisibility} min-h-0 min-w-0 flex-1 flex-col lg:flex`}
        >
          <OutputConsole
            id="analysis-pane-output"
            outputs={props.outputs}
            meta={sessionMeta}
            onRemove={props.removeOutput}
            onClear={props.clearOutput}
            onCopy={props.copyOutput}
            onExportCharts={props.exportChartPngs}
            onExportReport={props.exportReportHtml}
            onExportWord={props.exportReportWord}
            onExportXlsx={props.exportResultsXlsx}
            onExportRunHtml={props.exportRunReportHtml}
            onExportRunWord={props.exportRunReportWord}
            onBackToData={() => props.setActiveTab('data')}
            onRerun={props.onRerunOutput}
            onRerunAll={props.onRerunAllOutputs}
            onApplyParams={props.onApplyOutputParams}
            paramsSignatureFor={props.paramsSignatureFor}
            limitationsLabel={props.limitationsLabel}
            outputStyle={props.outputStyle}
            onUpdateChart={props.onUpdateChart}
            currentRevision={props.dataRevision}
            currentDatasetId={props.datasetId}
            currentFilterSignature={props.filterSignature}
            currentCiLevel={props.ciLevel}
            onOpenAnalysis={analysisId => {
              if (!analysisMeta(analysisId)) return;
              props.setActiveAnalysis(analysisId);
              go('options');
            }}
          />
        </div>
      </div>
    </div>
    </AnalysisStoreProvider>
  );
};
