import { reliabilityAnalysis, reliabilityReport, reliabilityTables } from '../../stats/reliability';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import type { Dataset } from '../../grid/types';
import type { ReliabilityParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface ReliabilityInput {
  grid: Dataset;
  params: ReliabilityParams;
  ciLevel: number;
}

/** Crow–AMSAA growth curve or a series/parallel reliability block diagram. */
export const buildReliabilityOutput = ({
  grid,
  params,
  ciLevel,
}: ReliabilityInput): AnalysisRunResult => {
  const { mode } = params;
  if (mode === 'growth') {
    const times = grid.rows.map(row => parseNum(row[params.time]));
    const failures = grid.rows.map(row => parseNum(row[params.failures]));
    const result = reliabilityAnalysis('growth', { time: times, failures });
    if (!result?.growth) {
      return {
        ok: false,
        reason: 'Reliability growth needs positive times and a strictly increasing cumulative failure count',
      };
    }
    const growth = result.growth;
    const tables = reliabilityTables(result, ciLevel);
    return {
      ok: true,
      title: copy('Crescita dell’affidabilità'),
      header: copy('{s1} guasti · ultimo tempo {s2}', {
        s1: growth.n,
        s2: growth.lastTime.toFixed(3),
      }),
      tables,
      report: reliabilityReport(tables, result, ciLevel),
      charts: [
        makeChart({
          id: 'reliability-growth',
          kind: 'line',
          title: copy('Guasti cumulati e modello'),
          subtitle: copy('Osservati e attesi Crow–AMSAA'),
          note: copy('La linea è il numero atteso di guasti; i punti sono i valori osservati.'),
          data: {
            series: [
              ...growth.points.map(point => ({
                x: point.time,
                y: point.observed,
                series: copy('Osservati'),
              })),
              ...growth.points.map(point => ({
                x: point.time,
                y: point.fitted,
                series: copy('Attesi'),
              })),
            ],
          },
          fields: { xLabel: copy('Tempo'), yLabel: copy('Guasti cumulati'), series: copy('Serie') },
          options: { showMarkers: true, showBand: false } as never,
        }),
      ],
    };
  }

  const stages = params.stages
    .map(stage => stage.map(value => parseNum(value)))
    .filter(stage => stage.length > 0 && stage.every(value => Number.isFinite(value)));
  const result = reliabilityAnalysis('rbd', { stages });
  if (!result?.rbd) {
    return {
      ok: false,
      reason: 'The block diagram needs at least one stage with at least one reliability value',
    };
  }
  const rbd = result.rbd;
  const tables = reliabilityTables(result, ciLevel);
  return {
    ok: true,
    title: copy('Diagramma a blocchi di affidabilità'),
    header: copy('{s1} stadi · affidabilità di sistema {s2}', {
      s1: rbd.stages.length,
      s2: rbd.system.toFixed(4),
    }),
    tables,
    report: reliabilityReport(tables, result, ciLevel),
    charts: [
      makeChart({
        id: 'reliability-rbd',
        kind: 'bar',
        title: copy('Affidabilità per stadio'),
        subtitle: copy('Serie di stadi, componenti in parallelo'),
        note: copy('Barre più basse indicano lo stadio più debole del sistema.'),
        data: {
          bars: rbd.stages.map(stage => ({
            category: `${copy('Stadio')} ${stage.index}`,
            value: stage.reliability,
          })),
        },
        fields: { xLabel: copy('Stadio'), yLabel: copy('Affidabilità') },
        options: { valueLabels: true } as never,
      }),
    ],
  };
};
