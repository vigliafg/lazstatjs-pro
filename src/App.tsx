import { lazy, Suspense, useState, useEffect, useMemo } from 'react';
import type { AnalysisRunResult } from './analyses/types';
import { restoredOutputs, type OutputEntry } from './ui/OutputConsole';
import { SettingsTab } from './ui/SettingsTab';
import { DataWorkspace } from './ui/DataWorkspace';
import { Header } from './ui/Header';
import { Footer } from './ui/Footer';
import { Toasts } from './ui/Toasts';
import { ErrorBoundary } from './ui/ErrorBoundary';
import { UiModeProvider, type UiMode } from './components/UiMode';
import { useToasts } from './hooks/useToasts';
import { useOutputConsole } from './hooks/useOutputConsole';
import { useImportExport } from './hooks/useImportExport';
import { useProjectSession } from './hooks/useProjectSession';
import { useAnalysisRun } from './hooks/useAnalysisRun';
import { useColumnOperations } from './hooks/useColumnOperations';
import { useProjectParams } from './hooks/useProjectParams';
import {
  defaultParamsForGrid,
  remapParams,
  remapParamsByColumns,
  setPrimaryColumn,
  validateAnalysisColumnRefs,
} from './analyses/params';
import { assignRole, roleStates, validateRoleTypes } from './analyses/roles';
import {
  analysisParamsKey,
  analysisParamsOf,
  analysisParamsSignature,
  withAnalysisParams,
} from './analyses/paramsSnapshot';
const AnalysisTab = lazy(() =>
  import('./ui/AnalysisTab').then(module => ({ default: module.AnalysisTab }))
);
import { ANALYSIS_TABS } from './analyses/registry';
import { t } from './i18n';
import { maskMissingCodes } from './grid/types';
import type { CategoryLevel, ColType, GridData } from './grid/types';
import { createDefaultGrid } from './grid/defaults';
import {
  findInvalid as gridFindInvalid,
} from './grid/ops';
import { useGridHistory } from './grid/useGridHistory';
const HelpPanel = lazy(() =>
  import('./help/HelpPanel').then(module => ({ default: module.HelpPanel }))
);
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
const ImportWizard = lazy(() =>
  import('./io/ImportWizard').then(module => ({ default: module.ImportWizard }))
);
const ExportDialog = lazy(() =>
  import('./io/ExportDialog').then(module => ({ default: module.ExportDialog }))
);
import { downloadExportFile } from './io/writers';
import {
  DEFAULT_SETTINGS,
  loadAutosaveProject,
  parseParams,
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
  const gridHistory = useGridHistory(boot?.grid ?? createDefaultGrid(), boot?.dataRevision ?? 0);
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
  const [showFilter, setShowFilter] = useState(false);
  const [filterAffectsAnalysis, setFilterAffectsAnalysis] = useState(false);
  const [focusedColumn, setFocusedColumn] = useState<number | null>(null);
  const [filterCol, setFilterCol] = useState(0);
  const [filterOp, setFilterOp] = useState<RowFilterOp>('contains');
  const [filterValue, setFilterValue] = useState('');
  // Keep a validation run live: recompute counts/jump targets as the user
  // fixes cells instead of showing stale indexes.
  useEffect(() => {
    if (!validation.ran) return;
    // Recompute after the user pauses: a full scan on every keystroke makes
    // large grids unusable while the validation bar stays open.
    const timer = setTimeout(() => {
      setValidation({ ran: true, issues: gridFindInvalid(grid) });
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid]);
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

  /** Replacing the dataset cannot be undone, so it always asks first. */
  const newDataset = () => {
    if (!window.confirm(t('data.confirmNew'))) return;
    replaceDataset(gridNewGrid());
  };


  function replaceDataset(next: GridData) {
    resetGridHistory(next);
    setParams(defaultParamsForGrid(next.cols.length));
    setDatasetId(`dataset-${Date.now().toString(36)}`);
    setOutputs([]);
    setValidation({ ran: false, issues: [] });
    setFocusedColumn(null);
    setFilterAffectsAnalysis(false);
    // A view filter from the previous dataset would hide the new rows.
    setShowFilter(false);
    setFilterValue('');
    setFilterOp('contains');
    setFilterCol(0);
    showToast(t('toast.dataset'), t('data.replaceDone'), 'ok');
  }

  const updateCell = (r: number, c: number, val: string) => {
    setGrid((prev) => gridSetCell(prev, r, c, val), {
      coalesce: true,
      kind: `cell-${r}-${c}`,
      changedCell: { r, c },
      changedCol: c,
    });
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
    patch: { label?: string; description?: string; missing?: string[]; formula?: string }
  ) => {
    setGrid(prev => ({
      ...prev,
      cols: prev.cols.map((col, index) => {
        if (index !== c) return col;
        const next = { ...col, ...patch };
        // An empty formula removes the computed-column behaviour.
        if (patch.formula !== undefined && !patch.formula.trim()) delete next.formula;
        return next;
      }),
    }));
  };

  const updateColumnRecode = (c: number, mapping: Record<string, string>) => {
    const result = gridRecodeColumnValues(grid, c, mapping);
    if (result.grid === grid) return;
    setGrid(result.grid);
    setValidation((v) => ({ ...v, ran: false }));
    showToast(
      t('recode.title'),
      `${result.changed} ${t('recode.cells')}${
        result.merged > 0 ? `, ${result.merged} ${t('recode.merged')}` : ''
      }${
        result.cleared > 0 ? `, ${result.cleared} ${t('recode.cleared')}` : ''
      }${result.typeChangedTo ? ` · ${t('recode.typeChanged')} → ${result.typeChangedTo}` : ''}`,
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
    () => boot?.datasetId ?? `dataset-${Date.now().toString(36)}`
  );

  const { params, setParams } = useProjectParams(boot, grid);

  const [ciLevel, setCiLevel] = useState(boot?.settings.ciLevel ?? DEFAULT_SETTINGS.ciLevel);
  const [uiMode, setUiMode] = useState<UiMode>(boot?.settings.uiMode ?? DEFAULT_SETTINGS.uiMode);
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
    exportReportWord,
  } = useOutputConsole({ initial: boot?.outputs, grid, ciLevel, showToast });

  const { applyColumnOperation, insertColumn, duplicateColumn, moveColumn, deleteColumn } =
    useColumnOperations({ grid, params, setParams, setGrid, showToast });

  const assignPrimary = (column: number) => {
    const result = setPrimaryColumn(activeAnalysis, params, column);
    if (!result) {
      showToast(t('toast.analysis'), t('analysis.noPrimaryRole'), 'warn');
      return;
    }
    setParams(result.params);
    showToast(t('toast.analysis'), `${t('analysis.roleAssigned')} ${result.role}`, 'ok');
  };

  const assignRoleTo = (column: number, roleKey: string) => {
    const next = assignRole(activeAnalysis, params, roleKey, column);
    if (!next) {
      showToast(t('toast.analysis'), t('analysis.roleRejects'), 'warn');
      return;
    }
    setParams(next);
    const role = roleStates(activeAnalysis, params).find(item => item.key === roleKey);
    showToast(t('toast.analysis'), `${t('analysis.roleAssigned')} ${role?.label ?? roleKey}`, 'ok');
  };

  // Identità stabile: il timer di autosave non deve ripartire a ogni render.
  const settings = useMemo<ProjectSettings>(
    () => ({ ciLevel, activeAnalysis, activeTab, uiMode }),
    [ciLevel, activeAnalysis, activeTab, uiMode]
  );

  const roleErrors = [
    ...validateAnalysisColumnRefs(activeAnalysis, params, grid.cols.length),
    ...validateRoleTypes(activeAnalysis, params, grid),
  ];
  const roles = roleStates(activeAnalysis, params);

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
  // Declared missing codes are blanked before every runner sees the data, so
  // the analysis N excludes them without changing any kernel.
  const maskedGrid = useMemo<GridData>(() => maskMissingCodes(grid), [grid]);
  const analysisGrid = useMemo<GridData>(() => {
    if (!filterAffectsAnalysis || !activeRowFilter) return maskedGrid;
    return {
      cols: maskedGrid.cols,
      rows: gridFilterIndexes(grid, activeRowFilter).map(index => maskedGrid.rows[index]),
    };
  }, [grid, maskedGrid, filterAffectsAnalysis, activeRowFilter]);

  const restoreProject = (project: ProjectSnapshot) => {
    resetGridHistory(project.grid, project.dataRevision ?? 0);
    setDatasetId(project.datasetId ?? `dataset-${Date.now().toString(36)}`);
    setParams(project.params);
    setCiLevel(project.settings.ciLevel);
    setUiMode(project.settings.uiMode);
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
    setFocusedColumn(null);
    setFilterAffectsAnalysis(false);
    setShowFilter(false);
    setFilterValue('');
    setFilterOp('contains');
    setFilterCol(0);
  };

  // --- Project persistence (.lzs + silent autosave) ---
  const {
    projectInputRef,
    lastAutosave,
    saveProjectFile,
    openProjectFile,
    restoreBackup,
    recentProjects,
    clearRecentProjects,
  } = useProjectSession({
    boot,
    grid,
    datasetId,
    dataRevision,
    prefs: ioPrefs,
    settings,
    params,
    outputs,
    restore: restoreProject,
    showToast,
  });


  // Tutte le analisi convergono qui: `build*Output` restituisce o il blocco
  // pronto per la console, o il motivo del rifiuto. Un solo punto di errore.
  const emit = (
    result: AnalysisRunResult,
    analysisId: string = activeAnalysis,
    paramsUsed = params,
    options?: { live?: boolean; ciLevel?: number }
  ): boolean => {
    if ('reason' in result) {
      showToast(t('toast.error'), result.reason, 'error');
      return false;
    }
    pushOutput(result.node, result.report, analysisId, {
      dataRevision,
      datasetId,
      filterSignature,
      params: analysisParamsOf(analysisId, paramsUsed),
      paramsSignature: analysisParamsSignature(analysisId, paramsUsed),
      ciLevel: options?.ciLevel ?? ciLevel,
      live: options?.live,
    });
    return true;
  };

  const { runAnalysis, runAnalysisWith, runAnalysisLive } = useAnalysisRun({
    activeAnalysis,
    grid: analysisGrid,
    params,
    ciLevel,
    emit,
    warn: (message) => showToast(t('toast.analysis'), message, 'warn'),
  });

  const paramsSignatureFor = (analysisId: string) =>
    analysisParamsSignature(analysisId, params);

  /** Restore a card's saved parameters into the live project parameters. */
  const restoreOutputParams = (entry: OutputEntry): ProjectParams | null => {
    if (!entry.analysisId || entry.params === undefined) return null;
    if (!analysisParamsKey(entry.analysisId)) return null;
    const next = parseParams(
      withAnalysisParams(params, entry.analysisId, entry.params),
      grid.cols.length
    );
    setParams(next);
    if (entry.ciLevel !== undefined) setCiLevel(entry.ciLevel);
    setActiveAnalysis(entry.analysisId);
    setActiveTab('analysis');
    return next;
  };

  const applyOutputParams = (entry: OutputEntry) => {
    const next = restoreOutputParams(entry);
    if (!next) {
      showToast(t('toast.output'), t('analysis.noSavedParams'), 'warn');
      return;
    }
    showToast(t('toast.output'), t('analysis.paramsRestored'), 'ok');
  };

  const rerunAllOutputs = () => {
    const runnable = outputs.filter(
      entry => entry.analysisId && entry.params !== undefined && analysisParamsKey(entry.analysisId)
    );
    void (async () => {
      let done = 0;
      for (const entry of runnable) {
        if (!entry.analysisId) continue;
        const next = parseParams(
          withAnalysisParams(params, entry.analysisId, entry.params),
          grid.cols.length
        );
        if (await runAnalysisWith(entry.analysisId, next, entry.ciLevel)) done += 1;
      }
      if (done > 0) {
        showToast(t('toast.output'), `${done} ${t('output.rerunAll')}`, 'ok');
      }
    })();
  };

  const rerunOutput = (entry: OutputEntry) => {
    const next = restoreOutputParams(entry);
    if (!next || !entry.analysisId) {
      showToast(t('toast.output'), t('analysis.noSavedParams'), 'warn');
      return;
    }
    void runAnalysisWith(entry.analysisId, next, entry.ciLevel).then(ok => {
      if (ok) showToast(t('toast.output'), t('analysis.reran'), 'ok');
    });
  };

  return (
    <UiModeProvider mode={uiMode}>
    <div className="flex flex-col h-screen bg-bg text-text font-sans selection:bg-accent/30">
      {/* Main Tabs */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} uiMode={uiMode} setUiMode={setUiMode} />

      {/* Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <ErrorBoundary resetKey={activeTab} label={activeTab}>
        <div className={activeTab === 'data' ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}>
          <DataWorkspace
            grid={grid}
            datasetId={datasetId}
            setGrid={setGrid}
            onNewDataset={newDataset}
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
            focusedColumn={focusedColumn}
            onFocusColumn={setFocusedColumn}
            filterAffectsAnalysis={filterAffectsAnalysis}
            setFilterAffectsAnalysis={setFilterAffectsAnalysis}
            showFilter={showFilter}
            setShowFilter={setShowFilter}
            filterCol={filterCol}
            setFilterCol={setFilterCol}
            filterOp={filterOp}
            setFilterOp={setFilterOp}
            filterValue={filterValue}
            setFilterValue={setFilterValue}
            filterNeedsValue={filterNeedsValue}
            activeRowFilter={activeRowFilter}
            visibleRowCount={visibleRowCount}
            onColumnMeta={updateColumnMeta}
            updateCell={updateCell}
            updateColType={updateColType}
            updateColumnLevels={updateColumnLevels}
            updateColumnRecode={updateColumnRecode}
            setActiveTab={setActiveTab}
            addColumn={addColumn}
            addRow={addRow}
          />
        </div>

        {activeTab === 'analysis' && (
          <Suspense fallback={<div className="flex flex-1 items-center justify-center text-[11px] text-text3">{t('app.loadingAnalysis')}</div>}>
          <AnalysisTab
            activeAnalysis={activeAnalysis}
            setActiveAnalysis={setActiveAnalysis}
            ciLevel={ciLevel}
            setCiLevel={setCiLevel}
            params={params}
            setParams={setParams}
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
            roles={roles}
            onAssignRole={assignRoleTo}
            onRerunOutput={rerunOutput}
            onRerunAllOutputs={rerunAllOutputs}
            onApplyOutputParams={applyOutputParams}
            paramsSignatureFor={paramsSignatureFor}
            removeOutput={removeOutput}
            clearOutput={clearOutput}
            copyOutput={copyOutput}
            exportChartPngs={exportChartPngs}
            exportReportHtml={exportReportHtml}
            exportReportWord={exportReportWord}
            exportResultsXlsx={exportResultsXlsx}
            setActiveTab={setActiveTab}
            runAnalysis={runAnalysis}
            runAnalysisLive={runAnalysisLive}
            updateColumnLevels={updateColumnLevels}
            updateColumnRecode={updateColumnRecode}
          />
          </Suspense>
        )}

        {activeTab === 'help' && (
          <Suspense fallback={<div className="flex flex-1 items-center justify-center text-[11px] text-text3">{t('app.loadingHelp')}</div>}>
            <HelpPanel />
          </Suspense>
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            ioPrefs={ioPrefs}
            setIoPrefs={setIoPrefs}
            onNewDataset={newDataset}
            onSaveProject={saveProjectFile}
            onOpenProject={() => projectInputRef.current?.click()}
            onExport={() => setShowExport(true)}
            onRestoreBackup={() => void restoreBackup()}
            recentProjects={recentProjects}
            onClearRecent={clearRecentProjects}
          />
        )}
        </ErrorBoundary>
      </main>

      {pendingImport && (
        <Suspense fallback={null}>
        <ImportWizard
          fileName={pendingImport.fileName}
          text={pendingImport.text}
          sheets={pendingImport.sheets}
          gridCols={grid.cols.map((c) => c.name)}
          onClose={() => setPendingImport(null)}
          onApply={applyImportTable}
        />
        </Suspense>
      )}
      {showExport && (
        <Suspense fallback={null}>
        <ExportDialog
          grid={grid}
          onClose={() => setShowExport(false)}
          onExport={(files) => {
            files.forEach((f) => downloadExportFile(f));
            setShowExport(false);
            showToast(t('toast.export'), files.map((f) => f.fileName).join(' + '), 'ok');
          }}
        />
        </Suspense>
      )}

      <div role="status" aria-live="polite" className="sr-only">
        {outputs.length > 0 ? `${outputs[outputs.length - 1].title} ready` : ''}
      </div>

      {/* Footer / Statusbar */}
      <Footer grid={grid} />

      {/* Toasts */}
      <Toasts toasts={toasts} />
    </div>
    </UiModeProvider>
  );
}
