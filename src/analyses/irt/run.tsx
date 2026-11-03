import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { iccProbability, irtAnalysis } from '../../stats/kernels/irt';
import { GUARD_LIMITS, guardDimensions } from '../../stats/kernels/guards';
import { irtTables } from '../../stats/tables/irt';
import { irtReport } from '../../stats/reports/irt';
import type { AnalysisChart } from '../../stats/charts';
import type { Dataset } from '../../grid/types';
import type { IrtParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface IrtInput {
  grid: Dataset;
  params: IrtParams;
}

export const buildIrtOutput = ({ grid, params }: IrtInput): AnalysisRunResult => {
  const columns = Array.from(new Set(params.selected));
  if (columns.length < 2) return { ok: false, reason: 'Select at least two binary items' };
  const rows = grid.rows
    .map(row => columns.map(column => String(row[column] ?? '').trim()))
    .filter(row => row.every(value => value !== ''));
  if (rows.length < 5) return { ok: false, reason: 'IRT needs at least five complete rows' };
  const encoded = rows.map(row => row.map(value => (value === '1' ? 1 : value === '0' ? 0 : -1)));
  if (encoded.some(row => row.some(value => value < 0))) {
    return { ok: false, reason: 'IRT items must be coded 0/1' };
  }
  const guard = guardDimensions(
    { rows: rows.length, columns: columns.length },
    GUARD_LIMITS.iterative
  );
  if (guard.ok === false) return { ok: false, reason: guard.message };
  const variableNames = columns.map(index => grid.cols[index]?.name ?? `Item ${index + 1}`);
  const result = irtAnalysis({
    data: encoded,
    variableNames,
    model: params.model,
    quadrature: params.quadrature,
  });
  if (!result) return { ok: false, reason: 'IRT model could not be estimated' };

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'irt-items',
      kind: 'bar',
      title: copy('Difficoltà degli item'),
      subtitle: result.model === '2pl' ? '2PL' : 'Rasch',
      note: copy('Valori più alti indicano item più difficili: servono abilità maggiori per una probabilità di risposta corretta del 50%.'),
      data: {
        bars: result.items.map(item => ({ category: item.variable, value: item.difficulty })),
      },
      fields: { xLabel: copy('Item'), yLabel: copy('Difficoltà b') },
      options: { valueLabels: true, referenceLine: 'zero' } as never,
    }),
    makeChart({
      id: 'irt-icc',
      kind: 'line',
      title: copy('Curve caratteristiche degli item'),
      subtitle: copy('Probabilità di risposta corretta per abilità'),
      note: copy(
        'Ogni curva è un item: più è ripida, più l’item discrimina; il punto in cui la curva vale 0,5 è la difficoltà b. Curve sovrapposte indicano item con lo stesso profilo.'
      ),
      data: {
        series: result.thetaGrid.flatMap(theta =>
          result.items.map(item => ({
            x: theta,
            y: iccProbability(item.discrimination, item.difficulty, theta),
            series: item.variable,
          }))
        ),
      },
      fields: { xLabel: copy('Abilità θ'), yLabel: copy('P(corretta)'), series: copy('Item') },
      options: { showMarkers: false, showBand: false } as never,
    }),
    makeChart({
      id: 'irt-information',
      kind: 'line',
      title: copy('Informazione del test'),
      subtitle: copy('Somma delle informazioni degli item'),
      note: copy('La curva mostra dove il test discrimina meglio: un picco alto indica una fascia di abilità misurata con più precisione.'),
      data: {
        series: result.thetaGrid.map((theta, index) => ({
          x: theta,
          y: result.testInformation[index] ?? 0,
          series: copy('Informazione'),
        })),
      },
      fields: { xLabel: copy('Abilità θ'), yLabel: copy('Informazione'), series: copy('Serie') },
      options: { showMarkers: false, showBand: false } as never,
    }),
  ];

  return {
    ok: true,
    title: copy('Teoria della risposta all’item'),
    header: copy('{s1} item · {s2} osservazioni · {s3}', {
      s1: columns.length,
      s2: rows.length,
      s3: result.model === '2pl' ? '2PL' : 'Rasch',
    }),
    tables: irtTables(result),
    report: irtReport(result),
    charts,
  };
};
