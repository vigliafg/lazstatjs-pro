import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { MdsResult } from '../mds/types';
import type { TableSpec } from '../types';

export const mdsTables = (result: MdsResult): TableSpec[] => {
  const coordinates: TableSpec = {
    id: 'mds-coordinates',
    title: copy('Coordinate MDS'),
    subtitle: copy('{s1} dimensioni · {s2} punti', {
      s1: result.dimensions,
      s2: result.points.length,
    }),
    columns: [
      { key: 'label', label: copy('Osservazione'), align: 'left' },
      ...Array.from({ length: result.dimensions }, (_, index) => ({
        key: `d${index}`,
        label: copy('Dimensione {s1}', { s1: index + 1 }),
        format: 'dec3' as const,
        align: 'right' as const,
      })),
    ],
    rows: result.points.map(point => ({
      label: point.label,
      ...Object.fromEntries(
        point.coordinates.map((value, index) => [`d${index}`, value])
      ),
    })),
  };
  const fit: TableSpec = {
    id: 'mds-fit',
    title: copy('Qualità della rappresentazione'),
    columns: [
      { key: 'measure', label: copy('Misura'), align: 'left' },
      { key: 'value', label: copy('Valore'), align: 'right' },
    ],
    rows: [
      { measure: copy('Stress di Kruskal'), value: fmtEst(result.stress, 4) },
      { measure: copy('Iterazioni'), value: String(result.iterations) },
      { measure: copy('Dimensione'), value: String(result.dimensions) },
      {
        measure: copy('Primo autovalore'),
        value: fmtEst(result.eigenvalues[0] ?? 0, 3),
      },
      {
        measure: copy('Secondo autovalore'),
        value: fmtEst(result.eigenvalues[1] ?? 0, 3),
      },
    ],
  };
  const distances: TableSpec = {
    id: 'mds-distances',
    title: copy('Distanze e disparità'),
    subtitle: copy('{s1} coppie', { s1: result.pairs.length }),
    columns: [
      { key: 'pair', label: copy('Coppia'), align: 'left' },
      { key: 'dissimilarity', label: copy('Dissimilarità'), format: 'dec3', align: 'right' },
      { key: 'distance', label: copy('Distanza'), format: 'dec3', align: 'right' },
      { key: 'disparity', label: copy('Disparità'), format: 'dec3', align: 'right' },
    ],
    rows: result.pairs.map(pair => ({
      pair: `${result.labels[pair.i] ?? pair.i + 1} – ${result.labels[pair.j] ?? pair.j + 1}`,
      dissimilarity: pair.dissimilarity,
      distance: pair.distance,
      disparity: pair.disparity,
    })),
  };
  return [fit, coordinates, distances];
};
