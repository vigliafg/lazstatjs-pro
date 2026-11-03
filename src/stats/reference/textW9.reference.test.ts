import test from 'node:test';
import assert from 'node:assert/strict';
import { textAnalysis } from '../kernels/text';
import { assertClose, loadFixture, TOLERANCES } from './harness';

interface TextFixture {
  source: string;
  documents: string[];
  terms: string[];
  counts: number[];
  documents_per_term: number[];
  idf: number[];
  average_tfidf: number[];
  similarity: number[][];
  reconstruction: number;
}

const fixture = loadFixture<TextFixture>('textW9.json');

test('term counts, document frequency and TF-IDF reproduce the base-R pipeline', () => {
  const result = textAnalysis(fixture.documents, {
    mode: 'tfidf',
    maxTerms: 15,
    minDocFreq: 1,
    topics: 2,
    iterations: 300,
    seed: 1,
    stopwords: false,
  });
  assert.ok(result);
  const byTerm = new Map(result!.terms.map(term => [term.term, term]));
  fixture.terms.forEach((term, index) => {
    const entry = byTerm.get(term);
    assert.ok(entry, `missing term ${term}`);
    assert.equal(entry!.count, fixture.counts[index], `${term} count`);
    assert.equal(entry!.documents, fixture.documents_per_term[index], `${term} documents`);
    assertClose(entry!.tfidf, fixture.average_tfidf[index], TOLERANCES.r, `${term} TF-IDF`);
  });
});

test('document similarity reproduces the cosine matrix', () => {
  const result = textAnalysis(fixture.documents, {
    mode: 'similarity',
    maxTerms: 15,
    minDocFreq: 1,
    topics: 2,
    iterations: 300,
    seed: 1,
    stopwords: false,
  });
  assert.ok(result);
  const byPair = new Map(result!.similarity.map(item => [`${item.first}:${item.second}`, item.value]));
  for (let first = 0; first < fixture.documents.length; first += 1) {
    for (let second = first + 1; second < fixture.documents.length; second += 1) {
      assertClose(
        byPair.get(`${first}:${second}`) ?? NaN,
        fixture.similarity[first][second],
        TOLERANCES.r,
        `cosine ${first}-${second}`
      );
    }
  }
});

test('topic reconstruction is in the same range as NMF::nmf', () => {
  const result = textAnalysis(fixture.documents, {
    mode: 'topics',
    maxTerms: 15,
    minDocFreq: 1,
    topics: 2,
    iterations: 400,
    seed: 20261113,
    stopwords: false,
  });
  assert.ok(result);
  assertClose(result!.reconstruction!, fixture.reconstruction, { absolute: 0.15 }, 'reconstruction R2');
});
