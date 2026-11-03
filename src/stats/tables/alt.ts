import { fmtEst } from '../format';
import { copy } from '../reportCopy';
import type { TableSpec } from '../types';
import type { AltFit } from '../alt/types';

const modelLabel = (fit: AltFit): string => {
  if (fit.model === 'arrhenius') return copy('Arrhenius (1/stress)');
  if (fit.model === 'inversePower') return copy('Potenza inversa (log stress)');
  return copy('Esponenziale (stress)');
};

export const altTables = (fit: AltFit, level: number): TableSpec[] => [
  {
    id: 'alt-summary',
    title: copy('Sintesi del test di vita accelerata'),
    subtitle: copy('{s1} · Weibull AFT · CI {s2}%', { s1: modelLabel(fit), s2: level }),
    columns: [
      { key: 'metric', label: copy('Voce'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'text' },
    ],
    rows: [
      { metric: copy('Osservazioni'), value: String(fit.n), raw: fit.n },
      { metric: copy('Eventi'), value: String(fit.events), raw: fit.events },
      { metric: copy('Stress di riferimento'), value: fmtEst(fit.referenceStress, 4), raw: fit.referenceStress },
      { metric: copy('Stress d’uso'), value: fmtEst(fit.useStress, 4), raw: fit.useStress },
      {
        metric: copy('Fattore di accelerazione'),
        value: fmtEst(fit.accelerationFactor, 4),
        raw: fit.accelerationFactor,
      },
      { metric: copy('Intercetta (μ)'), value: fmtEst(fit.mu, 4), raw: fit.mu },
      { metric: copy('Scala (σ)'), value: fmtEst(fit.sigma, 4), raw: fit.sigma },
      { metric: copy('Log-verosimiglianza'), value: fmtEst(fit.logLik, 3), raw: fit.logLik },
      { metric: copy('AIC'), value: fmtEst(fit.aic, 3), raw: fit.aic },
      ...fit.warnings.map((warning, index) => ({
        metric: copy('Avviso {s1}', { s1: index + 1 }),
        value: warning,
        raw: NaN,
      })),
    ],
    notes: [
      copy('Il modello AFT di Weibull mette in relazione il log del tempo alla vita con una trasformazione dello stress.'),
      copy('Il fattore di accelerazione confronta lo stress d’uso con il più basso stress osservato: valori sopra 1 indicano vita più lunga a stress d’uso.'),
      copy('L’estrapolazione verso stress non osservati è un’assunzione forte: il modello vale solo se il meccanismo di guasto resta lo stesso.'),
    ],
  },
  {
    id: 'alt-coefficients',
    title: copy('Coefficienti'),
    subtitle: copy('Time ratio · CI {s1}%', { s1: level }),
    columns: [
      { key: 'term', label: copy('Termine'), format: 'text' },
      { key: 'beta', label: copy('β'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 'z', label: copy('z'), format: 'dec3' },
      { key: 'p', label: copy('p'), format: 'p' },
      { key: 'timeRatio', label: copy('Time ratio'), format: 'dec4' },
      { key: 'lo', label: copy('TR low'), format: 'dec4' },
      { key: 'hi', label: copy('TR high'), format: 'dec4' },
    ],
    rows: fit.coefficients.map(row => ({ ...row })),
    notes: [
      copy('Il primo coefficiente descrive la trasformazione dello stress; gli altri sono le covariati aggiuntive.'),
      copy('Un time ratio sopra 1 indica tempi più lunghi per un’unità in più della variabile trasformata.'),
    ],
  },
];
