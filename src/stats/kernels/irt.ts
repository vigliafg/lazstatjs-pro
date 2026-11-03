/**
 * Unidimensional item response theory (2PL and Rasch).
 *
 * Marginal maximum likelihood with an EM algorithm: the ability distribution
 * is integrated on a fixed Gaussian quadrature grid, the E-step gives each
 * person's posterior over the grid and the M-step updates every item by
 * maximising its expected complete-data likelihood. Discriminations are
 * parameterised as `exp(alpha)` so they stay positive, matching the
 * convention of `mirt`.
 */

import { informationCriteria, normalQuadrature } from './latent';
import { maximize } from './latent';
import { invert } from './matrix';
import type { IrtItem, IrtModel, IrtPerson, IrtResult } from '../irt/types';

export interface IrtInput {
  data: number[][];
  variableNames: string[];
  model: IrtModel;
  quadrature?: number;
  maxIterations?: number;
  tolerance?: number;
}

interface ItemParameters {
  alpha: number;
  b: number;
}

const probability = (theta: number, item: ItemParameters): number => {
  const value = Math.exp(item.alpha) * (theta - item.b);
  if (value >= 0) return 1 / (1 + Math.exp(-value));
  const exp = Math.exp(value);
  return exp / (1 + exp);
};

const logLikItem = (item: ItemParameters, counts: { r: number; n: number }[], nodes: number[]): number => {
  let value = 0;
  for (let q = 0; q < nodes.length; q += 1) {
    const p = Math.min(1 - 1e-12, Math.max(1e-12, probability(nodes[q], item)));
    value += counts[q].r * Math.log(p) + (counts[q].n - counts[q].r) * Math.log(1 - p);
  }
  return Number.isFinite(value) ? value : -Infinity;
};

const fitItem = (
  counts: { r: number; n: number }[],
  nodes: number[],
  model: IrtModel,
  start: ItemParameters
): ItemParameters => {
  if (model === 'rasch') {
    const result = maximize(values => logLikItem({ alpha: 0, b: values[0] }, counts, nodes), [start.b], {
      maxIterations: 120,
      tolerance: 1e-8,
    });
    return { alpha: 0, b: Number.isFinite(result.x[0]) ? result.x[0] : start.b };
  }
  const result = maximize(
    values => logLikItem({ alpha: values[0], b: values[1] }, counts, nodes),
    [start.alpha, start.b],
    { maxIterations: 160, tolerance: 1e-8 }
  );
  return {
    alpha: Number.isFinite(result.x[0]) ? result.x[0] : start.alpha,
    b: Number.isFinite(result.x[1]) ? result.x[1] : start.b,
  };
};

const itemStandardErrors = (
  item: ItemParameters,
  counts: { r: number; n: number }[],
  nodes: number[],
  model: IrtModel
): { seAlpha: number; seB: number } => {
  const parameters = model === 'rasch' ? [item.b] : [item.alpha, item.b];
  const objective = (values: number[]) => {
    const candidate = model === 'rasch'
      ? { alpha: 0, b: values[0] }
      : { alpha: values[0], b: values[1] };
    return logLikItem(candidate, counts, nodes);
  };
  const step = 1e-4;
  const base = objective(parameters);
  const hessian = parameters.map((value, i) =>
    parameters.map((__, j) => {
      const plusI = [...parameters];
      const minusI = [...parameters];
      plusI[i] = value + step;
      minusI[i] = value - step;
      if (i === j) return (objective(plusI) - 2 * base + objective(minusI)) / (step * step);
      const plus = [...parameters];
      const minus = [...parameters];
      plus[i] += step;
      plus[j] += step;
      minus[i] += step;
      minus[j] -= step;
      return (objective(plus) - objective(minus)) / (2 * step * step);
    })
  );
  const covariance = invert(hessian.map(row => row.map(value => -value)));
  if (!covariance) return { seAlpha: Number.NaN, seB: Number.NaN };
  const seAlpha = model === 'rasch' ? 0 : Math.sqrt(Math.max(0, covariance[0][0]));
  const seB = Math.sqrt(Math.max(0, covariance[model === 'rasch' ? 0 : 1][model === 'rasch' ? 0 : 1]));
  return { seAlpha, seB };
};

/**
 * Item characteristic curve: probability of a correct response at ability
 * `theta` for a logistic item with the given discrimination and difficulty.
 * Rasch is the special case `discrimination = 1`.
 */
export const iccProbability = (
  discrimination: number,
  difficulty: number,
  theta: number
): number => 1 / (1 + Math.exp(-discrimination * (theta - difficulty)));

