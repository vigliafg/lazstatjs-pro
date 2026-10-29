import { fmtEst, fmtP } from '../format';
import { copy, sourceOf } from '../reportCopy';
import { describeP, isDecided, tableById } from '../reportKit';
import type { ReportSection, ReportSpec } from '../report';
import { modelQuality } from '../tables/timeseries';
import type { TableSpec } from '../types';

export const timeSeriesReport = (tables: TableSpec[], level: number): ReportSpec => {
  const summary = tableById(tables, 'ts-summary')?.rows ?? [];
  const tests = tableById(tables, 'ts-tests')?.rows ?? [];
  const models = tableById(tables, 'ts-models')?.rows ?? [];
  const seasonal = tableById(tables, 'ts-seasonal');
  const forecast = tableById(tables, 'ts-forecast')?.rows ?? [];
  const arimaModel = tableById(tables, 'ts-arima-model')?.rows ?? [];
  const arimaField = (name: string) =>
    arimaModel.find(row => sourceOf(String(row.metric)) === sourceOf(name));
  const arimaText = (name: string): string => String(arimaField(name)?.value ?? '');
  const arimaNumber = (name: string): number => Number(arimaField(name)?.raw ?? NaN);
  const arimaCoefs = tableById(tables, 'ts-arima-coefficients')?.rows ?? [];
  const arimaDiagnostics = tableById(tables, 'ts-arima-diagnostics')?.rows ?? [];
  const arimaAccuracy = tableById(tables, 'ts-arima-accuracy')?.rows ?? [];
  const arimaForecast = tableById(tables, 'ts-arima-forecast')?.rows ?? [];
  const arimaCandidates = tableById(tables, 'ts-arima-candidates')?.rows ?? [];
  const hasArima = arimaModel.length > 0 && arimaForecast.length > 0;

  const metric = (name: string): number =>
    Number(summary.find(row => sourceOf(String(row.metric)) === sourceOf(name))?.value ?? NaN);
  const mk = tests.find(row => String(row.test).includes('Mann'));
  const runs = tests.find(row => String(row.test).includes('Wald'));
  const ljung = tests.find(row => String(row.test).includes('Ljung'));
  const best = models[0];

  const n = metric('Osservazioni');
  const sd = metric(copy('Deviazione standard'));
  const slope = metric(copy('Pendenza di Sen'));
  const total = metric(copy('Variazione totale'));

  const hasTrend = Number.isFinite(Number(mk?.p)) && isDecided(Number(mk?.p), level);
  const trendClause = hasTrend
    ? copy('trend {s1}', { s1: Number(mk?.statistic) > 0 ? 'crescente' : 'decrescente' })
    : copy('nessun trend monotono');
  const trendSentence = hasTrend
    ? copy('c’è un {s1} (Mann–Kendall p = {s2})', { s1: trendClause, s2: fmtP(Number(mk?.p)) })
    : copy('non c’è evidenza di un {s1} (Mann–Kendall p = {s2})', { s1: trendClause, s2: fmtP(Number(mk?.p)) });

  const autocorrSentence = Number.isFinite(Number(ljung?.p)) && Number(ljung?.p) < 1 - level / 100
    ? copy('le autocorrelazioni sono congiuntamente significative (Ljung–Box p = {s1}): i valori dipendono dai precedenti', { s1: fmtP(Number(ljung?.p)) })
    : copy('le autocorrelazioni non sono congiuntamente significative (Ljung–Box p = {s1}): non emerge una struttura temporale forte', { s1: fmtP(Number(ljung?.p)) });

  const holdoutRow = arimaAccuracy.find(row => sourceOf(String(row.sample)).startsWith('Validazione'));
  const holdoutRmse = Number(holdoutRow?.rmse ?? NaN);
  const benchmarkRmse = Number(best?.rmse ?? NaN);
  const benchmarkSentence =
    !Number.isFinite(holdoutRmse) || !Number.isFinite(benchmarkRmse)
      ? ''
      : holdoutRmse < benchmarkRmse * 0.95
        ? copy('batte il riferimento più semplice (RMSE {s1})', { s1: fmtEst(benchmarkRmse, 3) })
        : holdoutRmse > benchmarkRmse * 1.05
          ? copy('non batte il riferimento più semplice (RMSE {s1}): la struttura aggiuntiva non ripaga', { s1: fmtEst(benchmarkRmse, 3) })
          : copy('è sostanzialmente equivalente al riferimento più semplice (RMSE {s1})', { s1: fmtEst(benchmarkRmse, 3) });

  const memoryTerms = arimaCoefs.filter(row =>
    /^(AR|MA|SAR|SMA)\(/.test(String(row.term))
  );
  const memoryBullets = memoryTerms.map(row => {
    const pValue = Number(row.p);
    return copy('{s1} = {s2} ({s3}): {s4}.', { s1: String(row.term), s2: fmtEst(Number(row.estimate), 3), s3: describeP(pValue), s4: 
      isDecided(pValue, level)
        ? copy('termine significativo, aggiunge memoria al modello')
        : copy('termine non significativo, il suo contributo non si distingue dal caso')
     });
  });

  const residualTest = arimaDiagnostics.find(row => String(row.test).includes('Ljung'));
  const residualP = Number(residualTest?.p ?? NaN);
  const secondDelta = Number(arimaCandidates[1]?.delta ?? NaN);
  const aicc = arimaNumber('AICc');
  const adfP = arimaNumber(copy('Test ADF sulla serie'));
  const manualDifference = sourceOf(arimaText(copy('Scelta della differenziazione'))).startsWith('manuale');
  const adbSentence = manualDifference
    ? copy('La differenziazione è impostata a mano, quindi l’ordine non dipende dai test{s1}.', { s1: Number.isFinite(adfP) ? copy(' (ADF p ≈ {s1} resta solo informativo)', { s1: fmtP(adfP) }) : '' })
    : Number.isFinite(adfP)
      ? copy('Il test ADF sulla serie dà p ≈ {s1}: {s2}.', { s1: fmtP(adfP), s2: adfP > 0.05 ? copy('la radice unitaria non è rifiutata, quindi almeno una differenziazione serve') : copy('la stazionarietà non è rifiutata, quindi la serie non va differenziata') })
      : copy('Il test ADF non è calcolabile su questa serie: la differenziazione va decisa a mano.');

  const arimaSection: ReportSection | null = hasArima
    ? {
        heading: copy('Modello {s1}', { s1: arimaText('Modello') }),
        body: [
          copy('La ricerca automatica sull\'ordine ha scelto {s1} (AICc = {s2}): {s3}.', { s1: arimaText('Modello'), s2: Number.isFinite(aicc) ? fmtEst(aicc, 3) : '—', s3: 
            Number.isFinite(secondDelta) && secondDelta < 2
              ? copy('il secondo classificato è a Δ AICc = {s1}, quindi i dati non distinguono nettamente i due ordini', { s1: fmtEst(secondDelta, 3) })
              : Number.isFinite(secondDelta)
                ? copy('il distacco dal secondo classificato è Δ AICc = {s1}, quindi la scelta è netta', { s1: fmtEst(secondDelta, 3) })
                : copy('non ci sono altri ordini confrontabili')
           }),
          copy('Differenziazione: {s1}; scelta {s2}. {s3}', { s1: arimaText('Differenziazione'), s2: arimaText(copy('Scelta della differenziazione')).toLowerCase(), s3: adbSentence }),
          sourceOf(arimaText('Stazionarietà')).startsWith('sì') && sourceOf(arimaText('Invertibilità')).startsWith('sì')
            ? copy('Le radici AR e MA stanno fuori dal cerchio unitario: il modello è stazionario e invertibile, quindi le previsioni convergono invece di divergere.')
            : copy('Attenzione: almeno una radice è vicina o dentro il cerchio unitario, quindi la stima è al limite della regione ammissibile e le previsioni vanno lette con prudenza.'),
        ],
        bullets: [
          ...(memoryBullets.length > 0
            ? memoryBullets
            : [copy('Nessun termine AR o MA significativo: il modello si riduce a una media (o a un drift) più rumore.')]),
          Number.isFinite(residualP)
            ? copy('Residui: Ljung–Box {s1} → {s2}.', { s1: describeP(residualP), s2: isDecided(residualP, level) ? copy('resta autocorrelazione non spiegata, l’ordine andrebbe rivisto') : copy('nessuna autocorrelazione residua, il modello ha catturato la memoria della serie') })
            : copy('Il test di autocorrelazione sui residui non è calcolabile.'),
          Number.isFinite(holdoutRmse)
            ? copy('Validazione fuori campione: RMSE = {s1}, MAE = {s2}; il modello {s3}.', { s1: fmtEst(holdoutRmse, 3), s2: fmtEst(Number(holdoutRow?.mae), 3), s3: benchmarkSentence })
            : copy('Serie troppo corta per una validazione fuori campione: l’errore disponibile è quello di adattamento.'),
          copy('Errore standard residuo sulla scala modellata: {s1} su {s2} osservazioni efficaci.', { s1: fmtEst(arimaNumber(copy('Errore standard residuo')), 3), s2: String(arimaField(copy('Osservazioni efficaci'))?.value ?? '—') }),
        ],
      }
    : null;

  const firstArima = arimaForecast[0];
  const lastArima = arimaForecast[arimaForecast.length - 1];
  const widthOf = (row: typeof firstArima): number => Number(row?.hi) - Number(row?.lo);

  const forecastParagraphs: string[] = hasArima
    ? [
        copy('Il modello {s1} porta la previsione da {s2} al passo {s3} a {s4} al passo {s5}, su {s6} passi.', { s1: arimaText('Modello'), s2: fmtEst(Number(firstArima?.forecast), 3), s3: String(firstArima?.step ?? ''), s4: fmtEst(Number(lastArima?.forecast), 3), s5: String(lastArima?.step ?? ''), s6: arimaForecast.length }),
        copy('Intervallo al {s1}%: {s2} – {s3} al primo passo e {s4} – {s5} all’ultimo; l’ampiezza passa da {s6} a {s7}, come ci si aspetta quando l’orizzonte cresce.', { s1: level, s2: fmtEst(Number(firstArima?.lo), 3), s3: fmtEst(Number(firstArima?.hi), 3), s4: fmtEst(Number(lastArima?.lo), 3), s5: fmtEst(Number(lastArima?.hi), 3), s6: fmtEst(widthOf(firstArima), 3), s7: fmtEst(widthOf(lastArima), 3) }),
        Number.isFinite(holdoutRmse)
          ? copy('In validazione sugli ultimi {s1} valori l’RMSE è {s2} e il modello {s3}.', { s1: String(holdoutRow?.steps ?? ''), s2: fmtEst(holdoutRmse, 3), s3: benchmarkSentence })
          : copy('Le previsioni non hanno una validazione fuori campione: l’errore in campione è ottimista perché i parametri sono stati stimati sugli stessi dati.'),
        copy('Gli intervalli includono l’accumulo di incertezza dovuto alla differenziazione, ma non l’incertezza sulla stima dei parametri né quella sulla scelta dell’ordine.'),
      ]
    : best
      ? [
          copy('Il modello migliore in validazione è {s1} (RMSE = {s2}, MAE = {s3}): qualità {s4} rispetto alla variabilità della serie.', { s1: String(best.model), s2: fmtEst(Number(best.rmse), 3), s3: fmtEst(Number(best.mae), 3), s4: modelQuality(Number(best.rmse), sd) }),
          copy('Le prossime {s1} previsioni partono da {s2} e arrivano a {s3}.', { s1: forecast.length, s2: fmtEst(Number(forecast[0]?.forecast), 3), s3: fmtEst(Number(forecast[forecast.length - 1]?.forecast), 3) }),
          copy('Sono previsioni puntuali: l’intervallo di incertezza crescerebbe con l’orizzonte e non è incluso.'),
        ]
      : [copy('La serie è troppo corta per confrontare modelli di previsione.')];

  return {
    id: 'timeseries',
    title: copy('Report di lettura'),
    headline: copy('Serie di {s1} osservazioni: {s2}.', { s1: showInteger(n), s2: trendClause }),
    badge: copy('Serie storica'),
    tone: Number.isFinite(Number(mk?.p)) && isDecided(Number(mk?.p), level) ? 'positive' : 'neutral',
    intro: [
      copy('L’analisi descrittiva di una serie storica verifica se i valori sono indipendenti dal tempo: trend, autocorrelazione e stagionalità sono le tre strutture che rendono una serie diversa da un campione casuale.'),
      copy('Qui {s1}, e {s2}.', { s1: trendSentence, s2: autocorrSentence }),
      hasArima
        ? copy('Su questa base viene stimato un modello ARIMA/SARIMA: memoria e stagionalità stimate servono a costruire previsioni con intervalli, non solo a descrivere la serie.')
        : copy('La serie non permette di stimare un modello ARIMA: le previsioni restano quelle dei modelli semplici.'),
    ],
    sections: [
      {
        heading: copy('Trend e casualità'),
        bullets: [
          copy('Pendenza di Sen = {s1} per passo: {s2} mediana, robusta agli outlier.', { s1: fmtEst(slope, 4), s2: Number.isFinite(slope) ? (slope > 0 ? 'crescita' : slope < 0 ? 'calo' : 'stabilità') : copy('non calcolabile') }),
          copy('Variazione dal primo all’ultimo valore: {s1} ({s2}).', { s1: fmtEst(total, 4), s2: Number.isFinite(sd) && sd > 0 ? copy('circa {s1} deviazioni standard', { s1: fmtEst(Math.abs(total) / sd, 2) }) : copy('scala non calcolabile') }),
          copy('Test dei runs: p = {s1}{s2}.', { s1: fmtP(Number(runs?.p)), s2: Number.isFinite(Number(runs?.p)) ? Number(runs?.p) < 1 - level / 100 ? copy(', la successione non è casuale') : copy(', compatibile con una successione casuale') : '' }),
        ],
      },
      {
        heading: 'Autocorrelazione',
        body: [
          copy('L’ACF misura quanto un valore è correlato con quelli precedenti. Se le barre restano dentro la banda ±1,96/√N, la serie non mostra memoria temporale; se escono, il passato contiene informazione sul presente.'),
          copy('Ljung–Box: Q = {s1} con p = {s2}. {s3}.', { s1: fmtEst(Number(ljung?.statistic), 3), s2: fmtP(Number(ljung?.p)), s3: autocorrSentence }),
        ],
      },
      {
        heading: seasonal ? 'Stagionalità' : copy('Stagionalità non richiesta'),
        body: seasonal
          ? [
              copy('La forza della stagionalità è {s1}: {s2}', { s1: fmtEst(metric(copy('Forza della stagionalità')), 3), s2: metric(copy('Forza della stagionalità')) > 0.5 ? copy('la componente stagionale domina la variabilità attorno al trend.') : copy('la componente stagionale è presente ma non domina la variabilità attorno al trend.') }),
              copy('Gli indici per posizione nel ciclo dicono quali periodi stanno sopra o sotto la tendenza: sono scostamenti medi, non valori assoluti.'),
            ]
          : [copy('Imposta un periodo stagionale (per esempio 12 per dati mensili, 4 per trimestrali) per stimare gli indici e scomporre la serie.')],
      },
      ...(arimaSection ? [arimaSection] : []),
      {
        heading: 'Previsioni',
        body: forecastParagraphs,
      },
    ],
    limitations: [
      hasArima
        ? copy('La stima ARIMA è condizionale (somma dei quadrati dei residui) e non a massima verosimiglianza esatta: con serie molto corte i primi residui pesano di più.')
        : copy('Non è stato possibile stimare un modello ARIMA su questa serie: le previsioni mostrate sono quelle dei modelli semplici.'),
      copy('La ricerca degli ordini è limitata a p e q ≤ 2 (≤ 1 con meno di 30 osservazioni) e a un termine stagionale AR e MA: ordini maggiori non vengono esplorati.'),
      copy('Gli intervalli di previsione non includono l’incertezza sulla stima dei parametri né sulla scelta dell’ordine; volatilità condizionale (GARCH) e regressori esterni non sono modellati.'),
      copy('La scomposizione è additiva; con ampiezza stagionale proporzionale al livello serve un modello moltiplicativo.'),
      copy('Trend, stagionalità e previsioni assumono che il futuro continui il pattern osservato: cambi di regime non sono previsti.'),
      copy('Il MAPE non è definito quando la serie contiene zeri.'),
    ],
  };
};

const showInteger = (value: number): string => (Number.isFinite(value) ? String(Math.round(value)) : '—');
