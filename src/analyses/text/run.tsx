import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { textAnalysis } from '../../stats/kernels/text';
import { textTables } from '../../stats/tables/text';
import { textReport } from '../../stats/reports/text';
import type { AnalysisChart } from '../../stats/charts';
import type { Dataset } from '../../grid/types';
import type { TextParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface TextInput {
  grid: Dataset;
  params: TextParams;
}

export const buildTextOutput = ({ grid, params }: TextInput): AnalysisRunResult => {
  const documents: string[] = [];
  const labels: string[] = [];
  grid.rows.forEach((row, index) => {
    const value = String(row[params.text] ?? '').trim();
    if (value === '') return;
    documents.push(value);
    const group = params.group >= 0 ? String(row[params.group] ?? '').trim() : '';
    labels.push(group ? `${group} · ${index + 1}` : copy('Documento {s1}', { s1: index + 1 }));
  });
  if (documents.length < 2) {
    return { ok: false, reason: 'Text mining needs at least two non-empty documents' };
  }
  const result = textAnalysis(documents, {
    mode: params.mode,
    maxTerms: params.maxTerms,
    minDocFreq: params.minDocFreq,
    topics: params.topics,
    iterations: params.iterations,
    seed: params.seed,
    stopwords: params.stopwords,
  });
  if (!result) {
    return {
      ok: false,
      reason: 'The corpus is too small for the selected vocabulary and mode: lower the minimum document frequency or add text',
    };
  }

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'text-terms',
      kind: 'bar',
      title: copy('Termini più frequenti'),
      subtitle: copy('Prime {s1} voci del vocabolario', { s1: Math.min(20, result.terms.length) }),
      note: copy('La barra conta tutte le occorrenze del termine nel corpus; i termini rari restano fuori dalle prime venti voci.'),
      data: {
        bars: result.terms.slice(0, 20).map(item => ({
          category: item.term,
          value: item.count,
        })),
      },
      fields: { xLabel: copy('Termine'), yLabel: copy('Frequenza') },
      options: { valueLabels: false } as never,
    }),
  ];

  if (result.mode === 'topics') {
    charts.push(
      makeChart({
        id: 'text-topic-prevalence',
        kind: 'bar',
        title: copy('Prevalenza degli argomenti'),
        subtitle: copy('Quota media di ciascun argomento nei documenti'),
        note: copy('La prevalenza è la media dei pesi dei documenti: somma a 1 se ogni documento è assegnato a un solo argomento.'),
        data: {
          bars: result.topics.map(topic => ({
            category: copy('Argomento {s1}', { s1: topic.topic }),
            value: 100 * topic.prevalence,
          })),
        },
        fields: { xLabel: copy('Argomento'), yLabel: copy('Prevalenza %') },
        options: { valueLabels: true } as never,
      })
    );
    const shown = result.documentTopics.slice(0, 25);
    charts.push(
      makeChart({
        id: 'text-document-topics',
        kind: 'heatmap',
        title: copy('Documenti e argomenti'),
        subtitle: copy('Prime {s1} righe', { s1: shown.length }),
        note: copy('Il colore mostra il peso dell’argomento nel documento; righe con più colori mescolano argomenti.'),
        data: {
          cells: shown.flatMap((weights, document) =>
            weights.map((weight, topic) => ({
              x: copy('Argomento {s1}', { s1: topic + 1 }),
              y: labels[document] ?? copy('Documento {s1}', { s1: document + 1 }),
              value: weight,
              label: weight.toFixed(2),
            }))
          ),
        },
        fields: { xLabel: copy('Argomento'), yLabel: copy('Documento') },
        options: { showValues: false } as never,
      })
    );
  }

  if (result.mode === 'similarity') {
    const shown = Math.min(20, result.documents);
    charts.push(
      makeChart({
        id: 'text-similarity',
        kind: 'heatmap',
        title: copy('Similarità tra documenti'),
        subtitle: copy('Coseno TF-IDF sui primi {s1} documenti', { s1: shown }),
        note: copy('Celle più scure indicano documenti con vocabolario e pesi simili; la matrice è simmetrica e la diagonale (un documento con sé stesso) non è disegnata.'),
        data: {
          cells: result.similarity
            .filter(item => item.first < shown && item.second < shown)
            .flatMap(item => [
              {
                x: labels[item.second] ?? copy('Documento {s1}', { s1: item.second + 1 }),
                y: labels[item.first] ?? copy('Documento {s1}', { s1: item.first + 1 }),
                value: item.value,
                label: item.value.toFixed(2),
              },
              {
                x: labels[item.first] ?? copy('Documento {s1}', { s1: item.first + 1 }),
                y: labels[item.second] ?? copy('Documento {s1}', { s1: item.second + 1 }),
                value: item.value,
                label: item.value.toFixed(2),
              },
            ]),
        },
        fields: { xLabel: copy('Documento'), yLabel: copy('Documento') },
        options: { showValues: false } as never,
      })
    );
  }

  return {
    ok: true,
    title: copy('Text mining'),
    header: copy('{s1} documenti · {s2} termini · {s3} gettoni', {
      s1: result.documents,
      s2: result.vocabulary,
      s3: result.totalTokens,
    }),
    tables: textTables(result, labels),
    report: textReport(result),
    charts,
  };
};
