import { chi2SF } from '../distributions';
import { calcFisherExact } from '../kernels';
import type { TableSpec } from '../types';
import type { ContingencyOptions } from '../contingency/types';
import { EPS, isRectangular, simulateFixedMarginChi2 } from '../kernels/contingency';

export const contingencyTables = (options: ContingencyOptions): TableSpec[] => {
  const { observed, rowLabels, colLabels, level, exact = true, monteCarlo = true } = options;
  const simulations = options.simulations ?? 10000;

  if (!isRectangular(observed)) return [];

  const rowCount = observed.length;
  const colCount = observed[0].length;
  const rowTotals = observed.map(row => row.reduce((sum, value) => sum + value, 0));
  const colTotals = Array.from({ length: colCount }, (_, j) =>
    observed.reduce((sum, row) => sum + row[j], 0)
  );
  const n = rowTotals.reduce((sum, value) => sum + value, 0);
  if (n <= 0) return [];
  if (rowTotals.some(total => total <= 0) || colTotals.some(total => total <= 0)) return [];

  const expected = observed.map((row, i) =>
    row.map((_, j) => (rowTotals[i] * colTotals[j]) / n)
  );

  const contribution = (value: number, expectancy: number) =>
    expectancy > 0 ? Math.pow(value - expectancy, 2) / expectancy : 0;

  const chi2 = observed.reduce(
    (sum, row, i) => sum + row.reduce((inner, value, j) => inner + contribution(value, expected[i][j]), 0),
    0
  );

  const g2 = 2 * observed.reduce(
    (sum, row, i) =>
      sum + row.reduce(
        (inner, value, j) =>
          value > 0 && expected[i][j] > 0 ? inner + value * Math.log(value / expected[i][j]) : inner,
        0
      ),
    0
  );

  const df = (rowCount - 1) * (colCount - 1);
  const pPearson = chi2SF(chi2, df);
  const pG2 = chi2SF(g2, df);

  const yates = rowCount === 2 && colCount === 2;
  let chi2Yates = NaN;
  let pYates = NaN;
  if (yates) {
    chi2Yates = observed.reduce(
      (sum, row, i) =>
        sum + row.reduce(
          (inner, value, j) =>
            inner + Math.pow(Math.max(0, Math.abs(value - expected[i][j]) - 0.5), 2) / expected[i][j],
          0
        ),
      0
    );
    pYates = chi2SF(chi2Yates, 1);
  }

  const flat = observed.flat();
  const minExpected = Math.min(...expected.flat());
  const lowCells = expected.flat().filter(value => value < 5).length;
  const cochranFails = lowCells > 0;

  // Monte Carlo p-value with fixed margins (only when the asymptotic test is shaky)
  let pMonteCarlo = NaN;
  if (monteCarlo && cochranFails) {
    const simulated = simulateFixedMarginChi2(observed, simulations, options.seed);
    const atLeast = simulated.filter(value => value >= chi2 - EPS).length;
    pMonteCarlo = (1 + atLeast) / (simulated.length + 1);
  }

  const pFisher = yates && exact ? calcFisherExact(flat[0], flat[1], flat[2], flat[3]) : NaN;

  const cramersV = n > 0 ? Math.sqrt(chi2 / (n * Math.min(rowCount - 1, colCount - 1))) : NaN;
  const phi = yates ? Math.sqrt(chi2 / n) : NaN;
  const contingencyCoefficient = Math.sqrt(chi2 / (chi2 + n));

  const observedRows = observed.map((row, i) => {
    const entry: Record<string, number | string> = {
      label: rowLabels[i] ?? `Row ${i + 1}`,
      total: rowTotals[i],
    };
    row.forEach((value, j) => {
      entry[`c${j}`] = value;
    });
    return entry;
  });

  const expectedRows = expected.map((row, i) => {
    const entry: Record<string, number | string> = {
      label: rowLabels[i] ?? `Row ${i + 1}`,
      total: rowTotals[i],
    };
    row.forEach((value, j) => {
      entry[`c${j}`] = value;
    });
    return entry;
  });

  const residualRows: Record<string, number | string>[] = [];
  observed.forEach((row, i) => {
    row.forEach((value, j) => {
      const expectancy = expected[i][j];
      const std = expectancy > 0 ? (value - expectancy) / Math.sqrt(expectancy) : NaN;
      const rowShare = rowTotals[i] / n;
      const colShare = colTotals[j] / n;
      const denom = Math.sqrt(Math.max(EPS, (1 - rowShare) * (1 - colShare)));
      residualRows.push({
        cell: `${rowLabels[i] ?? `Row ${i + 1}`} · ${colLabels[j] ?? `Col ${j + 1}`}`,
        observed: value,
        expected: expectancy,
        residual: std,
        adjusted: denom > 0 ? std / denom : NaN,
        contribution: contribution(value, expectancy),
      });
    });
  });

  const tables: TableSpec[] = [];

  tables.push({
    id: 'cont-observed',
    title: 'Tabella di contingenza (frequenze osservate)',
    subtitle: `${rowCount} × ${colCount} · N = ${n}`,
    columns: [
      { key: 'label', label: 'Riga', format: 'text' },
      ...colLabels.map((label, j) => ({ key: `c${j}`, label, format: 'int' as const })),
      { key: 'total', label: 'Totale', format: 'int' },
    ],
    rows: observedRows,
    notes: ['Ogni cella contiene il numero di osservazioni con quella combinazione di categorie.'],
  });

  tables.push({
    id: 'cont-expected',
    title: 'Frequenze attese sotto indipendenza',
    subtitle: 'E = (totale riga × totale colonna) / N',
    columns: [
      { key: 'label', label: 'Riga', format: 'text' },
      ...colLabels.map((label, j) => ({ key: `c${j}`, label, format: 'dec2' as const })),
      { key: 'total', label: 'Totale', format: 'int' },
    ],
    rows: expectedRows,
    notes: [
      'Le attese sono le frequenze che si vedrebbero se le due variabili fossero indipendenti.',
      cochranFails
        ? `${lowCells} cella/e su ${rowCount * colCount} hanno attesa < 5: l'approssimazione χ² è fragile (regola di Cochran).`
        : 'Tutte le attese sono ≥ 5: l’approssimazione χ² è adeguata.',
    ],
  });

  tables.push({
    id: 'cont-residuals',
    title: 'Residui e contributi al χ²',
    subtitle: 'Residuo standardizzato = (O − E)/√E',
    columns: [
      { key: 'cell', label: 'Cella', format: 'text' },
      { key: 'observed', label: 'O', format: 'int' },
      { key: 'expected', label: 'E', format: 'dec2' },
      { key: 'residual', label: 'Residuo std.', format: 'dec2' },
      { key: 'adjusted', label: 'Residuo aggiustato', format: 'dec2' },
      { key: 'contribution', label: 'Contributo χ²', format: 'dec3' },
    ],
    rows: residualRows,
    notes: [
      'Un residuo aggiustato oltre ±2 segnala la cella che si discosta di più dall’indipendenza.',
      'Il contributo è quanto quella cella pesa nel χ² totale: le prime posizioni spiegano l’associazione.',
    ],
  });

  const testRows: Record<string, number | string>[] = [
    { test: 'Pearson χ²', statistic: chi2, df, p: pPearson },
    { test: 'Likelihood ratio G²', statistic: g2, df, p: pG2 },
  ];
  if (yates) testRows.push({ test: 'Yates (correzione di continuità)', statistic: chi2Yates, df: 1, p: pYates });
  if (yates && Number.isFinite(pFisher)) {
    testRows.push({ test: "Fisher's exact (two-sided)", statistic: NaN, df: NaN, p: pFisher });
  }
  if (Number.isFinite(pMonteCarlo)) {
    testRows.push({
      test: `Monte Carlo (${simulations.toLocaleString('it-IT')} tavole, margini fissi)`,
      statistic: chi2,
      df,
      p: pMonteCarlo,
    });
  }

  tables.push({
    id: 'cont-tests',
    title: 'Test di indipendenza',
    subtitle: `α = ${(1 - level / 100).toFixed(2)}`,
    columns: [
      { key: 'test', label: 'Test', format: 'text' },
      { key: 'statistic', label: 'Statistica', format: 'dec4' },
      { key: 'df', label: 'df', format: 'int' },
      { key: 'p', label: 'p', format: 'p' },
    ],
    rows: testRows,
    notes: [
      `df = (righe − 1)(colonne − 1) = ${df}.`,
      'χ² e G² condividono le stesse assunzioni: osservazioni indipendenti, categorie esaustive, attese sufficientemente grandi.',
      'Il test dice che esiste un’associazione, non quanto sia forte né in quale direzione: per quello servono residui e misure di associazione.',
    ],
  });

  const associationRows: Record<string, string | number>[] = [
    { measure: 'Cramér’s V', value: cramersV, note: '0 = nessuna associazione, 1 = associazione perfetta' },
    {
      measure: 'Coefficiente di contingenza C',
      value: contingencyCoefficient,
      note: 'Dipende dal numero di categorie: confrontabile solo tra tabelle di stessa forma',
    },
  ];
  if (yates) {
    associationRows.unshift({
      measure: 'φ (phi)',
      value: phi,
      note: 'Per tabelle 2×2 coincide con la correlazione tra le due variabili binarie',
    });
  }

  tables.push({
    id: 'cont-association',
    title: 'Ampiezza dell’associazione',
    columns: [
      { key: 'measure', label: 'Misura', format: 'text' },
      { key: 'value', label: 'Valore', format: 'dec3' },
      { key: 'note', label: 'Lettura', format: 'text' },
    ],
    rows: associationRows,
    notes: ['Il p-value dipende da N; queste misure no, ed è per questo che vanno riportate insieme.'],
  });

  return tables;
};
