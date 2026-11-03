import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { CanonicalResult } from '../canonical/types';
import type { TableSpec } from '../types';

export const canonicalTables = (result: CanonicalResult): TableSpec[] => {
  const functions: TableSpec = {
    id: 'canonical-functions',
    title: copy('Funzioni canoniche'),
    subtitle: copy('{s1} funzioni', { s1: result.functions.length }),
    columns: [
      { key: 'index', label: copy('Funzione'), format: 'int', align: 'right' },
      { key: 'correlation', label: copy('Correlazione canonica'), format: 'dec3', align: 'right' },
      { key: 'eigenvalue', label: copy('Autovalore'), format: 'dec3', align: 'right' },
      { key: 'wilks', label: copy('Lambda di Wilks'), format: 'dec3', align: 'right' },
      { key: 'chi2', label: copy('χ²'), format: 'dec3', align: 'right' },
      { key: 'df', label: copy('df'), format: 'int', align: 'right' },
      { key: 'p', label: copy('p'), format: 'p', align: 'right' },
      { key: 'redundancyX', label: copy('Ridondanza X'), format: 'dec3', align: 'right' },
      { key: 'redundancyY', label: copy('Ridondanza Y'), format: 'dec3', align: 'right' },
    ],
    rows: result.functions.map(fn => ({
      index: fn.index,
      correlation: fn.correlation,
      eigenvalue: fn.eigenvalue,
      wilks: fn.wilks,
      chi2: fn.chi2,
      df: fn.df,
      p: fn.p,
      redundancyX: fn.redundancyX,
      redundancyY: fn.redundancyY,
    })),
  };

  const coefficients: TableSpec = {
    id: 'canonical-coefficients',
    title: copy('Coefficienti canonici'),
    subtitle: copy('Coefficienti standardizzati e correlazioni di struttura'),
    columns: [
      { key: 'block', label: copy('Blocco'), align: 'left' },
      { key: 'variable', label: copy('Variabile'), align: 'left' },
      { key: 'function', label: copy('Funzione'), format: 'int', align: 'right' },
      { key: 'coefficient', label: copy('Coefficiente'), format: 'dec3', align: 'right' },
      { key: 'structure', label: copy('Struttura'), format: 'dec3', align: 'right' },
    ],
    rows: result.functions.flatMap(fn => [
      ...fn.xCoefficients.map(item => ({
        block: 'X',
        variable: item.variable,
        function: fn.index,
        coefficient: item.coefficient,
        structure: item.structure,
      })),
      ...fn.yCoefficients.map(item => ({
        block: 'Y',
        variable: item.variable,
        function: fn.index,
        coefficient: item.coefficient,
        structure: item.structure,
      })),
    ]),
  };

  const summary: TableSpec = {
    id: 'canonical-summary',
    title: copy('Sintesi'),
    columns: [
      { key: 'measure', label: copy('Misura'), align: 'left' },
      { key: 'value', label: copy('Valore'), align: 'right' },
    ],
    rows: [
      { measure: copy('Osservazioni'), value: String(result.n) },
      { measure: copy('Variabili X'), value: result.xNames.join(', ') },
      { measure: copy('Variabili Y'), value: result.yNames.join(', ') },
      {
        measure: copy('Prima correlazione canonica'),
        value: fmtEst(result.functions[0]?.correlation ?? 0, 3),
      },
    ],
  };
  return [functions, coefficients, summary];
};
