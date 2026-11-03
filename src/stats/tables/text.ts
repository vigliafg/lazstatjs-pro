import { copy } from '../reportCopy';
import type { TextResult } from '../w9Results';
import type { TableSpec } from '../types';

export const textTables = (result: TextResult, documentLabels: readonly string[]): TableSpec[] => {
  const terms: TableSpec = {
    id: 'text-terms',
    title: copy('Termini più frequenti'),
    subtitle: copy('Conteggio, documenti in cui compaiono e TF-IDF medio'),
    columns: [
      { key: 'term', label: copy('Termine'), align: 'left' },
      { key: 'count', label: copy('Frequenza'), format: 'int', align: 'right' },
      { key: 'documents', label: copy('Documenti'), format: 'int', align: 'right' },
      { key: 'tfidf', label: 'TF-IDF', format: 'dec3', align: 'right' },
    ],
    rows: result.terms.slice(0, 40).map(item => ({ ...item })),
  };
  const tables = [terms];
  if (result.mode === 'topics') {
    tables.push({
      id: 'text-topics',
      title: copy('Argomenti'),
      subtitle: copy('Termini con peso più alto e prevalenza media'),
      columns: [
        { key: 'topic', label: copy('Argomento'), format: 'int', align: 'right' },
        { key: 'prevalence', label: copy('Prevalenza %'), format: 'dec1', align: 'right' },
        { key: 'terms', label: copy('Termini'), align: 'left' },
      ],
      rows: result.topics.map(topic => ({
        topic: topic.topic,
        prevalence: 100 * topic.prevalence,
        terms: topic.terms.map(item => item.term).join(', '),
      })),
    });
    tables.push({
      id: 'text-document-topics',
      title: copy('Documenti e argomenti'),
      subtitle: copy('Peso dell’argomento in ciascun documento'),
      columns: [
        { key: 'document', label: copy('Documento'), align: 'left' },
        ...Array.from({ length: result.topics.length }, (_, index) => ({
          key: `topic${index + 1}`,
          label: copy('Argomento {s1}', { s1: index + 1 }),
          format: 'dec3' as const,
          align: 'right' as const,
        })),
      ],
      rows: result.documentTopics.slice(0, 40).map((weights, index) => {
        const row: Record<string, string | number> = {
          document: documentLabels[index] ?? copy('Documento {s1}', { s1: index + 1 }),
        };
        weights.forEach((weight, topic) => {
          row[`topic${topic + 1}`] = weight;
        });
        return row;
      }),
    });
  }
  if (result.mode === 'similarity') {
    tables.push({
      id: 'text-similarity',
      title: copy('Similarità tra documenti'),
      subtitle: copy('Coseno sui vettori TF-IDF'),
      columns: [
        { key: 'first', label: copy('Documento A'), align: 'left' },
        { key: 'second', label: copy('Documento B'), align: 'left' },
        { key: 'value', label: copy('Coseno'), format: 'dec3', align: 'right' },
      ],
      rows: result.similarity
        .slice()
        .sort((a, b) => b.value - a.value)
        .slice(0, 30)
        .map(item => ({
          first: documentLabels[item.first] ?? copy('Documento {s1}', { s1: item.first + 1 }),
          second: documentLabels[item.second] ?? copy('Documento {s1}', { s1: item.second + 1 }),
          value: item.value,
        })),
    });
  }
  return tables;
};
