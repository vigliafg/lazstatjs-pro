/**
 * Multivariate Adaptive Regression Splines (MARS / GAM-MARS).
 *
 * The kernel follows Friedman's MARS with the forward/backward structure used
 * by the R package `earth`:
 *
 * - basis functions are hinge pairs `h(x - t) = max(0, x - t)` and
 *   `h(t - x) = max(0, t - x)`; the intercept is always the first term;
 * - the forward pass adds one hinge pair at a time (or a linear main effect
 *   when the predictor has not entered yet), choosing the pair with the largest
 *   RSS reduction;
 * - candidate knots are the same order-statistic grid used by earth: every
 *   `minspan`-th ordered observation after an `endspan` guard.  With the
 *   default automatic spans this is exactly earth's `FindKnot` grid, not every
 *   observed value;
 * - `degree = 2` additionally allows products between an existing basis and a
 *   new hinge, as long as the resulting term uses a predictor at most once.
 *   This keeps the implementation documented and predictable;
 * - the optional backward pass removes the term whose removal increases the
 *   RSS least, records the GCV of every subset, and keeps the subset with the
 *   minimum GCV.
 *
 * GCV uses earth's parameterisation, which penalises knots rather than terms:
 *
 *   nKnots = (p - 1) / 2
 *   cost   = (p + penalty * nKnots) / n
 *   GCV    = (RSS / n) / (1 - cost)^2        (Infinity when cost >= 1)
 *
 * where `p` is the number of basis coefficients (intercept included).  This is
 * the formula behind earth's `$gcv`; the simplified `penalty * p / n` form
 * over-penalises every hinge pair and would not reproduce the reference.
 *
 * `null` means invalid input, a singular design or a fit that could not be
 * estimated: the caller never receives a silent partial answer.
 */

import { solveLinear } from './matrix';

const EPS = 1e-12;
const DEFAULT_MAX_TERMS = 21;

/** One hinge factor of a basis function. */
export interface MarsHinge {
  /** Zero-based predictor index. */
  predictor: number;
  /** Knot at an observed value of the predictor. */
  knot: number;
  /** +1 for `max(0, x - t)`, -1 for `max(0, t - x)`. */
  side: 1 | -1;
}

/** One basis function and its estimated coefficient. */
export interface MarsTerm {
  /** Compact name, e.g. `h(disp-140.8)` or `h(disp-140.8)*h(hp-150)`. */
  name: string;
  /** Human-readable expression using the predictor names supplied by the caller. */
  expression: string;
  /** Hinge factors; empty for the intercept. */
  hinges: MarsHinge[];
  /** First knot of the term, or `null` for the intercept. */
  knot: number | null;
  coefficient: number;
}

/** Drop-one-predictor RSS attribution for the selected model. */
export interface MarsImportance {
  predictor: number;
  name: string;
  /** RSS increase when every term containing the predictor is removed. */
  reduction: number;
  /** Share of the total positive reduction, between 0 and 1. */
  share: number;
}

export interface MarsResult {
  terms: MarsTerm[];
  coefficients: number[];
  fitted: number[];
  residuals: number[];
  rss: number;
  gcv: number;
  r2: number;
  adjR2: number;
  n: number;
  /** Number of estimated coefficients, intercept included. */
  p: number;
  selectedTerms: number;
  /** Distinct selected knots, in ascending order. */
  knots: number[];
  importance: MarsImportance[];
  degree: number;
  penalty: number;
  maxTerms: number;
  pruned: boolean;
  /** Forward steps actually accepted. */
  iterations: number;
  converged: boolean;
}

export interface MarsInput {
  /** Response, one value per observation. */
  y: number[];
  /** Predictors, one row per observation. */
  x: number[][];
  /** Predictor names used in `term.name` and `term.expression`. */
  names?: string[];
  /** 1 for an additive model, 2 to allow two-way products (default 1). */
  degree?: number;
  /** Maximum number of terms created by the forward pass, intercept included. */
  maxTerms?: number;
  /** earth's GCV penalty per knot (default 2). */
  penalty?: number;
  /** Run the backward GCV pruning pass (default false). */
  prune?: boolean;
}

