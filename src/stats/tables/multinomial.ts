import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
import { zCrit } from '../distributions';
import type { MultinomialResult } from '../kernels/multinomial';

/**
 * Tables for a multinomial logistic fit.
 *
 * The coefficient rows follow the kernel's treatment coding: the reference
 * class (index 0) has no row, and every other class is contrasted against it.
 */
export const multinomialTables = (
  model: MultinomialResult,
  y: number[],
  predictorNames: string[],
  level: number
): TableSpec[] => {
  const critical = zCrit(level);
  const classCount = model.classes.length;
  const parameterCount = (classCount - 1) * model.p;

  const fit: TableSpec = {
    id: 'multinomial-fit',
    title: copy('Modello multinomiale'),
    subtitle: copy('stima di massima verosimiglianza · N = {s1}', { s1: model.n }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'text' },
    ],
    rows: [
      { metric: copy('Osservazioni'), value: model.n },
      { metric: copy('Classi'), value: classCount },
      { metric: copy('Classe di riferimento'), value: model.classes[model.referenceClass] ?? '—' },
      { metric: copy('Predittori'), value: model.p - 1 },
      { metric: copy('Parametri stimati'), value: parameterCount },
      { metric: copy('Log-verosimiglianza'), value: model.logLik },
      { metric: copy('Deviance'), value: model.deviance },
      { metric: copy('AIC'), value: model.aic },
      { metric: copy('Accuratezza complessiva (%)'), value: model.accuracy * 100 },
      { metric: copy('Iterazioni'), value: model.iterations },
      { metric: copy('Convergenza'), value: model.converged ? copy('sì') : copy('no') },
    ],
    notes: [
      copy('Il modello stima una probabilità per ogni classe; la classe di riferimento ha coefficienti fissati a zero.'),
      copy('La deviance confronta la verosimiglianza del modello con quella di un modello saturo: valori più bassi indicano un adattamento migliore.'),
    ],
  };

  const coefficientRows = model.classes.slice(1).flatMap((label, classIndex) =>
    Array.from({ length: model.p }, (_, column) => {
      const beta = model.coefficients[classIndex]?.[column] ?? NaN;
      const se = model.standardErrors[classIndex]?.[column] ?? NaN;
      const isIntercept = column === 0;
      const term = isIntercept ? '(Intercept)' : predictorNames[column - 1] ?? `X${column}`;
      return {
        class: label,
        term,
        b: beta,
        se,
        z: model.z[classIndex]?.[column] ?? NaN,
        p: model.pValues[classIndex]?.[column] ?? NaN,
        or: isIntercept || !Number.isFinite(beta) ? NaN : Math.exp(beta),
        orLo: isIntercept || !Number.isFinite(beta) || !Number.isFinite(se)
          ? NaN
          : Math.exp(beta - critical * se),
        orHi: isIntercept || !Number.isFinite(beta) || !Number.isFinite(se)
          ? NaN
          : Math.exp(beta + critical * se),
      };
    })
  );

  const coefficients: TableSpec = {
    id: 'multinomial-coefficients',
    title: copy('Coefficienti per classe'),
    subtitle: copy('Classe di riferimento: {s1} · CI {s2}%', {
      s1: model.classes[model.referenceClass] ?? '—',
      s2: level,
    }),
    columns: [
      { key: 'class', label: copy('Classe'), format: 'text' },
      { key: 'term', label: copy('Termine'), format: 'text' },
      { key: 'b', label: copy('B'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 'z', label: copy('z'), format: 'dec3' },
      { key: 'p', label: copy('p'), format: 'p' },
      { key: 'or', label: copy('OR'), format: 'dec3' },
      { key: 'orLo', label: copy('OR low'), format: 'dec3' },
      { key: 'orHi', label: copy('OR high'), format: 'dec3' },
    ],
    rows: coefficientRows,
    notes: [
      copy('Ogni classe è confrontata con la classe di riferimento: OR > 1 aumenta le probabilità di quella classe rispetto al riferimento.'),
      copy('I coefficienti sono stimati al netto degli altri predittori; l’intercetta non ha un odds ratio interpretabile.'),
    ],
  };

  const classificationRows = model.classes.map((label, classIndex) => {
    const total = y.reduce((sum, value) => sum + (value === classIndex ? 1 : 0), 0);
    const correct = model.predicted.reduce(
      (sum, value, index) => sum + (value === classIndex && y[index] === classIndex ? 1 : 0),
      0
    );
    const meanProbability =
      model.fitted.reduce((sum, row) => sum + (row[classIndex] ?? 0), 0) / Math.max(1, model.n);
    return {
      class: label,
      n: total,
      correct,
      accuracy: total > 0 ? (correct / total) * 100 : 0,
      meanProbability: meanProbability * 100,
    };
  });

  const classification: TableSpec = {
    id: 'multinomial-classification',
    title: copy('Classificazione per classe'),
    subtitle: copy('Accuratezza complessiva: {s1}%', { s1: (model.accuracy * 100).toFixed(1) }),
    columns: [
      { key: 'class', label: copy('Classe'), format: 'text' },
      { key: 'n', label: copy('N'), format: 'int' },
      { key: 'correct', label: copy('Corrette'), format: 'int' },
      { key: 'accuracy', label: copy('Accuratezza (%)'), format: 'dec1' },
      { key: 'meanProbability', label: copy('Probabilità media (%)'), format: 'dec1' },
    ],
    rows: classificationRows,
    notes: [
      copy('La classe predetta è quella con la probabilità stimata più alta; l’accuratezza per classe è il rapporto tra classificazioni corrette e osservazioni di quella classe.'),
      copy('Le classi rare possono avere un’accuratezza instabile perché calcolata su poche osservazioni.'),
    ],
  };

  return [fit, coefficients, classification];
};
