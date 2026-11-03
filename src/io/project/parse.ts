import type { CategoryLevel, ColType, GridData } from '../../grid/types';
import { COL_TYPES, MAX_LEVELS, createColumnId } from '../../grid/types';
import { MAX_COLS, MAX_ROWS } from '../readers';
import type { SampleSizeDesign } from '../../stats/samplesize';
import type { DistributionName } from '../../stats/distfit';
import type { WizardGoal } from '../../stats/wizard';
import { isActiveLocale, isHelpLocale, isLocale } from '../../i18n/locales';
import { normalizeChartDefaults } from '../../charts/defaults';
import { normalizeChartPresets } from '../../charts/presets';
import { normalizeUserStyles } from '../../charts/styles';
import type { ChartOutputGroup } from '../../charts/outputs';
import { normalizeCustomThemes, resolveThemeId } from '../../theme/custom';
import { normalizeOutputAppearance } from '../../theme/outputAppearance';
import {
  DEFAULT_PARAMS, DEFAULT_SETTINGS, DESCRIPTIVE_MODES,
  type ProjectParams, type ProjectSettings,
  type TimeSeriesDifferenceMode, type TimeSeriesSeasonalDifferenceMode,
} from './types';

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const finite = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const integer = (value: unknown, fallback: number): number => Math.trunc(finite(value, fallback));

const index = (value: unknown, fallback: number, width: number): number =>
  Math.max(0, Math.min(Math.max(0, width - 1), integer(value, fallback)));

/** Come `index`, ma -1 resta "nessuna selezione". */
const optionalIndex = (value: unknown, fallback: number, width: number): number => {
  const raw = finite(value, fallback);
  return raw < 0 ? -1 : index(raw, fallback, width);
};

const bool = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

const text = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value : fallback;

const indexList = (value: unknown, fallback: number[], width: number): number[] => {
  const source = Array.isArray(value) ? value : fallback;
  // Preserve an intentionally empty selection, but never let negatives,
  // non-numeric junk or indexes past the restored grid reach the panels.
  return Array.from(
    new Set(
      source
        .filter(
          (v): v is number =>
            typeof v === 'number' && Number.isFinite(v) && v >= 0 && Math.trunc(v) < width
        )
        .map((v) => Math.trunc(v))
    )
  );
};

const parseType = (value: unknown): ColType =>
  typeof value === 'string' && COL_TYPES.some((t) => t.id === value) ? (value as ColType) : 'str';

const SAMPLE_SIZE_DESIGNS: readonly SampleSizeDesign[] = [
  'twoMeans',
  'oneMean',
  'paired',
  'twoProportions',
  'correlation',
  'anova',
  'tost',
  'survival',
  'oneProportion',
  'variance',
  'oneRate',
];

const parseSampleSizeDesign = (value: unknown, fallback: SampleSizeDesign): SampleSizeDesign =>
  typeof value === 'string' && (SAMPLE_SIZE_DESIGNS as readonly string[]).includes(value)
    ? (value as SampleSizeDesign)
    : fallback;

const DISTRIBUTION_NAMES: readonly DistributionName[] = [
  'normal',
  'lognormal',
  'exponential',
  'gamma',
  'weibull',
];

const parseDistributionList = (
  value: unknown,
  fallback: readonly DistributionName[]
): DistributionName[] => {
  if (!Array.isArray(value)) return [...fallback];
  const valid = value.filter(
    (name): name is DistributionName =>
      typeof name === 'string' && (DISTRIBUTION_NAMES as readonly string[]).includes(name)
  );
  return Array.from(new Set(valid));
};

const DIFFERENCE_MODES: readonly TimeSeriesDifferenceMode[] = ['auto', '0', '1', '2'];
const SEASONAL_DIFFERENCE_MODES: readonly TimeSeriesSeasonalDifferenceMode[] = ['auto', '0', '1'];
const WIZARD_GOALS: readonly WizardGoal[] = [
  'describe',
  'compare',
  'associate',
  'predict',
  'survive',
  'forecast',
  'plan',
];

const parseWizardGoal = (value: unknown, fallback: WizardGoal): WizardGoal =>
  typeof value === 'string' && (WIZARD_GOALS as readonly string[]).includes(value)
    ? (value as WizardGoal)
    : fallback;

const parseDifferenceMode = (
  value: unknown,
  fallback: TimeSeriesDifferenceMode
): TimeSeriesDifferenceMode =>
  typeof value === 'string' && (DIFFERENCE_MODES as readonly string[]).includes(value)
    ? (value as TimeSeriesDifferenceMode)
    : fallback;

const parseSeasonalDifferenceMode = (
  value: unknown,
  fallback: TimeSeriesSeasonalDifferenceMode
): TimeSeriesSeasonalDifferenceMode =>
  typeof value === 'string' && (SEASONAL_DIFFERENCE_MODES as readonly string[]).includes(value)
    ? (value as TimeSeriesSeasonalDifferenceMode)
    : fallback;

const MAX_CONTINGENCY_LABELS = 50;

