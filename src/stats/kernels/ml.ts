import { mulberry32 } from './distributions';
import { gradientBoosting, randomForest, type EnsembleFit } from './ensemble';

export interface MlImportance {
  variable: number;
  reduction: number;
  pct: number;
}

export interface MlResult {
  mode: 'rf' | 'boosting' | 'nnet';
  n: number;
  p: number;
  predictions: number[];
  residuals: number[];
  r2: number;
  rmse: number;
  mae: number;
  oobR2: number | null;
  oobRmse: number | null;
  importance: MlImportance[];
  trees: number;
}

export interface NnetOptions {
  hidden: number;
  iterations: number;
  seed: number;
  learningRate?: number;
}

const standardize = (
  x: readonly number[][]
): { scaled: number[][]; means: number[]; sds: number[] } => {
  const p = x[0]?.length ?? 0;
  const means: number[] = [];
  const sds: number[] = [];
  for (let column = 0; column < p; column += 1) {
    const values = x.map(row => row[column]);
    const mean = values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
    const variance =
      values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
      Math.max(1, values.length - 1);
    means.push(mean);
    sds.push(Math.sqrt(variance) || 1);
  }
  return {
    scaled: x.map(row => row.map((value, column) => (value - means[column]) / sds[column])),
    means,
    sds,
  };
};

/**
 * One hidden layer with tanh activations and a linear output, trained by
 * full-batch gradient descent with momentum. Predictors and the outcome are
 * standardised first so the learning rate does not depend on the units.
 */
export const nnetFit = (
  x: readonly number[][],
  y: readonly number[],
  options: NnetOptions
): { predictions: number[]; r2: number; rmse: number; mae: number } => {
  const { scaled } = standardize(x);
  const yMean = y.reduce((sum, value) => sum + value, 0) / Math.max(1, y.length);
  const ySd =
    Math.sqrt(
      y.reduce((sum, value) => sum + (value - yMean) ** 2, 0) / Math.max(1, y.length - 1)
    ) || 1;
  const target = y.map(value => (value - yMean) / ySd);
  const n = scaled.length;
  const p = scaled[0]?.length ?? 0;
  const hidden = Math.max(1, options.hidden);
  const rng = mulberry32(options.seed);
  const inputWeights = Array.from({ length: hidden }, () =>
    Array.from({ length: p + 1 }, () => (rng() - 0.5) * 0.5)
  );
  const outputWeights = Array.from({ length: hidden + 1 }, () => (rng() - 0.5) * 0.5);
  const inputMomentum = inputWeights.map(row => row.map(() => 0));
  const outputMomentum = outputWeights.map(() => 0);
  const learningRate = options.learningRate ?? 0.035;
  const momentum = 0.85;

  for (let epoch = 0; epoch < options.iterations; epoch += 1) {
    const inputGradient = inputWeights.map(row => row.map(() => 0));
    const outputGradient = outputWeights.map(() => 0);
    for (let row = 0; row < n; row += 1) {
      const hiddenValues = inputWeights.map(weights => {
        let sum = weights[0];
        for (let column = 0; column < p; column += 1) sum += weights[column + 1] * scaled[row][column];
        return Math.tanh(sum);
      });
      let prediction = outputWeights[0];
      for (let unit = 0; unit < hidden; unit += 1) {
        prediction += outputWeights[unit + 1] * hiddenValues[unit];
      }
      const error = prediction - target[row];
      outputGradient[0] += error;
      for (let unit = 0; unit < hidden; unit += 1) {
        outputGradient[unit + 1] += error * hiddenValues[unit];
        const delta = error * outputWeights[unit + 1] * (1 - hiddenValues[unit] ** 2);
        inputGradient[unit][0] += delta;
        for (let column = 0; column < p; column += 1) {
          inputGradient[unit][column + 1] += delta * scaled[row][column];
        }
      }
    }
    const scale = 1 / Math.max(1, n);
    for (let unit = 0; unit < hidden; unit += 1) {
      for (let column = 0; column <= p; column += 1) {
        const gradient = inputGradient[unit][column] * scale;
        inputMomentum[unit][column] =
          momentum * inputMomentum[unit][column] - learningRate * gradient;
        inputWeights[unit][column] += inputMomentum[unit][column];
      }
    }
    for (let unit = 0; unit <= hidden; unit += 1) {
      const gradient = outputGradient[unit] * scale;
      outputMomentum[unit] = momentum * outputMomentum[unit] - learningRate * gradient;
      outputWeights[unit] += outputMomentum[unit];
    }
  }

  const predictions = scaled.map(row => {
    let prediction = outputWeights[0];
    for (let unit = 0; unit < hidden; unit += 1) {
      let sum = inputWeights[unit][0];
      for (let column = 0; column < p; column += 1) {
        sum += inputWeights[unit][column + 1] * row[column];
      }
      prediction += outputWeights[unit + 1] * Math.tanh(sum);
    }
    return prediction * ySd + yMean;
  });
  const residuals = y.map((value, index) => value - predictions[index]);
  const sst = y.reduce((sum, value) => sum + (value - yMean) ** 2, 0);
  const sse = residuals.reduce((sum, value) => sum + value ** 2, 0);
  return {
    predictions,
    r2: sst > 0 ? 1 - sse / sst : NaN,
    rmse: Math.sqrt(sse / Math.max(1, n)),
    mae: residuals.reduce((sum, value) => sum + Math.abs(value), 0) / Math.max(1, n),
  };
};

