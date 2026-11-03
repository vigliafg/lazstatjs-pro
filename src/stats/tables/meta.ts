import { copy } from '../reportCopy';
import type { MetaResult } from '../w9Results';
import type { TableSpec } from '../types';

export const metaTables = (result: MetaResult): TableSpec[] => {
  const pooled: TableSpec = {
    id: 'meta-pooled',
    title: copy('Stima pooled'),
    subtitle: copy('Modello a effetti fissi e modello a effetti casuali'),
    columns: [
      { key: 'model', label: copy('Modello'), align: 'left' },
      { key: 'estimate', label: copy('Stima'), format: 'dec3', align: 'right' },
      { key: 'se', label: copy('SE'), format: 'dec3', align: 'right' },
      { key: 'lo', label: copy('Limite inferiore'), format: 'dec3', align: 'right' },
      { key: 'hi', label: copy('Limite superiore'), format: 'dec3', align: 'right' },
      { key: 'z', label: 'z', format: 'dec2', align: 'right' },
      { key: 'p', label: 'p', format: 'p', align: 'right' },
    ],
    rows: [
      {
        model: copy('Effetti fissi'),
        estimate: result.fixed.estimate,
        se: result.fixed.se,
        lo: result.fixed.lo,
        hi: result.fixed.hi,
        z: result.fixed.z,
        p: result.fixed.p,
      },
      ...(result.random
        ? [
            {
              model: copy('Effetti casuali ({s1})', { s1: result.method }),
              estimate: result.random.estimate,
              se: result.random.se,
              lo: result.random.lo,
              hi: result.random.hi,
              z: result.random.z,
              p: result.random.p,
            },
          ]
        : []),
    ],
  };
  const heterogeneity: TableSpec = {
    id: 'meta-heterogeneity',
    title: copy('Eterogeneità'),
    columns: [
      { key: 'measure', label: copy('Misura'), align: 'left' },
      { key: 'value', label: copy('Valore'), align: 'right' },
    ],
    rows: [
      { measure: 'Q', value: result.q },
      { measure: copy('Gradi di libertà'), value: result.qDf },
      { measure: copy('p di Q'), value: result.qP },
      { measure: 'I² %', value: 100 * result.i2 },
      { measure: 'H²', value: result.h2 },
      { measure: 'τ²', value: result.tau2 },
      { measure: 'τ', value: result.tau },
    ],
    notes: [
      copy('I² è la quota di variabilità totale attribuita all’eterogeneità piuttosto che al caso; τ² è la varianza tra studi.'),
    ],
  };
  const studies: TableSpec = {
    id: 'meta-studies',
    title: copy('Studi'),
    subtitle: copy('Peso nel modello usato e intervallo al livello scelto'),
    columns: [
      { key: 'label', label: copy('Studio'), align: 'left' },
      { key: 'effect', label: copy('Effetto'), format: 'dec3', align: 'right' },
      { key: 'se', label: copy('SE'), format: 'dec3', align: 'right' },
      { key: 'weight', label: copy('Peso %'), format: 'dec1', align: 'right' },
      { key: 'lo', label: copy('Limite inferiore'), format: 'dec3', align: 'right' },
      { key: 'hi', label: copy('Limite superiore'), format: 'dec3', align: 'right' },
      { key: 'standardizedResidual', label: copy('Residuo standardizzato'), format: 'dec2', align: 'right' },
    ],
    rows: result.studies.map(item => ({ ...item })),
  };
  const tables = [pooled, heterogeneity, studies];
  if (result.prediction) {
    tables.push({
      id: 'meta-prediction',
      title: copy('Intervallo di previsione'),
      columns: [
        { key: 'measure', label: copy('Voce'), align: 'left' },
        { key: 'value', label: copy('Valore'), align: 'right' },
      ],
      rows: [
        { measure: copy('Limite inferiore'), value: result.prediction.lo },
        { measure: copy('Limite superiore'), value: result.prediction.hi },
      ],
      notes: [
        copy('L’intervallo di previsione descrive dove cadrebbe l’effetto di un nuovo studio simile, non la precisione della media.'),
      ],
    });
  }
  if (result.egger) {
    tables.push({
      id: 'meta-egger',
      title: copy('Test di Egger'),
      columns: [
        { key: 'measure', label: copy('Misura'), align: 'left' },
        { key: 'value', label: copy('Valore'), align: 'right' },
      ],
      rows: [
        { measure: copy('Intercetta'), value: result.egger.intercept },
        { measure: copy('SE'), value: result.egger.se },
        { measure: 't', value: result.egger.t },
        { measure: 'p', value: result.egger.p },
      ],
      notes: [
        copy('Un’intercetta significativa suggerisce asimmetria del funnel plot e possibile bias di pubblicazione; con pochi studi il test ha scarsa potenza.'),
      ],
    });
  }
  return tables;
};
