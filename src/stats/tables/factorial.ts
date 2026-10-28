import { jStat } from '../jstat';
import { fSF, leveneTest, lillieforsTest } from '../distributions';
import { fmtEst, fmtP } from '../format';
import type { TableSpec } from '../types';
import type { FactorialTablesOptions } from '../factorial/types';
import { dummy, factorialCells, fitModel, uniqueLevels } from '../kernels/factorial';

export const factorialTables = (options: FactorialTablesOptions): TableSpec[] => {
  const { level, interaction, responseName, aName, bName } = options;

  const rows = options.response
    .map((value, index) => ({
      value,
      a: String(options.factorA[index] ?? '').trim(),
      b: String(options.factorB[index] ?? '').trim(),
    }))
    .filter(row => Number.isFinite(row.value) && row.a !== '' && row.b !== '');

  if (rows.length < 4) return [];

  const aLevels = uniqueLevels(rows.map(row => row.a));
  const bLevels = uniqueLevels(rows.map(row => row.b));
  if (aLevels.length < 2 || bLevels.length < 2) return [];

  const y = rows.map(row => row.value);
  const n = y.length;
  const grandMean = jStat.mean(y);
  const totalSS = y.reduce((sum, value) => sum + Math.pow(value - grandMean, 2), 0);

  const cells = factorialCells(options);
  if (interaction && cells.length !== aLevels.length * bLevels.length) return [];
  if (cells.some(cell => cell.n === 0)) return [];

  const one = rows.map(() => [1]);
  const aDummies = rows.map(row => dummy(row.a, aLevels));
  const bDummies = rows.map(row => dummy(row.b, bLevels));
  const interactionColumns = rows.map((row, index) =>
    aDummies[index].flatMap(aValue => bDummies[index].map(bValue => aValue * bValue))
  );

  const withColumns = (extra: number[][]): number[][] =>
    rows.map((_, index) => [...one[index], ...extra[index]]);

  const columnsA = aDummies;
  const columnsAB = aDummies.map((values, index) => [...values, ...bDummies[index]]);
  const columnsFull = interaction
    ? aDummies.map((values, index) => [...values, ...bDummies[index], ...interactionColumns[index]])
    : columnsAB;

  const fitIntercept = fitModel(one, y);
  const fitA = fitModel(withColumns(columnsA), y);
  const fitAB = fitModel(withColumns(columnsAB), y);
  const fitFull = fitModel(withColumns(columnsFull), y);
  if (!fitIntercept || !fitA || !fitAB || !fitFull) return [];

  const dfA = aLevels.length - 1;
  const dfB = bLevels.length - 1;
  const dfAB = interaction ? dfA * dfB : 0;
  const dfError = n - fitFull.rank;

  const ssA = fitIntercept.sse - fitA.sse;
  const ssB = fitA.sse - fitAB.sse;
  const ssAB = interaction ? fitAB.sse - fitFull.sse : NaN;
  const ssError = fitFull.sse;
  const totalSequential = ssA + ssB + (interaction ? ssAB : 0) + ssError;

  const mse = dfError > 0 ? ssError / dfError : NaN;

  const terms: { source: string; ss: number; df: number }[] = [
    { source: aName, ss: ssA, df: dfA },
    { source: bName, ss: ssB, df: dfB },
  ];
  if (interaction) terms.push({ source: `${aName} × ${bName}`, ss: ssAB, df: dfAB });
  terms.push({ source: 'Residuals', ss: ssError, df: dfError });
  terms.push({ source: 'Total', ss: totalSS, df: n - 1 });

  const omega = (ss: number, df: number): number => {
    if (!(mse > 0) || df <= 0) return NaN;
    const value = (ss - df * mse) / (ss + (n - df) * mse);
    return Math.max(0, Math.min(1, value));
  };

  const tables: TableSpec[] = [];

  tables.push({
    id: 'fac-anova',
    title: 'ANOVA a due fattori',
    subtitle: `${aName} x ${bName}${interaction ? ' · con interazione' : ' · solo effetti principali'} · N = ${n}`,
    columns: [
      { key: 'source', label: 'Sorgente', format: 'text' },
      { key: 'ss', label: 'SS', format: 'dec3' },
      { key: 'df', label: 'df', format: 'int' },
      { key: 'ms', label: 'MS', format: 'dec3' },
      { key: 'f', label: 'F', format: 'dec3' },
      { key: 'p', label: 'p', format: 'p' },
      { key: 'eta2p', label: 'η² parziale', format: 'dec3' },
      { key: 'omega2', label: 'ω²', format: 'dec3' },
    ],
    rows: terms.map(term => {
      const isResidual = term.source === 'Residuals';
      const isTotal = term.source === 'Total';
      const ms = term.df > 0 ? term.ss / term.df : NaN;
      return {
        source: term.source,
        ss: term.ss,
        df: term.df,
        ms,
        f: isResidual || isTotal ? NaN : mse > 0 ? ms / mse : NaN,
        p: isResidual || isTotal ? NaN : fSF(mse > 0 ? ms / mse : NaN, term.df, dfError),
        eta2p: isResidual || isTotal ? NaN : ms > 0 && Number.isFinite(mse) ? term.ss / (term.ss + ssError) : NaN,
        omega2: isResidual || isTotal ? NaN : omega(term.ss, term.df),
      };
    }),
    notes: [
      'Le somme dei quadrati sono sequenziali (Type I) nell’ordine indicato: in un disegno bilanciato coincidono con le Type III.',
      `F = MS_effetto / MS_residui, con df residui = ${dfError} (N − numero di celle).`,
      'η² parziale = SS_effetto / (SS_effetto + SS_residui): quota di variabilità non spiegata dal resto del modello.',
      `Il modello spiega ${fmtEst(totalSequential - ssError, 3)} delle ${fmtEst(totalSS, 3)} unità di SS totale; il resto sono i residui.`,
    ],
  });

  const cellRows = cells.map(cell => ({
    a: cell.a,
    b: cell.b,
    n: cell.n,
    mean: cell.mean,
    sd: cell.sd,
  }));

  tables.push({
    id: 'fac-cells',
    title: 'Medie per cella',
    subtitle: `${cells.length} combinazioni · ${cells.every(cell => cell.n === cells[0].n) ? 'disegno bilanciato' : 'disegno non bilanciato'}`,
    columns: [
      { key: 'a', label: aName, format: 'text' },
      { key: 'b', label: bName, format: 'text' },
      { key: 'n', label: 'N', format: 'int' },
      { key: 'mean', label: 'Media', format: 'dec3' },
      { key: 'sd', label: 'SD', format: 'dec3' },
    ],
    rows: cellRows,
    notes: [
      'Sono le medie che alimentano il grafico dell’interazione: se le linee non sono parallele, l’effetto di un fattore cambia a seconda del livello dell’altro.',
    ],
  });

  const marginal = (levels: string[], factor: 'a' | 'b') =>
    levels.map(label => {
      const values = rows.filter(row => row[factor] === label).map(row => row.value);
      return {
        level: label,
        n: values.length,
        mean: jStat.mean(values),
        sd: values.length > 1 ? jStat.stdev(values, true) : NaN,
      };
    });

  tables.push({
    id: 'fac-marginal-a',
    title: `Medie marginali · ${aName}`,
    columns: [
      { key: 'level', label: aName, format: 'text' },
      { key: 'n', label: 'N', format: 'int' },
      { key: 'mean', label: 'Media', format: 'dec3' },
      { key: 'sd', label: 'SD', format: 'dec3' },
    ],
    rows: marginal(aLevels, 'a'),
  });

  tables.push({
    id: 'fac-marginal-b',
    title: `Medie marginali · ${bName}`,
    columns: [
      { key: 'level', label: bName, format: 'text' },
      { key: 'n', label: 'N', format: 'int' },
      { key: 'mean', label: 'Media', format: 'dec3' },
      { key: 'sd', label: 'SD', format: 'dec3' },
    ],
    rows: marginal(bLevels, 'b'),
  });

  // Diagnostics: Levene across cells, normality of residuals would need the
  // residuals themselves, so the cell-level Levene plus R² are reported here.
  const cellGroups = cells.map(cell =>
    rows.filter(row => row.a === cell.a && row.b === cell.b).map(row => row.value)
  );
  const levene = leveneTest(cellGroups, 'mean');

  const residuals: number[] = [];
  const cellMeans = new Map<string, number>();
  cells.forEach(cell => cellMeans.set(`${cell.a}\u0000${cell.b}`, cell.mean));
  rows.forEach(row => residuals.push(row.value - (cellMeans.get(`${row.a}\u0000${row.b}`) ?? grandMean)));
  const lilliefors = lillieforsTest(residuals, 500);

  const r2 = totalSS > 0 ? 1 - ssError / totalSS : NaN;
  const adjustedR2 = 1 - (1 - r2) * ((n - 1) / dfError);

  tables.push({
    id: 'fac-diagnostics',
    title: 'Diagnostica del modello',
    columns: [
      { key: 'metric', label: 'Metrica', format: 'text' },
      { key: 'value', label: 'Valore', format: 'dec4' },
      { key: 'note', label: 'Lettura', format: 'text' },
    ],
    rows: [
      { metric: 'R²', value: r2, note: 'quota di variabilità spiegata dal modello' },
      { metric: 'R² aggiustato', value: adjustedR2, note: 'penalizza il numero di parametri' },
      { metric: 'RMSE', value: Math.sqrt(mse), note: 'deviazione standard dei residui' },
      {
        metric: 'Levene (celle)',
        value: levene.p,
        note: `F = ${fmtEst(levene.stat, 3)}, df = ${levene.df1}, ${levene.df2}: ${levene.p < 0.05 ? 'varianze non omogenee' : 'varianze compatibili'}`,
      },
      {
        metric: 'Lilliefors (residui)',
        value: lilliefors.p,
        note: lilliefors.p < 0.05 ? 'residui non normali: valuta la trasformazione' : 'residui compatibili con la normalità',
      },
      {
        metric: 'Celle con N = 1',
        value: cells.filter(cell => cell.n === 1).length,
        note: 'una cella con una sola osservazione non permette di stimare la variabilità interna',
      },
    ],
    notes: [
      'Con una cella per combinazione il disegno non è stimabile: servono repliche.',
      `Livello di confidenza scelto: ${level}% (usato nel report).`,
    ],
  });

  return tables;
};
