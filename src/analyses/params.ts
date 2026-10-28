import {
  DEFAULT_PARAMS,
  parseParams,
  type ProjectParams,
} from '../io/project';
import {
  mapColumnIndex,
  mapColumnIndexes,
  type ColumnOperation,
} from '../grid/columnOps';
import type { Column } from '../grid/types';

export interface RemapParamsResult {
  params: ProjectParams;
  /** Human-readable roles that no longer point to a column. */
  invalidated: string[];
}

const unique = <T,>(values: T[]): T[] => Array.from(new Set(values));

/**
 * Rewrite every column reference after a structural column edit.
 *
 * Shifts are remapped silently. Roles whose column disappears or changes
 * meaning become `-1` and are reported, so the UI can ask the user to reselect
 * them instead of silently running on another variable.
 */
export const remapParams = (
  params: ProjectParams,
  op: ColumnOperation
): RemapParamsResult => {
  const invalidated: string[] = [];

  const one = (value: number, label: string): number => {
    const next = mapColumnIndex(value, op);
    if (value >= 0 && next < 0) invalidated.push(label);
    return next;
  };

  const optional = (value: number): number =>
    value < 0 ? -1 : mapColumnIndex(value, op);

  const list = (values: readonly number[], label: string): number[] => {
    const mapped = values.map(value => mapColumnIndex(value, op));
    if (mapped.some(value => value < 0)) invalidated.push(label);
    return unique(mapped.filter(value => value >= 0));
  };

  const descVars = list(params.descVars, 'Descriptive: variables');
  const ttestVar1 = one(params.ttest.var1, 'T-Test: first variable');
  const ttestVar2 = one(params.ttest.var2, 'T-Test: second variable');
  const anovaDep = one(params.anova.dep, 'ANOVA: dependent variable');
  const anovaGrp = one(params.anova.grp, 'ANOVA: group variable');
  const regDep = one(params.reg.dep, 'Regression: dependent variable');
  const regIndeps = list(params.reg.indeps, 'Regression: predictors');
  const corrVars = list(params.corr.vars, 'Correlation: variables');
  const distfitVariable = one(params.distfit.variable, 'Distribution Fit: variable');
  const logisticOutcome = one(params.logistic.outcome, 'Logistic: outcome');
  const logisticPredictors = list(params.logistic.predictors, 'Logistic: predictors').filter(
    value => value !== logisticOutcome
  );
  const coxTime = one(params.cox.timeVariable, 'Cox: time');
  const coxEvent = one(params.cox.eventVariable, 'Cox: event');
  const coxCovariates = list(params.cox.covariates, 'Cox: covariates').filter(
    value => value !== coxTime && value !== coxEvent
  );
  const survivalTime = one(params.survival.timeVariable, 'Survival: time');
  const survivalEvent = one(params.survival.eventVariable, 'Survival: event');
  const timeseriesVariable = one(params.timeseries.variable, 'Time Series: series');
  const ancovaResponse = one(params.ancova.response, 'ANCOVA: response');
  const ancovaFactor = one(params.ancova.factor, 'ANCOVA: factor');
  const ancovaCovariates = list(params.ancova.covariates, 'ANCOVA: covariates').filter(
    value => value !== ancovaResponse && value !== ancovaFactor
  );
  const factorialResponse = one(params.factorial.response, 'Factorial ANOVA: response');
  const factorialA = one(params.factorial.factorA, 'Factorial ANOVA: factor A');
  const factorialB = one(params.factorial.factorB, 'Factorial ANOVA: factor B');
  const nonparamLeft = one(params.nonparamrm.left, 'Non-parametric RM: left');
  const nonparamRight = one(params.nonparamrm.right, 'Non-parametric RM: right');
  const nonparamOutcome = one(params.nonparamrm.outcome, 'Non-parametric RM: outcome');
  const nonparamGroup = one(params.nonparamrm.group, 'Non-parametric RM: group');
  const tdStart = one(params.tdcox.start, 'Time-Dependent Cox: start');
  const tdStop = one(params.tdcox.stop, 'Time-Dependent Cox: stop');
  const tdEvent = one(params.tdcox.event, 'Time-Dependent Cox: event');
  const tdCovariates = list(params.tdcox.covariates, 'Time-Dependent Cox: covariates');
  const stratTime = one(params.stratcox.time, 'Stratified Cox: time');
  const stratEvent = one(params.stratcox.event, 'Stratified Cox: event');
  const stratCovariates = list(params.stratcox.covariates, 'Stratified Cox: covariates');
  const geeDep = one(params.gee.dep, 'GEE: outcome');
  const geeIndeps = list(params.gee.indeps, 'GEE: predictors');
  const geeCluster = one(params.gee.cluster, 'GEE: cluster');
  const resamplingOutcome = one(params.resampling.outcome, 'Resampling: outcome');
  const resamplingGroup = one(params.resampling.group, 'Resampling: group');
  const parametricTime = one(params.parametric.time, 'Parametric Survival: time');
  const parametricEvent = one(params.parametric.event, 'Parametric Survival: event');
  const parametricPredictors = list(
    params.parametric.predictors,
    'Parametric Survival: predictors'
  );
  const mixedGroup = one(params.mixedanova.group, 'Mixed ANOVA: group');
  const miOutcome = one(params.mi.outcome, 'Missing Data: outcome');
  const miPredictors = list(params.mi.predictors, 'Missing Data: predictors');
  const ordinalDep = one(params.ordinal.dep, 'Ordinal Logistic: outcome');
  const ordinalIndeps = list(params.ordinal.indeps, 'Ordinal Logistic: predictors');
  const lmmDep = one(params.lmm.dep, 'Mixed Model: outcome');
  const lmmIndeps = list(params.lmm.indeps, 'Mixed Model: predictors');
  const lmmGroup = one(params.lmm.group, 'Mixed Model: group');
  const countDep = one(params.countreg.dep, 'Count Regression: outcome');
  const countIndeps = list(params.countreg.indeps, 'Count Regression: predictors');
  const tostVar1 = one(params.tost.var1, 'TOST: first variable');
  const tostVar2 = one(params.tost.var2, 'TOST: second variable');

  return {
    invalidated: unique(invalidated.map(label => label)),
    params: {
      ...params,
      descVars,
      ttest: { ...params.ttest, var1: ttestVar1, var2: ttestVar2 },
      anova: { ...params.anova, dep: anovaDep, grp: anovaGrp },
      reg: { ...params.reg, dep: regDep, indeps: regIndeps },
      corr: { ...params.corr, vars: corrVars },
      distfit: { ...params.distfit, variable: distfitVariable },
      logistic: {
        ...params.logistic,
        outcome: logisticOutcome,
        predictors: logisticPredictors,
      },
      cox: {
        ...params.cox,
        timeVariable: coxTime,
        eventVariable: coxEvent,
        covariates: coxCovariates,
      },
      survival: {
        ...params.survival,
        timeVariable: survivalTime,
        eventVariable: survivalEvent,
        groupVariable: optional(params.survival.groupVariable),
      },
      timeseries: { ...params.timeseries, variable: timeseriesVariable },
      ancova: {
        ...params.ancova,
        response: ancovaResponse,
        factor: ancovaFactor,
        covariates: ancovaCovariates,
      },
      factorial: {
        ...params.factorial,
        response: factorialResponse,
        factorA: factorialA,
        factorB: factorialB,
      },
      repeatedanova: {
        ...params.repeatedanova,
        selected: list(params.repeatedanova.selected, 'Repeated ANOVA: conditions'),
      },
      multivariate: {
        ...params.multivariate,
        selected: list(params.multivariate.selected, 'Multivariate: variables'),
      },
      nonparamrm: {
        ...params.nonparamrm,
        selected: list(params.nonparamrm.selected, 'Non-parametric RM: variables'),
        left: nonparamLeft,
        right: nonparamRight,
        outcome: nonparamOutcome,
        group: nonparamGroup,
      },
      tdcox: {
        ...params.tdcox,
        start: tdStart,
        stop: tdStop,
        event: tdEvent,
        covariates: tdCovariates,
      },
      stratcox: {
        ...params.stratcox,
        time: stratTime,
        event: stratEvent,
        covariates: stratCovariates,
        stratum: optional(params.stratcox.stratum),
      },
      gee: {
        ...params.gee,
        dep: geeDep,
        indeps: geeIndeps,
        cluster: geeCluster,
      },
      resampling: {
        ...params.resampling,
        outcome: resamplingOutcome,
        group: resamplingGroup,
      },
      parametric: {
        ...params.parametric,
        time: parametricTime,
        event: parametricEvent,
        predictors: parametricPredictors,
      },
      mixedanova: {
        ...params.mixedanova,
        group: mixedGroup,
        conditions: list(params.mixedanova.conditions, 'Mixed ANOVA: conditions'),
      },
      mi: {
        ...params.mi,
        variables: list(params.mi.variables, 'Missing Data: variables'),
        outcome: miOutcome,
        predictors: miPredictors,
      },
      ordinal: { ...params.ordinal, dep: ordinalDep, indeps: ordinalIndeps },
      lmm: { ...params.lmm, dep: lmmDep, indeps: lmmIndeps, group: lmmGroup },
      countreg: { ...params.countreg, dep: countDep, indeps: countIndeps },
      agreement: {
        ...params.agreement,
        columns: list(params.agreement.columns, 'Agreement: measurements'),
      },
      tost: { ...params.tost, var1: tostVar1, var2: tostVar2 },
      wizard: {
        ...params.wizard,
        outcome: optional(params.wizard.outcome),
        group: optional(params.wizard.group),
        second: optional(params.wizard.second),
      },
    },
  };
};

