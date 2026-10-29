import { fmtP, fmtPct, interpretR } from '../format';
import { copy } from '../reportCopy';
import { isDecided, show } from '../reportKit';
import { alphaLabel, kmoLabel } from '../multivariate/labels';
import type { TableSpec } from '../types';
import type { AlphaResult, EfaResult, PcaResult } from '../multivariate/types';

export const pcaTables = (result: PcaResult): TableSpec[] => {
  const loadingsColumns = Array.from({ length: result.retained }, (_, index) => ({
    key: copy('pc{s1}', { s1: index + 1 }),
    label: copy('PC{s1}', { s1: index + 1 }),
    format: 'dec3' as const,
  }));
  return [
    {
      id: 'pca-eigen',
      title: copy('Autovalori e varianza spiegata'),
      subtitle: copy('{s1} casi completi · {s2} variabili · {s3} componenti ritenuti', { s1: result.n, s2: result.variables.length, s3: result.retained }),
      columns: [
        { key: 'component', label: copy('Componente'), format: 'text' },
        { key: 'eigenvalue', label: copy('Autovalore'), format: 'dec3' },
        { key: 'variance', label: copy('% varianza'), format: 'dec1' },
        { key: 'cumulative', label: copy('% cumulata'), format: 'dec1' },
        { key: 'retained', label: copy('Ritenuto'), format: 'text' },
      ],
      rows: result.eigenvalues.map((value, index) => ({
        component: copy('PC{s1}', { s1: index + 1 }),
        eigenvalue: value,
        variance: result.variancePct[index],
        cumulative: result.cumulativePct[index],
        retained: index < result.retained ? 'sì' : 'no',
      })),
      notes: [
        result.standardize
          ? copy('Criterio di Kaiser: si ritengono i componenti con autovalore > 1 (matrice di correlazione).')
          : copy('Criterio della media: si ritengono i componenti con autovalore > media degli autovalori (matrice di covarianza).'),
      ],
    },
    {
      id: 'pca-loadings',
      title: copy('Saturazioni e comunalità'),
      subtitle: result.standardize ? copy('PCA su matrice di correlazione') : copy('PCA su matrice di covarianza'),
      columns: [
        { key: 'variable', label: copy('Variabile'), format: 'text' },
        ...loadingsColumns,
        { key: 'communality', label: copy('Comunalità'), format: 'dec3' },
        { key: 'kmo', label: copy('KMO item'), format: 'dec3' },
      ],
      rows: result.variables.map((variable, index) => ({
        variable,
        ...Object.fromEntries(
          loadingsColumns.map((column, component) => [column.key, result.loadings[index][component]])
        ),
        communality: result.communalities[index],
        kmo: result.kmoItems[index],
      })),
      notes: [
        copy('Saturazione = autovettore × √autovalore. La comunalità è la quota di varianza spiegata dai componenti ritenuti.'),
        copy('Con |saturazione| ≥ 0.40 la variabile è di solito considerata associata al componente.'),
      ],
    },
    {
      id: 'pca-adequacy',
      title: copy('Adeguatezza del campione'),
      columns: [
        { key: 'metric', label: copy('Metrica'), format: 'text' },
        { key: 'value', label: copy('Valore'), format: 'dec4' },
        { key: 'detail', label: copy('Dettaglio'), format: 'text' },
      ],
      rows: [
        { metric: copy('KMO'), value: result.kmo, detail: kmoLabel(result.kmo) },
        { metric: copy('Bartlett χ²'), value: result.bartlettChi2, detail: result.standardize ? copy('df = {s1}', { s1: result.bartlettDf }) : copy('solo con matrice di correlazione') },
        { metric: copy('Bartlett p'), value: result.bartlettP, detail: Number.isFinite(result.bartlettP) ? (result.bartlettP < 0.05 ? copy('struttura non sferica') : copy('nessuna struttura lineare rilevata')) : copy('non calcolabile') },
        { metric: copy('Determinante R'), value: result.determinant, detail: copy('valori prossimi a 0 indicano collinearità') },
        { metric: copy('N casi'), value: result.n, detail: copy('casi completi sulle variabili selezionate') },
      ],
      notes: [
        copy('KMO ≥ 0.70 è in genere considerato adeguato per la PCA.'),
        copy('Bartlett significativo indica che la matrice di correlazione non è un’identità: è una condizione necessaria, non sufficiente.'),
      ],
    },
  ];
};

