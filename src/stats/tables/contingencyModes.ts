import { copy } from '../reportCopy';
import type { TableSpec } from '../types';
import type {
  ExactContingencyResult,
  MantelHaenszelResult,
  TrendResult,
} from '../contingency/types';

/** Shared tables for the three contingency modes added on top of Pearson χ². */

const alpha = (level: number): string => (1 - level / 100).toFixed(2);

export const mantelHaenszelTables = (
  result: MantelHaenszelResult,
  level: number
): TableSpec[] => {
  const pooledRows: Record<string, number | string>[] = [
    {
      measure: copy('Odds ratio comune (MH)'),
      estimate: result.oddsRatio,
      lo: Math.exp(result.lo),
      hi: Math.exp(result.hi),
      p: result.p,
    },
    {
      measure: copy('χ² Mantel–Haenszel'),
      estimate: result.chi2,
      lo: NaN,
      hi: NaN,
      p: result.p,
    },
  ];

  const stratumRows: Record<string, number | string>[] = result.strata.map(stratum => ({
    stratum: stratum.label,
    a: stratum.a,
    b: stratum.b,
    c: stratum.c,
    d: stratum.d,
    n: stratum.n,
    oddsRatio: stratum.oddsRatio,
    logOddsRatio: stratum.logOddsRatio,
    weight: stratum.weight,
  }));

  return [
    {
      id: 'cont-mh',
      title: copy('Mantel–Haenszel: odds ratio comune'),
      subtitle: copy('{s1} strati · α = {s2}', { s1: result.usedStrata, s2: alpha(level) }),
      columns: [
        { key: 'measure', label: copy('Misura'), format: 'text' },
        { key: 'estimate', label: copy('Stima'), format: 'dec4' },
        { key: 'lo', label: copy('Limite inferiore'), format: 'dec4' },
        { key: 'hi', label: copy('Limite superiore'), format: 'dec4' },
        { key: 'p', label: copy('p'), format: 'p' },
      ],
      rows: pooledRows,
      notes: [
        copy('L’odds ratio comune combina i rapporti dei singoli strati con i pesi di Mantel–Haenszel; l’intervallo è calcolato su scala logaritmica.'),
        copy('Il χ² di Mantel–Haenszel verifica l’associazione comune dopo aver aggiustato per lo strato, con correzione di continuità.'),
        result.corrected
          ? copy('Almeno uno strato aveva una cella vuota: a quelle quattro celle è stato aggiunto 0,5 prima del calcolo.')
          : '',
      ].filter(Boolean),
    },
    {
      id: 'cont-mh-strata',
      title: copy('Dettaglio per strato'),
      subtitle: copy('Odds ratio, log-OR e peso MH di ciascuna tabella 2×2'),
      columns: [
        { key: 'stratum', label: copy('Strato'), format: 'text' },
        { key: 'a', label: 'a', format: 'int' },
        { key: 'b', label: 'b', format: 'int' },
        { key: 'c', label: 'c', format: 'int' },
        { key: 'd', label: 'd', format: 'int' },
        { key: 'n', label: copy('Totale'), format: 'int' },
        { key: 'oddsRatio', label: copy('OR'), format: 'dec4' },
        { key: 'logOddsRatio', label: copy('Log OR'), format: 'dec4' },
        { key: 'weight', label: copy('Peso MH'), format: 'dec4' },
      ],
      rows: stratumRows,
      notes: [
        copy('Il peso MH è b·c/n: è il contributo dello strato al denominatore dell’odds ratio comune.'),
        copy('Un OR di strato sopra 1 indica maggiore odds nella prima riga; sotto 1 indica maggiore odds nella seconda.'),
      ],
    },
  ];
};

