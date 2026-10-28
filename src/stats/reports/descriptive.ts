import type { ReportSection, ReportSpec, TableRow, TableSpec } from './shared';
import {
  P_SENTENCE, alphaOf, alphaText, ciSentence, describeP, fmtCI, fmtEst, fmtP,
  interpretD, interpretEta, interpretPhi, interpretR, isDecided, num, rowBy,
  rowLike, rowsOf, show, showCI, showInt, subtitleOf, tableById, text,
} from './shared';

export const descriptiveReport = (tables: TableSpec[], level: number): ReportSpec => {
  const location = rowsOf(tables, 'desc-location');
  const dispersion = rowsOf(tables, 'desc-dispersion');
  const shape = rowsOf(tables, 'desc-shape');
  const bullets: string[] = [];
  let nonNormal = 0;
  let withOutliers = 0;
  let largestN = 0;

  location.forEach(loc => {
    const name = text(loc, 'variable');
    const disp = rowBy(dispersion, 'variable', name);
    const shp = rowBy(shape, 'variable', name);

    const nObs = num(loc, 'n');
    const missing = num(loc, 'missing');
    const mean = num(loc, 'mean');
    const median = num(loc, 'median');
    const lo = num(loc, 'ciLo');
    const hi = num(loc, 'ciHi');
    const sd = num(disp, 'sd');
    const cv = num(disp, 'cv');
    const outliers = num(disp, 'outliers');
    const outliersPct = num(disp, 'outliersPct');
    const skew = num(shp, 'skew');
    const jbP = num(shp, 'jbP');
    const ksP = num(shp, 'ksP');
    const k2P = num(shp, 'k2P');

    if (Number.isFinite(nObs)) largestN = Math.max(largestN, nObs);

    const pieces: string[] = [`n = ${showInt(nObs)}`];
    if (Number.isFinite(missing) && missing > 0) pieces.push(`${showInt(missing)} mancanti`);
    if (Number.isFinite(mean)) pieces.push(`media ${show(mean, 2)} (CI ${level}% ${showCI(lo, hi, 2)})`);
    if (Number.isFinite(median)) pieces.push(`mediana ${show(median, 2)}`);
    if (Number.isFinite(sd)) pieces.push(`SD ${show(sd, 2)}`);
    if (Number.isFinite(cv)) pieces.push(`CV ${show(cv, 1)}%`);
    if (Number.isFinite(outliers)) pieces.push(`${showInt(outliers)} valori anomali (${show(outliersPct, 1)}%)`);

    const tests = [jbP, ksP, k2P].filter(value => Number.isFinite(value));
    const rejected = tests.some(value => value < alphaOf(level));
    if (rejected) nonNormal += 1;
    if (Number.isFinite(outliers) && outliers > 0) withOutliers += 1;

    const asymmetry = !Number.isFinite(skew)
      ? 'asimmetria non disponibile'
      : Math.abs(skew) < 0.5
        ? `asimmetria ${show(skew, 2)}, praticamente simmetrica`
        : skew > 0
          ? `asimmetria ${show(skew, 2)}, coda a destra`
          : `asimmetria ${show(skew, 2)}, coda a sinistra`;

    const normality =
      tests.length === 0
        ? 'test di normalità non calcolabili con questo campione'
        : rejected
          ? `normalità rifiutata (JB ${describeP(jbP)}, Lilliefors ${describeP(ksP)}, K² ${describeP(k2P)})`
          : `normalità non rifiutata (JB ${describeP(jbP)}, Lilliefors ${describeP(ksP)}, K² ${describeP(k2P)})`;

    bullets.push(`${name}: ${pieces.join(' · ')}. Distribuzione: ${asymmetry}; ${normality}.`);
  });

  const k = location.length;
  const clean = nonNormal === 0 && withOutliers === 0;
  const headline =
    k === 0
      ? 'Nessuna variabile numerica valida: non c’è nulla da riassumere.'
      : clean
        ? `Quadro regolare: ${k} ${k === 1 ? 'variabile analizzata' : 'variabili analizzate'} (fino a ${largestN} osservazioni), distribuzioni compatibili con la gaussiana e nessun valore anomalo.`
        : `Da leggere con cautela: ${nonNormal} di ${k} ${k === 1 ? 'variabile si discosta' : 'variabili si discostano'} dalla gaussiana e ${withOutliers} ${withOutliers === 1 ? 'contiene' : 'contengono'} valori anomali oltre 1.5 IQR.`;

  return {
    id: 'report-descriptive',
    title: 'Report di lettura — Statistiche descrittive',
    headline,
    badge: k === 0 ? 'Dati insufficienti' : clean ? 'Dati regolari' : 'Da verificare',
    tone: k === 0 ? 'caution' : clean ? 'positive' : 'caution',
    intro: [
      'Questa analisi non verifica ipotesi: fotografa ogni variabile per capire dove sta il centro dei dati, quanto sono dispersi e che forma ha la distribuzione.',
      'Serve a scegliere i test successivi: se media e mediana coincidono e la forma è simmetrica i test parametrici sono adatti; in presenza di asimmetria o valori anomali conviene affiancarli a quelli non parametrici.',
    ],
    sections: [
      { heading: 'Risultato variabile per variabile', bullets },
      {
        heading: 'Come leggere i numeri',
        bullets: [
          'Media e mediana: la media è il baricentro e risente degli estremi, la mediana è il valore centrale e resta stabile. Se differiscono molto, la distribuzione è asimmetrica.',
          ciSentence(level),
          'SD (deviazione standard) misura la dispersione nella stessa unità dei dati; il CV (SD/media) la rende confrontabile tra variabili con scale diverse. IQR e MAD sono alternative robuste agli outlier.',
          'Valori anomali: sono le osservazioni oltre 1.5 × IQR dalle cerniere (regola di Tukey). Controlla se sono errori di inserimento o casi reali da mantenere.',
          `Test di normalità: p ≥ ${alphaText(level)} significa dati compatibili con una gaussiana, p < ${alphaText(level)} la esclude. Con molti dati anche scostamenti irrilevanti diventano significativi: guarda anche istogramma e Q-Q.`,
        ],
      },
      {
        heading: 'Cosa fare adesso',
        bullets: [
          'Due gruppi indipendenti: t-test di Welch, oppure Mann–Whitney U se la normalità è rifiutata.',
          'Misure ripetute sulle stesse righe: t-test appaiato o Wilcoxon signed-rank.',
          'Tre o più gruppi: ANOVA a una via con post-hoc, oppure Kruskal–Wallis.',
          'Relazione tra variabili: correlazione; per prevedere una variabile da altre, regressione lineare.',
        ],
      },
    ],
    limitations: [
      'Le descrittive non dimostrano relazioni causali né differenze tra gruppi: sono una fotografia del campione.',
      'Le celle vuote o non numeriche vengono escluse variabile per variabile, quindi gli N possono differire tra colonne.',
      'Con pochi dati i test di normalità hanno scarsa potenza; con molti dati sono iper-sensibili.',
    ],
  };
};
