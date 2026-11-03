import { mulberry32 } from './distributions';

const STOPWORDS = new Set(
  (
    'a an the and or but if then else of to in on at by for with from as is are was were be been ' +
    'being it its this that these those he she they we you i not no yes do does did done have has ' +
    'had having can could should would will shall may might must about into over under between ' +
    'after before during while than too very also more most less least such only own same so just ' +
    'di e ed a ad al alla alle allo agli ai da dal dalla dalle dallo dagli dai in nel nella nelle ' +
    'nello negli nei con su per tra fra che chi cui non si sono è era erano essere stato stata ' +
    'come dove quando perché più meno molto anche questo questa questi queste quello quella quelli ' +
    'quelle un una uno il lo la i gli le del della delle dello degli dei'
  ).split(/\s+/)
);

export interface TextTerm {
  term: string;
  count: number;
  documents: number;
  tfidf: number;
}

export interface TextTopic {
  topic: number;
  prevalence: number;
  terms: { term: string; weight: number }[];
}

export interface TextSimilarity {
  first: number;
  second: number;
  value: number;
}

export interface TextResult {
  mode: 'frequency' | 'tfidf' | 'similarity' | 'topics';
  documents: number;
  vocabulary: number;
  totalTokens: number;
  averageLength: number;
  terms: TextTerm[];
  documentTerms: { document: number; terms: { term: string; count: number }[] }[];
  similarity: TextSimilarity[];
  topics: TextTopic[];
  documentTopics: number[][];
  reconstruction: number | null;
  iterations: number;
}

const tokenize = (text: string, removeStopwords: boolean): string[] =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .map(token => token.trim())
    .filter(token => token.length >= 2)
    .filter(token => !removeStopwords || !STOPWORDS.has(token))
    .filter(token => !/^\d+$/.test(token));

interface Matrix {
  data: number[][];
  rows: number;
  cols: number;
}

const multiplyAB = (a: Matrix, b: Matrix): Matrix => {
  const data = Array.from({ length: a.rows }, () => Array(b.cols).fill(0));
  for (let i = 0; i < a.rows; i += 1) {
    for (let k = 0; k < a.cols; k += 1) {
      const value = a.data[i][k];
      if (value === 0) continue;
      for (let j = 0; j < b.cols; j += 1) data[i][j] += value * b.data[k][j];
    }
  }
  return { data, rows: a.rows, cols: b.cols };
};

const transpose = (matrix: Matrix): Matrix => ({
  data: Array.from({ length: matrix.cols }, (_, j) =>
    Array.from({ length: matrix.rows }, (_, i) => matrix.data[i][j])
  ),
  rows: matrix.cols,
  cols: matrix.rows,
});

const hadamard = (a: Matrix, b: Matrix): Matrix => ({
  data: a.data.map((row, i) => row.map((value, j) => value * b.data[i][j])),
  rows: a.rows,
  cols: a.cols,
});

const divide = (a: Matrix, b: Matrix, epsilon = 1e-9): Matrix => ({
  data: a.data.map((row, i) => row.map((value, j) => value / (b.data[i][j] + epsilon))),
  rows: a.rows,
  cols: a.cols,
});

/** Non-negative matrix factorisation with multiplicative Frobenius updates. */
const factorize = (
  matrix: Matrix,
  rank: number,
  iterations: number,
  seed: number
): { w: Matrix; h: Matrix; error: number } => {
  const rng = mulberry32(seed);
  const w: Matrix = {
    data: Array.from({ length: matrix.rows }, () =>
      Array.from({ length: rank }, () => 0.1 + rng())
    ),
    rows: matrix.rows,
    cols: rank,
  };
  const h: Matrix = {
    data: Array.from({ length: rank }, () =>
      Array.from({ length: matrix.cols }, () => 0.1 + rng())
    ),
    rows: rank,
    cols: matrix.cols,
  };
  const wt = () => transpose(w);
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    h.data = hadamard(h, divide(multiplyAB(wt(), matrix), multiplyAB(multiplyAB(wt(), w), h))).data;
    w.data = hadamard(w, divide(multiplyAB(matrix, transpose(h)), multiplyAB(w, multiplyAB(h, transpose(h))))).data;
  }
  // Normalise topics so the rows of H sum to one and W carries the mass.
  for (let topic = 0; topic < rank; topic += 1) {
    const mass = h.data[topic].reduce((sum, value) => sum + value, 0) || 1;
    for (let column = 0; column < h.cols; column += 1) h.data[topic][column] /= mass;
    for (let row = 0; row < w.rows; row += 1) w.data[row][topic] *= mass;
  }
  const reconstructed = multiplyAB(w, h);
  let error = 0;
  let total = 0;
  for (let i = 0; i < matrix.rows; i += 1) {
    for (let j = 0; j < matrix.cols; j += 1) {
      error += (matrix.data[i][j] - reconstructed.data[i][j]) ** 2;
      total += matrix.data[i][j] ** 2;
    }
  }
  return { w, h, error: total > 0 ? 1 - error / total : NaN };
};