export const trendTables = (
  result: TrendResult,
  rowLabels: string[],
  colLabels: string[]
): TableSpec[] => {
  const successLabel = colLabels[0] ?? copy('Successi');
  const proportionRows: Record<string, number | string>[] = result.rows.map((row, index) => ({
    row: rowLabels[index] ?? copy('Riga {s1}', { s1: index + 1 }),
    score: result.scores[index],
    successes: row.successes,
    total: row.total,
    proportion: row.proportion,
  }));

  return [
    {
      id: 'cont-trend',
      title: copy('Trend di Cochran–Armitage'),
      subtitle: copy('Statistica z² con 1 grado di libertà'),
      columns: [
        { key: 'test', label: copy('Test'), format: 'text' },
        { key: 'statistic', label: copy('Statistica'), format: 'dec4' },
        { key: 'df', label: copy('df'), format: 'int' },
        { key: 'p', label: copy('p'), format: 'p' },
      ],
      rows: [
        {
          test: copy('Cochran–Armitage per il trend'),
          statistic: result.statistic,
          df: result.df,
          p: result.p,
        },
      ],
      notes: [
        copy('Il test confronta la proporzione di “{s1}” con i punteggi assegnati alle righe: un p piccolo indica un andamento sistematico, non solo una differenza tra gruppi.', { s1: successLabel }),
        copy('La statistica è z² e coincide con il test di regressione lineare pesata della proporzione sul punteggio.'),
      ],
    },
    {
      id: 'cont-trend-proportions',
      title: copy('Proporzioni per riga'),
      subtitle: copy('Punteggio, successi e proporzione osservata'),
      columns: [
        { key: 'row', label: copy('Riga'), format: 'text' },
        { key: 'score', label: copy('Punteggio'), format: 'dec4' },
        { key: 'successes', label: successLabel, format: 'int' },
        { key: 'total', label: copy('Totale'), format: 'int' },
        { key: 'proportion', label: copy('Proporzione'), format: 'dec4' },
      ],
      rows: proportionRows,
      notes: [
        copy('La proporzione è successi / totale di riga. Il test ordina le righe secondo i punteggi, non secondo l’etichetta.'),
      ],
    },
  ];
};

const methodLabel = (result: ExactContingencyResult): string => {
  switch (result.method) {
    case 'fisher':
      return copy("Fisher's exact (two-sided)");
    case 'enumeration':
      return copy('Enumerazione esatta a margini fissi');
    case 'monteCarlo':
      return copy('Monte Carlo a margini fissi');
    default:
      return copy('Non calcolabile');
  }
};

const detailLabel = (result: ExactContingencyResult): string => {
  if (result.method === 'enumeration') {
    return copy('{s1} tavole enumerate', { s1: (result.tables ?? 0).toLocaleString('it-IT') });
  }
  if (result.method === 'monteCarlo') {
    return copy('{s1} simulazioni deterministiche', {
      s1: (result.simulations ?? 0).toLocaleString('it-IT'),
    });
  }
  if (result.method === 'fisher') return copy('Tabella 2×2 · p da Fisher');
  return result.reason ?? copy('Motivo non disponibile');
};

export const exactTables = (
  result: ExactContingencyResult,
  rowCount: number,
  colCount: number,
  level: number
): TableSpec[] => [
  {
    id: 'cont-exact',
    title: copy('Test esatto R×C'),
    subtitle: copy('{s1} × {s2} · α = {s3}', {
      s1: rowCount,
      s2: colCount,
      s3: alpha(level),
    }),
    columns: [
      { key: 'method', label: copy('Metodo'), format: 'text' },
      { key: 'statistic', label: copy('Statistica Σ|O − E|'), format: 'dec4' },
      { key: 'p', label: copy('p'), format: 'p' },
      { key: 'detail', label: copy('Dettaglio'), format: 'text' },
    ],
    rows: [
      {
        method: methodLabel(result),
        statistic: result.statistic,
        p: result.p,
        detail: detailLabel(result),
      },
    ],
    notes: [
      copy('Per una tabella 2×2 il p è quello di Fisher a due code; per tabelle più grandi il p somma le probabilità ipergeometriche delle tavole con margini fissi e statistica almeno pari a quella osservata.'),
      result.method === 'monteCarlo'
        ? copy('Il numero di tavole supera il budget di enumerazione: il p è stimato con un Monte Carlo deterministico a margini fissi.')
        : '',
      result.method === 'unavailable'
        ? copy('La tabella non permette di calcolare il p esatto: controlla celle, margini e dimensione.')
        : '',
    ].filter(Boolean),
  },
];
