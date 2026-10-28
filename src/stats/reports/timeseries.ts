import { fmtEst, fmtP } from '../format';
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
  const arimaField = (name: string) => arimaModel.find(row => String(row.metric) === name);
  const arimaText = (name: string): string => String(arimaField(name)?.value ?? '');
  const arimaNumber = (name: string): number => Number(arimaField(name)?.raw ?? NaN);
  const arimaCoefs = tableById(tables, 'ts-arima-coefficients')?.rows ?? [];
  const arimaDiagnostics = tableById(tables, 'ts-arima-diagnostics')?.rows ?? [];
  const arimaAccuracy = tableById(tables, 'ts-arima-accuracy')?.rows ?? [];
  const arimaForecast = tableById(tables, 'ts-arima-forecast')?.rows ?? [];
  const arimaCandidates = tableById(tables, 'ts-arima-candidates')?.rows ?? [];
  const hasArima = arimaModel.length > 0 && arimaForecast.length > 0;

  const metric = (name: string): number => Number(summary.find(row => String(row.metric) === name)?.value ?? NaN);
  const mk = tests.find(row => String(row.test).includes('Mann'));
  const runs = tests.find(row => String(row.test).includes('Wald'));
  const ljung = tests.find(row => String(row.test).includes('Ljung'));
  const best = models[0];

  const n = metric('Osservazioni');
  const sd = metric('Deviazione standard');
  const slope = metric('Pendenza di Sen');
  const total = metric('Variazione totale');

  const hasTrend = Number.isFinite(Number(mk?.p)) && isDecided(Number(mk?.p), level);
  const trendClause = hasTrend
    ? `trend ${Number(mk?.statistic) > 0 ? 'crescente' : 'decrescente'}`
    : 'nessun trend monotono';
  const trendSentence = hasTrend
    ? `c’è un ${trendClause} (Mann–Kendall p = ${fmtP(Number(mk?.p))})`
    : `non c’è evidenza di un ${trendClause} (Mann–Kendall p = ${fmtP(Number(mk?.p))})`;

  const autocorrSentence = Number.isFinite(Number(ljung?.p)) && Number(ljung?.p) < 1 - level / 100
    ? `le autocorrelazioni sono congiuntamente significative (Ljung–Box p = ${fmtP(Number(ljung?.p))}): i valori dipendono dai precedenti`
    : `le autocorrelazioni non sono congiuntamente significative (Ljung–Box p = ${fmtP(Number(ljung?.p))}): non emerge una struttura temporale forte`;

  const holdoutRow = arimaAccuracy.find(row => String(row.sample).startsWith('Validazione'));
  const holdoutRmse = Number(holdoutRow?.rmse ?? NaN);
  const benchmarkRmse = Number(best?.rmse ?? NaN);
  const benchmarkSentence =
    !Number.isFinite(holdoutRmse) || !Number.isFinite(benchmarkRmse)
      ? ''
      : holdoutRmse < benchmarkRmse * 0.95
        ? `batte il riferimento più semplice (RMSE ${fmtEst(benchmarkRmse, 3)})`
        : holdoutRmse > benchmarkRmse * 1.05
          ? `non batte il riferimento più semplice (RMSE ${fmtEst(benchmarkRmse, 3)}): la struttura aggiuntiva non ripaga`
          : `è sostanzialmente equivalente al riferimento più semplice (RMSE ${fmtEst(benchmarkRmse, 3)})`;

  const memoryTerms = arimaCoefs.filter(row =>
    /^(AR|MA|SAR|SMA)\(/.test(String(row.term))
  );
  const memoryBullets = memoryTerms.map(row => {
    const pValue = Number(row.p);
    return `${String(row.term)} = ${fmtEst(Number(row.estimate), 3)} (${describeP(pValue)}): ${
      isDecided(pValue, level)
        ? 'termine significativo, aggiunge memoria al modello'
        : 'termine non significativo, il suo contributo non si distingue dal caso'
    }.`;
  });

  const residualTest = arimaDiagnostics.find(row => String(row.test).includes('Ljung'));
  const residualP = Number(residualTest?.p ?? NaN);
  const secondDelta = Number(arimaCandidates[1]?.delta ?? NaN);
  const aicc = arimaNumber('AICc');
  const adfP = arimaNumber('Test ADF sulla serie');
  const manualDifference = arimaText('Scelta della differenziazione').startsWith('manuale');
  const adbSentence = manualDifference
    ? `La differenziazione è impostata a mano, quindi l’ordine non dipende dai test${Number.isFinite(adfP) ? ` (ADF p ≈ ${fmtP(adfP)} resta solo informativo)` : ''}.`
    : Number.isFinite(adfP)
      ? `Il test ADF sulla serie dà p ≈ ${fmtP(adfP)}: ${adfP > 0.05 ? 'la radice unitaria non è rifiutata, quindi almeno una differenziazione serve' : 'la stazionarietà non è rifiutata, quindi la serie non va differenziata'}.`
      : 'Il test ADF non è calcolabile su questa serie: la differenziazione va decisa a mano.';

  const arimaSection: ReportSection | null = hasArima
    ? {
        heading: `Modello ${arimaText('Modello')}`,
        body: [
          `La ricerca automatica sull'ordine ha scelto ${arimaText('Modello')} (AICc = ${Number.isFinite(aicc) ? fmtEst(aicc, 3) : '—'}): ${
            Number.isFinite(secondDelta) && secondDelta < 2
              ? `il secondo classificato è a Δ AICc = ${fmtEst(secondDelta, 3)}, quindi i dati non distinguono nettamente i due ordini`
              : Number.isFinite(secondDelta)
                ? `il distacco dal secondo classificato è Δ AICc = ${fmtEst(secondDelta, 3)}, quindi la scelta è netta`
                : 'non ci sono altri ordini confrontabili'
          }.`,
          `Differenziazione: ${arimaText('Differenziazione')}; scelta ${arimaText('Scelta della differenziazione').toLowerCase()}. ${adbSentence}`,
          arimaText('Stazionarietà').startsWith('sì') && arimaText('Invertibilità').startsWith('sì')
            ? 'Le radici AR e MA stanno fuori dal cerchio unitario: il modello è stazionario e invertibile, quindi le previsioni convergono invece di divergere.'
            : 'Attenzione: almeno una radice è vicina o dentro il cerchio unitario, quindi la stima è al limite della regione ammissibile e le previsioni vanno lette con prudenza.',
        ],
        bullets: [
          ...(memoryBullets.length > 0
            ? memoryBullets
            : ['Nessun termine AR o MA significativo: il modello si riduce a una media (o a un drift) più rumore.']),
          Number.isFinite(residualP)
            ? `Residui: Ljung–Box ${describeP(residualP)} → ${isDecided(residualP, level) ? 'resta autocorrelazione non spiegata, l’ordine andrebbe rivisto' : 'nessuna autocorrelazione residua, il modello ha catturato la memoria della serie'}.`
            : 'Il test di autocorrelazione sui residui non è calcolabile.',
          Number.isFinite(holdoutRmse)
            ? `Validazione fuori campione: RMSE = ${fmtEst(holdoutRmse, 3)}, MAE = ${fmtEst(Number(holdoutRow?.mae), 3)}; il modello ${benchmarkSentence}.`
            : 'Serie troppo corta per una validazione fuori campione: l’errore disponibile è quello di adattamento.',
          `Errore standard residuo sulla scala modellata: ${fmtEst(arimaNumber('Errore standard residuo'), 3)} su ${String(arimaField('Osservazioni efficaci')?.value ?? '—')} osservazioni efficaci.`,
        ],
      }
    : null;

  const firstArima = arimaForecast[0];
  const lastArima = arimaForecast[arimaForecast.length - 1];
  const widthOf = (row: typeof firstArima): number => Number(row?.hi) - Number(row?.lo);

  const forecastParagraphs: string[] = hasArima
    ? [
        `Il modello ${arimaText('Modello')} porta la previsione da ${fmtEst(Number(firstArima?.forecast), 3)} al passo ${String(firstArima?.step ?? '')} a ${fmtEst(Number(lastArima?.forecast), 3)} al passo ${String(lastArima?.step ?? '')}, su ${arimaForecast.length} passi.`,
        `Intervallo al ${level}%: ${fmtEst(Number(firstArima?.lo), 3)} – ${fmtEst(Number(firstArima?.hi), 3)} al primo passo e ${fmtEst(Number(lastArima?.lo), 3)} – ${fmtEst(Number(lastArima?.hi), 3)} all’ultimo; l’ampiezza passa da ${fmtEst(widthOf(firstArima), 3)} a ${fmtEst(widthOf(lastArima), 3)}, come ci si aspetta quando l’orizzonte cresce.`,
        Number.isFinite(holdoutRmse)
          ? `In validazione sugli ultimi ${String(holdoutRow?.steps ?? '')} valori l’RMSE è ${fmtEst(holdoutRmse, 3)} e il modello ${benchmarkSentence}.`
          : 'Le previsioni non hanno una validazione fuori campione: l’errore in campione è ottimista perché i parametri sono stati stimati sugli stessi dati.',
        'Gli intervalli includono l’accumulo di incertezza dovuto alla differenziazione, ma non l’incertezza sulla stima dei parametri né quella sulla scelta dell’ordine.',
      ]
    : best
      ? [
          `Il modello migliore in validazione è ${String(best.model)} (RMSE = ${fmtEst(Number(best.rmse), 3)}, MAE = ${fmtEst(Number(best.mae), 3)}): qualità ${modelQuality(Number(best.rmse), sd)} rispetto alla variabilità della serie.`,
          `Le prossime ${forecast.length} previsioni partono da ${fmtEst(Number(forecast[0]?.forecast), 3)} e arrivano a ${fmtEst(Number(forecast[forecast.length - 1]?.forecast), 3)}.`,
          'Sono previsioni puntuali: l’intervallo di incertezza crescerebbe con l’orizzonte e non è incluso.',
        ]
      : ['La serie è troppo corta per confrontare modelli di previsione.'];

  return {
    id: 'timeseries',
    title: 'Report di lettura',
    headline: `Serie di ${showInteger(n)} osservazioni: ${trendClause}.`,
    badge: 'Serie storica',
    tone: Number.isFinite(Number(mk?.p)) && isDecided(Number(mk?.p), level) ? 'positive' : 'neutral',
    intro: [
      'L’analisi descrittiva di una serie storica verifica se i valori sono indipendenti dal tempo: trend, autocorrelazione e stagionalità sono le tre strutture che rendono una serie diversa da un campione casuale.',
      `Qui ${trendSentence}, e ${autocorrSentence}.`,
      hasArima
        ? 'Su questa base viene stimato un modello ARIMA/SARIMA: memoria e stagionalità stimate servono a costruire previsioni con intervalli, non solo a descrivere la serie.'
        : 'La serie non permette di stimare un modello ARIMA: le previsioni restano quelle dei modelli semplici.',
    ],
    sections: [
      {
        heading: 'Trend e casualità',
        bullets: [
          `Pendenza di Sen = ${fmtEst(slope, 4)} per passo: ${Number.isFinite(slope) ? (slope > 0 ? 'crescita' : slope < 0 ? 'calo' : 'stabilità') : 'non calcolabile'} mediana, robusta agli outlier.`,
          `Variazione dal primo all’ultimo valore: ${fmtEst(total, 4)} (${Number.isFinite(sd) && sd > 0 ? `circa ${fmtEst(Math.abs(total) / sd, 2)} deviazioni standard` : 'scala non calcolabile'}).`,
          `Test dei runs: p = ${fmtP(Number(runs?.p))}${Number.isFinite(Number(runs?.p)) ? Number(runs?.p) < 1 - level / 100 ? ', la successione non è casuale' : ', compatibile con una successione casuale' : ''}.`,
        ],
      },
      {
        heading: 'Autocorrelazione',
        body: [
          'L’ACF misura quanto un valore è correlato con quelli precedenti. Se le barre restano dentro la banda ±1,96/√N, la serie non mostra memoria temporale; se escono, il passato contiene informazione sul presente.',
          `Ljung–Box: Q = ${fmtEst(Number(ljung?.statistic), 3)} con p = ${fmtP(Number(ljung?.p))}. ${autocorrSentence}.`,
        ],
      },
      {
        heading: seasonal ? 'Stagionalità' : 'Stagionalità non richiesta',
        body: seasonal
          ? [
              `La forza della stagionalità è ${fmtEst(metric('Forza della stagionalità'), 3)}: ${metric('Forza della stagionalità') > 0.5 ? 'la componente stagionale domina la variabilità attorno al trend.' : 'la componente stagionale è presente ma non domina la variabilità attorno al trend.'}`,
              'Gli indici per posizione nel ciclo dicono quali periodi stanno sopra o sotto la tendenza: sono scostamenti medi, non valori assoluti.',
            ]
          : ['Imposta un periodo stagionale (per esempio 12 per dati mensili, 4 per trimestrali) per stimare gli indici e scomporre la serie.'],
      },
      ...(arimaSection ? [arimaSection] : []),
      {
        heading: 'Previsioni',
        body: forecastParagraphs,
      },
    ],
    limitations: [
      hasArima
        ? 'La stima ARIMA è condizionale (somma dei quadrati dei residui) e non a massima verosimiglianza esatta: con serie molto corte i primi residui pesano di più.'
        : 'Non è stato possibile stimare un modello ARIMA su questa serie: le previsioni mostrate sono quelle dei modelli semplici.',
      'La ricerca degli ordini è limitata a p e q ≤ 2 (≤ 1 con meno di 30 osservazioni) e a un termine stagionale AR e MA: ordini maggiori non vengono esplorati.',
      'Gli intervalli di previsione non includono l’incertezza sulla stima dei parametri né sulla scelta dell’ordine; volatilità condizionale (GARCH) e regressori esterni non sono modellati.',
      'La scomposizione è additiva; con ampiezza stagionale proporzionale al livello serve un modello moltiplicativo.',
      'Trend, stagionalità e previsioni assumono che il futuro continui il pattern osservato: cambi di regime non sono previsti.',
      'Il MAPE non è definito quando la serie contiene zeri.',
    ],
  };
};

const showInteger = (value: number): string => (Number.isFinite(value) ? String(Math.round(value)) : '—');
