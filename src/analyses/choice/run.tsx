import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import { choiceAnalysis, type ChoiceRow } from '../../stats/kernels/choice';
import { choiceTables } from '../../stats/tables/choice';
import { choiceReport } from '../../stats/reports/choice';
import type { AnalysisChart } from '../../stats/charts';
import type { Dataset } from '../../grid/types';
import type { ChoiceParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface ChoiceInput {
  grid: Dataset;
  params: ChoiceParams;
}

const flag = (value: string | number | undefined): boolean => {
  if (typeof value === 'number') return value > 0;
  const text = String(value ?? '').trim().toLowerCase();
  return text === '1' || text === 'true' || text === 'yes' || text === 'si' || text === 'sì';
};

export const buildChoiceOutput = ({ grid, params }: ChoiceInput): AnalysisRunResult => {
  if (params.mode === 'maxdiff') {
    const rows = grid.rows
      .map(row => ({
        block: String(row[params.set] ?? '').trim(),
        item: String(row[params.alternative] ?? '').trim(),
        best: flag(row[params.best] as string | undefined),
        worst: flag(row[params.worst] as string | undefined),
      }))
      .filter(row => row.block !== '' && row.item !== '' && (row.best || row.worst));
    if (rows.length < 4) {
      return { ok: false, reason: 'MaxDiff needs at least two blocks with a best and a worst choice' };
    }
    const result = choiceAnalysis([], {
      mode: 'maxdiff',
      variableNames: [],
      maxdiff: rows,
    });
    if (!result) {
      return { ok: false, reason: 'MaxDiff could not be computed: every block needs a best and a worst item' };
    }
    const charts: AnalysisChart[] = [
      makeChart({
        id: 'choice-maxdiff-scores',
        kind: 'bar',
        title: copy('Punteggi MaxDiff'),
        subtitle: copy('Migliore meno peggiore per elemento'),
        note: copy('Barre positive indicano elementi scelti più spesso come migliori che come peggiori; barre negative il contrario.'),
        data: {
          bars: result.maxdiff.map(item => ({
            category: item.item,
            value: item.score,
          })),
        },
        fields: { xLabel: copy('Elemento'), yLabel: copy('Punteggio') },
        options: { referenceLine: 'zero', valueLabels: true } as never,
      }),
      makeChart({
        id: 'choice-maxdiff-shares',
        kind: 'interval',
        title: copy('Quote di preferenza'),
        subtitle: copy('Quota con correttivo di Laplace e SE'),
        note: copy('Il punto è la quota; il segmento è l’intervallo di confidenza al 95% della proporzione.'),
        data: {
          intervals: result.maxdiff.map(item => ({
            category: item.item,
            estimate: 100 * item.share,
            lo: 100 * Math.max(0, item.share - 1.96 * item.se),
            hi: 100 * Math.min(1, item.share + 1.96 * item.se),
          })),
        },
        fields: { xLabel: copy('Quota %'), yLabel: copy('Elemento') },
      }),
    ];
    return {
      ok: true,
      title: copy('MaxDiff'),
      header: copy('{s1} blocchi · {s2} elementi', {
        s1: result.sets,
        s2: result.maxdiff.length,
      }),
      tables: choiceTables(result),
      report: choiceReport(result),
      charts,
    };
  }

  const attributes = Array.from(new Set(params.attributes));
  if (attributes.length === 0) {
    return { ok: false, reason: 'Select at least one attribute that varies across alternatives' };
  }
  const rows: ChoiceRow[] = [];
  grid.rows.forEach(row => {
    const set = String(row[params.set] ?? '').trim();
    const alternative = String(row[params.alternative] ?? '').trim();
    const values = attributes.map(index => parseNum(row[index]));
    if (set === '' || alternative === '' || values.some(value => !Number.isFinite(value))) return;
    rows.push({
      set,
      alternative,
      attributes: values,
      chosen: flag(row[params.chosen] as string | undefined),
    });
  });
  if (rows.length < 4) {
    return { ok: false, reason: 'The conditional logit needs at least four complete alternative rows' };
  }
  const variableNames = attributes.map(index => grid.cols[index]?.name ?? `X${index + 1}`);
  const result = choiceAnalysis(rows, { mode: 'choice', variableNames });
  if (!result) {
    return {
      ok: false,
      reason: 'The conditional logit could not be estimated: every set needs one chosen alternative and the attributes must vary',
    };
  }

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'choice-coefficients',
      kind: 'forest',
      title: copy('Coefficienti del logit condizionale'),
      subtitle: copy('IC 95% · riferimento zero'),
      note: copy('Un coefficiente positivo aumenta la probabilità di scegliere l’alternativa con quella caratteristica; l’intervallo che attraversa lo zero non esclude un effetto nullo.'),
      data: {
        points: result.coefficients.map(item => ({
          label: item.term,
          estimate: item.estimate,
          lo: item.estimate - 1.96 * item.se,
          hi: item.estimate + 1.96 * item.se,
        })),
      },
      fields: { xLabel: copy('Coefficiente'), yLabel: copy('Caratteristica') },
      options: { reference: 'zero' } as never,
    }),
    makeChart({
      id: 'choice-shares',
      kind: 'bar',
      title: copy('Quote osservate e previste'),
      subtitle: copy('Percentuale di scelta per alternativa'),
      note: copy('Confronta le barre osservate con quelle previste: scostamenti sistematici suggeriscono che manchino caratteristiche rilevanti.'),
      data: {
        bars: result.shares.flatMap(item => [
          { category: item.alternative, value: 100 * item.observed, series: copy('Osservata') },
          { category: item.alternative, value: 100 * item.predicted, series: copy('Prevista') },
        ]),
      },
      fields: { xLabel: copy('Alternativa'), yLabel: copy('Quota %'), series: copy('Tipo') },
      options: { grouping: 'grouped', valueLabels: true } as never,
    }),
  ];

  return {
    ok: true,
    title: copy('Scelta discreta'),
    header: copy('{s1} set · {s2} righe · McFadden R² {s3}', {
      s1: result.sets,
      s2: result.rows,
      s3: result.r2.toFixed(3),
    }),
    tables: choiceTables(result),
    report: choiceReport(result),
    charts,
  };
};
