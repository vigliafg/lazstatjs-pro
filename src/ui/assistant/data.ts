import { invalidByColumn } from '../../grid/ops';
import {
  distinctColumnValues,
  missingCellCount,
  type ColType,
  type GridData,
} from '../../grid/types';
import type { MessageKey } from '../../i18n';
import type { Range } from '../../grid/ops';

export type DataActionId =
  | 'openImport'
  | 'openExport'
  | 'saveProject'
  | 'inspectTypes'
  | 'declareMissing'
  | 'findInvalid'
  | 'inspectColumns'
  | 'addColumn'
  | 'duplicateColumn'
  | 'deleteColumn'
  | 'moveColumn'
  | 'addRow'
  | 'sortRows'
  | 'fillDown'
  | 'fillRight'
  | 'clearRange'
  | 'setColumnType'
  | 'recodeLevels'
  | 'declareMissingCodes'
  | 'handoffAnalysis';

export const DATA_ACTION_IDS: readonly DataActionId[] = [
  'openImport',
  'openExport',
  'saveProject',
  'inspectTypes',
  'declareMissing',
  'findInvalid',
  'inspectColumns',
  'addColumn',
  'duplicateColumn',
  'deleteColumn',
  'moveColumn',
  'addRow',
  'sortRows',
  'fillDown',
  'fillRight',
  'clearRange',
  'setColumnType',
  'recodeLevels',
  'declareMissingCodes',
  'handoffAnalysis',
];

export interface DataActionParams {
  column?: number;
  type?: ColType;
  codes?: string[];
  mapping?: Record<string, string>;
  direction?: 'asc' | 'desc';
  move?: -1 | 1;
  selection?: Range | null;
}

interface DataQuestionInput {
  kind: 'question';
  id: string;
  prompt: MessageKey;
  help?: { definition: MessageKey; example: MessageKey };
  options: { id: string; label: MessageKey; next: string; back?: boolean }[];
}

export interface DataLeaf {
  kind: 'leaf';
  domain: 'data';
  id: string;
  action: DataActionId;
  checks: MessageKey[];
  help: MessageKey;
  requires?: 'column' | 'selection' | 'none';
}

type DataNodeInput = DataQuestionInput | DataLeaf;

const help = { definition: 'assistant.d.definition', example: 'assistant.d.example' } as const;
const checks: MessageKey[] = ['assistant.checks.data'];

