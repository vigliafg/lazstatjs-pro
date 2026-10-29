/** True only for real, finite numbers (rejects NaN, Infinity, null and strings). */
export const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
