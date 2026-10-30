import { useEffect, useState, type Dispatch, type RefObject, type SetStateAction } from 'react';
import { DataTab } from './DataTab';
import type { ColumnOperation } from '../grid/columnOps';
import type { CategoryLevel, ColType, GridData } from '../grid/types';
import type { RowFilter, RowFilterOp } from '../grid/ops';

interface Props {
  grid: GridData;
  setGrid: Dispatch<SetStateAction<GridData>>;
  canUndoGrid: boolean;
  canRedoGrid: boolean;
  undoGrid: () => void;
  redoGrid: () => void;
  csvInputRef: RefObject<HTMLInputElement | null>;
  projectInputRef: RefObject<HTMLInputElement | null>;
  exportCsv: () => void;
  importCsv: (file: File) => Promise<void>;
  saveProjectFile: () => void;
  openProjectFile: (file: File) => Promise<void>;
  lastAutosave: string | null;
  showToast: (title: string, message: string, type?: 'ok' | 'warn' | 'error') => void;
  validation: { ran: boolean; issues: { r: number; c: number; value: string; colName: string }[] };
  setValidation: Dispatch<
    SetStateAction<{ ran: boolean; issues: { r: number; c: number; value: string; colName: string }[] }>
  >;
  setActiveTab: Dispatch<SetStateAction<'data' | 'analysis' | 'settings' | 'help'>>;
  addColumn: () => void;
  addRow: () => void;
  onNewDataset: () => void;
  onInsertColumn: (at: number) => void;
  onDuplicateColumn: (column: number) => void;
  onMoveColumn: (column: number, direction: -1 | 1) => void;
  onDeleteColumn: (column: number) => void;
  onColumnOperation: (next: GridData, operation: ColumnOperation) => void;
  updateCell: (r: number, c: number, value: string) => void;
  updateColType: (c: number, type: ColType) => void;
  updateColumnLevels: (c: number, levels: CategoryLevel[], reference?: string) => void;
  updateColumnRecode: (c: number, mapping: Record<string, string>) => void;
  onColumnMeta: (c: number, patch: { label?: string; description?: string; missing?: string[] }) => void;
  focusedColumn: number | null;
  onFocusColumn: (column: number) => void;
  filterAffectsAnalysis: boolean;
  setFilterAffectsAnalysis: Dispatch<SetStateAction<boolean>>;
  showFilter: boolean;
  setShowFilter: Dispatch<SetStateAction<boolean>>;
  filterCol: number;
  setFilterCol: Dispatch<SetStateAction<number>>;
  filterOp: RowFilterOp;
  setFilterOp: Dispatch<SetStateAction<RowFilterOp>>;
  filterValue: string;
  setFilterValue: Dispatch<SetStateAction<string>>;
  filterNeedsValue: boolean;
  activeRowFilter: RowFilter | null;
  visibleRowCount: number;
  /** Identity of the current dataset: resets selection when it changes. */
  datasetId: string;
}

/**
 * Data-editor zone: owns the local view state (selection, inspector, panels)
 * and forwards only the dataset and the shared state that the analysis side
 * also needs.
 *
 * Extracted from `App.tsx` to keep the shell under the file-size guard.
 */
