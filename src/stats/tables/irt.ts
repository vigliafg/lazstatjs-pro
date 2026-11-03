import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { IrtResult } from '../irt/types';
import type { TableSpec } from '../types';

export const irtTables = (result: IrtResult): TableSpec[] => {
  const items: TableSpec = {
    id: 'irt-items',
    title: copy('Parametri degli item'),
    subtitle: result.model === '2pl' ? '2PL' : 'Rasch',
    columns: [
      { key: 'variable', label: copy('Item'), align: 'left' },
      { key: 'discrimination', label: copy('Discriminazione a'), format: 'dec3', align: 'right' },
      { key: 'seDiscrimination', label: copy('SE a'), format: 'dec3', align: 'right' },
      { key: 'difficulty', label: copy('Difficoltà b'), format: 'dec3', align: 'right' },
      { key: 'seDifficulty', label: copy('SE b'), format: 'dec3', align: 'right' },
      { key: 'pCorrect', label: copy('Proporzione corrette'), format: 'dec3', align: 'right' },
    ],
    rows: result.items.map(item => ({ ...item })),
  };
  const fit: TableSpec = {
    id: 'irt-fit',
    title: copy('Adattamento e affidabilità'),
    columns: [
      { key: 'measure', label: copy('Misura'), align: 'left' },
      { key: 'value', label: copy('Valore'), align: 'right' },
    ],
    rows: [
      { measure: copy('Log-verosimiglianza'), value: fmtEst(result.logLik, 3) },
      { measure: 'AIC', value: fmtEst(result.aic, 2) },
      { measure: 'BIC', value: fmtEst(result.bic, 2) },
      { measure: copy('Affidabilità'), value: fmtEst(result.reliability, 3) },
      { measure: copy('Iterazioni'), value: String(result.iterations) },
    ],
  };
  const persons: TableSpec = {
    id: 'irt-persons',
    title: copy('Punteggi di abilità'),
    subtitle: copy('Stima EAP e errore standard'),
    columns: [
      { key: 'row', label: copy('Riga'), format: 'int', align: 'right' },
      { key: 'theta', label: copy('Abilità θ'), format: 'dec3', align: 'right' },
      { key: 'se', label: copy('SE'), format: 'dec3', align: 'right' },
      { key: 'total', label: copy('Punteggio'), format: 'int', align: 'right' },
    ],
    rows: result.persons.slice(0, 200).map(person => ({ ...person })),
  };
  return [items, fit, persons];
};
