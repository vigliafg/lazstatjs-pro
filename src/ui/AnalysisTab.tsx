import { useEffect, useState } from 'react';
import { BarChart3, Maximize2, Minimize2, PanelLeft, SlidersHorizontal } from 'lucide-react';
import { analysisLabel, analysisMeta } from '../analyses/registry';
import { AnalysisLibrary } from './analysis/AnalysisLibrary';
import { AnalysisOptions } from './analysis/AnalysisOptions';
import { useRecentAnalyses } from './analysis/useRecentAnalyses';
import type { AnalysisTabProps } from './analysis/types';
import { OutputConsole } from './OutputConsole';

type Pane = 'library' | 'options' | 'output';

const isNarrow = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches;

/**
 * Three-zone analysis workbench: library, setup and output.
 *
 * On wide screens the three panes live side by side and can be hidden
 * independently; below `lg` the segmented control shows one pane at a time.
 */
export const AnalysisTab = (props: AnalysisTabProps) => {
  const [pane, setPane] = useState<Pane>('options');
  const [showLibrary, setShowLibrary] = useState(true);
  const [showOptions, setShowOptions] = useState(true);
  const [focusOutput, setFocusOutput] = useState(false);
  const recent = useRecentAnalyses(props.activeAnalysis);

  const go = (next: Pane) => {
    setFocusOutput(false);
    setPane(next);
    if (next === 'library') setShowLibrary(true);
    if (next === 'options') setShowOptions(true);
  };

  const toggleLibrary = () => {
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
    if (isNarrow()) setPane('options');
  };

  const run = (): boolean => {
    const ok = props.runAnalysis();
    if (ok && isNarrow()) {
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
        run();
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

  return (
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
                pane === item ? 'bg-accent text-white' : 'text-text3 hover:text-text2'
              }`}
            >
              {item === 'options' ? 'Setup' : item}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-1 lg:flex">
          <button
            type="button"
            onClick={toggleLibrary}
            aria-pressed={showLibrary}
            className={`tb-btn flex items-center gap-1 px-2 py-0.5 text-[10px] ${
              showLibrary ? 'text-text' : 'text-text3'
            }`}
            title={showLibrary ? 'Hide the analysis library' : 'Show the analysis library'}
          >
            <PanelLeft className="h-3 w-3" />
            Library
          </button>
          <button
            type="button"
            onClick={toggleOptions}
            aria-pressed={showOptions}
            className={`tb-btn flex items-center gap-1 px-2 py-0.5 text-[10px] ${
              showOptions ? 'text-text' : 'text-text3'
            }`}
            title={showOptions ? 'Hide the setup panel' : 'Show the setup panel'}
          >
            <SlidersHorizontal className="h-3 w-3" />
            Setup
          </button>
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-2">
          <span className="hidden min-w-0 items-center gap-1.5 text-[10px] text-text3 sm:flex">
            <BarChart3 className="h-3 w-3 shrink-0 text-accent2" />
            <span className="truncate">{analysisLabel(props.activeAnalysis)}</span>
          </span>
          <button
            type="button"
            onClick={toggleFocus}
            aria-pressed={focusOutput}
            aria-label={focusOutput ? 'Show library and setup' : 'Focus output'}
            className={`tb-btn flex items-center gap-1 px-2 py-0.5 text-[10px] ${
              focusOutput ? 'border-accent bg-accent/10 text-text' : ''
            }`}
            title={focusOutput ? 'Show library and setup again' : 'Give the output the full width'}
          >
            {focusOutput ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            <span className="hidden xl:inline">{focusOutput ? 'Show setup' : 'Focus output'}</span>
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div
          className={`${libraryVisibility} min-h-0 w-full shrink-0 lg:w-[210px] xl:w-[238px] 2xl:w-[258px]`}
        >
          <AnalysisLibrary
            activeAnalysis={props.activeAnalysis}
            recent={recent}
            onSelect={selectAnalysis}
            onClose={() => go('options')}
          />
        </div>

        <div
          className={`${optionsVisibility} min-h-0 w-full shrink-0 lg:w-[300px] xl:w-[330px] 2xl:w-[360px]`}
        >
          <AnalysisOptions {...props} runAnalysis={run} />
        </div>

        <div
          className={`${outputVisibility} min-h-0 min-w-0 flex-1 flex-col lg:flex`}
        >
          <OutputConsole
            outputs={props.outputs}
            onRemove={props.removeOutput}
            onClear={props.clearOutput}
            onCopy={props.copyOutput}
            onExportCharts={props.exportChartPngs}
            onExportReport={props.exportReportHtml}
            onExportXlsx={props.exportResultsXlsx}
            onBackToData={() => props.setActiveTab('data')}
            currentRevision={props.dataRevision}
            currentDatasetId={props.datasetId}
            currentFilterSignature={props.filterSignature}
            onOpenAnalysis={analysisId => {
              if (!analysisMeta(analysisId)) return;
              props.setActiveAnalysis(analysisId);
              go('options');
            }}
          />
        </div>
      </div>
    </div>
  );
};
