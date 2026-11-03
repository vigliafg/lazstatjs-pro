import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { latentClassAnalysis } from '../../stats/kernels/latentclass';
import { GUARD_LIMITS, guardDimensions } from '../../stats/kernels/guards';
import { latentClassTables } from '../../stats/tables/latentclass';
import { latentClassReport } from '../../stats/reports/latentclass';
import type { AnalysisChart } from '../../stats/charts';
import type { Dataset } from '../../grid/types';
import type { LatentClassParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface LatentClassInput {
  grid: Dataset;
  params: LatentClassParams;
}

export const buildLatentClassOutput = ({ grid, params }: LatentClassInput): AnalysisRunResult => {
  const columns = Array.from(new Set(params.selected));
  if (columns.length < 2) return { ok: false, reason: 'Select at least two categorical indicators' };
  const variableNames = columns.map(index => grid.cols[index]?.name ?? `V${index + 1}`);
  const levels = columns.map(column => {
    const seen = new Set<string>();
    for (const row of grid.rows) {
      const value = String(row[column] ?? '').trim();
      if (value !== '') seen.add(value);
    }
    return [...seen].sort((a, b) => a.localeCompare(b));
  });
  if (levels.some(values => values.length < 2)) {
    return { ok: false, reason: 'Every indicator needs at least two observed levels' };
  }
  const rows = grid.rows
    .map(row => columns.map(column => String(row[column] ?? '').trim()))
    .filter(row => row.every(value => value !== ''));
  if (rows.length < 5) return { ok: false, reason: 'Latent class analysis needs at least five complete rows' };
  const guard = guardDimensions(
    { rows: rows.length, columns: columns.length, groups: params.classes },
    GUARD_LIMITS.iterative
  );
  if (guard.ok === false) return { ok: false, reason: guard.message };
  const encoded = rows.map(row =>
    row.map((value, item) => levels[item].indexOf(value))
  );
  const result = latentClassAnalysis({
    data: encoded,
    levels,
    variableNames,
    classes: params.classes,
    maxIterations: params.maxIterations,
  });
  if (!result) return { ok: false, reason: 'Latent classes could not be estimated' };

  const probabilityRows = result.items.flatMap((item, itemIndex) =>
    item.levels.map((level, levelIndex) => ({
      x: `${item.variable} · ${level}`,
      ...Object.fromEntries(
        Array.from({ length: result.classes }, (_, cluster) => [
          `c${cluster}`,
          item.probabilities[cluster]?.[levelIndex] ?? 0,
        ])
      ),
      itemIndex,
    }))
  );
  const certaintyBars = Array.from({ length: result.classes }, (_, cluster) => {
    const members = result.posterior
      .map(row => row[cluster] ?? 0)
      .filter((value, index) => result.predicted[index] === cluster);
    const certain = members.filter(value => value >= 0.8).length;
    return {
      category: `C${cluster + 1}`,
      value: members.length > 0 ? (certain / members.length) * 100 : 0,
    };
  });

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'latentclass-proportions',
      kind: 'bar',
      title: copy('Dimensione delle classi'),
      subtitle: copy('{s1} classi', { s1: result.classes }),
      note: copy('Una classe molto piccola può essere un gruppo reale oppure una soluzione instabile: va interpretata con cautela.'),
      data: {
        bars: result.proportions.map((value, index) => ({
          category: `C${index + 1}`,
          value: value * 100,
        })),
      },
      fields: { xLabel: copy('Classe'), yLabel: copy('Percentuale di casi') },
      options: { valueLabels: true, referenceLine: 'none' } as never,
    }),
    makeChart({
      id: 'latentclass-probabilities',
      kind: 'line',
      title: copy('Profili delle classi'),
      subtitle: copy('Probabilità condizionate per livello'),
      note: copy('Ogni linea è una classe: le differenze tra linee mostrano quali risposte distinguono le classi.'),
      data: {
        series: probabilityRows.flatMap(row =>
          Array.from({ length: result.classes }, (_, cluster) => ({
            x: row.x,
            y: row[`c${cluster}`] as number,
            series: `C${cluster + 1}`,
          }))
        ),
      },
      fields: { xLabel: copy('Variabile e livello'), yLabel: copy('Probabilità'), series: copy('Classe'), xType: 'nominal' },
      options: { showMarkers: true, showBand: false } as never,
    }),
    makeChart({
      id: 'latentclass-entropy',
      kind: 'bar',
      title: copy('Certezza di classificazione per classe'),
      subtitle: copy('Entropia {s1} · casi con probabilità ≥ 0,80', {
        s1: Number.isFinite(result.entropy) ? result.entropy.toFixed(2) : 'n.d.',
      }),
      note: copy(
        'Entropia vicina a 1 significa classi ben distinte; vicina a 0 significa posterior ambigue. Le barre sono la quota di casi di ciascuna classe assegnati con probabilità almeno 0,80: barre basse segnalano casi al confine tra classi.'
      ),
      data: { bars: certaintyBars },
      fields: { xLabel: copy('Classe'), yLabel: copy('Casi certi (%)') },
      options: { valueLabels: true, referenceLine: 'none' } as never,
    }),
  ];

  return {
    ok: true,
    title: copy('Classi latenti'),
    header: copy('{s1} indicatori · {s2} classi · {s3} osservazioni', {
      s1: columns.length,
      s2: result.classes,
      s3: rows.length,
    }),
    tables: latentClassTables(result),
    report: latentClassReport(result),
    charts,
  };
};
