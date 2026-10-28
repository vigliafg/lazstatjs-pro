import type { Dispatch, RefObject, SetStateAction } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { CleanPanel } from '../grid/CleanPanel';
import { VariableInspector } from '../grid/VariableInspector';
import { fillRightRange as gridFillRight } from '../grid/fillRight';
import { DataGrid } from '../grid/DataGrid';
import { TransformPanel } from '../grid/TransformPanel';
import {
  addColumnEnd as gridAddColumn,
  addRowEnd as gridAddRow,
  clearGrid as gridClear,
  clearRange as gridClearRange,
  coerceGrid as gridCoerce,
  deleteColumn as gridDeleteColumn,
  deleteRow as gridDeleteRow,
  duplicateColumn as gridDuplicateColumn,
  fillDownRange as gridFillDown,
  findInvalid as gridFindInvalid,
  insertColumnAt as gridInsertColumn,
  insertRowAt as gridInsertRow,
  invalidByColumn as gridInvalidByColumn,
  moveColumn as gridMoveColumn,
  newGrid as makeNewGrid,
  parseTsv as parseTsvBlock,
  pasteTsvAt as gridPasteTsv,
  rangeToTsv as gridRangeToTsv,
  renameColumn as gridRenameColumn,
  sortByColumn as gridSortByColumn,
  type RowFilter,
  type RowFilterOp,
} from '../grid/ops';
import type { CategoryLevel, ColType, GridData } from '../grid/types';
import type { ColumnOperation } from '../grid/columnOps';

export interface DataTabProps {
  grid: GridData;
  setGrid: Dispatch<SetStateAction<GridData>>;
  onNewDataset: () => void;
  onInsertColumn: (at: number) => void;
  onDuplicateColumn: (c: number) => void;
  onMoveColumn: (c: number, dir: -1 | 1) => void;
  onDeleteColumn: (c: number) => void;
  onColumnOperation: (next: GridData, operation: ColumnOperation) => void;
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
  showToast: (title: string, msg: string, type?: 'ok' | 'warn' | 'error') => void;
  validation: { ran: boolean; issues: { r: number; c: number; value: string; colName: string }[] };
  setValidation: Dispatch<SetStateAction<{ ran: boolean; issues: { r: number; c: number; value: string; colName: string }[] }>>;
  focusCell: { r: number; c: number; stamp: number } | null;
  setFocusCell: Dispatch<SetStateAction<{ r: number; c: number; stamp: number } | null>>;
  selRange: { r0: number; c0: number; r1: number; c1: number } | null;
  setSelRange: Dispatch<SetStateAction<{ r0: number; c0: number; r1: number; c1: number } | null>>;
  freezeFirstCol: boolean;
  setFreezeFirstCol: Dispatch<SetStateAction<boolean>>;
  showFilter: boolean;
  setShowFilter: Dispatch<SetStateAction<boolean>>;
  showInspector: boolean;
  setShowInspector: Dispatch<SetStateAction<boolean>>;
  focusedColumn: number | null;
  onFocusColumn: (column: number) => void;
  filterAffectsAnalysis: boolean;
  setFilterAffectsAnalysis: Dispatch<SetStateAction<boolean>>;
  inspectorCol: number;
  setInspectorCol: Dispatch<SetStateAction<number>>;
  onColumnMeta: (column: number, patch: { label?: string; description?: string }) => void;
  filterCol: number;
  setFilterCol: Dispatch<SetStateAction<number>>;
  filterOp: RowFilterOp;
  setFilterOp: Dispatch<SetStateAction<RowFilterOp>>;
  filterValue: string;
  setFilterValue: Dispatch<SetStateAction<string>>;
  filterNeedsValue: boolean;
  activeRowFilter: RowFilter | null;
  visibleRowCount: number;
  showClean: boolean;
  setShowClean: Dispatch<SetStateAction<boolean>>;
  showTransform: boolean;
  setShowTransform: Dispatch<SetStateAction<boolean>>;
  updateCell: (r: number, c: number, value: string) => void;
  updateColType: (c: number, type: ColType) => void;
  updateColumnLevels: (c: number, levels: CategoryLevel[], reference?: string) => void;
  updateColumnRecode: (c: number, mapping: Record<string, string>) => void;
  setActiveTab: Dispatch<SetStateAction<'data' | 'analysis' | 'settings' | 'help'>>;
  addColumn: () => void;
  addRow: () => void;
}

