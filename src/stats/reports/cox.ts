import { fmtEst, fmtP } from '../format';
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

  const value = (name: string): number => Number(summary.find(row => String(row.metric) === name)?.raw ?? NaN);
  const n = value('Osservazioni');
  const events = value('Eventi');
  const concordance = value('Concordanza (C di Harrell)');
  const lrRow = tests.find(row => String(row.test).includes('verosimiglianza'));
  const lr = Number(lrRow?.statistic ?? NaN);
  const lrP = Number(lrRow?.p ?? NaN);
  const significant = isDecided(lrP, level);

  const phGlobalRow = phRows.find(row => String(row.term) === 'Globale');
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
    if (!Number.isFinite(hr)) return `${String(row.term)}: stima non disponibile.`;
    if (
      !Number.isFinite(se) ||
      se > 8 ||
      Math.abs(Number(row.beta)) > 8 ||
      hr < 1e-3 ||
      hr > 1e3
    ) {
      return `${String(row.term)}: stima instabile (B = ${fmtEst(Number(row.beta), 3)}, errore standard = ${fmtEst(se, 3)}), coerente con separazione quasi completa: l’hazard ratio non è interpretabile.`;
    }
    const direction = hr > 1 ? 'aumenta' : hr < 1 ? 'riduce' : 'non modifica';
    return `${String(row.term)}: HR = ${fmtEst(hr, 3)} (${fmtEst(Number(row.lo), 3)} – ${fmtEst(Number(row.hi), 3)}), ${describeP(p)} → ${isDecided(p, level) ? `un aumento di una unità ${direction} il rischio istantaneo di evento` : 'nessuna associazione affidabile con il rischio'}${Number.isFinite(Number(row.beta)) ? `; B = ${fmtEst(Number(row.beta), 3)}` : ''}.`;
  };

  return {
    id: 'cox',
    title: 'Report di lettura — Regressione di Cox',
    headline: separation
      ? `Stime instabili: ${strongestName} separa quasi completamente gli eventi, quindi l’hazard ratio (B = ${fmtEst(Number(strongest?.beta), 3)}) non è interpretabile.`
      : Number.isFinite(lrP)
        ? significant
          ? `Il modello è significativo (LR χ² = ${fmtEst(lr, 3)}, ${describeP(lrP)}) e la covariata più forte è ${strongestName} (HR = ${fmtEst(strongestHr, 3)}).`
          : `Il modello non è significativo (LR χ² = ${fmtEst(lr, 3)}, ${describeP(lrP)}): le covariariate non spiegano i tempi di evento meglio del caso.`
        : 'Il modello di Cox non è stimabile con i dati disponibili.',
    badge: separation ? 'Stime instabili' : significant ? 'Effetto rilevato' : 'Nessun effetto',
    tone: separation || phBroken ? 'caution' : significant ? 'positive' : 'neutral',
    intro: [
      `La regressione di Cox mette in relazione il tempo fino all’evento con una o più covariariate, senza assumere una forma specifica per il rischio di base.${Number.isFinite(n) ? ` Qui ci sono ${Math.round(n)} osservazioni, ${Math.round(events)} eventi e ${Math.round(n - events)} censurati.` : ''}`,
      'L’hazard ratio confronta il rischio istantaneo di evento per un incremento unitario della covariata, a parità delle altre: HR = 2 significa rischio doppio in ogni istante, non durata doppia.',
    ],
    sections: [
      {
        heading: 'Il modello nel suo insieme',
        bullets: [
          `Rapporto di verosimiglianza: χ² = ${fmtEst(lr, 3)} con ${Math.round(Number(lrRow?.df ?? NaN)) || 1} gradi di libertà, ${describeP(lrP)} (soglia α = ${(1 - level / 100).toFixed(2)}).`,
          `Concordanza C = ${fmtEst(concordance, 3)}: ${Number.isFinite(concordance) ? (concordance < 0.5 ? 'peggio del caso, controlla i segni' : concordance < 0.6 ? 'discriminazione modesta' : concordance < 0.7 ? 'discriminazione discreta' : 'buona capacità di ordinare i tempi') : 'non calcolabile'}.`,
          `Eventi per covariata: ${fmtEst(value('Eventi per covariata'), 1)}. Sotto 10 le stime diventano fragili e il modello può essere sovra-adattato.`,
          `AIC = ${fmtEst(value('AIC'), 3)}: utile solo per confrontare modelli stimati sugli stessi dati.`,
        ],
      },
      {
        heading: 'Ogni covariata',
        bullets:
          coefficients.length > 0
            ? coefficients.map(hazardSentence)
            : ['Nessun coefficiente disponibile.'],
      },
      {
        heading: 'Rischi proporzionali',
        body: [
          phBroken
            ? `Il test globale dà ${describeP(phP)}: l’effetto di almeno una covariata sembra cambiare nel tempo. Il modello resta una sintesi media, ma HR unico e curve di sopravvivenza previste vanno presentati con prudenza; valuta interazioni con il tempo o modelli stratificati.`
            : `Il test globale dà ${describeP(phP)}: non emerge un cambiamento dell’effetto nel tempo, quindi l’ipotesi di rischi proporzionali è compatibile con i dati.`,
          'Il test confronta il modello con uno che aggiunge covariata × log(t): un p piccolo segnala che l’effetto non è costante.',
        ],
      },
      {
        heading: 'Come leggere i numeri',
        bullets: [
          'HR = 1: nessun effetto. HR > 1: rischio maggiore per valori più alti della covariata. HR < 1: effetto protettivo.',
          'IC dell’HR che non contiene 1 è coerente con un test di Wald significativo; l’intervallo è moltiplicativo, quindi 0,5 e 2 sono effetti simmetrici.',
          'I censurati restano a rischio finché sono osservati: Cox usa questa informazione, mentre scartarli o trattarli come eventi distorce le stime.',
          'La C di Harrell misura l’ordinamento dei tempi, non la calibrazione: un modello può ordinare bene e sbagliare le probabilità assolute.',
        ],
      },
      {
        heading: 'In pratica',
        body: [
          separation
            ? 'La stima è al limite della regione ammissibile: una covariata predice quasi perfettamente chi ha l’evento. Il coefficiente e l’hazard ratio non vanno riportati come effetto; riduci le covariariate del modello, controlla se la variabile è una conseguenza dell’esito o usa un test esatto.'
            : significant
              ? `Il profilo di rischio cambia con ${strongestName}: per ogni unità in più l’hazard ratio è ${fmtEst(strongestHr, 3)}. Riporta sempre l’IC e il numero di eventi, e verifica se l’effetto è stabile nei sottogruppi.`
              : 'Le covariariate non mostrano un’associazione affidabile con il tempo di evento. Con pochi eventi il modello ha poca potenza: l’assenza di significatività non dimostra l’assenza di effetto.',
        ],
      },
    ],
    limitations: [
      'I tempi di evento uguali sono gestiti con l’approssimazione di Breslow, che con molti pareggi può sottostimare lievemente gli errori standard.',
      'I rischi proporzionali sono un’assunzione del modello: il test riportato è asintotico e con pochi eventi ha poca potenza.',
      'La relazione tra covariata e log-rischio è assunta lineare: per effetti non lineari servono trasformazioni o spline.',
      'Non sono inclusi covariariate dipendenti dal tempo, effetti casuali, stratificazione o rischi competitivi.',
      'La sopravvivenza di base è valutata al profilo medio delle covariariate e può non corrispondere a un soggetto reale.',
    ],
  };
};
