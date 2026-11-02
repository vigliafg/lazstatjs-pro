import type { Dispatch, SetStateAction } from 'react';
import type { CategoryLevel, GridData } from '../../grid/types';
import type { RowFilter } from '../../grid/ops';
import type { RoleState } from '../../analyses/roles';
import type { OutputEntry } from '../output/types';
import type { ProjectParams } from '../../io/project';
import type { AnalysisChart, ChartOptions } from '../../stats/charts';
import type { ChartOutputGroup } from '../../charts/outputs';
import type { ChartKind } from '../../stats/charts';
import type { ChartLinkValue } from '../../components/charts/ChartLinkContext';

/**
 * State and callbacks that the analysis workspace needs.
 *
 * The App still owns the single persisted `params` object, but the workspace
 * receives it with `setParams`; the parameter slices are distributed to the
 * forms by the internal store (`AnalysisStoreProvider`), not by 30 prop pairs.
 */
export interface AnalysisTabProps {
  activeAnalysis: string;
  setActiveAnalysis: Dispatch<SetStateAction<string>>;
  ciLevel: number;
  setCiLevel: Dispatch<SetStateAction<number>>;
  params: ProjectParams;
  setParams: Dispatch<SetStateAction<ProjectParams>>;
  grid: GridData;
  /** Grid actually used by the runs (row filter + missing mask applied). */
  linkGrid: GridData;
  /** Session row state shared by the output console and its charts. */
  chartLink: ChartLinkValue;
  outputs: OutputEntry[];
  dataRevision: number;
  datasetId: string;
  roleErrors: string[];
  filterAffectsAnalysis: boolean;
  visibleRowCount: number;
  activeRowFilter: RowFilter | null;
  filterSignature: string;
  focusedColumn: number | null;
  onAssignPrimary: (column: number) => void;
  roles: RoleState[];
  onAssignRole: (column: number, roleKey: string) => void;
  onRerunOutput: (entry: OutputEntry) => void;
  onRerunAllOutputs: () => void;
  onApplyOutputParams: (entry: OutputEntry) => void;
  paramsSignatureFor: (analysisId: string) => string;
  limitationsLabel: string;
  /** CSS custom properties for the output/report window only. */
  outputStyle: Record<string, string>;
  /** Optional chart groups hidden per procedure, persisted with the project. */
  hiddenChartGroups: Record<string, ChartOutputGroup[]>;
  setHiddenChartGroups: Dispatch<SetStateAction<Record<string, ChartOutputGroup[]>>>;
  /** Per-procedure style overrides, keyed by analysis id then chart kind. */
  chartStyleOverrides: Record<string, Partial<Record<ChartKind, string>>>;
  setChartStyleOverrides: Dispatch<
    SetStateAction<Record<string, Partial<Record<ChartKind, string>>>>
  >;
  onUpdateChart: (entryId: string, chartId: string, options: ChartOptions) => void;
  onInsertChart: (entryId: string, chart: AnalysisChart) => void;
  /** Graph Builder: append a chart built from the current dataset. */
  onAddBuiltChart: (chart: AnalysisChart) => void;
  removeOutput: (index: number) => void;
  clearOutput: () => void;
  copyOutput: () => void;
  exportChartPngs: () => void;
  exportReportHtml: () => void;
  exportReportWord: () => void;
  exportResultsXlsx: () => void;
  exportRunReportHtml: (entryId: string) => void;
  exportRunReportWord: (entryId: string) => void;
  setActiveTab: Dispatch<SetStateAction<'data' | 'analysis' | 'settings' | 'help'>>;
  runAnalysis: () => Promise<boolean>;
  runAnalysisLive: (isCurrent?: () => boolean) => Promise<boolean>;
  /** Heavy procedures run in a worker; the setup shows progress and cancel. */
  analysisRunning: boolean;
  analysisPhase: 'starting' | 'computing' | 'finishing';
  cancelAnalysis: () => void;
  updateColumnLevels: (column: number, levels: CategoryLevel[], reference?: string) => void;
  updateColumnRecode: (column: number, mapping: Record<string, string>) => void;
}
