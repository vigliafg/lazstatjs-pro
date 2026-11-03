/**
 * Size guards for the statistical kernels.
 *
 * A runner can refuse a request with a readable reason, but a kernel called
 * from a test, a script or a future worker must not allocate an unbounded
 * matrix. The limits are grouped by algorithmic cost so a new procedure picks
 * a class instead of inventing its own threshold:
 *
 * - `quadratic`: O(n²) memory/time (distance matrices, full eigen problems);
 * - `iterative`: repeated fits (EM, IRLS, MCMC-like loops);
 * - `linear`: closed-form summaries over the full grid.
 *
 * `sampleEvenly` is the deterministic thinning used when the procedure can
 * work on a representative sample instead of refusing the input.
 */

export type GuardDimension = 'rows' | 'columns' | 'groups';

export interface GuardLimits {
  maxRows: number;
  maxColumns: number;
  maxGroups?: number;
}

export const GUARD_LIMITS = {
  quadratic: { maxRows: 2000, maxColumns: 50, maxGroups: 20 },
  iterative: { maxRows: 20000, maxColumns: 100, maxGroups: 50 },
  linear: { maxRows: 50000, maxColumns: 500 },
} satisfies Record<string, GuardLimits>;

/**
 * Pairwise order statistics (Theil–Sen) are O(n²) per evaluation and the slope
 * is resampled hundreds of times, so the exact estimator only runs on this
 * many rows; larger inputs are thinned deterministically. One hundred evenly
 * spaced points still yield thousands of pairwise slopes and a stable median.
 */
export const THEIL_SEN_MAX_ROWS = 100;

/**
 * Monte-Carlo Lilliefors p-value: 1000 replicates each sorting a sample. The
 * hypothesis test is evaluated on at most this many evenly spaced rows so a
 * 50 000-row grid does not spend half a minute in the diagnostic.
 */
export const LILLIEFORS_MAX_ROWS = 1000;

export interface GuardInput {
  rows: number;
  columns: number;
  groups?: number;
}

export type GuardResult =
  | { ok: true }
  | {
      ok: false;
      dimension: GuardDimension;
      requested: number;
      limit: number;
      /** Ready for `AnalysisRunResult.reason`. */
      message: string;
    };

const failure = (
  dimension: GuardDimension,
  requested: number,
  limit: number
): GuardResult => ({
  ok: false,
  dimension,
  requested,
  limit,
  message: `Too many ${dimension} for this procedure (${requested} > ${limit}); reduce the selection or work on a sample.`,
});

/** Check the input sizes against one cost class. */
export const guardDimensions = (input: GuardInput, limits: GuardLimits): GuardResult => {
  if (input.rows > limits.maxRows) return failure('rows', input.rows, limits.maxRows);
  if (input.columns > limits.maxColumns) return failure('columns', input.columns, limits.maxColumns);
  if (limits.maxGroups !== undefined && input.groups !== undefined && input.groups > limits.maxGroups) {
    return failure('groups', input.groups, limits.maxGroups);
  }
  return { ok: true };
};

/**
 * Deterministic thinning that keeps the original order, the first and the last
 * element. Returns a copy when the input already fits.
 */
export const sampleEvenly = <T>(items: readonly T[], maxRows: number): T[] => {
  if (!(maxRows > 0)) return [];
  if (items.length <= maxRows) return [...items];
  if (maxRows === 1) return [items[0]];
  const step = (items.length - 1) / (maxRows - 1);
  return Array.from({ length: maxRows }, (_, index) => items[Math.round(index * step)]);
};
