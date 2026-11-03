/**
 * Gage R&R / measurement system analysis.
 *
 * Crossed design: every part is measured by every operator, with the same
 * number of replicates. The variance components follow the AIAG average-and-range
 * formulation expressed through the ANOVA mean squares, which is numerically
 * identical for a balanced design and easier to audit:
 *
 *   repeatability = MSE
 *   reproducibility = (MS_operator - MS_interaction) / (parts * reps)
 *                     + (MS_interaction - MSE) / reps
 *   part variation = (MS_part - MS_interaction) / (operators * reps)
 */
import { jStat } from '../jstat';

import type { MsaResult, MsaRow } from '../analysisResults';

export type { MsaResult, MsaRow } from '../analysisResults';

const mean = (values: readonly number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);

const fCdf = (value: number, df1: number, df2: number): number =>
  jStat.centralF.cdf(value, df1, df2);

export const gageRr = (rows: readonly MsaRow[]): MsaResult | null => {
  const clean = rows.filter(row => Number.isFinite(row.value));
  if (clean.length < 8) return null;
  const partLevels = Array.from(new Set(clean.map(row => row.part)));
  const operatorLevels = Array.from(new Set(clean.map(row => row.operator)));
  const parts = partLevels.length;
  const operators = operatorLevels.length;
  if (parts < 2 || operators < 2) return null;

  const cells = new Map<string, number[]>();
  clean.forEach(row => {
    const key = `${row.part}\u0000${row.operator}`;
    const bucket = cells.get(key) ?? [];
    bucket.push(row.value);
    cells.set(key, bucket);
  });
  if (cells.size !== parts * operators) return null;
  const counts = Array.from(cells.values()).map(values => values.length);
  const replicates = counts[0];
  if (replicates < 1 || counts.some(count => count !== replicates)) return null;
  const n = parts * operators * replicates;
  if (n < 8) return null;

  const grandMean = mean(clean.map(row => row.value));
  const partMeans = partLevels.map(part => mean(clean.filter(row => row.part === part).map(row => row.value)));
  const operatorMeans = operatorLevels.map(operator =>
    mean(clean.filter(row => row.operator === operator).map(row => row.value))
  );
  const cellMeans = partLevels.map(part =>
    operatorLevels.map(operator => mean(cells.get(`${part}\u0000${operator}`) ?? []))
  );

  const ssPart = operators * replicates * partMeans.reduce((sum, value) => sum + Math.pow(value - grandMean, 2), 0);
  const ssOperator =
    parts * replicates * operatorMeans.reduce((sum, value) => sum + Math.pow(value - grandMean, 2), 0);
  const ssCells =
    replicates *
    cellMeans.flat().reduce((sum, value) => sum + Math.pow(value - grandMean, 2), 0);
  const ssInteraction = Math.max(0, ssCells - ssPart - ssOperator);
  const ssError = clean.reduce((sum, row) => {
    const cell = cells.get(`${row.part}\u0000${row.operator}`) ?? [];
    return sum + Math.pow(row.value - mean(cell), 2);
  }, 0);
  const ssTotal = ssPart + ssOperator + ssInteraction + ssError;

  const dfPart = parts - 1;
  const dfOperator = operators - 1;
  const dfInteraction = dfPart * dfOperator;
  const dfError = parts * operators * (replicates - 1);
  const dfTotal = n - 1;
  if (dfError < 1) return null;

  const msPart = ssPart / dfPart;
  const msOperator = ssOperator / dfOperator;
  const msInteraction = dfInteraction > 0 ? ssInteraction / dfInteraction : 0;
  const msError = ssError / dfError;

  const fOperator = msInteraction > 0 ? msOperator / msInteraction : null;
  const fInteraction = msError > 0 ? msInteraction / msError : null;
  const pOperator = fOperator !== null ? jStatFCdf(fOperator, dfOperator, dfInteraction) : null;
  const pInteraction = fInteraction !== null ? jStatFCdf(fInteraction, dfInteraction, dfError) : null;

  const clamp = (value: number): number => (Number.isFinite(value) && value > 0 ? value : 0);
  const interaction = clamp((msInteraction - msError) / Math.max(1, replicates));
  // AIAG uses the non-negative interaction component in the reproducibility
  // estimate: a negative mean square is truncated at zero, not subtracted.
  const reproducibility =
    (msOperator - msInteraction) / Math.max(1, parts * replicates) +
    interaction / Math.max(1, operators);
  const repeatability = msError;
  const part = (msPart - msInteraction) / Math.max(1, operators * replicates);
  const repeat = clamp(repeatability);
  const repro = clamp(reproducibility);
  const partVar = clamp(part);
  const grr = repeat + repro;
  const total = grr + partVar;
  const pctContribution = total > 0 ? (100 * grr) / total : 0;
  const pctStudyVariation = total > 0 ? (100 * Math.sqrt(grr / total)) : 0;
  const ndc = grr > 0 ? 1.41 * Math.sqrt(partVar / grr) : 0;

  return {
    parts,
    operators,
    replicates,
    n,
    grandMean,
    anova: [
      { source: 'part', df: dfPart, ss: ssPart, ms: msPart, f: null, p: null },
      {
        source: 'operator',
        df: dfOperator,
        ss: ssOperator,
        ms: msOperator,
        f: fOperator,
        p: pOperator,
      },
      {
        source: 'interaction',
        df: dfInteraction,
        ss: ssInteraction,
        ms: msInteraction,
        f: fInteraction,
        p: pInteraction,
      },
      { source: 'error', df: dfError, ss: ssError, ms: msError, f: null, p: null },
      { source: 'total', df: dfTotal, ss: ssTotal, ms: ssTotal / Math.max(1, dfTotal), f: null, p: null },
    ],
    variance: {
      repeatability: repeat,
      reproducibility: repro,
      interaction: clamp(interaction),
      part: partVar,
      total,
      grr,
    },
    sd: {
      repeatability: Math.sqrt(repeat),
      reproducibility: Math.sqrt(repro),
      grr: Math.sqrt(grr),
      part: Math.sqrt(partVar),
      total: Math.sqrt(total),
    },
    pctContribution,
    pctStudyVariation,
    ndc: Math.max(0, Math.floor(ndc)),
    operatorP: pOperator,
    interactionP: pInteraction,
  };
};

/** Upper-tail F probability, matching R's `pf(x, df1, df2, lower.tail = FALSE)`. */
const jStatFCdf = (value: number, df1: number, df2: number): number => {
  if (!(value > 0) || df1 <= 0 || df2 <= 0) return NaN;
  return 1 - fCdf(value, df1, df2);
};
