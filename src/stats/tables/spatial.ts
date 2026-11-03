import { copy } from '../reportCopy';
import type { SpatialResult } from '../w9Results';
import type { TableSpec } from '../types';

export const spatialTables = (result: SpatialResult, variableName: string): TableSpec[] => {
  const tables: TableSpec[] = [];
  if (result.moran) {
    tables.push({
      id: 'spatial-moran',
      title: copy('Autocorrelazione globale'),
      subtitle: copy('Indice di Moran con pesi k-nearest standardizzati per riga'),
      columns: [
        { key: 'measure', label: copy('Misura'), align: 'left' },
        { key: 'value', label: copy('Valore'), align: 'right' },
      ],
      rows: [
        { measure: 'Moran I', value: result.moran.i },
        { measure: copy('Valore atteso'), value: result.moran.expected },
        { measure: copy('Errore standard'), value: result.moran.se },
        { measure: 'z', value: result.moran.z },
        { measure: copy('p normale'), value: result.moran.p },
        { measure: copy('p per permutazione'), value: result.moran.permutationP },
      ],
      notes: [copy('Variabile analizzata: {s1}.', { s1: variableName })],
    });
  }
  if (result.geary) {
    tables.push({
      id: 'spatial-geary',
      title: copy('Geary C'),
      columns: [
        { key: 'measure', label: copy('Misura'), align: 'left' },
        { key: 'value', label: copy('Valore'), align: 'right' },
      ],
      rows: [
        { measure: 'Geary C', value: result.geary.c },
        { measure: copy('Valore atteso'), value: result.geary.expected },
        { measure: copy('p per permutazione'), value: result.geary.permutationP },
      ],
      notes: [
        copy('C vicino a 1 indica assenza di autocorrelazione; valori sotto 1 indicano similarità tra vicini, sopra 1 dissimilarità.'),
      ],
    });
  }
  if (result.lisa.length > 0) {
    tables.push({
      id: 'spatial-lisa',
      title: copy('Indicatori locali (LISA)'),
      columns: [
        { key: 'index', label: copy('Punto'), format: 'int', align: 'right' },
        { key: 'x', label: 'X', format: 'dec2', align: 'right' },
        { key: 'y', label: 'Y', format: 'dec2', align: 'right' },
        { key: 'value', label: copy('Valore'), format: 'dec3', align: 'right' },
        { key: 'local', label: copy('I locale'), format: 'dec3', align: 'right' },
        { key: 'p', label: copy('p per permutazione'), format: 'p', align: 'right' },
        { key: 'cluster', label: copy('Quadrante'), align: 'left' },
      ],
      rows: result.lisa
        .slice()
        .sort((a, b) => a.p - b.p || Math.abs(b.local) - Math.abs(a.local))
        .slice(0, 50)
        .map(item => ({ ...item })),
      notes: [
        copy('HH = valore alto circondato da alti; LL = basso circondato da bassi; HL e LH = valori discordanti dai vicini.'),
      ],
    });
  }
  if (result.sar) {
    tables.push({
      id: 'spatial-sar',
      title: copy('Modello di ritardo spaziale'),
      subtitle: copy('y = ρ W y + X β + ε, verosimiglianza concentrata'),
      columns: [
        { key: 'measure', label: copy('Misura'), align: 'left' },
        { key: 'value', label: copy('Valore'), align: 'right' },
      ],
      rows: [
        { measure: 'ρ', value: result.sar.rho },
        { measure: copy('SE di ρ'), value: result.sar.rhoSe },
        { measure: copy('Log-verosimiglianza'), value: result.sar.logLik },
        { measure: copy('Statistica LR'), value: result.sar.lr },
        { measure: copy('p di LR'), value: result.sar.lrP },
      ],
    });
    tables.push({
      id: 'spatial-sar-coefficients',
      title: copy('Coefficienti del modello SAR'),
      columns: [
        { key: 'term', label: copy('Termine'), align: 'left' },
        { key: 'estimate', label: copy('Coefficiente'), format: 'dec3', align: 'right' },
        { key: 'se', label: copy('SE'), format: 'dec3', align: 'right' },
        { key: 'z', label: 'z', format: 'dec2', align: 'right' },
        { key: 'p', label: 'p', format: 'p', align: 'right' },
      ],
      rows: result.sar.coefficients.map(item => ({ ...item })),
    });
  }
  return tables;
};
