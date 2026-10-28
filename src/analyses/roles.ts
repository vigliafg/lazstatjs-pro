import type { ProjectParams } from '../io/project';
import type { ColType, GridData } from '../grid/types';
import { isGroupColumn } from '../grid/types';

export type RoleKind = 'continuous' | 'group' | 'any';

/** One assignable column slot of an analysis. */
export interface AnalysisRole {
  key: string;
  label: string;
  kind: RoleKind;
  get: (params: ProjectParams) => number[];
  set: (params: ProjectParams, column: number) => ProjectParams;
}

/** Role plus the columns currently assigned to it. */
export interface RoleState {
  key: string;
  label: string;
  kind: RoleKind;
  columns: number[];
}

const append = (values: readonly number[], column: number): number[] =>
  Array.from(new Set([...values, column]));

/**
 * Every column role of every procedure, in the order the setup panel shows
 * them. The first role is the primary one used by "Use in analysis" when the
 * user does not pick a specific role.
 *
 * Analyses without column roles (chi-square, contingency, sample size) return
 * an empty list.
 */
const ROLES: Record<string, AnalysisRole[]> = {
  descriptive: [
    {
      key: 'vars',
      label: 'Descriptive: variables',
      kind: 'continuous',
      get: p => p.descVars,
      set: (p, c) => ({ ...p, descVars: append(p.descVars, c) }),
    },
  ],
  ttest: [
    {
      key: 'var1',
      label: 'T-Test: first variable',
      kind: 'continuous',
      get: p => [p.ttest.var1],
      set: (p, c) => ({ ...p, ttest: { ...p.ttest, var1: c } }),
    },
    {
      key: 'var2',
      label: 'T-Test: second variable',
      kind: 'continuous',
      get: p => [p.ttest.var2],
      set: (p, c) => ({ ...p, ttest: { ...p.ttest, var2: c } }),
    },
  ],
  anova: [
    {
      key: 'dep',
      label: 'ANOVA: dependent variable',
      kind: 'continuous',
      get: p => [p.anova.dep],
      set: (p, c) => ({ ...p, anova: { ...p.anova, dep: c } }),
    },
    {
      key: 'grp',
      label: 'ANOVA: group variable',
      kind: 'group',
      get: p => [p.anova.grp],
      set: (p, c) => ({ ...p, anova: { ...p.anova, grp: c } }),
    },
  ],
  regression: [
    {
      key: 'dep',
      label: 'Regression: dependent variable',
      kind: 'continuous',
      get: p => [p.reg.dep],
      set: (p, c) => ({ ...p, reg: { ...p.reg, dep: c } }),
    },
    {
      key: 'indeps',
      label: 'Regression: predictors',
      kind: 'continuous',
      get: p => p.reg.indeps,
      set: (p, c) => ({ ...p, reg: { ...p.reg, indeps: append(p.reg.indeps, c) } }),
    },
  ],
  correlation: [
    {
      key: 'vars',
      label: 'Correlation: variables',
      kind: 'continuous',
      get: p => p.corr.vars,
      set: (p, c) => ({ ...p, corr: { ...p.corr, vars: append(p.corr.vars, c) } }),
    },
  ],
  distfit: [
    {
      key: 'variable',
      label: 'Distribution Fit: variable',
      kind: 'continuous',
      get: p => [p.distfit.variable],
      set: (p, c) => ({ ...p, distfit: { ...p.distfit, variable: c } }),
    },
  ],
  logistic: [
    {
      key: 'outcome',
      label: 'Logistic: outcome',
      kind: 'any',
      get: p => [p.logistic.outcome],
      set: (p, c) => ({ ...p, logistic: { ...p.logistic, outcome: c } }),
    },
    {
      key: 'predictors',
      label: 'Logistic: predictors',
      kind: 'continuous',
      get: p => p.logistic.predictors,
      set: (p, c) => ({
        ...p,
        logistic: { ...p.logistic, predictors: append(p.logistic.predictors, c) },
      }),
    },
  ],
  cox: [
    {
      key: 'time',
      label: 'Cox: time',
      kind: 'any',
      get: p => [p.cox.timeVariable],
      set: (p, c) => ({ ...p, cox: { ...p.cox, timeVariable: c } }),
    },
    {
      key: 'event',
      label: 'Cox: event',
      kind: 'any',
      get: p => [p.cox.eventVariable],
      set: (p, c) => ({ ...p, cox: { ...p.cox, eventVariable: c } }),
    },
    {
      key: 'covariates',
      label: 'Cox: covariates',
      kind: 'continuous',
      get: p => p.cox.covariates,
      set: (p, c) => ({ ...p, cox: { ...p.cox, covariates: append(p.cox.covariates, c) } }),
    },
  ],
  survival: [
    {
      key: 'time',
      label: 'Survival: time',
      kind: 'any',
      get: p => [p.survival.timeVariable],
      set: (p, c) => ({ ...p, survival: { ...p.survival, timeVariable: c } }),
    },
    {
      key: 'event',
      label: 'Survival: event',
      kind: 'any',
      get: p => [p.survival.eventVariable],
      set: (p, c) => ({ ...p, survival: { ...p.survival, eventVariable: c } }),
    },
    {
      key: 'group',
      label: 'Survival: group',
      kind: 'group',
      get: p => [p.survival.groupVariable],
      set: (p, c) => ({ ...p, survival: { ...p.survival, groupVariable: c } }),
    },
  ],
  timeseries: [
    {
      key: 'variable',
      label: 'Time Series: series',
      kind: 'continuous',
      get: p => [p.timeseries.variable],
      set: (p, c) => ({ ...p, timeseries: { ...p.timeseries, variable: c } }),
    },
  ],
  ancova: [
    {
      key: 'response',
      label: 'ANCOVA: response',
      kind: 'continuous',
      get: p => [p.ancova.response],
      set: (p, c) => ({ ...p, ancova: { ...p.ancova, response: c } }),
    },
    {
      key: 'factor',
      label: 'ANCOVA: factor',
      kind: 'group',
      get: p => [p.ancova.factor],
      set: (p, c) => ({ ...p, ancova: { ...p.ancova, factor: c } }),
    },
    {
      key: 'covariates',
      label: 'ANCOVA: covariates',
      kind: 'continuous',
      get: p => p.ancova.covariates,
      set: (p, c) => ({
        ...p,
        ancova: { ...p.ancova, covariates: append(p.ancova.covariates, c) },
      }),
    },
  ],
  factorial: [
    {
      key: 'response',
      label: 'Factorial ANOVA: response',
      kind: 'continuous',
      get: p => [p.factorial.response],
      set: (p, c) => ({ ...p, factorial: { ...p.factorial, response: c } }),
    },
    {
      key: 'factorA',
      label: 'Factorial ANOVA: factor A',
      kind: 'group',
      get: p => [p.factorial.factorA],
      set: (p, c) => ({ ...p, factorial: { ...p.factorial, factorA: c } }),
    },
    {
      key: 'factorB',
      label: 'Factorial ANOVA: factor B',
      kind: 'group',
      get: p => [p.factorial.factorB],
      set: (p, c) => ({ ...p, factorial: { ...p.factorial, factorB: c } }),
    },
  ],
  repeatedanova: [
    {
      key: 'conditions',
      label: 'Repeated ANOVA: conditions',
      kind: 'continuous',
      get: p => p.repeatedanova.selected,
      set: (p, c) => ({
        ...p,
        repeatedanova: { ...p.repeatedanova, selected: append(p.repeatedanova.selected, c) },
      }),
    },
  ],
  multivariate: [
    {
      key: 'selected',
      label: 'Multivariate: variables',
      kind: 'continuous',
      get: p => p.multivariate.selected,
      set: (p, c) => ({
        ...p,
        multivariate: { ...p.multivariate, selected: append(p.multivariate.selected, c) },
      }),
    },
  ],
  nonparamrm: [
    {
      key: 'selected',
      label: 'Non-parametric RM: variables',
      kind: 'continuous',
      get: p => p.nonparamrm.selected,
      set: (p, c) => ({
        ...p,
        nonparamrm: { ...p.nonparamrm, selected: append(p.nonparamrm.selected, c) },
      }),
    },
    {
      key: 'left',
      label: 'Non-parametric RM: left',
      kind: 'continuous',
      get: p => [p.nonparamrm.left],
      set: (p, c) => ({ ...p, nonparamrm: { ...p.nonparamrm, left: c } }),
    },
    {
      key: 'right',
      label: 'Non-parametric RM: right',
      kind: 'continuous',
      get: p => [p.nonparamrm.right],
      set: (p, c) => ({ ...p, nonparamrm: { ...p.nonparamrm, right: c } }),
    },
    {
      key: 'outcome',
      label: 'Non-parametric RM: outcome',
      kind: 'continuous',
      get: p => [p.nonparamrm.outcome],
      set: (p, c) => ({ ...p, nonparamrm: { ...p.nonparamrm, outcome: c } }),
    },
    {
      key: 'group',
      label: 'Non-parametric RM: group',
      kind: 'group',
      get: p => [p.nonparamrm.group],
      set: (p, c) => ({ ...p, nonparamrm: { ...p.nonparamrm, group: c } }),
    },
  ],
  tdcox: [
    {
      key: 'start',
      label: 'Time-Dependent Cox: start',
      kind: 'any',
      get: p => [p.tdcox.start],
      set: (p, c) => ({ ...p, tdcox: { ...p.tdcox, start: c } }),
    },
    {
      key: 'stop',
      label: 'Time-Dependent Cox: stop',
      kind: 'any',
      get: p => [p.tdcox.stop],
      set: (p, c) => ({ ...p, tdcox: { ...p.tdcox, stop: c } }),
    },
    {
      key: 'event',
      label: 'Time-Dependent Cox: event',
      kind: 'any',
      get: p => [p.tdcox.event],
      set: (p, c) => ({ ...p, tdcox: { ...p.tdcox, event: c } }),
    },
    {
      key: 'covariates',
      label: 'Time-Dependent Cox: covariates',
      kind: 'continuous',
      get: p => p.tdcox.covariates,
      set: (p, c) => ({
        ...p,
        tdcox: { ...p.tdcox, covariates: append(p.tdcox.covariates, c) },
      }),
    },
  ],
  stratcox: [
    {
      key: 'time',
      label: 'Stratified Cox: time',
      kind: 'any',
      get: p => [p.stratcox.time],
      set: (p, c) => ({ ...p, stratcox: { ...p.stratcox, time: c } }),
    },
    {
      key: 'event',
      label: 'Stratified Cox: event',
      kind: 'any',
      get: p => [p.stratcox.event],
      set: (p, c) => ({ ...p, stratcox: { ...p.stratcox, event: c } }),
    },
    {
      key: 'covariates',
      label: 'Stratified Cox: covariates',
      kind: 'continuous',
      get: p => p.stratcox.covariates,
      set: (p, c) => ({
        ...p,
        stratcox: { ...p.stratcox, covariates: append(p.stratcox.covariates, c) },
      }),
    },
    {
      key: 'stratum',
      label: 'Stratified Cox: stratum',
      kind: 'group',
      get: p => [p.stratcox.stratum],
      set: (p, c) => ({ ...p, stratcox: { ...p.stratcox, stratum: c } }),
    },
  ],
  gee: [
    {
      key: 'dep',
      label: 'GEE: outcome',
      kind: 'continuous',
      get: p => [p.gee.dep],
      set: (p, c) => ({ ...p, gee: { ...p.gee, dep: c } }),
    },
    {
      key: 'indeps',
      label: 'GEE: predictors',
      kind: 'continuous',
      get: p => p.gee.indeps,
      set: (p, c) => ({ ...p, gee: { ...p.gee, indeps: append(p.gee.indeps, c) } }),
    },
    {
      key: 'cluster',
      label: 'GEE: cluster',
      kind: 'group',
      get: p => [p.gee.cluster],
      set: (p, c) => ({ ...p, gee: { ...p.gee, cluster: c } }),
    },
  ],
  resampling: [
    {
      key: 'outcome',
      label: 'Resampling: outcome',
      kind: 'continuous',
      get: p => [p.resampling.outcome],
      set: (p, c) => ({ ...p, resampling: { ...p.resampling, outcome: c } }),
    },
    {
      key: 'group',
      label: 'Resampling: group',
      kind: 'group',
      get: p => [p.resampling.group],
      set: (p, c) => ({ ...p, resampling: { ...p.resampling, group: c } }),
    },
  ],
  parametric: [
    {
      key: 'time',
      label: 'Parametric Survival: time',
      kind: 'any',
      get: p => [p.parametric.time],
      set: (p, c) => ({ ...p, parametric: { ...p.parametric, time: c } }),
    },
    {
      key: 'event',
      label: 'Parametric Survival: event',
      kind: 'any',
      get: p => [p.parametric.event],
      set: (p, c) => ({ ...p, parametric: { ...p.parametric, event: c } }),
    },
    {
      key: 'predictors',
      label: 'Parametric Survival: predictors',
      kind: 'continuous',
      get: p => p.parametric.predictors,
      set: (p, c) => ({
        ...p,
        parametric: { ...p.parametric, predictors: append(p.parametric.predictors, c) },
      }),
    },
  ],
  mixedanova: [
    {
      key: 'group',
      label: 'Mixed ANOVA: group',
      kind: 'group',
      get: p => [p.mixedanova.group],
      set: (p, c) => ({ ...p, mixedanova: { ...p.mixedanova, group: c } }),
    },
    {
      key: 'conditions',
      label: 'Mixed ANOVA: conditions',
      kind: 'continuous',
      get: p => p.mixedanova.conditions,
      set: (p, c) => ({
        ...p,
        mixedanova: { ...p.mixedanova, conditions: append(p.mixedanova.conditions, c) },
      }),
    },
  ],
  mi: [
    {
      key: 'variables',
      label: 'Missing Data: variables',
      kind: 'continuous',
      get: p => p.mi.variables,
      set: (p, c) => ({ ...p, mi: { ...p.mi, variables: append(p.mi.variables, c) } }),
    },
    {
      key: 'outcome',
      label: 'Missing Data: outcome',
      kind: 'continuous',
      get: p => [p.mi.outcome],
      set: (p, c) => ({ ...p, mi: { ...p.mi, outcome: c } }),
    },
    {
      key: 'predictors',
      label: 'Missing Data: predictors',
      kind: 'continuous',
      get: p => p.mi.predictors,
      set: (p, c) => ({ ...p, mi: { ...p.mi, predictors: append(p.mi.predictors, c) } }),
    },
  ],
  ordinal: [
    {
      key: 'dep',
      label: 'Ordinal Logistic: outcome',
      kind: 'any',
      get: p => [p.ordinal.dep],
      set: (p, c) => ({ ...p, ordinal: { ...p.ordinal, dep: c } }),
    },
    {
      key: 'indeps',
      label: 'Ordinal Logistic: predictors',
      kind: 'continuous',
      get: p => p.ordinal.indeps,
      set: (p, c) => ({ ...p, ordinal: { ...p.ordinal, indeps: append(p.ordinal.indeps, c) } }),
    },
  ],
  lmm: [
    {
      key: 'dep',
      label: 'Mixed Model: outcome',
      kind: 'continuous',
      get: p => [p.lmm.dep],
      set: (p, c) => ({ ...p, lmm: { ...p.lmm, dep: c } }),
    },
    {
      key: 'indeps',
      label: 'Mixed Model: predictors',
      kind: 'continuous',
      get: p => p.lmm.indeps,
      set: (p, c) => ({ ...p, lmm: { ...p.lmm, indeps: append(p.lmm.indeps, c) } }),
    },
    {
      key: 'group',
      label: 'Mixed Model: group',
      kind: 'group',
      get: p => [p.lmm.group],
      set: (p, c) => ({ ...p, lmm: { ...p.lmm, group: c } }),
    },
  ],
  countreg: [
    {
      key: 'dep',
      label: 'Count Regression: outcome',
      kind: 'continuous',
      get: p => [p.countreg.dep],
      set: (p, c) => ({ ...p, countreg: { ...p.countreg, dep: c } }),
    },
    {
      key: 'indeps',
      label: 'Count Regression: predictors',
      kind: 'continuous',
      get: p => p.countreg.indeps,
      set: (p, c) => ({
        ...p,
        countreg: { ...p.countreg, indeps: append(p.countreg.indeps, c) },
      }),
    },
  ],
  agreement: [
    {
      key: 'columns',
      label: 'Agreement: measurements',
      kind: 'continuous',
      get: p => p.agreement.columns,
      set: (p, c) => ({
        ...p,
        agreement: { ...p.agreement, columns: append(p.agreement.columns, c) },
      }),
    },
  ],
  tost: [
    {
      key: 'var1',
      label: 'TOST: first variable',
      kind: 'continuous',
      get: p => [p.tost.var1],
      set: (p, c) => ({ ...p, tost: { ...p.tost, var1: c } }),
    },
    {
      key: 'var2',
      label: 'TOST: second variable',
      kind: 'continuous',
      get: p => [p.tost.var2],
      set: (p, c) => ({ ...p, tost: { ...p.tost, var2: c } }),
    },
  ],
  wizard: [
    {
      key: 'outcome',
      label: 'Wizard: outcome',
      kind: 'any',
      get: p => [p.wizard.outcome],
      set: (p, c) => ({ ...p, wizard: { ...p.wizard, outcome: c } }),
    },
    {
      key: 'group',
      label: 'Wizard: group',
      kind: 'group',
      get: p => [p.wizard.group],
      set: (p, c) => ({ ...p, wizard: { ...p.wizard, group: c } }),
    },
    {
      key: 'second',
      label: 'Wizard: second variable',
      kind: 'any',
      get: p => [p.wizard.second],
      set: (p, c) => ({ ...p, wizard: { ...p.wizard, second: c } }),
    },
  ],
};

