import type { TableSpec } from '../types';
import { interpretPhi } from '../format';
import { chiSquareStats } from '../kernels/chisquare';

export interface ChiSquareTablesOptions {
  o11: number;
  o12: number;
  o21: number;
  o22: number;
  row1: string;
  row2: string;
  col1: string;
  col2: string;
  level: number;
  runFisher: boolean;
}

export const chiSquareTables = (options: ChiSquareTablesOptions): TableSpec[] => {
  const { o11, o12, o21, o22, row1, row2, col1, col2, level, runFisher } = options;
  const stats = chiSquareStats(o11, o12, o21, o22, level, runFisher);
  if (!stats) return [];
  const {
    r1, r2, c1, c2, n, e11, e12, e21, e22,
    chi2, chi2Yates, g2, pPearson, pYates, pG2, pFisher,
    phi, cramersV, rowProp1, rowProp2, colProp1, colProp2,
    oddsRatio, orLo, orHi, relativeRisk, rrLo, rrHi, riskDiff, seRD, crit,
    minExpected, lowCells, phiLo, phiHi,
  } = stats;

  const contribution = (observed: number, expected: number) =>
    Math.pow(observed - expected, 2) / expected;

  const cell = (label: string, observed: number, expected: number, rowTotal: number, colTotal: number, rowProp: number, colProp: number) => {
    const standardized = (observed - expected) / Math.sqrt(expected);
    const adjusted = (observed - expected) /
      Math.sqrt(expected * (1 - rowProp) * (1 - colProp));
    return {
      cell: label,
      observed,
      expected,
      rowPct: (observed / rowTotal) * 100,
      colPct: (observed / colTotal) * 100,
      totalPct: (observed / n) * 100,
      standardized,
      adjusted,
      contribution: contribution(observed, expected),
    };
  };

  const tables: TableSpec[] = [];

  tables.push({
    id: 'chisq-contingency',
    title: 'Tabella di contingenza e residui',
    subtitle: `${row1}/${row2} × ${col1}/${col2}`,
    columns: [
      { key: 'cell', label: 'Cella', format: 'text' },
      { key: 'observed', label: 'Osservato', format: 'int' },
      { key: 'expected', label: 'Atteso', format: 'dec3' },
      { key: 'rowPct', label: 'Row %', format: 'dec1' },
      { key: 'colPct', label: 'Column %', format: 'dec1' },
      { key: 'totalPct', label: 'Total %', format: 'dec1' },
      { key: 'standardized', label: 'Residuo std.', format: 'dec3' },
      { key: 'adjusted', label: 'Residuo aggiustato', format: 'dec3' },
      { key: 'contribution', label: 'Contributo χ²', format: 'dec3' },
    ],
    rows: [
      cell(`${row1} · ${col1}`, o11, e11, r1, c1, rowProp1, colProp1),
      cell(`${row1} · ${col2}`, o12, e12, r1, c2, rowProp1, colProp2),
      cell(`${row2} · ${col1}`, o21, e21, r2, c1, rowProp2, colProp1),
      cell(`${row2} · ${col2}`, o22, e22, r2, c2, rowProp2, colProp2),
    ],
    notes: [
      `Totali: righe ${r1} / ${r2}, colonne ${c1} / ${c2}, N = ${n}.`,
      'Residuo standardizzato = (O − E)/√E; aggiustato = (O − E)/√(E·(1−row%)(1−col%)). Il contributo è (O − E)²/E.',
    ],
  });

  tables.push({
    id: 'chisq-tests',
    title: 'Test di indipendenza',
    subtitle: `α = ${(1 - level / 100).toFixed(2)}`,
    columns: [
      { key: 'test', label: 'Test', format: 'text' },
      { key: 'statistic', label: 'Statistica', format: 'dec4' },
      { key: 'df', label: 'df', format: 'int' },
      { key: 'p', label: 'p', format: 'p' },
    ],
    rows: [
      { test: 'Pearson χ²', statistic: chi2, df: 1, p: pPearson },
      { test: 'Likelihood ratio G²', statistic: g2, df: 1, p: pG2 },
      { test: 'Yates continuity correction', statistic: chi2Yates, df: 1, p: pYates },
      ...(runFisher ? [{ test: "Fisher's exact (two-sided)", statistic: NaN, df: NaN, p: pFisher }] : []),
    ],
    notes: [
      'Per tabelle 2×2 χ² e G² hanno df = 1; con frequenze attese piccole (< 5) preferire il test esatto di Fisher.',
    ],
  });

  tables.push({
    id: 'chisq-effects',
    title: 'Effect size e misure di associazione',
    subtitle: `CI ${level}%`,
    columns: [
      { key: 'measure', label: 'Misura', format: 'text' },
      { key: 'estimate', label: 'Stima', format: 'dec4' },
      { key: 'ciLo', label: 'CI low', format: 'dec4' },
      { key: 'ciHi', label: 'CI high', format: 'dec4' },
      { key: 'note', label: 'Interpretazione', format: 'text' },
    ],
    rows: [
      { measure: 'φ (phi)', estimate: phi, ciLo: phiLo, ciHi: phiHi, note: interpretPhi(phi) },
      { measure: "Cramér's V", estimate: cramersV, ciLo: phiLo, ciHi: phiHi, note: interpretPhi(cramersV) },
      { measure: 'Odds Ratio', estimate: oddsRatio, ciLo: orLo, ciHi: orHi, note: oddsRatio > 1 ? 'associazione positiva' : oddsRatio < 1 ? 'associazione negativa' : 'nulla' },
      { measure: 'Relative Risk', estimate: relativeRisk, ciLo: rrLo, ciHi: rrHi, note: 'rischio riga 1 / rischio riga 2' },
      { measure: 'Risk Difference', estimate: riskDiff, ciLo: riskDiff - crit * seRD, ciHi: riskDiff + crit * seRD, note: 'differenza assoluta dei rischi' },
    ],
    notes: [
      'Per una tabella 2×2 φ e Cramér’s V coincidono numericamente; sono riportati separatamente perché la formula generale di V usa min(r−1, c−1).',
      'OR: CI di Woolf su log(OR). RR: CI di Katz su log(RR). RD: CI di Wald. Con celle vuote le stime OR/RR non sono definite.',
      'CI di φ/V: bootstrap percentile (500 repliche, seed fisso) ricampionando le osservazioni dalla tabella.',
    ],
  });

  tables.push({
    id: 'chisq-assumptions',
    title: 'Assunzioni',
    columns: [
      { key: 'metric', label: 'Controllo', format: 'text' },
      { key: 'value', label: 'Valore', format: 'dec3' },
      { key: 'note', label: 'Nota', format: 'text' },
    ],
    rows: [
      { metric: 'Frequenza attesa minima', value: minExpected, note: 'Cochran: tutte ≥ 5 desiderabile' },
      { metric: 'Celle con E < 5', value: lowCells, note: `${((lowCells / 4) * 100).toFixed(0)}% delle celle` },
      { metric: 'N', value: n, note: 'numerosità totale' },
    ],
    notes: [
      minExpected < 5
        ? 'Attenzione: una o più frequenze attese sono < 5. Yates o Fisher sono preferibili; per tabelle più grandi serve il test esatto o il bootstrap.'
        : 'Le frequenze attese soddisfano la regola di Cochran.',
    ],
  });

  return tables;
};
