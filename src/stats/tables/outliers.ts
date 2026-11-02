import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
import type { DixonResult, GrubbsResult } from '../kernels/outliers';

export interface NamedOutliers {
  name: string;
  grubbs: GrubbsResult | null;
  dixon: DixonResult | null;
}

const sideLabel = (side: 'low' | 'high' | null): string =>
  side === 'low' ? copy('Low') : side === 'high' ? copy('High') : '';

/** One table per variable, with both tests side by side. */
export const outlierTables = (entries: NamedOutliers[], level = 95): TableSpec[] =>
  entries.map(({ name, grubbs, dixon }, index) => {
    const rows: Record<string, string | number>[] = [];
    if (grubbs) {
      rows.push({
        test: 'Grubbs',
        n: grubbs.n,
        statistic: grubbs.statistic,
        critical: grubbs.critical,
        p: grubbs.p,
        outlier: grubbs.outlier ?? '',
        side: sideLabel(grubbs.side),
        verdict: grubbs.p < 1 - level / 100 ? copy('Outlier') : copy('Regolare'),
      });
    }
    if (dixon) {
      rows.push({
        test: `Dixon ${dixon.type}`,
        n: dixon.n,
        statistic: dixon.statistic,
        critical: dixon.critical,
        p: dixon.p,
        outlier: dixon.outlier ?? '',
        side: sideLabel(dixon.side),
        verdict: dixon.p < 1 - level / 100 ? copy('Outlier') : copy('Regolare'),
      });
    }
    return {
      id: `outliers-${index + 1}`,
      title: copy('Test per valori anomali'),
      subtitle: name,
      columns: [
        { key: 'test', label: copy('Test'), format: 'text' as const },
        { key: 'n', label: copy('N'), format: 'int' as const },
        { key: 'statistic', label: copy('Statistic'), format: 'dec4' as const },
        { key: 'critical', label: copy('Critical value'), format: 'dec4' as const },
        { key: 'p', label: copy('p-value'), format: 'p' as const },
        { key: 'outlier', label: copy('Outlier'), format: 'dec4' as const },
        { key: 'side', label: copy('Side'), format: 'text' as const },
        { key: 'verdict', label: copy('Verdict'), format: 'text' as const },
      ],
      rows,
      notes: [
        copy('Grubbs: test bilaterale sull’osservazione più lontana dalla media, con correzione per il numero di candidati.'),
        copy('Dixon: rapporto fra le differenze adiacenti; definito solo per 3–30 osservazioni e più robusto agli estremi.'),
      ],
    };
  });
