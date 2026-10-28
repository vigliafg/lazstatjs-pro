import { fmtEst, fmtP } from '../format';
import { jStat } from '../jstat';
import type { TableSpec } from '../types';
import type {
  CochranResult, FriedmanResult, JonckheereResult, McNemarResult, NemenyiResult,
} from '../repeated/types';

export const friedmanTables = (
  test: FriedmanResult,
  nemenyi: NemenyiResult,
  names: string[],
  level: number
): TableSpec[] => [
  {
    id: 'friedman-test',
    title: 'Test di Friedman',
    subtitle: `${test.k} misure ripetute · ${test.n} blocchi`,
    columns: [
      { key: 'metric', label: 'Metrica', format: 'text' },
      { key: 'value', label: 'Valore', format: 'dec4' },
      { key: 'detail', label: 'Dettaglio', format: 'text' },
    ],
    rows: [
      { metric: 'χ² di Friedman', value: test.chi2, detail: `df = ${test.df}` },
      { metric: 'p', value: test.p, detail: 'approssimazione χ²' },
      { metric: 'W di Kendall', value: test.w, detail: '0 = nessuna concordanza, 1 = concordanza perfetta' },
      { metric: 'Correzione per i ranghi uguali', value: test.tieCorrection, detail: 'fattore applicato alla statistica' },
    ],
    notes: [
      'H₀: le k misure provengono dalla stessa distribuzione (nessuna differenza tra trattamenti).',
      'Blocchi incompleti o valori non numerici vengono esclusi prima del test.',
    ],
  },
  {
    id: 'friedman-ranks',
    title: 'Ranghi medi per trattamento',
    columns: [
      { key: 'treatment', label: 'Trattamento', format: 'text' },
      { key: 'meanRank', label: 'Rango medio', format: 'dec3' },
      { key: 'rankSum', label: 'Somma ranghi', format: 'dec3' },
    ],
    rows: names.map((name, index) => ({
      treatment: name,
      meanRank: test.meanRanks[index],
      rankSum: test.rankSums[index],
    })),
    notes: ['Ranghi medi più bassi indicano valori più bassi nel confronto within-subject.'],
  },
  {
    id: 'friedman-nemenyi',
    title: 'Post-hoc Nemenyi',
    subtitle: `CI ${level}% · differenza critica ${fmtEst(nemenyi.criticalDifference, 3)}`,
    columns: [
      { key: 'pair', label: 'Confronto', format: 'text' },
      { key: 'diff', label: 'Δ ranghi medi', format: 'dec3' },
      { key: 'q', label: 'q', format: 'dec3' },
      { key: 'p', label: 'p', format: 'p' },
      { key: 'significant', label: 'Significativo', format: 'text' },
    ],
    rows: nemenyi.pairs.map((pair) => ({
      pair: `${names[pair.a]} vs ${names[pair.b]}`,
      diff: pair.diff,
      q: pair.q,
      p: pair.p,
      significant: pair.significant ? 'sì' : 'no',
    })),
    notes: [
      `SE = ${fmtEst(nemenyi.se, 3)} · q critico = ${fmtEst(nemenyi.qCritical, 3)} (studentized range, df ∞).`,
      'Nemenyi confronta tutte le coppie controllando il family-wise error; con molti trattamenti è conservativo.',
    ],
  },
];


export const mcnemarTables = (
  result: McNemarResult,
  names: [string, string],
  level: number
): TableSpec[] => [
  {
    id: 'mcnemar-counts',
    title: 'Tabella dei cambiamenti',
    subtitle: `${names[0]} vs ${names[1]}`,
    columns: [
      { key: 'cell', label: 'Combinazione', format: 'text' },
      { key: 'count', label: 'N', format: 'int' },
    ],
    rows: [
      { cell: `Entrambi 1 (${names[0]}=1, ${names[1]}=1)`, count: result.a },
      { cell: `Solo ${names[0]} = 1`, count: result.b },
      { cell: `Solo ${names[1]} = 1`, count: result.c },
      { cell: 'Entrambi 0', count: result.d },
    ],
    notes: ['Solo le coppie discordanti (b e c) contribuiscono al test.'],
  },
  {
    id: 'mcnemar-test',
    title: 'Test di McNemar',
    subtitle: `coppie discordanti = ${result.b + result.c} · CI ${level}%`,
    columns: [
      { key: 'metric', label: 'Metrica', format: 'text' },
      { key: 'value', label: 'Valore', format: 'dec4' },
      { key: 'detail', label: 'Dettaglio', format: 'text' },
    ],
    rows: [
      { metric: 'b (1 → 0)', value: result.b, detail: names[0] + ' positivo, ' + names[1] + ' negativo' },
      { metric: 'c (0 → 1)', value: result.c, detail: names[0] + ' negativo, ' + names[1] + ' positivo' },
      { metric: 'p esatto (binomiale)', value: result.exactP, detail: 'b+c prove con p = 0,5' },
      { metric: 'χ² con correzione di Yates', value: result.chi2Yates, detail: 'approssimazione χ² (1 df)' },
      { metric: 'p asintotico', value: result.pYates, detail: 'usare l’esatto con pochi discordanti' },
      { metric: 'Odds ratio (b/c)', value: result.oddsRatio, detail: '> 1 favorisce ' + names[0] },
    ],
    notes: ['Con b+c < 25 l’approssimazione χ² è inaffidabile: fare riferimento al p esatto.'],
  },
];


