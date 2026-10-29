import {
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryScatter,
  VictoryTheme,
} from 'victory';
import { sampleSizeReport, sampleSizeTables } from '../../stats/samplesize';
import { ResultTables } from '../../components/ResultTable';
import type { AnalysisRunResult } from '../types';
import type { SampleSizeParams } from '../../io/project';
import { t } from '../../i18n';

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

  return {
    ok: true,
    tables,
    report: sampleSizeReport(tables, 95),
    node: (
      <div className="mb-6">
        <ResultTables specs={tables} />
        <section className="mb-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
            <h3 className="text-[11px] text-accent2 font-semibold uppercase tracking-wider">
              Curva di potenza
            </h3>
            <span className="text-[10px] text-text3 font-mono">
              {`potenza ${Math.round(params.power * 100)}% · α = ${params.alpha}`}
            </span>
          </div>
          <div className="h-[260px] w-full bg-surface3/30 rounded p-2">
            <VictoryChart
              theme={VictoryTheme.material}
              padding={{ top: 15, bottom: 45, left: 60, right: 20 }}
              domain={{ y: [0, 100] }}
            >
              <VictoryAxis
                label={t('chart.nPerGroup')}
                style={{
                  axis: { stroke: '#333' },
                  axisLabel: { fill: '#888', fontSize: 10, padding: 30 },
                  tickLabels: { fill: '#888', fontSize: 9 },
                  grid: { stroke: '#222' },
                }}
              />
              <VictoryAxis
                dependentAxis
                tickFormat={value => `${value}%`}
                style={{
                  axis: { stroke: '#333' },
                  tickLabels: { fill: '#888', fontSize: 9 },
                  grid: { stroke: '#222' },
                }}
              />
              <VictoryLine
                data={chartData}
                style={{ data: { stroke: '#4f9cf9', strokeWidth: 2 } }}
              />
              <VictoryScatter
                data={chartData}
                style={{ data: { fill: '#34d399', size: 2.5 } }}
              />
            </VictoryChart>
          </div>
        </section>
      </div>
    ),
  };
};
