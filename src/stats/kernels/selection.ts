/**
 * Variable selection for linear regression: exhaustive best subsets and
 * forward/backward/both stepwise search.
 *
 * Both procedures share the OLS core and report the same fit statistics, so a
 * selected model can be handed back to `regressionStats` without surprises.
 * Exhaustive enumeration is capped because it is exponential in the number of
 * candidate predictors.
 */
import { fSF } from '../distributions';
import { fitOls } from './regression';

export type SelectionCriterion = 'aic' | 'bic' | 'adjR2' | 'r2' | 'cp' | 'p';
export type StepwiseDirection = 'forward' | 'backward' | 'both';

export interface SubsetModel {
  variables: number[];
  k: number;
  sse: number;
  r2: number;
  adjR2: number;
  aic: number;
  bic: number;
  cp: number;
  /** Smallest two-sided p-value among the added coefficients. */
  p: number;
}

export interface StepwiseStep {
  step: number;
  action: 'start' | 'add' | 'remove' | 'stop';
  variable: number | null;
  sse: number;
  r2: number;
  adjR2: number;
  aic: number;
  bic: number;
  p: number;
  /** Criterion value that justified the move (NaN for start/stop). */
  value: number;
}

export interface StepwiseResult {
  direction: StepwiseDirection;
  criterion: SelectionCriterion;
  selected: number[];
  steps: StepwiseStep[];
  model: SubsetModel;
}

const MAX_SUBSET_PREDICTORS = 12;
const DEFAULT_MAX_VARIABLES = 8;

interface Fit {
  model: SubsetModel;
  p: number[];
}

const fitSubset = (y: number[], predictors: number[][], variables: number[]): Fit | null => {
  const n = y.length;
  const p = variables.length + 1;
  if (p >= n) return null;

  const design = y.map((_, row) => [1, ...variables.map(index => predictors[index][row])]);
  const fit = fitOls(y, design);
  if (!fit) return null;

  const aic = n * Math.log(fit.sse / n) + 2 * p;
  const bic = n * Math.log(fit.sse / n) + Math.log(n) * p;
  const adjR2 = 1 - (1 - fit.r2) * ((n - 1) / fit.df);
  const pValues = fit.pValues.slice(1);
  return {
    model: {
      variables: [...variables].sort((left, right) => left - right),
      k: variables.length,
      sse: fit.sse,
      r2: fit.r2,
      adjR2,
      aic,
      bic,
      cp: NaN,
      p: pValues.length > 0 ? Math.min(...pValues) : NaN,
    },
    p: pValues,
  };
};

const fullModelMse = (y: number[], predictors: number[][]): number => {
  const n = y.length;
  const p = predictors.length + 1;
  if (predictors.length === 0 || p >= n) return NaN;
  const design = y.map((_, row) => [1, ...predictors.map(values => values[row])]);
  const fit = fitOls(y, design);
  return fit && fit.df > 0 ? fit.mse : NaN;
};

const withCp = (model: SubsetModel, n: number, mseFull: number): SubsetModel => ({
  ...model,
  cp: mseFull > 0 ? model.sse / mseFull - (n - 2 * (model.k + 1)) : NaN,
});

const better = (candidate: SubsetModel, incumbent: SubsetModel, criterion: SelectionCriterion): boolean => {
  switch (criterion) {
    case 'aic':
      return candidate.aic < incumbent.aic;
    case 'bic':
      return candidate.bic < incumbent.bic;
    case 'adjR2':
      return candidate.adjR2 > incumbent.adjR2;
    case 'r2':
      return candidate.r2 > incumbent.r2;
    case 'cp':
      return candidate.cp < incumbent.cp;
    case 'p':
      return candidate.p < incumbent.p;
    default:
      return false;
  }
};

const combinations = (size: number, count: number): number[][] => {
  const result: number[][] = [];
  const current: number[] = [];
  const walk = (start: number): void => {
    if (current.length === size) {
      result.push([...current]);
      return;
    }
    for (let index = start; index < count; index += 1) {
      current.push(index);
      walk(index + 1);
      current.pop();
    }
  };
  walk(0);
  return result;
};

/**
 * Best model of each size 1..maxVariables ranked by the chosen criterion, plus
 * the full model when it is estimable. `null` when the data are unusable.
 */
export const bestSubsets = (
  y: number[],
  predictors: number[][],
  criterion: SelectionCriterion = 'bic',
  maxVariables = DEFAULT_MAX_VARIABLES
): SubsetModel[] | null => {
  const n = y.length;
  if (n === 0 || predictors.length === 0) return null;
  if (predictors.some(values => values.length !== n)) return null;
  const k = Math.min(predictors.length, MAX_SUBSET_PREDICTORS, Math.max(1, maxVariables));
  const mseFull = fullModelMse(y, predictors);

  const bestBySize: SubsetModel[] = [];
  for (let size = 1; size <= k; size += 1) {
    if (size + 1 >= n) break;
    let best: SubsetModel | null = null;
    for (const variables of combinations(size, predictors.length)) {
      const fit = fitSubset(y, predictors, variables);
      if (!fit) continue;
      const model = withCp(fit.model, n, mseFull);
      if (!best || better(model, best, criterion)) best = model;
    }
    if (best) bestBySize.push(best);
  }

  if (predictors.length + 1 < n) {
    const full = fitSubset(y, predictors, predictors.map((_, index) => index));
    const alreadyListed = full
      ? bestBySize.some(
          model =>
            model.variables.length === full.model.variables.length &&
            model.variables.every((value, index) => value === full.model.variables[index])
        )
      : true;
    if (full && !alreadyListed) bestBySize.push(withCp(full.model, n, mseFull));
  }

  return bestBySize.length > 0 ? bestBySize : null;
};