export const cochranTables = (
  result: CochranResult,
  names: string[],
  level: number
): TableSpec[] => [
  {
    id: 'cochran-test',
    title: 'Test Q di Cochran',
    subtitle: `${result.k} condizioni binarie · ${result.n} blocchi · CI ${level}%`,
    columns: [
      { key: 'metric', label: 'Metrica', format: 'text' },
      { key: 'value', label: 'Valore', format: 'dec4' },
      { key: 'detail', label: 'Dettaglio', format: 'text' },
    ],
    rows: [
      { metric: 'Q di Cochran', value: result.q, detail: `df = ${result.df}` },
      { metric: 'p', value: result.p, detail: 'approssimazione χ²' },
    ],
    notes: [
      'H₀: la probabilità di successo è la stessa nelle k condizioni ripetute.',
      'Le righe con valori mancanti o diversi da 0/1 vengono escluse.',
    ],
  },
  {
    id: 'cochran-counts',
    title: 'Successi per condizione',
    columns: [
      { key: 'condition', label: 'Condizione', format: 'text' },
      { key: 'successes', label: 'Successi', format: 'int' },
      { key: 'proportion', label: 'Proporzione', format: 'dec3' },
    ],
    rows: names.map((name, index) => ({
      condition: name,
      successes: result.successes[index],
      proportion: result.successes[index] / result.n,
    })),
    notes: ['Proporzioni descrittive: il test Q valuta se le differenze sono compatibili con il caso.'],
  },
];


export const jonckheereTables = (
  result: JonckheereResult,
  groups: number[][],
  names: string[],
  level: number
): TableSpec[] => [
  {
    id: 'jonckheere-test',
    title: 'Test di Jonckheere–Terpstra',
    subtitle: `${result.k} gruppi ordinati · N = ${result.n} · CI ${level}%`,
    columns: [
      { key: 'metric', label: 'Metrica', format: 'text' },
      { key: 'value', label: 'Valore', format: 'dec4' },
      { key: 'detail', label: 'Dettaglio', format: 'text' },
    ],
    rows: [
      { metric: 'U di Jonckheere–Terpstra', value: result.u, detail: 'somma delle coppie ordinate tra gruppi' },
      { metric: 'E[U]', value: result.expected, detail: 'valore atteso sotto H₀' },
      { metric: 'z', value: result.z, detail: 'approssimazione normale' },
      { metric: 'p (due code)', value: result.p, detail: 'trend monotonico in una direzione' },
      { metric: 'r = z/√N', value: result.effect, detail: 'dimensione dell’effetto' },
    ],
    notes: [
      'H₀: nessuna tendenza monotonica tra i gruppi ordinati; H₁: i valori crescono (o decrescono) con l’ordine dei gruppi.',
      'I gruppi devono essere inseriti in ordine crescente: l’ordine delle colonne definisce l’ipotesi alternativa.',
    ],
  },
  {
    id: 'jonckheere-groups',
    title: 'Descrittive per gruppo',
    columns: [
      { key: 'group', label: 'Gruppo', format: 'text' },
      { key: 'n', label: 'N', format: 'int' },
      { key: 'median', label: 'Mediana', format: 'dec3' },
      { key: 'mean', label: 'Media', format: 'dec3' },
    ],
    rows: groups.map((group, index) => ({
      group: names[index],
      n: result.groupSizes[index],
      median: jStat.median(group),
      mean: jStat.mean(group),
    })),
  },
];

