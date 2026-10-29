import type { ReportSection, ReportSpec, TableRow, TableSpec } from './shared';
import { copy } from '../reportCopy';
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

    const pieces: string[] = [copy('n = {s1}', { s1: showInt(nObs) })];
    if (Number.isFinite(missing) && missing > 0) pieces.push(copy('{s1} mancanti', { s1: showInt(missing) }));
    if (Number.isFinite(mean)) pieces.push(copy('media {s1} (CI {s2}% {s3})', { s1: show(mean, 2), s2: level, s3: showCI(lo, hi, 2) }));
    if (Number.isFinite(median)) pieces.push(copy('mediana {s1}', { s1: show(median, 2) }));
    if (Number.isFinite(sd)) pieces.push(copy('SD {s1}', { s1: show(sd, 2) }));
    if (Number.isFinite(cv)) pieces.push(copy('CV {s1}%', { s1: show(cv, 1) }));
    if (Number.isFinite(outliers)) pieces.push(copy('{s1} valori anomali ({s2}%)', { s1: showInt(outliers), s2: show(outliersPct, 1) }));

    const tests = [jbP, ksP, k2P].filter(value => Number.isFinite(value));
    const rejected = tests.some(value => value < alphaOf(level));
    if (rejected) nonNormal += 1;
    if (Number.isFinite(outliers) && outliers > 0) withOutliers += 1;

    const asymmetry = !Number.isFinite(skew)
      ? copy('asimmetria non disponibile')
      : Math.abs(skew) < 0.5
        ? copy('asimmetria {s1}, praticamente simmetrica', { s1: show(skew, 2) })
        : skew > 0
          ? copy('asimmetria {s1}, coda a destra', { s1: show(skew, 2) })
          : copy('asimmetria {s1}, coda a sinistra', { s1: show(skew, 2) });

    const normality =
      tests.length === 0
        ? copy('test di normalità non calcolabili con questo campione')
        : rejected
          ? copy('normalità rifiutata (JB {s1}, Lilliefors {s2}, K² {s3})', { s1: describeP(jbP), s2: describeP(ksP), s3: describeP(k2P) })
          : copy('normalità non rifiutata (JB {s1}, Lilliefors {s2}, K² {s3})', { s1: describeP(jbP), s2: describeP(ksP), s3: describeP(k2P) });

    bullets.push(copy('{s1}: {s2}. Distribuzione: {s3}; {s4}.', { s1: name, s2: pieces.join(' · '), s3: asymmetry, s4: normality }));
  });

  const k = location.length;
  const clean = nonNormal === 0 && withOutliers === 0;
  const headline =
    k === 0
      ? copy('Nessuna variabile numerica valida: non c’è nulla da riassumere.')
      : clean
        ? copy('Quadro regolare: {s1} {s2} (fino a {s3} osservazioni), distribuzioni compatibili con la gaussiana e nessun valore anomalo.', { s1: k, s2: k === 1 ? copy('variabile analizzata') : copy('variabili analizzate'), s3: largestN })
        : copy('Da leggere con cautela: {s1} di {s2} {s3} dalla gaussiana e {s4} {s5} valori anomali oltre 1.5 IQR.', { s1: nonNormal, s2: k, s3: k === 1 ? copy('variabile si discosta') : copy('variabili si discostano'), s4: withOutliers, s5: withOutliers === 1 ? 'contiene' : 'contengono' });

  return {
    id: 'report-descriptive',
    title: copy('Report di lettura — Statistiche descrittive'),
    headline,
    badge: k === 0 ? copy('Dati insufficienti') : clean ? copy('Dati regolari') : copy('Da verificare'),
    tone: k === 0 ? 'caution' : clean ? 'positive' : 'caution',
    intro: [
      copy('Questa analisi non verifica ipotesi: fotografa ogni variabile per capire dove sta il centro dei dati, quanto sono dispersi e che forma ha la distribuzione.'),
      copy('Serve a scegliere i test successivi: se media e mediana coincidono e la forma è simmetrica i test parametrici sono adatti; in presenza di asimmetria o valori anomali conviene affiancarli a quelli non parametrici.'),
    ],
    sections: [
      { heading: copy('Risultato variabile per variabile'), bullets },
      {
        heading: copy('Come leggere i numeri'),
        bullets: [
          copy('Media e mediana: la media è il baricentro e risente degli estremi, la mediana è il valore centrale e resta stabile. Se differiscono molto, la distribuzione è asimmetrica.'),
          ciSentence(level),
          copy('SD (deviazione standard) misura la dispersione nella stessa unità dei dati; il CV (SD/media) la rende confrontabile tra variabili con scale diverse. IQR e MAD sono alternative robuste agli outlier.'),
          copy('Valori anomali: sono le osservazioni oltre 1.5 × IQR dalle cerniere (regola di Tukey). Controlla se sono errori di inserimento o casi reali da mantenere.'),
          copy('Test di normalità: p ≥ {s1} significa dati compatibili con una gaussiana, p < {s2} la esclude. Con molti dati anche scostamenti irrilevanti diventano significativi: guarda anche istogramma e Q-Q.', { s1: alphaText(level), s2: alphaText(level) }),
        ],
      },
      {
        heading: copy('Cosa fare adesso'),
        bullets: [
          copy('Due gruppi indipendenti: t-test di Welch, oppure Mann–Whitney U se la normalità è rifiutata.'),
          copy('Misure ripetute sulle stesse righe: t-test appaiato o Wilcoxon signed-rank.'),
          copy('Tre o più gruppi: ANOVA a una via con post-hoc, oppure Kruskal–Wallis.'),
          copy('Relazione tra variabili: correlazione; per prevedere una variabile da altre, regressione lineare.'),
        ],
      },
    ],
    limitations: [
      copy('Le descrittive non dimostrano relazioni causali né differenze tra gruppi: sono una fotografia del campione.'),
      copy('Le celle vuote o non numeriche vengono escluse variabile per variabile, quindi gli N possono differire tra colonne.'),
      copy('Con pochi dati i test di normalità hanno scarsa potenza; con molti dati sono iper-sensibili.'),
    ],
  };
};
