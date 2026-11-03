import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { SpatialResult } from '../w9Results';
import type { ReportSpec } from '../report';

export const spatialReport = (result: SpatialResult, variableName: string): ReportSpec => {
  const moran = result.moran;
  const sar = result.sar;
  const positive = moran ? moran.i > moran.expected : false;
  return {
    id: 'spatial',
    title: copy('Report di lettura — Statistica spaziale'),
    headline: moran
      ? copy('Moran I per {s1} = {s2} (p {s3}).', {
          s1: variableName,
          s2: fmtEst(moran.i, 3),
          s3: fmtEst(moran.permutationP, 3),
        })
      : sar
        ? copy('Ritardo spaziale: ρ = {s1} (p {s2}).', {
            s1: fmtEst(sar.rho, 3),
            s2: fmtEst(sar.lrP, 3),
          })
        : copy('Geary C = {s1}.', {
            s1: fmtEst(result.geary?.c ?? NaN, 3),
          }),
    badge: copy('{s1} vicini', { s1: result.k }),
    tone: moran && moran.permutationP < 0.05 ? 'positive' : 'neutral',
    intro: [
      copy('La statistica spaziale verifica se valori vicini nello spazio tendono a somigliarsi più di quanto farebbe un’assegnazione casuale.'),
      copy('I pesi collegano ogni punto ai k vicini più prossimi; la standardizzazione per riga rende confrontabili punti con densità diversa.'),
    ],
    sections: [
      {
        heading: copy('Globale'),
        bullets: [
          moran
            ? copy('Moran I = {s1}, atteso {s2}, z {s3}.', {
                s1: fmtEst(moran.i, 3),
                s2: fmtEst(moran.expected, 3),
                s3: fmtEst(moran.z, 2),
              })
            : copy('Nessun indice globale disponibile.'),
          moran
            ? moran.permutationP < 0.05
              ? copy('La permutazione rifiuta l’assenza di autocorrelazione: i valori non sono distribuiti a caso nello spazio.')
              : copy('La permutazione non rifiuta l’assenza di autocorrelazione: i dati sono compatibili con una disposizione casuale.')
            : '',
          result.geary
            ? copy('Geary C = {s1}, p per permutazione {s2}.', {
                s1: fmtEst(result.geary.c, 3),
                s2: fmtEst(result.geary.permutationP, 3),
              })
            : '',
          positive
            ? copy('Valori alti tendono a raggrupparsi con valori alti e valori bassi con valori bassi.')
            : copy('La configurazione non mostra un clustering positivo netto.'),
        ].filter(Boolean),
      },
      {
        heading: copy('Locale'),
        body:
          result.lisa.length > 0
            ? [
                copy('I indicatori locali scompongono l’autocorrelazione per punto e permettono di individuare cluster e valori anomali spaziali.'),
                copy('Punti con p bassa e quadrante HH o LL formano cluster; HL e LH segnalano valori discordanti dai vicini.'),
                copy('Con molti punti e permutazioni limitate, qualche p piccolo può comparire per caso: valuta la correzione per confronti multipli.'),
              ]
            : [
                sar
                  ? copy('Il modello SAR stima l’effetto dei vicini oltre a quello dei predittori: ρ misura l’intensità del ritardo spaziale.')
                  : copy('Nessun indicatore locale calcolato.'),
              ],
      },
      {
        heading: copy('Limiti'),
        body: [
          copy('La matrice dei pesi è una scelta di modello: k diverso o una soglia di distanza diversa cambiano i risultati.'),
          copy('L’autocorrelazione spaziale non implica una relazione causale: variabili omesse con struttura spaziale producono lo stesso segnale.'),
          copy('Il modello SAR assume una struttura lineare e un unico parametro di dipendenza spaziale.'),
        ],
      },
    ],
    limitations: [
      copy('Le conclusioni valgono per la matrice dei pesi e l’insieme di punti analizzati; non generalizzano automaticamente ad altre scale.'),
    ],
  };
};