interface InternalTerm {
  hinges: MarsHinge[];
  column: number[];
}

interface Candidate {
  parent: number;
  predictor: number;
  knot: number | null;
  addCount: 1 | 2;
  columns: number[][];
  hinges: MarsHinge[][];
  rss: number;
  delta: number;
}

interface Fit {
  coefficients: number[];
  keep: number[];
  fitted: number[];
  rss: number;
}

const dot = (left: readonly number[], right: readonly number[]): number => {
  let sum = 0;
  for (let index = 0; index < left.length; index += 1) sum += left[index] * right[index];
  return sum;
};

const norm = (values: readonly number[]): number => Math.sqrt(dot(values, values));

const mean = (values: readonly number[]): number =>
  values.length === 0 ? Number.NaN : values.reduce((sum, value) => sum + value, 0) / values.length;

/**
 * Modified Gram–Schmidt with a second orthogonalisation pass.  Returns an
 * orthonormal basis, the indices of the columns that survived (independent
 * columns), and the residual sum of squares of `y` on that span.
 */
const orthonormalize = (
  columns: readonly number[][],
  y: readonly number[]
): { basis: number[][]; keep: number[]; rss: number } => {
  const basis: number[][] = [];
  const keep: number[] = [];

  columns.forEach((column, index) => {
    const original = norm(column);
    const work = [...column];
    for (const vector of basis) {
      const projection = dot(vector, work);
      for (let row = 0; row < work.length; row += 1) work[row] -= projection * vector[row];
    }
    // A second pass keeps near-collinear hazards under control without
    // changing the result for well-conditioned designs.
    for (const vector of basis) {
      const projection = dot(vector, work);
      for (let row = 0; row < work.length; row += 1) work[row] -= projection * vector[row];
    }
    const length = norm(work);
    if (original > 0 && length > 1e-9 * Math.max(1, original)) {
      basis.push(work.map(value => value / length));
      keep.push(index);
    }
  });

  const residual = [...y];
  for (const vector of basis) {
    const projection = dot(vector, residual);
    for (let row = 0; row < residual.length; row += 1) residual[row] -= projection * vector[row];
  }
  return { basis, keep, rss: dot(residual, residual) };
};

/** Least squares on the independent columns, with normal equations. */
const fitColumns = (columns: readonly number[][], y: readonly number[]): Fit | null => {
  if (columns.length === 0) return null;
  const { keep } = orthonormalize(columns, y);
  if (keep.length === 0) return null;

  const used = keep.map(index => columns[index]);
  const width = used.length;
  const gram: number[][] = Array.from({ length: width }, () => new Array<number>(width).fill(0));
  const rhs = new Array<number>(width).fill(0);
  for (let row = 0; row < y.length; row += 1) {
    for (let a = 0; a < width; a += 1) {
      rhs[a] += used[a][row] * y[row];
      for (let b = 0; b < width; b += 1) gram[a][b] += used[a][row] * used[b][row];
    }
  }

  const beta = solveLinear(gram, rhs);
  if (!beta || beta.some(value => !Number.isFinite(value))) return null;

  const fitted = new Array<number>(y.length).fill(0);
  for (let row = 0; row < y.length; row += 1) {
    let value = 0;
    for (let column = 0; column < width; column += 1) value += used[column][row] * beta[column];
    fitted[row] = value;
  }
  const residuals = y.map((value, row) => value - fitted[row]);
  return { coefficients: beta, keep, fitted, rss: dot(residuals, residuals) };
};

const hingeColumn = (
  parent: readonly number[],
  predictorValues: readonly number[],
  knot: number,
  side: 1 | -1
): number[] =>
  parent.map((value, row) =>
    value * Math.max(side === 1 ? predictorValues[row] - knot : knot - predictorValues[row], 0)
  );

