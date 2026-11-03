import type { ProjectParams } from '../io/project';
import type { GridData } from '../grid/types';
import { analysisLabel } from './registry';
import { t, type MessageKey } from '../i18n';
import { isContinuousColumn, isGroupColumn } from '../grid/types';
import { L4_ROLES } from './rolesL4';
import { W5_ROLES } from './rolesW5';

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
const ROLE_SUFFIX_KEYS: Record<string, MessageKey> = {
  variables: 'form.variables',
  variable: 'form.variable1',
  category: 'form.paretoCategory',
  'first variable': 'form.variable1',
  'second variable': 'form.variable2',
  'dependent variable': 'form.dependentVar',
  'group variable': 'form.groupVar',
  predictors: 'form.predictorsX',
  outcome: 'form.outcome',
  time: 'form.time',
  event: 'form.event',
  covariates: 'form.covariatesX',
  group: 'form.group',
  series: 'form.series',
  response: 'form.responseY',
  factor: 'form.factor',
  'factor a': 'form.factorA',
  'factor b': 'form.factorB',
  conditions: 'form.withinConditions',
  left: 'form.firstMeasure',
  right: 'form.secondMeasure',
  start: 'form.start',
  stop: 'form.stop',
  stratum: 'form.stratum',
  cluster: 'form.cluster',
  measurements: 'form.measurements',
  endogenous: 'form.endogenous',
  'endogenous predictors': 'form.endogenous',
  instruments: 'form.instruments',
  exogenous: 'form.exogenous',
  'exogenous predictors': 'form.exogenous',
  entity: 'form.entity',
  selection: 'form.selection',
  'selection indicator': 'form.selection',
  'selection predictors': 'form.selectionPredictors',
  predictor: 'form.predictor',
  mediator: 'form.mediator',
  treatment: 'form.treatment',
  indicators: 'form.variables',
  items: 'form.variables',
  attributes: 'form.factor',
  rating: 'form.responseY',
  'x variables': 'form.variables2',
  'y variables': 'form.variables3',
};

