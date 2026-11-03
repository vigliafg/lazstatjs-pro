import { fitStateSpace, stateSpaceReport, stateSpaceTables } from '../../stats/statespace';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { numericColumnValues } from '../shared/data';
import type { Dataset } from '../../grid/types';
import type { StateSpaceParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';
import type { ChartRow } from '../../stats/charts';

export interface StateSpaceInput {
  grid: Dataset;
  params: StateSpaceParams;
  ciLevel: number;
}

export const buildStateSpaceOutput = ({ grid, params, ciLevel }: StateSpaceInput): AnalysisRunResult => {
  const values = numericColumnValues(grid, params.variable);
  if (values.length < (params.mode === 'markov' ? 20 : 10)) {
    return {
      ok: false,
      reason:
        params.mode === 'markov'
          ? 'Markov switching needs at least twenty observations'
          : 'The local state-space model needs at least ten observations',
    };
  }
  const fit = fitStateSpace({
    values,
    mode: params.mode,
    horizon: params.horizon,
    level: ciLevel,
    trend: params.trend,
  });
  if (!fit) return { ok: false, reason: 'The state-space model could not be estimated on this series' };
  const name = grid.cols[params.variable]?.name ?? 'Y';
  const tables = stateSpaceTables(fit);

  if (fit.mode === 'local') {
    const series: ChartRow[] = [
      ...values.map((value, index) => ({ x: index + 1, y: value, series: copy('Osservato') })),
      ...fit.points.map(point => ({ x: point.t, y: point.level, series: copy('Livello smussato') })),
      ...fit.forecast.map(point => ({
        x: point.step,
        y: point.mean,
        lo: point.lo,
        hi: point.hi,
        series: copy('Previsione'),
      })),
    ];
    return {
      ok: true,
      title: copy('State-space: {s1}', { s1: name }),
      header: copy('{s1} osservazioni · varianza di osservazione {s2}', {
        s1: fit.n,
        s2: fit.observationVariance.toFixed(3),
      }),
      tables,
      report: stateSpaceReport(tables, fit),
      charts: [
        makeChart({
          id: 'statespace-local',
          kind: 'line',
          title: copy('Livello latente e previsione'),
          subtitle: copy('filtro di Kalman e smoother RTS'),
          note: copy('La linea smussata è la stima del livello che usa tutta la serie; la banda è l’intervallo di previsione.'),
          data: { series },
          fields: { xLabel: 't', yLabel: copy('Valore'), series: copy('Serie') },
          options: { showMarkers: false, showBand: true } as never,
        }),
      ],
    };
  }

  const series: ChartRow[] = [
    ...values.map((value, index) => ({ x: index + 1, y: value, series: copy('Osservato') })),
    ...fit.forecast.map(point => ({
      x: point.step,
      y: point.mean,
      lo: point.lo,
      hi: point.hi,
      series: copy('Previsione'),
    })),
  ];
  const regimeRows: ChartRow[] = fit.smoothed.map((probabilities, index) => ({
    x: index + 2,
    y: probabilities[1],
    series: copy('Probabilità regime 2'),
  }));
  return {
    ok: true,
    title: copy('Markov switching: {s1}', { s1: name }),
    header: copy('{s1} osservazioni · {s2} cambi di regime', {
      s1: fit.n,
      s2: fit.classification.reduce(
        (count, state, index) => count + (index > 0 && state !== fit.classification[index - 1] ? 1 : 0),
        0
      ),
    }),
    tables,
    report: stateSpaceReport(tables, fit),
    charts: [
      makeChart({
        id: 'statespace-markov',
        kind: 'line',
        title: copy('Serie e previsione'),
        subtitle: copy('media condizionata ai due regimi'),
        note: copy('La previsione integra la probabilità di ciascun regime; non assume che il regime resti fisso.'),
        data: { series },
        fields: { xLabel: 't', yLabel: copy('Valore'), series: copy('Serie') },
        options: { showMarkers: false, showBand: true } as never,
      }),
      makeChart({
        id: 'statespace-regimes',
        kind: 'line',
        title: copy('Probabilità del regime 2'),
        subtitle: copy('probabilità smussate con il filtro di Hamilton'),
        note: copy('Valori vicini a 1 indicano che la serie è nel secondo regime; le transizioni sono i passaggi da un regime all’altro.'),
        data: { series: regimeRows },
        fields: { xLabel: 't', yLabel: copy('Probabilità'), series: copy('Regime') },
        options: { showMarkers: false, showBand: false } as never,
      }),
    ],
  };
};
