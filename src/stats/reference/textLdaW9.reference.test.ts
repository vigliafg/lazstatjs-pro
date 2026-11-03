import test from 'node:test';
import assert from 'node:assert/strict';
import { textAnalysis } from '../kernels/text';
import { loadFixture } from './harness';

interface LdaFixture {
  source: string;
  documents: string[];
  vocabulary: string[];
  topics: { topic: number; prevalence: number; terms: string[] }[];
  perplexity: number;
}

const fixture = loadFixture<LdaFixture>('textLdaW9.json');

const clusters = [
  new Set(['model', 'data', 'regression', 'estimate', 'sample', 'variable']),
  new Set(['patient', 'treatment', 'clinical', 'trial', 'dose', 'outcome']),
  new Set(['market', 'price', 'customer', 'demand', 'product', 'sales']),
];

test('LDA recovers the three generating vocabularies', () => {
  const result = textAnalysis(fixture.documents, {
    mode: 'topics',
    maxTerms: 15,
    minDocFreq: 1,
    topics: 3,
    iterations: 400,
    seed: 20261113,
    stopwords: false,
  });
  assert.ok(result);
  const top = result!.topics.map(topic => topic.terms[0]?.term ?? '');
  const matched = clusters.filter(cluster => top.some(term => cluster.has(term)));
  assert.equal(matched.length, 3, `top terms did not cover all clusters: ${top.join(', ')}`);
  assert.ok(
    result!.perplexity! < fixture.perplexity * 1.5,
    `perplexity ${result!.perplexity} is worse than the variational reference ${fixture.perplexity}`
  );
});
