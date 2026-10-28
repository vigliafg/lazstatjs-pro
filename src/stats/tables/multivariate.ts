import { fmtP, fmtPct, interpretR } from '../format';
import { isDecided, show } from '../reportKit';
import { alphaLabel, kmoLabel } from '../multivariate/labels';
import type { TableSpec } from '../types';
import type { AlphaResult, PcaResult } from '../multivariate/types';

export const pcaTables = (result: PcaResult): TableSpec[] => {
  const loadingsColumns = Array.from({ length: result.retained }, (_, index) => ({
    key: `pc${index + 1}`,
    label: `PC${index + 1}`,
    format: 'dec3' as const,
  }));
  return [
    {
      id: 'pca-eigen',
      title: 'Autovalori e varianza spiegata',
      subtitle: `${result.n} casi completi · ${result.variables.length} variabili · ${result.retained} componenti ritenuti`,
      columns: [
        { key: 'component', label: 'Componente', format: 'text' },
        { key: 'eigenvalue', label: 'Autovalore', format: 'dec3' },
        { key: 'variance', label: '% varianza', format: 'dec1' },
        { key: 'cumulative', label: '% cumulata', format: 'dec1' },
        { key: 'retained', label: 'Ritenuto', format: 'text' },
      ],
      rows: result.eigenvalues.map((value, index) => ({
        component: `PC${index + 1}`,
        eigenvalue: value,
        variance: result.variancePct[index],
        cumulative: result.cumulativePct[index],
        retained: index < result.retained ? 'sì' : 'no',
      })),
      notes: [
        result.standardize
          ? 'Criterio di Kaiser: si ritengono i componenti con autovalore > 1 (matrice di correlazione).'
          : 'Criterio della media: si ritengono i componenti con autovalore > media degli autovalori (matrice di covarianza).',
      ],
    },
    {
      id: 'pca-loadings',
      title: 'Saturazioni e comunalità',
      subtitle: result.standardize ? 'PCA su matrice di correlazione' : 'PCA su matrice di covarianza',
      columns: [
        { key: 'variable', label: 'Variabile', format: 'text' },
        ...loadingsColumns,
        { key: 'communality', label: 'Comunalità', format: 'dec3' },
        { key: 'kmo', label: 'KMO item', format: 'dec3' },
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
        'Saturazione = autovettore × √autovalore. La comunalità è la quota di varianza spiegata dai componenti ritenuti.',
        'Con |saturazione| ≥ 0.40 la variabile è di solito considerata associata al componente.',
      ],
    },
    {
      id: 'pca-adequacy',
      title: 'Adeguatezza del campione',
      columns: [
        { key: 'metric', label: 'Metrica', format: 'text' },
        { key: 'value', label: 'Valore', format: 'dec4' },
        { key: 'detail', label: 'Dettaglio', format: 'text' },
      ],
      rows: [
        { metric: 'KMO', value: result.kmo, detail: kmoLabel(result.kmo) },
        { metric: 'Bartlett χ²', value: result.bartlettChi2, detail: result.standardize ? `df = ${result.bartlettDf}` : 'solo con matrice di correlazione' },
        { metric: 'Bartlett p', value: result.bartlettP, detail: Number.isFinite(result.bartlettP) ? (result.bartlettP < 0.05 ? 'struttura non sferica' : 'nessuna struttura lineare rilevata') : 'non calcolabile' },
        { metric: 'Determinante R', value: result.determinant, detail: 'valori prossimi a 0 indicano collinearità' },
        { metric: 'N casi', value: result.n, detail: 'casi completi sulle variabili selezionate' },
      ],
      notes: [
        'KMO ≥ 0.70 è in genere considerato adeguato per la PCA.',
        'Bartlett significativo indica che la matrice di correlazione non è un’identità: è una condizione necessaria, non sufficiente.',
      ],
    },
  ];
};

export const alphaTables = (result: AlphaResult): TableSpec[] => [
  {
    id: 'alpha-summary',
    title: 'Affidabilità della scala',
    subtitle: `${result.k} item · ${result.n} casi completi`,
    columns: [
      { key: 'metric', label: 'Metrica', format: 'text' },
      { key: 'value', label: 'Valore', format: 'dec4' },
      { key: 'detail', label: 'Dettaglio', format: 'text' },
    ],
    rows: [
      { metric: 'Cronbach α', value: result.alpha, detail: alphaLabel(result.alpha) },
      { metric: 'α standardizzato', value: result.standardizedAlpha, detail: 'sulle correlazioni inter-item' },
      { metric: 'r media inter-item', value: result.meanInterItem, detail: interpretR(result.meanInterItem) },
      { metric: 'Media totale', value: result.totalMean, detail: 'somma dei punteggi / casi' },
      { metric: 'SD totale', value: result.totalSd, detail: 'deviazione standard della somma' },
    ],
    notes: [
      'α = k/(k−1) · [1 − Σσ²item / σ²totale].',
      'α non misura l’unidimensionalità: una scala può avere α alto pur con più fattori.',
    ],
  },
  {
    id: 'alpha-items',
    title: 'Diagnostica per item',
    columns: [
      { key: 'item', label: 'Item', format: 'text' },
      { key: 'mean', label: 'Media', format: 'dec3' },
      { key: 'sd', label: 'SD', format: 'dec3' },
      { key: 'itemTotal', label: 'r item-totale', format: 'dec3' },
      { key: 'alphaIfDeleted', label: 'α se eliminato', format: 'dec4' },
    ],
    rows: result.items.map((item) => ({
      item: item.item,
      mean: item.mean,
      sd: item.sd,
      itemTotal: item.itemTotal,
      alphaIfDeleted: item.alphaIfDeleted,
    })),
    notes: [
      'r item-totale = correlazione dell’item con la somma degli altri item (corretta).',
      'Un α-se-eliminato maggiore dell’α totale segnala un item che riduce la coerenza interna.',
    ],
  },
  {
    id: 'alpha-matrix',
    title: 'Correlazioni inter-item',
    columns: [
      { key: 'item', label: 'Item', format: 'text' },
      ...result.items.map((item) => ({ key: item.item, label: item.item, format: 'dec3' as const })),
    ],
    rows: result.items.map((item, index) => ({
      item: item.item,
      ...Object.fromEntries(
        result.items.map((other, column) => [other.item, result.correlations[index][column]])
      ),
    })),
    notes: ['Correlazioni di Pearson sui casi completi; la diagonale è 1.'],
  },
];