export const DATA_TREE: Record<string, DataNodeInput> = {
  d1: {
    kind: 'question',
    id: 'd1',
    prompt: 'assistant.d.goal',
    help,
    options: [
      { id: 'file', label: 'data.file', next: 'd2' },
      { id: 'quality', label: 'data.validate', next: 'd3' },
      { id: 'structure', label: 'data.groupTools', next: 'd4' },
      { id: 'transform', label: 'data.transform', next: 'd5' },
      { id: 'handoff', label: 'assistant.d.goal.handoff', next: 'h1' },
    ],
  },
  d2: {
    kind: 'question',
    id: 'd2',
    prompt: 'assistant.d.file',
    help,
    options: [
      { id: 'import', label: 'data.import', next: 'data-import' },
      { id: 'export', label: 'data.export', next: 'data-export' },
      { id: 'save', label: 'data.saveProject', next: 'data-save' },
      { id: 'back', label: 'assistant.d.back', next: 'd1', back: true },
    ],
  },
  d3: {
    kind: 'question',
    id: 'd3',
    prompt: 'assistant.d.quality',
    help,
    options: [
      { id: 'types', label: 'data.variables', next: 'data-types' },
      { id: 'missing', label: 'inspector.missing', next: 'data-missing' },
      { id: 'invalid', label: 'data.invalid', next: 'data-invalid' },
      { id: 'columns', label: 'data.column', next: 'data-columns' },
      { id: 'back', label: 'assistant.d.back', next: 'd1', back: true },
    ],
  },
  d4: {
    kind: 'question',
    id: 'd4',
    prompt: 'assistant.d.structure',
    help,
    options: [
      { id: 'columns', label: 'data.column', next: 'd4a' },
      { id: 'rows', label: 'data.addRow', next: 'd4b' },
      { id: 'clear', label: 'data.clear', next: 'data-clear' },
      { id: 'back', label: 'assistant.d.back', next: 'd1', back: true },
    ],
  },
  d4a: {
    kind: 'question',
    id: 'd4a',
    prompt: 'assistant.d.columns',
    help,
    options: [
      { id: 'add', label: 'data.addColumn', next: 'data-add-column' },
      { id: 'duplicate', label: 'grid.menuDuplicate', next: 'data-duplicate-column' },
      { id: 'delete', label: 'grid.menuDeleteColumn', next: 'data-delete-column' },
      { id: 'move', label: 'assistant.d.move', next: 'data-move-column' },
      { id: 'back', label: 'assistant.d.back', next: 'd4', back: true },
    ],
  },
  d4b: {
    kind: 'question',
    id: 'd4b',
    prompt: 'assistant.d.rows',
    help,
    options: [
      { id: 'add', label: 'data.addRow', next: 'data-add-row' },
      { id: 'sort', label: 'data.transform.sort', next: 'data-sort' },
      { id: 'fill-down', label: 'data.fillDown', next: 'data-fill-down' },
      { id: 'fill-right', label: 'data.fillRight', next: 'data-fill-right' },
      { id: 'back', label: 'assistant.d.back', next: 'd4', back: true },
    ],
  },
  d5: {
    kind: 'question',
    id: 'd5',
    prompt: 'assistant.d.transform',
    help,
    options: [
      { id: 'type', label: 'inspector.type', next: 'data-column-type' },
      { id: 'recode', label: 'data.transform.recode', next: 'data-recode' },
      { id: 'missing-codes', label: 'inspector.missingCodes', next: 'data-missing-codes' },
      { id: 'back', label: 'assistant.d.back', next: 'd1', back: true },
    ],
  },
  h1: {
    kind: 'question',
    id: 'h1',
    prompt: 'assistant.d.ready',
    help,
    options: [
      { id: 'handoff', label: 'assistant.d.goal.handoff', next: 'data-handoff' },
      { id: 'stay', label: 'assistant.d.stay', next: 'd1', back: true },
    ],
  },

  'data-import': {
    kind: 'leaf', domain: 'data', id: 'data-import', action: 'openImport',
    checks: [], help: 'assistant.d.leaf.import', requires: 'none',
  },
  'data-export': {
    kind: 'leaf', domain: 'data', id: 'data-export', action: 'openExport',
    checks: [], help: 'assistant.d.leaf.export', requires: 'none',
  },
  'data-save': {
    kind: 'leaf', domain: 'data', id: 'data-save', action: 'saveProject',
    checks: [], help: 'assistant.d.leaf.save', requires: 'none',
  },
  'data-types': {
    kind: 'leaf', domain: 'data', id: 'data-types', action: 'inspectTypes',
    checks, help: 'assistant.d.leaf.types', requires: 'none',
  },
  'data-missing': {
    kind: 'leaf', domain: 'data', id: 'data-missing', action: 'declareMissing',
    checks, help: 'assistant.d.leaf.missing', requires: 'column',
  },
  'data-invalid': {
    kind: 'leaf', domain: 'data', id: 'data-invalid', action: 'findInvalid',
    checks, help: 'assistant.d.leaf.invalid', requires: 'none',
  },
  'data-columns': {
    kind: 'leaf', domain: 'data', id: 'data-columns', action: 'inspectColumns',
    checks, help: 'assistant.d.leaf.columns', requires: 'none',
  },
  'data-add-column': {
    kind: 'leaf', domain: 'data', id: 'data-add-column', action: 'addColumn',
    checks: [], help: 'assistant.d.leaf.addColumn', requires: 'none',
  },
  'data-duplicate-column': {
    kind: 'leaf', domain: 'data', id: 'data-duplicate-column', action: 'duplicateColumn',
    checks: [], help: 'assistant.d.leaf.duplicateColumn', requires: 'column',
  },
  'data-delete-column': {
    kind: 'leaf', domain: 'data', id: 'data-delete-column', action: 'deleteColumn',
    checks: [], help: 'assistant.d.leaf.deleteColumn', requires: 'column',
  },
  'data-move-column': {
    kind: 'leaf', domain: 'data', id: 'data-move-column', action: 'moveColumn',
    checks: [], help: 'assistant.d.leaf.moveColumn', requires: 'column',
  },
  'data-add-row': {
    kind: 'leaf', domain: 'data', id: 'data-add-row', action: 'addRow',
    checks: [], help: 'assistant.d.leaf.addRow', requires: 'none',
  },
  'data-sort': {
    kind: 'leaf', domain: 'data', id: 'data-sort', action: 'sortRows',
    checks: [], help: 'assistant.d.leaf.sort', requires: 'column',
  },
  'data-fill-down': {
    kind: 'leaf', domain: 'data', id: 'data-fill-down', action: 'fillDown',
    checks: [], help: 'assistant.d.leaf.fillDown', requires: 'selection',
  },
  'data-fill-right': {
    kind: 'leaf', domain: 'data', id: 'data-fill-right', action: 'fillRight',
    checks: [], help: 'assistant.d.leaf.fillRight', requires: 'selection',
  },
  'data-clear': {
    kind: 'leaf', domain: 'data', id: 'data-clear', action: 'clearRange',
    checks: [], help: 'assistant.d.leaf.clear', requires: 'selection',
  },
  'data-column-type': {
    kind: 'leaf', domain: 'data', id: 'data-column-type', action: 'setColumnType',
    checks: [], help: 'assistant.d.leaf.columnType', requires: 'column',
  },
  'data-recode': {
    kind: 'leaf', domain: 'data', id: 'data-recode', action: 'recodeLevels',
    checks: [], help: 'assistant.d.leaf.recode', requires: 'column',
  },
  'data-missing-codes': {
    kind: 'leaf', domain: 'data', id: 'data-missing-codes', action: 'declareMissingCodes',
    checks: [], help: 'assistant.d.leaf.missingCodes', requires: 'column',
  },
  'data-handoff': {
    kind: 'leaf', domain: 'data', id: 'data-handoff', action: 'handoffAnalysis',
    checks: [], help: 'assistant.d.leaf.handoff', requires: 'none',
  },
};