const checkOne = (
  value: number,
  label: string,
  width: number,
  errors: string[],
  optional = false
) => {
  if (optional && value < 0) return;
  if (value < 0 || value >= width) errors.push(label);
};

const checkList = (values: readonly number[], label: string, width: number, errors: string[]) => {
  if (values.some(value => value < 0 || value >= width)) errors.push(label);
};

/** Column references that would make a run read outside the grid. */
export const validateColumnRefs = (params: ProjectParams, width: number): string[] => {
  const errors: string[] = [];
  checkList(params.descVars, 'Descriptive: variables', width, errors);
  checkOne(params.ttest.var1, 'T-Test: first variable', width, errors);
  checkOne(params.ttest.var2, 'T-Test: second variable', width, errors);
  checkOne(params.anova.dep, 'ANOVA: dependent variable', width, errors);
  checkOne(params.anova.grp, 'ANOVA: group variable', width, errors);
  checkOne(params.reg.dep, 'Regression: dependent variable', width, errors);
  checkList(params.reg.indeps, 'Regression: predictors', width, errors);
  checkList(params.corr.vars, 'Correlation: variables', width, errors);
  checkOne(params.distfit.variable, 'Distribution Fit: variable', width, errors);
  checkOne(params.logistic.outcome, 'Logistic: outcome', width, errors);
  checkList(params.logistic.predictors, 'Logistic: predictors', width, errors);
  checkOne(params.cox.timeVariable, 'Cox: time', width, errors);
  checkOne(params.cox.eventVariable, 'Cox: event', width, errors);
  checkList(params.cox.covariates, 'Cox: covariates', width, errors);
  checkOne(params.survival.timeVariable, 'Survival: time', width, errors);
  checkOne(params.survival.eventVariable, 'Survival: event', width, errors);
  checkOne(params.survival.groupVariable, 'Survival: group', width, errors, true);
  checkOne(params.timeseries.variable, 'Time Series: series', width, errors);
  checkOne(params.ancova.response, 'ANCOVA: response', width, errors);
  checkOne(params.ancova.factor, 'ANCOVA: factor', width, errors);
  checkList(params.ancova.covariates, 'ANCOVA: covariates', width, errors);
  checkOne(params.factorial.response, 'Factorial ANOVA: response', width, errors);
  checkOne(params.factorial.factorA, 'Factorial ANOVA: factor A', width, errors);
  checkOne(params.factorial.factorB, 'Factorial ANOVA: factor B', width, errors);
  checkList(params.repeatedanova.selected, 'Repeated ANOVA: conditions', width, errors);
  checkList(params.multivariate.selected, 'Multivariate: variables', width, errors);
  checkList(params.nonparamrm.selected, 'Non-parametric RM: variables', width, errors);
  checkOne(params.nonparamrm.left, 'Non-parametric RM: left', width, errors);
  checkOne(params.nonparamrm.right, 'Non-parametric RM: right', width, errors);
  checkOne(params.nonparamrm.outcome, 'Non-parametric RM: outcome', width, errors);
  checkOne(params.nonparamrm.group, 'Non-parametric RM: group', width, errors);
  checkOne(params.tdcox.start, 'Time-Dependent Cox: start', width, errors);
  checkOne(params.tdcox.stop, 'Time-Dependent Cox: stop', width, errors);
  checkOne(params.tdcox.event, 'Time-Dependent Cox: event', width, errors);
  checkList(params.tdcox.covariates, 'Time-Dependent Cox: covariates', width, errors);
  checkOne(params.stratcox.time, 'Stratified Cox: time', width, errors);
  checkOne(params.stratcox.event, 'Stratified Cox: event', width, errors);
  checkList(params.stratcox.covariates, 'Stratified Cox: covariates', width, errors);
  checkOne(params.stratcox.stratum, 'Stratified Cox: stratum', width, errors, true);
  checkOne(params.gee.dep, 'GEE: outcome', width, errors);
  checkList(params.gee.indeps, 'GEE: predictors', width, errors);
  checkOne(params.gee.cluster, 'GEE: cluster', width, errors);
  checkOne(params.resampling.outcome, 'Resampling: outcome', width, errors);
  checkOne(params.resampling.group, 'Resampling: group', width, errors);
  checkOne(params.parametric.time, 'Parametric Survival: time', width, errors);
  checkOne(params.parametric.event, 'Parametric Survival: event', width, errors);
  checkList(params.parametric.predictors, 'Parametric Survival: predictors', width, errors);
  checkOne(params.mixedanova.group, 'Mixed ANOVA: group', width, errors);
  checkList(params.mixedanova.conditions, 'Mixed ANOVA: conditions', width, errors);
  checkList(params.mi.variables, 'Missing Data: variables', width, errors);
  checkOne(params.mi.outcome, 'Missing Data: outcome', width, errors);
  checkList(params.mi.predictors, 'Missing Data: predictors', width, errors);
  checkOne(params.ordinal.dep, 'Ordinal Logistic: outcome', width, errors);
  checkList(params.ordinal.indeps, 'Ordinal Logistic: predictors', width, errors);
  checkOne(params.lmm.dep, 'Mixed Model: outcome', width, errors);
  checkList(params.lmm.indeps, 'Mixed Model: predictors', width, errors);
  checkOne(params.lmm.group, 'Mixed Model: group', width, errors);
  checkOne(params.countreg.dep, 'Count Regression: outcome', width, errors);
  checkList(params.countreg.indeps, 'Count Regression: predictors', width, errors);
  checkList(params.agreement.columns, 'Agreement: measurements', width, errors);
  checkOne(params.tost.var1, 'TOST: first variable', width, errors);
  checkOne(params.tost.var2, 'TOST: second variable', width, errors);
  checkOne(params.wizard.outcome, 'Wizard: outcome', width, errors, true);
  checkOne(params.wizard.group, 'Wizard: group', width, errors, true);
  checkOne(params.wizard.second, 'Wizard: second variable', width, errors, true);
  return unique(errors);
};

