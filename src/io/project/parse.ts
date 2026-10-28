import type { CategoryLevel, ColType, GridData } from '../../grid/types';
import { COL_TYPES, MAX_LEVELS } from '../../grid/types';
import { MAX_COLS, MAX_ROWS } from '../readers';
import type { SampleSizeDesign } from '../../stats/samplesize';
import type { DistributionName } from '../../stats/distfit';
import type { WizardGoal } from '../../stats/wizard';
import {
  DEFAULT_PARAMS, DEFAULT_SETTINGS,
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
    return {
      name,
      type: parseType(record.type),
      ...(levels ? { levels } : {}),
      ...(reference ? { reference } : {}),
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
  const parametric = isRecord(raw.parametric) ? raw.parametric : {};
  const mixedanova = isRecord(raw.mixedanova) ? raw.mixedanova : {};
  const mi = isRecord(raw.mi) ? raw.mi : {};
  const ordinal = isRecord(raw.ordinal) ? raw.ordinal : {};
  const lmm = isRecord(raw.lmm) ? raw.lmm : {};
  const countreg = isRecord(raw.countreg) ? raw.countreg : {};
  const agreement = isRecord(raw.agreement) ? raw.agreement : {};
  const tost = isRecord(raw.tost) ? raw.tost : {};
  const wizard = isRecord(raw.wizard) ? raw.wizard : {};
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
    ttest: {
      type: ttest.type === 'ind' || ttest.type === 'dep' || ttest.type === 'one' ? ttest.type : d.ttest.type,
      var1: index(ttest.var1, d.ttest.var1, width),
      var2: index(ttest.var2, d.ttest.var2, width),
      mu: finite(ttest.mu, d.ttest.mu),
      useNonParam: bool(ttest.useNonParam, d.ttest.useNonParam),
      equalVar: bool(ttest.equalVar, d.ttest.equalVar),
    },
    anova: {
      dep: index(anova.dep, d.anova.dep, width),
      grp: index(anova.grp, d.anova.grp, width),
      posthoc: text(anova.posthoc, d.anova.posthoc),
      useNonParam: bool(anova.useNonParam, d.anova.useNonParam),
      kwPosthoc:
        anova.kwPosthoc === 'none' || anova.kwPosthoc === 'bonferroni' || anova.kwPosthoc === 'holm' || anova.kwPosthoc === 'fdr'
          ? anova.kwPosthoc
          : d.anova.kwPosthoc,
    },
    reg: {
      dep: index(reg.dep, d.reg.dep, width),
      indeps: indexList(reg.indeps, d.reg.indeps, width),
      useNonParam: bool(reg.useNonParam, d.reg.useNonParam),
      robustEstimator: text(reg.robustEstimator, d.reg.robustEstimator),
      robustSE: reg.robustSE === 'HC1' || reg.robustSE === 'HC3' ? reg.robustSE : d.reg.robustSE,
    },
    corr: {
      vars: indexList(corr.vars, d.corr.vars, width),
      method: text(corr.method, d.corr.method),
      showSpearman: bool(corr.showSpearman, d.corr.showSpearman),
      showKendall: bool(corr.showKendall, d.corr.showKendall),
    },
    chisq: {
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
    },
    distfit: {
      variable: index(distfit.variable, d.distfit.variable, width),
      selected: parseDistributionList(distfit.selected, d.distfit.selected),
    },
    logistic: {
      outcome: logisticOutcome,
      predictors: indexList(logistic.predictors, d.logistic.predictors, width).filter(
        (value) => value !== logisticOutcome
      ),
      cutoff: finite(logistic.cutoff, d.logistic.cutoff),
      penalized: bool(logistic.penalized, d.logistic.penalized),
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
    },
    ordinal: {
      dep: index(ordinal.dep, d.ordinal.dep, width),
      indeps: indexList(ordinal.indeps, d.ordinal.indeps, width),
    },
    lmm: {
      dep: index(lmm.dep, d.lmm.dep, width),
      indeps: indexList(lmm.indeps, d.lmm.indeps, width),
      group: index(lmm.group, d.lmm.group, width),
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
  };
};

export const parseSettings = (value: unknown): ProjectSettings => {
  const raw = isRecord(value) ? value : {};
  const ci = finite(raw.ciLevel, DEFAULT_SETTINGS.ciLevel);
  const activeTab = raw.activeTab;
  return {
    ciLevel: ci === 90 || ci === 95 || ci === 99 ? ci : DEFAULT_SETTINGS.ciLevel,
    activeAnalysis: text(raw.activeAnalysis, DEFAULT_SETTINGS.activeAnalysis),
    activeTab:
      activeTab === 'analysis' || activeTab === 'settings' || activeTab === 'data' || activeTab === 'help'
        ? activeTab
        : DEFAULT_SETTINGS.activeTab,
  };
};