export const DataWorkspace = (p: Props) => {
  const [focusCell, setFocusCell] = useState<{ r: number; c: number; stamp: number } | null>(null);
  const [selRange, setSelRange] = useState<{ r0: number; c0: number; r1: number; c1: number } | null>(null);
  const [freezeFirstCol, setFreezeFirstCol] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const [inspectorCol, setInspectorCol] = useState(0);

  // A new dataset (New/Import/Open) must not keep a selection or an inspector
  // pointing at the previous one; the DataGrid also clears its internal anchor.
  useEffect(() => {
    setFocusCell(null);
    setSelRange(null);
    setInspectorCol(0);
    setShowInspector(false);
  }, [p.datasetId]);

  // Column indexes in the filter bar go stale after delete/merge.
  useEffect(() => {
    const max = Math.max(0, p.grid.cols.length - 1);
    if (p.filterCol > max) p.setFilterCol(max);
  }, [p.grid.cols.length, p.filterCol, p.setFilterCol]);

  useEffect(() => {
    if (inspectorCol >= p.grid.cols.length) {
      setInspectorCol(Math.max(0, p.grid.cols.length - 1));
    }
  }, [p.grid.cols.length, inspectorCol]);

  // Selection bar holds raw indexes: clamp them after delete/merge/paste so
  // Fill/Copy/Clear never address rows/cols that no longer exist.
  useEffect(() => {
    if (!selRange) return;
    const maxR = Math.max(0, p.grid.rows.length - 1);
    const maxC = Math.max(0, p.grid.cols.length - 1);
    const clamp = (value: number, max: number) => Math.max(0, Math.min(max, value));
    const next = {
      r0: clamp(selRange.r0, maxR),
      c0: clamp(selRange.c0, maxC),
      r1: clamp(selRange.r1, maxR),
      c1: clamp(selRange.c1, maxC),
    };
    if (
      next.r0 !== selRange.r0 ||
      next.c0 !== selRange.c0 ||
      next.r1 !== selRange.r1 ||
      next.c1 !== selRange.c1
    ) {
      setSelRange(next);
    }
  }, [p.grid.rows.length, p.grid.cols.length, selRange]);

  return (
    <DataTab
      grid={p.grid}
      datasetId={p.datasetId}
      setGrid={p.setGrid}
      onNewDataset={p.onNewDataset}
      onInsertColumn={p.onInsertColumn}
      onDuplicateColumn={p.onDuplicateColumn}
      onMoveColumn={p.onMoveColumn}
      onDeleteColumn={p.onDeleteColumn}
      onColumnOperation={p.onColumnOperation}
      canUndoGrid={p.canUndoGrid}
      canRedoGrid={p.canRedoGrid}
      undoGrid={p.undoGrid}
      redoGrid={p.redoGrid}
      csvInputRef={p.csvInputRef}
      projectInputRef={p.projectInputRef}
      exportCsv={p.exportCsv}
      importCsv={p.importCsv}
      saveProjectFile={p.saveProjectFile}
      openProjectFile={p.openProjectFile}
      lastAutosave={p.lastAutosave}
      showToast={p.showToast}
      validation={p.validation}
      setValidation={p.setValidation}
      focusCell={focusCell}
      setFocusCell={setFocusCell}
      selRange={selRange}
      setSelRange={setSelRange}
      freezeFirstCol={freezeFirstCol}
      setFreezeFirstCol={setFreezeFirstCol}
      showFilter={p.showFilter}
      setShowFilter={p.setShowFilter}
      showInspector={showInspector}
      setShowInspector={setShowInspector}
      focusedColumn={p.focusedColumn}
      onFocusColumn={p.onFocusColumn}
      filterAffectsAnalysis={p.filterAffectsAnalysis}
      setFilterAffectsAnalysis={p.setFilterAffectsAnalysis}
      inspectorCol={inspectorCol}
      setInspectorCol={setInspectorCol}
      onColumnMeta={p.onColumnMeta}
      filterCol={p.filterCol}
      setFilterCol={p.setFilterCol}
      filterOp={p.filterOp}
      setFilterOp={p.setFilterOp}
      filterValue={p.filterValue}
      setFilterValue={p.setFilterValue}
      filterNeedsValue={p.filterNeedsValue}
      activeRowFilter={p.activeRowFilter}
      visibleRowCount={p.visibleRowCount}
      updateCell={p.updateCell}
      updateColType={p.updateColType}
      updateColumnLevels={p.updateColumnLevels}
      updateColumnRecode={p.updateColumnRecode}
      setActiveTab={p.setActiveTab}
      addColumn={p.addColumn}
      addRow={p.addRow}
    />
  );
};
