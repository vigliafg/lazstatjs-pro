import { fmtEst, fmtP } from '../format';
import { copy } from '../reportCopy';
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
    title: copy('Test di Friedman'),
    subtitle: copy('{s1} misure ripetute · {s2} blocchi', { s1: test.k, s2: test.n }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'dec4' },
      { key: 'detail', label: copy('Dettaglio'), format: 'text' },
    ],
    rows: [
      { metric: copy('χ² di Friedman'), value: test.chi2, detail: copy('df = {s1}', { s1: test.df }) },
      { metric: copy('p'), value: test.p, detail: copy('approssimazione χ²') },
      { metric: copy('W di Kendall'), value: test.w, detail: copy('0 = nessuna concordanza, 1 = concordanza perfetta') },
      { metric: copy('Correzione per i ranghi uguali'), value: test.tieCorrection, detail: copy('fattore applicato alla statistica') },
    ],
    notes: [
      copy('H₀: le k misure provengono dalla stessa distribuzione (nessuna differenza tra trattamenti).'),
      copy('Blocchi incompleti o valori non numerici vengono esclusi prima del test.'),
    ],
  },
  {
    id: 'friedman-ranks',
    title: copy('Ranghi medi per trattamento'),
    columns: [
      { key: 'treatment', label: copy('Trattamento'), format: 'text' },
      { key: 'meanRank', label: copy('Rango medio'), format: 'dec3' },
      { key: 'rankSum', label: copy('Somma ranghi'), format: 'dec3' },
    ],
    rows: names.map((name, index) => ({
      treatment: name,
      meanRank: test.meanRanks[index],
      rankSum: test.rankSums[index],
    })),
    notes: [copy('Ranghi medi più bassi indicano valori più bassi nel confronto within-subject.')],
  },
  {
    id: 'friedman-nemenyi',
    title: copy('Post-hoc Nemenyi'),
    subtitle: copy('CI {s1}% · differenza critica {s2}', { s1: level, s2: fmtEst(nemenyi.criticalDifference, 3) }),
    columns: [
      { key: 'pair', label: copy('Confronto'), format: 'text' },
      { key: 'diff', label: copy('Δ ranghi medi'), format: 'dec3' },
      { key: 'q', label: copy('q'), format: 'dec3' },
      { key: 'p', label: copy('p'), format: 'p' },
      { key: 'significant', label: copy('Significativo'), format: 'text' },
    ],
    rows: nemenyi.pairs.map((pair) => ({
      pair: copy('{s1} vs {s2}', { s1: names[pair.a], s2: names[pair.b] }),
      diff: pair.diff,
      q: pair.q,
      p: pair.p,
      significant: pair.significant ? 'sì' : 'no',
    })),
    notes: [
      copy('SE = {s1} · q critico = {s2} (studentized range, df ∞).', { s1: fmtEst(nemenyi.se, 3), s2: fmtEst(nemenyi.qCritical, 3) }),
      copy('Nemenyi confronta tutte le coppie controllando il family-wise error; con molti trattamenti è conservativo.'),
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
    title: copy('Tabella dei cambiamenti'),
    subtitle: copy('{s1} vs {s2}', { s1: names[0], s2: names[1] }),
    columns: [
      { key: 'cell', label: copy('Combinazione'), format: 'text' },
      { key: 'count', label: copy('N'), format: 'int' },
    ],
    rows: [
      { cell: copy('Entrambi 1 ({s1}=1, {s2}=1)', { s1: names[0], s2: names[1] }), count: result.a },
      { cell: copy('Solo {s1} = 1', { s1: names[0] }), count: result.b },
      { cell: copy('Solo {s1} = 1', { s1: names[1] }), count: result.c },
      { cell: copy('Entrambi 0'), count: result.d },
    ],
    notes: [copy('Solo le coppie discordanti (b e c) contribuiscono al test.')],
  },
  {
    id: 'mcnemar-test',
    title: copy('Test di McNemar'),
    subtitle: copy('coppie discordanti = {s1} · CI {s2}%', { s1: result.b + result.c, s2: level }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'dec4' },
      { key: 'detail', label: copy('Dettaglio'), format: 'text' },
    ],
    rows: [
      { metric: copy('b (1 → 0)'), value: result.b, detail: names[0] + copy(' positivo, ') + names[1] + copy(' negativo') },
      { metric: copy('c (0 → 1)'), value: result.c, detail: names[0] + copy(' negativo, ') + names[1] + copy(' positivo') },
      { metric: copy('p esatto (binomiale)'), value: result.exactP, detail: copy('b+c prove con p = 0,5') },
      { metric: copy('χ² con correzione di Yates'), value: result.chi2Yates, detail: copy('approssimazione χ² (1 df)') },
      { metric: copy('p asintotico'), value: result.pYates, detail: copy('usare l’esatto con pochi discordanti') },
      { metric: copy('Odds ratio (b/c)'), value: result.oddsRatio, detail: copy('> 1 favorisce ') + names[0] },
    ],
    notes: [copy('Con b+c < 25 l’approssimazione χ² è inaffidabile: fare riferimento al p esatto.')],
  },
];


