import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { ChoiceResult } from '../w9Results';
import type { TableSpec } from '../types';

export const choiceTables = (result: ChoiceResult): TableSpec[] => {
  if (result.mode === 'maxdiff') {
    return [
      {
        id: 'choice-maxdiff',
        title: copy('Punteggi MaxDiff'),
        subtitle: copy('Migliori meno peggiori, con quota di preferenza'),
        columns: [
          { key: 'item', label: copy('Elemento'), align: 'left' },
          { key: 'best', label: copy('Migliore'), format: 'int', align: 'right' },
          { key: 'worst', label: copy('Peggiore'), format: 'int', align: 'right' },
          { key: 'score', label: copy('Punteggio'), format: 'int', align: 'right' },
          { key: 'share', label: copy('Quota %'), format: 'dec1', align: 'right' },
          { key: 'se', label: copy('SE'), format: 'dec3', align: 'right' },
        ],
        rows: result.maxdiff.map(item => ({
          ...item,
          share: 100 * item.share,
        })),
        notes: [
          copy('La quota usa un correttivo di Laplace per evitare zeri e uni; la SE è quella di una proporzione.'),
        ],
      },
      {
        id: 'choice-design',
        title: copy('Disegno'),
        columns: [
          { key: 'measure', label: copy('Voce'), align: 'left' },
          { key: 'value', label: copy('Valore'), align: 'right' },
        ],
        rows: [
          { measure: copy('Blocchi validi'), value: String(result.sets) },
          { measure: copy('Righe'), value: String(result.rows) },
        ],
      },
    ];
  }
  const coefficients: TableSpec = {
    id: 'choice-coefficients',
    title: copy('Logit condizionale'),
    subtitle: copy('Coefficienti delle caratteristiche che variano tra alternative'),
    columns: [
      { key: 'term', label: copy('Caratteristica'), align: 'left' },
      { key: 'estimate', label: copy('Coefficiente'), format: 'dec3', align: 'right' },
      { key: 'se', label: copy('SE'), format: 'dec3', align: 'right' },
      { key: 'z', label: 'z', format: 'dec2', align: 'right' },
      { key: 'p', label: 'p', format: 'p', align: 'right' },
    ],
    rows: result.coefficients.map(item => ({ ...item })),
  };
  const shares: TableSpec = {
    id: 'choice-shares',
    title: copy('Quote osservate e previste'),
    subtitle: copy('Quota di scelta per alternativa'),
    columns: [
      { key: 'alternative', label: copy('Alternativa'), align: 'left' },
      { key: 'observed', label: copy('Osservata %'), format: 'dec1', align: 'right' },
      { key: 'predicted', label: copy('Prevista %'), format: 'dec1', align: 'right' },
    ],
    rows: result.shares.map(item => ({
      alternative: item.alternative,
      observed: 100 * item.observed,
      predicted: 100 * item.predicted,
    })),
  };
  const fit: TableSpec = {
    id: 'choice-fit',
    title: copy('Adattamento'),
    columns: [
      { key: 'measure', label: copy('Misura'), align: 'left' },
      { key: 'value', label: copy('Valore'), align: 'right' },
    ],
    rows: [
      { measure: copy('Set di scelta'), value: String(result.sets) },
      { measure: copy('Righe'), value: String(result.rows) },
      { measure: copy('Log-verosimiglianza'), value: fmtEst(result.logLik, 2) },
      { measure: copy('Log-verosimiglianza nulla'), value: fmtEst(result.nullLogLik, 2) },
      { measure: 'McFadden R²', value: fmtEst(result.r2, 3) },
      { measure: 'AIC', value: fmtEst(result.aic, 2) },
      { measure: 'BIC', value: fmtEst(result.bic, 2) },
      { measure: copy('Iterazioni'), value: String(result.iterations) },
    ],
  };
  return [coefficients, shares, fit];
};