const parseContingencyLabels = (value: unknown, fallback: readonly string[]): string[] => {
  if (!Array.isArray(value)) return [...fallback];
  const labels = value
    .filter((label): label is string => typeof label === 'string')
    .slice(0, MAX_CONTINGENCY_LABELS);
  return labels.length >= 2 ? labels : [...fallback];
};

const parseContingencyCell = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '0';
};

const parseContingencyValues = (
  value: unknown,
  rows: readonly string[],
  cols: readonly string[]
): string[][] => {
  if (!Array.isArray(value)) return rows.map(() => cols.map(() => '0'));
  return rows.map((_, rowIndex) => {
    const source = Array.isArray(value[rowIndex]) ? value[rowIndex] : [];
    return cols.map((_, colIndex) => parseContingencyCell(source[colIndex]));
  });
};

const parseCell = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '';
  if (typeof value === 'boolean') return value ? '1' : '0';
  return '';
};

/** Declared categorical levels from an untrusted project file. */
const parseLevels = (value: unknown): CategoryLevel[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const values = new Set<string>();
  const labels = new Set<string>();
  const out: CategoryLevel[] = [];
  for (const raw of value) {
    if (out.length >= MAX_LEVELS) break;
    if (!isRecord(raw)) continue;
    const code = typeof raw.value === 'string' || typeof raw.value === 'number' ? String(raw.value).trim() : '';
    if (code === '' || values.has(code)) continue;
    const base = typeof raw.label === 'string' && raw.label.trim() ? raw.label.trim() : code;
    let label = base;
    let suffix = 2;
    while (labels.has(label.toLowerCase())) {
      label = `${base} ${suffix}`;
      suffix += 1;
    }
    values.add(code);
    labels.add(label.toLowerCase());
    out.push({ value: code, label });
  }
  return out.length > 0 ? out : undefined;
};

export const parseGrid = (value: unknown): GridData => {
  if (!isRecord(value)) throw new Error('The project has no data grid');
  const colsRaw = value.cols;
  const rowsRaw = value.rows;
  if (!Array.isArray(colsRaw) || colsRaw.length === 0) throw new Error('The project grid has no columns');
  if (colsRaw.length > MAX_COLS) throw new Error(`Too many columns (${colsRaw.length} > ${MAX_COLS})`);
  if (!Array.isArray(rowsRaw)) throw new Error('The project grid has no rows');
  if (rowsRaw.length > MAX_ROWS) throw new Error(`Too many rows (${rowsRaw.length} > ${MAX_ROWS})`);

  const taken = new Set<string>();
  const cols = colsRaw.map((col, i) => {
    const record = isRecord(col) ? col : {};
    const base = typeof record.name === 'string' && record.name.trim() ? record.name.trim() : `Var${i + 1}`;
    let name = base;
    let n = 2;
    while (taken.has(name.toLowerCase())) {
      name = `${base}_${n}`;
      n += 1;
    }
    taken.add(name.toLowerCase());
    const levels = parseLevels(record.levels);
    const reference =
      levels && typeof record.reference === 'string' && levels.some((level) => level.value === record.reference)
        ? record.reference
        : undefined;
    const missing = Array.isArray(record.missing)
      ? Array.from(
          new Set(
            record.missing
              .filter((value): value is string => typeof value === 'string')
              .map(value => value.trim().slice(0, 40))
              .filter(Boolean)
          )
        ).slice(0, 20)
      : [];
    return {
      id:
        typeof record.id === 'string' && record.id.trim()
          ? record.id.trim().slice(0, 80)
          : createColumnId(),
      name,
      type: parseType(record.type),
      ...(typeof record.label === 'string' && record.label.trim()
        ? { label: record.label.trim().slice(0, 120) }
        : {}),
      ...(typeof record.description === 'string' && record.description.trim()
        ? { description: record.description.trim().slice(0, 500) }
        : {}),
      ...(levels ? { levels } : {}),
      ...(reference ? { reference } : {}),
      ...(missing.length ? { missing } : {}),
      ...(typeof record.formula === 'string' && record.formula.trim()
        ? { formula: record.formula.trim().slice(0, 500) }
        : {}),
    };
  });

  const width = cols.length;
  const rows = rowsRaw.map((row) => {
    const cells = Array.isArray(row) ? row : [];
    return cols.map((_, i) => parseCell(cells[i]));
  });
  return { cols, rows: rows.length ? rows : [new Array(width).fill('')] };
};