const metrics = (y: readonly number[], predictions: readonly number[]) => {
  const n = y.length;
  const mean = y.reduce((sum, value) => sum + value, 0) / Math.max(1, n);
  const sst = y.reduce((sum, value) => sum + (value - mean) ** 2, 0);
  const residuals = y.map((value, index) => value - predictions[index]);
  const sse = residuals.reduce((sum, value) => sum + value ** 2, 0);
  return {
    residuals,
    r2: sst > 0 ? 1 - sse / sst : NaN,
    rmse: Math.sqrt(sse / Math.max(1, n)),
    mae: residuals.reduce((sum, value) => sum + Math.abs(value), 0) / Math.max(1, n),
  };
};

const namesFor = (p: number, names?: readonly string[]): string[] =>
  Array.from({ length: p }, (_, index) => names?.[index] ?? `X${index + 1}`);

export const mlAnalysis = (
  x: readonly number[][],
  y: readonly number[],
  options: {
    mode: MlResult['mode'];
    trees: number;
    minNode: number;
    mtry: number;
    shrinkage: number;
    hidden: number;
    iterations: number;
    seed: number;
    variableNames?: readonly string[];
  }
): MlResult | null => {
  if (y.length < 6 || x[0]?.length === 0) return null;
  if (y.length !== x.length) return null;
  const p = x[0]?.length ?? 0;
  let fit: EnsembleFit | { predictions: number[]; oobPredictions: number[]; importance: number[]; trees: number };
  if (options.mode === 'rf') {
    fit = randomForest(x, y, {
      trees: options.trees,
      minNode: options.minNode,
      mtry: options.mtry,
      seed: options.seed,
    });
  } else if (options.mode === 'boosting') {
    fit = gradientBoosting(x, y, {
      trees: options.trees,
      minNode: Math.max(2, options.minNode),
      shrinkage: options.shrinkage,
      maxDepth: 2,
      seed: options.seed,
    });
  } else {
    const network = nnetFit(x, y, {
      hidden: options.hidden,
      iterations: Math.max(100, options.iterations),
      seed: options.seed,
    });
    fit = {
      predictions: network.predictions,
      oobPredictions: [],
      importance: [],
      trees: 0,
    };
  }

  const base = metrics(y, fit.predictions);
  const totalImportance = fit.importance.reduce((sum, value) => sum + Math.max(0, value), 0);
  const names = namesFor(p, options.variableNames);
  const importance = fit.importance
    .map((value, index) => ({
      variable: index,
      reduction: value,
      pct: totalImportance > 0 ? (100 * Math.max(0, value)) / totalImportance : 0,
      name: names[index],
    }))
    .sort((a, b) => b.reduction - a.reduction);

  let oobR2: number | null = null;
  let oobRmse: number | null = null;
  if (fit.oobPredictions.length === y.length) {
    const oob = metrics(y, fit.oobPredictions);
    oobR2 = oob.r2;
    oobRmse = oob.rmse;
  }

  return {
    mode: options.mode,
    n: y.length,
    p,
    predictions: fit.predictions,
    residuals: base.residuals,
    r2: base.r2,
    rmse: base.rmse,
    mae: base.mae,
    oobR2,
    oobRmse,
    importance: importance.map(({ variable, reduction, pct }) => ({ variable, reduction, pct })),
    trees: fit.trees,
  };
};
