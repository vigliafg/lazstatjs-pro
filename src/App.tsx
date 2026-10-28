import React, { useState, useEffect, useCallback, useRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { 
  BarChart3, 
  Settings, 
  Database, 
  FileText, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Play, 
  CheckCircle2, 
  ChevronDown,
  HelpCircle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jStat } from './stats/jstat';
import { ResultTables } from './components/ResultTable';
import { AnalysisReport } from './components/AnalysisReport';
import { buildDescriptiveOutput } from './analyses/descriptive/run';
import { buildChiSquareOutput } from './analyses/chisquare/run';
import { buildCorrelationOutput } from './analyses/correlation/run';
import { buildAnovaOutput } from './analyses/anova/run';
import { buildRegressionOutput } from './analyses/regression/run';
import { buildTTestOutput } from './analyses/ttest/run';
import { ContingencyAnalysis, type ContingencyHandle } from './analyses/ContingencyAnalysis';
import { SampleSizeAnalysis, type SampleSizeHandle } from './analyses/SampleSizeAnalysis';
import { DistributionFitAnalysis, type DistributionFitHandle } from './analyses/DistributionFitAnalysis';
import { FactorialAnovaAnalysis, type FactorialAnovaHandle } from './analyses/FactorialAnovaAnalysis';
import { LogisticAnalysis, type LogisticHandle } from './analyses/LogisticAnalysis';
import { TimeSeriesAnalysis, type TimeSeriesHandle } from './analyses/TimeSeriesAnalysis';
import { SurvivalAnalysis, type SurvivalHandle } from './analyses/SurvivalAnalysis';
import { CoxAnalysis, type CoxHandle } from './analyses/CoxAnalysis';
import { WizardAnalysis, type WizardHandle } from './analyses/WizardAnalysis';
import {
  NonParamRepeatedAnalysis,
  type NonParamRepeatedHandle,
} from './analyses/NonParamRepeatedAnalysis';
import { RepeatedAnovaAnalysis, type RepeatedAnovaHandle } from './analyses/RepeatedAnovaAnalysis';
import { MultivariateAnalysis, type MultivariateHandle } from './analyses/MultivariateAnalysis';
import { AncovaAnalysis, type AncovaHandle } from './analyses/AncovaAnalysis';
import {
  type ReportSpec,
} from './stats/report';
import {
  VictoryAxis,
  VictoryBoxPlot,
  VictoryChart,
  VictoryLabel,
  VictoryScatter,
  VictoryTheme,
} from 'victory';
import {

  calcWilcoxonSignedRank, 
  calcMannWhitneyU, 
  calcKruskalWallis, 
  calcTheilSen, 
  calcKendallTau,
  NormalityResult
} from './statsHelpers';
import { pairedValues, parseNum } from './stats/core';
import type { CategoryLevel, ColType, GridData } from './grid/types';
import {
  findInvalid as gridFindInvalid,
  invalidByColumn as gridInvalidByColumn,
  coerceGrid as gridCoerce,
} from './grid/ops';
import {
  nonEmptyRowCount,
  countInvalidCells,
  analysisRows,
  groupColumnIndexes,
  isGroupColumn,
} from './grid/types';
import { useGridHistory } from './grid/useGridHistory';
import { LevelsEditor } from './grid/LevelsEditor';
import { HelpPanel } from './help/HelpPanel';
import {
  setCell as gridSetCell,
  addColumnEnd as gridAddColumn,
  addRowEnd as gridAddRow,
  setColType as gridSetColType,
  clearGrid as gridClear,
  newGrid as makeNewGrid,
  renameColumn as gridRenameColumn,
  insertColumnAt as gridInsertColumn,
  duplicateColumn as gridDuplicateColumn,
  moveColumn as gridMoveColumn,
  deleteColumn as gridDeleteColumn,
  insertRowAt as gridInsertRow,
  deleteRow as gridDeleteRow,
  pasteTsvAt as gridPasteTsv,
  parseTsv as parseTsvBlock,
  rangeToTsv as gridRangeToTsv,
  clearRange as gridClearRange,
  fillDownRange as gridFillDown,
  sortByColumn as gridSortByColumn,
  setColumnLevels as gridSetColumnLevels,
  recodeColumnValues as gridRecodeColumnValues,
  filterRowIndexes as gridFilterIndexes,
  type RowFilter,
  type RowFilterOp,
} from './grid/ops';
import { DataGrid } from './grid/DataGrid';
import { CleanPanel } from './grid/CleanPanel';
import { TransformPanel } from './grid/TransformPanel';
import { ImportWizard, type ImportMode } from './io/ImportWizard';
import { ExportDialog } from './io/ExportDialog';
import type { ImportTable } from './io/readers';
import { looksLikeJson } from './io/detect';
import { readDelimitedTable, readJsonTable } from './io/readers';
import { downloadBytes, downloadExportFile, downloadText } from './io/writers';
import {
  buildResultsWorkbookFromElement,
  readXlsxSheets,
  XLSX_MIME,
  type XlsxSheet,
} from './io/xlsx';
import { loadPrefs, savePrefs } from './io/prefs';
import {
  DEFAULT_PARAMS,
  DEFAULT_SETTINGS,
  createProjectSnapshot,
  loadAutosaveProject,
  parseProject,
  saveAutosaveText,
  serializeProject,
  type AnovaParams,
  type ChiSqParams,
  type CorrParams,
  type ProjectSnapshot,
  type RegParams,
  type TTestParams,
} from './io/project';
import { copyText } from './io/clipboard';
import {
  capStoredOutputs,
  extractOutputTitle,
  sanitizeOutputHtml,
  type StoredOutput,
} from './io/outputs';
import { exportChartsAsPng } from './io/chartExport';
import { buildReportFromElement } from './io/reportExport';

// --- Types ---
interface AnalysisConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
}

/** A console block: live React nodes plus the HTML snapshot stored in the project. */
interface OutputEntry extends StoredOutput {
  node?: React.ReactNode;
}

/** Restored blocks are static: sanitise once, then inject the stored markup. */
const restoredOutputs = (stored: StoredOutput[] | undefined): OutputEntry[] =>
  (stored ?? [])
    .map((entry) => ({ ...entry, html: sanitizeOutputHtml(entry.html) }))
    .filter((entry) => entry.html.length > 0);

// --- Constants ---
const PALETTE = ['#4f9cf9', '#34d399', '#f87171', '#fbbf24', '#a78bfa', '#38bdf8', '#fb923c', '#e879f9'];

const ANALYSIS_TABS = [
  { id: 'wizard', label: 'Wizard' },
  { id: 'descriptive', label: 'Descriptive' },
  { id: 'ttest', label: 'T-Test' },
  { id: 'anova', label: 'ANOVA' },
  { id: 'regression', label: 'Regression' },
  { id: 'correlation', label: 'Correlation' },
  { id: 'multivariate', label: 'Multivariate' },
  { id: 'chisquare', label: 'Chi-Square (χ²)' },
  { id: 'contingency', label: 'Contingency (R×C)' },
  { id: 'nonparamrm', label: 'Non-parametric RM' },
  { id: 'repeatedanova', label: 'Repeated ANOVA' },
  { id: 'samplesize', label: 'Sample Size / Power' },
  { id: 'distfit', label: 'Distribution Fit' },
  { id: 'factorial', label: 'Factorial ANOVA' },
  { id: 'ancova', label: 'ANCOVA' },
  { id: 'logistic', label: 'Logistic Regression' },
  { id: 'timeseries', label: 'Time Series' },
  { id: 'survival', label: 'Survival (KM)' },
  { id: 'cox', label: 'Cox (PH)' },
];

// --- Helper Functions ---
const fmt = (x: number, d = 4) => {
  if (isNaN(x) || !isFinite(x)) return '—';
  return parseFloat(x.toFixed(d)).toString();
};

