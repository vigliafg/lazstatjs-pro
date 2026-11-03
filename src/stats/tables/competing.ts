import { fmtEst } from '../format';
import { copy } from '../reportCopy';
import type { TableSpec } from '../types';
import type { CompetingFit } from '../competing/types';

export const competingTables = (fit: CompetingFit, level: number): TableSpec[] => [
  {
    id: 'competing-summary',
    title: copy('Sintesi dei rischi competitivi'),
    subtitle: copy('{s1} osservazioni · causa {s2} · CI {s3}%', {
      s1: fit.n,
      s2: fit.cause,
      s3: level,
    }),
    columns: [
      { key: 'metric', label: copy('Voce'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'text' },
    ],
    rows: [
      { metric: copy('Osservazioni'), value: String(fit.n), raw: fit.n },
      { metric: copy('Eventi della causa'), value: String(fit.events), raw: fit.events },
      { metric: copy('Eventi competitivi'), value: String(fit.competing), raw: fit.competing },
      { metric: copy('Censurati'), value: String(fit.censored), raw: fit.censored },
      { metric: copy('Cause osservate'), value: String(fit.causes), raw: fit.causes },
      { metric: copy('Covariati'), value: String(fit.k), raw: fit.k },
      { metric: copy('Log-verosimiglianza'), value: fmtEst(fit.logLik, 3), raw: fit.logLik },
      { metric: copy('AIC'), value: fmtEst(fit.aic, 3), raw: fit.aic },
      {
        metric: copy('Incidenza cumulativa finale'),
        value: fmtEst(fit.cifFinal, 4),
        raw: fit.cifFinal,
      },
      { metric: copy('Iterazioni'), value: String(fit.iterations), raw: fit.iterations },
      { metric: copy('Convergenza'), value: fit.converged ? 'sì' : 'no', raw: NaN },
      ...fit.warnings.map((warning, index) => ({
        metric: copy('Avviso {s1}', { s1: index + 1 }),
        value: warning,
        raw: NaN,
      })),
    ],
    notes: [
      copy('L’incidenza cumulativa è la probabilità di avere l’evento della causa scelta entro ciascun tempo, in presenza delle cause competitive.'),
      copy('Non è 1 − S(t) del Kaplan–Meier: con cause competitive la curva KM sovrastima l’incidenza.'),
    ],
  },
  {
    id: 'competing-coefficients',
    title: copy('Coefficienti di Fine–Gray'),
    subtitle: copy('Hazard ratio di sottodistribuzione · CI {s1}%', { s1: level }),
    columns: [
      { key: 'term', label: copy('Termine'), format: 'text' },
      { key: 'beta', label: copy('β'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 'z', label: copy('z'), format: 'dec3' },
      { key: 'p', label: copy('p'), format: 'p' },
      { key: 'hr', label: copy('sHR'), format: 'dec4' },
      { key: 'lo', label: copy('sHR low'), format: 'dec4' },
      { key: 'hi', label: copy('sHR high'), format: 'dec4' },
    ],
    rows: fit.coefficients.map(row => ({ ...row })),
    notes: [
      copy('I coefficienti descrivono il rischio di sottodistribuzione: un sHR > 1 aumenta l’incidenza cumulativa della causa scelta.'),
      copy('Non vanno interpretati come l’effetto sulla causa-specifica: per quella serve un Cox cause-specific.'),
    ],
  },
  {
    id: 'competing-cif',
    title: copy('Incidenza cumulativa'),
    subtitle: copy('Profilo medio delle covariati · causa {s1}', { s1: fit.cause }),
    columns: [
      { key: 'time', label: copy('Tempo'), format: 'dec2' },
      { key: 'cif', label: copy('CIF'), format: 'dec4' },
    ],
    rows: fit.cif.map(point => ({ ...point })),
    notes: [
      copy('La CIF parte da 0 e cresce a ogni tempo con eventi della causa; il valore finale è la probabilità cumulata entro l’ultimo tempo osservato.'),
    ],
  },
];
