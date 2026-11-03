/**
 * Simple correspondence analysis of a two-way table.
 *
 * The table is converted to profiles, the expected counts under independence
 * are removed and the standardised residuals are decomposed with an SVD. The
 * coordinates, masses, contributions and cos² follow the same conventions as
 * the `ca` package in R.
 */

import { chi2SF } from '../distributions';
import { svd } from './matrix';
import type { CorrespondenceAxis, CorrespondencePoint, CorrespondenceResult } from '../correspondence/types';

export interface CorrespondenceInput {
  observed: number[][];
  rowLabels: string[];
  colLabels: string[];
}

export const correspondenceAnalysis = (input: CorrespondenceInput): CorrespondenceResult | null => {
  const rows = input.observed.length;
  const cols = input.observed[0]?.length ?? 0;
  if (rows < 2 || cols < 2) return null;
  if (input.observed.some(row => row.length !== cols)) return null;
  if (input.observed.some(row => row.some(value => !Number.isFinite(value) || value < 0))) return null;
  const total = input.observed.reduce((sum, row) => sum + row.reduce((inner, value) => inner + value, 0), 0);
  if (!(total > 0)) return null;
  const rowTotals = input.observed.map(row => row.reduce((sum, value) => sum + value, 0));
  const colTotals = Array.from({ length: cols }, (_, column) =>
    input.observed.reduce((sum, row) => sum + row[column], 0)
  );
  if (rowTotals.some(value => !(value > 0)) || colTotals.some(value => !(value > 0))) return null;

  const rowMass = rowTotals.map(value => value / total);
  const colMass = colTotals.map(value => value / total);
  const expected = input.observed.map((row, i) =>
    row.map((_, j) => (rowTotals[i] * colTotals[j]) / total)
  );
  const residuals = input.observed.map((row, i) =>
    row.map((value, j) => (value - expected[i][j]) / Math.sqrt(expected[i][j]))
  );
  const standardized = residuals.map(row => row.map(value => value / Math.sqrt(total)));
  const decomposition = svd(standardized);
  const totalInertia = decomposition.s.reduce((sum, value) => sum + value * value, 0);
  const chi2 = totalInertia * total;
  const df = (rows - 1) * (cols - 1);

  const rank = Math.min(rows - 1, cols - 1);
  const axes: CorrespondenceAxis[] = [];
  let cumulative = 0;
  for (let axis = 0; axis < rank; axis += 1) {
    const eigenvalue = Math.pow(decomposition.s[axis] ?? 0, 2);
    if (!(eigenvalue > 1e-12)) break;
    const inertiaPct = totalInertia > 0 ? (eigenvalue / totalInertia) * 100 : 0;
    cumulative += inertiaPct;
    axes.push({
      index: axis + 1,
      eigenvalue,
      inertiaPct,
      cumulativePct: cumulative,
      chi2,
      df,
      p: chi2SF(chi2, df),
    });
  }
  if (axes.length === 0) return null;

  const rowPrincipal: number[][] = Array.from({ length: rows }, () => []);
  const colPrincipal: number[][] = Array.from({ length: cols }, () => []);
  const rowCoordinates: CorrespondencePoint[][] = Array.from({ length: rows }, () => []);
  const colCoordinates: CorrespondencePoint[][] = Array.from({ length: cols }, () => []);
  const rowSquaredDistance = rowMass.map(() => 0);
  const colSquaredDistance = colMass.map(() => 0);

  axes.forEach((axis, index) => {
    const singular = decomposition.s[index] ?? 0;
    const rowValues = Array.from({ length: rows }, (_, i) => {
      const standard = (decomposition.u[i]?.[index] ?? 0) / Math.sqrt(rowMass[i]);
      return standard;
    });
    const colValues = Array.from({ length: cols }, (_, j) => {
      const standard = (decomposition.v[j]?.[index] ?? 0) / Math.sqrt(colMass[j]);
      return standard;
    });
    const rowPrincipalAxis = rowValues.map(value => value * singular);
    const colPrincipalAxis = colValues.map(value => value * singular);
    const rowContributionTotal = rowMass.reduce(
      (sum, mass, i) => sum + mass * Math.pow(rowPrincipalAxis[i], 2),
      0
    );
    const colContributionTotal = colMass.reduce(
      (sum, mass, j) => sum + mass * Math.pow(colPrincipalAxis[j], 2),
      0
    );

    for (let i = 0; i < rows; i += 1) {
      rowPrincipal[i].push(rowPrincipalAxis[i]);
      rowSquaredDistance[i] += Math.pow(rowPrincipalAxis[i], 2);
      rowCoordinates[i].push({
        label: input.rowLabels[i] ?? `Riga ${i + 1}`,
        mass: rowMass[i],
        coordinate: rowPrincipalAxis[i],
        inertia: rowMass[i] * Math.pow(rowPrincipalAxis[i], 2),
        contribution:
          rowContributionTotal > 0
            ? (rowMass[i] * Math.pow(rowPrincipalAxis[i], 2)) / rowContributionTotal
            : 0,
        cos2: 0,
      });
    }
    for (let j = 0; j < cols; j += 1) {
      colPrincipal[j].push(colPrincipalAxis[j]);
      colSquaredDistance[j] += Math.pow(colPrincipalAxis[j], 2);
      colCoordinates[j].push({
        label: input.colLabels[j] ?? `Colonna ${j + 1}`,
        mass: colMass[j],
        coordinate: colPrincipalAxis[j],
        inertia: colMass[j] * Math.pow(colPrincipalAxis[j], 2),
        contribution:
          colContributionTotal > 0
            ? (colMass[j] * Math.pow(colPrincipalAxis[j], 2)) / colContributionTotal
            : 0,
        cos2: 0,
      });
    }
  });

  rowCoordinates.forEach((points, i) => {
    points.forEach(point => {
      point.cos2 = rowSquaredDistance[i] > 0 ? Math.pow(point.coordinate, 2) / rowSquaredDistance[i] : 0;
    });
  });
  colCoordinates.forEach((points, j) => {
    points.forEach(point => {
      point.cos2 = colSquaredDistance[j] > 0 ? Math.pow(point.coordinate, 2) / colSquaredDistance[j] : 0;
    });
  });

  return {
    rows: input.rowLabels,
    cols: input.colLabels,
    observed: input.observed,
    expected,
    residuals,
    rowMass,
    colMass,
    axes,
    rowCoordinates,
    colCoordinates,
    rowPrincipal,
    colPrincipal,
    totalInertia,
    chi2,
    df,
    p: chi2SF(chi2, df),
    n: total,
  };
};
