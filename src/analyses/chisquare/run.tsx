import { jStat } from '../../stats/jstat';
import { chiSquareTables } from '../../stats/chisquare';
import { chiSquareReport } from '../../stats/report';
import { fmtEst } from '../../stats/format';
import { calcFisherExact } from '../../stats/kernels';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import type { Dataset } from '../../grid/types';
import type { ChiSqParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface ChiSquareRunInput {
  grid: Dataset;
  chisqParams: ChiSqParams;
  ciLevel: number;
}

/** Chi-quadro 2x2: tabelle, grafici e report. Estratto da App.tsx senza cambi di comportamento. */
  export const buildChiSquareOutput = (input: ChiSquareRunInput): AnalysisRunResult => {
  const { grid, chisqParams, ciLevel } = input;
    const { row1col1, row1col2, row2col1, row2col2, row1Label, row2Label, col1Label, col2Label, runFisherExact } = chisqParams;

    if (row1col1 < 0 || row1col2 < 0 || row2col1 < 0 || row2col2 < 0) {
      return { ok: false, reason: 'Frequencies must be non-negative' };
    }

    const o11 = row1col1;
    const o12 = row1col2;
    const o21 = row2col1;
    const o22 = row2col2;

    const r1 = o11 + o12;
    const r2 = o21 + o22;
    const c1 = o11 + o21;
    const c2 = o12 + o22;
    const n = r1 + r2;

    if (n === 0) {
      return { ok: false, reason: 'Grand total cannot be zero' };
    }

    const e11 = (r1 * c1) / n;
    const e12 = (r1 * c2) / n;
    const e21 = (r2 * c1) / n;
    const e22 = (r2 * c2) / n;

    if (e11 === 0 || e12 === 0 || e21 === 0 || e22 === 0) {
      return { ok: false, reason: 'Expected frequencies cannot be zero. Please check your contingency table data.' };
    }

    // Pearson Chi-Square
    const chi2 = 
      Math.pow(o11 - e11, 2) / e11 +
      Math.pow(o12 - e12, 2) / e12 +
      Math.pow(o21 - e21, 2) / e21 +
      Math.pow(o22 - e22, 2) / e22;

    // Yates Continuity Correction
    const chi2Yates = 
      Math.pow(Math.max(0, Math.abs(o11 - e11) - 0.5), 2) / e11 +
      Math.pow(Math.max(0, Math.abs(o12 - e12) - 0.5), 2) / e12 +
      Math.pow(Math.max(0, Math.abs(o21 - e21) - 0.5), 2) / e21 +
      Math.pow(Math.max(0, Math.abs(o22 - e22) - 0.5), 2) / e22;

    const df = 1;
    let pValue = 1;
    let pValueYates = 1;
    try {
      pValue = 1 - jStat.chisquare.cdf(chi2, df);
      pValueYates = 1 - jStat.chisquare.cdf(chi2Yates, df);
    } catch (e) {
      console.error(e);
    }

    const pValueFisher = runFisherExact ? calcFisherExact(o11, o12, o21, o22) : NaN;

    const phi = Math.sqrt(chi2 / n);
    let interpretation = 'Negligible';
    if (phi >= 0.5) interpretation = 'Strong association';
    else if (phi >= 0.3) interpretation = 'Moderate association';
    else if (phi >= 0.1) interpretation = 'Weak association';

    const minExpected = Math.min(e11, e12, e21, e22);
    const showCochranWarning = minExpected < 5;

    const chartDataObs = [
      { x: `${row1Label}\n(${col1Label})`, y: o11 },
      { x: `${row1Label}\n(${col2Label})`, y: o12 },
      { x: `${row2Label}\n(${col1Label})`, y: o21 },
      { x: `${row2Label}\n(${col2Label})`, y: o22 }
    ];

    const chartDataExp = [
      { x: `${row1Label}\n(${col1Label})`, y: e11 },
      { x: `${row1Label}\n(${col2Label})`, y: e12 },
      { x: `${row2Label}\n(${col1Label})`, y: e21 },
      { x: `${row2Label}\n(${col2Label})`, y: e22 }
    ];

    const tables = chiSquareTables({
      o11, o12, o21, o22,
      row1: row1Label,
      row2: row2Label,
      col1: col1Label,
      col2: col2Label,
      level: ciLevel,
      runFisher: runFisherExact,
    });
    const report = chiSquareReport({
      tables,
      level: ciLevel,
      row1: row1Label,
      row2: row2Label,
      col1: col1Label,
      col2: col2Label,
    });

    const chart = makeChart({
      id: 'chisq-observed-expected',
      kind: 'bar',
      title: copy('Osservati vs attesi per cella'),
      subtitle: copy('χ² = {s1} · p = {s2}', { s1: fmtEst(chi2, 3), s2: fmtEst(pValue, 4) }),
      note: copy('Le barre verdi sono le frequenze osservate, quelle blu le frequenze attese sotto l’ipotesi di indipendenza.'),
      data: {
        bars: [
          ...chartDataObs.map(point => ({ category: point.x, value: point.y, series: copy('Osservato') })),
          ...chartDataExp.map(point => ({ category: point.x, value: Number(point.y.toFixed(2)), series: copy('Atteso') })),
        ],
      },
      fields: { xLabel: copy('Cella'), yLabel: copy('Frequenza'), series: copy('Tipo') },
      options: { valueLabels: true } as never,
    });
    return {
      ok: true,
      title: copy('Test chi-quadro di indipendenza'),
      tables,
      report,
      charts: [chart],
      warnings: showCochranWarning
        ? [
            copy('Regola di Cochran: una o più frequenze attese sono minori di 5 (minimo {s1}). Il test chi-quadro standard può essere impreciso; valuta la correzione di Yates.', { s1: fmtEst(minExpected, 2) }),
          ]
        : [],
    };
  };
