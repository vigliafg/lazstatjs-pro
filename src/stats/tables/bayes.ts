import { copy } from '../reportCopy';
import type { BayesResult } from '../w9Results';
import type { TableSpec } from '../types';

export const bayesTables = (result: BayesResult): TableSpec[] => {
  const summary: TableSpec = {
    id: 'bayes-posterior',
    title: copy('Distribuzione a posteriori'),
    subtitle: copy('Media, deviazione standard, intervallo centrale e HDI'),
    columns: [
      { key: 'term', label: copy('Parametro'), align: 'left' },
      { key: 'mean', label: copy('Media'), format: 'dec4', align: 'right' },
      { key: 'sd', label: copy('Deviazione standard'), format: 'dec4', align: 'right' },
      { key: 'median', label: copy('Mediana'), format: 'dec4', align: 'right' },
      { key: 'lo', label: copy('Limite inferiore'), format: 'dec4', align: 'right' },
      { key: 'hi', label: copy('Limite superiore'), format: 'dec4', align: 'right' },
      { key: 'hdiLo', label: copy('HDI inferiore'), format: 'dec4', align: 'right' },
      { key: 'hdiHi', label: copy('HDI superiore'), format: 'dec4', align: 'right' },
    ],
    rows: [
      ...result.parameters.map(item => ({ ...item })),
      ...(result.sigma
        ? [{ term: 'σ', ...result.sigma }]
        : []),
      ...(result.tau
        ? [{ term: 'τ', ...result.tau }]
        : []),
    ],
  };
  const diagnostics: TableSpec = {
    id: 'bayes-diagnostics',
    title: copy('Diagnostica del campionatore'),
    columns: [
      { key: 'measure', label: copy('Misura'), align: 'left' },
      { key: 'value', label: copy('Valore'), align: 'right' },
    ],
    rows: [
      { measure: copy('Catene'), value: String(result.chains) },
      { measure: copy('Iterazioni dopo il burn-in'), value: String(result.draws) },
      { measure: copy('Burn-in'), value: String(result.burnin) },
      { measure: 'Rhat massimo', value: result.rhatMax },
      { measure: 'ESS minimo', value: result.essMin },
    ],
    notes: [
      copy('Rhat vicino a 1 e ESS alto indicano che le catene si sono mescolate; valori sopra 1.05 richiedono più iterazioni.'),
    ],
  };
  const tables = [summary, diagnostics];
  if (result.groups.length > 0) {
    tables.push({
      id: 'bayes-groups',
      title: copy('Medie dei gruppi'),
      subtitle: copy('Shrinkage verso la media generale μ'),
      columns: [
        { key: 'label', label: copy('Gruppo'), align: 'left' },
        { key: 'n', label: copy('Osservazioni'), format: 'int', align: 'right' },
        { key: 'mean', label: copy('Media'), format: 'dec4', align: 'right' },
        { key: 'sd', label: copy('Deviazione standard'), format: 'dec4', align: 'right' },
        { key: 'hdiLo', label: copy('HDI inferiore'), format: 'dec4', align: 'right' },
        { key: 'hdiHi', label: copy('HDI superiore'), format: 'dec4', align: 'right' },
        { key: 'rhat', label: 'Rhat', format: 'dec3', align: 'right' },
      ],
      rows: result.groups.map(group => ({ ...group })),
    });
  }
  return tables;
};
