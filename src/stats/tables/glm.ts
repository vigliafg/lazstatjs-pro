import { copy } from '../reportCopy';
import type { TableSpec } from '../types';
import type { GlmResult } from '../kernels/glm';

export interface GlmNames {
  dep: string;
  predictors: string[];
  family: string;
  link: string;
}

export const glmTables = (fit: GlmResult, names: GlmNames, level: number): TableSpec[] => [
  {
    id: 'glm-coefficients',
    title: copy('Coefficienti del modello'),
    subtitle: copy('{s1} · famiglia {s2} · link {s3} · CI {s4}%', {
      s1: names.dep,
      s2: names.family,
      s3: names.link,
      s4: level,
    }),
    columns: [
      { key: 'term', label: copy('Termine'), format: 'text' },
      { key: 'beta', label: copy('B'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 'z', label: copy('z'), format: 'dec3' },
      { key: 'p', label: copy('p'), format: 'p' },
      { key: 'lo', label: copy('CI low'), format: 'dec4' },
      { key: 'hi', label: copy('CI high'), format: 'dec4' },
    ],
    rows: fit.coefficients.map((coefficient, index) => ({
      term: index === 0 ? '(Intercept)' : names.predictors[index - 1] ?? `X${index}`,
      beta: coefficient.beta,
      se: coefficient.se,
      z: coefficient.z,
      p: coefficient.p,
      lo: coefficient.lo,
      hi: coefficient.hi,
    })),
    notes: [
      copy('I coefficienti sono sulla scala del link: la loro interpretazione cambia con famiglia e link.'),
      copy('Il test z è di Wald; con campioni piccoli può divergere dal test di devianza.'),
    ],
  },
  {
    id: 'glm-fit',
    title: copy('Bontà del modello'),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'text' },
    ],
    rows: [
      { metric: copy('Osservazioni'), value: String(fit.fitted.length) },
      { metric: copy('Devianza'), value: fit.deviance.toFixed(4) },
      { metric: copy('Devianza nulla'), value: fit.nullDeviance.toFixed(4) },
      { metric: copy('df residui'), value: String(fit.dfResidual) },
      { metric: copy('df nullo'), value: String(fit.dfNull) },
      { metric: copy('Dispersione'), value: fit.dispersion.toFixed(4) },
      { metric: copy('Log-verosimiglianza'), value: fit.logLik.toFixed(4) },
      { metric: 'AIC', value: fit.aic.toFixed(2) },
      { metric: copy('Iterazioni'), value: String(fit.iterations) },
      { metric: copy('Convergenza'), value: fit.converged ? copy('Sì') : copy('No') },
    ],
    notes: [
      copy('La devianza misura la distanza dal modello saturo; la devianza nulla quella dal solo intercetta.'),
      copy('Per famiglie con dispersione stimata (Gaussiana, Gamma) il rapporto devianza/df è una diagnostica, non un test.'),
    ],
  },
];
