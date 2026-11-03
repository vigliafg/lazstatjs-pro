import { copy } from '../reportCopy';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';
import { describeP, isDecided } from './shared';

export const glmReport = (
  tables: TableSpec[],
  depName: string,
  family: string,
  link: string,
  level: number
): ReportSpec => {
  const coefficients = tables.find(table => table.id === 'glm-coefficients')?.rows ?? [];
  const fit = tables.find(table => table.id === 'glm-fit')?.rows ?? [];
  const metric = (label: string): string =>
    String(fit.find(row => String(row.metric) === label)?.value ?? '—');
  const predictors = coefficients.filter(row => String(row.term) !== '(Intercept)');
  const significant = predictors.filter(row => isDecided(Number(row.p), level));
  const converged = metric('Convergenza') === copy('Sì');

  return {
    id: 'report-glm',
    title: copy('Report di lettura — Modello lineare generalizzato'),
    headline: converged
      ? copy('{s1} spiegato da {s2} predittore/i con famiglia {s3} e link {s4}; devianza = {s5}.', {
          s1: depName,
          s2: predictors.length,
          s3: family,
          s4: link,
          s5: metric('Devianza'),
        })
      : copy('Il modello non ha raggiunto la convergenza: le stime non sono affidabili.'),
    badge: copy('Regressione'),
    tone: converged ? (significant.length > 0 ? 'positive' : 'neutral') : 'caution',
    intro: [
      copy('Il GLM estende la regressione lineare a risposte non normali: la famiglia definisce la varianza, il link collega la media ai predittori.'),
      copy('La scelta di famiglia e link è parte del modello: non è un dettaglio tecnico, cambia il significato dei coefficienti.'),
    ],
    sections: [
      {
        heading: copy('Risultato'),
        bullets: [
          copy('Devianza = {s1} su {s2} gradi di libertà; devianza nulla = {s3}.', {
            s1: metric('Devianza'),
            s2: metric('df residui'),
            s3: metric('Devianza nulla'),
          }),
          copy('Log-verosimiglianza = {s1}; AIC = {s2}; iterazioni = {s3}.', {
            s1: metric('Log-verosimiglianza'),
            s2: metric('AIC'),
            s3: metric('Iterazioni'),
          }),
          copy('{s1} predittore/i su {s2} risultano significativi al livello scelto.', {
            s1: significant.length,
            s2: predictors.length,
          }),
          ...predictors.map(row =>
            copy('{s1}: B = {s2} (CI {s3} – {s4}), p = {s5}.', {
              s1: String(row.term),
              s2: Number(row.beta).toFixed(4),
              s3: Number(row.lo).toFixed(4),
              s4: Number(row.hi).toFixed(4),
              s5: describeP(Number(row.p)),
            })
          ),
        ],
      },
      {
        heading: copy('Come leggerlo'),
        bullets: [
          copy('Con link log i coefficienti sono differenze di log-media: exp(B) è un rapporto di medie, non di probabilità.'),
          copy('Con link logit/probit la risposta è una probabilità: B va letto sulla scala latente.'),
          copy('Con famiglia Gamma la risposta deve essere strettamente positiva; con Poisson deve essere un conteggio.'),
          copy('Controlla la devianza residua e i residui: un modello può convergere e restare mal specificato.'),
        ],
      },
    ],
    limitations: [
      copy('Il motore copre le famiglie gaussiana, binomiale, Poisson e Gamma; Tweedie e quasi-verosimiglianze non sono incluse.'),
      copy('La bontà del modello non è riassunta da un R²: confronta devianza, AIC e diagnostica dei residui.'),
    ],
  };
};
