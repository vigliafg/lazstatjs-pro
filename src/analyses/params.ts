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
  const glmDep = one(params.glm.dep, 'GLM: dependent variable');
  const glmIndeps = list(params.glm.indeps, 'GLM: predictors').filter(value => value !== glmDep);
  const quantileDep = one(params.quantile.dep, 'Quantile: dependent variable');
  const quantileIndeps = list(params.quantile.indeps, 'Quantile: predictors').filter(
    value => value !== quantileDep
  );
  const nonlinearDep = one(params.nonlinear.dep, 'Nonlinear: dependent variable');
  const nonlinearPredictor = one(params.nonlinear.predictor, 'Nonlinear: predictor');
  const multinomialOutcome = one(params.multinomial.outcome, 'Multinomial: outcome');
  const multinomialPredictors = list(params.multinomial.predictors, 'Multinomial: predictors').filter(
    value => value !== multinomialOutcome
  );
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
  const glmmDep = one(params.glmm.dep, 'GLMM: outcome');
  const glmmGroup = one(params.glmm.group, 'GLMM: group');
  const glmmIndeps = list(params.glmm.indeps, 'GLMM: predictors').filter(
    value => value !== glmmDep && value !== glmmGroup
  );
  const plsDep = one(params.pls.dep, 'PLS: dependent variable');
  const plsIndeps = list(params.pls.indeps, 'PLS: predictors').filter(value => value !== plsDep);
  const marsDep = one(params.mars.dep, 'MARS: dependent variable');
  const marsIndeps = list(params.mars.indeps, 'MARS: predictors').filter(value => value !== marsDep);
  const ivDep = one(params.iv.dep, 'IV: outcome');
  const ivEndog = list(params.iv.endog, 'IV: endogenous predictors').filter(
    value => value !== ivDep
  );
  const ivInstruments = list(params.iv.instruments, 'IV: instruments').filter(
    value => value !== ivDep && !ivEndog.includes(value)
  );
  const ivExog = list(params.iv.exog, 'IV: exogenous predictors').filter(
    value => value !== ivDep && !ivEndog.includes(value) && !ivInstruments.includes(value)
  );
  const panelDep = one(params.panel.dep, 'Panel: outcome');
  const panelEntity = one(params.panel.entity, 'Panel: entity');
  const panelTime = one(params.panel.time, 'Panel: time');
  const panelIndeps = list(params.panel.indeps, 'Panel: predictors').filter(
    value => value !== panelDep && value !== panelEntity && value !== panelTime
  );
  const selectionDep = one(params.selection.dep, 'Selection: outcome');
  const selectionIndicator = optional(params.selection.selection);
  const selectionIndeps = list(params.selection.indeps, 'Selection: predictors').filter(
    value => value !== selectionDep
  );
  const selectionPredictors = list(
    params.selection.selectIndeps,
    'Selection: selection predictors'
  ).filter(value => value !== selectionDep && value !== selectionIndicator);
  const mediationOutcome = one(params.mediation.outcome, 'Mediation: outcome');
  const mediationPredictor = one(params.mediation.predictor, 'Mediation: predictor');
  const mediationMediator = one(params.mediation.mediator, 'Mediation: mediator');
  const mediationCovariates = list(params.mediation.covariates, 'Mediation: covariates').filter(
    value =>
      value !== mediationOutcome &&
      value !== mediationPredictor &&
      value !== mediationMediator
  );
  const propensityTreatment = one(params.propensity.treatment, 'Propensity: treatment');
  const propensityOutcome = one(params.propensity.outcome, 'Propensity: outcome');
  const propensityCovariates = list(
    params.propensity.covariates,
    'Propensity: covariates'
  ).filter(value => value !== propensityTreatment && value !== propensityOutcome);
  const countDep = one(params.countreg.dep, 'Count Regression: outcome');
  const countIndeps = list(params.countreg.indeps, 'Count Regression: predictors');
  const tostVar1 = one(params.tost.var1, 'TOST: first variable');
  const tostVar2 = one(params.tost.var2, 'TOST: second variable');
  const partitionResponse = one(params.partition.response, 'Partition: response');
  const partitionPredictors = list(params.partition.predictors, 'Partition: predictors').filter(
    value => value !== partitionResponse
  );
  const qualityVariable = one(params.quality.variable, 'Quality: variable');
  const qualityCategory = one(params.quality.category, 'Quality: category');
  const qualityGroup = optional(params.quality.group);
  const clusterSelected = list(params.cluster.selected, 'Cluster: variables');
  const canonicalX = list(params.canonical.x, 'Canonical: X variables');
  const canonicalY = list(params.canonical.y, 'Canonical: Y variables');
  const mdsSelected = list(params.mds.selected, 'MDS: variables');
  const semSelected = list(params.sem.selected, 'SEM: indicators');
  const latentClassSelected = list(params.latentclass.selected, 'Latent class: indicators');
  const irtSelected = list(params.irt.selected, 'IRT: items');
  const conjointAttributes = list(params.conjoint.attributes, 'Conjoint: attributes');
  const conjointResponse = one(params.conjoint.response, 'Conjoint: rating');
  const discriminantGroup = one(params.discriminant.group, 'Discriminant: group');
  const discriminantPredictors = list(
    params.discriminant.predictors,
    'Discriminant: predictors'
  ).filter(value => value !== discriminantGroup);
  const doeResponse = one(params.doe.response, 'DOE: response');
  const doeFactorA = one(params.doe.factorA, 'DOE: factor A');
  const doeFactorB = one(params.doe.factorB, 'DOE: factor B');
  const varianceVariable = one(params.variances.variable, 'Variances: variable');
  const varianceGroup = optional(params.variances.group);
  const proportionVariable = one(params.proportions.variable, 'Proportions: variable');
  const proportionGroup = optional(params.proportions.group);

  return {
    invalidated: unique(invalidated.map(label => label)),
    params: {
      ...params,
      descVars,
      ttest: { ...params.ttest, var1: ttestVar1, var2: ttestVar2 },
      anova: {
        ...params.anova,
        dep: anovaDep,
        grp: anovaGrp,
        inner: Number.isInteger(params.anova.inner) ? params.anova.inner! : -1,
        alpha:
          Number.isFinite(params.anova.alpha) && (params.anova.alpha ?? 0) > 0 && (params.anova.alpha ?? 0) < 0.5
            ? params.anova.alpha!
            : 0.05,
      },
      reg: {
        ...params.reg,
        dep: regDep,
        indeps: regIndeps,
        mode: params.reg.mode ?? 'linear',
        degree: params.reg.degree ?? 2,
        selectionDirection: params.reg.selectionDirection ?? 'both',
        selectionCriterion: params.reg.selectionCriterion ?? 'bic',
        penalty: params.reg.penalty ?? 'lasso',
        lambda: Math.max(0, params.reg.lambda ?? 0.1),
        penaltyAlpha: Math.min(1, Math.max(0, params.reg.penaltyAlpha ?? 0.5)),
      },
      glm: { ...params.glm, dep: glmDep, indeps: glmIndeps },
      quantile: { ...params.quantile, dep: quantileDep, indeps: quantileIndeps },
      nonlinear: { ...params.nonlinear, dep: nonlinearDep, predictor: nonlinearPredictor },
      multinomial: {
        ...params.multinomial,
        outcome: multinomialOutcome,
        predictors: multinomialPredictors,
      },
      corr: { ...params.corr, vars: corrVars },
      distfit: { ...params.distfit, variable: distfitVariable },
      logistic: {
        ...params.logistic,
        outcome: logisticOutcome,
        predictors: logisticPredictors,
        link: params.logistic.link === 'probit' ? 'probit' : 'logit',
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
      lmm: {
        ...params.lmm,
        dep: lmmDep,
        indeps: lmmIndeps,
        group: lmmGroup,
        randomSlope: params.lmm.randomSlope ?? false,
      },
      glmm: (() => {
        const family =
          params.glmm.family === 'binomial' || params.glmm.family === 'poisson'
            ? params.glmm.family
            : 'gaussian';
        const slope =
          Number.isInteger(params.glmm.slope) &&
          params.glmm.slope >= 0 &&
          params.glmm.slope !== glmmDep &&
          params.glmm.slope !== glmmGroup
            ? params.glmm.slope
            : -1;
        return {
          ...params.glmm,
          dep: glmmDep,
          indeps: glmmIndeps,
          group: glmmGroup,
          family,
          link: (family === 'binomial' ? 'logit' : family === 'poisson' ? 'log' : 'identity') as
            | 'identity'
            | 'logit'
            | 'log',
          slope,
        };
      })(),
      pls: {
        ...params.pls,
        dep: plsDep,
        indeps: plsIndeps,
        components: Math.max(1, Math.min(20, Math.round(params.pls.components))),
        cvFolds: Math.max(0, Math.min(20, Math.round(params.pls.cvFolds))),
      },
      mars: {
        ...params.mars,
        dep: marsDep,
        indeps: marsIndeps,
        degree: params.mars.degree === 2 ? 2 : 1,
        maxTerms: Math.max(1, Math.min(200, Math.round(params.mars.maxTerms))),
        penalty: Math.max(0, params.mars.penalty),
        prune: params.mars.prune ?? true,
      },
      iv: {
        ...params.iv,
        dep: ivDep,
        endog: ivEndog,
        instruments: ivInstruments,
        exog: ivExog,
        robust: params.iv.robust ?? false,
      },
      panel: {
        ...params.panel,
        dep: panelDep,
        indeps: panelIndeps,
        entity: panelEntity,
        time: panelTime,
        model:
          params.panel.model === 'fe' || params.panel.model === 're'
            ? params.panel.model
            : 'both',
      },
      selection: {
        ...params.selection,
        mode: params.selection.mode === 'heckman' ? 'heckman' : 'tobit',
        dep: selectionDep,
        indeps: selectionIndeps,
        lower: Number.isFinite(params.selection.lower) ? params.selection.lower : 0,
        upper:
          typeof params.selection.upper === 'number' && Number.isFinite(params.selection.upper)
            ? params.selection.upper
            : null,
        selection: selectionIndicator,
        selectIndeps: selectionPredictors,
      },
      mediation: {
        ...params.mediation,
        outcome: mediationOutcome,
        predictor: mediationPredictor,
        mediator: mediationMediator,
        covariates: mediationCovariates,
        bootstrap: Math.max(
          0,
          Math.min(5000, Math.round(params.mediation.bootstrap ?? 1000))
        ),
        seed: Number.isInteger(params.mediation.seed)
          ? params.mediation.seed
          : 20261103,
      },
      propensity: {
        ...params.propensity,
        treatment: propensityTreatment,
        outcome: propensityOutcome,
        covariates: propensityCovariates,
        method: params.propensity.method === 'ipw' ? 'ipw' : 'nearest',
        caliper: Math.max(0, params.propensity.caliper ?? 0),
        ratio: Math.max(1, Math.min(10, Math.round(params.propensity.ratio ?? 1))),
      },
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
      partition: {
        ...params.partition,
        response: partitionResponse,
        predictors: partitionPredictors,
      },
      quality: {
        ...params.quality,
        variable: qualityVariable,
        category: qualityCategory,
        group: qualityGroup,
      },
      cluster: {
        ...params.cluster,
        selected: clusterSelected,
      },
      canonical: {
        x: canonicalX,
        y: canonicalY.filter(value => !canonicalX.includes(value)),
      },
      mds: { ...params.mds, selected: mdsSelected },
      sem: {
        ...params.sem,
        selected: semSelected,
        groups: semSelected.map((_, index) => params.sem.groups[index] ?? 0),
      },
      latentclass: { ...params.latentclass, selected: latentClassSelected },
      irt: { ...params.irt, selected: irtSelected },
      conjoint: {
        ...params.conjoint,
        attributes: conjointAttributes.filter(value => value !== conjointResponse),
        response: conjointResponse,
      },
      discriminant: {
        ...params.discriminant,
        mode: params.discriminant.mode ?? 'classic',
        group: discriminantGroup,
        predictors: discriminantPredictors,
        covariates: (params.discriminant.covariates ?? []).filter(
          value => value !== discriminantGroup && !discriminantPredictors.includes(value)
        ),
      },
      doe: {
        ...params.doe,
        response: doeResponse,
        factorA: doeFactorA,
        factorB: doeFactorB,
      },
      variances: {
        ...params.variances,
        variable: varianceVariable,
        group: varianceGroup,
      },
      proportions: {
        ...params.proportions,
        variable: proportionVariable,
        group: proportionGroup,
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
  checkOne(params.variances.variable, 'Variances: variable', width, errors);
  checkOne(params.variances.group, 'Variances: group', width, errors, true);
  checkOne(params.proportions.variable, 'Proportions: variable', width, errors);
  checkOne(params.proportions.group, 'Proportions: group', width, errors, true);
  checkOne(params.ttest.var1, 'T-Test: first variable', width, errors);
  checkOne(params.ttest.var2, 'T-Test: second variable', width, errors);
  checkOne(params.anova.dep, 'ANOVA: dependent variable', width, errors);
  checkOne(params.anova.grp, 'ANOVA: group variable', width, errors);
  checkOne(params.anova.inner ?? -1, 'ANOVA: inner factor', width, errors, true);
  checkOne(params.reg.dep, 'Regression: dependent variable', width, errors);
  checkList(params.reg.indeps, 'Regression: predictors', width, errors);
  checkOne(params.glm.dep, 'GLM: dependent variable', width, errors);
  checkList(params.glm.indeps, 'GLM: predictors', width, errors);
  checkOne(params.quantile.dep, 'Quantile: dependent variable', width, errors);
  checkList(params.quantile.indeps, 'Quantile: predictors', width, errors);
  checkOne(params.nonlinear.dep, 'Nonlinear: dependent variable', width, errors);
  checkOne(params.nonlinear.predictor, 'Nonlinear: predictor', width, errors);
  checkOne(params.multinomial.outcome, 'Multinomial: outcome', width, errors);
  checkList(params.multinomial.predictors, 'Multinomial: predictors', width, errors);
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
  checkOne(params.glmm.dep, 'GLMM: outcome', width, errors);
  checkList(params.glmm.indeps, 'GLMM: predictors', width, errors);
  checkOne(params.glmm.group, 'GLMM: group', width, errors);
  checkOne(params.glmm.slope, 'GLMM: random slope', width, errors, true);
  checkOne(params.pls.dep, 'PLS: dependent variable', width, errors);
  checkList(params.pls.indeps, 'PLS: predictors', width, errors);
  checkOne(params.mars.dep, 'MARS: dependent variable', width, errors);
  checkList(params.mars.indeps, 'MARS: predictors', width, errors);
  checkOne(params.iv.dep, 'IV: outcome', width, errors);
  checkList(params.iv.endog, 'IV: endogenous predictors', width, errors);
  checkList(params.iv.instruments, 'IV: instruments', width, errors);
  checkList(params.iv.exog, 'IV: exogenous predictors', width, errors);
  checkOne(params.panel.dep, 'Panel: outcome', width, errors);
  checkList(params.panel.indeps, 'Panel: predictors', width, errors);
  checkOne(params.panel.entity, 'Panel: entity', width, errors);
  checkOne(params.panel.time, 'Panel: time', width, errors);
  checkOne(params.selection.dep, 'Selection: outcome', width, errors);
  checkList(params.selection.indeps, 'Selection: predictors', width, errors);
  checkOne(params.selection.selection, 'Selection: selection indicator', width, errors, true);
  checkList(params.selection.selectIndeps, 'Selection: selection predictors', width, errors);
  checkOne(params.mediation.outcome, 'Mediation: outcome', width, errors);
  checkOne(params.mediation.predictor, 'Mediation: predictor', width, errors);
  checkOne(params.mediation.mediator, 'Mediation: mediator', width, errors);
  checkList(params.mediation.covariates, 'Mediation: covariates', width, errors);
  checkOne(params.propensity.treatment, 'Propensity: treatment', width, errors);
  checkOne(params.propensity.outcome, 'Propensity: outcome', width, errors);
  checkList(params.propensity.covariates, 'Propensity: covariates', width, errors);
  checkOne(params.countreg.dep, 'Count Regression: outcome', width, errors);
  checkList(params.countreg.indeps, 'Count Regression: predictors', width, errors);
  checkList(params.agreement.columns, 'Agreement: measurements', width, errors);
  checkOne(params.tost.var1, 'TOST: first variable', width, errors);
  checkOne(params.tost.var2, 'TOST: second variable', width, errors);
  checkOne(params.wizard.outcome, 'Wizard: outcome', width, errors, true);
  checkOne(params.wizard.group, 'Wizard: group', width, errors, true);
  checkOne(params.wizard.second, 'Wizard: second variable', width, errors, true);
  checkOne(params.partition.response, 'Partition: response', width, errors);
  checkList(params.partition.predictors, 'Partition: predictors', width, errors);
  checkOne(params.quality.variable, 'Quality: variable', width, errors);
  checkOne(params.quality.category, 'Quality: category', width, errors);
  checkOne(params.quality.group, 'Quality: group', width, errors, true);
  checkList(params.cluster.selected, 'Cluster: variables', width, errors);
  checkList(params.canonical.x, 'Canonical: X variables', width, errors);
  checkList(params.canonical.y, 'Canonical: Y variables', width, errors);
  checkList(params.mds.selected, 'MDS: variables', width, errors);
  checkList(params.sem.selected, 'SEM: indicators', width, errors);
  checkList(params.latentclass.selected, 'Latent class: indicators', width, errors);
  checkList(params.irt.selected, 'IRT: items', width, errors);
  checkList(params.conjoint.attributes, 'Conjoint: attributes', width, errors);
  checkOne(params.conjoint.response, 'Conjoint: rating', width, errors);
  checkOne(params.discriminant.group, 'Discriminant: group', width, errors);
  checkList(params.discriminant.predictors, 'Discriminant: predictors', width, errors);
  checkList(params.discriminant.covariates ?? [], 'Discriminant: covariates', width, errors);
  checkOne(params.doe.response, 'DOE: response', width, errors);
  checkOne(params.doe.factorA, 'DOE: factor A', width, errors);
  checkOne(params.doe.factorB, 'DOE: factor B', width, errors);
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
    case 'variances':
      one(params.variances.variable, 'Variances: variable');
      if (params.variances.mode === 'two') one(params.variances.group, 'Variances: group');
      break;
    case 'proportions':
      one(params.proportions.variable, 'Proportions: variable');
      if (params.proportions.mode === 'twoProp' || params.proportions.mode === 'twoRate') {
        one(params.proportions.group, 'Proportions: group');
      }
      break;
    case 'ttest':
      one(params.ttest.var1, 'T-Test: first variable');
      one(params.ttest.var2, 'T-Test: second variable');
      break;
    case 'anova':
      one(params.anova.dep, 'ANOVA: dependent variable');
      one(params.anova.grp, 'ANOVA: group variable');
      if (params.anova.mode === 'nested') one(params.anova.inner ?? -1, 'ANOVA: inner factor');
      break;
    case 'glm':
      one(params.glm.dep, 'GLM: dependent variable');
      list(params.glm.indeps, 'GLM: predictors');
      break;
    case 'quantile':
      one(params.quantile.dep, 'Quantile: dependent variable');
      list(params.quantile.indeps, 'Quantile: predictors');
      break;
    case 'nonlinear':
      one(params.nonlinear.dep, 'Nonlinear: dependent variable');
      one(params.nonlinear.predictor, 'Nonlinear: predictor');
      break;
    case 'multinomial':
      one(params.multinomial.outcome, 'Multinomial: outcome');
      list(params.multinomial.predictors, 'Multinomial: predictors');
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
      if (params.mi.model !== 'categorical') one(params.mi.outcome, 'Missing Data: outcome');
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
    case 'glmm':
      one(params.glmm.dep, 'GLMM: outcome');
      list(params.glmm.indeps, 'GLMM: predictors');
      one(params.glmm.group, 'GLMM: group');
      break;
    case 'pls':
      one(params.pls.dep, 'PLS: dependent variable');
      list(params.pls.indeps, 'PLS: predictors');
      break;
    case 'mars':
      one(params.mars.dep, 'MARS: dependent variable');
      list(params.mars.indeps, 'MARS: predictors');
      break;
    case 'iv':
      one(params.iv.dep, 'IV: outcome');
      list(params.iv.endog, 'IV: endogenous predictors');
      list(params.iv.instruments, 'IV: instruments');
      list(params.iv.exog, 'IV: exogenous predictors');
      break;
    case 'panel':
      one(params.panel.dep, 'Panel: outcome');
      list(params.panel.indeps, 'Panel: predictors');
      one(params.panel.entity, 'Panel: entity');
      one(params.panel.time, 'Panel: time');
      break;
    case 'selection':
      one(params.selection.dep, 'Selection: outcome');
      list(params.selection.indeps, 'Selection: predictors');
      one(params.selection.selection, 'Selection: selection indicator', true);
      list(params.selection.selectIndeps, 'Selection: selection predictors');
      break;
    case 'mediation':
      one(params.mediation.outcome, 'Mediation: outcome');
      one(params.mediation.predictor, 'Mediation: predictor');
      one(params.mediation.mediator, 'Mediation: mediator');
      list(params.mediation.covariates, 'Mediation: covariates');
      break;
    case 'propensity':
      one(params.propensity.treatment, 'Propensity: treatment');
      one(params.propensity.outcome, 'Propensity: outcome');
      list(params.propensity.covariates, 'Propensity: covariates');
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
    case 'partition':
      one(params.partition.response, 'Partition: response');
      list(params.partition.predictors, 'Partition: predictors');
      break;
    case 'quality':
      one(params.quality.variable, 'Quality: variable');
      one(params.quality.category, 'Quality: category');
      one(params.quality.group, 'Quality: group', true);
      break;
    case 'cluster':
      list(params.cluster.selected, 'Cluster: variables');
      break;
    case 'canonical':
      list(params.canonical.x, 'Canonical: X variables');
      list(params.canonical.y, 'Canonical: Y variables');
      break;
    case 'mds':
      list(params.mds.selected, 'MDS: variables');
      break;
    case 'sem':
      list(params.sem.selected, 'SEM: indicators');
      break;
    case 'latentclass':
      list(params.latentclass.selected, 'Latent class: indicators');
      break;
    case 'irt':
      list(params.irt.selected, 'IRT: items');
      break;
    case 'conjoint':
      list(params.conjoint.attributes, 'Conjoint: attributes');
      one(params.conjoint.response, 'Conjoint: rating');
      break;
    case 'discriminant':
      one(params.discriminant.group, 'Discriminant: group');
      list(params.discriminant.predictors, 'Discriminant: predictors');
      if (params.discriminant.mode === 'mancova') {
        list(params.discriminant.covariates ?? [], 'Discriminant: covariates');
      }
      break;
    case 'doe':
      one(params.doe.response, 'DOE: response');
      one(params.doe.factorA, 'DOE: factor A');
      one(params.doe.factorB, 'DOE: factor B');
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
    case 'variances':
      return {
        params: {
          ...params,
          variances: { ...params.variances, variable: column },
        },
        role: 'Variances: variable',
      };
    case 'proportions':
      return {
        params: {
          ...params,
          proportions: { ...params.proportions, variable: column },
        },
        role: 'Proportions: variable',
      };
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
    case 'glm':
      return { params: { ...params, glm: { ...params.glm, dep: column } }, role: 'GLM outcome' };
    case 'quantile':
      return { params: { ...params, quantile: { ...params.quantile, dep: column } }, role: 'Quantile outcome' };
    case 'nonlinear':
      return { params: { ...params, nonlinear: { ...params.nonlinear, predictor: column } }, role: 'Nonlinear predictor' };
    case 'multinomial':
      return { params: { ...params, multinomial: { ...params.multinomial, outcome: column } }, role: 'Multinomial outcome' };
    case 'regression':
      return { params: { ...params, reg: { ...params.reg, dep: column } }, role: 'Regression outcome' };
    case 'logistic':
      return { params: { ...params, logistic: { ...params.logistic, outcome: column } }, role: 'Logistic outcome' };
    case 'pls':
      return { params: { ...params, pls: { ...params.pls, dep: column } }, role: 'PLS outcome' };
    case 'mars':
      return { params: { ...params, mars: { ...params.mars, dep: column } }, role: 'MARS outcome' };
    case 'iv':
      return { params: { ...params, iv: { ...params.iv, dep: column } }, role: 'IV outcome' };
    case 'panel':
      return { params: { ...params, panel: { ...params.panel, dep: column } }, role: 'Panel outcome' };
    case 'selection':
      return {
        params: { ...params, selection: { ...params.selection, dep: column } },
        role: 'Selection outcome',
      };
    case 'mediation':
      return {
        params: { ...params, mediation: { ...params.mediation, outcome: column } },
        role: 'Mediation outcome',
      };
    case 'propensity':
      return {
        params: { ...params, propensity: { ...params.propensity, treatment: column } },
        role: 'Propensity treatment',
      };
    case 'countreg':
      return { params: { ...params, countreg: { ...params.countreg, dep: column } }, role: 'Count Regression outcome' };
    case 'ordinal':
      return { params: { ...params, ordinal: { ...params.ordinal, dep: column } }, role: 'Ordinal Logistic outcome' };
    case 'lmm':
      return { params: { ...params, lmm: { ...params.lmm, dep: column } }, role: 'Mixed Model outcome' };
    case 'glmm':
      return { params: { ...params, glmm: { ...params.glmm, dep: column } }, role: 'GLMM outcome' };
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
    case 'partition':
      return {
        params: { ...params, partition: { ...params.partition, response: column } },
        role: 'Partition response',
      };
    case 'quality':
      return {
        params: { ...params, quality: { ...params.quality, variable: column } },
        role: 'Quality variable',
      };
    case 'cluster':
      return {
        params: {
          ...params,
          cluster: { ...params.cluster, selected: append(params.cluster.selected) },
        },
        role: 'Cluster variable',
      };
    case 'canonical': {
      const inY = params.canonical.y.includes(column);
      return {
        params: {
          ...params,
          canonical: inY
            ? { ...params.canonical, y: params.canonical.y.filter(value => value !== column) }
            : { ...params.canonical, x: append(params.canonical.x) },
        },
        role: 'Canonical X variable',
      };
    }
    case 'mds':
      return {
        params: { ...params, mds: { ...params.mds, selected: append(params.mds.selected) } },
        role: 'MDS variable',
      };
    case 'sem':
      return {
        params: {
          ...params,
          sem: {
            ...params.sem,
            selected: append(params.sem.selected),
            groups: [...params.sem.groups, 0],
          },
        },
        role: 'SEM indicator',
      };
    case 'latentclass':
      return {
        params: {
          ...params,
          latentclass: {
            ...params.latentclass,
            selected: append(params.latentclass.selected),
          },
        },
        role: 'Latent class indicator',
      };
    case 'irt':
      return {
        params: { ...params, irt: { ...params.irt, selected: append(params.irt.selected) } },
        role: 'IRT item',
      };
    case 'conjoint':
      return {
        params: {
          ...params,
          conjoint: { ...params.conjoint, attributes: append(params.conjoint.attributes) },
        },
        role: 'Conjoint attribute',
      };
    case 'discriminant':
      return {
        params: {
          ...params,
          discriminant: { ...params.discriminant, group: column },
        },
        role: 'Discriminant group',
      };
    case 'doe':
      return {
        params: { ...params, doe: { ...params.doe, response: column } },
        role: 'DOE response',
      };
    default:
      return null;
  }
};