/**
 * Greedy forward, backward or both-directions selection. For `criterion: 'p'`
 * a variable enters while its two-sided p-value is below `level` (and leaves
 * when it is above), matching the usual stepwise convention.
 */
export const stepwiseSelection = (
  y: number[],
  predictors: number[][],
  direction: StepwiseDirection = 'both',
  criterion: SelectionCriterion = 'bic',
  level = 5,
  maxSteps = 50
): StepwiseResult | null => {
  const n = y.length;
  if (n === 0 || predictors.length === 0) return null;
  if (predictors.some(values => values.length !== n)) return null;
  if (predictors.length + 1 >= n) return null;

  const alpha = level / 100;
  const mseFull = fullModelMse(y, predictors);
  const steps: StepwiseStep[] = [];
  const all = predictors.map((_, index) => index);
  let selected: number[] = direction === 'forward' ? [] : [...all];

  const snapshot = (fit: Fit | null): { sse: number; r2: number; adjR2: number; aic: number; bic: number; p: number } =>
    fit
      ? {
          sse: fit.model.sse,
          r2: fit.model.r2,
          adjR2: fit.model.adjR2,
          aic: fit.model.aic,
          bic: fit.model.bic,
          p: fit.model.p,
        }
      : { sse: NaN, r2: NaN, adjR2: NaN, aic: NaN, bic: NaN, p: NaN };

  const currentFit = (): Fit | null => fitSubset(y, predictors, selected);

  const startFit = currentFit();
  steps.push({ step: 0, action: 'start', variable: null, ...snapshot(startFit), value: NaN });

  const criterionValue = (model: SubsetModel): number => {
    switch (criterion) {
      case 'aic':
        return model.aic;
      case 'bic':
        return model.bic;
      case 'adjR2':
        return model.adjR2;
      case 'r2':
        return model.r2;
      case 'cp':
        return model.cp;
      case 'p':
        return model.p;
      default:
        return NaN;
    }
  };

  const improves = (candidate: SubsetModel, incumbent: SubsetModel | null): boolean => {
    if (criterion === 'p') return candidate.p < alpha;
    if (!incumbent) return true;
    return better(candidate, incumbent, criterion);
  };

  const bestAdd = (): { variable: number; model: SubsetModel } | null => {
    let best: { variable: number; model: SubsetModel } | null = null;
    const remaining = all.filter(index => !selected.includes(index));
    for (const variable of remaining) {
      const fit = fitSubset(y, predictors, [...selected, variable]);
      if (!fit) continue;
      const model = withCp(fit.model, n, mseFull);
      if (!best || better(model, best.model, criterion)) best = { variable, model };
    }
    return best;
  };

  const bestRemove = (): { variable: number; model: SubsetModel } | null => {
    let best: { variable: number; model: SubsetModel } | null = null;
    for (const variable of selected) {
      const trial = selected.filter(index => index !== variable);
      const fit = fitSubset(y, predictors, trial);
      if (!fit) continue;
      const model = withCp(fit.model, n, mseFull);
      const improvesBest =
        !best ||
        (criterion === 'p' ? model.p > best.model.p : better(model, best.model, criterion));
      if (improvesBest) best = { variable, model };
    }
    return best;
  };

  const addStep = (variable: number | null, action: 'add' | 'remove', fit: Fit | null, value: number): void => {
    steps.push({ step: steps.length, action, variable, ...snapshot(fit), value });
  };

  let guard = 0;
  while (guard < maxSteps) {
    guard += 1;
    const incumbentFit = currentFit();
    const incumbent = incumbentFit ? withCp(incumbentFit.model, n, mseFull) : null;

    if (direction === 'forward' || direction === 'both') {
      if (selected.length < predictors.length) {
        const add = bestAdd();
        if (add && improves(add.model, incumbent)) {
          selected = [...selected, add.variable].sort((left, right) => left - right);
          addStep(add.variable, 'add', currentFit(), criterionValue(add.model));
          continue;
        }
      }
      if (direction === 'forward') break;
    }

    if (direction === 'backward' || direction === 'both') {
      if (selected.length > 0) {
        const remove = bestRemove();
        const candidate = remove?.model ?? null;
        const shouldRemove =
          candidate !== null &&
          (criterion === 'p'
            ? candidate.p > alpha
            : incumbent !== null && better(candidate, incumbent, criterion));
        if (shouldRemove && remove) {
          selected = selected.filter(index => index !== remove.variable);
          addStep(remove.variable, 'remove', currentFit(), criterionValue(candidate));
          continue;
        }
      }
      if (direction === 'backward') break;
    }
    break;
  }

  const finalFit = currentFit() ?? fitSubset(y, predictors, []);
  if (!finalFit) return null;
  const model = withCp(finalFit.model, n, mseFull);
  steps.push({ step: steps.length, action: 'stop', variable: null, ...snapshot(finalFit), value: criterionValue(model) });

  return { direction, criterion, selected: [...selected].sort((left, right) => left - right), steps, model };
};

/** Full-model F statistic kept here for symmetry with `regressionStats`. */
export const selectionF = (model: SubsetModel, n: number): { f: number; p: number } => {
  if (model.k === 0 || model.sse <= 0) return { f: NaN, p: NaN };
  const df = n - model.k - 1;
  if (df <= 0) return { f: NaN, p: NaN };
  const sst = model.sse / Math.max(1e-12, 1 - model.r2);
  const msRegression = (sst - model.sse) / model.k;
  const f = msRegression / (model.sse / df);
  return { f, p: fSF(f, model.k, df) };
};

