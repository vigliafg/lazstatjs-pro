import { analysisRoles, assignRole, roleStates, validateRoleTypes } from '../../analyses/roles';
import { isContinuousColumn, isGroupColumn, type GridData } from '../../grid/types';
import type { ProjectParams } from '../../io/project';
import type { AssistantLeaf, AssistantRoleHint, AssistantRoleSource } from './tree';

/** One leaf role after the bridge has looked at the current data. */
export interface AssistantAssignment {
  roleKey: string;
  label: string;
  column: number | null;
}

export interface AssistantApplyResult {
  params: ProjectParams;
  assignments: AssistantAssignment[];
  missing: AssistantAssignment[];
  /** Type/role mismatches reported by the procedure itself. */
  problems: string[];
}

const columnIndexes = (grid: GridData): number[] =>
  grid.cols.map((_, index) => index).filter(index => grid.cols[index].type !== 'id');

const pickColumn = (
  from: AssistantRoleSource,
  kind: string,
  grid: GridData,
  used: ReadonlySet<number>
): number | null => {
  const all = columnIndexes(grid);
  const continuous = all.filter(index => isContinuousColumn(grid.cols[index]));
  const groups = all.filter(index => isGroupColumn(grid, index));
  if (kind === 'group') return groups.find(index => !used.has(index)) ?? null;
  if (kind === 'continuous') return continuous.find(index => !used.has(index)) ?? null;
  if (from === 'group') return groups.find(index => !used.has(index)) ?? null;
  // `second` and `outcome` share the compatible column search: the second role
  // of a leaf must not receive the column already taken by the first one.
  if (from === 'second' || from === 'outcome') {
    return continuous.find(index => !used.has(index)) ?? all.find(index => !used.has(index)) ?? null;
  }
  return all.find(index => !used.has(index)) ?? null;
};

/**
 * Turns a leaf into parameters for its procedure.
 *
 * The current parameters of the target analysis are the starting point, so the
 * Assistant only adds the columns it knows about and never resets the options
 * the user already chose. Roles without a compatible column stay empty and are
 * reported to the panel.
 */
export const applyAssistantLeaf = (
  leaf: AssistantLeaf,
  base: ProjectParams,
  grid: GridData
): AssistantApplyResult => {
  let params = base;
  if (leaf.preset?.ttest) {
    params = { ...params, ttest: { ...params.ttest, type: leaf.preset.ttest } };
  }
  if (leaf.preset?.anova) {
    params = { ...params, anova: { ...params.anova, mode: leaf.preset.anova } };
  }

  const roles = analysisRoles(leaf.analysisId);
  const used = new Set<number>();
  for (const hint of leaf.contract.roles) {
    const role = roles.find(item => item.key === hint.roleKey);
    const pickKind =
      hint.kind === 'group' || hint.kind === 'continuous' ? hint.kind : role?.kind ?? 'any';
    for (let index = 0; index < (hint.min ?? 1); index += 1) {
      const column = pickColumn(hint.from, pickKind, grid, used);
      if (column === null) break;
      const next = assignRole(leaf.analysisId, params, hint.roleKey, column);
      if (!next) break;
      params = next;
      used.add(column);
    }
  }

  const states = roleStates(leaf.analysisId, params);
  const assignments: AssistantAssignment[] = leaf.contract.roles.map((hint: AssistantRoleHint) => {
    const state = states.find(item => item.key === hint.roleKey);
    const first = state?.columns[0];
    return {
      roleKey: hint.roleKey,
      label: state?.label ?? hint.roleKey,
      column: typeof first === 'number' && first >= 0 ? first : null,
    };
  });
  const optional = new Set(
    leaf.contract.roles.filter(hint => hint.optional).map(hint => hint.roleKey)
  );

  return {
    params,
    assignments,
    missing: assignments.filter(item => item.column === null && !optional.has(item.roleKey)),
    problems: validateRoleTypes(leaf.analysisId, params, grid),
  };
};
