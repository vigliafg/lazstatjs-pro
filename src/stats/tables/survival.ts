import { fmtEst, fmtP } from '../format';
import type { TableSpec } from '../types';
import { kaplanMeier, lifeTable, logRankTest } from '../kernels/survival';
import type { SurvivalGroup } from '../survival/types';

// ---------------------------------------------------------------------------
// Tables and report
// ---------------------------------------------------------------------------

export interface SurvivalTablesOptions {
  time: number[];
  event: number[];
  groups: string[];
  level: number;
}

export const survivalTables = (options: SurvivalTablesOptions): TableSpec[] => {
  const { level } = options;
  const rows = options.time
    .map((time, index) => ({
      time,
      event: options.event[index] === 1 ? 1 : 0,
      group: String(options.groups[index] ?? '').trim() || 'All',
    }))
    .filter(row => Number.isFinite(row.time) && row.time >= 0);

  if (rows.length < 3) return [];

  const groupNames = Array.from(new Set(rows.map(row => row.group))).sort();
  const overall = kaplanMeier(rows.map(row => row.time), rows.map(row => row.event), level);
  const tables: TableSpec[] = [];

  const summaries = groupNames.map(name => {
    const subset = rows.filter(row => row.group === name);
    const km = kaplanMeier(subset.map(row => row.time), subset.map(row => row.event), level);
    return { name, km };
  });

  tables.push({
    id: 'surv-summary',
    title: 'Sintesi di sopravvivenza',
    subtitle: `N = ${overall.n} · eventi = ${overall.events} · censurati = ${overall.censored}`,
    columns: [
      { key: 'group', label: 'Gruppo', format: 'text' },
      { key: 'n', label: 'N', format: 'int' },
      { key: 'events', label: 'Eventi', format: 'int' },
      { key: 'censored', label: 'Censurati', format: 'int' },
      { key: 'median', label: 'Mediana', format: 'dec2' },
      { key: 'medianLo', label: 'CI low', format: 'dec2' },
      { key: 'medianHi', label: 'CI high', format: 'dec2' },
      { key: 'rmst', label: 'RMST', format: 'dec2' },
    ],
    rows: summaries.map(({ name, km }) => ({
      group: name,
      n: km.n,
      events: km.events,
      censored: km.censored,
      median: km.median,
      medianLo: km.medianLo,
      medianHi: km.medianHi,
      rmst: km.rmst,
    })),
    notes: [
      'La mediana è il tempo in cui la curva scende a 0,50: se non viene raggiunta resta non calcolabile.',
      'Il CI della mediana deriva dagli intervalli log-log della curva; RMST è l’area sotto la curva fino all’ultimo tempo osservato.',
    ],
  });

  const kmRows = summaries.flatMap(({ name, km }) =>
    km.points.map(point => ({
      group: name,
      time: point.time,
      nRisk: point.nRisk,
      events: point.events,
      censored: point.censored,
      survival: point.survival,
      lo: point.lo,
      hi: point.hi,
    }))
  );

  tables.push({
    id: 'surv-km',
    title: 'Curva di Kaplan–Meier',
    subtitle: `CI ${level}% log-log · stima prodotto-limite`,
    columns: [
      { key: 'group', label: 'Gruppo', format: 'text' },
      { key: 'time', label: 'Tempo', format: 'dec2' },
      { key: 'nRisk', label: 'A rischio', format: 'int' },
      { key: 'events', label: 'Eventi', format: 'int' },
      { key: 'censored', label: 'Censurati', format: 'int' },
      { key: 'survival', label: 'S(t)', format: 'dec3' },
      { key: 'lo', label: 'CI low', format: 'dec3' },
      { key: 'hi', label: 'CI high', format: 'dec3' },
    ],
    rows: kmRows,
    notes: [
      'S(t) è la probabilità stimata di essere ancora “in vita” (senza evento) al tempo t.',
      'I censurati escono dal rischio senza far scendere la curva: è il motivo per cui serve un’analisi di sopravvivenza invece di una media.',
    ],
  });

  if (groupNames.length >= 2) {
    const groups: SurvivalGroup[] = summaries.map(({ name }) => {
      const subset = rows.filter(row => row.group === name);
      return { name, time: subset.map(row => row.time), event: subset.map(row => row.event) };
    });
    const result = logRankTest(groups, level);

    tables.push({
      id: 'surv-logrank',
      title: 'Log-rank test',
      subtitle: groups.map(group => group.name).join(' vs '),
      columns: [
        { key: 'metric', label: 'Voce', format: 'text' },
        { key: 'value', label: 'Valore', format: 'text' },
      ],
      rows: [
        { metric: 'χ²', value: fmtEst(result.chi2, 3), chiValue: result.chi2 },
        { metric: 'df', value: String(result.df) },
        { metric: 'p', value: fmtP(result.p), pValue: result.p },
        ...(Number.isFinite(result.hazardRatio)
          ? [
              {
                metric: 'Hazard ratio (Mantel–Haenszel)',
                value: fmtEst(result.hazardRatio, 3),
                hrValue: result.hazardRatio,
              },
              { metric: 'HR CI low', value: fmtEst(result.hrLo, 3) },
              { metric: 'HR CI high', value: fmtEst(result.hrHi, 3) },
            ]
          : []),
      ],
      notes: [
        'Il log-rank confronta il numero di eventi osservati in ogni gruppo con quelli attesi se le curve fossero uguali.',
        'L’hazard ratio è stimato con l’approccio Mantel–Haenszel: HR > 1 indica rischio maggiore nel primo gruppo.',
      ],
    });
  }

  const overallLife = lifeTable(rows.map(row => row.time), rows.map(row => row.event));
  if (overallLife.length > 0) {
    tables.push({
      id: 'surv-life',
      title: 'Life table (tutta la coorte)',
      subtitle: `${overallLife.length} intervalli di uguale ampiezza`,
      columns: [
        { key: 'start', label: 'Da', format: 'dec2' },
        { key: 'end', label: 'A', format: 'dec2' },
        { key: 'atRisk', label: 'A rischio', format: 'int' },
        { key: 'events', label: 'Eventi', format: 'int' },
        { key: 'censored', label: 'Censurati', format: 'int' },
        { key: 'survival', label: 'S(t)', format: 'dec3' },
      ],
      rows: overallLife.map(row => ({ ...row })),
      notes: ['Nella life table i censurati nell’intervallo contribuiscono per metà al tempo a rischio.'],
    });
  }

  return tables;
};