export const cochranTables = (
  result: CochranResult,
  names: string[],
  level: number
): TableSpec[] => [
  {
    id: 'cochran-test',
    title: copy('Test Q di Cochran'),
    subtitle: copy('{s1} condizioni binarie · {s2} blocchi · CI {s3}%', { s1: result.k, s2: result.n, s3: level }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'dec4' },
      { key: 'detail', label: copy('Dettaglio'), format: 'text' },
    ],
    rows: [
      { metric: copy('Q di Cochran'), value: result.q, detail: copy('df = {s1}', { s1: result.df }) },
      { metric: copy('p'), value: result.p, detail: copy('approssimazione χ²') },
    ],
    notes: [
      copy('H₀: la probabilità di successo è la stessa nelle k condizioni ripetute.'),
      copy('Le righe con valori mancanti o diversi da 0/1 vengono escluse.'),
    ],
  },
  {
    id: 'cochran-counts',
    title: copy('Successi per condizione'),
    columns: [
      { key: 'condition', label: copy('Condizione'), format: 'text' },
      { key: 'successes', label: copy('Successi'), format: 'int' },
      { key: 'proportion', label: copy('Proporzione'), format: 'dec3' },
    ],
    rows: names.map((name, index) => ({
      condition: name,
      successes: result.successes[index],
      proportion: result.successes[index] / result.n,
    })),
    notes: [copy('Proporzioni descrittive: il test Q valuta se le differenze sono compatibili con il caso.')],
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
    title: copy('Test di Jonckheere–Terpstra'),
    subtitle: copy('{s1} gruppi ordinati · N = {s2} · CI {s3}%', { s1: result.k, s2: result.n, s3: level }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'dec4' },
      { key: 'detail', label: copy('Dettaglio'), format: 'text' },
    ],
    rows: [
      { metric: copy('U di Jonckheere–Terpstra'), value: result.u, detail: copy('somma delle coppie ordinate tra gruppi') },
      { metric: copy('E[U]'), value: result.expected, detail: copy('valore atteso sotto H₀') },
      { metric: copy('z'), value: result.z, detail: copy('approssimazione normale') },
      { metric: copy('p (due code)'), value: result.p, detail: copy('trend monotonico in una direzione') },
      { metric: copy('r = z/√N'), value: result.effect, detail: copy('dimensione dell’effetto') },
    ],
    notes: [
      copy('H₀: nessuna tendenza monotonica tra i gruppi ordinati; H₁: i valori crescono (o decrescono) con l’ordine dei gruppi.'),
      copy('I gruppi devono essere inseriti in ordine crescente: l’ordine delle colonne definisce l’ipotesi alternativa.'),
    ],
  },
  {
    id: 'jonckheere-groups',
    title: copy('Descrittive per gruppo'),
    columns: [
      { key: 'group', label: copy('Gruppo'), format: 'text' },
      { key: 'n', label: copy('N'), format: 'int' },
      { key: 'median', label: copy('Mediana'), format: 'dec3' },
      { key: 'mean', label: copy('Media'), format: 'dec3' },
    ],
    rows: groups.map((group, index) => ({
      group: names[index],
      n: result.groupSizes[index],
      median: jStat.median(group),
      mean: jStat.mean(group),
    })),
  },
];

