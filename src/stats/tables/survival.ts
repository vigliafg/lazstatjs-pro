import { fmtEst, fmtP } from '../format';
import { copy } from '../reportCopy';
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
    title: copy('Sintesi di sopravvivenza'),
    subtitle: copy('N = {s1} · eventi = {s2} · censurati = {s3}', { s1: overall.n, s2: overall.events, s3: overall.censored }),
    columns: [
      { key: 'group', label: copy('Gruppo'), format: 'text' },
      { key: 'n', label: copy('N'), format: 'int' },
      { key: 'events', label: copy('Eventi'), format: 'int' },
      { key: 'censored', label: copy('Censurati'), format: 'int' },
      { key: 'median', label: copy('Mediana'), format: 'dec2' },
      { key: 'medianLo', label: copy('CI low'), format: 'dec2' },
      { key: 'medianHi', label: copy('CI high'), format: 'dec2' },
      { key: 'rmst', label: copy('RMST'), format: 'dec2' },
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
      copy('La mediana è il tempo in cui la curva scende a 0,50: se non viene raggiunta resta non calcolabile.'),
      copy('Il CI della mediana deriva dagli intervalli log-log della curva; RMST è l’area sotto la curva fino all’ultimo tempo osservato.'),
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
    title: copy('Curva di Kaplan–Meier'),
    subtitle: copy('CI {s1}% log-log · stima prodotto-limite', { s1: level }),
    columns: [
      { key: 'group', label: copy('Gruppo'), format: 'text' },
      { key: 'time', label: copy('Tempo'), format: 'dec2' },
      { key: 'nRisk', label: copy('A rischio'), format: 'int' },
      { key: 'events', label: copy('Eventi'), format: 'int' },
      { key: 'censored', label: copy('Censurati'), format: 'int' },
      { key: 'survival', label: copy('S(t)'), format: 'dec3' },
      { key: 'lo', label: copy('CI low'), format: 'dec3' },
      { key: 'hi', label: copy('CI high'), format: 'dec3' },
    ],
    rows: kmRows,
    notes: [
      copy('S(t) è la probabilità stimata di essere ancora “in vita” (senza evento) al tempo t.'),
      copy('I censurati escono dal rischio senza far scendere la curva: è il motivo per cui serve un’analisi di sopravvivenza invece di una media.'),
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
      title: copy('Log-rank test'),
      subtitle: groups.map(group => group.name).join(' vs '),
      columns: [
        { key: 'metric', label: copy('Voce'), format: 'text' },
        { key: 'value', label: copy('Valore'), format: 'text' },
      ],
      rows: [
        { metric: copy('χ²'), value: fmtEst(result.chi2, 3), chiValue: result.chi2 },
        { metric: copy('df'), value: String(result.df) },
        { metric: copy('p'), value: fmtP(result.p), pValue: result.p },
        ...(Number.isFinite(result.hazardRatio)
          ? [
              {
                metric: copy('Hazard ratio (Mantel–Haenszel)'),
                value: fmtEst(result.hazardRatio, 3),
                hrValue: result.hazardRatio,
              },
              { metric: copy('HR CI low'), value: fmtEst(result.hrLo, 3) },
              { metric: copy('HR CI high'), value: fmtEst(result.hrHi, 3) },
            ]
          : []),
      ],
      notes: [
        copy('Il log-rank confronta il numero di eventi osservati in ogni gruppo con quelli attesi se le curve fossero uguali.'),
        copy('L’hazard ratio è stimato con l’approccio Mantel–Haenszel: HR > 1 indica rischio maggiore nel primo gruppo.'),
      ],
    });
  }

  const overallLife = lifeTable(rows.map(row => row.time), rows.map(row => row.event));
  if (overallLife.length > 0) {
    tables.push({
      id: 'surv-life',
      title: copy('Life table (tutta la coorte)'),
      subtitle: copy('{s1} intervalli di uguale ampiezza', { s1: overallLife.length }),
      columns: [
        { key: 'start', label: copy('Da'), format: 'dec2' },
        { key: 'end', label: copy('A'), format: 'dec2' },
        { key: 'atRisk', label: copy('A rischio'), format: 'int' },
        { key: 'events', label: copy('Eventi'), format: 'int' },
        { key: 'censored', label: copy('Censurati'), format: 'int' },
        { key: 'survival', label: copy('S(t)'), format: 'dec3' },
      ],
      rows: overallLife.map(row => ({ ...row })),
      notes: [copy('Nella life table i censurati nell’intervallo contribuiscono per metà al tempo a rischio.')],
    });
  }

  return tables;
};
