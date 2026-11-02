/**
 * Reference-test harness.
 *
 * Reference tests compare a kernel with an independent implementation (R,
 * NumPy, a closed form) whose numbers are stored as JSON fixtures. The fixture
 * generator lives next to it under `r/`, and the committed JSON means the test
 * suite never needs R installed.
 *
 * Tolerances are declared, never implicit: numeric differences caused by a
 * different algorithm must be visible in the test file.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** Absolute and relative tolerance; both may be combined. */
export type Tolerance = number | { absolute?: number; relative?: number };

/** Named tolerances shared by the reference tests. */
export const TOLERANCES = {
  /** Reproduces an exact algebraic identity. */
  exact: 1e-12,
  /** Same formula, different floating-point evaluation order. */
  r: 1e-8,
  /** R probability functions; jStat's CDFs are slightly less precise. */
  rProbability: 1e-6,
  /** R response-surface models (`rsm` / `lm`). */
  rsm: 1e-6,
  /** Monte-Carlo estimate against an exact enumeration. */
  monteCarlo: 5e-3,
} as const;

const normalize = (tolerance: Tolerance): { absolute: number; relative: number } =>
  typeof tolerance === 'number'
    ? { absolute: tolerance, relative: 0 }
    : { absolute: tolerance.absolute ?? 0, relative: tolerance.relative ?? 0 };

/** `true` when `|actual - expected| <= absolute + relative * |expected|`. */
export const closeTo = (actual: number, expected: number, tolerance: Tolerance = TOLERANCES.r): boolean => {
  if (Number.isNaN(expected)) return Number.isNaN(actual);
  if (!Number.isFinite(actual) || !Number.isFinite(expected)) return actual === expected;
  const { absolute, relative } = normalize(tolerance);
  return Math.abs(actual - expected) <= absolute + relative * Math.abs(expected);
};

export const assertClose = (
  actual: number,
  expected: number,
  tolerance: Tolerance = TOLERANCES.r,
  label = 'value'
): void => {
  assert.ok(
    closeTo(actual, expected, tolerance),
    `${label}: ${actual} != ${expected} (tolerance ${JSON.stringify(tolerance)})`
  );
};

export const assertCloseVector = (
  actual: readonly number[],
  expected: readonly number[],
  tolerance: Tolerance = TOLERANCES.r,
  label = 'vector'
): void => {
  assert.equal(actual.length, expected.length, `${label}: expected ${expected.length} values`);
  actual.forEach((value, index) => assertClose(value, expected[index], tolerance, `${label}[${index}]`));
};

export const assertCloseMatrix = (
  actual: readonly (readonly number[])[],
  expected: readonly (readonly number[])[],
  tolerance: Tolerance = TOLERANCES.r,
  label = 'matrix'
): void => {
  assert.equal(actual.length, expected.length, `${label}: expected ${expected.length} rows`);
  actual.forEach((row, index) => {
    assert.equal(row.length, expected[index].length, `${label}[${index}]: row width`);
    assertCloseVector(row, expected[index], tolerance, `${label}[${index}]`);
  });
};

/** Load a committed fixture from `fixtures/`. */
export const loadFixture = <T>(name: string): T => {
  const url = new URL(`./fixtures/${name}`, import.meta.url);
  return JSON.parse(readFileSync(fileURLToPath(url), 'utf8')) as T;
};
