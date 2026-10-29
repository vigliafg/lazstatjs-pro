import type { ReportSection, ReportSpec, TableRow, TableSpec } from './shared';
import { copy } from '../reportCopy';
import {
  P_SENTENCE, alphaOf, alphaText, ciSentence, describeP, fmtCI, fmtEst, fmtP,
  interpretD, interpretEta, interpretPhi, interpretR, isDecided, num, rowBy,
  rowLike, rowsOf, show, showCI, showInt, subtitleOf, tableById, text,
} from './shared';

export interface AnovaReportInput {
  tables: TableSpec[];
  depName: string;
  grpName: string;
  level: number;
  postHoc: string;
  useNonParam: boolean;
}

export const anovaReport = (input: AnovaReportInput): ReportSpec => {
  const { tables, depName, grpName, level, postHoc, useNonParam } = input;
  const alpha = alphaText(level);

  const groups = rowsOf(tables, 'anova-groups');
  const between = rowLike(rowsOf(tables, 'anova-table'), 'source', 'between');
  const total = rowLike(rowsOf(tables, 'anova-table'), 'source', 'total');
  const f = num(between, 'f');
  const pValue = num(between, 'p');
  const dfBetween = num(between, 'df');
  const dfTotal = num(total, 'df');
  const dfWithin = dfTotal - dfBetween;
  const significant = isDecided(pValue, level);

  const effects = rowsOf(tables, 'anova-effects');
  const eta2 = num(rowBy(effects, 'measure', 'η²'), 'estimate');
  const omega2 = num(rowBy(effects, 'measure', 'ω²'), 'estimate');

  const assumptions = rowsOf(tables, 'anova-assumptions');
  const leveneP = num(rowLike(assumptions, 'check', 'levene'), 'p');
  const brownP = num(rowLike(assumptions, 'check', 'brown'), 'p');
  const sdRatio = num(rowLike(assumptions, 'check', copy('rapporto sd')), 'statistic');
  const welchP = num(rowLike(assumptions, 'check', 'welch'), 'p');

  const posthocRows = rowsOf(tables, 'anova-posthoc');
  const kruskal = rowsOf(tables, 'anova-kruskal')[0];
  const kruskalP = num(kruskal, 'p');
  const kruskalEta = num(kruskal, 'etaH');

  const headline = !Number.isFinite(pValue)
    ? copy('L’ANOVA non è calcolabile con i dati disponibili.')
    : significant
      ? copy('Le medie di {s1} differiscono tra i gruppi di {s2}: F = {s3}, {s4} (soglia α = {s5}){s6}.', { s1: depName, s2: grpName, s3: show(f, 3), s4: describeP(pValue), s5: alpha, s6: Number.isFinite(eta2) ? copy(', η² = {s1} (effetto {s2})', { s1: show(eta2, 3), s2: interpretEta(eta2) }) : '' })
      : copy('Non emerge una differenza tra le medie di {s1} nei gruppi di {s2}: F = {s3}, {s4} (soglia α = {s5}).', { s1: depName, s2: grpName, s3: show(f, 3), s4: describeP(pValue), s5: alpha });

  const groupBullets = groups.map(group => {
    const label = text(group, 'group');
    return copy('{s1}: n = {s2}, media {s3} (CI {s4}% {s5}), mediana {s6}, SD {s7}.', { s1: label, s2: showInt(num(group, 'n')), s3: show(num(group, 'mean'), 2), s4: level, s5: showCI(num(group, 'ciLo'), num(group, 'ciHi'), 2), s6: show(num(group, 'median'), 2), s7: show(num(group, 'sd'), 2) });
  });

  const posthocBullets = posthocRows.map(row => {
    const comparison = text(row, 'comparison');
    const pAdj = num(row, 'pAdj');
    const d = num(row, 'd');
    return copy('{s1}: differenza {s2}, {s3} → {s4}{s5}.', { s1: comparison, s2: show(num(row, 'diff'), 3), s3: describeP(pAdj, copy('p corretto')), s4: isDecided(pAdj, level) ? copy('differenza significativa') : copy('nessuna differenza affidabile'), s5: Number.isFinite(d) ? copy('; Cohen’s d = {s1} ({s2})', { s1: show(d, 2), s2: interpretD(d) }) : '' });
  });

  const sections: ReportSection[] = [
    { heading: copy('Medie dei gruppi'), bullets: groupBullets },
    {
      heading: copy('Il test principale'),
      bullets: [
        copy('Statistica F = {s1} con df = ({s2}, {s3}).', { s1: show(f, 3), s2: show(dfBetween, 0), s3: showInt(dfWithin) }),
        copy('{s1} (soglia α = {s2}).', { s1: describeP(pValue, 'p-value'), s2: alpha }),
        significant
          ? copy('Almeno una media di gruppo è diversa dalle altre: l’ipotesi nulla di medie tutte uguali viene rifiutata.')
          : copy('L’ipotesi nulla di medie tutte uguali non viene rifiutata: i dati non mostrano differenze affidabili tra i gruppi.'),
        copy('Varianza spiegata dai gruppi: η² = {s1}, cioè circa il {s2}% della variabilità totale di {s3}.', { s1: show(eta2, 3), s2: show(eta2 * 100, 1), s3: depName }),
        Number.isFinite(omega2) ? copy('ω² = {s1}: stima meno distorta della quota di varianza spiegata nella popolazione.', { s1: show(omega2, 3) }) : '',
      ].filter(Boolean),
    },
  ];

  if (posthocRows.length > 0) {
    sections.push({
      heading: copy('Confronti post-hoc ({s1})', { s1: postHoc }),
      body: [
        copy('L’ANOVA dice solo che i gruppi non sono tutti uguali: per sapere quali coppie differiscono servono i confronti a coppie, con p già corretti per il numero di confronti.'),
      ],
      bullets: posthocBullets,
    });
  }

  sections.push({
    heading: copy('Assunzioni e robustezza'),
    bullets: [
      Number.isFinite(leveneP)
        ? copy('Omoschedasticità: Levene {s1}{s2} → {s3}.', { s1: describeP(leveneP), s2: Number.isFinite(brownP) ? copy(', Brown–Forsythe {s1}', { s1: describeP(brownP) }) : '', s3: leveneP < alphaOf(level) ? copy('varianze non omogenee, quindi l’ANOVA classica è a rischio e conviene usare Welch o Kruskal–Wallis') : copy('assunzione di varianze uguali plausibile') })
        : copy('Omoschedasticità non verificabile con questi dati.'),
      Number.isFinite(sdRatio) ? copy('Rapporto tra SD massima e minima: {s1} (valori molto sopra 2 indicano gruppi con dispersione diversa).', { s1: show(sdRatio, 2) }) : '',
      Number.isFinite(welchP) ? copy('Welch ANOVA: {s1} → {s2}.', { s1: describeP(welchP), s2: isDecided(welchP, level) ? copy('conferma la differenza tra le medie anche senza assumere varianze uguali') : copy('non conferma la differenza quando le varianze sono libere di differire') }) : '',
      copy('I gruppi dovrebbero provenire da osservazioni indipendenti: la stessa unità non deve comparire in due gruppi.'),
    ].filter(Boolean),
  });

  if (useNonParam && kruskal) {
    sections.push({
      heading: copy('Alternativa non parametrica'),
      bullets: [
        copy('Kruskal–Wallis: H = {s1} con df = {s2}, {s3} → {s4}.', { s1: show(num(kruskal, 'h'), 3), s2: showInt(num(kruskal, 'df')), s3: describeP(kruskalP), s4: isDecided(kruskalP, level) ? copy('conferma che almeno un gruppo si distribuisce diversamente') : copy('non conferma differenze tra i gruppi') }),
        Number.isFinite(kruskalEta) ? copy('η²_H = {s1}: dimensione dell’effetto stimata sui ranghi.', { s1: show(kruskalEta, 3) }) : '',
        copy('Confronta i due esiti: se divergono, il risultato parametrico dipende dall’assunzione di normalità e va presentato con maggiore prudenza.'),
      ].filter(Boolean),
    });
  }

  sections.push({
    heading: copy('Come leggere i numeri'),
    bullets: [
      P_SENTENCE,
      copy('F confronta la variabilità tra i gruppi con quella dentro i gruppi: valori vicini a 1 indicano che i gruppi non si distinguono.'),
      copy('η² (eta quadro) è la quota di variabilità spiegata dal fattore: 0.01 piccolo, 0.06 medio, 0.14 grande.'),
      copy('I p post-hoc sono già corretti: usali al posto dei p dei singoli t-test, che sarebbero troppo ottimisti.'),
    ],
  });

  sections.push({
    heading: copy('In pratica'),
    body: [
      significant
        ? copy('Il fattore {s1} spiega una parte {s2} della variabilità di {s3}. Per capire quali gruppi si distinguono, leggi i confronti post-hoc qui sopra.', { s1: grpName, s2: Number.isFinite(eta2) ? interpretEta(eta2) : copy('non quantificabile'), s3: depName })
        : copy('Non ci sono prove sufficienti che {s1} sposti {s2}. Con gruppi piccoli l’ANOVA ha poca potenza: l’assenza di significatività non equivale all’assenza di effetto.', { s1: grpName, s2: depName }),
    ],
  });

  return {
    id: 'report-anova',
    title: copy('Report di lettura — ANOVA a una via'),
    headline,
    badge: significant ? copy('Gruppi diversi') : copy('Nessuna differenza'),
    tone: significant ? 'caution' : 'neutral',
    intro: [
      copy('Verifica se la media di {s1} cambia tra i livelli del fattore {s2}. L’ipotesi nulla è che tutte le medie dei gruppi siano uguali.', { s1: depName, s2: grpName }),
      copy('L’ANOVA confronta la variabilità tra i gruppi con quella interna ai gruppi: se i gruppi differiscono davvero, la prima è grande rispetto alla seconda.'),
    ],
    sections,
    limitations: [
      copy('L’ANOVA richiede osservazioni indipendenti: misure ripetute sulla stessa unità richiedono un modello per dati appaiati.'),
      copy('Con gruppi molto sbilanciati o varianze molto diverse il test classico può dare p inaffidabili: usa Welch ANOVA o Kruskal–Wallis.'),
      copy('La significatività globale non dice quali gruppi differiscono: servono sempre i confronti post-hoc.'),
    ],
  };
};
