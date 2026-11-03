import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import { showInt } from '../reportKit';
import type { TableSpec } from '../types';
import type { DoeDesignResult } from '../kernels/doeDesign';

const designLabel = (design: DoeDesignResult['design']): string => {
  switch (design) {
    case 'full':
      return copy('Fattoriale completo');
    case 'half':
      return copy('Fattoriale frazionario (metà)');
    case 'ccd':
      return copy('Disegno composto centrale (CCD)');
    default:
      return copy('Box-Behnken');
  }
};

export const doeDesignTables = (result: DoeDesignResult): TableSpec[] => {
  const matrix: TableSpec = {
    id: 'doe-design-matrix',
    title: copy('Matrice del disegno'),
    subtitle: copy('{s1} run · {s2} fattori · livelli codificati', {
      s1: result.runs,
      s2: result.factors,
    }),
    columns: [
      { key: 'run', label: copy('Run'), format: 'int', align: 'right' },
      ...result.factorNames.map(name => ({
        key: name,
        label: name,
        format: 'dec3' as const,
        align: 'right' as const,
      })),
      { key: 'kind', label: copy('Tipo'), align: 'left' },
    ],
    rows: result.rows.map(row => {
      const cells: Record<string, string | number> = { run: row.run };
      result.factorNames.forEach((name, index) => {
        cells[name] = row.levels[index];
      });
      cells.kind =
        row.kind === 'center'
          ? copy('centro')
          : row.kind === 'axial'
            ? copy('assiale')
            : copy('vertice');
      return cells;
    }),
  };

  const summary: TableSpec = {
    id: 'doe-design-summary',
    title: copy('Sintesi del disegno'),
    subtitle: designLabel(result.design),
    columns: [
      { key: 'metric', label: copy('Metrica'), align: 'left' },
      { key: 'value', label: copy('Valore'), align: 'right' },
    ],
    rows: [
      { metric: copy('Disegno'), value: designLabel(result.design) },
      { metric: copy('Fattori'), value: showInt(result.factors) },
      { metric: copy('Run totali'), value: showInt(result.runs) },
      { metric: copy('Punti ai vertici'), value: showInt(result.cornerRuns) },
      { metric: copy('Punti assiali'), value: showInt(result.axialRuns) },
      { metric: copy('Punti centrali'), value: showInt(result.centerRuns) },
      ...(result.alpha !== null
        ? [{ metric: copy('α assiale (rotabile)'), value: fmtEst(result.alpha, 4) }]
        : []),
      ...(result.resolution !== null
        ? [{ metric: copy('Risoluzione'), value: showInt(result.resolution) }]
        : []),
    ],
  };

  const tables = [matrix, summary];
  if (result.aliases.length > 0) {
    tables.push({
      id: 'doe-design-aliases',
      title: copy('Relazioni di alias'),
      subtitle: copy('Termini confusi nel frazionamento'),
      columns: [
        { key: 'alias', label: copy('Relazione'), align: 'left' },
      ],
      rows: result.aliases.map(alias => ({ alias })),
    });
  }
  return tables;
};
