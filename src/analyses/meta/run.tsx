import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import { metaAnalysis, type MetaStudy } from '../../stats/kernels/meta';
import { metaTables } from '../../stats/tables/meta';
import { metaReport } from '../../stats/reports/meta';
import type { AnalysisChart } from '../../stats/charts';
import type { Dataset } from '../../grid/types';
import type { MetaParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface MetaInput {
  grid: Dataset;
  params: MetaParams;
  ciLevel: number;
}

export const buildMetaOutput = ({ grid, params, ciLevel }: MetaInput): AnalysisRunResult => {
  const studies: MetaStudy[] = [];
  grid.rows.forEach((row, index) => {
    const effect = parseNum(row[params.effect]);
    const se = parseNum(row[params.se]);
    if (!Number.isFinite(effect) || !Number.isFinite(se) || se <= 0) return;
    const label =
      params.study >= 0
        ? String(row[params.study] ?? '').trim()
        : copy('Studio {s1}', { s1: index + 1 });
    studies.push({ label: label || copy('Studio {s1}', { s1: index + 1 }), effect, se });
  });
  if (studies.length < 2) {
    return { ok: false, reason: 'Meta-analysis needs at least two studies with a positive standard error' };
  }
  const result = metaAnalysis(studies, params.method, ciLevel, params.egger);
  if (!result) {
    return { ok: false, reason: 'The meta-analysis could not be computed: check the effect and standard-error columns' };
  }

  const pooled = result.random ?? result.fixed;
  const charts: AnalysisChart[] = [
    makeChart({
      id: 'meta-forest',
      kind: 'forest',
      title: copy('Forest plot'),
      subtitle: copy('Effetti dei singoli studi e stima pooled'),
      note: copy('Ogni riga è uno studio; il rombo finale è la stima pooled. Il tratteggio verticale è lo zero: effetti che non lo attraversano sono distinti dall’assenza di effetto.'),
      data: {
        points: [
          ...result.studies.map(study => ({
            label: study.label,
            estimate: study.effect,
            lo: study.lo,
            hi: study.hi,
          })),
          {
            label: copy('Pooled'),
            estimate: pooled.estimate,
            lo: pooled.lo,
            hi: pooled.hi,
          },
        ],
      },
      fields: { xLabel: copy('Effetto'), yLabel: copy('Studio') },
      options: { reference: 'zero' } as never,
    }),
    makeChart({
      id: 'meta-funnel',
      kind: 'scatter',
      title: copy('Funnel plot'),
      subtitle: copy('Effetto e precisione degli studi'),
      note: copy('In assenza di bias gli studi dovrebbero disporsi a imbuto attorno alla stima pooled; asimmetria suggerisce bias di pubblicazione o eterogeneità.'),
      data: {
        points: result.studies.map(study => ({
          x: study.effect,
          y: 1 / study.se,
        })),
        rules: [{ x: pooled.estimate }],
      },
      fields: { xLabel: copy('Effetto'), yLabel: copy('Precisione (1/SE)') },
      options: { fit: 'none', band: 'none', showMeanLine: false } as never,
    }),
    makeChart({
      id: 'meta-weights',
      kind: 'bar',
      title: copy('Peso degli studi'),
      subtitle: copy('Quota percentuale nel modello usato'),
      note: copy('Studi più precisi ricevono più peso; con effetti casuali il peso dipende anche dalla varianza tra studi.'),
      data: {
        bars: result.studies.map(study => ({
          category: study.label,
          value: study.weight,
        })),
      },
      fields: { xLabel: copy('Studio'), yLabel: copy('Peso %') },
      options: { valueLabels: true } as never,
    }),
  ];

  return {
    ok: true,
    title: copy('Meta-analisi'),
    header: copy('{s1} studi · {s2} · I² {s3}%', {
      s1: result.k,
      s2: result.method,
      s3: (100 * result.i2).toFixed(1),
    }),
    tables: metaTables(result),
    report: metaReport(result),
    charts,
  };
};