export const parseParams = (value: unknown, width: number): ProjectParams => {
  const raw = isRecord(value) ? value : {};
  const ttest = isRecord(raw.ttest) ? raw.ttest : {};
  const anova = isRecord(raw.anova) ? raw.anova : {};
  const glm = isRecord(raw.glm) ? raw.glm : {};
  const quantile = isRecord(raw.quantile) ? raw.quantile : {};
  const nonlinear = isRecord(raw.nonlinear) ? raw.nonlinear : {};
  const multinomial = isRecord(raw.multinomial) ? raw.multinomial : {};
  const reg = isRecord(raw.reg) ? raw.reg : {};
  const corr = isRecord(raw.corr) ? raw.corr : {};
  const chisq = isRecord(raw.chisq) ? raw.chisq : {};
  const samplesize = isRecord(raw.samplesize) ? raw.samplesize : {};
  const distfit = isRecord(raw.distfit) ? raw.distfit : {};
  const logistic = isRecord(raw.logistic) ? raw.logistic : {};
  const cox = isRecord(raw.cox) ? raw.cox : {};
  const survival = isRecord(raw.survival) ? raw.survival : {};
  const timeseries = isRecord(raw.timeseries) ? raw.timeseries : {};
  const contingency = isRecord(raw.contingency) ? raw.contingency : null;
  const ancova = isRecord(raw.ancova) ? raw.ancova : {};
  const factorial = isRecord(raw.factorial) ? raw.factorial : {};
  const repeatedanova = isRecord(raw.repeatedanova) ? raw.repeatedanova : {};
  const multivariate = isRecord(raw.multivariate) ? raw.multivariate : {};
  const nonparamrm = isRecord(raw.nonparamrm) ? raw.nonparamrm : {};
  const tdcox = isRecord(raw.tdcox) ? raw.tdcox : {};
  const stratcox = isRecord(raw.stratcox) ? raw.stratcox : {};
  const gee = isRecord(raw.gee) ? raw.gee : {};
  const resampling = isRecord(raw.resampling) ? raw.resampling : {};
  const parametric = isRecord(raw.parametric) ? raw.parametric : {};
  const mixedanova = isRecord(raw.mixedanova) ? raw.mixedanova : {};
  const mi = isRecord(raw.mi) ? raw.mi : {};
  const ordinal = isRecord(raw.ordinal) ? raw.ordinal : {};
  const lmm = isRecord(raw.lmm) ? raw.lmm : {};
  const glmm = isRecord(raw.glmm) ? raw.glmm : {};
  const pls = isRecord(raw.pls) ? raw.pls : {};
  const mars = isRecord(raw.mars) ? raw.mars : {};
  const iv = isRecord(raw.iv) ? raw.iv : {};
  const panel = isRecord(raw.panel) ? raw.panel : {};
  const selection = isRecord(raw.selection) ? raw.selection : {};
  const mediation = isRecord(raw.mediation) ? raw.mediation : {};
  const propensity = isRecord(raw.propensity) ? raw.propensity : {};
  const countreg = isRecord(raw.countreg) ? raw.countreg : {};
  const agreement = isRecord(raw.agreement) ? raw.agreement : {};
  const tost = isRecord(raw.tost) ? raw.tost : {};
  const wizard = isRecord(raw.wizard) ? raw.wizard : {};
  const partition = isRecord(raw.partition) ? raw.partition : {};
  const quality = isRecord(raw.quality) ? raw.quality : {};
  const proportions = isRecord(raw.proportions) ? raw.proportions : {};
  const variances = isRecord(raw.variances) ? raw.variances : {};
  const cluster = isRecord(raw.cluster) ? raw.cluster : {};
  const discriminant = isRecord(raw.discriminant) ? raw.discriminant : {};
  const doe = isRecord(raw.doe) ? raw.doe : {};
  const d = DEFAULT_PARAMS;
  const contingencyRows = contingency
    ? parseContingencyLabels(contingency.rows, d.contingency.rows)
    : [...d.contingency.rows];
  const contingencyCols = contingency
    ? parseContingencyLabels(contingency.cols, d.contingency.cols)
    : [...d.contingency.cols];
  const ancovaResponse = index(ancova.response, d.ancova.response, width);
  const ancovaFactor = index(ancova.factor, d.ancova.factor, width);
  const logisticOutcome = index(logistic.outcome, d.logistic.outcome, width);
  const coxTime = index(cox.timeVariable, d.cox.timeVariable, width);
  const coxEvent = index(cox.eventVariable, d.cox.eventVariable, width);

  return {
    descVars: indexList(raw.descVars, d.descVars, width),
    descMode:
      typeof raw.descMode === 'string' && (DESCRIPTIVE_MODES as readonly string[]).includes(raw.descMode)
        ? (raw.descMode as ProjectParams['descMode'])
        : d.descMode,
    variances: {
      mode: variances.mode === 'two' ? 'two' : d.variances.mode,
      variable: index(variances.variable, d.variances.variable, width),
      group: optionalIndex(variances.group, d.variances.group, width),
      nullVariance: Math.max(1e-9, finite(variances.nullVariance, d.variances.nullVariance)),
    },
    glm: {
      dep: index(glm.dep, d.glm.dep, width),
      indeps: indexList(glm.indeps, d.glm.indeps, width).filter(
        (value) => value !== index(glm.dep, d.glm.dep, width)
      ),
      family:
        glm.family === 'gaussian' ||
        glm.family === 'binomial' ||
        glm.family === 'poisson' ||
        glm.family === 'gamma'
          ? glm.family
          : d.glm.family,
      link:
        glm.link === 'identity' ||
        glm.link === 'log' ||
        glm.link === 'logit' ||
        glm.link === 'probit' ||
        glm.link === 'inverse'
          ? glm.link
          : d.glm.link,
    },
    quantile: {
      dep: index(quantile.dep, d.quantile.dep, width),
      indeps: indexList(quantile.indeps, d.quantile.indeps, width).filter(
        (value) => value !== index(quantile.dep, d.quantile.dep, width)
      ),
      tau: Math.min(0.99, Math.max(0.01, finite(quantile.tau, d.quantile.tau))),
    },
    nonlinear: {
      dep: index(nonlinear.dep, d.nonlinear.dep, width),
      predictor: index(nonlinear.predictor, d.nonlinear.predictor, width),
      model:
        nonlinear.model === 'exponential' ||
        nonlinear.model === 'logistic' ||
        nonlinear.model === 'gompertz' ||
        nonlinear.model === 'power' ||
        nonlinear.model === 'michaelis'
          ? nonlinear.model
          : d.nonlinear.model,
    },
    multinomial: {
      outcome: index(multinomial.outcome, d.multinomial.outcome, width),
      predictors: indexList(multinomial.predictors, d.multinomial.predictors, width).filter(
        (value) => value !== index(multinomial.outcome, d.multinomial.outcome, width)
      ),
    },
    proportions: {
      mode:
        proportions.mode === 'twoProp' ||
        proportions.mode === 'oneRate' ||
        proportions.mode === 'twoRate'
          ? proportions.mode
          : d.proportions.mode,
      variable: index(proportions.variable, d.proportions.variable, width),
      group: optionalIndex(proportions.group, d.proportions.group, width),
      successLevel:
        typeof proportions.successLevel === 'string'
          ? proportions.successLevel
          : d.proportions.successLevel,
      nullP: Math.max(0.0001, Math.min(0.9999, finite(proportions.nullP, d.proportions.nullP))),
      nullRate: Math.max(1e-9, finite(proportions.nullRate, d.proportions.nullRate)),
      exposure: Math.max(1e-9, finite(proportions.exposure, d.proportions.exposure)),
    },
    ttest: {
      type:
        ttest.type === 'ind' ||
        ttest.type === 'dep' ||
        ttest.type === 'one' ||
        ttest.type === 'sign'
          ? ttest.type
          : d.ttest.type,
      var1: index(ttest.var1, d.ttest.var1, width),
      var2: index(ttest.var2, d.ttest.var2, width),
      mu: finite(ttest.mu, d.ttest.mu),
      useNonParam: bool(ttest.useNonParam, d.ttest.useNonParam),
      equalVar: bool(ttest.equalVar, d.ttest.equalVar),
    },
    anova: {
      mode:
        anova.mode === 'median' || anova.mode === 'nested' || anova.mode === 'anom'
          ? anova.mode
          : d.anova.mode,
      dep: index(anova.dep, d.anova.dep, width),
      grp: index(anova.grp, d.anova.grp, width),
      posthoc: text(anova.posthoc, d.anova.posthoc),
      useNonParam: bool(anova.useNonParam, d.anova.useNonParam),
      kwPosthoc:
        anova.kwPosthoc === 'none' || anova.kwPosthoc === 'bonferroni' || anova.kwPosthoc === 'holm' || anova.kwPosthoc === 'fdr'
          ? anova.kwPosthoc
          : d.anova.kwPosthoc,
      inner: optionalIndex(anova.inner, d.anova.inner ?? -1, width),
      alpha: Math.min(0.5, Math.max(1e-6, finite(anova.alpha, d.anova.alpha ?? 0.05))),
    },
    reg: {
      dep: index(reg.dep, d.reg.dep, width),
      indeps: indexList(reg.indeps, d.reg.indeps, width),
      useNonParam: bool(reg.useNonParam, d.reg.useNonParam),
      robustEstimator: text(reg.robustEstimator, d.reg.robustEstimator),
      robustSE: reg.robustSE === 'HC1' || reg.robustSE === 'HC3' ? reg.robustSE : d.reg.robustSE,
      mode:
        reg.mode === 'selection' || reg.mode === 'polynomial' || reg.mode === 'penalized'
          ? reg.mode
          : 'linear',
      degree: Math.min(12, Math.max(1, Math.round(finite(reg.degree, d.reg.degree ?? 2)))),
      selectionDirection:
        reg.selectionDirection === 'forward' || reg.selectionDirection === 'backward'
          ? reg.selectionDirection
          : d.reg.selectionDirection ?? 'both',
      selectionCriterion:
        reg.selectionCriterion === 'aic' ||
        reg.selectionCriterion === 'adjR2' ||
        reg.selectionCriterion === 'r2' ||
        reg.selectionCriterion === 'cp' ||
        reg.selectionCriterion === 'p'
          ? reg.selectionCriterion
          : d.reg.selectionCriterion ?? 'bic',
      penalty:
        reg.penalty === 'ridge' || reg.penalty === 'elasticnet' || reg.penalty === 'lasso'
          ? reg.penalty
          : d.reg.penalty ?? 'lasso',
      lambda: Math.max(0, finite(reg.lambda, d.reg.lambda ?? 0.1)),
      penaltyAlpha: Math.min(1, Math.max(0, finite(reg.penaltyAlpha, d.reg.penaltyAlpha ?? 0.5))),
    },
    corr: {
      vars: indexList(corr.vars, d.corr.vars, width),
      method: text(corr.method, d.corr.method),
      showSpearman: bool(corr.showSpearman, d.corr.showSpearman),
      showKendall: bool(corr.showKendall, d.corr.showKendall),
    },
    chisq: {
      mode: chisq.mode === 'gof' ? 'gof' : d.chisq.mode,
      gofVariable: index(chisq.gofVariable, d.chisq.gofVariable, width),
      gofExpected: text(chisq.gofExpected, d.chisq.gofExpected),
      row1col1: finite(chisq.row1col1, d.chisq.row1col1),
      row1col2: finite(chisq.row1col2, d.chisq.row1col2),
      row2col1: finite(chisq.row2col1, d.chisq.row2col1),
      row2col2: finite(chisq.row2col2, d.chisq.row2col2),
      row1Label: text(chisq.row1Label, d.chisq.row1Label),
      row2Label: text(chisq.row2Label, d.chisq.row2Label),
      col1Label: text(chisq.col1Label, d.chisq.col1Label),
      col2Label: text(chisq.col2Label, d.chisq.col2Label),
      runFisherExact: bool(chisq.runFisherExact, d.chisq.runFisherExact),
    },
    samplesize: {
      design: parseSampleSizeDesign(samplesize.design, d.samplesize.design),
      alpha: finite(samplesize.alpha, d.samplesize.alpha),
      power: finite(samplesize.power, d.samplesize.power),
      delta: finite(samplesize.delta, d.samplesize.delta),
      sd: finite(samplesize.sd, d.samplesize.sd),
      p1: finite(samplesize.p1, d.samplesize.p1),
      p2: finite(samplesize.p2, d.samplesize.p2),
      r: finite(samplesize.r, d.samplesize.r),
      groups: integer(samplesize.groups, d.samplesize.groups),
      f: finite(samplesize.f, d.samplesize.f),
      margin: finite(samplesize.margin, d.samplesize.margin),
      hazardRatio: finite(samplesize.hazardRatio, d.samplesize.hazardRatio),
      ratio: Math.max(1e-9, finite(samplesize.ratio, d.samplesize.ratio)),
      eventRate: finite(samplesize.eventRate, d.samplesize.eventRate),
    },
    distfit: {
      mode: distfit.mode === 'ks' ? 'ks' : d.distfit.mode,
      variable: index(distfit.variable, d.distfit.variable, width),
      group: optionalIndex(distfit.group, d.distfit.group, width),
      selected: parseDistributionList(distfit.selected, d.distfit.selected),
    },
    logistic: {
      outcome: logisticOutcome,
      predictors: indexList(logistic.predictors, d.logistic.predictors, width).filter(
        (value) => value !== logisticOutcome
      ),
      cutoff: finite(logistic.cutoff, d.logistic.cutoff),
      penalized: bool(logistic.penalized, d.logistic.penalized),
      link: logistic.link === 'probit' ? 'probit' : 'logit',
    },
    cox: {
      timeVariable: coxTime,
      eventVariable: coxEvent,
      covariates: indexList(cox.covariates, d.cox.covariates, width).filter(
        (value) => value !== coxTime && value !== coxEvent
      ),
    },
    survival: {
      timeVariable: index(survival.timeVariable, d.survival.timeVariable, width),
      eventVariable: index(survival.eventVariable, d.survival.eventVariable, width),
      groupVariable: optionalIndex(survival.groupVariable, d.survival.groupVariable, width),
    },
    timeseries: {
      variable: index(timeseries.variable, d.timeseries.variable, width),
      period: integer(timeseries.period, d.timeseries.period),
      horizon: integer(timeseries.horizon, d.timeseries.horizon),
      differenceMode: parseDifferenceMode(timeseries.differenceMode, d.timeseries.differenceMode),
      seasonalDifferenceMode: parseSeasonalDifferenceMode(
        timeseries.seasonalDifferenceMode,
        d.timeseries.seasonalDifferenceMode
      ),
    },
    contingency: {
      rows: contingencyRows,
      cols: contingencyCols,
      values: contingency
        ? parseContingencyValues(contingency.values, contingencyRows, contingencyCols)
        : d.contingency.values.map((row) => [...row]),
      exact: contingency ? bool(contingency.exact, d.contingency.exact) : d.contingency.exact,
      monteCarlo: contingency
        ? bool(contingency.monteCarlo, d.contingency.monteCarlo)
        : d.contingency.monteCarlo,
    },
    ancova: {
      response: ancovaResponse,
      factor: ancovaFactor,
      covariates: indexList(ancova.covariates, d.ancova.covariates, width).filter(
        (value) => value !== ancovaResponse && value !== ancovaFactor
      ),
    },
    factorial: {
      response: index(factorial.response, d.factorial.response, width),
      factorA: index(factorial.factorA, d.factorial.factorA, width),
      factorB: index(factorial.factorB, d.factorial.factorB, width),
      interaction: bool(factorial.interaction, d.factorial.interaction),
    },
    repeatedanova: {
      selected: indexList(repeatedanova.selected, d.repeatedanova.selected, width),
    },
    multivariate: {
      mode:
        multivariate.mode === 'alpha' || multivariate.mode === 'efa'
          ? multivariate.mode
          : d.multivariate.mode,
      standardize: bool(multivariate.standardize, d.multivariate.standardize),
      selected: indexList(multivariate.selected, d.multivariate.selected, width),
      factors: Math.max(0, integer(multivariate.factors, d.multivariate.factors)),
      rotation: multivariate.rotation === 'none' ? 'none' : d.multivariate.rotation,
    },
    nonparamrm: {
      mode:
        nonparamrm.mode === 'mcnemar' || nonparamrm.mode === 'cochran' || nonparamrm.mode === 'jonckheere'
          ? nonparamrm.mode
          : d.nonparamrm.mode,
      selected: indexList(nonparamrm.selected, d.nonparamrm.selected, width),
      left: index(nonparamrm.left, d.nonparamrm.left, width),
      right: index(nonparamrm.right, d.nonparamrm.right, width),
      outcome: index(nonparamrm.outcome, d.nonparamrm.outcome, width),
      group: index(nonparamrm.group, d.nonparamrm.group, width),
    },
    tdcox: {
      start: index(tdcox.start, d.tdcox.start, width),
      stop: index(tdcox.stop, d.tdcox.stop, width),
      event: index(tdcox.event, d.tdcox.event, width),
      covariates: indexList(tdcox.covariates, d.tdcox.covariates, width),
    },
    stratcox: {
      time: index(stratcox.time, d.stratcox.time, width),
      event: index(stratcox.event, d.stratcox.event, width),
      covariates: indexList(stratcox.covariates, d.stratcox.covariates, width),
      stratum: optionalIndex(stratcox.stratum, d.stratcox.stratum, width),
    },
    gee: {
      dep: index(gee.dep, d.gee.dep, width),
      indeps: indexList(gee.indeps, d.gee.indeps, width),
      cluster: index(gee.cluster, d.gee.cluster, width),
      family: gee.family === 'binomial' ? 'binomial' : d.gee.family,
      correlation: gee.correlation === 'independence' ? 'independence' : d.gee.correlation,
    },
    resampling: {
      outcome: index(resampling.outcome, d.resampling.outcome, width),
      group: index(resampling.group, d.resampling.group, width),
      statistic: resampling.statistic === 'median' ? 'median' : d.resampling.statistic,
      permutations: Math.max(99, Math.min(50000, integer(resampling.permutations, d.resampling.permutations))),
      bootstrap: Math.max(99, Math.min(50000, integer(resampling.bootstrap, d.resampling.bootstrap))),
    },
    parametric: {
      time: index(parametric.time, d.parametric.time, width),
      event: index(parametric.event, d.parametric.event, width),
      predictors: indexList(parametric.predictors, d.parametric.predictors, width),
      distribution: parametric.distribution === 'exponential' ? 'exponential' : d.parametric.distribution,
    },
    mixedanova: {
      group: index(mixedanova.group, d.mixedanova.group, width),
      conditions: indexList(mixedanova.conditions, d.mixedanova.conditions, width),
    },
    mi: {
      variables: indexList(mi.variables, d.mi.variables, width),
      imputations: Math.max(2, Math.min(50, integer(mi.imputations, d.mi.imputations))),
      iterations: Math.max(1, Math.min(50, integer(mi.iterations, d.mi.iterations))),
      model: mi.model === 'linear' ? 'linear' : d.mi.model,
      outcome: index(mi.outcome, d.mi.outcome, width),
      predictors: indexList(mi.predictors, d.mi.predictors, width),
    },
    ordinal: {
      dep: index(ordinal.dep, d.ordinal.dep, width),
      indeps: indexList(ordinal.indeps, d.ordinal.indeps, width),
    },
    lmm: {
      dep: index(lmm.dep, d.lmm.dep, width),
      indeps: indexList(lmm.indeps, d.lmm.indeps, width),
      group: index(lmm.group, d.lmm.group, width),
      randomSlope: bool(lmm.randomSlope, d.lmm.randomSlope ?? false),
    },
    glmm: (() => {
      const family =
        glmm.family === 'binomial' || glmm.family === 'poisson' ? glmm.family : 'gaussian';
      const dep = index(glmm.dep, d.glmm.dep, width);
      const group = index(glmm.group, d.glmm.group, width);
      const rawSlope = optionalIndex(glmm.slope, d.glmm.slope, width);
      return {
        dep,
        indeps: indexList(glmm.indeps, d.glmm.indeps, width).filter(
          (value) => value !== dep && value !== group
        ),
        group,
        family,
        link: (family === 'binomial' ? 'logit' : family === 'poisson' ? 'log' : 'identity') as
          | 'identity'
          | 'logit'
          | 'log',
        slope: rawSlope === dep || rawSlope === group ? -1 : rawSlope,
      };
    })(),
    pls: {
      dep: index(pls.dep, d.pls.dep, width),
      indeps: indexList(pls.indeps, d.pls.indeps, width).filter(
        (value) => value !== index(pls.dep, d.pls.dep, width)
      ),
      components: Math.max(1, Math.min(20, integer(pls.components, d.pls.components))),
      cvFolds: Math.max(0, Math.min(20, integer(pls.cvFolds, d.pls.cvFolds))),
    },
    mars: {
      dep: index(mars.dep, d.mars.dep, width),
      indeps: indexList(mars.indeps, d.mars.indeps, width).filter(
        (value) => value !== index(mars.dep, d.mars.dep, width)
      ),
      degree: mars.degree === 2 ? 2 : 1,
      maxTerms: Math.max(1, Math.min(200, integer(mars.maxTerms, d.mars.maxTerms))),
      penalty: Math.max(0, finite(mars.penalty, d.mars.penalty)),
      prune: bool(mars.prune, d.mars.prune),
    },
    iv: {
      dep: index(iv.dep, d.iv.dep, width),
      endog: indexList(iv.endog, d.iv.endog, width),
      instruments: indexList(iv.instruments, d.iv.instruments, width),
      exog: indexList(iv.exog, d.iv.exog, width),
      robust: bool(iv.robust, d.iv.robust),
    },
    panel: {
      dep: index(panel.dep, d.panel.dep, width),
      indeps: indexList(panel.indeps, d.panel.indeps, width),
      entity: index(panel.entity, d.panel.entity, width),
      time: index(panel.time, d.panel.time, width),
      model:
        panel.model === 'fe' || panel.model === 're' ? panel.model : d.panel.model,
    },
    selection: {
      mode: selection.mode === 'heckman' ? 'heckman' : d.selection.mode,
      dep: index(selection.dep, d.selection.dep, width),
      indeps: indexList(selection.indeps, d.selection.indeps, width),
      lower: finite(selection.lower, d.selection.lower),
      upper:
        typeof selection.upper === 'number' && Number.isFinite(selection.upper)
          ? selection.upper
          : null,
      selection: optionalIndex(selection.selection, d.selection.selection, width),
      selectIndeps: indexList(selection.selectIndeps, d.selection.selectIndeps, width),
    },
    mediation: {
      outcome: index(mediation.outcome, d.mediation.outcome, width),
      predictor: index(mediation.predictor, d.mediation.predictor, width),
      mediator: index(mediation.mediator, d.mediation.mediator, width),
      covariates: indexList(mediation.covariates, d.mediation.covariates, width),
      bootstrap: Math.max(0, Math.min(5000, integer(mediation.bootstrap, d.mediation.bootstrap))),
      seed: integer(mediation.seed, d.mediation.seed),
    },
    propensity: {
      treatment: index(propensity.treatment, d.propensity.treatment, width),
      outcome: index(propensity.outcome, d.propensity.outcome, width),
      covariates: indexList(propensity.covariates, d.propensity.covariates, width),
      method: propensity.method === 'ipw' ? 'ipw' : d.propensity.method,
      caliper: Math.max(0, finite(propensity.caliper, d.propensity.caliper)),
      ratio: Math.max(1, Math.min(10, integer(propensity.ratio, d.propensity.ratio))),
    },
    countreg: {
      dep: index(countreg.dep, d.countreg.dep, width),
      indeps: indexList(countreg.indeps, d.countreg.indeps, width),
      family: countreg.family === 'negbin' ? 'negbin' : d.countreg.family,
    },
    agreement: {
      mode:
        agreement.mode === 'bland' || agreement.mode === 'kappa' ? agreement.mode : d.agreement.mode,
      columns: indexList(agreement.columns, d.agreement.columns, width),
      weight:
        agreement.weight === 'linear' || agreement.weight === 'quadratic'
          ? agreement.weight
          : d.agreement.weight,
    },
    tost: {
      design:
        tost.design === 'paired' || tost.design === 'ind' ? tost.design : d.tost.design,
      var1: index(tost.var1, d.tost.var1, width),
      var2: index(tost.var2, d.tost.var2, width),
      mu: finite(tost.mu, d.tost.mu),
      margin: finite(tost.margin, d.tost.margin),
      equalVar: bool(tost.equalVar, d.tost.equalVar),
    },
    wizard: {
      goal: parseWizardGoal(wizard.goal, d.wizard.goal),
      outcome: optionalIndex(wizard.outcome, d.wizard.outcome, width),
      group: optionalIndex(wizard.group, d.wizard.group, width),
      second: optionalIndex(wizard.second, d.wizard.second, width),
      paired: bool(wizard.paired, d.wizard.paired),
    },
    partition: {
      response: index(partition.response, d.partition.response, width),
      predictors: indexList(partition.predictors, d.partition.predictors, width),
      maxDepth: Math.max(1, Math.min(6, integer(partition.maxDepth, d.partition.maxDepth))),
      minSplit: Math.max(2, Math.min(50, integer(partition.minSplit, d.partition.minSplit))),
    },
    quality: {
      mode:
        quality.mode === 'capability' ||
        quality.mode === 'pareto' ||
        quality.mode === 'variability' ||
        quality.mode === 'tolerance' ||
        quality.mode === 'cusum'
          ? quality.mode
          : d.quality.mode,
      variable: index(quality.variable, d.quality.variable, width),
      category: index(quality.category, d.quality.category, width),
      group: optionalIndex(quality.group, d.quality.group, width),
      chart:
        quality.chart === 'individuals' || quality.chart === 'ewma'
          ? quality.chart
          : d.quality.chart,
      subgroup: Math.max(2, Math.min(10, integer(quality.subgroup, d.quality.subgroup))),
      lsl: finite(quality.lsl, d.quality.lsl),
      usl: finite(quality.usl, d.quality.usl),
      target: finite(quality.target, d.quality.target),
      toleranceP: Math.max(0.5, Math.min(0.9999, finite(quality.toleranceP, d.quality.toleranceP))),
    },
    cluster: {
      selected: indexList(cluster.selected, d.cluster.selected, width),
      method:
        cluster.method === 'complete' || cluster.method === 'single' || cluster.method === 'ward'
          ? cluster.method
          : d.cluster.method,
      clusters: Math.max(0, Math.min(20, integer(cluster.clusters, d.cluster.clusters))),
      standardize: bool(cluster.standardize, d.cluster.standardize),
    },
    discriminant: {
      mode: discriminant.mode === 'mancova' ? 'mancova' : 'classic',
      group: index(discriminant.group, d.discriminant.group, width),
      predictors: indexList(discriminant.predictors, d.discriminant.predictors, width),
      covariates: indexList(
        discriminant.covariates,
        d.discriminant.covariates ?? [],
        width
      ),
    },
    doe: {
      response: index(doe.response, d.doe.response, width),
      factorA: index(doe.factorA, d.doe.factorA, width),
      factorB: index(doe.factorB, d.doe.factorB, width),
      model: doe.model === 'linear' ? 'linear' : d.doe.model,
    },
  };
};

