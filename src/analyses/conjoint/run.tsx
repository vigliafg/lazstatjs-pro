import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import { conjointAnalysis } from '../../stats/kernels/conjoint';
import { GUARD_LIMITS, guardDimensions } from '../../stats/kernels/guards';
import { conjointTables } from '../../stats/tables/conjoint';
import { conjointReport } from '../../stats/reports/conjoint';
import type { AnalysisChart } from '../../stats/charts';
import type { Dataset } from '../../grid/types';
import type { ConjointParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface ConjointInput {
  grid: Dataset;
  params: ConjointParams;
}

export const buildConjointOutput = ({ grid, params }: ConjointInput): AnalysisRunResult => {
  const attributes = Array.from(new Set(params.attributes)).filter(index => index !== params.response);
  if (attributes.length < 1) return { ok: false, reason: 'Select at least one categorical attribute' };
  if (attributes.includes(params.response)) {
    return { ok: false, reason: 'The rating cannot also be an attribute' };
  }
  const rows = grid.rows
    .map(row => ({
      profile: attributes.map(column => String(row[column] ?? '').trim()),
      rating: parseNum(row[params.response]),
    }))
    .filter(row => row.profile.every(value => value !== '') && Number.isFinite(row.rating));
  if (rows.length < 4) return { ok: false, reason: 'Conjoint analysis needs at least four complete profiles' };
  const guard = guardDimensions(
    { rows: rows.length, columns: attributes.length + 1 },
    GUARD_LIMITS.linear
  );
  if (guard.ok === false) return { ok: false, reason: guard.message };
  const attributeNames = attributes.map(index => grid.cols[index]?.name ?? `A${index + 1}`);
  const levels = attributes.map(column => {
    const seen = new Set<string>();
    for (const row of grid.rows) {
      const value = String(row[column] ?? '').trim();
      if (value !== '') seen.add(value);
    }
    return [...seen].sort((a, b) => a.localeCompare(b));
  });
  if (levels.some(values => values.length < 2)) {
    return { ok: false, reason: 'Every attribute needs at least two observed levels' };
  }
  const result = conjointAnalysis({
    profiles: rows.map(row => row.profile),
    response: rows.map(row => row.rating),
    attributeNames,
    levels,
  });
  if (!result) {
    return { ok: false, reason: 'Conjoint model could not be estimated: check the design and the number of profiles' };
  }

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'conjoint-utilities',
      kind: 'bar',
      title: copy('Utilità delle modalità'),
      subtitle: copy('Scostamenti dalla media dell’attributo'),
      note: copy('Barre positive indicano livelli preferiti rispetto alla media dell’attributo; barre negative livelli meno preferiti.'),
      data: {
        bars: result.levels.map(item => ({
          category: `${item.attribute}: ${item.level}`,
          value: item.utility,
          series: item.attribute,
        })),
      },
      fields: { xLabel: copy('Livello'), yLabel: copy('Utilità') },
      options: { grouping: 'grouped', referenceLine: 'zero' } as never,
    }),
    makeChart({
      id: 'conjoint-importance',
      kind: 'bar',
      title: copy('Importanza degli attributi'),
      subtitle: copy('Quota sul totale delle ampiezze'),
      note: copy('L’importanza è la quota di variabilità delle preferenze attribuita a ciascun attributo.'),
      data: {
        bars: result.attributes.map(item => ({
          category: item.attribute,
          value: item.importance,
        })),
      },
      fields: { xLabel: copy('Attributo'), yLabel: copy('Importanza %') },
      options: { valueLabels: true, referenceLine: 'none' } as never,
    }),
  ];

  return {
    ok: true,
    title: copy('Analisi congiunta'),
    header: copy('{s1} attributi · {s2} profili', {
      s1: attributes.length,
      s2: rows.length,
    }),
    tables: conjointTables(result),
    report: conjointReport(result),
    charts,
  };
};