const basisColumn = (hinges: readonly MarsHinge[], x: readonly number[][]): number[] => {
  const column = new Array<number>(x[0]?.length ?? 0).fill(1);
  for (const hinge of hinges) {
    for (let row = 0; row < column.length; row += 1) {
      const value = x[hinge.predictor][row] - hinge.knot;
      column[row] *= Math.max(hinge.side === 1 ? value : -value, 0);
    }
  }
  return column;
};

const formatNumber = (value: number): string => {
  if (!Number.isFinite(value)) return String(value);
  const rounded = Number(value.toPrecision(12));
  return String(rounded);
};

const describeHinges = (hinges: readonly MarsHinge[], names: readonly string[]): string =>
  hinges
    .map(hinge => {
      const name = names[hinge.predictor] ?? `X${hinge.predictor + 1}`;
      const knot = formatNumber(hinge.knot);
      return hinge.side === 1 ? `h(${name}-${knot})` : `h(${knot}-${name})`;
    })
    .join('*');

/** Long form used in the table's `Espressione` column. */
const describeExpression = (hinges: readonly MarsHinge[], names: readonly string[]): string =>
  hinges
    .map(hinge => {
      const name = names[hinge.predictor] ?? `X${hinge.predictor + 1}`;
      const knot = formatNumber(hinge.knot);
      return hinge.side === 1
        ? `max(0, ${name} − ${knot})`
        : `max(0, ${knot} − ${name})`;
    })
    .join(' × ');

/**
 * earth's automatic end span: eq. 45 in Friedman's MARS paper.
 * `Adjust.endspan` is 2 for degree-2 parents (earth's default).
 */
const endSpanFor = (n: number, predictors: number, parentDegree: number): number => {
  let endSpan = Math.trunc(7.32193 + Math.log(predictors) / Math.log(2));
  if (parentDegree >= 2) endSpan += Math.trunc(2 * endSpan + 0.5);
  if (endSpan > Math.trunc(n / 2) - 1) endSpan = Math.trunc(n / 2) - 1;
  return Math.max(1, endSpan);
};

/** earth's automatic minimum span: eq. 43 in Friedman's MARS paper. */
const minSpanFor = (n: number, predictors: number, used: number): number =>
  Math.max(1, Math.trunc((2.9702 + Math.log(predictors * Math.max(1, used))) / 1.7329));

interface KnotCandidate {
  index: number;
  knot: number;
}

/**
 * Candidate knots for one parent/predictor pair.  The scan mirrors earth's
 * `FindKnot`: walk the ordered observations backwards, skip `endspan` values
 * at the ends, and consider one knot every `minspan` positions.
 */
const candidateKnots = (
  predictorValues: readonly number[],
  parentColumn: readonly number[],
  predictors: number,
  parentDegree: number
): KnotCandidate[] => {
  const n = predictorValues.length;
  const used = parentColumn.reduce((count, value) => count + (value > 0 ? 1 : 0), 0);
  const endSpan = endSpanFor(n, predictors, parentDegree);
  const minSpan = minSpanFor(n, predictors, used);

  const available = Math.max(0, n - 2 * endSpan);
  let startSpan = Math.trunc(available / 2);
  if (available > minSpan) {
    const divisions = Math.trunc(available / minSpan);
    startSpan =
      available === divisions * minSpan
        ? Math.trunc(minSpan / 2)
        : Math.trunc((available - divisions * minSpan) / 2);
  }
  startSpan = Math.max(1, endSpan + startSpan);

  const order = predictorValues
    .map((value, index) => ({ value, index }))
    .sort((left, right) => left.value - right.value || left.index - right.index)
    .map(entry => entry.index);

  const candidates: KnotCandidate[] = [];
  let span = startSpan;
  for (let index = n - 2; index >= endSpan; index -= 1) {
    if (parentColumn[order[index + 1]] > 0) {
      span -= 1;
      if (span === 0) {
        span = minSpan;
        candidates.push({ index, knot: predictorValues[order[index]] });
      }
    }
  }
  return candidates;
};