export const parseSettings = (value: unknown): ProjectSettings => {
  const raw = isRecord(value) ? value : {};
  const ci = finite(raw.ciLevel, DEFAULT_SETTINGS.ciLevel);
  const activeTab = raw.activeTab;
  const customThemes = normalizeCustomThemes(raw.customThemes);
  return {
    ciLevel: ci === 90 || ci === 95 || ci === 99 ? ci : DEFAULT_SETTINGS.ciLevel,
    activeAnalysis: text(raw.activeAnalysis, DEFAULT_SETTINGS.activeAnalysis),
    activeTab:
      activeTab === 'analysis' || activeTab === 'settings' || activeTab === 'data' || activeTab === 'help'
        ? activeTab
        : DEFAULT_SETTINGS.activeTab,
    uiMode: raw.uiMode === 'expert' ? 'expert' : 'guided',
    // Optional in projects saved before the theme registry existed; custom ids
    // are validated against the themes carried by the same project.
    theme: resolveThemeId(raw.theme, customThemes),
    customThemes,
    // Locales are optional: projects saved before multilingual support keep working.
    uiLocale: isActiveLocale(raw.uiLocale) ? raw.uiLocale : DEFAULT_SETTINGS.uiLocale,
    reportLocale: isLocale(raw.reportLocale) ? raw.reportLocale : DEFAULT_SETTINGS.reportLocale,
    helpLocale: isHelpLocale(raw.helpLocale) ? raw.helpLocale : DEFAULT_SETTINGS.helpLocale,
    chartDefaults: normalizeChartDefaults(raw.chartDefaults),
    chartPresets: normalizeChartPresets(raw.chartPresets),
    chartStyles: normalizeUserStyles(raw.chartStyles),
    chartStyleDefaults: normalizeStyleMap(raw.chartStyleDefaults),
    chartStyleOverrides: normalizeStyleOverrides(raw.chartStyleOverrides),
    hiddenChartGroups: normalizeHiddenChartGroups(raw.hiddenChartGroups),
    outputAppearance: normalizeOutputAppearance(raw.outputAppearance),
  };
};