/** Reconcile parameters after undo/redo by matching stable column ids. */
export const remapParamsByColumns = (
  params: ProjectParams,
  from: readonly Column[],
  to: readonly Column[]
): RemapParamsResult => {
  const key = (col: Column): string =>
    col.id ? `id:${col.id}` : `name:${col.name.trim().toLowerCase()}`;
  const target = new Map<string, number>();
  to.forEach((col, index) => target.set(key(col), index));
  const map: Record<number, number> = {};
  from.forEach((col, index) => {
    const next = target.get(key(col));
    if (next !== undefined) map[index] = next;
  });
  return remapParams(params, { kind: 'map', map });
};

/** Default parameters clamped to a new grid width (used after New/Import). */
export const defaultParamsForGrid = (width: number): ProjectParams =>
  parseParams(DEFAULT_PARAMS, width);

/** Validate only the references used by the active analysis. */
export const validateAnalysisColumnRefs = (
  analysisId: string,
  params: ProjectParams,
  width: number
): string[] => {
  const errors: string[] = [];
  const one = (value: number, label: string, optional = false) =>
    checkOne(value, label, width, errors, optional);
  const list = (values: readonly number[], label: string) =>
    checkList(values, label, width, errors);

  switch (analysisId) {
    case 'descriptive':
      list(params.descVars, 'Descriptive: variables');
      break;
    case 'ttest':
      one(params.ttest.var1, 'T-Test: first variable');
      one(params.ttest.var2, 'T-Test: second variable');
      break;
    case 'anova':
      one(params.anova.dep, 'ANOVA: dependent variable');
      one(params.anova.grp, 'ANOVA: group variable');
      break;
    case 'regression':
      one(params.reg.dep, 'Regression: dependent variable');
      list(params.reg.indeps, 'Regression: predictors');
      break;
    case 'correlation':
      list(params.corr.vars, 'Correlation: variables');
      break;
    case 'distfit':
      one(params.distfit.variable, 'Distribution Fit: variable');
      break;
    case 'logistic':
      one(params.logistic.outcome, 'Logistic: outcome');
      list(params.logistic.predictors, 'Logistic: predictors');
      break;
    case 'cox':
      one(params.cox.timeVariable, 'Cox: time');
      one(params.cox.eventVariable, 'Cox: event');
      list(params.cox.covariates, 'Cox: covariates');
      break;
    case 'survival':
      one(params.survival.timeVariable, 'Survival: time');
      one(params.survival.eventVariable, 'Survival: event');
      one(params.survival.groupVariable, 'Survival: group', true);
      break;
    case 'timeseries':
      one(params.timeseries.variable, 'Time Series: series');
      break;
    case 'ancova':
      one(params.ancova.response, 'ANCOVA: response');
      one(params.ancova.factor, 'ANCOVA: factor');
      list(params.ancova.covariates, 'ANCOVA: covariates');
      break;
    case 'factorial':
      one(params.factorial.response, 'Factorial ANOVA: response');
      one(params.factorial.factorA, 'Factorial ANOVA: factor A');
      one(params.factorial.factorB, 'Factorial ANOVA: factor B');
      break;
    case 'repeatedanova':
      list(params.repeatedanova.selected, 'Repeated ANOVA: conditions');
      break;
    case 'multivariate':
      list(params.multivariate.selected, 'Multivariate: variables');
      break;
    case 'nonparamrm':
      list(params.nonparamrm.selected, 'Non-parametric RM: variables');
      one(params.nonparamrm.left, 'Non-parametric RM: left');
      one(params.nonparamrm.right, 'Non-parametric RM: right');
      one(params.nonparamrm.outcome, 'Non-parametric RM: outcome');
      one(params.nonparamrm.group, 'Non-parametric RM: group');
      break;
    case 'tdcox':
      one(params.tdcox.start, 'Time-Dependent Cox: start');
      one(params.tdcox.stop, 'Time-Dependent Cox: stop');
      one(params.tdcox.event, 'Time-Dependent Cox: event');
      list(params.tdcox.covariates, 'Time-Dependent Cox: covariates');
      break;
    case 'stratcox':
      one(params.stratcox.time, 'Stratified Cox: time');
      one(params.stratcox.event, 'Stratified Cox: event');
      list(params.stratcox.covariates, 'Stratified Cox: covariates');
      one(params.stratcox.stratum, 'Stratified Cox: stratum', true);
      break;
    case 'gee':
      one(params.gee.dep, 'GEE: outcome');
      list(params.gee.indeps, 'GEE: predictors');
      one(params.gee.cluster, 'GEE: cluster');
      break;
    case 'resampling':
      one(params.resampling.outcome, 'Resampling: outcome');
      one(params.resampling.group, 'Resampling: group');
      break;
    case 'parametric':
      one(params.parametric.time, 'Parametric Survival: time');
      one(params.parametric.event, 'Parametric Survival: event');
      list(params.parametric.predictors, 'Parametric Survival: predictors');
      break;
    case 'mixedanova':
      one(params.mixedanova.group, 'Mixed ANOVA: group');
      list(params.mixedanova.conditions, 'Mixed ANOVA: conditions');
      break;
    case 'mi':
      list(params.mi.variables, 'Missing Data: variables');
      one(params.mi.outcome, 'Missing Data: outcome');
      list(params.mi.predictors, 'Missing Data: predictors');
      break;
    case 'ordinal':
      one(params.ordinal.dep, 'Ordinal Logistic: outcome');
      list(params.ordinal.indeps, 'Ordinal Logistic: predictors');
      break;
    case 'lmm':
      one(params.lmm.dep, 'Mixed Model: outcome');
      list(params.lmm.indeps, 'Mixed Model: predictors');
      one(params.lmm.group, 'Mixed Model: group');
      break;
    case 'countreg':
      one(params.countreg.dep, 'Count Regression: outcome');
      list(params.countreg.indeps, 'Count Regression: predictors');
      break;
    case 'agreement':
      list(params.agreement.columns, 'Agreement: measurements');
      break;
    case 'tost':
      one(params.tost.var1, 'TOST: first variable');
      one(params.tost.var2, 'TOST: second variable');
      break;
    case 'wizard':
      one(params.wizard.outcome, 'Wizard: outcome', true);
      one(params.wizard.group, 'Wizard: group', true);
      one(params.wizard.second, 'Wizard: second variable', true);
      break;
    default:
      break;
  }
  return unique(errors);
};