export const alphaTables = (result: AlphaResult): TableSpec[] => [
  {
    id: 'alpha-summary',
    title: copy('Affidabilità della scala'),
    subtitle: copy('{s1} item · {s2} casi completi', { s1: result.k, s2: result.n }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'dec4' },
      { key: 'detail', label: copy('Dettaglio'), format: 'text' },
    ],
    rows: [
      { metric: copy('Cronbach α'), value: result.alpha, detail: alphaLabel(result.alpha) },
      { metric: copy('α standardizzato'), value: result.standardizedAlpha, detail: copy('sulle correlazioni inter-item') },
      { metric: copy('r media inter-item'), value: result.meanInterItem, detail: interpretR(result.meanInterItem) },
      { metric: copy('Media totale'), value: result.totalMean, detail: copy('somma dei punteggi / casi') },
      { metric: copy('SD totale'), value: result.totalSd, detail: copy('deviazione standard della somma') },
    ],
    notes: [
      copy('α = k/(k−1) · [1 − Σσ²item / σ²totale].'),
      copy('α non misura l’unidimensionalità: una scala può avere α alto pur con più fattori.'),
    ],
  },
  {
    id: 'alpha-items',
    title: copy('Diagnostica per item'),
    columns: [
      { key: 'item', label: copy('Item'), format: 'text' },
      { key: 'mean', label: copy('Media'), format: 'dec3' },
      { key: 'sd', label: copy('SD'), format: 'dec3' },
      { key: 'itemTotal', label: copy('r item-totale'), format: 'dec3' },
      { key: 'alphaIfDeleted', label: copy('α se eliminato'), format: 'dec4' },
    ],
    rows: result.items.map((item) => ({
      item: item.item,
      mean: item.mean,
      sd: item.sd,
      itemTotal: item.itemTotal,
      alphaIfDeleted: item.alphaIfDeleted,
    })),
    notes: [
      copy('r item-totale = correlazione dell’item con la somma degli altri item (corretta).'),
      copy('Un α-se-eliminato maggiore dell’α totale segnala un item che riduce la coerenza interna.'),
    ],
  },
  {
    id: 'alpha-matrix',
    title: copy('Correlazioni inter-item'),
    columns: [
      { key: 'item', label: copy('Item'), format: 'text' },
      ...result.items.map((item) => ({ key: item.item, label: item.item, format: 'dec3' as const })),
    ],
    rows: result.items.map((item, index) => ({
      item: item.item,
      ...Object.fromEntries(
        result.items.map((other, column) => [other.item, result.correlations[index][column]])
      ),
    })),
    notes: [copy('Correlazioni di Pearson sui casi completi; la diagonale è 1.')],
  },
];

export const efaTables = (result: EfaResult, variables: string[]): TableSpec[] => [
  {
    id: 'efa-adequacy',
    title: copy('Adeguatezza della soluzione'),
    subtitle: copy('{s1} casi · {s2} variabili · {s3} fattori', { s1: result.n, s2: result.p, s3: result.factors }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'dec4' },
    ],
    rows: [
      { metric: copy('N'), value: result.n },
      { metric: copy('Variabili'), value: result.p },
      { metric: copy('Fattori'), value: result.factors },
      { metric: copy('Bartlett χ²'), value: result.bartlettChi2 },
      { metric: copy('Bartlett df'), value: result.bartlettDf },
      { metric: copy('Bartlett p'), value: result.bartlettP },
      { metric: copy('Determinante R'), value: result.determinant },
      { metric: copy('Omega totale'), value: result.omega },
    ],
    notes: [
      copy('Bartlett verifica che la matrice di correlazione non sia un’identità: è una condizione necessaria, non sufficiente.'),
      copy('Omega totale è calcolato dai loadings e dalle unicità della soluzione ruotata.'),
    ],
  },
  {
    id: 'efa-eigen',
    title: copy('Autovalori e parallel analysis'),
    subtitle: copy('Soglia = 95° percentile dei dati casuali'),
    columns: [
      { key: 'component', label: copy('Componente'), format: 'int' },
      { key: 'eigenvalue', label: copy('Autovalore'), format: 'dec4' },
      { key: 'threshold', label: copy('Soglia parallela'), format: 'dec4' },
      { key: 'variance', label: copy('% varianza'), format: 'dec2' },
      { key: 'cumulative', label: copy('% cumulata'), format: 'dec2' },
    ],
    rows: result.eigenvalues.map((value, index) => ({
      component: index + 1,
      eigenvalue: value,
      threshold: result.parallelThreshold[index] ?? NaN,
      variance: result.variancePct[index] ?? NaN,
      cumulative: result.cumulativePct[index] ?? NaN,
    })),
    notes: [copy('I fattori ritenuti sono quelli con autovalore sopra la soglia della parallel analysis.')],
  },
  {
    id: 'efa-loadings',
    title: copy('Loadings ({s1})', { s1: result.rotation === 'varimax' ? 'varimax' : copy('non ruotati') }),
    columns: [
      { key: 'variable', label: copy('Variabile'), format: 'text' },
      ...Array.from({ length: result.factors }, (_, index) => ({
        key: copy('f{s1}', { s1: index + 1 }),
        label: copy('F{s1}', { s1: index + 1 }),
        format: 'dec3' as const,
      })),
      { key: 'communality', label: copy('Comunalità'), format: 'dec3' },
      { key: 'uniqueness', label: copy('Unicità'), format: 'dec3' },
    ],
    rows: variables.map((name, index) => ({
      variable: name,
      ...Object.fromEntries(result.loadings[index].map((value, factor) => [copy('f{s1}', { s1: factor + 1 }), value])),
      communality: result.communalities[index],
      uniqueness: result.uniqueness[index],
    })),
    notes: [copy('Loadings ≥ 0,40 sono generalmente considerati sostanziali; il segno è arbitrario.')],
  },
];
