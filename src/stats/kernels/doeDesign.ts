/**
 * Factorial and response-surface design matrices.
 *
 * The builder returns coded levels (−1, 0, +1, and ±α for the axial points)
 * in standard order. It is the planning counterpart of the response-surface
 * analysis: the analysis fits a model to the observed responses, the builder
 * says which runs to collect.
 */
import type { DoeDesignOptions, DoeDesignResult, DoeDesignRow } from '../analysisResults';

export type {
  DoeDesignOptions,
  DoeDesignResult,
  DoeDesignRow,
  DoeDesignType,
} from '../analysisResults';

const factorLabel = (index: number): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return letters[index] ?? `F${index + 1}`;
};

const fullFactorial = (factors: number): number[][] => {
  const rows: number[][] = [];
  const total = Math.pow(2, factors);
  for (let index = 0; index < total; index += 1) {
    const row: number[] = [];
    for (let factor = 0; factor < factors; factor += 1) {
      row.push(((index >> factor) & 1) === 0 ? -1 : 1);
    }
    rows.push(row);
  }
  return rows;
};

const halfFraction = (factors: number): number[][] => {
  const base = fullFactorial(factors - 1);
  return base.map(row => {
    const product = row.reduce((value, level) => value * level, 1);
    return [...row, product];
  });
};

export const doeDesign = (options: DoeDesignOptions): DoeDesignResult | null => {
  const factors = Math.round(options.factors);
  const centerPoints = Math.max(0, Math.round(options.centerPoints));
  if (factors < 2 || factors > 7) return null;
  if (options.design === 'boxBehnken' && (factors < 3 || factors > 4)) return null;
  const cornerRows = options.design === 'half' ? fullFactorial(factors - 1) : fullFactorial(factors);

  let rows: DoeDesignRow[] = [];
  let axialRuns = 0;
  let alpha: number | null = null;
  let aliases: string[] = [];

  if (options.design === 'full') {
    rows = cornerRows.map((levels, index) => ({ run: index + 1, levels, kind: 'corner' }));
  } else if (options.design === 'half') {
    rows = halfFraction(factors).map((levels, index) => ({
      run: index + 1,
      levels,
      kind: 'corner',
    }));
    aliases = [`${factorLabel(factors - 1)} = ${factorLabel(0)}${factorLabel(1)}${factorLabel(2)}`];
    if (factors > 3) aliases.push(`I = ${factorLabel(0)}${factorLabel(1)}${factorLabel(2)}${factorLabel(factors - 1)}`);
  } else if (options.design === 'ccd') {
    alpha = Math.pow(Math.pow(2, factors), 0.25);
    const corners = fullFactorial(factors).map((levels, index) => ({
      run: index + 1,
      levels,
      kind: 'corner' as const,
    }));
    const axial: DoeDesignRow[] = [];
    for (let factor = 0; factor < factors; factor += 1) {
      for (const sign of [-1, 1]) {
        const levels = Array<number>(factors).fill(0);
        levels[factor] = sign * alpha;
        axial.push({ run: corners.length + axial.length + 1, levels, kind: 'axial' });
      }
    }
    axialRuns = axial.length;
    rows = [...corners, ...axial];
  } else {
    const pairs: [number, number][] = [];
    for (let a = 0; a < factors; a += 1) {
      for (let b = a + 1; b < factors; b += 1) pairs.push([a, b]);
    }
    rows = pairs.flatMap(([a, b], pairIndex) =>
      [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ].map(([left, right], cornerIndex) => {
        const levels = Array<number>(factors).fill(0);
        levels[a] = left;
        levels[b] = right;
        return {
          run: pairIndex * 4 + cornerIndex + 1,
          levels,
          kind: 'corner' as const,
        };
      })
    );
  }

  const designRows = rows.map(row => ({ ...row }));
  for (let index = 0; index < centerPoints; index += 1) {
    designRows.push({
      run: designRows.length + 1,
      levels: Array<number>(factors).fill(0),
      kind: 'center',
    });
  }

  return {
    design: options.design,
    factors,
    factorNames: Array.from({ length: factors }, (_, index) => factorLabel(index)),
    rows: designRows,
    runs: designRows.length,
    cornerRuns: designRows.filter(row => row.kind === 'corner').length,
    axialRuns,
    centerRuns: centerPoints,
    resolution: options.design === 'half' ? factors : null,
    alpha,
    aliases,
  };
};