export type DataIssueKind = 'invalid' | 'missing' | 'empty' | 'constant' | 'id';

export interface DataIssue {
  column: number;
  name: string;
  kind: DataIssueKind;
  count: number;
}

export const dataIssueLabel: Record<DataIssueKind, MessageKey> = {
  invalid: 'data.invalid',
  missing: 'inspector.missing',
  empty: 'data.isEmpty',
  constant: 'assistant.d.issue.constant',
  id: 'inspector.roleId',
};

/** A grid with no usable data: no rows/columns or only blank cells. */
export const isEmptyGrid = (grid: GridData): boolean =>
  grid.cols.length === 0 ||
  grid.rows.length === 0 ||
  grid.rows.every(row => row.every(cell => String(cell ?? '').trim() === ''));

const COLUMN_ACTIONS: readonly DataActionId[] = [
  'declareMissing',
  'duplicateColumn',
  'deleteColumn',
  'moveColumn',
  'sortRows',
  'setColumnType',
  'recodeLevels',
  'declareMissingCodes',
];

const SELECTION_ACTIONS: readonly DataActionId[] = ['fillDown', 'fillRight', 'clearRange'];

/**
 * Precondition of a data action, shared by the picker UI and the unit tests.
 * Returns the message to show when the action cannot run, or null when it can.
 */
export const dataActionBlocked = (
  action: DataActionId,
  params: DataActionParams = {},
  context: { grid: GridData; selection: Range | null }
): MessageKey | null => {
  if (isEmptyGrid(context.grid)) {
    if (action === 'openImport' || action === 'addColumn') return null;
    return action === 'handoffAnalysis' ? 'assistant.d.handoffEmpty' : 'assistant.d.emptyGrid';
  }
  const column =
    params.column !== undefined &&
    params.column >= 0 &&
    params.column < context.grid.cols.length
      ? params.column
      : null;
  if (COLUMN_ACTIONS.includes(action) && column === null) return 'assistant.d.pickColumn';
  if (SELECTION_ACTIONS.includes(action) && !context.selection) {
    return 'assistant.d.noSelection';
  }
  if (action === 'setColumnType' && !params.type) return 'assistant.d.pickType';
  if (action === 'declareMissingCodes' && !(params.codes ?? []).length) {
    return 'assistant.d.pickCodes';
  }
  if (
    action === 'recodeLevels' &&
    Object.keys(params.mapping ?? {}).length === 0
  ) {
    return 'assistant.d.pickMapping';
  }
  return null;
};

/** Pure quality scan used by the data Assistant card. */
export const inspectData = (grid: GridData): DataIssue[] => {
  const issues: DataIssue[] = [];
  const invalid = invalidByColumn(grid);
  grid.cols.forEach((col, column) => {
    const base = { column, name: col.name };
    if (invalid[column]?.count) issues.push({ ...base, kind: 'invalid', count: invalid[column].count });
    const missing = missingCellCount(grid, column);
    if (missing > 0) issues.push({ ...base, kind: 'missing', count: missing });
    const values = distinctColumnValues(grid.rows, column);
    if (values.length === 0) issues.push({ ...base, kind: 'empty', count: grid.rows.length });
    else if (values.length === 1) issues.push({ ...base, kind: 'constant', count: 1 });
    if (col.type === 'id') issues.push({ ...base, kind: 'id', count: 1 });
  });
  const order: Record<DataIssueKind, number> = { invalid: 0, missing: 1, empty: 2, constant: 3, id: 4 };
  return issues.sort((a, b) => order[a.kind] - order[b.kind] || a.column - b.column);
};
