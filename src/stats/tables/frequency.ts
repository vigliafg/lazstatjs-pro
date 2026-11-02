import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
import { equalShareChiSquare, type FrequencyResult } from '../kernels/frequency';

export interface NamedFrequency {
  name: string;
  result: FrequencyResult;
}

const percent = (value: number): string => (Number.isFinite(value) ? value.toFixed(2) : '');

/** One tally table per variable, plus its equal-share goodness of fit. */
export const frequencyTables = (entries: NamedFrequency[], level = 95): TableSpec[] =>
  entries.flatMap(({ name, result }, index) => {
    const tables: TableSpec[] = [
      {
        id: `freq-${index + 1}`,
        title: copy('Frequenze'),
        subtitle: name,
        columns: [
          { key: 'value', label: copy('Value'), format: 'text' },
          { key: 'count', label: copy('Count'), format: 'int' },
          { key: 'percent', label: copy('Percent'), format: 'dec2' },
          { key: 'cumCount', label: copy('Cumulative count'), format: 'int' },
          { key: 'cumPercent', label: copy('Cumulative %'), format: 'dec2' },
          { key: 'ciLo', label: copy('CI low'), format: 'dec2' },
          { key: 'ciHi', label: copy('CI high'), format: 'dec2' },
        ],
        rows: result.rows.map(row => ({
          value: row.value,
          count: row.count,
          percent: row.percent,
          cumCount: row.cumCount,
          cumPercent: row.cumPercent,
          ciLo: row.ciLo,
          ciHi: row.ciHi,
        })),
        notes: [
          copy('Percentuali calcolate sulle osservazioni non mancanti ({s1} su {s2}).', {
            s1: result.total,
            s2: result.total + result.missing,
          }),
          copy('Intervallo di Wilson al {s1}% per la proporzione di ogni modalità.', {
            s1: level,
          }),
        ],
      },
    ];

    const gof = equalShareChiSquare(result);
    if (gof) {
      tables.push({
        id: `freq-gof-${index + 1}`,
        title: copy('Bontà di adattamento (quote uguali)'),
        subtitle: name,
        columns: [
          { key: 'chi2', label: copy('Chi-square'), format: 'dec3' },
          { key: 'df', label: copy('df'), format: 'int' },
          { key: 'p', label: copy('p-value'), format: 'p' },
        ],
        rows: [{ chi2: gof.chi2, df: gof.df, p: gof.p }],
        notes: [
          copy('Confronta le frequenze osservate con quote uguali tra le modalità: un p piccolo indica modalità più rappresentate di altre.'),
        ],
      });
    }
    return tables;
  });

/** Text of one variable, ready for the report copy. */
export const frequencyShare = (row: { count: number; percent: number }): string =>
  `${row.count} (${percent(row.percent)}%)`;