const gcvOf = (rss: number, p: number, n: number, penalty: number): number => {
  const knots = (p - 1) / 2;
  const cost = (p + penalty * knots) / n;
  if (cost >= 1) return Number.POSITIVE_INFINITY;
  return rss / (n * (1 - cost) * (1 - cost));
};

const validate = (input: MarsInput): {
  y: number[];
  x: number[][];
  names: string[];
  degree: number;
  maxTerms: number;
  penalty: number;
  prune: boolean;
} | null => {
  const { y, x } = input;
  if (!Array.isArray(y) || !Array.isArray(x)) return null;
  const n = y.length;
  if (n < 5) return null;
  if (x.length !== n || x.some(row => !Array.isArray(row))) return null;
  const predictors = x[0]?.length ?? 0;
  if (predictors < 1 || x.some(row => row.length !== predictors)) return null;
  if (y.some(value => !Number.isFinite(value))) return null;
  if (x.some(row => row.some(value => !Number.isFinite(value)))) return null;

  const degree = input.degree ?? 1;
  if (degree !== 1 && degree !== 2) return null;

  const maxTerms = input.maxTerms ?? DEFAULT_MAX_TERMS;
  if (!Number.isInteger(maxTerms) || maxTerms < 3 || maxTerms > n) return null;

  const penalty = input.penalty ?? 2;
  if (!Number.isFinite(penalty) || penalty < 0) return null;

  const names = (input.names ?? Array.from({ length: predictors }, (_, index) => `X${index + 1}`)).map(
    (name, index) => (typeof name === 'string' && name.length > 0 ? name : `X${index + 1}`)
  );
  if (names.length !== predictors) return null;

  // A constant predictor cannot add a hinge and makes the design singular.
  const allConstant = Array.from({ length: predictors }, (_, predictor) => {
    const values = x.map(row => row[predictor]);
    const first = values[0];
    return values.every(value => value === first);
  });
  if (allConstant.every(Boolean)) return null;

  // Reject a singular input design (duplicate predictors, exact collinearity
  // or a predictor that is a linear combination of the others).
  const design = [new Array<number>(n).fill(1), ...Array.from({ length: predictors }, (_, predictor) =>
    x.map(row => row[predictor])
  )];
  if (orthonormalize(design, y).keep.length !== predictors + 1) return null;

  return { y, x, names, degree, maxTerms, penalty, prune: input.prune === true };
};

const buildCandidate = (
  parent: number,
  predictor: number,
  knot: number | null,
  addCount: 1 | 2,
  columns: number[][],
  hinges: MarsHinge[][],
  baseColumns: readonly number[][],
  y: readonly number[],
  currentRss: number
): Candidate | null => {
  const evaluated = orthonormalize([...baseColumns, ...columns], y);
  // Keep only the new columns that survive the rank check.  A pair whose
  // second hinge is already spanned by the current model contributes a single
  // column, exactly like earth's dependent-column removal.
  const newKeep = evaluated.keep.filter(index => index >= baseColumns.length);
  if (newKeep.length === 0) return null;
  const survivingColumns = newKeep.map(index => columns[index - baseColumns.length]);
  const survivingHinges = newKeep.map(index => hinges[index - baseColumns.length]);
  return {
    parent,
    predictor,
    knot,
    addCount,
    columns: survivingColumns,
    hinges: survivingHinges,
    rss: evaluated.rss,
    delta: currentRss - evaluated.rss,
  };
};

/**
 * Fit a MARS model.  Returns `null` for invalid inputs, a singular design or a
 * model that cannot be estimated (n too small for the selected terms).
 */