const fmtP = (p: number) => {
  if (isNaN(p) || !isFinite(p)) return '—';
  if (p < 0.001) return '< 0.001';
  return p.toFixed(4);
};

const createDefaultGrid = (): GridData => ({
  cols: [
    { name: 'Score_Pre', type: 'num' },
    { name: 'Score_Post', type: 'num' },
    { name: 'Group', type: 'int' },
    { name: 'Age', type: 'int' }
  ],
  rows: Array.from({ length: 20 }, (_, i) => {
    if (i < 10) return [(50 + i * 2).toString(), (60 + i * 2.5).toString(), '1', (20 + (i % 3)).toString()];
    if (i < 20) return [(45 + (i - 10) * 3).toString(), (55 + (i - 10) * 2).toString(), '2', (21 + (i % 2)).toString()];
    return ['', '', '', ''];
  })
});

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
  const setGrid = gridHistory.commit;
  const undoGrid = gridHistory.undo;
  const redoGrid = gridHistory.redo;
  const canUndoGrid = gridHistory.canUndo;
  const canRedoGrid = gridHistory.canRedo;
  const resetGridHistory = gridHistory.setWithoutHistory;
  const [focusCell, setFocusCell] = useState<{ r: number; c: number; stamp: number } | null>(null);
  const [selRange, setSelRange] = useState<{ r0: number; c0: number; r1: number; c1: number } | null>(null);
  const [showClean, setShowClean] = useState(false);
  const [showTransform, setShowTransform] = useState(false);
  const [freezeFirstCol, setFreezeFirstCol] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
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
  const [outputs, setOutputs] = useState<OutputEntry[]>(() => restoredOutputs(boot?.outputs));
  const runSeq = useRef(0);
  const [toasts, setToasts] = useState<{ id: number; title: string; msg: string; type: 'ok' | 'warn' | 'error' }[]>([]);
  useEffect(() => {
    // Scroll only the output container: scrollIntoView() also scrolls the
    // document/ancestors in some browsers, hiding the main tabs and controls.
    const el = document.getElementById('output-content');
    if (el) el.scrollTop = el.scrollHeight;
  }, [outputs]);

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

  // Each run pushes a single block: the written report is part of that block,
  // so it always closes the run after every table and chart. The block is also
  // rendered once to static markup so the console survives reloads and .lzs
  // files; live runs keep their interactive React nodes in this session.
  const pushOutput = (node: React.ReactNode, report: ReportSpec | null) => {
    const block = (
      <>
        {node}
        {report && <AnalysisReport spec={report} />}
      </>
    );
    let html = '';
    try {
      html = renderToStaticMarkup(block);
    } catch (error) {
      // A failed snapshot must never lose the run that is on screen.
      console.error('Could not snapshot the output block', error);
    }
    const entry: OutputEntry = {
      id: `run-${Date.now()}-${runSeq.current++}`,
      title: html ? extractOutputTitle(html) : 'Analysis output',
      createdAt: new Date().toISOString(),
      html,
      node: block,
    };
    setOutputs(prev => capStoredOutputs([...prev, entry]));
  };

  const showToast = (title: string, msg: string, type: 'ok' | 'warn' | 'error' = 'ok') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const addColumn = () => {
    setGrid((prev) => gridAddColumn(prev));
  };

  const addRow = () => {
    setGrid((prev) => gridAddRow(prev));
  };

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

  const csvInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<{
    fileName: string;
    text?: string;
    sheets?: XlsxSheet[];
  } | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [ioPrefs, setIoPrefs] = useState(() => boot?.prefs ?? loadPrefs());

  const applyImportTable = (table: ImportTable, mode: ImportMode) => {
    if (mode === 'overwrite') {
      resetGridHistory({
        cols: table.names.map((name, i) => ({ name, type: table.types[i] ?? 'str' })),
        rows: table.rows.map((row) => [...row]),
      } as GridData);
      showToast('Import', `${table.rows.length} rows and ${table.names.length} columns imported`, 'ok');
    } else if (mode === 'append-rows') {
      // Compute inside the updater: the wizard may have been open while
      // the grid changed, so the render-closure `grid` can be stale.
      setGrid((prev) => {
        const width = prev.cols.length;
        const mapped = table.rows.map((row) => {
          // Align by position when widths match, else by name overlap.
          if (table.names.length === width) return row.slice(0, width).concat(new Array(Math.max(0, width - row.length)).fill(''));
          return prev.cols.map((c) => {
            const idx = table.names.findIndex((n) => n.toLowerCase() === c.name.toLowerCase());
            return idx >= 0 ? row[idx] ?? '' : '';
          });
        });
        return { cols: prev.cols, rows: [...prev.rows, ...mapped] };
      });
      showToast('Import', `${table.rows.length} rows appended`, 'ok');
    } else {
      // Merge columns: add missing names, fill matched columns row-wise.
      setGrid((prev) => {
        const existing = new Map<string, number>(
          prev.cols.map((c, i) => [c.name.toLowerCase(), i] as [string, number])
        );
        const colMap: number[] = [];
        const cols = [...prev.cols];
        table.names.forEach((n, ti) => {
          const at = existing.get(n.toLowerCase());
          if (at !== undefined) {
            colMap[ti] = at;
          } else {
            colMap[ti] = cols.length;
            cols.push({ name: n, type: table.types[ti] ?? 'str' });
          }
        });
        const rows = prev.rows.map((r, ri) => {
          const copy = [...r];
          while (copy.length < cols.length) copy.push('');
          // Fill only rows covered by the source; never cycle (cycling
          // would duplicate source rows over unrelated grid data).
          if (ri >= table.rows.length) return copy;
          const src = table.rows[ri] ?? [];
          table.names.forEach((_, ti) => {
            const dest = colMap[ti];
            const val = src[ti] ?? '';
            if (val !== '') copy[dest] = val;
          });
          return copy;
        });
        // Extra source rows beyond grid length extend the grid.
        for (let ri = prev.rows.length; ri < table.rows.length; ri += 1) {
          const fresh = new Array(cols.length).fill('');
          table.names.forEach((_, ti) => {
            fresh[colMap[ti]] = table.rows[ri][ti] ?? '';
          });
          rows.push(fresh);
        }
        return { cols, rows };
      });
      showToast('Import', `${table.names.length} columns merged`, 'ok');
    }
    setPendingImport(null);
    setValidation({ ran: false, issues: [] });
    setActiveTab('data');
  };

  const importCsv = async (file: File) => {
    try {
      const lower = file.name.toLowerCase();
      // Excel workbooks are binary: parse every sheet, then reuse the wizard
      // and the CSV type-inference pipeline on the chosen sheet.
      if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.xlsm')) {
        if (file.size > 25_000_000) throw new Error('The workbook is too large (max 25 MB)');
        const sheets = readXlsxSheets(await file.arrayBuffer());
        setPendingImport({ fileName: file.name, sheets });
        return;
      }
      const text = await file.text();
      if (!text.trim()) {
        showToast('Import', 'The file is empty', 'warn');
        return;
      }
      // Fast path: small plain CSV goes straight in; anything ambiguous
      // (JSON, semicolons, pipes, tabs) opens the wizard.
      const prefs = loadPrefs();
      const json = looksLikeJson(text) || file.name.toLowerCase().endsWith('.json');
      const tricky = json || /[;\t|]/.test(text.slice(0, 2000));
      if (!tricky && text.length < 200000) {
        const prefDelim = prefs.delimiter === 'tab' || prefs.delimiter === '\t'
          ? '\t'
          : ([';', '|', ','].includes(prefs.delimiter) ? prefs.delimiter : ',');
        const table = readDelimitedTable(text, {
          delimiter: prefDelim,
          hasHeader: prefs.hasHeader,
          decimalComma: prefs.decimalSeparator === ',',
        });
        applyImportTable(table, 'overwrite');
        return;
      }
      setPendingImport({ fileName: file.name, text: text.slice(0, 2000000) });
    } catch (error) {
      console.error(error);
      showToast('Import', error instanceof Error ? error.message : 'Could not read the file', 'error');
    }
  };

  const exportCsv = () => {
    setShowExport(true);
  };

  const [descVars, setDescVars] = useState<number[]>(
    boot?.params.descVars ?? DEFAULT_PARAMS.descVars
  );
  const [ciLevel, setCiLevel] = useState(boot?.settings.ciLevel ?? DEFAULT_SETTINGS.ciLevel);
  const [ttestParams, setTTestParams] = useState<TTestParams>(
    boot?.params.ttest ?? DEFAULT_PARAMS.ttest
  );

  const [anovaParams, setAnovaParams] = useState<AnovaParams>(
    boot?.params.anova ?? DEFAULT_PARAMS.anova
  );

  const [regParams, setRegParams] = useState<RegParams>(
    boot?.params.reg ?? DEFAULT_PARAMS.reg
  );

  const [corrParams, setCorrParams] = useState<CorrParams>(
    boot?.params.corr ?? DEFAULT_PARAMS.corr
  );

  const [chisqParams, setChisqParams] = useState<ChiSqParams>(
    boot?.params.chisq ?? DEFAULT_PARAMS.chisq
  );

  // --- Project persistence (.lzs + silent autosave) ---
  const projectInputRef = useRef<HTMLInputElement>(null);
  const [lastAutosave, setLastAutosave] = useState<string | null>(() =>
    boot ? new Date(boot.savedAt).toLocaleTimeString() : null
  );
  const autosaveWarned = useRef(false);
  // Canonical serialization of what is already stored: avoids redundant
  // writes on mount/StrictMode re-runs and keeps mounts from clobbering a
  // newer tab with identical content.
  const lastSavedProject = useRef<string | null>(boot ? serializeProject(boot) : null);

  const filterNeedsValue = filterOp !== 'empty' && filterOp !== 'notEmpty';
  const activeRowFilter: RowFilter | null =
    showFilter && grid.cols.length > 0 && (!filterNeedsValue || filterValue.trim() !== '')
      ? { col: Math.min(filterCol, grid.cols.length - 1), op: filterOp, value: filterValue }
      : null;
  const visibleRowCount = activeRowFilter
    ? gridFilterIndexes(grid, activeRowFilter).length
    : grid.rows.length;

  const buildProject = (): ProjectSnapshot =>
    createProjectSnapshot({
      grid,
      prefs: ioPrefs,
      settings: { ciLevel, activeAnalysis, activeTab },
      params: {
        descVars,
        ttest: ttestParams,
        anova: anovaParams,
        reg: regParams,
        corr: corrParams,
        chisq: chisqParams,
      },
      outputs,
    });

  useEffect(() => {
    const timer = setTimeout(() => {
      const snapshot = buildProject();
      const json = serializeProject(snapshot);
      if (json === lastSavedProject.current) return;
      if (saveAutosaveText(json)) {
        lastSavedProject.current = json;
        autosaveWarned.current = false;
        setLastAutosave(new Date().toLocaleTimeString());
      } else if (!autosaveWarned.current) {
        // Quota exceeded or oversized grid: warn once, not on every keystroke.
        autosaveWarned.current = true;
        setLastAutosave(null);
        showToast('Autosave', 'Autosave unavailable (storage full or data too large) — use Save project', 'warn');
      }
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid, ioPrefs, ciLevel, activeAnalysis, activeTab, descVars, ttestParams, anovaParams, regParams, corrParams, chisqParams, outputs]);

  const applyProject = (project: ProjectSnapshot) => {
    resetGridHistory(project.grid);
    setDescVars(project.params.descVars);
    setTTestParams(project.params.ttest);
    setAnovaParams(project.params.anova);
    setRegParams(project.params.reg);
    setCorrParams(project.params.corr);
    setChisqParams(project.params.chisq);
    setCiLevel(project.settings.ciLevel);
    setActiveAnalysis(
      ANALYSIS_TABS.some((tab) => tab.id === project.settings.activeAnalysis)
        ? project.settings.activeAnalysis
        : DEFAULT_SETTINGS.activeAnalysis
    );
    setActiveTab(project.settings.activeTab);
    setIoPrefs(project.prefs);
    savePrefs(project.prefs);
    // Output snapshots are restored together with the data they were computed
    // from, so the console and the grid always belong to the same session.
    const restored = restoredOutputs(project.outputs);
    setOutputs(restored);
    setValidation({ ran: false, issues: [] });
    setSelRange(null);
    setFocusCell(null);
    setLastAutosave(new Date().toLocaleTimeString());
    showToast(
      'Project',
      `Loaded ${nonEmptyRowCount(project.grid.rows)} rows and ${restored.length} result block(s)`,
      'ok'
    );
  };

  const saveProjectFile = () => {
    downloadText(
      serializeProject(buildProject()),
      'lazstats-project.lzs',
      'application/json;charset=utf-8'
    );
    showToast('Project', 'Project saved as .lzs', 'ok');
  };

  const openProjectFile = async (file: File) => {
    try {
      if (file.size > 25_000_000) throw new Error('The project file is too large');
      const project = parseProject(await file.text());
      if (!window.confirm(`Load "${file.name}"? The current grid will be replaced and the output console cleared.`)) {
        return;
      }
      applyProject(project);
    } catch (error) {
      showToast('Project', error instanceof Error ? error.message : 'Could not read the project', 'error');
    }
  };

  const bootNoticeShown = useRef(false);
  useEffect(() => {
    if (bootNoticeShown.current) return;
    bootNoticeShown.current = true;
    if (boot) {
      showToast('Session', `Restored ${nonEmptyRowCount(boot.grid.rows)} rows from the last session`, 'ok');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nonParamRepeatedRef = useRef<NonParamRepeatedHandle>(null);
  const repeatedAnovaRef = useRef<RepeatedAnovaHandle>(null);
  const multivariateRef = useRef<MultivariateHandle>(null);
  const ancovaRef = useRef<AncovaHandle>(null);
  const contingencyRef = useRef<ContingencyHandle>(null);
  const sampleSizeRef = useRef<SampleSizeHandle>(null);
  const distFitRef = useRef<DistributionFitHandle>(null);
  const factorialRef = useRef<FactorialAnovaHandle>(null);
  const logisticRef = useRef<LogisticHandle>(null);
  const timeSeriesRef = useRef<TimeSeriesHandle>(null);
  const survivalRef = useRef<SurvivalHandle>(null);
  const coxRef = useRef<CoxHandle>(null);
  const wizardRef = useRef<WizardHandle>(null);

  const runAnalysis = () => {
    switch (activeAnalysis) {
      case 'descriptive':
        runDescriptive();
        break;
      case 'ttest':
        runTTest();
        break;
      case 'anova':
        runANOVA();
        break;
      case 'regression':
        runRegression();
        break;
      case 'correlation':
        runCorrelation();
        break;
      case 'chisquare':
        runChiSquare();
        break;
      case 'contingency':
        contingencyRef.current?.run();
        break;
      case 'nonparamrm':
        nonParamRepeatedRef.current?.run();
        break;
      case 'repeatedanova':
        repeatedAnovaRef.current?.run();
        break;
      case 'multivariate':
        multivariateRef.current?.run();
        break;
      case 'ancova':
        ancovaRef.current?.run();
        break;
      case 'samplesize':
        sampleSizeRef.current?.run();
        break;
      case 'distfit':
        distFitRef.current?.run();
        break;
      case 'factorial':
        factorialRef.current?.run();
        break;
      case 'logistic':
        logisticRef.current?.run();
        break;
      case 'timeseries':
        timeSeriesRef.current?.run();
        break;
      case 'survival':
        survivalRef.current?.run();
        break;
      case 'cox':
        coxRef.current?.run();
        break;
      case 'wizard':
        wizardRef.current?.run();
        break;
      default:
        showToast('Analysis', 'Analysis type not implemented yet', 'warn');
    }
  };

  const runDescriptive = () => {
    const result = buildDescriptiveOutput({
      rows: grid.rows,
      columnNames: grid.cols.map(col => col.name),
      indices: descVars,
      level: ciLevel,
    });
    if ('reason' in result) {
      showToast('Error', result.reason, 'error');
      return;
    }
    pushOutput(result.node, result.report);
  };

  const runTTest = () => {
    const result = buildTTestOutput({ grid, ttestParams, ciLevel });
    if ('reason' in result) {
      showToast('Error', result.reason, 'error');
      return;
    }
    pushOutput(result.node, result.report);
  };

  const runANOVA = () => {
    const result = buildAnovaOutput({ grid, anovaParams, ciLevel });
    if ('reason' in result) {
      showToast('Error', result.reason, 'error');
      return;
    }
    pushOutput(result.node, result.report);
  };

  const runRegression = () => {
    const result = buildRegressionOutput({ grid, regParams, ciLevel });
    if ('reason' in result) {
      showToast('Error', result.reason, 'error');
      return;
    }
    pushOutput(result.node, result.report);
  };

  const runCorrelation = () => {
    const result = buildCorrelationOutput({ grid, corrParams, ciLevel });
    if ('reason' in result) {
      showToast('Error', result.reason, 'error');
      return;
    }
    pushOutput(result.node, result.report);
  };

  const runChiSquare = () => {
    const result = buildChiSquareOutput({ grid, chisqParams, ciLevel });
    if ('reason' in result) {
      showToast('Error', result.reason, 'error');
      return;
    }
    pushOutput(result.node, result.report);
  };

  const clearOutput = () => {
    setOutputs([]);
    showToast('Output', 'Output console cleared', 'ok');
  };

  const removeOutput = (index: number) => {
    setOutputs((prev) => prev.filter((_, i) => i !== index));
    showToast('Output', 'Result block removed', 'ok');
  };

  const copyOutput = async () => {
    const el = document.getElementById('output-content');
    if (!el) return;
    const ok = await copyText(el.innerText);
    showToast('Output', ok ? 'Output copied to clipboard' : 'Could not copy the output', ok ? 'ok' : 'error');
  };

  const exportChartPngs = async () => {
    const el = document.getElementById('output-content');
    if (!el) return;
    const result = await exportChartsAsPng(el, 'lazstats-chart');
    if (result.exported === 0 && result.failed === 0) {
      showToast('Charts', 'No charts in the output console yet', 'warn');
    } else if (result.failed > 0) {
      showToast('Charts', `${result.exported} chart(s) exported, ${result.failed} failed`, 'warn');
    } else {
      showToast('Charts', `${result.exported} chart(s) exported as PNG`, 'ok');
    }
  };

  const exportResultsXlsx = () => {
    const el = document.getElementById('output-content');
    if (!el) return;
    try {
      const bytes = buildResultsWorkbookFromElement(el, grid);
      downloadBytes(bytes, 'lazstats-risultati.xlsx', XLSX_MIME);
      showToast('Export', 'Workbook .xlsx con il dataset e le tabelle dei risultati', 'ok');
    } catch (error) {
      showToast('Export', error instanceof Error ? error.message : 'Could not build the workbook', 'error');
    }
  };

  const exportReportHtml = () => {
    const el = document.getElementById('output-content');
    if (!el) return;
    const html = buildReportFromElement(el, {
      title: 'LazStats JS — Analysis Report',
      generatedAt: new Date().toLocaleString(),
      details: [`${nonEmptyRowCount(grid.rows)} rows`, `${grid.cols.length} columns`, `CI ${ciLevel}%`],
    });
    downloadText(html, 'lazstats-report.html', 'text/html;charset=utf-8');
    showToast('Report', 'Printable report downloaded — open it and print to PDF', 'ok');
  };

  return (
    <div className="flex flex-col h-screen bg-bg text-text font-sans selection:bg-accent/30">
      {/* Main Tabs */}
      <div className="bg-surface2 border-b border-border px-2 pt-1.5 flex gap-0.5 shrink-0 sticky top-0 z-50">
        <button 
          onClick={() => setActiveTab('data')}
          className={`main-tab ${activeTab === 'data' ? 'active' : ''}`}
        >
          <Database className="w-3 h-3 inline mr-2" />
          Data Editor
        </button>
        <button 
          onClick={() => setActiveTab('analysis')}
          className={`main-tab ${activeTab === 'analysis' ? 'active' : ''}`}
        >
          <BarChart3 className="w-3 h-3 inline mr-2" />
          Analysis & Output
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`main-tab ${activeTab === 'settings' ? 'active' : ''}`}
        >
          <Settings className="w-3 h-3 inline mr-2" />
          Settings
        </button>
        <button 
          onClick={() => setActiveTab('help')}
          className={`main-tab ${activeTab === 'help' ? 'active' : ''}`}
        >
          <HelpCircle className="w-3 h-3 inline mr-2" />
          Help
        </button>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'data' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-surface border-b border-border p-1.5 flex flex-wrap items-center gap-2 shrink-0">
              <span className="font-mono text-[10px] text-text3 uppercase tracking-widest px-2">File:</span>
              <button className="tb-btn" onClick={() => resetGridHistory(makeNewGrid())}>New</button>
              <button className="tb-btn" onClick={() => csvInputRef.current?.click()}>Import</button>
              <button className="tb-btn" onClick={exportCsv}>Export</button>
              <div className="h-4 w-px bg-border mx-1" />
              <button
                className="tb-btn"
                onClick={saveProjectFile}
                title="Save grid, settings and analysis parameters as a .lzs project"
              >
                Save project
              </button>
              <button
                className="tb-btn"
                onClick={() => projectInputRef.current?.click()}
                title="Open a .lzs project and replace the current session"
              >
                Open project
              </button>
              <input
                ref={projectInputRef}
                type="file"
                accept=".lzs,application/json"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void openProjectFile(file);
                  event.target.value = '';
                }}
              />
              {lastAutosave && (
                <span
                  className="font-mono text-[9px] text-text3 uppercase tracking-wider"
                  title="Grid, settings and parameters are autosaved in this browser"
                >
                  Autosave {lastAutosave}
                </span>
              )}
              <div className="h-4 w-px bg-border mx-1" />
              <button className="tb-btn" disabled={!canUndoGrid} onClick={undoGrid} title="Undo (Ctrl+Z)">
                Undo
              </button>
              <button className="tb-btn" disabled={!canRedoGrid} onClick={redoGrid} title="Redo (Ctrl+Y)">
                Redo
              </button>
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv,.tsv,.tab,.txt,.json,.psv,.xlsx,.xls,.xlsm,text/csv,text/plain,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void importCsv(file);
                  event.target.value = '';
                }}
              />
              <div className="h-4 w-px bg-border mx-2" />
              <button
                className="tb-btn text-yellow"
                onClick={() => {
                  const issues = gridFindInvalid(grid);
                  setValidation({ ran: true, issues });
                  if (issues.length === 0) showToast('Validation', 'All cells validated successfully', 'ok');
                  else showToast('Validation', `${issues.length} invalid cells found`, 'warn');
                }}
              >
                Validate
              </button>
              <button
                className="tb-btn"
                onClick={() => {
                  const { grid: next, changed } = gridCoerce(grid);
                  if (changed === 0) {
                    showToast('Auto-fix', 'Nothing to coerce', 'ok');
                    return;
                  }
                  setGrid(next);
                  setValidation({ ran: false, issues: [] });
                  showToast('Auto-fix', `${changed} cells coerced`, 'ok');
                }}
              >
                Auto-fix
              </button>
              <button className={`tb-btn ${showClean ? 'bg-accent text-white border-accent' : ''}`} onClick={() => setShowClean((v) => !v)}>
                Clean
              </button>
              <button className={`tb-btn ${showTransform ? 'bg-accent text-white border-accent' : ''}`} onClick={() => setShowTransform((v) => !v)}>
                Transform
              </button>
              <div className="h-4 w-px bg-border mx-1" />
              <button
                className={`tb-btn ${freezeFirstCol ? 'bg-accent text-white border-accent' : ''}`}
                onClick={() => setFreezeFirstCol((v) => !v)}
                title="Keep the row numbers and the first column visible while scrolling"
              >
                Freeze col
              </button>
              <button
                className={`tb-btn ${showFilter ? 'bg-accent text-white border-accent' : ''}`}
                onClick={() => setShowFilter((v) => !v)}
                title="Filter the rows shown in the grid (view only, data unchanged)"
              >
                Filter
              </button>
            </div>

            {showFilter && (
              <div className="bg-surface border-b border-border px-3 py-1.5 flex flex-wrap items-center gap-2 text-[11px] shrink-0">
                <span className="font-mono text-[9px] text-text3 uppercase tracking-widest">Row filter</span>
                <select
                  className="bg-surface3 border border-border2 rounded px-1 py-1 text-text"
                  value={filterCol}
                  onChange={(e) => setFilterCol(Number(e.target.value))}
                >
                  {grid.cols.map((c, i) => (
                    <option key={i} value={i}>{c.name}</option>
                  ))}
                </select>
                <select
                  className="bg-surface3 border border-border2 rounded px-1 py-1 text-text"
                  value={filterOp}
                  onChange={(e) => setFilterOp(e.target.value as RowFilterOp)}
                >
                  <option value="contains">contains</option>
                  <option value="equals">=</option>
                  <option value="notEquals">≠</option>
                  <option value="gt">&gt;</option>
                  <option value="gte">≥</option>
                  <option value="lt">&lt;</option>
                  <option value="lte">≤</option>
                  <option value="empty">is empty</option>
                  <option value="notEmpty">is not empty</option>
                </select>
                {filterNeedsValue && (
                  <input
                    className="bg-surface3 border border-border2 rounded px-2 py-1 w-40 text-text"
                    placeholder="Value"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                  />
                )}
                <span className="text-text3 font-mono text-[10px]">
                  {visibleRowCount} / {grid.rows.length} rows
                </span>
                <button
                  className="tb-btn"
                  onClick={() => {
                    setFilterValue('');
                    setFilterOp('contains');
                  }}
                >
                  Clear filter
                </button>
                <span className="text-text3 text-[10px] italic">view only — analyses still use all rows</span>
              </div>
            )}

            {showTransform && (
              <TransformPanel
                grid={grid}
                onApply={(next, msg, kind = 'ok') => {
                  if (next !== grid) {
                    setGrid(next);
                    setValidation({ ran: false, issues: [] });
                  }
                  showToast('Transform', msg, kind);
                }}
              />
            )}

            {showClean && (
              <CleanPanel
                grid={grid}
                onApply={(next, msg) => {
                  setGrid(next);
                  setValidation({ ran: false, issues: [] });
                  showToast('Clean', msg, 'ok');
                }}
              />
            )}

            {validation.ran && (
              <div className="bg-surface border-b border-border px-3 py-1.5 flex flex-wrap items-center gap-2 text-[10px] font-mono shrink-0">
                {validation.issues.length === 0 ? (
                  <span className="text-green">VALID: 0 invalid cells</span>
                ) : (
                  <>
                    <span className="text-yellow font-bold">{validation.issues.length} INVALID</span>
                    <span className="text-text3">|</span>
                    {gridInvalidByColumn(grid)
                      .filter((c) => c.count > 0)
                      .map((c) => (
                        <button
                          key={c.col}
                          className="tb-btn"
                          onClick={() => {
                            const first = validation.issues.find((i) => i.c === c.col);
                            if (first) {
                              setFocusCell({ r: first.r, c: first.c, stamp: Date.now() });
                              setActiveTab('data');
                            }
                          }}
                        >
                          {c.name}: {c.count}
                        </button>
                      ))}
                    <button
                      className="tb-btn"
                      onClick={() => {
                        const first = validation.issues[0];
                        if (first) setFocusCell({ r: first.r, c: first.c, stamp: Date.now() });
                      }}
                    >
                      Jump to first
                    </button>
                    <button className="tb-btn" onClick={() => setValidation({ ran: false, issues: [] })}>
                      Dismiss
                    </button>
                  </>
                )}
              </div>
            )}
            
            <div className="panel-header">
              <div className="w-1.5 h-1.5 bg-accent rounded-full" />
              Grid View
            </div>

            <DataGrid
              grid={grid}
              focusCell={focusCell}
              onCell={updateCell}
              onRenameCol={(c, name) => {
                setGrid((prev) => gridRenameColumn(prev, c, name));
                setValidation((v) => ({ ...v, ran: false }));
              }}
              onColType={updateColType}
              onLevels={updateColumnLevels}
              onRecode={updateColumnRecode}
              onInsertCol={(at) => setGrid((prev) => gridInsertColumn(prev, at))}
              onDuplicateCol={(c) => setGrid((prev) => gridDuplicateColumn(prev, c))}
              onMoveCol={(c, dir) => setGrid((prev) => gridMoveColumn(prev, c, dir))}
              onDeleteCol={(c) => {
                if (grid.cols.length <= 1) {
                  showToast('Columns', 'At least one column is required', 'warn');
                  return;
                }
                if (!window.confirm(`Delete column "${grid.cols[c]?.name}"? You can undo.`)) return;
                setGrid((prev) => gridDeleteColumn(prev, c));
              }}
              onInsertRow={(at) => setGrid((prev) => gridInsertRow(prev, at))}
              onDeleteRow={(r) => {
                if (grid.rows.length <= 1) {
                  showToast('Rows', 'At least one row is required', 'warn');
                  return;
                }
                if (!window.confirm(`Delete row ${r + 1}? You can undo.`)) return;
                setGrid((prev) => gridDeleteRow(prev, r));
              }}
              onPaste={(r, c, text) => {
                const block = parseTsvBlock(text).filter((line) => line.some((v) => String(v ?? '').trim() !== ''));
                if (block.length === 0) return;
                setGrid((prev) => gridPasteTsv(prev, r, c, block));
                showToast('Paste', `${block.length}x${Math.max(...block.map((l) => l.length))} cells pasted`, 'ok');
              }}
              onCopyRange={(range) => {
                setSelRange(range);
                const tsv = gridRangeToTsv(grid, range);
                navigator.clipboard?.writeText(tsv).catch(() => undefined);
                showToast('Copy', 'Range copied to clipboard', 'ok');
              }}
              onClearRange={(range) => setGrid((prev) => gridClearRange(prev, range))}
              onFillDown={(range) => setGrid((prev) => gridFillDown(prev, range))}
              freezeFirstCol={freezeFirstCol}
              rowFilter={activeRowFilter}
              onSortCol={(col, dir) => {
                setGrid((prev) => gridSortByColumn(prev, col, dir));
                setValidation({ ran: false, issues: [] });
                showToast('Sort', `Sorted by ${grid.cols[col]?.name ?? `column ${col + 1}`} (${dir})`, 'ok');
              }}
            />
            {selRange && (
              <div className="bg-surface border-t border-border px-3 py-1 flex items-center gap-2 text-[10px] font-mono text-text3 shrink-0">
                <span>
                  SEL: R{Math.min(selRange.r0, selRange.r1) + 1}-{Math.max(selRange.r0, selRange.r1) + 1} C
                  {Math.min(selRange.c0, selRange.c1) + 1}-{Math.max(selRange.c0, selRange.c1) + 1}
                </span>
                <button className="tb-btn" onClick={() => setGrid((prev) => gridFillDown(prev, selRange))}>
                  Fill down
                </button>
                <button className="tb-btn" onClick={() => setGrid((prev) => gridClearRange(prev, selRange))}>
                  Clear selection
                </button>
                <button
                  className="tb-btn"
                  onClick={() => {
                    navigator.clipboard?.writeText(gridRangeToTsv(grid, selRange)).catch(() => undefined);
                    showToast('Copy', 'Range copied to clipboard', 'ok');
                  }}
                >
                  Copy
                </button>
              </div>
            )}

            <div className="bg-surface border-t border-border p-2 flex gap-2 shrink-0">
              <button className="tb-btn" onClick={addColumn}><Plus className="w-3 h-3 inline mr-1" /> Column</button>
              <button className="tb-btn" onClick={addRow}><Plus className="w-3 h-3 inline mr-1" /> Row</button>
              <button
                className="tb-btn text-red/80 hover:bg-red hover:text-white"
                onClick={() => {
                  if (!window.confirm('Clear all cells? You can undo.')) return;
                  setGrid((prev) => gridClear(prev));
                }}
              >
                <Trash2 className="w-3 h-3 inline mr-1" /> Clear
              </button>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-surface border-b border-border shrink-0">
              <div className="flex overflow-x-auto scrollbar">
                {ANALYSIS_TABS.map(a => (
                  <button 
                    key={a.id}
                    onClick={() => setActiveAnalysis(a.id)}
                    className={`atab ${activeAnalysis === a.id ? 'active' : ''}`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              
              <div className="p-4 flex flex-wrap gap-6 items-start">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">CI Level</label>
                  <select
                    className="bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[90px]"
                    value={ciLevel}
                    onChange={(e) => setCiLevel(parseInt(e.target.value))}
                  >
                    <option value={90}>90%</option>
                    <option value={95}>95%</option>
                    <option value={99}>99%</option>
                  </select>
                </div>
                {activeAnalysis === 'descriptive' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Select Variables</label>
                    <div className="bg-surface3 border border-border2 rounded p-2 min-w-[200px] max-h-[100px] overflow-auto scrollbar">
                      {grid.cols.map((col, i) => (
                        <label key={i} className="flex items-center gap-2 text-[11px] text-text2 hover:text-text cursor-pointer py-0.5">
                          <input 
                            type="checkbox" 
                            className="accent-accent" 
                            checked={descVars.includes(i)} 
                            onChange={(e) => {
                              const newVars = e.target.checked 
                                ? [...descVars, i]
                                : descVars.filter(idx => idx !== i);
                              setDescVars(newVars);
                            }}
                          />
                          {col.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {activeAnalysis === 'ttest' && (
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Test Type</label>
                      <select 
                        className="bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[150px]"
                        value={ttestParams.type}
                        onChange={(e) => setTTestParams(p => ({ ...p, type: e.target.value as any }))}
                      >
                        <option value="ind">Independent Samples</option>
                        <option value="dep">Paired Samples</option>
                        <option value="one">One-Sample</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Variable 1</label>
                      <select 
                        className="bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[120px]"
                        value={ttestParams.var1}
                        onChange={(e) => setTTestParams(p => ({ ...p, var1: parseInt(e.target.value) }))}
                      >
                        {grid.cols.map((c, i) => <option key={i} value={i}>{c.name}</option>)}
                      </select>
                    </div>
                    {ttestParams.type !== 'one' ? (
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Variable 2</label>
                        <select 
                          className="bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[120px]"
                          value={ttestParams.var2}
                          onChange={(e) => setTTestParams(p => ({ ...p, var2: parseInt(e.target.value) }))}
                        >
                          {grid.cols.map((c, i) => <option key={i} value={i}>{c.name}</option>)}
                        </select>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Test Mean (μ₀)</label>
                        <input 
                          type="number" 
                          className="bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded w-24"
                          value={ttestParams.mu}
                          onChange={(e) => setTTestParams(p => ({ ...p, mu: parseFloat(e.target.value) }))}
                        />
                      </div>
                    )}
                    {ttestParams.type === 'ind' && (
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Variances</label>
                        <select
                          className="bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[150px]"
                          value={ttestParams.equalVar ? 'equal' : 'welch'}
                          onChange={(e) => setTTestParams(p => ({ ...p, equalVar: e.target.value === 'equal' }))}
                        >
                          <option value="equal">Equal (pooled)</option>
                          <option value="welch">Unequal (Welch)</option>
                        </select>
                      </div>
                    )}
                  </>
                )}

                {activeAnalysis === 'anova' && (
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Dependent Var</label>
                      <select 
                        className="bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[120px]"
                        value={anovaParams.dep}
                        onChange={(e) => setAnovaParams(p => ({ ...p, dep: parseInt(e.target.value) }))}
                      >
                        {grid.cols.map((c, i) => <option key={i} value={i}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Group Var</label>
                      <div className="flex items-center gap-1">
                        <select 
                          className="bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[120px]"
                          value={anovaParams.grp}
                          onChange={(e) => setAnovaParams(p => ({ ...p, grp: parseInt(e.target.value) }))}
                        >
                          {groupColumnIndexes(grid).map((i) => (
                            <option key={i} value={i}>{grid.cols[i].name}</option>
                          ))}
                          {!isGroupColumn(grid, anovaParams.grp) && grid.cols[anovaParams.grp] && (
                            <option value={anovaParams.grp}>{grid.cols[anovaParams.grp].name} (numeric)</option>
                          )}
                        </select>
                        <LevelsEditor
                          grid={grid}
                          column={anovaParams.grp}
                          onLevels={updateColumnLevels}
                          onRecode={updateColumnRecode}
                          label="Modifica livelli"
                          className="tb-btn flex items-center gap-1 h-[29px] px-2 text-[10px] whitespace-nowrap"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Post-Hoc</label>
                      <select 
                        className="bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[120px]"
                        value={anovaParams.posthoc}
                        onChange={(e) => setAnovaParams(p => ({ ...p, posthoc: e.target.value as any }))}
                      >
                        <option value="none">None</option>
                        <option value="tukey">Tukey–Kramer (approx.)</option>
                        <option value="bonferroni">Bonferroni</option>
                        <option value="holm">Holm</option>
                        <option value="gameshowell">Games–Howell</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Non-Parametric</label>
                      <label className="flex items-center gap-1.5 text-[11px] text-text2 hover:text-text cursor-pointer h-full pt-1">
                        <input 
                          type="checkbox" 
                          className="accent-accent" 
                          checked={anovaParams.useNonParam}
                          onChange={(e) => setAnovaParams(p => ({ ...p, useNonParam: e.target.checked }))}
                        />
                        Kruskal-Wallis H
                      </label>
                    </div>
                    {anovaParams.useNonParam && (
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">K-W Post-Hoc</label>
                        <select 
                          className="bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[120px]"
                          value={anovaParams.kwPosthoc}
                          onChange={(e) => setAnovaParams(p => ({ ...p, kwPosthoc: e.target.value as any }))}
                        >
                          <option value="none">None</option>
                          <option value="bonferroni">Bonferroni</option>
                          <option value="holm">Holm</option>
                        </select>
                      </div>
                    )}
                  </>
                )}

                {activeAnalysis === 'regression' && (
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Dependent (Y)</label>
                      <select 
                        className="bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[120px]"
                        value={regParams.dep}
                        onChange={(e) => setRegParams(p => ({ ...p, dep: parseInt(e.target.value) }))}
                      >
                        {grid.cols.map((c, i) => <option key={i} value={i}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Independents (X)</label>
                      <div className="bg-surface3 border border-border2 rounded p-2 min-w-[200px] max-h-[100px] overflow-auto scrollbar">
                        {grid.cols.map((col, i) => (
                          <label key={i} className="flex items-center gap-2 text-[11px] text-text2 hover:text-text cursor-pointer py-0.5">
                            <input 
                              type="checkbox" 
                              className="accent-accent" 
                              checked={regParams.indeps.includes(i)}
                              onChange={(e) => {
                                const newIndeps = e.target.checked 
                                  ? [...regParams.indeps, i]
                                  : regParams.indeps.filter(idx => idx !== i);
                                setRegParams(p => ({ ...p, indeps: newIndeps }));
                              }}
                            />
                            {col.name}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Non-Parametric</label>
                      <label className="flex items-center gap-1.5 text-[11px] text-text2 hover:text-text cursor-pointer h-full pt-1">
                        <input 
                          type="checkbox" 
                          className="accent-accent" 
                          checked={regParams.useNonParam}
                          onChange={(e) => setRegParams(p => ({ ...p, useNonParam: e.target.checked }))}
                        />
                        Theil-Sen Robust Line
                      </label>
                    </div>
                  </>
                )}

                {activeAnalysis === 'correlation' && (
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Variables</label>
                      <div className="bg-surface3 border border-border2 rounded p-2 min-w-[200px] max-h-[100px] overflow-auto scrollbar">
                        {grid.cols.map((col, i) => (
                          <label key={i} className="flex items-center gap-2 text-[11px] text-text2 hover:text-text cursor-pointer py-0.5">
                            <input 
                              type="checkbox" 
                              className="accent-accent" 
                              checked={corrParams.vars.includes(i)}
                              onChange={(e) => {
                                const newVars = e.target.checked 
                                  ? [...corrParams.vars, i]
                                  : corrParams.vars.filter(idx => idx !== i);
                                setCorrParams(p => ({ ...p, vars: newVars }));
                              }}
                            />
                            {col.name}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Primary Method</label>
                      <select 
                        className="bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[120px]"
                        value={corrParams.method}
                        onChange={(e) => setCorrParams(p => ({ ...p, method: e.target.value as any }))}
                      >
                        <option value="pearson">Pearson</option>
                        <option value="spearman">Spearman</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Non-Parametric</label>
                      <div className="flex flex-col gap-1 pt-0.5">
                        <label className="flex items-center gap-1.5 text-[11px] text-text2 hover:text-text cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="accent-accent" 
                            checked={corrParams.showSpearman}
                            onChange={(e) => setCorrParams(p => ({ ...p, showSpearman: e.target.checked }))}
                          />
                          Spearman (ρ)
                        </label>
                        <label className="flex items-center gap-1.5 text-[11px] text-text2 hover:text-text cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="accent-accent" 
                            checked={corrParams.showKendall}
                            onChange={(e) => setCorrParams(p => ({ ...p, showKendall: e.target.checked }))}
                          />
                          Kendall's Tau (τ)
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {activeAnalysis === 'chisquare' && (
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">
                      Contingency Table (2x2)
                    </label>
                    <div className="bg-surface3 border border-border2 rounded p-3">
                      <table className="text-[11px] text-text2">
                        <thead>
                          <tr>
                            <th className="p-1"></th>
                            <th className="p-1 text-center font-mono text-[9px] uppercase tracking-wider text-text3">
                              Col 1 (Label)
                            </th>
                            <th className="p-1 text-center font-mono text-[9px] uppercase tracking-wider text-text3">
                              Col 2 (Label)
                            </th>
                          </tr>
                          <tr>
                            <th className="p-1"></th>
                            <th className="p-1">
                              <input
                                type="text"
                                className="bg-surface border border-border2 text-text text-[11px] p-1 rounded text-center w-28 font-semibold"
                                value={chisqParams.col1Label}
                                onChange={(e) => setChisqParams(p => ({ ...p, col1Label: e.target.value }))}
                              />
                            </th>
                            <th className="p-1">
                              <input
                                type="text"
                                className="bg-surface border border-border2 text-text text-[11px] p-1 rounded text-center w-28 font-semibold"
                                value={chisqParams.col2Label}
                                onChange={(e) => setChisqParams(p => ({ ...p, col2Label: e.target.value }))}
                              />
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="p-1">
                              <input
                                type="text"
                                className="bg-surface border border-border2 text-text text-[11px] p-1 rounded font-semibold w-28"
                                value={chisqParams.row1Label}
                                onChange={(e) => setChisqParams(p => ({ ...p, row1Label: e.target.value }))}
                              />
                            </td>
                            <td className="p-1">
                              <input
                                type="number"
                                min="0"
                                className="bg-surface border border-border2 text-text text-[11px] p-1 rounded text-center w-28"
                                value={chisqParams.row1col1}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  setChisqParams(p => ({ ...p, row1col1: isNaN(val) ? 0 : val }));
                                }}
                              />
                            </td>
                            <td className="p-1">
                              <input
                                type="number"
                                min="0"
                                className="bg-surface border border-border2 text-text text-[11px] p-1 rounded text-center w-28"
                                value={chisqParams.row1col2}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  setChisqParams(p => ({ ...p, row1col2: isNaN(val) ? 0 : val }));
                                }}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="p-1">
                              <input
                                type="text"
                                className="bg-surface border border-border2 text-text text-[11px] p-1 rounded font-semibold w-28"
                                value={chisqParams.row2Label}
                                onChange={(e) => setChisqParams(p => ({ ...p, row2Label: e.target.value }))}
                              />
                            </td>
                            <td className="p-1">
                              <input
                                type="number"
                                min="0"
                                className="bg-surface border border-border2 text-text text-[11px] p-1 rounded text-center w-28"
                                value={chisqParams.row2col1}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  setChisqParams(p => ({ ...p, row2col1: isNaN(val) ? 0 : val }));
                                }}
                              />
                            </td>
                            <td className="p-1">
                              <input
                                type="number"
                                min="0"
                                className="bg-surface border border-border2 text-text text-[11px] p-1 rounded text-center w-28"
                                value={chisqParams.row2col2}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  setChisqParams(p => ({ ...p, row2col2: isNaN(val) ? 0 : val }));
                                }}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <div className="flex items-center justify-between gap-1.5 mt-3">
                        <label className="flex items-center gap-1.5 text-[11px] text-text2 hover:text-text cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="accent-accent" 
                            checked={chisqParams.runFisherExact}
                            onChange={(e) => setChisqParams(p => ({ ...p, runFisherExact: e.target.checked }))}
                          />
                          Run Fisher's Exact Test
                        </label>
                        <div className="flex gap-1.5">
                          <button 
                            className="text-[10px] bg-surface hover:bg-border px-2 py-0.5 rounded font-mono text-text3 hover:text-text border border-border cursor-pointer"
                            onClick={() => setChisqParams(p => ({
                              ...p,
                              row1col1: 30,
                              row1col2: 20,
                              row2col1: 15,
                              row2col2: 35,
                              row1Label: 'Treatment Group',
                              row2Label: 'Control Group',
                              col1Label: 'Improved',
                              col2Label: 'No Change'
                            }))}
                          >
                            Preset 1: Trial
                          </button>
                          <button 
                            className="text-[10px] bg-surface hover:bg-border px-2 py-0.5 rounded font-mono text-text3 hover:text-text border border-border cursor-pointer"
                            onClick={() => setChisqParams(p => ({
                              ...p,
                              row1col1: 120,
                              row1col2: 880,
                              row2col1: 90,
                              row2col2: 910,
                              row1Label: 'Variant A',
                              row2Label: 'Variant B',
                              col1Label: 'Converted',
                              col2Label: 'Bounced'
                            }))}
                          >
                            Preset 2: A/B Test
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeAnalysis === 'timeseries' && (
                  <TimeSeriesAnalysis
                    ref={timeSeriesRef}
                    grid={grid}
                    ciLevel={ciLevel}
                    onOutput={pushOutput}
                    onError={(message) => showToast('Error', message, 'error')}
                  />
                )}

                {activeAnalysis === 'survival' && (
                  <SurvivalAnalysis
                    ref={survivalRef}
                    grid={grid}
                    onLevels={updateColumnLevels}
                    onRecode={updateColumnRecode}
                    ciLevel={ciLevel}
                    onOutput={pushOutput}
                    onError={(message) => showToast('Error', message, 'error')}
                  />
                )}

                {activeAnalysis === 'cox' && (
                  <CoxAnalysis
                    ref={coxRef}
                    grid={grid}
                    ciLevel={ciLevel}
                    onOutput={pushOutput}
                    onError={(message) => showToast('Error', message, 'error')}
                  />
                )}

                {activeAnalysis === 'wizard' && (
                  <WizardAnalysis
                    ref={wizardRef}
                    grid={grid}
                    onLevels={updateColumnLevels}
                    onRecode={updateColumnRecode}
                    ciLevel={ciLevel}
                    onOutput={pushOutput}
                    onOpenAnalysis={(analysisId) => setActiveAnalysis(analysisId)}
                  />
                )}

                {activeAnalysis === 'logistic' && (
                  <LogisticAnalysis
                    ref={logisticRef}
                    grid={grid}
                    ciLevel={ciLevel}
                    onOutput={pushOutput}
                    onError={(message) => showToast('Error', message, 'error')}
                  />
                )}

                {activeAnalysis === 'factorial' && (
                  <FactorialAnovaAnalysis
                    ref={factorialRef}
                    grid={grid}
                    onLevels={updateColumnLevels}
                    onRecode={updateColumnRecode}
                    ciLevel={ciLevel}
                    onOutput={pushOutput}
                    onError={(message) => showToast('Error', message, 'error')}
                  />
                )}

                {activeAnalysis === 'distfit' && (
                  <DistributionFitAnalysis
                    ref={distFitRef}
                    grid={grid}
                    ciLevel={ciLevel}
                    onOutput={pushOutput}
                    onError={(message) => showToast('Error', message, 'error')}
                  />
                )}

                {activeAnalysis === 'samplesize' && (
                  <SampleSizeAnalysis
                    ref={sampleSizeRef}
                    ciLevel={ciLevel}
                    onOutput={pushOutput}
                    onError={(message) => showToast('Error', message, 'error')}
                  />
                )}

                {activeAnalysis === 'ancova' && (
                  <AncovaAnalysis
                    ref={ancovaRef}
                    grid={grid}
                    onLevels={updateColumnLevels}
                    onRecode={updateColumnRecode}
                    ciLevel={ciLevel}
                    onOutput={pushOutput}
                    onError={(message) => showToast('Error', message, 'error')}
                  />
                )}

                {activeAnalysis === 'multivariate' && (
                  <MultivariateAnalysis
                    ref={multivariateRef}
                    grid={grid}
                    ciLevel={ciLevel}
                    onOutput={pushOutput}
                    onError={(message) => showToast('Error', message, 'error')}
                  />
                )}

                {activeAnalysis === 'repeatedanova' && (
                  <RepeatedAnovaAnalysis
                    ref={repeatedAnovaRef}
                    grid={grid}
                    ciLevel={ciLevel}
                    onOutput={pushOutput}
                    onError={(message) => showToast('Error', message, 'error')}
                  />
                )}

                {activeAnalysis === 'nonparamrm' && (
                  <NonParamRepeatedAnalysis
                    ref={nonParamRepeatedRef}
                    grid={grid}
                    onLevels={updateColumnLevels}
                    onRecode={updateColumnRecode}
                    ciLevel={ciLevel}
                    onOutput={pushOutput}
                    onError={(message) => showToast('Error', message, 'error')}
                  />
                )}

                {activeAnalysis === 'contingency' && (
                  <ContingencyAnalysis
                    ref={contingencyRef}
                    ciLevel={ciLevel}
                    onOutput={pushOutput}
                    onError={(message) => showToast('Error', message, 'error')}
                  />
                )}

                <button className="run-btn h-9 self-end" onClick={runAnalysis}>
                  <Play className="w-3 h-3 inline mr-2" />
                  Run Analysis
                </button>
              </div>
            </div>

            <div className="bg-surface border-b border-border px-3 py-1 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <span className="font-mono text-[10px] text-text3 uppercase tracking-widest">Output Console</span>
              <div className="flex flex-wrap gap-2">
                <button
                  className="tb-btn flex items-center gap-1"
                  onClick={() => setActiveTab('data')}
                  aria-label="Back to Data Editor"
                >
                  <Database className="w-3 h-3" /> Data Editor
                </button>
                <button className="tb-btn" onClick={clearOutput}>Clear</button>
                <button className="tb-btn" onClick={copyOutput}>Copy</button>
                <button
                  className="tb-btn"
                  onClick={exportChartPngs}
                  disabled={outputs.length === 0}
                  title="Download every chart in the output console as a PNG"
                >
                  Charts PNG
                </button>
                <button
                  className="tb-btn"
                  onClick={exportReportHtml}
                  disabled={outputs.length === 0}
                  title="Download a self-contained printable HTML report"
                >
                  Report HTML
                </button>
                <button
                  className="tb-btn"
                  onClick={exportResultsXlsx}
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
                        onClick={() => removeOutput(i)}
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
                onClick={() => setActiveTab('data')}
                className="lg:hidden fixed bottom-4 right-4 z-50 tb-btn shadow-lg bg-surface2 border-accent text-accent"
                aria-label="Back to Data Editor"
              >
                <Database className="w-3 h-3 inline mr-1" /> Data Editor
              </button>
            )}
          </div>
        )}

        {activeTab === 'help' && <HelpPanel />}

        {activeTab === 'settings' && (
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
      <footer className="h-8 bg-surface border-t border-border flex items-center px-4 text-[10px] font-mono text-text3 gap-6 shrink-0">
        <div>ROWS: <span className="text-text2">{nonEmptyRowCount(grid.rows)}/{grid.rows.length}</span></div>
        <div className="w-px h-3 bg-border" />
        <div>COLS: <span className="text-text2">{grid.cols.length}</span></div>
        <div className="w-px h-3 bg-border" />
        <div>INVALID: <span className={countInvalidCells(grid) > 0 ? 'text-yellow' : 'text-green'}>{countInvalidCells(grid)}</span></div>
        <div className="w-px h-3 bg-border" />
        <div>STATUS: <span className="text-green">READY</span></div>
        <div className="ml-auto flex items-center gap-2">
          <Info className="w-3 h-3" />
          <span>LazStats JS v3.0.0</span>
        </div>
      </footer>

      {/* Toasts */}
      <div className="fixed bottom-10 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div 
              key={t.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`bg-surface border border-border2 rounded p-3 shadow-2xl min-w-[250px] pointer-events-auto border-l-4 ${
                t.type === 'ok' ? 'border-l-green' : t.type === 'warn' ? 'border-l-yellow' : 'border-l-red'
              }`}
            >
              <div className={`text-[11px] font-bold mb-1 ${
                t.type === 'ok' ? 'text-green' : t.type === 'warn' ? 'text-yellow' : 'text-red'
              }`}>
                {t.title}
              </div>
              <div className="text-[11px] text-text2" dangerouslySetInnerHTML={{ __html: t.msg }} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
