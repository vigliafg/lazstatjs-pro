import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { SurveyResult } from '../w9Results';
import type { TableSpec } from '../types';

export const surveyTables = (result: SurveyResult): TableSpec[] => {
  const design: TableSpec = {
    id: 'survey-design',
    title: copy('Disegno del campione'),
    columns: [
      { key: 'measure', label: copy('Voce'), align: 'left' },
      { key: 'value', label: copy('Valore'), align: 'right' },
    ],
    rows: [
      { measure: copy('Osservazioni'), value: String(result.design.n) },
      { measure: copy('Strati'), value: String(result.design.strata) },
      { measure: copy('Unità primarie'), value: String(result.design.psus) },
      { measure: copy('Cluster'), value: String(result.design.clusters) },
      { measure: copy('Numerosità ponderata'), value: fmtEst(result.design.weightedN, 1) },
    ],
  };
  const estimates: TableSpec = {
    id: 'survey-estimates',
    title: copy('Stime e intervalli di confidenza'),
    subtitle: copy('Varianza di linearizzazione con PSU aggregate dentro lo strato'),
    columns: [
      { key: 'label', label: copy('Stima'), align: 'left' },
      { key: 'estimate', label: copy('Valore'), format: 'dec3', align: 'right' },
      { key: 'se', label: copy('SE'), format: 'dec3', align: 'right' },
      { key: 'lo', label: copy('Limite inferiore'), format: 'dec3', align: 'right' },
      { key: 'hi', label: copy('Limite superiore'), format: 'dec3', align: 'right' },
      { key: 'df', label: copy('Gradi di libertà'), format: 'dec1', align: 'right' },
      { key: 'deff', label: copy('Effetto disegno'), format: 'dec2', align: 'right' },
    ],
    rows: result.estimates.map(item => ({ ...item })),
    notes: [
      copy('L’effetto disegno confronta la varianza del disegno con quella di un campione casuale semplice della stessa numerosità ponderata.'),
    ],
  };
  const tables = [design, estimates];
  if (result.mode === 'regression') {
    tables.push({
      id: 'survey-coefficients',
      title: copy('Regressione ponderata'),
      subtitle: copy('Errori standard robusti al disegno'),
      columns: [
        { key: 'term', label: copy('Termine'), align: 'left' },
        { key: 'estimate', label: copy('Coefficiente'), format: 'dec3', align: 'right' },
        { key: 'se', label: copy('SE'), format: 'dec3', align: 'right' },
        { key: 't', label: 't', format: 'dec2', align: 'right' },
        { key: 'p', label: 'p', format: 'p', align: 'right' },
      ],
      rows: result.coefficients.map(item => ({ ...item })),
      notes: [
        copy('R² ponderato: {s1}.', { s1: fmtEst(result.r2 ?? NaN, 3) }),
      ],
    });
  }
  return tables;
};