export const DataTab = ({
  grid,
  setGrid,
  onNewDataset,
  onInsertColumn,
  onDuplicateColumn,
  onMoveColumn,
  onDeleteColumn,
  onColumnOperation,
  canUndoGrid,
  canRedoGrid,
  undoGrid,
  redoGrid,
  csvInputRef,
  projectInputRef,
  exportCsv,
  importCsv,
  saveProjectFile,
  openProjectFile,
  lastAutosave,
  showToast,
  validation,
  setValidation,
  focusCell,
  setFocusCell,
  selRange,
  setSelRange,
  freezeFirstCol,
  setFreezeFirstCol,
  showFilter,
  setShowFilter,
  showInspector,
  setShowInspector,
  focusedColumn,
  onFocusColumn,
  filterAffectsAnalysis,
  setFilterAffectsAnalysis,
  inspectorCol,
  setInspectorCol,
  onColumnMeta,
  filterCol,
  setFilterCol,
  filterOp,
  setFilterOp,
  filterValue,
  setFilterValue,
  filterNeedsValue,
  activeRowFilter,
  visibleRowCount,
  showClean,
  setShowClean,
  showTransform,
  setShowTransform,
  updateCell,
  updateColType,
  updateColumnLevels,
  updateColumnRecode,
  setActiveTab,
  addColumn,
  addRow,
}: DataTabProps) => (
  <>
<div className="flex-1 flex flex-col overflow-hidden">
  <div className="bg-surface border-b border-border p-1.5 flex flex-wrap items-center gap-2 shrink-0">
    <span className="font-mono text-[10px] text-text3 uppercase tracking-widest px-2">File:</span>
    <button className="tb-btn" onClick={onNewDataset}>New</button>
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
      className={`tb-btn ${showInspector ? 'bg-accent text-white border-accent' : ''}`}
      onClick={() => setShowInspector((value) => !value)}
      title="Open the variable inspector"
    >
      Variables
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
      <button
        type="button"
        className={`tb-btn ${filterAffectsAnalysis ? 'bg-accent text-white border-accent' : ''}`}
        onClick={() => setFilterAffectsAnalysis(value => !value)}
        title="Choose whether the row filter also limits the rows used by analyses"
      >
        {filterAffectsAnalysis ? 'Also filter analyses' : 'View only'}
      </button>
      <span className="text-text3 text-[10px] italic">
        {filterAffectsAnalysis
          ? `analyses use ${visibleRowCount} of ${grid.rows.length} rows`
          : 'view only — analyses still use all rows'}
      </span>
    </div>
  )}

  {showTransform && (
    <TransformPanel
      grid={grid}
      onApply={(next, msg, kind = 'ok', operation) => {
        if (next !== grid) {
          if (operation) onColumnOperation(next, operation);
          else setGrid(next);
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
  
  <div className="flex min-h-0 flex-1">
    <div className={`${showInspector ? 'hidden lg:flex' : 'flex'} min-h-0 min-w-0 flex-1 flex-col`}>
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
    onInsertCol={onInsertColumn}
    onDuplicateCol={onDuplicateColumn}
    onMoveCol={onMoveColumn}
    onDeleteCol={(c) => {
      if (grid.cols.length <= 1) {
        showToast('Columns', 'At least one column is required', 'warn');
        return;
      }
      if (!window.confirm(`Delete column "${grid.cols[c]?.name}"? You can undo.`)) return;
      onDeleteColumn(c);
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
    onFocusCol={onFocusColumn}
    onInspectCol={(col) => {
      setInspectorCol(col);
      setShowInspector(true);
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
      <button className="tb-btn" onClick={() => setGrid((prev) => gridFillRight(prev, selRange))}>
        Fill right
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
    </div>

    {showInspector && (
      <div className="flex min-h-0 w-full shrink-0 lg:w-[320px]">
        <VariableInspector
          grid={grid}
          column={inspectorCol}
          onSelectColumn={setInspectorCol}
          onRename={(c, name) => {
            setGrid((prev) => gridRenameColumn(prev, c, name));
            setValidation((v) => ({ ...v, ran: false }));
          }}
          onType={updateColType}
          onMeta={onColumnMeta}
          onLevels={updateColumnLevels}
          onRecode={updateColumnRecode}
          onDuplicate={onDuplicateColumn}
          onDelete={(c) => {
            if (grid.cols.length <= 1) {
              showToast('Columns', 'At least one column is required', 'warn');
              return;
            }
            if (!window.confirm(`Delete column "${grid.cols[c]?.name}"? You can undo.`)) return;
            onDeleteColumn(c);
            setShowInspector(false);
          }}
          onClose={() => setShowInspector(false)}
        />
      </div>
    )}
  </div>

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
  </>
);