export const fitMars = (input: MarsInput): MarsResult | null => {
  const validated = validate(input);
  if (!validated) return null;
  const { y, x, names, degree, maxTerms, penalty, prune } = validated;
  const n = y.length;
  const predictors = x[0].length;
  const yMean = mean(y);
  const total = y.reduce((sum, value) => sum + (value - yMean) * (value - yMean), 0);

  // Forward pass -----------------------------------------------------------
  let terms: InternalTerm[] = [
    {
      hinges: [],
      column: new Array<number>(n).fill(1),
    },
  ];
  let attempted = 1;
  let currentRss = total;
  let iterations = 0;
  const usedPredictors = new Set<number>();

  while (attempted < maxTerms - 1 && terms.length < n - 1) {
    const baseColumns = terms.map(term => term.column);
    let best: Candidate | null = null;

    for (let parent = 0; parent < terms.length; parent += 1) {
      const parentTerm = terms[parent];
      if (parentTerm.hinges.length >= degree) continue;

      for (let predictor = 0; predictor < predictors; predictor += 1) {
        if (parentTerm.hinges.some(hinge => hinge.predictor === predictor)) continue;

        // A linear main effect is the "case -1" candidate in earth: it lets a
        // new predictor enter without a knot.  For degree 2 the same idea
        // produces a linear interaction with the parent basis.
        if (!usedPredictors.has(predictor)) {
          const linearColumn = parentTerm.column.map(
            (value, row) => value * x[predictor][row]
          );
          const linear = buildCandidate(
            parent,
            predictor,
            null,
            1,
            [linearColumn],
            [parentTerm.hinges],
            baseColumns,
            y,
            currentRss
          );
          if (linear && (!best || linear.delta > best.delta + EPS)) best = linear;
        }

        const predictorValues = x.map(row => row[predictor]);
        const knotsForPair = candidateKnots(
          predictorValues,
          parentTerm.column,
          predictors,
          parentTerm.hinges.length
        );
        for (const { knot } of knotsForPair) {
          const positive = hingeColumn(parentTerm.column, predictorValues, knot, 1);
          const negative = hingeColumn(parentTerm.column, predictorValues, knot, -1);
          const positiveHinges = [
            ...parentTerm.hinges,
            { predictor, knot, side: 1 as const },
          ];
          const negativeHinges = [
            ...parentTerm.hinges,
            { predictor, knot, side: -1 as const },
          ];
          const pair = buildCandidate(
            parent,
            predictor,
            knot,
            2,
            [positive, negative],
            [positiveHinges, negativeHinges],
            baseColumns,
            y,
            currentRss
          );
          if (pair && (!best || pair.delta > best.delta + EPS)) best = pair;
        }
      }
    }

    if (!best || best.delta <= 1e-9) break;

    best.columns.forEach((column, index) => {
      terms.push({ hinges: best!.hinges[index], column });
    });
    if (best.columns.some(column => column.length > 0)) usedPredictors.add(best.predictor);
    attempted += best.addCount;
    currentRss = best.rss;
    iterations += 1;

    if (best.delta <= 1e-9 * Math.max(1, total)) break;
  }

  const forwardFit = fitColumns(terms.map(term => term.column), y);
  if (!forwardFit || terms.length < 2) return null;

  const subsetTerms = () =>
    forwardFit.keep.map(index => terms[index]);

  let selected: InternalTerm[] = subsetTerms();
  let selectedFit = fitColumns(
    selected.map(term => term.column),
    y
  );
  if (!selectedFit || selectedFit.keep.length !== selected.length) return null;
  let selectedGcv = gcvOf(selectedFit.rss, selected.length, n, penalty);

  // Backward pass ----------------------------------------------------------
  if (prune && selected.length > 1) {
    let currentTerms = selected;
    let currentFit = selectedFit;

    while (currentTerms.length > 1) {
      let bestRemoval: { index: number; fit: Fit; terms: InternalTerm[] } | null = null;
      for (let index = 1; index < currentTerms.length; index += 1) {
        const candidateTerms = currentTerms.filter((_, position) => position !== index);
        const candidateFit = fitColumns(
          candidateTerms.map(term => term.column),
          y
        );
        if (!candidateFit) continue;
        if (candidateFit.keep.length !== candidateTerms.length) continue;
        if (!bestRemoval || candidateFit.rss < bestRemoval.fit.rss - EPS) {
          bestRemoval = { index, fit: candidateFit, terms: candidateTerms };
        }
      }
      if (!bestRemoval) break;

      currentTerms = bestRemoval.terms;
      currentFit = bestRemoval.fit;
      const gcv = gcvOf(currentFit.rss, currentTerms.length, n, penalty);
      if (gcv < selectedGcv - EPS) {
        selected = currentTerms;
        selectedFit = currentFit;
        selectedGcv = gcv;
      }
    }
  }

  // Final estimates --------------------------------------------------------
  const fitted = selectedFit.fitted;
  const residuals = y.map((value, index) => value - fitted[index]);
  const rss = selectedFit.rss;
  const p = selected.length;
  if (p >= n) return null;

  const coefficients = selectedFit.coefficients;
  const selectedName = selected.map(term => {
    const name = describeHinges(term.hinges, names);
    return name.length > 0 ? name : '(Intercept)';
  });

  const resultTerms: MarsTerm[] = selected.map((term, index) => ({
    name: selectedName[index],
    expression:
      term.hinges.length === 0 ? '(Intercept)' : describeExpression(term.hinges, names),
    hinges: term.hinges,
    knot: term.hinges.length > 0 ? term.hinges[0].knot : null,
    coefficient: coefficients[index] ?? Number.NaN,
  }));

  const r2 = total > EPS ? 1 - rss / total : rss <= EPS ? 1 : Number.NaN;
  const adjR2 =
    Number.isFinite(r2) && n - p > 0 ? 1 - ((1 - r2) * (n - 1)) / (n - p) : Number.NaN;

  const importance: MarsImportance[] = Array.from({ length: predictors }, (_, predictor) => {
    const reduced = selected.filter(
      term => !term.hinges.some(hinge => hinge.predictor === predictor)
    );
    let reduction = 0;
    if (reduced.length !== selected.length && reduced.length > 0) {
      const fit = fitColumns(
        reduced.map(term => term.column),
        y
      );
      if (fit) reduction = Math.max(0, fit.rss - rss);
    }
    return {
      predictor,
      name: names[predictor],
      reduction,
      share: 0,
    };
  });
  const reductionTotal = importance.reduce((sum, entry) => sum + entry.reduction, 0);
  importance.forEach(entry => {
    entry.share = reductionTotal > EPS ? entry.reduction / reductionTotal : 0;
  });

  const knots = [...new Set(selected.flatMap(term => term.hinges.map(hinge => hinge.knot)))].sort(
    (left, right) => left - right
  );

  return {
    terms: resultTerms,
    coefficients: [...coefficients],
    fitted,
    residuals,
    rss,
    gcv: selectedGcv,
    r2,
    adjR2,
    n,
    p,
    selectedTerms: p,
    knots,
    importance,
    degree,
    penalty,
    maxTerms,
    pruned: prune && p < forwardFit.keep.length,
    iterations,
    converged: true,
  };
};

/** Evaluate a fitted MARS model at one predictor vector. */
export const marsPredict = (result: MarsResult, x: readonly number[]): number => {
  if (!Array.isArray(x)) return Number.NaN;
  let value = 0;
  for (const term of result.terms) {
    let basis = 1;
    for (const hinge of term.hinges) {
      const predictorValue = x[hinge.predictor];
      if (!Number.isFinite(predictorValue)) return Number.NaN;
      const delta = predictorValue - hinge.knot;
      basis *= Math.max(hinge.side === 1 ? delta : -delta, 0);
    }
    value += term.coefficient * basis;
  }
  return Number.isFinite(value) ? value : Number.NaN;
};
