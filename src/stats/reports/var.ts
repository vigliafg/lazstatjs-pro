import { fmtEst, fmtP } from '../format';
import { copy, sourceOf } from '../reportCopy';
import { describeP, isDecided, tableById } from '../reportKit';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';
interface VarReportResult {
  mode: 'var' | 'vecm';
  names: string[];
  k: number;
  n: number;
  lags: number;
  stable?: boolean;
  granger?: { cause: string; effect: string; p: number }[];
  cointegration?: { p: number };
  alpha?: { equation: string; estimate: number; p: number }[];
  beta?: { term: string; estimate: number }[];
}

export const varReport = (tables: TableSpec[], result: VarReportResult, level: number): ReportSpec => {
  const model = tableById(tables, result.mode === 'var' ? 'var-model' : 'vecm-model')?.rows ?? [];
  const field = (name: string) => model.find(row => sourceOf(String(row.metric)) === sourceOf(name));
  const number = (name: string): number => Number(field(name)?.value ?? NaN);
  const names = result.names.join(', ');

  if (result.mode === 'var') {
    const granger = tableById(tables, 'var-granger')?.rows ?? [];
    const significant = granger.filter(row => isDecided(Number(row.p), level));
    const stable = sourceOf(String(field(copy('Stabilità'))?.value ?? '')).startsWith('sistema stabile');
    const irf = tableById(tables, 'var-irf')?.rows ?? [];
    const firstShock = irf.find(row => Number(row.horizon) === 1 && String(row.shock) === result.names[0]);
    const shockName = result.names[0] ?? 'y1';
    const ownResponse = irf.find(
      row => Number(row.horizon) === 1 && String(row.shock) === shockName && String(row.variable) === shockName
    );
    const selection = tableById(tables, 'var-selection')?.rows ?? [];
    const best = selection.find(row => Number(row.lags) === result.lags);
    return {
      id: 'var',
      title: copy('Report di lettura'),
      headline: copy('VAR({s1}) su {s2} serie: {s3} osservazioni.', {
        s1: result.lags,
        s2: result.k,
        s3: result.n,
      }),
      badge: copy('Serie temporali'),
      tone: significant.length > 0 ? 'positive' : 'neutral',
      intro: [
        copy('Il VAR descrive come ciascuna serie dipende dai propri ritardi e da quelli delle altre: è la versione multivariata dell’ARIMA senza componente a media mobile.'),
        copy('Serie analizzate: {s1}. L’ordine scelto è {s2}, con AIC = {s3} e BIC = {s4}.', {
          s1: names,
          s2: result.lags,
          s3: Number.isFinite(number('AIC')) ? fmtEst(number('AIC'), 3) : '—',
          s4: Number.isFinite(number('BIC')) ? fmtEst(number('BIC'), 3) : '—',
        }),
      ],
      sections: [
        {
          heading: copy('Stabilità e dinamica'),
          body: [
            stable
              ? copy('Il sistema è stabile: le risposte impulsive si esauriscono e le previsioni convergono al livello di lungo periodo.')
              : copy('Il sistema non è stabile: almeno una radice è dentro il cerchio unitario e le risposte impulsive possono crescere senza limite.'),
            firstShock && ownResponse && Number.isFinite(Number(ownResponse.response))
              ? copy('Uno shock sulla serie {s1} produce una risposta immediata di {s2} sulla serie stessa.', {
                  s1: shockName,
                  s2: fmtEst(Number(ownResponse.response), 3),
                })
              : copy('La risposta impulsiva non è calcolabile per questo sistema.'),
          ],
        },
        {
          heading: copy('Causalità di Granger'),
          body: [
            significant.length === 0
              ? copy('Nessuna relazione di Granger è significativa al livello dichiarato: i ritardi delle altre serie non aggiungono potere previsionale.')
              : copy('{s1} relazioni su {s2} sono significative al livello {s3}%.', {
                  s1: significant.length,
                  s2: granger.length,
                  s3: level,
                }),
            ...significant
              .slice(0, 4)
              .map(row =>
                copy('{s1} → {s2}: F = {s3}, p = {s4}.', {
                  s1: String(row.cause),
                  s2: String(row.effect),
                  s3: fmtEst(Number(row.f), 3),
                  s4: fmtP(Number(row.p)),
                })
              ),
            copy('La causalità di Granger misura il contenuto informativo dei ritardi, non un meccanismo causale: va letta insieme alla teoria e ai tempi delle variabili.'),
          ],
        },
        {
          heading: copy('Risposte impulsive e varianza'),
          body: [
            copy('Le risposte impulsive mostrano come uno shock di una deviazione standard si propaga nelle serie; la scomposizione della varianza dice quanto ogni shock pesa sull’errore di previsione a ciascun orizzonte.'),
            copy('L’ortogonalizzazione dipende dall’ordine delle serie: la prima serie reagisce contemporaneamente solo al proprio shock, l’ultima a tutti.'),
          ],
        },
      ],
      limitations: [
        copy('Il VAR richiede serie stazionarie o adeguatamente differenziate; su livelli con trend le radici possono avvicinarsi al cerchio unitario.'),
        copy('La scelta dell’ordine è limitata ai ritardi esplorati e al criterio AIC: modelli con ritardi maggiori o componenti stagionali non sono considerati.'),
        copy('L’intervallo di confidenza delle risposte impulsive non è riportato: le bande bootstrap non sono incluse.'),
        copy('La causalità di Granger non sostituisce un disegno causale né controlla per variabili omesse.'),
      ],
    };
  }

  const beta = tableById(tables, 'vecm-beta')?.rows ?? [];
  const alpha = tableById(tables, 'vecm-alpha')?.rows ?? [];
  const cointegration = tableById(tables, 'vecm-cointegration')?.rows?.[0];
  const signed = alpha.filter(row => isDecided(Number(row.p), level));
  const betaText = beta
    .map(row => `${fmtEst(Number(row.estimate), 3)}·${String(row.term)}`)
    .join(' + ');
  return {
    id: 'vecm',
    title: copy('Report di lettura'),
    headline: copy('VECM a due passi su {s1}: {s2} osservazioni.', { s1: names, s2: result.n }),
    badge: copy('Serie temporali'),
    tone: isDecided(Number(cointegration?.p), level) ? 'positive' : 'neutral',
    intro: [
      copy('Il VECM combina una relazione di lungo periodo tra i livelli con la dinamica di breve periodo delle differenze.'),
      copy('Il vettore di cointegrazione stimato è {s1}; il test ADF sui residui dà {s2}.', {
        s1: betaText,
        s2: describeP(Number(cointegration?.p)),
      }),
    ],
    sections: [
      {
        heading: copy('Relazione di lungo periodo'),
        body: [
          isDecided(Number(cointegration?.p), level)
            ? copy('La radice unitaria nei residui è rifiutata: la combinazione β′y è compatibile con una relazione stazionaria di lungo periodo.')
            : copy('La radice unitaria nei residui non è rifiutata: non c’è evidenza sufficiente di cointegrazione e il VECM va letto con cautela.'),
          copy('Il vettore è normalizzato sulla prima serie: il coefficiente di ciascuna altra serie misura quante unità della prima servono per annullare lo scostamento.'),
        ],
      },
      {
        heading: copy('Aggiustamento di breve periodo'),
        body: [
          signed.length === 0
            ? copy('Nessun coefficiente α è significativo: le serie non sembrano correggere gli scostamenti dal rapporto di lungo periodo.')
            : copy('{s1} equazioni hanno un α significativo: il termine di correzione dell’errore contribuisce alla dinamica delle differenze.', {
                s1: signed.length,
              }),
          ...signed
            .slice(0, 4)
            .map(row =>
              copy('{s1}: α = {s2} (p = {s3}).', {
                s1: String(row.equation),
                s2: fmtEst(Number(row.estimate), 3),
                s3: fmtP(Number(row.p)),
              })
            ),
        ],
      },
    ],
    limitations: [
      copy('La procedura di Engle–Granger assume un solo vettore di cointegrazione: con più relazioni di lungo periodo serve Johansen.'),
      copy('Il test ADF sui residui usa valori critici indicativi, perché i residui sono stimati e non osservati.'),
      copy('La scelta dei ritardi e la normalizzazione del vettore β influenzano l’interpretazione dei coefficienti.'),
      copy('Cambi strutturali e outlier non sono modellati.'),
    ],
  };
};
