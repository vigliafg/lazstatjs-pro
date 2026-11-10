import { useCallback } from 'react';
import { fillRightRange } from '../../grid/fillRight';
import {
  addColumnEnd,
  addRowEnd,
  clearRange,
  fillDownRange,
  sortByColumn,
} from '../../grid/ops';
import type { Range } from '../../grid/ops';
import type { ColType, GridData } from '../../grid/types';
import type { Toast } from '../../hooks/useToasts';
import { t } from '../../i18n';
import type { DataActionId, DataActionParams } from './data';

interface Options {
  grid: GridData;
  setGrid: (next: GridData) => void;
  selection: Range | null;
  setSelection: (range: Range | null) => void;
  openImport: () => void;
  openExport: () => void;
  saveProject: () => void;
  openAnalysis: () => void;
  inspect: (column: number) => void;
  duplicateColumn: (column: number) => void;
  moveColumn: (column: number, direction: -1 | 1) => void;
  deleteColumn: (column: number) => void;
  setColumnType: (column: number, type: ColType) => void;
  recode: (column: number, mapping: Record<string, string>) => void;
  setColumnMeta: (column: number, patch: { missing?: string[] }) => void;
  runValidation: () => void;
  showToast: (title: string, message: string, type?: Toast['type']) => void;
}

/**
 * Bridge from a data leaf to the existing editor commands. The Assistant adds
 * no data logic of its own: every action here is the same function the toolbar,
 * the grid menu or the inspector already call.
 */
export const useDataActions = (options: Options) => {
  const {
    grid,
    setGrid,
    selection,
    setSelection,
    openImport,
    openExport,
    saveProject,
    openAnalysis,
    inspect,
    duplicateColumn,
    moveColumn,
    deleteColumn,
    setColumnType,
    recode,
    setColumnMeta,
    runValidation,
    showToast,
  } = options;

  return useCallback(
    (action: DataActionId, params: DataActionParams = {}) => {
      const column = params.column;
      switch (action) {
        case 'openImport':
          openImport();
          return;
        case 'openExport':
          openExport();
          return;
        case 'saveProject':
          saveProject();
          return;
        case 'inspectTypes':
        case 'findInvalid':
          runValidation();
          return;
        case 'inspectColumns':
          inspect(column ?? 0);
          return;
        case 'declareMissing':
          if (column !== undefined) inspect(column);
          return;
        case 'addColumn':
          setGrid(addColumnEnd(grid));
          return;
        case 'duplicateColumn':
          if (column !== undefined) duplicateColumn(column);
          return;
        case 'deleteColumn': {
          if (column === undefined) return;
          const name = grid.cols[column]?.name ?? '';
          if (
            !window.confirm(
              `${t('data.deleteColumnPrefix')} "${name}"${t('data.deleteColumnSuffix')}`
            )
          ) {
            return;
          }
          deleteColumn(column);
          return;
        }
        case 'moveColumn':
          if (column !== undefined) moveColumn(column, params.move ?? 1);
          return;
        case 'addRow':
          setGrid(addRowEnd(grid));
          return;
        case 'sortRows': {
          if (column === undefined) return;
          const direction = params.direction ?? 'asc';
          setGrid(sortByColumn(grid, column, direction));
          showToast(
            t('toast.sort'),
            `${t('data.sortedBy')} ${grid.cols[column]?.name ?? ''} (${direction})`,
            'ok'
          );
          return;
        }
        case 'fillDown':
          if (selection) setGrid(fillDownRange(grid, selection));
          return;
        case 'fillRight':
          if (selection) setGrid(fillRightRange(grid, selection));
          return;
        case 'clearRange':
          if (!selection) return;
          if (!window.confirm(t('assistant.d.confirmClear'))) return;
          setGrid(clearRange(grid, selection));
          setSelection(null);
          return;
        case 'setColumnType':
          if (column !== undefined && params.type) setColumnType(column, params.type);
          return;
        case 'recodeLevels':
          if (column !== undefined && params.mapping) recode(column, params.mapping);
          return;
        case 'declareMissingCodes':
          if (column !== undefined) setColumnMeta(column, { missing: params.codes ?? [] });
          return;
        case 'handoffAnalysis':
          openAnalysis();
          return;
      }
    },
    [
      grid,
      setGrid,
      selection,
      setSelection,
      openImport,
      openExport,
      saveProject,
      openAnalysis,
      inspect,
      duplicateColumn,
      moveColumn,
      deleteColumn,
      setColumnType,
      recode,
      setColumnMeta,
      runValidation,
      showToast,
    ]
  );
};
