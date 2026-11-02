import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import { responseSurface } from '../../stats/kernels/doe';
import { doeTables } from '../../stats/tables/doe';
import { doeReport } from '../../stats/reports/doe';
import type { AnalysisChart } from '../../stats/charts';
import type { Dataset } from '../../grid/types';
import type { DoeParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface DoeInput {
  grid: Dataset;
  params: DoeParams;
  ciLevel: number;
}

/** Quadratic response surface with projected mesh, contours and coefficients. */
export const buildDoeOutput = ({ grid, params }: DoeInput): AnalysisRunResult => {
  const { response, factorA, factorB, model } = params;
  if (response === factorA || response === factorB || factorA === factorB) {
    return { ok: false, reason: 'Response and the two factors must be three different columns' };
  }
  const rows = grid.rows
    .map(row => ({
      y: parseNum(row[response]),
      a: parseNum(row[factorA]),
      b: parseNum(row[factorB]),
    }))
    .filter(row => Number.isFinite(row.y) && Number.isFinite(row.a) && Number.isFinite(row.b));
  if (rows.length < 8) {
    return {
      ok: false,
      reason: 'Response surface needs at least eight complete rows: three numeric columns',
    };
  }

  const result = responseSurface({
    response: rows.map(row => row.y),
    factorA: rows.map(row => row.a),
    factorB: rows.map(row => row.b),
    model,
  });
  if (!result) {
    return {
      ok: false,
      reason: 'The surface could not be estimated: check collinear factors and complete rows',
    };
  }

  const responseName = grid.cols[response]?.name ?? 'Y';
  const factorAName = grid.cols[factorA]?.name ?? 'A';
  const factorBName = grid.cols[factorB]?.name ?? 'B';
  const tables = doeTables({ result, responseName, factorAName, factorBName });
  const contourPoints = rows.map(row => ({
    x: row.a,
    y: row.b,
    label: `${row.a.toFixed(2)}, ${row.b.toFixed(2)}`,
  }));
  const coefficients = result.terms
    .filter(term => term.name !== 'Intercetta')
    .map(term => ({
      category: term.name.replace('A', factorAName).replace('B', factorBName),
      value: term.estimate,
    }));
  // The profiler evaluates the same polynomial in the browser. Coefficients are
  // declared on the surface chart so the interaction needs no second kernel run.
  const coefficientStats: Record<string, number | string> = { model };
  const putCoefficient = (key: string, term: string): void => {
    const estimate = result.terms.find(item => item.name === term)?.estimate;
    if (typeof estimate === 'number' && Number.isFinite(estimate)) coefficientStats[key] = estimate;
  };
  putCoefficient('coefIntercept', 'Intercetta');
  putCoefficient('coefA', 'A');
  putCoefficient('coefB', 'B');
  putCoefficient('coefAA', 'A²');
  putCoefficient('coefAB', 'A·B');
  putCoefficient('coefBB', 'B²');
  const gridZ = result.grid.flat().map(cell => cell.z).filter(Number.isFinite);

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'doe-surface',
      kind: 'surface',
      title: copy('Superficie di risposta'),
      subtitle: copy('{s1} in funzione di {s2} e {s3}', {
        s1: responseName,
        s2: factorAName,
        s3: factorBName,
      }),
      note: copy('La griglia è una proiezione 2D di una superficie 3D: mostra la forma e le zone alte o basse, non i valori esatti. I punti sono le osservazioni proiettate sullo stesso piano.'),
      data: {
        lines: result.mesh,
        points: result.points.map(point => ({ ...point, label: '' })),
      },
      fields: { xLabel: factorAName, yLabel: factorBName },
      stats: {
        aMin: result.aMin,
        aMax: result.aMax,
        bMin: result.bMin,
        bMax: result.bMax,
        ...(gridZ.length > 0 ? { zMin: Math.min(...gridZ), zMax: Math.max(...gridZ) } : {}),
        ...coefficientStats,
      },
      options: { display: 'mesh', showPoints: true, showGrid: true } as never,
    }),
    makeChart({
      id: 'doe-contour',
      kind: 'surface',
      title: copy('Curve di livello'),
      subtitle: copy('{s1} previsto', { s1: responseName }),
      note: copy('Le linee collegano combinazioni di fattori con la stessa risposta prevista. Curve vicine indicano un cambiamento rapido; curve chiuse indicano un massimo o un minimo.'),
      data: {
        lines: result.contours,
        points: contourPoints,
      },
      fields: { xLabel: factorAName, yLabel: factorBName },
      options: { display: 'contour', showPoints: true, showGrid: true } as never,
    }),
    makeChart({
      id: 'doe-coefficients',
      kind: 'bar',
      title: copy('Coefficienti del modello'),
      subtitle: copy('Effetto di ogni termine sulla risposta'),
      note: copy('La barra è la stima del coefficiente; il segno dice se la risposta cresce o cala quando il termine aumenta. L’intercetta è omessa perché non è un effetto.'),
      data: { bars: coefficients },
      fields: { xLabel: copy('Termine'), yLabel: copy('Stima') },
      options: { valueLabels: true, referenceLine: 'zero' } as never,
    }),
  ];

  return {
    ok: true,
    title: copy('Superficie di risposta (DOE)'),
    header: copy('{s1} · N = {s2} · modello {s3}', {
      s1: responseName,
      s2: result.n,
      s3: model === 'quadratic' ? copy('quadratico') : copy('lineare'),
    }),
    tables,
    report: doeReport(result, responseName, factorAName, factorBName),
    charts,
  };
};
