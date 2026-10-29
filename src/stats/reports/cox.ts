import { fmtEst, fmtP } from '../format';
import { copy, sourceOf } from '../reportCopy';
import { describeP, isDecided, tableById } from '../reportKit';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';

export const coxReport = (tables: TableSpec[], level: number): ReportSpec => {
  const summary = tableById(tables, 'cox-summary')?.rows ?? [];
  const coefficients = tableById(tables, 'cox-coefficients')?.rows ?? [];
  const separation = coefficients.some(row => {
    const se = Number(row.se);
    const beta = Number(row.beta);
    const hr = Number(row.hr);
    return !Number.isFinite(se) || se > 8 || Math.abs(beta) > 8 || hr < 1e-3 || hr > 1e3;
  });
  const tests = tableById(tables, 'cox-tests')?.rows ?? [];
  const phRows = tableById(tables, 'cox-ph')?.rows ?? [];

  const value = (name: string): number => Number(summary.find(row => sourceOf(String(row.metric)) === name)?.raw ?? NaN);
  const n = value('Osservazioni');
  const events = value('Eventi');
  const concordance = value(copy('Concordanza (C di Harrell)'));
  const lrRow = tests.find(row => sourceOf(String(row.test)).includes('verosimiglianza'));
  const lr = Number(lrRow?.statistic ?? NaN);
  const lrP = Number(lrRow?.p ?? NaN);
  const significant = isDecided(lrP, level);

  const phGlobalRow = phRows.find(row => sourceOf(String(row.term)) === 'Globale');
  const phP = Number(phGlobalRow?.p ?? NaN);
  const phBroken = isDecided(phP, level);

  const strongest = coefficients
    .slice()
    .sort((left, right) => Math.abs(Number(right.z ?? 0)) - Math.abs(Number(left.z ?? 0)))[0];
  const strongestName = strongest ? String(strongest.term) : '';
  const strongestHr = Number(strongest?.hr ?? NaN);

  const hazardSentence = (row: (typeof coefficients)[number]): string => {
    const hr = Number(row.hr);
    const p = Number(row.p);
    const se = Number(row.se);
    if (!Number.isFinite(hr)) return copy('{s1}: stima non disponibile.', { s1: String(row.term) });
    if (
      !Number.isFinite(se) ||
      se > 8 ||
      Math.abs(Number(row.beta)) > 8 ||
      hr < 1e-3 ||
      hr > 1e3
    ) {
      return copy('{s1}: stima instabile (B = {s2}, errore standard = {s3}), coerente con separazione quasi completa: l’hazard ratio non è interpretabile.', { s1: String(row.term), s2: fmtEst(Number(row.beta), 3), s3: fmtEst(se, 3) });
    }
    const direction = hr > 1 ? 'aumenta' : hr < 1 ? 'riduce' : copy('non modifica');
    return copy('{s1}: HR = {s2} ({s3} – {s4}), {s5} → {s6}{s7}.', { s1: String(row.term), s2: fmtEst(hr, 3), s3: fmtEst(Number(row.lo), 3), s4: fmtEst(Number(row.hi), 3), s5: describeP(p), s6: isDecided(p, level) ? copy('un aumento di una unità {s1} il rischio istantaneo di evento', { s1: direction }) : copy('nessuna associazione affidabile con il rischio'), s7: Number.isFinite(Number(row.beta)) ? copy('; B = {s1}', { s1: fmtEst(Number(row.beta), 3) }) : '' });
  };

  return {
    id: 'cox',
    title: copy('Report di lettura — Regressione di Cox'),
    headline: separation
      ? copy('Stime instabili: {s1} separa quasi completamente gli eventi, quindi l’hazard ratio (B = {s2}) non è interpretabile.', { s1: strongestName, s2: fmtEst(Number(strongest?.beta), 3) })
      : Number.isFinite(lrP)
        ? significant
          ? copy('Il modello è significativo (LR χ² = {s1}, {s2}) e la covariata più forte è {s3} (HR = {s4}).', { s1: fmtEst(lr, 3), s2: describeP(lrP), s3: strongestName, s4: fmtEst(strongestHr, 3) })
          : copy('Il modello non è significativo (LR χ² = {s1}, {s2}): le covariariate non spiegano i tempi di evento meglio del caso.', { s1: fmtEst(lr, 3), s2: describeP(lrP) })
        : copy('Il modello di Cox non è stimabile con i dati disponibili.'),
    badge: separation ? copy('Stime instabili') : significant ? copy('Effetto rilevato') : copy('Nessun effetto'),
    tone: separation || phBroken ? 'caution' : significant ? 'positive' : 'neutral',
    intro: [
      copy('La regressione di Cox mette in relazione il tempo fino all’evento con una o più covariariate, senza assumere una forma specifica per il rischio di base.{s1}', { s1: Number.isFinite(n) ? copy(' Qui ci sono {s1} osservazioni, {s2} eventi e {s3} censurati.', { s1: Math.round(n), s2: Math.round(events), s3: Math.round(n - events) }) : '' }),
      copy('L’hazard ratio confronta il rischio istantaneo di evento per un incremento unitario della covariata, a parità delle altre: HR = 2 significa rischio doppio in ogni istante, non durata doppia.'),
    ],
    sections: [
      {
        heading: copy('Il modello nel suo insieme'),
        bullets: [
          copy('Rapporto di verosimiglianza: χ² = {s1} con {s2} gradi di libertà, {s3} (soglia α = {s4}).', { s1: fmtEst(lr, 3), s2: Math.round(Number(lrRow?.df ?? NaN)) || 1, s3: describeP(lrP), s4: (1 - level / 100).toFixed(2) }),
          copy('Concordanza C = {s1}: {s2}.', { s1: fmtEst(concordance, 3), s2: Number.isFinite(concordance) ? (concordance < 0.5 ? copy('peggio del caso, controlla i segni') : concordance < 0.6 ? copy('discriminazione modesta') : concordance < 0.7 ? copy('discriminazione discreta') : copy('buona capacità di ordinare i tempi')) : copy('non calcolabile') }),
          copy('Eventi per covariata: {s1}. Sotto 10 le stime diventano fragili e il modello può essere sovra-adattato.', { s1: fmtEst(value(copy('Eventi per covariata')), 1) }),
          copy('AIC = {s1}: utile solo per confrontare modelli stimati sugli stessi dati.', { s1: fmtEst(value('AIC'), 3) }),
        ],
      },
      {
        heading: copy('Ogni covariata'),
        bullets:
          coefficients.length > 0
            ? coefficients.map(hazardSentence)
            : [copy('Nessun coefficiente disponibile.')],
      },
      {
        heading: copy('Rischi proporzionali'),
        body: [
          phBroken
            ? copy('Il test globale dà {s1}: l’effetto di almeno una covariata sembra cambiare nel tempo. Il modello resta una sintesi media, ma HR unico e curve di sopravvivenza previste vanno presentati con prudenza; valuta interazioni con il tempo o modelli stratificati.', { s1: describeP(phP) })
            : copy('Il test globale dà {s1}: non emerge un cambiamento dell’effetto nel tempo, quindi l’ipotesi di rischi proporzionali è compatibile con i dati.', { s1: describeP(phP) }),
          copy('Il test confronta il modello con uno che aggiunge covariata × log(t): un p piccolo segnala che l’effetto non è costante.'),
        ],
      },
      {
        heading: copy('Come leggere i numeri'),
        bullets: [
          copy('HR = 1: nessun effetto. HR > 1: rischio maggiore per valori più alti della covariata. HR < 1: effetto protettivo.'),
          copy('IC dell’HR che non contiene 1 è coerente con un test di Wald significativo; l’intervallo è moltiplicativo, quindi 0,5 e 2 sono effetti simmetrici.'),
          copy('I censurati restano a rischio finché sono osservati: Cox usa questa informazione, mentre scartarli o trattarli come eventi distorce le stime.'),
          copy('La C di Harrell misura l’ordinamento dei tempi, non la calibrazione: un modello può ordinare bene e sbagliare le probabilità assolute.'),
        ],
      },
      {
        heading: copy('In pratica'),
        body: [
          separation
            ? copy('La stima è al limite della regione ammissibile: una covariata predice quasi perfettamente chi ha l’evento. Il coefficiente e l’hazard ratio non vanno riportati come effetto; riduci le covariariate del modello, controlla se la variabile è una conseguenza dell’esito o usa un test esatto.')
            : significant
              ? copy('Il profilo di rischio cambia con {s1}: per ogni unità in più l’hazard ratio è {s2}. Riporta sempre l’IC e il numero di eventi, e verifica se l’effetto è stabile nei sottogruppi.', { s1: strongestName, s2: fmtEst(strongestHr, 3) })
              : copy('Le covariariate non mostrano un’associazione affidabile con il tempo di evento. Con pochi eventi il modello ha poca potenza: l’assenza di significatività non dimostra l’assenza di effetto.'),
        ],
      },
    ],
    limitations: [
      copy('I tempi di evento uguali sono gestiti con l’approssimazione di Breslow, che con molti pareggi può sottostimare lievemente gli errori standard.'),
      copy('I rischi proporzionali sono un’assunzione del modello: il test riportato è asintotico e con pochi eventi ha poca potenza.'),
      copy('La relazione tra covariata e log-rischio è assunta lineare: per effetti non lineari servono trasformazioni o spline.'),
      copy('Non sono inclusi covariariate dipendenti dal tempo, effetti casuali, stratificazione o rischi competitivi.'),
      copy('La sopravvivenza di base è valutata al profilo medio delle covariariate e può non corrispondere a un soggetto reale.'),
    ],
  };
};
