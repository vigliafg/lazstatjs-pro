/**
 * Derivative-free minimisers for the time-series kernels.
 *
 * `nelderMead` finds the basin; `polish` removes the remaining simplex-size
 * error with a coordinate pattern search and a short numerical-gradient
 * quasi-Newton pass. Both work on an unconstrained parameter vector, so each
 * kernel maps its natural parameters to that scale.
 *
 * This is deliberately separate from `kernels/optimize.ts`, which provides the
 * BFGS/Newton/EM machinery of the regression and latent-variable models.
 */

export interface Minimum {
  x: number[];
  value: number;
  converged: boolean;
}

export const nelderMead = (
  objective: (values: number[]) => number,
  start: number[],
  maxEvaluations = 1200
): Minimum => {
  const dimension = start.length;
  if (dimension === 0) return { x: start, value: objective(start), converged: true };
  let simplex = [start.slice()];
  for (let index = 0; index < dimension; index++) {
    const point = start.slice();
    point[index] += 0.1 + 0.1 * Math.abs(point[index]);
    simplex.push(point);
  }
  let values = simplex.map(objective);
  let evaluations = simplex.length;
  let converged = false;
  while (evaluations < maxEvaluations) {
    const order = simplex.map((_, index) => index).sort((a, b) => values[a] - values[b]);
    simplex = order.map(index => simplex[index]);
    values = order.map(index => values[index]);
    if (Math.abs(values[dimension] - values[0]) <= 1e-9 * (1 + Math.abs(values[0]))) {
      converged = true;
      break;
    }
    const centroid = new Array<number>(dimension).fill(0);
    for (let row = 0; row < dimension; row++) {
      for (let column = 0; column < dimension; column++) centroid[column] += simplex[row][column] / dimension;
    }
    const worst = simplex[dimension];
    const reflected = centroid.map((value, column) => value + (value - worst[column]));
    const reflectedValue = objective(reflected);
    evaluations++;
    if (reflectedValue < values[0]) {
      const expanded = centroid.map((value, column) => value + 2 * (value - worst[column]));
      const expandedValue = objective(expanded);
      evaluations++;
      if (expandedValue < reflectedValue) {
        simplex[dimension] = expanded;
        values[dimension] = expandedValue;
      } else {
        simplex[dimension] = reflected;
        values[dimension] = reflectedValue;
      }
      continue;
    }
    if (reflectedValue < values[dimension - 1]) {
      simplex[dimension] = reflected;
      values[dimension] = reflectedValue;
      continue;
    }
    const contracted = centroid.map((value, column) => value + 0.5 * (worst[column] - value));
    const contractedValue = objective(contracted);
    evaluations++;
    if (contractedValue < values[dimension]) {
      simplex[dimension] = contracted;
      values[dimension] = contractedValue;
      continue;
    }
    for (let row = 1; row <= dimension; row++) {
      simplex[row] = simplex[row].map((value, column) => simplex[0][column] + 0.5 * (value - simplex[0][column]));
      values[row] = objective(simplex[row]);
      evaluations++;
    }
  }
  let best = 0;
  values.forEach((value, index) => {
    if (value < values[best]) best = index;
  });
  return { x: simplex[best], value: values[best], converged };
};

/** Coordinate pattern search followed by a short gradient polish. */
export const polish = (
  objective: (values: number[]) => number,
  start: number[],
  value?: number
): Minimum => {
  let point = start.slice();
  let current = value ?? objective(point);
  let step = 1e-2;
  while (step > 1e-10) {
    let improved = false;
    for (let dimension = 0; dimension < point.length; dimension++) {
      for (const direction of [-1, 1]) {
        const candidate = point.slice();
        candidate[dimension] += direction * step;
        const candidateValue = objective(candidate);
        if (candidateValue < current) {
          point = candidate;
          current = candidateValue;
          improved = true;
        }
      }
    }
    if (!improved) step *= 0.5;
  }

  for (let iteration = 0; iteration < 400; iteration++) {
    const gradient = point.map((_, dimension) => {
      const delta = 1e-5 * (1 + Math.abs(point[dimension]));
      const plus = point.slice();
      const minus = point.slice();
      plus[dimension] += delta;
      minus[dimension] -= delta;
      return (objective(plus) - objective(minus)) / (2 * delta);
    });
    const norm = Math.sqrt(gradient.reduce((sum, value) => sum + value * value, 0));
    if (!(norm > 1e-9)) break;
    const direction = gradient.map(value => -value);
    let scale = 1;
    let candidate: number[] | null = null;
    let candidateValue = Infinity;
    for (let attempt = 0; attempt < 30; attempt++) {
      const trial = point.map((coordinate, dimension) => coordinate + scale * direction[dimension]);
      const trialValue = objective(trial);
      if (trialValue < current) {
        candidate = trial;
        candidateValue = trialValue;
        break;
      }
      scale *= 0.5;
    }
    if (!candidate || candidateValue >= current) break;
    point = candidate;
    current = candidateValue;
  }
  return { x: point, value: current, converged: true };
};

/** Nelder–Mead from several starts, then polish the best point. */
export const minimize = (
  objective: (values: number[]) => number,
  starts: number[][],
  maxEvaluations = 1200
): Minimum => {
  let best: Minimum | null = null;
  starts.forEach(start => {
    const result = nelderMead(objective, start, maxEvaluations);
    if (!best || result.value < best.value) best = result;
  });
  if (!best) return { x: starts[0] ?? [], value: Infinity, converged: false };
  const refined = polish(objective, best.x, best.value);
  return { x: refined.x, value: refined.value, converged: best.converged };
};
