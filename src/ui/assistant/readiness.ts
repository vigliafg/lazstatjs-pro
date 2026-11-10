import type { GridData } from '../../grid/types';
import type { ProjectParams } from '../../io/project';
import { applyAssistantLeaf, type AssistantAssignment } from './apply';
import { ASSISTANT_TREE, type AssistantLeaf } from './tree';

/** Five states: a leaf is ready, or blocked by one specific obstacle. */
export type LeafReadinessState = 'ready' | 'empty' | 'missing-roles' | 'type-mismatch' | 'rules';

export type LeafRepairTarget = 'import' | 'types' | 'missing' | 'rows' | 'columns';

export interface LeafRepair {
  target: LeafRepairTarget;
  /** Column the user has to fix, when the obstacle is column-specific. */
  column?: number;
}

export interface LeafReadiness {
  state: LeafReadinessState;
  canRun: boolean;
  manual: boolean;
  /** Parameters the run would use once the roles are inferred. */
  params: ProjectParams;
  assignments: AssistantAssignment[];
  missing: AssistantAssignment[];
  problems: string[];
  repairs: LeafRepair[];
}

const values = (grid: GridData, column: number): string[] =>
  grid.rows
    .map(row => String(row[column] ?? '').trim())
    .filter(value => value !== '');

const roleColumn = (assignments: AssistantAssignment[], roleKey: string): number | null =>
  assignments.find(item => item.roleKey === roleKey)?.column ?? null;

const valuesProblem = (
  rule: string,
  grid: GridData,
  assignments: AssistantAssignment[]
): { column: number; target: LeafRepairTarget } | null => {
  const roleKey =
    rule === 'event01'
      ? 'event'
      : rule === 'count'
        ? 'dep'
        : rule === 'groupLevels'
          ? 'grp'
          : 'variable';
  const fallback =
    assignments.find(item => item.column !== null)?.column ??
    assignments[0]?.column ??
    null;
  const column = roleColumn(assignments, roleKey) ?? fallback;
  if (column === null || column < 0) return null;
  const cellValues = values(grid, column);
  if (cellValues.length === 0) return null;
  if (rule === 'binary' && new Set(cellValues).size > 2) return { column, target: 'types' };
  if (rule === 'groupLevels' && new Set(cellValues).size < 2) return { column, target: 'types' };
  if (rule === 'event01' && cellValues.some(value => !['0', '1'].includes(value))) {
    return { column, target: 'types' };
  }
  if (rule === 'count') {
    const bad = cellValues.some(value => {
      const number = Number(value);
      return !Number.isFinite(number) || number < 0 || !Number.isInteger(number);
    });
    if (bad) return { column, target: 'types' };
  }
  return null;
};

/**
 * Single readiness check for every leaf: the apply bridge infers the roles,
 * then this function names the first obstacle (empty grid, missing roles, type
 * mismatch, data-shape rules) and the repair that unblocks it.
 */
export const validateLeafReadiness = (
  leaf: AssistantLeaf,
  params: ProjectParams,
  grid: GridData
): LeafReadiness => {
  const result = applyAssistantLeaf(leaf, params, grid);
  const base = {
    params: result.params,
    assignments: result.assignments,
    missing: result.missing,
    problems: result.problems,
  };
  const manual = Boolean(leaf.contract.manual);
  if (manual) {
    return { ...base, state: 'ready', canRun: true, manual, repairs: [] };
  }
  if (grid.cols.length === 0) {
    return { ...base, state: 'empty', canRun: false, manual, repairs: [{ target: 'import' }] };
  }
  if (result.missing.length > 0) {
    return {
      ...base,
      state: 'missing-roles',
      canRun: false,
      manual,
      repairs: result.missing.map(item => ({
        target: 'columns' as const,
        ...(item.column !== null ? { column: item.column } : {}),
      })),
    };
  }
  if (result.problems.length > 0) {
    return {
      ...base,
      state: 'type-mismatch',
      canRun: false,
      manual,
      repairs: [
        {
          target: 'types',
          ...(result.assignments.find(item => item.column !== null)?.column !== undefined
            ? { column: result.assignments.find(item => item.column !== null)!.column! }
            : {}),
        },
      ],
    };
  }
  for (const rule of leaf.contract.values ?? []) {
    const violation = valuesProblem(rule, grid, result.assignments);
    if (violation) {
      return {
        ...base,
        state: 'rules',
        canRun: false,
        manual,
        repairs: [{ target: violation.target, column: violation.column }],
      };
    }
  }
  if (leaf.contract.complete) {
    const columns = result.assignments
      .map(item => item.column)
      .filter((column): column is number => typeof column === 'number' && column >= 0);
    const complete =
      columns.length === 0
        ? grid.rows.length
        : leaf.contract.complete === 'pairs'
          ? Math.min(...columns.map(column => values(grid, column).length))
          : grid.rows.filter(row =>
              columns.every(column => String(row[column] ?? '').trim() !== '')
            ).length;
    if (complete < (leaf.contract.minRows ?? 1)) {
      return { ...base, state: 'rules', canRun: false, manual, repairs: [{ target: 'rows' }] };
    }
    return { ...base, state: 'ready', canRun: true, manual, repairs: [] };
  }
  if (grid.rows.length < (leaf.contract.minRows ?? 1)) {
    return { ...base, state: 'rules', canRun: false, manual, repairs: [{ target: 'rows' }] };
  }
  return { ...base, state: 'ready', canRun: true, manual, repairs: [] };
};

/** Every leaf reachable from a node, including back-edges guarded by a set. */
const leavesUnder = (nodeId: string, seen = new Set<string>()): AssistantLeaf[] => {
  if (seen.has(nodeId)) return [];
  seen.add(nodeId);
  const node = ASSISTANT_TREE[nodeId];
  if (!node) return [];
  if (node.kind === 'leaf') return node.domain === 'analysis' ? [node] : [];
  return node.options.flatMap(option => leavesUnder(option.next, seen));
};

/** True when at least one leaf under this option can run on the current data. */
export const optionIsPrepared = (
  optionNext: string,
  params: ProjectParams,
  grid: GridData
): boolean =>
  leavesUnder(optionNext).some(leaf => validateLeafReadiness(leaf, params, grid).canRun);
