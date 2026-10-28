import { useState, useEffect, useMemo, type SetStateAction } from 'react';
import type { AnalysisRunResult } from './analyses/types';
import { restoredOutputs, type OutputEntry } from './ui/OutputConsole';
import { SettingsTab } from './ui/SettingsTab';
import { DataTab } from './ui/DataTab';
import { Header } from './ui/Header';
import { Footer } from './ui/Footer';
import { Toasts } from './ui/Toasts';
import { useToasts } from './hooks/useToasts';
import { useOutputConsole } from './hooks/useOutputConsole';
import { useImportExport } from './hooks/useImportExport';
import { useProjectSession } from './hooks/useProjectSession';
import { useAnalysisRun } from './hooks/useAnalysisRun';
import { useColumnOperations } from './hooks/useColumnOperations';
import {
  defaultParamsForGrid,
  remapParams,
  remapParamsByColumns,
  setPrimaryColumn,
  validateAnalysisColumnRefs,
} from './analyses/params';
import { defaultLogisticParams } from './analyses/logistic/defaults';
import { defaultCoxParams } from './analyses/cox/defaults';
import { defaultSurvivalParams } from './analyses/survival/defaults';
import { defaultAncovaParams } from './analyses/ancova/defaults';
import { defaultFactorialParams } from './analyses/factorial/defaults';
import { defaultRepeatedAnovaParams } from './analyses/repeatedanova/defaults';
import { defaultMultivariateParams } from './analyses/multivariate/defaults';
import { defaultNonParamParams } from './analyses/nonparamrm/defaults';
import { defaultWizardParams } from './analyses/wizard/defaults';
import { AnalysisTab } from './ui/AnalysisTab';
import { ANALYSIS_TABS } from './analyses/registry';
import type { CategoryLevel, ColType, GridData } from './grid/types';
import { createDefaultGrid } from './grid/defaults';
import {
  findInvalid as gridFindInvalid,
} from './grid/ops';
import { useGridHistory } from './grid/useGridHistory';
import { HelpPanel } from './help/HelpPanel';
import {
  setCell as gridSetCell,
  addColumnEnd as gridAddColumn,
  addRowEnd as gridAddRow,
  newGrid as gridNewGrid,
  setColType as gridSetColType,
  setColumnLevels as gridSetColumnLevels,
  recodeColumnValues as gridRecodeColumnValues,
  filterRowIndexes as gridFilterIndexes,
  type RowFilter,
  type RowFilterOp,
} from './grid/ops';
import { ImportWizard } from './io/ImportWizard';
import { ExportDialog } from './io/ExportDialog';
import { downloadExportFile } from './io/writers';
import {
  DEFAULT_PARAMS,
  DEFAULT_SETTINGS,
  loadAutosaveProject,
  type AnovaParams,
  type AncovaParams,
  type ChiSqParams,
  type ContingencyParams,
  type CorrParams,
  type CoxParams,
  type DistributionFitParams,
  type FactorialParams,
  type LogisticParams,
  type MultivariateParams,
  type NonParamParams,
  type ProjectParams,
  type ProjectSettings,
  type ProjectSnapshot,
  type RegParams,
  type RepeatedAnovaParams,
  type SampleSizeParams,
  type SurvivalParams,
  type TimeSeriesParams,
  type TostParams,
  type AgreementParams,
  type CountParams,
  type LmmParams,
  type OrdinalParams,
  type MiParams,
  type MixedAnovaParams,
  type ParametricSurvivalParams,
  type ResamplingParams,
  type GeeParams,
  type StratifiedCoxParams,
  type TdCoxParams,
  type TTestParams,
  type WizardParams,
} from './io/project';


