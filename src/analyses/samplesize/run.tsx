import { sampleSizeReport, sampleSizeTables } from '../../stats/samplesize';
import { precisionAt } from '../../stats/kernels/samplesize';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import type { AnalysisRunResult } from '../types';
import type { SampleSizeParams } from '../../io/project';

/**
 * Calcolo, grafico e tabelle della numerosità campionaria.
 *
 * Il report usa ancora 95 come livello (comportamento storico del pannello):
 * l'alpha del calcolatore è un parametro separato dal CI globale.
 */
export const buildSampleSizeOutput = (params: SampleSizeParams): AnalysisRunResult => {
  const { tables, result } = sampleSizeTables({
    ...params,
    tails: 2,
    margin: params.margin > 0 ? params.margin : undefined,
  });

  if (tables.length === 0 || !Number.isFinite(result.nPerGroup)) {
    return {
      ok: false,
      reason: 'Effect size must be greater than zero and probabilities must be between 0 and 1',
    };
  }

  const curve = tables.find(spec => spec.id === 'ss-curve')?.rows ?? [];
  const chartData = curve.map(row => ({ x: Number(row.n), y: Number(row.power) }));
  const target = params.power * 100;
  const design = Number.isFinite(result.nPerGroup)
    ? [{ x: result.nPerGroup, y: target }]
    : [];

  const precisionMax = Math.max(2, Math.ceil(result.nPerGroup * 2));
  const precisionRows: { x: number; y: number }[] = [];
  const precisionStep = Math.max(1, Math.ceil(precisionMax / 30));
  for (let n = 2; n <= precisionMax; n += precisionStep) {
    const margin = precisionAt({ ...params, tails: 2 }, n);
    if (Number.isFinite(margin)) precisionRows.push({ x: n, y: margin });
  }
  const precisionTarget = params.margin > 0 ? params.margin : NaN;

  const charts = [
    makeChart({
      id: 'samplesize-power',
      kind: 'power',
      title: copy('Curva di potenza'),
      subtitle: copy('Potenza {s1}% · α = {s2}', { s1: Math.round(target), s2: params.alpha }),
      note: copy('La curva mostra quanto si guadagna aumentando n: se il punto richiesto è già sul tratto piatto, aumentare il campione serve poco.'),
      data: {
        line: chartData,
        markers: chartData.filter((_, index) => index % Math.max(1, Math.floor(chartData.length / 12)) === 0),
        targets: [{ value: target }],
        design,
      },
      fields: { xLabel: copy('n per gruppo'), yLabel: copy('Potenza (%)') },
      options: { showDesignMarker: true } as never,
    }),
  ];
  if (precisionRows.length > 0) {
    charts.push(
      makeChart({
        id: 'samplesize-precision',
        kind: 'line',
        title: copy('Curva di precisione'),
        subtitle: copy('Semiampiezza dell’intervallo al variare di n'),
        note: copy('La curva scende come 1/√n: raddoppiare il campione non dimezza l’incertezza. La linea tratteggiata è il margine di errore richiesto.'),
        data: {
          series: precisionRows.map(row => ({ ...row, series: copy('Semiampiezza') })),
          rules: Number.isFinite(precisionTarget) ? [{ value: precisionTarget }] : [],
        },
        fields: { xLabel: copy('n per gruppo'), yLabel: copy('Semiampiezza') },
        options: { showMarkers: false, showBand: false } as never,
      })
    );
  }

  return {
    ok: true,
    title: copy('Numerosità campionaria e potenza'),
    tables,
    report: sampleSizeReport(tables, 95),
    charts,
  };
};
