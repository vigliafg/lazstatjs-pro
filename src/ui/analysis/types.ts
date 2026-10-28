import type { Dispatch, SetStateAction } from 'react';
import type { CategoryLevel, GridData } from '../../grid/types';
import type { RowFilter } from '../../grid/ops';
import type { RoleState } from '../../analyses/roles';
import type { OutputEntry } from '../OutputConsole';
import type { ProjectParams } from '../../io/project';

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
  onApplyOutputParams: (entry: OutputEntry) => void;
  paramsSignatureFor: (analysisId: string) => string;
  removeOutput: (index: number) => void;
  clearOutput: () => void;
  copyOutput: () => void;
  exportChartPngs: () => void;
  exportReportHtml: () => void;
  exportResultsXlsx: () => void;
  setActiveTab: Dispatch<SetStateAction<'data' | 'analysis' | 'settings' | 'help'>>;
  runAnalysis: () => boolean;
  runAnalysisLive: () => boolean;
  updateColumnLevels: (column: number, levels: CategoryLevel[], reference?: string) => void;
  updateColumnRecode: (column: number, mapping: Record<string, string>) => void;
}
