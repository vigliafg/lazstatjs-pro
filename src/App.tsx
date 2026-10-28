import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Database,
  Download,
  FileText,
  HelpCircle,
  Info,
  Settings,
  Upload,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jStat } from './stats/jstat';
import { ResultTables } from './components/ResultTable';
import { buildDescriptiveOutput } from './analyses/descriptive/run';
import { buildChiSquareOutput } from './analyses/chisquare/run';
import { buildCorrelationOutput } from './analyses/correlation/run';
import { buildAnovaOutput } from './analyses/anova/run';
import { buildRegressionOutput } from './analyses/regression/run';
import { buildTTestOutput } from './analyses/ttest/run';
import { restoredOutputs, type OutputEntry } from './ui/OutputConsole';
import { SettingsTab } from './ui/SettingsTab';
import { DataTab } from './ui/DataTab';
import { useToasts } from './hooks/useToasts';
import { useOutputConsole } from './hooks/useOutputConsole';
import { AnalysisTab } from './ui/AnalysisTab';
import { ANALYSIS_TABS } from './analyses/registry';
import type { AncovaHandle } from './analyses/AncovaAnalysis';
import type { ContingencyHandle } from './analyses/ContingencyAnalysis';
import type { CoxHandle } from './analyses/CoxAnalysis';
import type { DistributionFitHandle } from './analyses/DistributionFitAnalysis';
import type { FactorialAnovaHandle } from './analyses/FactorialAnovaAnalysis';
import type { LogisticHandle } from './analyses/LogisticAnalysis';
import type { MultivariateHandle } from './analyses/MultivariateAnalysis';
import type { NonParamRepeatedHandle } from './analyses/NonParamRepeatedAnalysis';
import type { RepeatedAnovaHandle } from './analyses/RepeatedAnovaAnalysis';
import type { SampleSizeHandle } from './analyses/SampleSizeAnalysis';
import type { SurvivalHandle } from './analyses/SurvivalAnalysis';
import type { TimeSeriesHandle } from './analyses/TimeSeriesAnalysis';
import type { WizardHandle } from './analyses/WizardAnalysis';
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
import { downloadExportFile, downloadText } from './io/writers';
import { readXlsxSheets, type XlsxSheet } from './io/xlsx';
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

// --- Types ---
interface AnalysisConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
}

// --- Constants ---
const PALETTE = ['#4f9cf9', '#34d399', '#f87171', '#fbbf24', '#a78bfa', '#38bdf8', '#fb923c', '#e879f9'];

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
          <DataTab
            grid={grid}
            setGrid={setGrid}
            canUndoGrid={canUndoGrid}
            canRedoGrid={canRedoGrid}
            undoGrid={undoGrid}
            redoGrid={redoGrid}
            resetGridHistory={resetGridHistory}
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
            grid={grid}
            outputs={outputs}
            removeOutput={removeOutput}
            clearOutput={clearOutput}
            copyOutput={copyOutput}
            exportChartPngs={exportChartPngs}
            exportReportHtml={exportReportHtml}
            exportResultsXlsx={exportResultsXlsx}
            setActiveTab={setActiveTab}
            runAnalysis={runAnalysis}
            pushOutput={pushOutput}
            showToast={showToast}
            updateColumnLevels={updateColumnLevels}
            updateColumnRecode={updateColumnRecode}
            ancovaRef={ancovaRef}
            contingencyRef={contingencyRef}
            coxRef={coxRef}
            distFitRef={distFitRef}
            factorialRef={factorialRef}
            logisticRef={logisticRef}
            multivariateRef={multivariateRef}
            nonParamRepeatedRef={nonParamRepeatedRef}
            repeatedAnovaRef={repeatedAnovaRef}
            sampleSizeRef={sampleSizeRef}
            survivalRef={survivalRef}
            timeSeriesRef={timeSeriesRef}
            wizardRef={wizardRef}
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
