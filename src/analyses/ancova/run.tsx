import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryGroup,
  VictoryLegend,
  VictoryTheme,
} from 'victory';
import { ancovaReport, ancovaTables } from '../../stats/ancova';
import { ResultTables } from '../../components/ResultTable';
import { parseNum } from '../../stats/core';
import {
  analysisRows,
  levelLabel,
  orderedColumnLevels,
  referenceFirst,
  type Dataset,
} from '../../grid/types';
import type { AncovaParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface AncovaInput {
  grid: Dataset;
  params: AncovaParams;
  ciLevel: number;
}

const AXIS_STYLE = {
  axis: { stroke: '#333' },
  axisLabel: { fill: '#888', fontSize: 10, padding: 38 },
  tickLabels: { fill: '#888', fontSize: 9 },
  grid: { stroke: '#222' },
};

/** ANCOVA: tabelle, medie grezze/aggiustate e report. */
export const buildAncovaOutput = ({ grid, params, ciLevel }: AncovaInput): AnalysisRunResult => {
  const { response, factor, covariates } = params;

  if (response === factor) {
    return { ok: false, reason: 'The response must be different from the factor' };
  }
  const chosen = covariates.filter(index => index !== response && index !== factor);
  if (chosen.length === 0) {
    return { ok: false, reason: 'Select at least one numeric covariate' };
  }

  const y: number[] = [];
  const levels: string[] = [];
  const covariateValues: number[][] = chosen.map(() => []);
  analysisRows(grid, [factor]).forEach(row => {
    const value = parseNum(row[response]);
    const level = String(row[factor] ?? '').trim();
    if (!Number.isFinite(value) || level === '') return;
    const covs = chosen.map(index => parseNum(row[index]));
    if (covs.some(cell => !Number.isFinite(cell))) return;
    y.push(value);
    levels.push(level);
    covs.forEach((cell, index) => covariateValues[index].push(cell));
  });

  if (y.length < 4) {
    return {
      ok: false,
      reason: 'Not enough complete rows for the selected response, factor and covariates',
    };
  }
  const groups = new Set(levels);
  if (groups.size < 2) {
    return { ok: false, reason: 'The factor needs at least two groups with complete data' };
  }

  const responseName = grid.cols[response]?.name ?? 'Y';
  const factorName = grid.cols[factor]?.name ?? 'Fattore';
  const covariateNames = chosen.map(index => grid.cols[index]?.name ?? `Cov${index + 1}`);
  const factorCol = grid.cols[factor];
  const declaredLevels = orderedColumnLevels(factorCol, grid.rows, factor).map(level =>
    levelLabel(factorCol, level.value)
  );
  const referenceLabel = factorCol?.reference ? levelLabel(factorCol, factorCol.reference) : undefined;
  const options = {
    response: y,
    factor: levels,
    covariates: covariateValues,
    responseName,
    factorName,
    covariateNames,
    levels: referenceFirst(declaredLevels, referenceLabel),
    level: ciLevel,
  };

  const tables = ancovaTables(options);
  if (tables.length === 0) {
    return {
      ok: false,
      reason:
        'The model is not estimable: check collinearity, group sizes and that there are more rows than parameters',
    };
  }

  const means = tables.find(table => table.id === 'ancova-means')?.rows ?? [];
  const chartData = means.map((row, index) => ({
    x: index,
    group: String(row.group ?? ''),
    raw: Number(row.rawMean ?? NaN),
    adjusted: Number(row.adjusted ?? NaN),
  }));
  const domainX = chartData.map(point => point.x);

  return {
    ok: true,
    tables,
    report: ancovaReport(tables, factorName, covariateNames, ciLevel),
    node: (
      <div className="mb-6">
        <p className="text-[10px] text-text3 font-mono mb-3">
          {`ANCOVA · ${responseName} ~ ${factorName} + ${covariateNames.join(' + ')} · ${levels.length} righe`}
        </p>
        <ResultTables specs={tables} />
        <section className="mb-6">
          <h3 className="text-[11px] text-accent2 font-semibold uppercase tracking-wider mb-2">
            Medie grezze e aggiustate
          </h3>
          <div className="h-[300px] w-full bg-surface3/30 rounded p-2">
            <VictoryChart
              theme={VictoryTheme.material}
              domainPadding={{ x: 28 }}
              padding={{ top: 45, bottom: 55, left: 60, right: 20 }}
            >
              <VictoryLegend
                x={60}
                y={10}
                orientation="horizontal"
                gutter={18}
                style={{
                  labels: { fill: '#aaa', fontSize: 9 },
                  data: { strokeWidth: 0 },
                }}
                data={[
                  { name: 'Grezza', symbol: { fill: '#4f9cf9' } },
                  { name: 'Aggiustata', symbol: { fill: '#34d399' } },
                ]}
              />
              <VictoryAxis
                tickValues={domainX}
                tickFormat={(value: number) => chartData[value]?.group ?? ''}
                style={AXIS_STYLE}
              />
              <VictoryAxis dependentAxis label={responseName} style={AXIS_STYLE} />
              <VictoryGroup offset={18} colorScale={['#4f9cf9', '#34d399']}>
                <VictoryBar
                  data={chartData.map(point => ({ x: point.x, y: point.raw }))}
                  labels={({ datum }) => (Number.isFinite(datum.y) ? datum.y.toFixed(2) : '')}
                  style={{ data: { width: 16 } }}
                />
                <VictoryBar
                  data={chartData.map(point => ({ x: point.x, y: point.adjusted }))}
                  labels={({ datum }) => (Number.isFinite(datum.y) ? datum.y.toFixed(2) : '')}
                  style={{ data: { width: 16 } }}
                />
              </VictoryGroup>
            </VictoryChart>
          </div>
          <p className="text-[10px] text-text3 mt-1">
            Le barre verdi sono le medie aggiustate alla media delle covariate: è questa la
            differenza che l’ANCOVA testa.
          </p>
        </section>
      </div>
    ),
  };
};