export const irtAnalysis = (input: IrtInput): IrtResult | null => {
  const n = input.data.length;
  const items = input.variableNames.length;
  if (n < 5 || items < 2) return null;
  if (input.data.some(row => row.length !== items)) return null;
  if (input.data.some(row => row.some(value => value !== 0 && value !== 1))) return null;

  const quadrature = normalQuadrature(input.quadrature ?? 21);
  const nodes = quadrature.nodes;
  const weights = quadrature.weights;
  let parameters: ItemParameters[] = input.variableNames.map((_, item) => {
    const p = Math.min(0.99, Math.max(0.01, input.data.reduce((sum, row) => sum + row[item], 0) / n));
    return { alpha: 0, b: -Math.log(p / (1 - p)) };
  });
  const maxIterations = Math.max(20, Math.min(1000, input.maxIterations ?? 300));
  const tolerance = input.tolerance ?? 1e-7;
  let posterior: number[][] = [];
  let logLik = -Infinity;
  let converged = false;
  let iteration = 0;

  for (; iteration < maxIterations; iteration += 1) {
    posterior = input.data.map(row => {
      const logs = Array.from({ length: nodes.length }, (_, q) => {
        let value = Math.log(Math.max(1e-300, weights[q]));
        row.forEach((response, item) => {
          const p = Math.min(1 - 1e-12, Math.max(1e-12, probability(nodes[q], parameters[item])));
          value += response === 1 ? Math.log(p) : Math.log(1 - p);
        });
        return value;
      });
      const max = Math.max(...logs);
      const normaliser = max + Math.log(logs.reduce((sum, value) => sum + Math.exp(value - max), 0));
      return logs.map(value => Math.exp(value - normaliser));
    });
    const nextLogLik = input.data.reduce((sum, _, person) => {
      const logs = Array.from({ length: nodes.length }, (_, q) => {
        let value = Math.log(Math.max(1e-300, weights[q]));
        input.data[person].forEach((response, item) => {
          const p = Math.min(1 - 1e-12, Math.max(1e-12, probability(nodes[q], parameters[item])));
          value += response === 1 ? Math.log(p) : Math.log(1 - p);
        });
        return value;
      });
      const max = Math.max(...logs);
      return sum + max + Math.log(logs.reduce((total, value) => total + Math.exp(value - max), 0));
    }, 0);
    if (Number.isFinite(logLik) && Math.abs(nextLogLik - logLik) < tolerance) {
      logLik = nextLogLik;
      converged = true;
      iteration += 1;
      break;
    }
    logLik = nextLogLik;

    parameters = parameters.map((item, index) => {
      const counts = nodes.map((_, q) => ({
        r: input.data.reduce((sum, row, person) => sum + posterior[person][q] * row[index], 0),
        n: posterior.reduce((sum, row) => sum + row[q], 0),
      }));
      return fitItem(counts, nodes, input.model, item);
    });
  }

  const finalPosterior = input.data.map(row => {
    const logs = Array.from({ length: nodes.length }, (_, q) => {
      let value = Math.log(Math.max(1e-300, weights[q]));
      row.forEach((response, item) => {
        const p = Math.min(1 - 1e-12, Math.max(1e-12, probability(nodes[q], parameters[item])));
        value += response === 1 ? Math.log(p) : Math.log(1 - p);
      });
      return value;
    });
    const max = Math.max(...logs);
    const normaliser = max + Math.log(logs.reduce((sum, value) => sum + Math.exp(value - max), 0));
    return logs.map(value => Math.exp(value - normaliser));
  });

  const persons: IrtPerson[] = finalPosterior.map((row, person) => {
    const theta = row.reduce((sum, value, q) => sum + value * nodes[q], 0);
    const variance = row.reduce((sum, value, q) => sum + value * Math.pow(nodes[q] - theta, 2), 0);
    return {
      row: person + 1,
      theta,
      se: Math.sqrt(Math.max(0, variance)),
      total: input.data[person].reduce((sum, value) => sum + value, 0),
    };
  });

  const itemResults: IrtItem[] = parameters.map((item, index) => {
    const counts = nodes.map((_, q) => ({
      r: input.data.reduce((sum, row, person) => sum + finalPosterior[person][q] * row[index], 0),
      n: finalPosterior.reduce((sum, row) => sum + row[q], 0),
    }));
    const se = itemStandardErrors(item, counts, nodes, input.model);
    const a = Math.exp(item.alpha);
    return {
      variable: input.variableNames[index] ?? `Item ${index + 1}`,
      discrimination: a,
      difficulty: item.b,
      seDiscrimination: input.model === 'rasch' ? 0 : a * se.seAlpha,
      seDifficulty: se.seB,
      pCorrect: input.data.reduce((sum, row) => sum + row[index], 0) / n,
    };
  });

  const thetaVariance =
    persons.reduce((sum, person) => sum + Math.pow(person.theta, 2), 0) / Math.max(1, persons.length);
  const meanErrorVariance =
    persons.reduce((sum, person) => sum + person.se * person.se, 0) / Math.max(1, persons.length);
  const parametersCount =
    input.variableNames.length * (input.model === 'rasch' ? 1 : 2) + 1;
  const criteria = informationCriteria(logLik, parametersCount, n);
  const testInformation = nodes.map(theta =>
    itemResults.reduce((sum, item) => {
      const p = 1 / (1 + Math.exp(-item.discrimination * (theta - item.difficulty)));
      return sum + item.discrimination * item.discrimination * p * (1 - p);
    }, 0)
  );

  return {
    model: input.model,
    n,
    items: itemResults,
    persons,
    logLik,
    parameters: parametersCount,
    aic: criteria.aic,
    bic: criteria.bic,
    reliability: Math.max(0, Math.min(1, 1 - meanErrorVariance / Math.max(1e-9, thetaVariance))),
    iterations: iteration,
    converged,
    thetaGrid: nodes,
    testInformation,
  };
};