const normalizeHiddenChartGroups = (
  value: unknown
): Record<string, ChartOutputGroup[]> => {
  if (!isRecord(value)) return {};
  const result: Record<string, ChartOutputGroup[]> = {};
  for (const [analysisId, groups] of Object.entries(value)) {
    if (!Array.isArray(groups) || analysisId.length === 0) continue;
    const clean = Array.from(
      new Set(
        groups.filter(
          (group): group is ChartOutputGroup =>
            group === 'recommended' || group === 'diagnostic'
        )
      )
    );
    if (clean.length > 0) result[analysisId] = clean;
  }
  return result;
};


/** Style id per kind: a bounded string, unknown kinds are dropped. */
const normalizeStyleMap = (value: unknown): Partial<Record<string, string>> => {
  const result: Partial<Record<string, string>> = {};
  if (!isRecord(value)) return result;
  for (const [kind, styleId] of Object.entries(value)) {
    if (typeof styleId !== 'string' || styleId.length === 0 || styleId.length > 48) continue;
    result[kind] = styleId;
  }
  return result;
};

const normalizeStyleOverrides = (value: unknown): Record<string, Partial<Record<string, string>>> => {
  if (!isRecord(value)) return {};
  const result: Record<string, Partial<Record<string, string>>> = {};
  for (const [analysisId, map] of Object.entries(value)) {
    if (analysisId.length === 0 || analysisId.length > 48 || !isRecord(map)) continue;
    const clean = normalizeStyleMap(map);
    if (Object.keys(clean).length > 0) result[analysisId] = clean;
  }
  return result;
};
