import { jStat } from '../../stats/jstat';
import { parseNum } from '../../stats/core';
import { correlationTables } from '../../stats/correlation';
import { correlationPairs } from '../../stats/kernels/correlation';
import { correlationReport } from '../../stats/report';
import { calcKendallTau } from '../../stats/kernels';
import type { Dataset } from '../../grid/types';
import type { CorrParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';
import { copy } from '../../stats/reportCopy';
import { makeChart, boxRows } from '../../charts/kits/common';
import type { AnalysisChart } from '../../stats/charts';

export interface CorrelationRunInput {
  grid: Dataset;
  corrParams: CorrParams;
  ciLevel: number;
}

/** Correlazioni: tabelle, grafici e report. Estratto da App.tsx senza cambi di comportamento. */
  export const buildCorrelationOutput = (input: CorrelationRunInput): AnalysisRunResult => {
  const { grid, corrParams, ciLevel } = input;
    const { vars, method, showSpearman, showKendall } = corrParams;
    if (vars.length < 2) {
      return { ok: false, reason: 'Select at least 2 variables' };
    }

    const matrixPearson: number[][] = [];
    const matrixSpearman: number[][] = [];
    const matrixKendall: number[][] = [];

    for (let i = 0; i < vars.length; i++) {
      matrixPearson[i] = [];
      matrixSpearman[i] = [];
      matrixKendall[i] = [];

      for (let j = 0; j < vars.length; j++) {
        if (i === j) {
          matrixPearson[i][j] = 1;
          matrixSpearman[i][j] = 1;
          matrixKendall[i][j] = 1;
          continue;
        }
        
        const v1 = vars[i];
        const v2 = vars[j];
        
        // Pairwise deletion
        const pairs = grid.rows.map(row => [parseNum(row[v1]), parseNum(row[v2])])
          .filter(p => !isNaN(p[0]) && !isNaN(p[1]));
        
        if (pairs.length < 3) {
          matrixPearson[i][j] = NaN;
          matrixSpearman[i][j] = NaN;
          matrixKendall[i][j] = NaN;
          continue;
        }

        const x = pairs.map(p => p[0]);
        const y = pairs.map(p => p[1]);

        // Pearson
        matrixPearson[i][j] = jStat.corrcoeff(x, y);

        // Spearman
        const rankX = jStat.rank(x);
        const rankY = jStat.rank(y);
        matrixSpearman[i][j] = jStat.corrcoeff(rankX, rankY);

        // Kendall's Tau
        matrixKendall[i][j] = calcKendallTau(x, y);
      }
    }

    const corrChartDataPearson = vars.slice(1).map((vIdx, i) => ({
      name: grid.cols[vIdx].name,
      value: matrixPearson[0][i + 1]
    }));

    const corrChartDataSpearman = vars.slice(1).map((vIdx, i) => ({
      name: grid.cols[vIdx].name,
      value: matrixSpearman[0][i + 1]
    }));

    const corrChartDataKendall = vars.slice(1).map((vIdx, i) => ({
      name: grid.cols[vIdx].name,
      value: matrixKendall[0][i + 1]
    }));

    const corrBoxPlotData = vars.map(idx => {
      const vals = grid.rows.map(row => parseNum(row[idx])).filter(v => !isNaN(v));
      const quartiles = jStat.quartiles(vals);
      return {
        x: grid.cols[idx].name,
        min: jStat.min(vals),
        q1: quartiles[0],
        median: quartiles[1],
        q3: quartiles[2],
        max: jStat.max(vals)
      };
    });

    // Scatter and Rank Scatter data for 2-variable case
    const rawScatterData = grid.rows.map(r => ({
      x: parseNum(r[vars[0]]),
      y: parseNum(r[vars[1]])
    })).filter(p => !isNaN(p.x) && !isNaN(p.y));

    let rankScatterData: { x: number; y: number }[] = [];
    if (vars.length === 2 && rawScatterData.length >= 3) {
      const xs = rawScatterData.map(d => d.x);
      const ys = rawScatterData.map(d => d.y);
      const rx = jStat.rank(xs);
      const ry = jStat.rank(ys);
      rankScatterData = rx.map((val, idx) => ({
        x: val,
        y: ry[idx]
      }));
    }

    const tables = correlationTables({
      rows: grid.rows,
      varIdxs: vars,
      varNames: vars.map(index => grid.cols[index].name),
      level: ciLevel,
      method: method as any,
      showSpearman,
      showKendall,
    });
    const report = correlationReport({
      tables,
      method: method as 'pearson' | 'spearman' | 'kendall',
      level: ciLevel,
    });

    const names = vars.map(index => grid.cols[index].name);
    const charts: AnalysisChart[] = [];
    if (vars.length === 2) {
      charts.push(
        makeChart({
          id: 'corr-raw-scatter',
          kind: 'scatter',
          title: copy('Correlazione: dispersione grezza'),
          subtitle: `${names[0]} × ${names[1]}`,
          note: copy('Ogni punto è un caso completo; la nuvola mostra direzione e forza dell’associazione.'),
          data: { points: rawScatterData },
          fields: { xLabel: names[0], yLabel: names[1] },
          options: { fit: 'none', band: 'none' } as never,
        })
      );
      if (showSpearman && rankScatterData.length > 0) {
        charts.push(
          makeChart({
            id: 'corr-rank-scatter',
            kind: 'score',
            title: copy('Correlazione: ranghi di Spearman'),
            subtitle: `${names[0]} × ${names[1]}`,
            note: copy('Lo spazio dei ranghi riduce l’effetto di valori estremi e distribuzioni asimmetriche.'),
            data: { points: rankScatterData },
            fields: { xLabel: `${copy('Rango')}: ${names[0]}`, yLabel: `${copy('Rango')}: ${names[1]}` },
          })
        );
      }
    } else {
      const box = boxRows(
        vars.map(index => ({
          category: grid.cols[index].name,
          values: grid.rows.map(row => parseNum(row[index])).filter(value => !isNaN(value)),
        }))
      );
      charts.push(
        makeChart({
          id: 'corr-box',
          kind: 'box',
          title: copy('Distribuzione delle variabili selezionate'),
          subtitle: copy('Confronto delle scale'),
          data: { summary: box.summary, points: box.points, outliers: box.outliers },
          fields: { xLabel: copy('Variabile'), yLabel: copy('Valore') },
        })
      );
      const pairs = correlationPairs(grid.rows, vars, ciLevel);
      const pairMap = new Map(pairs.map(pair => [`${pair.a}-${pair.b}`, pair]));
      const cells = vars.flatMap((_, i) =>
        vars.map((__, j) => {
          const pair = i === j ? null : pairMap.get(`${Math.min(i, j)}-${Math.max(i, j)}`);
          const value = i === j
            ? 1
            : pair
              ? method === 'spearman' ? pair.spearman : method === 'kendall' ? pair.kendall : pair.pearson
              : NaN;
          return {
            x: names[j],
            y: names[i],
            value: Number.isFinite(value) ? value : 0,
            label: Number.isFinite(value) ? value.toFixed(2) : '—',
          };
        })
      );
      charts.push(
        makeChart({
          id: 'corr-heatmap',
          kind: 'heatmap',
          title: copy('Matrice di correlazione'),
          subtitle: `${method} · CI ${ciLevel}%`,
          note: copy('La diagonale vale 1; i colori mostrano direzione e forza delle correlazioni a coppie.'),
          data: { cells },
          fields: { xLabel: copy('Variabile'), yLabel: copy('Variabile') },
          options: { showValues: true, diverging: true } as never,
        })
      );
    }
    return {
      ok: true,
      title: copy('Analisi delle correlazioni'),
      tables,
      report,
      charts,
    };
  };