/**
 * Assign a column to the primary role of a procedure.
 * Returns `null` for procedures without a column-based primary role.
 */
export const setPrimaryColumn = (
  analysisId: string,
  params: ProjectParams,
  column: number
): { params: ProjectParams; role: string } | null => {
  const append = (values: readonly number[]): number[] =>
    unique([...values, column]);
  switch (analysisId) {
    case 'descriptive':
      return { params: { ...params, descVars: append(params.descVars) }, role: 'Descriptive variable' };
    case 'distfit':
      return { params: { ...params, distfit: { ...params.distfit, variable: column } }, role: 'Distribution variable' };
    case 'ttest':
      return { params: { ...params, ttest: { ...params.ttest, var1: column } }, role: 'T-Test first variable' };
    case 'anova':
      return { params: { ...params, anova: { ...params.anova, dep: column } }, role: 'ANOVA dependent variable' };
    case 'factorial':
      return { params: { ...params, factorial: { ...params.factorial, response: column } }, role: 'Factorial response' };
    case 'ancova':
      return { params: { ...params, ancova: { ...params.ancova, response: column } }, role: 'ANCOVA response' };
    case 'repeatedanova':
      return { params: { ...params, repeatedanova: { ...params.repeatedanova, selected: append(params.repeatedanova.selected) } }, role: 'Repeated condition' };
    case 'mixedanova':
      return { params: { ...params, mixedanova: { ...params.mixedanova, group: column } }, role: 'Mixed ANOVA group' };
    case 'nonparamrm':
      return { params: { ...params, nonparamrm: { ...params.nonparamrm, outcome: column } }, role: 'Non-parametric outcome' };
    case 'tost':
      return { params: { ...params, tost: { ...params.tost, var1: column } }, role: 'TOST first variable' };
    case 'regression':
      return { params: { ...params, reg: { ...params.reg, dep: column } }, role: 'Regression outcome' };
    case 'logistic':
      return { params: { ...params, logistic: { ...params.logistic, outcome: column } }, role: 'Logistic outcome' };
    case 'countreg':
      return { params: { ...params, countreg: { ...params.countreg, dep: column } }, role: 'Count Regression outcome' };
    case 'ordinal':
      return { params: { ...params, ordinal: { ...params.ordinal, dep: column } }, role: 'Ordinal Logistic outcome' };
    case 'lmm':
      return { params: { ...params, lmm: { ...params.lmm, dep: column } }, role: 'Mixed Model outcome' };
    case 'gee':
      return { params: { ...params, gee: { ...params.gee, dep: column } }, role: 'GEE outcome' };
    case 'multivariate':
      return { params: { ...params, multivariate: { ...params.multivariate, selected: append(params.multivariate.selected) } }, role: 'Multivariate variable' };
    case 'agreement':
      return { params: { ...params, agreement: { ...params.agreement, columns: append(params.agreement.columns) } }, role: 'Agreement measurement' };
    case 'survival':
      return { params: { ...params, survival: { ...params.survival, timeVariable: column } }, role: 'Survival time' };
    case 'cox':
      return { params: { ...params, cox: { ...params.cox, timeVariable: column } }, role: 'Cox time' };
    case 'stratcox':
      return { params: { ...params, stratcox: { ...params.stratcox, time: column } }, role: 'Stratified Cox time' };
    case 'tdcox':
      return { params: { ...params, tdcox: { ...params.tdcox, start: column } }, role: 'Time-Dependent Cox start' };
    case 'parametric':
      return { params: { ...params, parametric: { ...params.parametric, time: column } }, role: 'Parametric Survival time' };
    case 'timeseries':
      return { params: { ...params, timeseries: { ...params.timeseries, variable: column } }, role: 'Time Series variable' };
    case 'mi':
      return { params: { ...params, mi: { ...params.mi, variables: append(params.mi.variables) } }, role: 'Missing Data variable' };
    case 'resampling':
      return { params: { ...params, resampling: { ...params.resampling, outcome: column } }, role: 'Resampling outcome' };
    case 'wizard':
      return { params: { ...params, wizard: { ...params.wizard, outcome: column } }, role: 'Wizard outcome' };
    default:
      return null;
  }
};
