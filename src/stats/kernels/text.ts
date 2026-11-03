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
  perplexity: number | null;
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

/**
 * Collapsed Gibbs sampler for latent Dirichlet allocation.
 *
 * Each token carries a topic; the conditional distribution of a token's topic
 * given all the others is Dirichlet-multinomial, so no continuous parameters
 * are sampled. The returned theta and phi are the posterior mean estimates.
 */
const ldaFit = (
  documents: readonly (readonly number[])[],
  vocabulary: readonly string[],
  topicCount: number,
  iterations: number,
  seed: number
): { documentTopics: number[][]; topics: TextTopic[]; perplexity: number } | null => {
  const topics = Math.max(2, Math.min(topicCount, vocabulary.length));
  const rng = mulberry32(seed);
  const alpha = 0.1;
  const beta = 0.01;
  const documentTopic = documents.map(() => Array(topics).fill(0));
  const topicTerm = Array.from({ length: topics }, () => Array(vocabulary.length).fill(0));
  const topicTotal = Array(topics).fill(0);
  const tokenTopics = documents.map((document, doc) =>
    document.map(term => {
      const topic = Math.floor(rng() * topics);
      documentTopic[doc][topic] += 1;
      topicTerm[topic][term] += 1;
      topicTotal[topic] += 1;
      return topic;
    })
  );
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    for (let doc = 0; doc < documents.length; doc += 1) {
      for (let position = 0; position < documents[doc].length; position += 1) {
        const term = documents[doc][position];
        const previous = tokenTopics[doc][position];
        documentTopic[doc][previous] -= 1;
        topicTerm[previous][term] -= 1;
        topicTotal[previous] -= 1;
        const weights = Array.from({ length: topics }, (_, topic) => {
          const probability =
            (documentTopic[doc][topic] + alpha) *
            ((topicTerm[topic][term] + beta) / (topicTotal[topic] + beta * vocabulary.length));
          return Math.max(1e-12, probability);
        });
        const total = weights.reduce((sum, value) => sum + value, 0);
        let draw = rng() * total;
        let chosen = topics - 1;
        for (let topic = 0; topic < topics; topic += 1) {
          draw -= weights[topic];
          if (draw <= 0) {
            chosen = topic;
            break;
          }
        }
        tokenTopics[doc][position] = chosen;
        documentTopic[doc][chosen] += 1;
        topicTerm[chosen][term] += 1;
        topicTotal[chosen] += 1;
      }
    }
  }
  const theta = documentTopic.map(row => {
    const total = row.reduce((sum, value) => sum + value + alpha, 0);
    return row.map(value => (value + alpha) / total);
  });
  const phi = topicTerm.map(row => {
    const total = row.reduce((sum, value) => sum + value + beta, 0);
    return row.map(value => (value + beta) / total);
  });
  let logLikelihood = 0;
  let tokens = 0;
  documents.forEach((document, doc) => {
    document.forEach(term => {
      const probability = theta[doc].reduce(
        (sum, value, topic) => sum + value * phi[topic][term],
        0
      );
      logLikelihood += Math.log(Math.max(1e-12, probability));
      tokens += 1;
    });
  });
  const prevalence = Array.from({ length: topics }, (_, topic) =>
    theta.reduce((sum, row) => sum + row[topic], 0) / Math.max(1, theta.length)
  );
  return {
    documentTopics: theta,
    topics: Array.from({ length: topics }, (_, topic) => ({
      topic: topic + 1,
      prevalence: prevalence[topic],
      terms: phi[topic]
        .map((weight, index) => ({ term: vocabulary[index] ?? `T${index + 1}`, weight }))
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 10),
    })),
    perplexity: tokens > 0 ? Math.exp(-logLikelihood / tokens) : NaN,
  };
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
  let perplexity: number | null = null;
  if (options.mode === 'topics') {
    const tokenIndexes = tokens.map(document =>
      document
        .map(term => indexOf.get(term))
        .filter((index): index is number => index !== undefined)
    );
    const fit = ldaFit(
      tokenIndexes,
      vocabulary,
      Math.max(2, Math.min(options.topics, vocabulary.length, documents.length)),
      Math.max(20, options.iterations),
      options.seed
    );
    if (fit) {
      topics = fit.topics;
      documentTopics = fit.documentTopics;
      perplexity = fit.perplexity;
    }
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
    perplexity,
    iterations: options.mode === 'topics' ? Math.max(20, options.iterations) : 0,
  };
};
