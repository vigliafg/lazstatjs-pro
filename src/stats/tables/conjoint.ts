import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { ConjointResult } from '../conjoint/types';
import type { TableSpec } from '../types';

export const conjointTables = (result: ConjointResult): TableSpec[] => {
  const utilities: TableSpec = {
    id: 'conjoint-utilities',
    title: copy('Utilità delle modalità'),
    subtitle: copy('Codifica a effetti, somma zero dentro ogni attributo'),
    columns: [
      { key: 'attribute', label: copy('Attributo'), align: 'left' },
      { key: 'level', label: copy('Livello'), align: 'left' },
      { key: 'utility', label: copy('Utilità'), format: 'dec3', align: 'right' },
      { key: 'se', label: copy('SE'), format: 'dec3', align: 'right' },
      { key: 't', label: copy('t'), format: 'dec2', align: 'right' },
      { key: 'p', label: copy('p'), format: 'p', align: 'right' },
    ],
    rows: result.levels.map(item => ({ ...item })),
  };
  const importance: TableSpec = {
    id: 'conjoint-importance',
    title: copy('Importanza degli attributi'),
    columns: [
      { key: 'attribute', label: copy('Attributo'), align: 'left' },
      { key: 'range', label: copy('Ampiezza'), format: 'dec3', align: 'right' },
      { key: 'importance', label: copy('Importanza %'), format: 'dec1', align: 'right' },
    ],
    rows: result.attributes.map(item => ({
      attribute: item.attribute,
      range: item.range,
      importance: item.importance,
    })),
  };
  const fit: TableSpec = {
    id: 'conjoint-fit',
    title: copy('Adattamento del modello'),
    columns: [
      { key: 'measure', label: copy('Misura'), align: 'left' },
      { key: 'value', label: copy('Valore'), align: 'right' },
    ],
    rows: [
      { measure: 'R²', value: fmtEst(result.r2, 3) },
      { measure: 'R² corretto', value: fmtEst(result.adjR2, 3) },
      { measure: 'RMSE', value: fmtEst(result.rmse, 3) },
      { measure: 'F', value: fmtEst(result.f, 2) },
      { measure: copy('p del modello'), value: fmtEst(result.fP, 3) },
      { measure: copy('Intercetta'), value: fmtEst(result.intercept, 3) },
      { measure: copy('Profili'), value: String(result.n) },
    ],
  };
  return [utilities, importance, fit];
};