/** Assignable column roles for an analysis, primary role first. */
export const analysisRoles = (analysisId: string): AnalysisRole[] =>
  ROLES[analysisId] ?? [];

/** Roles with the columns currently assigned to each one. */
export const roleStates = (analysisId: string, params: ProjectParams): RoleState[] =>
  analysisRoles(analysisId).map(role => ({
    key: role.key,
    label: role.label,
    kind: role.kind,
    columns: role.get(params),
  }));

/** Assign a column to one role. Returns `null` for unknown analyses/roles. */
export const assignRole = (
  analysisId: string,
  params: ProjectParams,
  roleKey: string,
  column: number
): ProjectParams | null => {
  const role = analysisRoles(analysisId).find(item => item.key === roleKey);
  return role ? role.set(params, column) : null;
};

const NON_NUMERIC: ColType[] = ['cat', 'str', 'alp', 'chr', 'dat', 'dtm', 'tim', 'id'];

/**
 * Type/role compatibility for the active analysis.
 *
 * A role only makes sense while its column still has a compatible type: a
 * continuous role cannot read a declared categorical column, and a grouping
 * role cannot read a high-cardinality numeric column. Mismatches block the run
 * and ask for reselection instead of silently computing on a different kind of
 * variable.
 */
export const validateRoleTypes = (
  analysisId: string,
  params: ProjectParams,
  grid: GridData
): string[] => {
  const errors: string[] = [];
  for (const role of analysisRoles(analysisId)) {
    for (const index of role.get(params)) {
      if (index < 0 || index >= grid.cols.length) continue;
      const col = grid.cols[index];
      if (role.kind === 'continuous' && NON_NUMERIC.includes(col.type)) {
        errors.push(`${role.label} (${col.name}: ${col.type} is not numeric)`);
      } else if (role.kind === 'group' && !isGroupColumn(grid, index)) {
        errors.push(`${role.label} (${col.name}: not a grouping variable)`);
      }
    }
  }
  return Array.from(new Set(errors));
};
