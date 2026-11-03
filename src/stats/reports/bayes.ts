import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { BayesResult } from '../w9Results';
import type { ReportSpec } from '../report';

const modelName = (mode: BayesResult['mode']): string =>
  mode === 'normal'
    ? copy('media di una variabile gaussiana')
    : mode === 'proportion'
      ? copy('proporzione binomiale')
      : mode === 'rate'
        ? copy('tasso di Poisson')
        : mode === 'hierarchical'
          ? copy('modello gerarchico normale')
          : copy('regressione lineare');

export const bayesReport = (result: BayesResult): ReportSpec => {
  if (result.mode === 'hierarchical') {
    const main = result.parameters[0];
    const strongest = [...result.groups].sort((a, b) => b.mean - a.mean)[0];
    return {
      id: 'bayes',
      title: copy('Report di lettura — Analisi bayesiana'),
      headline: main
        ? copy('Modello gerarchico: μ = {s1}, τ = {s2} su {s3} gruppi.', {
            s1: fmtEst(main.mean, 3),
            s2: fmtEst(result.tau?.mean ?? NaN, 3),
            s3: result.groups.length,
          })
        : copy('Nessuna distribuzione a posteriori disponibile.'),
      badge: copy('Rhat {s1}', { s1: fmtEst(result.rhatMax, 3) }),
      tone: result.rhatMax > 1.05 ? 'caution' : 'neutral',
      intro: [
        copy('Il modello gerarchico stima una media per gruppo e le lega a una media generale μ, con varianza tra gruppi τ².'),
        copy('Le medie dei gruppi sono stimate con shrinkage: i gruppi con pochi dati si avvicinano di più alla media generale.'),
      ],
      sections: [
        {
          heading: copy('Medie dei gruppi'),
          bullets: result.groups
            .slice()
            .sort((a, b) => b.mean - a.mean)
            .slice(0, 5)
            .map(group =>
              copy('{s1}: media {s2}, HDI {s3}–{s4}.', {
                s1: group.label,
                s2: fmtEst(group.mean, 3),
                s3: fmtEst(group.hdiLo, 3),
                s4: fmtEst(group.hdiHi, 3),
              })
            ),
        },
        {
          heading: copy('Componenti di varianza'),
          body: [
            result.sigma
              ? copy('σ = {s1} (HDI {s2}–{s3}).', {
                  s1: fmtEst(result.sigma.mean, 3),
                  s2: fmtEst(result.sigma.hdiLo, 3),
                  s3: fmtEst(result.sigma.hdiHi, 3),
                })
              : copy('Nessuna deviazione residua disponibile.'),
            result.tau
              ? copy('τ = {s1} (HDI {s2}–{s3}): descrive quanto le medie dei gruppi si allontanano da μ.', {
                  s1: fmtEst(result.tau.mean, 3),
                  s2: fmtEst(result.tau.hdiLo, 3),
                  s3: fmtEst(result.tau.hdiHi, 3),
                })
              : copy('Nessuna varianza tra gruppi disponibile.'),
            strongest
              ? copy('Il gruppo con media più alta è {s1}.', { s1: strongest.label })
              : copy('Nessun gruppo disponibile.'),
          ],
        },
        {
          heading: copy('Diagnostica'),
          body: [
            copy('Rhat massimo {s1}; ESS minimo {s2}; {s3} catene.', {
              s1: fmtEst(result.rhatMax, 3),
              s2: fmtEst(result.essMin, 0),
              s3: result.chains,
            }),
            result.rhatMax > 1.05
              ? copy('Le catene non si sono mescolate bene: aumenta le iterazioni o ricontrolla il modello prima di leggere le stime.')
              : copy('Le catene si sono mescolate: le stime sono stabili rispetto al numero di iterazioni.'),
          ],
        },
        {
          heading: copy('Limiti'),
          body: [
            copy('Il modello assume scambiabilità dei gruppi e normalità dentro i gruppi.'),
            copy('Con pochi gruppi la varianza τ² è difficile da stimare e l’intervallo è ampio.'),
            copy('La scelta della distribuzione a priori conta con pochi dati: dichiarala e verifica la sensibilità.'),
          ],
        },
      ],
      limitations: [
        copy('Le conclusioni valgono condizionatamente al modello gerarchico e alla prior scelti.'),
      ],
    };
  }
  const main = result.parameters[0];
  return {
    id: 'bayes',
    title: copy('Report di lettura — Analisi bayesiana'),
    headline: main
      ? copy('{s1}: {s2} con HDI {s3}–{s4}.', {
          s1: modelName(result.mode),
          s2: fmtEst(main.mean, 3),
          s3: fmtEst(main.hdiLo, 3),
          s4: fmtEst(main.hdiHi, 3),
        })
      : copy('Nessuna distribuzione a posteriori disponibile.'),
    badge: copy('Rhat {s1}', { s1: fmtEst(result.rhatMax, 3) }),
    tone: result.rhatMax > 1.05 ? 'caution' : 'neutral',
    intro: [
      copy('L’analisi bayesiana combina la verosimiglianza dei dati con una distribuzione a priori e restituisce una distribuzione a posteriori.'),
      copy('L’intervallo credibile descrive la probabilità a posteriori che il parametro cada nell’intervallo; non è un intervallo di confidenza frequentista.'),
    ],
    sections: [
      {
        heading: copy('Posteriori'),
        bullets: result.parameters.map(item =>
          copy('{s1}: media {s2}, mediana {s3}, HDI {s4}–{s5}.', {
            s1: item.term,
            s2: fmtEst(item.mean, 3),
            s3: fmtEst(item.median, 3),
            s4: fmtEst(item.hdiLo, 3),
            s5: fmtEst(item.hdiHi, 3),
          })
        ),
      },
      {
        heading: copy('Diagnostica'),
        body: [
          copy('Rhat massimo {s1}; ESS minimo {s2}; {s3} catene con {s4} iterazioni dopo il burn-in.', {
            s1: fmtEst(result.rhatMax, 3),
            s2: fmtEst(result.essMin, 0),
            s3: result.chains,
            s4: result.draws,
          }),
          result.rhatMax > 1.05
            ? copy('Le catene non si sono mescolate bene: aumenta le iterazioni o ricontrolla il modello prima di leggere le stime.')
            : copy('Le catene si sono mescolate: le stime sono stabili rispetto al numero di iterazioni.'),
          result.sigma
            ? copy('La deviazione standard residua σ ha media {s1} e HDI {s2}–{s3}.', {
                s1: fmtEst(result.sigma.mean, 3),
                s2: fmtEst(result.sigma.hdiLo, 3),
                s3: fmtEst(result.sigma.hdiHi, 3),
              })
            : copy('Il modello non ha un parametro di scala residua.'),
        ],
      },
      {
        heading: copy('Limiti'),
        body: [
          copy('La scelta della distribuzione a priori conta con pochi dati: dichiarala e verifica la sensibilità delle conclusioni.'),
          copy('Il campionatore copre i modelli coniugati e la regressione gaussiana; modelli gerarchici o non lineari richiedono un motore dedicato.'),
        ],
      },
    ],
    limitations: [
      copy('Le conclusioni valgono condizionatamente al modello e alla prior scelti, non solo ai dati.'),
    ],
  };
};