/** Localised role label: "ANOVA: dependent variable" becomes the active UI language. */
const roleLabel = (analysisId: string, label: string): string => {
  const separator = label.indexOf(': ');
  const suffix = separator >= 0 ? label.slice(separator + 2) : label;
  const key = ROLE_SUFFIX_KEYS[suffix.toLowerCase()];
  return `${analysisLabel(analysisId)}: ${key ? t(key) : suffix}`;
};

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
  variances: [
    {
      key: 'variable',
      label: 'Variances: variable',
      kind: 'continuous',
      get: p => [p.variances.variable],
      set: (p, c) => ({ ...p, variances: { ...p.variances, variable: c } }),
    },
    {
      key: 'group',
      label: 'Variances: group',
      kind: 'group',
      get: p => (p.variances.group < 0 ? [] : [p.variances.group]),
      set: (p, c) => ({ ...p, variances: { ...p.variances, group: c } }),
    },
  ],
  proportions: [
    {
      key: 'variable',
      label: 'Proportions: variable',
      kind: 'any',
      get: p => [p.proportions.variable],
      set: (p, c) => ({ ...p, proportions: { ...p.proportions, variable: c } }),
    },
    {
      key: 'group',
      label: 'Proportions: group',
      kind: 'any',
      get: p => (p.proportions.group < 0 ? [] : [p.proportions.group]),
      set: (p, c) => ({ ...p, proportions: { ...p.proportions, group: c } }),
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
  glm: [
    {
      key: 'dep',
      label: 'GLM: dependent variable',
      kind: 'continuous',
      get: p => [p.glm.dep],
      set: (p, c) => ({ ...p, glm: { ...p.glm, dep: c } }),
    },
    {
      key: 'indeps',
      label: 'GLM: predictors',
      kind: 'continuous',
      get: p => p.glm.indeps,
      set: (p, c) => ({ ...p, glm: { ...p.glm, indeps: append(p.glm.indeps, c) } }),
    },
  ],
  quantile: [
    {
      key: 'dep',
      label: 'Quantile: dependent variable',
      kind: 'continuous',
      get: p => [p.quantile.dep],
      set: (p, c) => ({ ...p, quantile: { ...p.quantile, dep: c } }),
    },
    {
      key: 'indeps',
      label: 'Quantile: predictors',
      kind: 'continuous',
      get: p => p.quantile.indeps,
      set: (p, c) => ({ ...p, quantile: { ...p.quantile, indeps: append(p.quantile.indeps, c) } }),
    },
  ],
  nonlinear: [
    {
      key: 'dep',
      label: 'Nonlinear: dependent variable',
      kind: 'continuous',
      get: p => [p.nonlinear.dep],
      set: (p, c) => ({ ...p, nonlinear: { ...p.nonlinear, dep: c } }),
    },
    {
      key: 'predictor',
      label: 'Nonlinear: predictor',
      kind: 'continuous',
      get: p => [p.nonlinear.predictor],
      set: (p, c) => ({ ...p, nonlinear: { ...p.nonlinear, predictor: c } }),
    },
  ],
  multinomial: [
    {
      key: 'outcome',
      label: 'Multinomial: outcome',
      kind: 'any',
      get: p => [p.multinomial.outcome],
      set: (p, c) => ({ ...p, multinomial: { ...p.multinomial, outcome: c } }),
    },
    {
      key: 'predictors',
      label: 'Multinomial: predictors',
      kind: 'continuous',
      get: p => p.multinomial.predictors,
      set: (p, c) => ({
        ...p,
        multinomial: { ...p.multinomial, predictors: append(p.multinomial.predictors, c) },
      }),
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
      key: 'stratum',
      label: 'Stratified Cox: stratum',
      kind: 'group',
      get: p => [p.stratcox.stratum],
      set: (p, c) => ({ ...p, stratcox: { ...p.stratcox, stratum: c } }),
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
  glmm: [
    {
      key: 'dep',
      label: 'GLMM: outcome',
      kind: 'continuous',
      get: p => [p.glmm.dep],
      set: (p, c) => ({ ...p, glmm: { ...p.glmm, dep: c } }),
    },
    {
      key: 'indeps',
      label: 'GLMM: predictors',
      kind: 'continuous',
      get: p => p.glmm.indeps,
      set: (p, c) => ({ ...p, glmm: { ...p.glmm, indeps: append(p.glmm.indeps, c) } }),
    },
    {
      key: 'group',
      label: 'GLMM: group',
      kind: 'group',
      get: p => [p.glmm.group],
      set: (p, c) => ({ ...p, glmm: { ...p.glmm, group: c } }),
    },
    {
      key: 'slope',
      label: 'GLMM: random slope',
      kind: 'continuous',
      get: p => (p.glmm.slope >= 0 ? [p.glmm.slope] : []),
      set: (p, c) => ({ ...p, glmm: { ...p.glmm, slope: c } }),
    },
  ],
  pls: [
    {
      key: 'dep',
      label: 'PLS: dependent variable',
      kind: 'continuous',
      get: p => [p.pls.dep],
      set: (p, c) => ({ ...p, pls: { ...p.pls, dep: c } }),
    },
    {
      key: 'indeps',
      label: 'PLS: predictors',
      kind: 'continuous',
      get: p => p.pls.indeps,
      set: (p, c) => ({ ...p, pls: { ...p.pls, indeps: append(p.pls.indeps, c) } }),
    },
  ],
  mars: [
    {
      key: 'dep',
      label: 'MARS: dependent variable',
      kind: 'continuous',
      get: p => [p.mars.dep],
      set: (p, c) => ({ ...p, mars: { ...p.mars, dep: c } }),
    },
    {
      key: 'indeps',
      label: 'MARS: predictors',
      kind: 'continuous',
      get: p => p.mars.indeps,
      set: (p, c) => ({ ...p, mars: { ...p.mars, indeps: append(p.mars.indeps, c) } }),
    },
  ],
  iv: [
    {
      key: 'dep',
      label: 'IV: outcome',
      kind: 'continuous',
      get: p => [p.iv.dep],
      set: (p, c) => ({ ...p, iv: { ...p.iv, dep: c } }),
    },
    {
      key: 'endog',
      label: 'IV: endogenous predictors',
      kind: 'continuous',
      get: p => p.iv.endog,
      set: (p, c) => ({ ...p, iv: { ...p.iv, endog: append(p.iv.endog, c) } }),
    },
    {
      key: 'instruments',
      label: 'IV: instruments',
      kind: 'continuous',
      get: p => p.iv.instruments,
      set: (p, c) => ({
        ...p,
        iv: { ...p.iv, instruments: append(p.iv.instruments, c) },
      }),
    },
    {
      key: 'exog',
      label: 'IV: exogenous predictors',
      kind: 'continuous',
      get: p => p.iv.exog,
      set: (p, c) => ({ ...p, iv: { ...p.iv, exog: append(p.iv.exog, c) } }),
    },
  ],
  panel: [
    {
      key: 'dep',
      label: 'Panel: outcome',
      kind: 'continuous',
      get: p => [p.panel.dep],
      set: (p, c) => ({ ...p, panel: { ...p.panel, dep: c } }),
    },
    {
      key: 'indeps',
      label: 'Panel: predictors',
      kind: 'continuous',
      get: p => p.panel.indeps,
      set: (p, c) => ({ ...p, panel: { ...p.panel, indeps: append(p.panel.indeps, c) } }),
    },
    {
      key: 'entity',
      label: 'Panel: entity',
      kind: 'any',
      get: p => [p.panel.entity],
      set: (p, c) => ({ ...p, panel: { ...p.panel, entity: c } }),
    },
    {
      key: 'time',
      label: 'Panel: time',
      kind: 'any',
      get: p => [p.panel.time],
      set: (p, c) => ({ ...p, panel: { ...p.panel, time: c } }),
    },
  ],
  selection: [
    {
      key: 'dep',
      label: 'Selection: outcome',
      kind: 'continuous',
      get: p => [p.selection.dep],
      set: (p, c) => ({ ...p, selection: { ...p.selection, dep: c } }),
    },
    {
      key: 'indeps',
      label: 'Selection: predictors',
      kind: 'continuous',
      get: p => p.selection.indeps,
      set: (p, c) => ({
        ...p,
        selection: { ...p.selection, indeps: append(p.selection.indeps, c) },
      }),
    },
    {
      key: 'selection',
      label: 'Selection: selection indicator',
      kind: 'any',
      get: p => (p.selection.selection >= 0 ? [p.selection.selection] : []),
      set: (p, c) => ({ ...p, selection: { ...p.selection, selection: c } }),
    },
    {
      key: 'selectIndeps',
      label: 'Selection: selection predictors',
      kind: 'continuous',
      get: p => p.selection.selectIndeps,
      set: (p, c) => ({
        ...p,
        selection: { ...p.selection, selectIndeps: append(p.selection.selectIndeps, c) },
      }),
    },
  ],
  mediation: [
    {
      key: 'outcome',
      label: 'Mediation: outcome',
      kind: 'continuous',
      get: p => [p.mediation.outcome],
      set: (p, c) => ({ ...p, mediation: { ...p.mediation, outcome: c } }),
    },
    {
      key: 'predictor',
      label: 'Mediation: predictor',
      kind: 'continuous',
      get: p => [p.mediation.predictor],
      set: (p, c) => ({ ...p, mediation: { ...p.mediation, predictor: c } }),
    },
    {
      key: 'mediator',
      label: 'Mediation: mediator',
      kind: 'continuous',
      get: p => [p.mediation.mediator],
      set: (p, c) => ({ ...p, mediation: { ...p.mediation, mediator: c } }),
    },
    {
      key: 'covariates',
      label: 'Mediation: covariates',
      kind: 'continuous',
      get: p => p.mediation.covariates,
      set: (p, c) => ({
        ...p,
        mediation: { ...p.mediation, covariates: append(p.mediation.covariates, c) },
      }),
    },
  ],
  propensity: [
    {
      key: 'treatment',
      label: 'Propensity: treatment',
      kind: 'any',
      get: p => [p.propensity.treatment],
      set: (p, c) => ({ ...p, propensity: { ...p.propensity, treatment: c } }),
    },
    {
      key: 'outcome',
      label: 'Propensity: outcome',
      kind: 'continuous',
      get: p => [p.propensity.outcome],
      set: (p, c) => ({ ...p, propensity: { ...p.propensity, outcome: c } }),
    },
    {
      key: 'covariates',
      label: 'Propensity: covariates',
      kind: 'continuous',
      get: p => p.propensity.covariates,
      set: (p, c) => ({
        ...p,
        propensity: { ...p.propensity, covariates: append(p.propensity.covariates, c) },
      }),
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
  ...L4_ROLES,
  ...W5_ROLES,
};

/** Assignable column roles for an analysis, primary role first. */
export const analysisRoles = (analysisId: string): AnalysisRole[] =>
  ROLES[analysisId] ?? [];

/** Roles with the columns currently assigned to each one. */
export const roleStates = (analysisId: string, params: ProjectParams): RoleState[] =>
  analysisRoles(analysisId).map(role => ({
    key: role.key,
    label: roleLabel(analysisId, role.label),
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
    // Categorical MI treats the selected variables as category codes, so their
    // columns need not be numeric; the covariates keep the continuous rule.
    if (analysisId === 'mi' && params.mi.model === 'categorical' && role.key !== 'predictors') continue;
    for (const index of role.get(params)) {
      if (index < 0 || index >= grid.cols.length) continue;
      const col = grid.cols[index];
      if (role.kind === 'continuous' && !isContinuousColumn(col)) {
        errors.push(`${roleLabel(analysisId, role.label)} (${col.name}: ${col.type} is not numeric)`);
      } else if (role.kind === 'group' && !isGroupColumn(grid, index)) {
        errors.push(`${roleLabel(analysisId, role.label)} (${col.name}: not a grouping variable)`);
      }
    }
  }
  return Array.from(new Set(errors));
};
