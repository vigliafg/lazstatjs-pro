import { fmtEst, fmtP } from '../format';
import { copy, sourceOf } from '../reportCopy';
import { isDecided, tableById } from '../reportKit';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';
interface HoltWintersSummary {
  alpha: number;
  beta: number;
  gamma: number;
  level: number;
  trend: number;
  seasonal: 'additive' | 'multiplicative' | 'none';
  forecast: { mean: number; se: number; lo: number; hi: number }[];
}

interface UnitRootSummary {
  adf: { stat: number; p: number; lags: number; cv5: number };
  kpss: { level: { stat: number; p: number } };
  pp: { stat: number; p: number };
}

interface SpectralSummary {
  span: number;
  fisher: { g: number; p: number; frequency: number; period: number };
  ar: { order: number } | null;
}

export const holtWintersReport = (tables: TableSpec[], fit: HoltWintersSummary, level: number): ReportSpec => {
  const first = fit.forecast[0];
  const last = fit.forecast[fit.forecast.length - 1];
  const seasonal =
    fit.seasonal === 'none'
      ? copy('senza componente stagionale')
      : fit.seasonal === 'multiplicative'
        ? copy('con stagionalità moltiplicativa')
        : copy('con stagionalità additiva');
  return {
    id: 'timeseries',
    title: copy('Report di lettura'),
    headline: copy('Holt–Winters {s1}: previsione finale {s2}.', {
      s1: seasonal,
      s2: fmtEst(last?.mean ?? NaN, 3),
    }),
    badge: copy('Serie storica'),
    tone: 'neutral',
    intro: [
      copy('Lo smoothing esponenziale di Holt–Winters scompone la serie in livello, trend e stagionalità e aggiorna le tre componenti a ogni osservazione.'),
      copy('Il modello è {s1} con α = {s2}, β = {s3}{s4}.', {
        s1: seasonal,
        s2: fmtEst(fit.alpha, 3),
        s3: fmtEst(fit.beta, 3),
        s4: fit.seasonal === 'none' ? '' : copy(' e γ = {s1}', { s1: fmtEst(fit.gamma, 3) }),
      }),
    ],
    sections: [
      {
        heading: copy('Componenti'),
        body: [
          copy('Livello finale {s1} e trend finale {s2} per passo: {s3}.', {
            s1: fmtEst(fit.level, 3),
            s2: fmtEst(fit.trend, 3),
            s3: fit.trend > 0 ? copy('la serie è in crescita alla fine del campione') : fit.trend < 0 ? copy('la serie è in calo alla fine del campione') : copy('il livello è stabile alla fine del campione'),
          }),
          fit.seasonal === 'none'
            ? copy('Non è stata stimata una componente stagionale: imposta un periodo (12 per dati mensili, 4 per trimestrali) se la serie lo richiede.')
            : copy('La stagionalità è {s1}: {s2}.', {
                s1: fit.seasonal === 'multiplicative' ? copy('moltiplicativa') : copy('additiva'),
                s2:
                  fit.seasonal === 'multiplicative'
                    ? copy('il profilo è un insieme di rapporti al livello, adatto quando l’ampiezza cresce con la serie')
                    : copy('il profilo è un insieme di scostamenti dal livello, adatto quando l’ampiezza resta costante'),
              }),
        ],
      },
      {
        heading: copy('Previsioni'),
        body: [
          copy('La previsione passa da {s1} al primo passo a {s2} al passo {s3}, con intervallo al {s4}%.', {
            s1: fmtEst(first?.mean ?? NaN, 3),
            s2: fmtEst(last?.mean ?? NaN, 3),
            s3: fit.forecast.length,
            s4: level,
          }),
          copy('L’errore standard cresce con la radice dell’orizzonte: le previsioni lontane vanno lette come indicazione di direzione, non come valore puntuale.'),
        ],
      },
    ],
    limitations: [
      copy('Lo smoothing non è un modello stocastico completo: gli intervalli sono approssimati e non incorporano l’incertezza sui parametri.'),
      copy('La stagionalità è fissa nel tempo; cambi di pattern stagionale non sono seguiti.'),
      copy('Con serie molto corte l’inizializzazione pesa e i parametri possono finire al bordo [0,1].'),
      copy('La scelta additiva/moltiplicativa va motivata: la versione moltiplicativa richiede valori positivi.'),
    ],
  };
};

const testReading = (p: number, level: number, reject: string, keep: string): string =>
  !Number.isFinite(p) ? copy('non calcolabile') : p < 1 - level / 100 ? reject : keep;

