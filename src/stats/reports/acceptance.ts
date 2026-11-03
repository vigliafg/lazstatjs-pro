import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { ReportSpec } from '../report';
import type { AcceptanceResult } from '../analysisResults';

export const acceptanceReport = (result: AcceptanceResult): ReportSpec => ({
  id: 'quality-acceptance',
  title: copy('Report di lettura — Campionamento di accettazione'),
  headline: copy('Piano n = {s1}, c = {s2}: accetta lotti con AQL {s3}.', {
    s1: result.n,
    s2: result.c,
    s3: fmtEst(result.aql, 4),
  }),
  badge: copy('n {s1} · c {s2}', { s1: result.n, s2: result.c }),
  tone: 'neutral',
  intro: [
    copy('La curva operativa mostra la probabilità di accettare un lotto al variare della qualità in ingresso.'),
    copy('Il piano non elimina i lotti cattivi: fissa il compromesso tra rischio del produttore e rischio del consumatore.'),
  ],
  sections: [
    {
      heading: copy('Il piano'),
      bullets: [
        copy('Con {s1} pezzi ispezionati si accetta il lotto se i difettosi sono al massimo {s2}.', {
          s1: result.n,
          s2: result.c,
        }),
        copy('AQL = {s1} con rischio del produttore {s2}.', {
          s1: fmtEst(result.aql, 4),
          s2: fmtEst(result.alpha, 4),
        }),
        copy('LTPD = {s1} con rischio del consumatore {s2}.', {
          s1: fmtEst(result.ltpd, 4),
          s2: fmtEst(result.beta, 4),
        }),
      ],
    },
    {
      heading: copy('Qualità media in uscita'),
      bullets: [
        copy('AOQL = {s1} in corrispondenza di una qualità in ingresso {s2}.', {
          s1: fmtEst(result.aoql, 4),
          s2: fmtEst(result.aoqlP, 4),
        }),
        copy('La distribuzione usata è {s1}.', {
          s1:
            result.distribution === 'hypergeometric'
              ? copy('ipergeometrica, perché il lotto è finito')
              : copy('binomiale, perché il lotto è trattato come infinito'),
        }),
        result.lotSize > 0
          ? copy('La dimensione del lotto è {s1}; l’ATI varia con la probabilità di accettazione.', {
              s1: result.lotSize,
            })
          : copy('Con lotto infinito l’ATI coincide con n.'),
      ],
    },
    {
      heading: copy('Come scegliere il piano'),
      body: [
        copy('Aumentare n rende la curva più ripida; aumentare c sposta il piano verso l’accettazione.'),
        copy('Il piano va scelto prima di vedere i risultati e va registrato: cambiarlo dopo l’ispezione invalida il confronto con la qualità attesa.'),
      ],
    },
  ],
  limitations: [
    copy('Il modello assume campionamento casuale e difettosi indipendenti; lotti selezionati o ispezioni non casuali cambiano le probabilità.'),
  ],
});