export default function App() {
  // Restore the last silent autosave before any state is initialised, so the
  // first render already shows the user's grid and parameters.
  const [boot] = useState<ProjectSnapshot | null>(() => loadAutosaveProject());
  const [activeTab, setActiveTab] = useState<'data' | 'analysis' | 'settings' | 'help'>(
    boot?.settings.activeTab ?? DEFAULT_SETTINGS.activeTab
  );
  const [activeAnalysis, setActiveAnalysis] = useState<string>(() =>
    boot && ANALYSIS_TABS.some((tab) => tab.id === boot.settings.activeAnalysis)
      ? boot.settings.activeAnalysis
      : DEFAULT_SETTINGS.activeAnalysis
  );
  const gridHistory = useGridHistory(boot?.grid ?? createDefaultGrid());
  const grid = gridHistory.grid;
  const dataRevision = gridHistory.revision;
  const setGrid = gridHistory.commit;
  const undoGrid = () => {
    const next = gridHistory.undo();
    if (!next) return;
    const result = remapParamsByColumns(params, grid.cols, next.cols);
    setParams(result.params);
  };
  const redoGrid = () => {
    const next = gridHistory.redo();
    if (!next) return;
    const result = remapParamsByColumns(params, grid.cols, next.cols);
    setParams(result.params);
  };
  const canUndoGrid = gridHistory.canUndo;
  const canRedoGrid = gridHistory.canRedo;
  const resetGridHistory = gridHistory.setWithoutHistory;
  const [focusCell, setFocusCell] = useState<{ r: number; c: number; stamp: number } | null>(null);
  const [selRange, setSelRange] = useState<{ r0: number; c0: number; r1: number; c1: number } | null>(null);
  const [showClean, setShowClean] = useState(false);
  const [showTransform, setShowTransform] = useState(false);
  const [freezeFirstCol, setFreezeFirstCol] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const [filterAffectsAnalysis, setFilterAffectsAnalysis] = useState(false);
  const [inspectorCol, setInspectorCol] = useState(0);
  const [focusedColumn, setFocusedColumn] = useState<number | null>(null);
  const [filterCol, setFilterCol] = useState(0);
  const [filterOp, setFilterOp] = useState<RowFilterOp>('contains');
  const [filterValue, setFilterValue] = useState('');
  // Keep a validation run live: recompute counts/jump targets as the user
  // fixes cells instead of showing stale indexes.
  useEffect(() => {
    if (!validation.ran) return;
    setValidation({ ran: true, issues: gridFindInvalid(grid) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid]);
  // Selection bar holds raw indexes: clamp them after delete/merge/paste so
  // Fill/Copy/Clear never address rows/cols that no longer exist.
  // Column indexes in the filter bar go stale after delete/merge.
  useEffect(() => {
    const max = Math.max(0, grid.cols.length - 1);
    if (filterCol > max) setFilterCol(max);
  }, [grid.cols.length, filterCol]);

  useEffect(() => {
    if (inspectorCol >= grid.cols.length) {
      setInspectorCol(Math.max(0, grid.cols.length - 1));
    }
  }, [grid.cols.length, inspectorCol]);

  useEffect(() => {
    if (!selRange) return;
    const maxR = Math.max(0, grid.rows.length - 1);
    const maxC = Math.max(0, grid.cols.length - 1);
    const clamp = (v: number, m: number) => Math.max(0, Math.min(m, v));
    const next = {
      r0: clamp(selRange.r0, maxR),
      c0: clamp(selRange.c0, maxC),
      r1: clamp(selRange.r1, maxR),
      c1: clamp(selRange.c1, maxC),
    };
    if (next.r0 !== selRange.r0 || next.c0 !== selRange.c0 || next.r1 !== selRange.r1 || next.c1 !== selRange.c1) {
      setSelRange(next);
    }
  }, [grid.rows.length, grid.cols.length, selRange]);
  const [validation, setValidation] = useState<{ ran: boolean; issues: { r: number; c: number; value: string; colName: string }[] }>({
    ran: false,
    issues: [],
  });
  const { toasts, showToast } = useToasts();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undoGrid();
      } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault();
        redoGrid();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undoGrid, redoGrid]);

  const addColumn = () => {
    setGrid((prev) => gridAddColumn(prev));
  };

  const addRow = () => {
    setGrid((prev) => gridAddRow(prev));
  };


  function replaceDataset(next: GridData) {
    resetGridHistory(next);
    setParams(defaultParamsForGrid(next.cols.length));
    setDatasetId(`dataset-${Date.now().toString(36)}`);
    setOutputs([]);
    setValidation({ ran: false, issues: [] });
    setSelRange(null);
    setFocusCell(null);
    setFocusedColumn(null);
    setShowInspector(false);
    setFilterAffectsAnalysis(false);
    showToast('Dataset', 'Parameters reset and previous results cleared', 'ok');
  }

  const updateCell = (r: number, c: number, val: string) => {
    setGrid((prev) => gridSetCell(prev, r, c, val), { coalesce: true, kind: `cell-${r}-${c}` });
  };

  const updateColType = (c: number, type: ColType) => {
    setGrid((prev) => gridSetColType(prev, c, type));
  };

  // Shared by the grid header and every analysis group selector, so levels can
  // be edited from the panel where the user is already choosing groups.
  const updateColumnLevels = (c: number, levels: CategoryLevel[], reference?: string) => {
    setGrid((prev) => gridSetColumnLevels(prev, c, levels, reference));
    setValidation((v) => ({ ...v, ran: false }));
  };

  // Rename / merge / clear the group codes of one column; cells, levels,
  // reference and (when needed) the column type move together in one undo step.
  const updateColumnMeta = (
    c: number,
    patch: { label?: string; description?: string }
  ) => {
    setGrid(prev => ({
      ...prev,
      cols: prev.cols.map((col, index) =>
        index === c ? { ...col, ...patch } : col
      ),
    }));
  };

  const updateColumnRecode = (c: number, mapping: Record<string, string>) => {
    const result = gridRecodeColumnValues(grid, c, mapping);
    if (result.grid === grid) return;
    setGrid(result.grid);
    setValidation((v) => ({ ...v, ran: false }));
    showToast(
      'Recode',
      `${result.changed} cells recoded${
        result.merged > 0 ? `, ${result.merged} group${result.merged === 1 ? '' : 's'} merged` : ''
      }${
        result.cleared > 0 ? `, ${result.cleared} cells cleared` : ''
      }${result.typeChangedTo ? ` · column type → ${result.typeChangedTo}` : ''}`,
      'ok'
    );
  };

  const {
    csvInputRef,
    pendingImport,
    setPendingImport,
    showExport,
    setShowExport,
    ioPrefs,
    setIoPrefs,
    applyImportTable,
    importCsv,
    exportCsv,
  } = useImportExport({
    initialPrefs: boot?.prefs,
    setGrid,
    replaceDataset,
    setValidation,
    setActiveTab,
    showToast,
  });

  const [datasetId, setDatasetId] = useState(
    () => `dataset-${Date.now().toString(36)}`
  );

  const [params, setParams] = useState<ProjectParams>(() => {
    if (boot) return boot.params;
    return {
      ...DEFAULT_PARAMS,
      logistic: defaultLogisticParams(grid),
      cox: defaultCoxParams(grid),
      survival: defaultSurvivalParams(grid),
      ancova: defaultAncovaParams(grid),
      factorial: defaultFactorialParams(grid),
      repeatedanova: defaultRepeatedAnovaParams(grid),
      multivariate: defaultMultivariateParams(grid),
      nonparamrm: defaultNonParamParams(grid),
      wizard: defaultWizardParams(grid),
    };
  });

  const [ciLevel, setCiLevel] = useState(boot?.settings.ciLevel ?? DEFAULT_SETTINGS.ciLevel);
  const {
    outputs,
    setOutputs,
    pushOutput,
    clearOutput,
    removeOutput,
    copyOutput,
    exportChartPngs,
    exportResultsXlsx,
    exportReportHtml,
  } = useOutputConsole({ initial: boot?.outputs, grid, ciLevel, showToast });

  function updateParams<K extends keyof ProjectParams>(
    key: K,
    updater: SetStateAction<ProjectParams[K]>
  ) {
    setParams(previous => {
      const current = previous[key];
      const next =
        typeof updater === 'function'
          ? (updater as (value: ProjectParams[K]) => ProjectParams[K])(current)
          : updater;
      return next === current ? previous : { ...previous, [key]: next };
    });
  }

  function bindParam<K extends keyof ProjectParams>(key: K) {
    return (updater: SetStateAction<ProjectParams[K]>) => updateParams(key, updater);
  }

  const {
    descVars,
    ttest: ttestParams,
    anova: anovaParams,
    reg: regParams,
    corr: corrParams,
    chisq: chisqParams,
    samplesize: samplesizeParams,
    distfit: distfitParams,
    logistic: logisticParams,
    cox: coxParams,
    survival: survivalParams,
    timeseries: timeseriesParams,
    contingency: contingencyParams,
    ancova: ancovaParams,
    factorial: factorialParams,
    repeatedanova: repeatedAnovaParams,
    multivariate: multivariateParams,
    nonparamrm: nonParamParams,
    wizard: wizardParams,
    tost: tostParams,
    agreement: agreementParams,
    countreg: countParams,
    lmm: lmmParams,
    ordinal: ordinalParams,
    mi: miParams,
    mixedanova: mixedAnovaParams,
    parametric: parametricParams,
    resampling: resamplingParams,
    gee: geeParams,
    stratcox: stratCoxParams,
    tdcox: tdCoxParams,
  } = params;

  const setDescVars = bindParam('descVars');
  const setTTestParams = bindParam('ttest');
  const setAnovaParams = bindParam('anova');
  const setRegParams = bindParam('reg');
  const setCorrParams = bindParam('corr');
  const setChisqParams = bindParam('chisq');
  const setSamplesizeParams = bindParam('samplesize');
  const setDistfitParams = bindParam('distfit');
  const setLogisticParams = bindParam('logistic');
  const setCoxParams = bindParam('cox');
  const setSurvivalParams = bindParam('survival');
  const setTimeseriesParams = bindParam('timeseries');
  const setContingencyParams = bindParam('contingency');
  const setAncovaParams = bindParam('ancova');
  const setFactorialParams = bindParam('factorial');
  const setRepeatedAnovaParams = bindParam('repeatedanova');
  const setMultivariateParams = bindParam('multivariate');
  const setNonParamParams = bindParam('nonparamrm');
  const setWizardParams = bindParam('wizard');
  const setTostParams = bindParam('tost');
  const setAgreementParams = bindParam('agreement');
  const setCountParams = bindParam('countreg');
  const setLmmParams = bindParam('lmm');
  const setOrdinalParams = bindParam('ordinal');
  const setMiParams = bindParam('mi');
  const setMixedAnovaParams = bindParam('mixedanova');
  const setParametricParams = bindParam('parametric');
  const setResamplingParams = bindParam('resampling');
  const setGeeParams = bindParam('gee');
  const setStratCoxParams = bindParam('stratcox');
  const setTdCoxParams = bindParam('tdcox');

  const { applyColumnOperation, insertColumn, duplicateColumn, moveColumn, deleteColumn } =
    useColumnOperations({ grid, params, setParams, setGrid, showToast });

  const assignPrimary = (column: number) => {
    const result = setPrimaryColumn(activeAnalysis, params, column);
    if (!result) {
      showToast('Analysis', 'This procedure has no primary column role', 'warn');
      return;
    }
    setParams(result.params);
    showToast('Analysis', `Assigned to ${result.role}`, 'ok');
  };

  // Identità stabile: il timer di autosave non deve ripartire a ogni render.
  const settings = useMemo<ProjectSettings>(
    () => ({ ciLevel, activeAnalysis, activeTab }),
    [ciLevel, activeAnalysis, activeTab]
  );

  const roleErrors = validateAnalysisColumnRefs(activeAnalysis, params, grid.cols.length);

  const filterNeedsValue = filterOp !== 'empty' && filterOp !== 'notEmpty';
  const activeRowFilter: RowFilter | null =
    showFilter && grid.cols.length > 0 && (!filterNeedsValue || filterValue.trim() !== '')
      ? { col: Math.min(filterCol, grid.cols.length - 1), op: filterOp, value: filterValue }
      : null;
  const visibleRowCount = activeRowFilter
    ? gridFilterIndexes(grid, activeRowFilter).length
    : grid.rows.length;
  const filterSignature = JSON.stringify({
    mode: filterAffectsAnalysis ? 'analysis' : 'view',
    filter: activeRowFilter,
  });
  const analysisGrid = useMemo<GridData>(() => {
    if (!filterAffectsAnalysis || !activeRowFilter) return grid;
    return {
      cols: grid.cols,
      rows: gridFilterIndexes(grid, activeRowFilter).map(index => grid.rows[index]),
    };
  }, [grid, filterAffectsAnalysis, activeRowFilter]);

  const restoreProject = (project: ProjectSnapshot) => {
    resetGridHistory(project.grid);
    setParams(project.params);
    setCiLevel(project.settings.ciLevel);
    setActiveAnalysis(
      ANALYSIS_TABS.some((tab) => tab.id === project.settings.activeAnalysis)
        ? project.settings.activeAnalysis
        : DEFAULT_SETTINGS.activeAnalysis
    );
    setActiveTab(project.settings.activeTab);
    setIoPrefs(project.prefs);
    // Output snapshots are restored together with the data they were computed
    // from, so the console and the grid always belong to the same session.
    setOutputs(restoredOutputs(project.outputs));
    setValidation({ ran: false, issues: [] });
    setSelRange(null);
    setFocusCell(null);
    setFocusedColumn(null);
    setFilterAffectsAnalysis(false);
  };

  // --- Project persistence (.lzs + silent autosave) ---
  const { projectInputRef, lastAutosave, saveProjectFile, openProjectFile } = useProjectSession({
    boot,
    grid,
    prefs: ioPrefs,
    settings,
    params,
    outputs,
    restore: restoreProject,
    showToast,
  });


  // Tutte le analisi convergono qui: `build*Output` restituisce o il blocco
  // pronto per la console, o il motivo del rifiuto. Un solo punto di errore.
  const emit = (result: AnalysisRunResult): boolean => {
    if ('reason' in result) {
      showToast('Error', result.reason, 'error');
      return false;
    }
    pushOutput(result.node, result.report, activeAnalysis, {
      dataRevision,
      datasetId,
      filterSignature,
    });
    return true;
  };

  const { runAnalysis } = useAnalysisRun({
    activeAnalysis,
    grid: analysisGrid,
    params,
    ciLevel,
    emit,
    warn: (message) => showToast('Analysis', message, 'warn'),
  });

  return (
    <div className="flex flex-col h-screen bg-bg text-text font-sans selection:bg-accent/30">
      {/* Main Tabs */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'data' && (
          <DataTab
            grid={grid}
            setGrid={setGrid}
            onNewDataset={() => replaceDataset(gridNewGrid())}
            onInsertColumn={insertColumn}
            onDuplicateColumn={duplicateColumn}
            onMoveColumn={moveColumn}
            onDeleteColumn={deleteColumn}
            onColumnOperation={applyColumnOperation}
            canUndoGrid={canUndoGrid}
            canRedoGrid={canRedoGrid}
            undoGrid={undoGrid}
            redoGrid={redoGrid}
            csvInputRef={csvInputRef}
            projectInputRef={projectInputRef}
            exportCsv={exportCsv}
            importCsv={importCsv}
            saveProjectFile={saveProjectFile}
            openProjectFile={openProjectFile}
            lastAutosave={lastAutosave}
            showToast={showToast}
            validation={validation}
            setValidation={setValidation}
            focusCell={focusCell}
            setFocusCell={setFocusCell}
            selRange={selRange}
            setSelRange={setSelRange}
            freezeFirstCol={freezeFirstCol}
            setFreezeFirstCol={setFreezeFirstCol}
            showFilter={showFilter}
            setShowFilter={setShowFilter}
            showInspector={showInspector}
            setShowInspector={setShowInspector}
            focusedColumn={focusedColumn}
            onFocusColumn={setFocusedColumn}
            filterAffectsAnalysis={filterAffectsAnalysis}
            setFilterAffectsAnalysis={setFilterAffectsAnalysis}
            inspectorCol={inspectorCol}
            setInspectorCol={setInspectorCol}
            onColumnMeta={updateColumnMeta}
            filterCol={filterCol}
            setFilterCol={setFilterCol}
            filterOp={filterOp}
            setFilterOp={setFilterOp}
            filterValue={filterValue}
            setFilterValue={setFilterValue}
            filterNeedsValue={filterNeedsValue}
            activeRowFilter={activeRowFilter}
            visibleRowCount={visibleRowCount}
            showClean={showClean}
            setShowClean={setShowClean}
            showTransform={showTransform}
            setShowTransform={setShowTransform}
            updateCell={updateCell}
            updateColType={updateColType}
            updateColumnLevels={updateColumnLevels}
            updateColumnRecode={updateColumnRecode}
            setActiveTab={setActiveTab}
            addColumn={addColumn}
            addRow={addRow}
          />
        )}

        {activeTab === 'analysis' && (
          <AnalysisTab
            activeAnalysis={activeAnalysis}
            setActiveAnalysis={setActiveAnalysis}
            ciLevel={ciLevel}
            setCiLevel={setCiLevel}
            descVars={descVars}
            setDescVars={setDescVars}
            ttestParams={ttestParams}
            setTTestParams={setTTestParams}
            anovaParams={anovaParams}
            setAnovaParams={setAnovaParams}
            regParams={regParams}
            setRegParams={setRegParams}
            corrParams={corrParams}
            setCorrParams={setCorrParams}
            chisqParams={chisqParams}
            setChisqParams={setChisqParams}
            samplesizeParams={samplesizeParams}
            setSamplesizeParams={setSamplesizeParams}
            distfitParams={distfitParams}
            setDistfitParams={setDistfitParams}
            logisticParams={logisticParams}
            setLogisticParams={setLogisticParams}
            coxParams={coxParams}
            setCoxParams={setCoxParams}
            survivalParams={survivalParams}
            setSurvivalParams={setSurvivalParams}
            timeseriesParams={timeseriesParams}
            setTimeseriesParams={setTimeseriesParams}
            contingencyParams={contingencyParams}
            setContingencyParams={setContingencyParams}
            ancovaParams={ancovaParams}
            setAncovaParams={setAncovaParams}
            factorialParams={factorialParams}
            setFactorialParams={setFactorialParams}
            repeatedAnovaParams={repeatedAnovaParams}
            setRepeatedAnovaParams={setRepeatedAnovaParams}
            multivariateParams={multivariateParams}
            setMultivariateParams={setMultivariateParams}
            nonParamParams={nonParamParams}
            setNonParamParams={setNonParamParams}
            wizardParams={wizardParams}
            setWizardParams={setWizardParams}
            tostParams={tostParams}
            setTostParams={setTostParams}
            agreementParams={agreementParams}
            setAgreementParams={setAgreementParams}
            countParams={countParams}
            setCountParams={setCountParams}
            lmmParams={lmmParams}
            setLmmParams={setLmmParams}
            ordinalParams={ordinalParams}
            setOrdinalParams={setOrdinalParams}
            miParams={miParams}
            setMiParams={setMiParams}
            mixedAnovaParams={mixedAnovaParams}
            setMixedAnovaParams={setMixedAnovaParams}
            parametricParams={parametricParams}
            setParametricParams={setParametricParams}
            resamplingParams={resamplingParams}
            setResamplingParams={setResamplingParams}
            geeParams={geeParams}
            setGeeParams={setGeeParams}
            stratCoxParams={stratCoxParams}
            setStratCoxParams={setStratCoxParams}
            tdCoxParams={tdCoxParams}
            setTdCoxParams={setTdCoxParams}
            grid={grid}
            outputs={outputs}
            dataRevision={dataRevision}
            datasetId={datasetId}
            roleErrors={roleErrors}
            filterAffectsAnalysis={filterAffectsAnalysis}
            visibleRowCount={visibleRowCount}
            activeRowFilter={activeRowFilter}
            filterSignature={filterSignature}
            focusedColumn={focusedColumn}
            onAssignPrimary={assignPrimary}
            removeOutput={removeOutput}
            clearOutput={clearOutput}
            copyOutput={copyOutput}
            exportChartPngs={exportChartPngs}
            exportReportHtml={exportReportHtml}
            exportResultsXlsx={exportResultsXlsx}
            setActiveTab={setActiveTab}
            runAnalysis={runAnalysis}
            updateColumnLevels={updateColumnLevels}
            updateColumnRecode={updateColumnRecode}
          />
        )}

        {activeTab === 'help' && <HelpPanel />}

        {activeTab === 'settings' && (
          <SettingsTab ioPrefs={ioPrefs} setIoPrefs={setIoPrefs} />
        )}
      </main>

      {pendingImport && (
        <ImportWizard
          fileName={pendingImport.fileName}
          text={pendingImport.text}
          sheets={pendingImport.sheets}
          gridCols={grid.cols.map((c) => c.name)}
          onClose={() => setPendingImport(null)}
          onApply={applyImportTable}
        />
      )}
      {showExport && (
        <ExportDialog
          grid={grid}
          onClose={() => setShowExport(false)}
          onExport={(files) => {
            files.forEach((f) => downloadExportFile(f));
            setShowExport(false);
            showToast('Export', files.map((f) => f.fileName).join(' + '), 'ok');
          }}
        />
      )}

      {/* Footer / Statusbar */}
      <Footer grid={grid} />

      {/* Toasts */}
      <Toasts toasts={toasts} />
    </div>
  );
}