export const unitRootReport = (tables: TableSpec[], result: UnitRootSummary, level: number): ReportSpec => {
  const adf = result.adf;
  const kpss = result.kpss.level;
  const pp = result.pp;
  const stationary = isDecided(adf.p, level) && !isDecided(kpss.p, level);
  return {
    id: 'timeseries',
    title: copy('Report di lettura'),
    headline: copy('Radici unitarie: ADF p = {s1}, KPSS p = {s2}.', {
      s1: fmtP(adf.p),
      s2: fmtP(kpss.p),
    }),
    badge: copy('Serie storica'),
    tone: stationary ? 'positive' : 'neutral',
    intro: [
      copy('Una radice unitaria significa che gli shock hanno effetto permanente e la serie non torna a un livello medio: è la firma di un random walk.'),
      copy('ADF e Phillips–Perron testano l’ipotesi nulla di radice unitaria; KPSS testa l’ipotesi nulla opposta, la stazionarietà.'),
    ],
    sections: [
      {
        heading: copy('Lettura dei test'),
        body: [
          copy('ADF: statistica {s1}, p = {s2}, {s3} ritardi. {s4}.', {
            s1: fmtEst(adf.stat, 3),
            s2: fmtP(adf.p),
            s3: adf.lags,
            s4: testReading(adf.p, level, copy('la radice unitaria è rifiutata'), copy('la radice unitaria non è rifiutata')),
          }),
          copy('KPSS sul livello: statistica {s1}, p = {s2}. {s3}.', {
            s1: fmtEst(kpss.stat, 3),
            s2: fmtP(kpss.p),
            s3: testReading(kpss.p, level, copy('la stazionarietà è rifiutata'), copy('la stazionarietà non è rifiutata')),
          }),
          copy('Phillips–Perron: statistica {s1}, p = {s2}. {s3}.', {
            s1: fmtEst(pp.stat, 3),
            s2: fmtP(pp.p),
            s3: testReading(pp.p, level, copy('la radice unitaria è rifiutata'), copy('la radice unitaria non è rifiutata')),
          }),
        ],
      },
      {
        heading: copy('Cosa fare'),
        body: [
          stationary
            ? copy('ADF/PP rifiutano e KPSS non rifiuta: la serie è compatibile con la stazionarietà e può essere modellata sui livelli.')
            : copy('I test non convergono sulla stessa conclusione: valuta differenziazione, trend deterministico e cambi strutturali prima di scegliere il modello.'),
          copy('Se la serie è I(1), la prima differenza è di solito I(0); per più serie I(1) si può passare a un VECM se esiste cointegrazione.'),
        ],
      },
    ],
    limitations: [
      copy('ADF e PP hanno scarsa potenza su serie corte e possono confondere un trend deterministico con una radice unitaria.'),
      copy('KPSS è sensibile alla scelta della finestra di Newey–West.'),
      copy('I test non identificano da soli il modello: la decisione va presa con grafici, teoria e diagnostica dei residui.'),
      copy('Cambi strutturali e outlier possono alterare la conclusione.'),
    ],
  };
};

export const spectralReport = (tables: TableSpec[], result: SpectralSummary): ReportSpec => {
  const summary = tableById(tables, 'spectral-summary')?.rows ?? [];
  const value = (name: string): number =>
    Number(summary.find(row => sourceOf(String(row.metric)) === sourceOf(name))?.value ?? NaN);
  const peakPeriod = value(copy('Periodo di picco'));
  const significant = Number.isFinite(result.fisher.p) && result.fisher.p < 0.05;
  return {
    id: 'timeseries',
    title: copy('Report di lettura'),
    headline: copy('Spettro: picco al periodo {s1} (Fisher g = {s2}).', {
      s1: fmtEst(peakPeriod, 2),
      s2: fmtEst(result.fisher.g, 3),
    }),
    badge: copy('Serie storica'),
    tone: significant ? 'positive' : 'neutral',
    intro: [
      copy('L’analisi spettrale scompone la variabilità della serie per frequenza: i picchi indicano i cicli che ritornano con regolarità.'),
      significant
        ? copy('Il test di Fisher rifiuta l’ipotesi di rumore bianco: c’è una componente periodica dominante.')
        : copy('Il test di Fisher non rifiuta l’ipotesi di rumore bianco: il picco è compatibile con la variabilità casuale.'),
    ],
    sections: [
      {
        heading: copy('Frequenze e periodi'),
        body: [
          copy('Il picco cade alla frequenza {s1}, cioè a un periodo di {s2} osservazioni.', {
            s1: fmtEst(result.fisher.frequency, 4),
            s2: fmtEst(result.fisher.period, 2),
          }),
          copy('Con dati mensili un periodo di 12 corrisponde a un ciclo annuale; con dati trimestrali il ciclo annuale è 4.'),
          copy('La curva AR smussata (ordine {s1}) riassume lo spettro con un processo autoregressivo stimato.', {
            s1: result.ar?.order ?? '—',
          }),
        ],
      },
      {
        heading: copy('Come usare lo spettro'),
        body: [
          copy('Un picco netto giustifica un modello stagionale o un termine sinusoidale alla frequenza corrispondente.'),
          copy('Uno spettro piatto è coerente con rumore bianco: non c’è ciclicità da modellare.'),
          copy('Il periodogramma grezzo è rumoroso; la versione smussata con finestra Daniell di larghezza {s1} è più stabile.', {
            s1: result.span,
          }),
        ],
      },
    ],
    limitations: [
      copy('Il periodogramma assume stazionarietà: trend e cambi di regime spargono potenza su molte frequenze e possono mascherare i cicli.'),
      copy('La risoluzione in frequenza dipende dalla lunghezza della serie: con N osservazioni la distanza minima è 1/N.'),
      copy('La finestra di smoothing è una scelta: finestre più larghe riducono il rumore ma allargano i picchi.'),
      copy('La significatività di Fisher riguarda un singolo picco in rumore bianco, non una periodicità con ampiezza o fase variabili.'),
    ],
  };
};
