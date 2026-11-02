import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
import type { RunsResult } from '../kernels/runs';

export interface NamedRuns {
  name: string;
  result: RunsResult;
}

/** One row per variable: the sequence is summarised by its runs. */
export const runsTables = (entries: NamedRuns[], level = 95): TableSpec[] =>
  entries.map(({ name, result }, index) => ({
    id: `runs-${index + 1}`,
    title: copy('Test delle sequenze'),
    subtitle: name,
    columns: [
      { key: 'n', label: copy('N'), format: 'int' },
      { key: 'cut', label: copy('Cut point'), format: 'dec4' },
      { key: 'above', label: copy('Above cut'), format: 'int' },
      { key: 'below', label: copy('Below cut'), format: 'int' },
      { key: 'runs', label: copy('Runs'), format: 'int' },
      { key: 'expected', label: copy('Expected runs'), format: 'dec3' },
      { key: 'z', label: copy('z'), format: 'dec3' },
      { key: 'p', label: copy('p-value'), format: 'p' },
      { key: 'exactP', label: copy('Exact p'), format: 'p' },
    ],
    rows: [
      {
        n: result.n,
        cut: result.cut,
        above: result.above,
        below: result.below,
        runs: result.runs,
        expected: result.expected,
        z: result.z,
        p: result.p,
        exactP: result.exactP ?? '',
      },
    ],
    notes: [
      copy('Le osservazioni sono divise in due lati rispetto al punto di taglio (mediana per default); un numero di sequenze troppo basso indica clustering, troppo alto alternanza.'),
      copy('Il p asintotico usa l’approssimazione normale con correzione di continuità; il p esatto è disponibile fino a 50 osservazioni.'),
      copy('Livello di confidenza: {s1}%.', { s1: level }),
    ],
  }));
