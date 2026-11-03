import { fmtEst, fmtP } from '../format';
import { copy } from '../reportCopy';
import { describeP, isDecided, tableById } from '../reportKit';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';
interface GarchSummary {
  n: number;
  persistence: number;
  alpha: number;
  beta: number;
  longRunVariance: number;
  halfLife: number;
  forecast: { variance: number }[];
}

export const garchReport = (tables: TableSpec[], fit: GarchSummary, level: number): ReportSpec => {
  const persistent = fit.persistence >= 0.95;
  const diagnostics = tableById(tables, 'garch-diagnostics')?.rows ?? [];
  const ljung = diagnostics.find(row => String(row.test).includes('Ljung'));
  const jb = diagnostics.find(row => String(row.test).includes('Jarque'));
  const second = fit.forecast[1];
  const last = fit.forecast[fit.forecast.length - 1];
  return {
    id: 'garch',
    title: copy('Report di lettura'),
    headline: copy('GARCH(1,1): persistenza {s1}, emivita {s2} periodi.', {
      s1: fmtEst(fit.persistence, 3),
      s2: fmtEst(fit.halfLife, 1),
    }),
    badge: copy('Volatilità'),
    tone: persistent ? 'caution' : 'neutral',
    intro: [
      copy('Il GARCH(1,1) separa il livello della serie dalla sua volatilità: la varianza condizionale dipende dall’innovazione precedente e dalla volatilità precedente.'),
      copy('Su {s1} osservazioni la persistenza stimata è {s2}: {s3}.', {
        s1: fit.n,
        s2: fmtEst(fit.persistence, 3),
        s3: persistent
          ? copy('gli shock di volatilità si dissolvono lentamente')
          : copy('gli shock di volatilità rientrano in un orizzonte ragionevole'),
      }),
    ],
    sections: [
      {
        heading: copy('Persistenza e memoria'),
        body: [
          copy('α = {s1} misura la reazione alle innovazioni; β = {s2} la memoria della volatilità passata.', {
            s1: fmtEst(fit.alpha, 3),
            s2: fmtEst(fit.beta, 3),
          }),
          copy('La varianza di lungo periodo è {s1}; l’emivita è {s2} periodi.', {
            s1: fmtEst(fit.longRunVariance, 3),
            s2: fmtEst(fit.halfLife, 1),
          }),
          copy('Il test Ljung–Box sui residui standardizzati dà {s1}: {s2}.', {
            s1: describeP(Number(ljung?.p)),
            s2: isDecided(Number(ljung?.p), level)
              ? copy('resta autocorrelazione nella volatilità: valuta ordini maggiori o un modello asimmetrico')
              : copy('non emerge autocorrelazione residua rilevante'),
          }),
          copy('Jarque–Bera dà p = {s1}: {s2}.', {
            s1: fmtP(Number(jb?.p)),
            s2: isDecided(Number(jb?.p), level)
              ? copy('la normalità è rifiutata, come spesso accade con rendimenti finanziari')
              : copy('i residui standardizzati sono compatibili con la normalità'),
          }),
        ],
      },
      {
        heading: copy('Previsione della volatilità'),
        body: [
          copy('La varianza prevista passa da {s1} al primo passo a {s2} all’orizzonte {s3}, contro una varianza di lungo periodo di {s4}.', {
            s1: fmtEst(second?.variance, 3),
            s2: fmtEst(last?.variance, 3),
            s3: fit.forecast.length,
            s4: fmtEst(fit.longRunVariance, 3),
          }),
          copy('La DS condizionale è la radice della varianza prevista: è la scala attesa delle oscillazioni, non un intervallo di confidenza sulla media.'),
        ],
      },
    ],
    limitations: [
      copy('Il modello è GARCH(1,1) gaussiano: non cattura asimmetrie (leva) né code spesse in modo esplicito.'),
      copy('La media è costante: trend o regressori nella media non sono inclusi.'),
      copy('La varianza di lungo periodo e l’emivita non sono definite quando α + β ≥ 1.'),
      copy('Gli errori standard dipendono dall’Hessiana numerica e possono essere instabili su serie corte.'),
      copy('Le previsioni della varianza non sono previsioni di prezzo: indicano solo la scala dell’incertezza.'),
    ],
  };
};
