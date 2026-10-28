import type { Dispatch, SetStateAction } from 'react';
import { remapParams } from '../analyses/params';
import type { ColumnOperation } from '../grid/columnOps';
import type { GridData } from '../grid/types';
import {
  deleteColumn as deleteGridColumn,
  duplicateColumn as duplicateGridColumn,
  insertColumnAt as insertGridColumn,
  moveColumn as moveGridColumn,
} from '../grid/ops';
import type { ProjectParams } from '../io/project';

interface Options {
  grid: GridData;
  params: ProjectParams;
  setParams: Dispatch<SetStateAction<ProjectParams>>;
  setGrid: (next: GridData) => void;
  showToast: (title: string, message: string, type?: 'ok' | 'warn' | 'error') => void;
}

/** Structural column edits with parameter remapping/invalidation. */
export const useColumnOperations = ({
  grid,
  params,
  setParams,
  setGrid,
  showToast,
}: Options) => {
  const applyColumnOperation = (next: GridData, operation: ColumnOperation) => {
    if (next === grid) return;
    const result = remapParams(params, operation);
    setParams(result.params);
    setGrid(next);
    if (result.invalidated.length > 0) {
      const count = result.invalidated.length;
      showToast(
        'Columns',
        `${count} analysis role${count === 1 ? '' : 's'} need reselection`,
        'warn'
      );
    }
  };

  const insertColumn = (at: number) => {
    applyColumnOperation(insertGridColumn(grid, at), { kind: 'insert', at, count: 1 });
  };

  const duplicateColumn = (c: number) => {
    applyColumnOperation(duplicateGridColumn(grid, c), {
      kind: 'insert',
      at: c + 1,
      count: 1,
    });
  };

  const moveColumn = (c: number, dir: -1 | 1) => {
    const target = c + dir;
    if (target < 0 || target >= grid.cols.length) return;
    applyColumnOperation(moveGridColumn(grid, c, dir), {
      kind: 'move',
      from: c,
      to: target,
    });
  };

  const deleteColumn = (c: number) => {
    applyColumnOperation(deleteGridColumn(grid, c), { kind: 'delete', at: c, count: 1 });
  };

  return { applyColumnOperation, insertColumn, duplicateColumn, moveColumn, deleteColumn };
};