const cosine = (a: readonly number[], b: readonly number[]): number => {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let index = 0; index < a.length; index += 1) {
    dot += a[index] * b[index];
    normA += a[index] ** 2;
    normB += b[index] ** 2;
  }
  return normA > 0 && normB > 0 ? dot / Math.sqrt(normA * normB) : 0;
};

/**
 * Text mining pipeline: tokenisation, vocabulary pruning, term-document
 * matrix, TF-IDF, cosine similarity and a non-negative topic model.
 *
 * The topic model is NMF rather than LDA: it is deterministic given the seed,
 * has no sampler diagnostics to explain, and the topics remain directly
 * comparable across runs. The help page states the difference.
 */
export const textAnalysis = (
  documents: readonly string[],
  options: {
    mode: TextResult['mode'];
    maxTerms: number;
    minDocFreq: number;
    topics: number;
    iterations: number;
    seed: number;
    stopwords: boolean;
  }
): TextResult | null => {
  const tokens = documents.map(document => tokenize(document, options.stopwords));
  const totalTokens = tokens.reduce((sum, terms) => sum + terms.length, 0);
  if (documents.length < 2 || totalTokens < 4) return null;

  const counts = new Map<string, { total: number; documents: number }>();
  tokens.forEach(terms => {
    const seen = new Set<string>();
    terms.forEach(term => {
      const entry = counts.get(term) ?? { total: 0, documents: 0 };
      entry.total += 1;
      if (!seen.has(term)) {
        entry.documents += 1;
        seen.add(term);
      }
      counts.set(term, entry);
    });
  });
  const vocabulary = [...counts.entries()]
    .filter(([, value]) => value.documents >= options.minDocFreq)
    .sort((a, b) => b[1].total - a[1].total || a[0].localeCompare(b[0]))
    .slice(0, options.maxTerms)
    .map(([term]) => term);
  if (vocabulary.length < 2) return null;
  const indexOf = new Map(vocabulary.map((term, index) => [term, index]));

  const termDocuments = tokens.map(terms => {
    const row = Array(vocabulary.length).fill(0);
    terms.forEach(term => {
      const index = indexOf.get(term);
      if (index !== undefined) row[index] += 1;
    });
    return row;
  });

  const documentFrequency = vocabulary.map((_, column) =>
    termDocuments.reduce((sum, row) => sum + (row[column] > 0 ? 1 : 0), 0)
  );
  const idf = documentFrequency.map(value => Math.log((1 + documents.length) / (1 + value)) + 1);
  const tfidf = termDocuments.map(row => {
    const length = Math.sqrt(row.reduce((sum, value) => sum + value ** 2, 0)) || 1;
    return row.map((value, column) => (value / length) * idf[column]);
  });
  const averageTfidf = vocabulary.map(
    (_, column) => tfidf.reduce((sum, row) => sum + row[column], 0) / Math.max(1, tfidf.length)
  );
  const terms: TextTerm[] = vocabulary
    .map((term, column) => ({
      term,
      count: counts.get(term)?.total ?? 0,
      documents: documentFrequency[column],
      tfidf: averageTfidf[column],
    }))
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term));

  const documentTerms = termDocuments.map((row, document) => ({
    document,
    terms: row
      .map((count, column) => ({ term: vocabulary[column], count }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
  }));

  let similarity: TextSimilarity[] = [];
  if (options.mode === 'similarity') {
    for (let first = 0; first < documents.length; first += 1) {
      for (let second = first + 1; second < documents.length; second += 1) {
        similarity.push({
          first,
          second,
          value: cosine(tfidf[first], tfidf[second]),
        });
      }
    }
  }

  let topics: TextTopic[] = [];
  let documentTopics: number[][] = [];
  let reconstruction: number | null = null;
  if (options.mode === 'topics') {
    const matrix: Matrix = { data: termDocuments, rows: termDocuments.length, cols: vocabulary.length };
    const rank = Math.max(2, Math.min(options.topics, vocabulary.length, documents.length));
    const fit = factorize(matrix, rank, Math.max(20, options.iterations), options.seed);
    const rowMass = fit.w.data.map(row => row.reduce((sum, value) => sum + value, 0) || 1);
    documentTopics = fit.w.data.map((row, index) => row.map(value => value / rowMass[index]));
    topics = fit.h.data.map((row, topic) => ({
      topic: topic + 1,
      prevalence:
        documentTopics.reduce((sum, values) => sum + values[topic], 0) /
        Math.max(1, documentTopics.length),
      terms: row
        .map((weight, column) => ({ term: vocabulary[column], weight }))
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 10),
    }));
    reconstruction = fit.error;
  }

  return {
    mode: options.mode,
    documents: documents.length,
    vocabulary: vocabulary.length,
    totalTokens,
    averageLength: totalTokens / documents.length,
    terms,
    documentTerms,
    similarity,
    topics,
    documentTopics,
    reconstruction,
    iterations: options.mode === 'topics' ? Math.max(20, options.iterations) : 0,
  };
};
