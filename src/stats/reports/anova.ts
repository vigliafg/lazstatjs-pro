import type { ReportSection, ReportSpec, TableRow, TableSpec } from './shared';
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
  const sdRatio = num(rowLike(assumptions, 'check', 'rapporto sd'), 'statistic');
  const welchP = num(rowLike(assumptions, 'check', 'welch'), 'p');

  const posthocRows = rowsOf(tables, 'anova-posthoc');
  const kruskal = rowsOf(tables, 'anova-kruskal')[0];
  const kruskalP = num(kruskal, 'p');
  const kruskalEta = num(kruskal, 'etaH');

  const headline = !Number.isFinite(pValue)
    ? 'L’ANOVA non è calcolabile con i dati disponibili.'
    : significant
      ? `Le medie di ${depName} differiscono tra i gruppi di ${grpName}: F = ${show(f, 3)}, ${describeP(pValue)} (soglia α = ${alpha})${Number.isFinite(eta2) ? `, η² = ${show(eta2, 3)} (effetto ${interpretEta(eta2)})` : ''}.`
      : `Non emerge una differenza tra le medie di ${depName} nei gruppi di ${grpName}: F = ${show(f, 3)}, ${describeP(pValue)} (soglia α = ${alpha}).`;

  const groupBullets = groups.map(group => {
    const label = text(group, 'group');
    return `${label}: n = ${showInt(num(group, 'n'))}, media ${show(num(group, 'mean'), 2)} (CI ${level}% ${showCI(num(group, 'ciLo'), num(group, 'ciHi'), 2)}), mediana ${show(num(group, 'median'), 2)}, SD ${show(num(group, 'sd'), 2)}.`;
  });

  const posthocBullets = posthocRows.map(row => {
    const comparison = text(row, 'comparison');
    const pAdj = num(row, 'pAdj');
    const d = num(row, 'd');
    return `${comparison}: differenza ${show(num(row, 'diff'), 3)}, ${describeP(pAdj, 'p corretto')} → ${isDecided(pAdj, level) ? 'differenza significativa' : 'nessuna differenza affidabile'}${Number.isFinite(d) ? `; Cohen’s d = ${show(d, 2)} (${interpretD(d)})` : ''}.`;
  });

  const sections: ReportSection[] = [
    { heading: 'Medie dei gruppi', bullets: groupBullets },
    {
      heading: 'Il test principale',
      bullets: [
        `Statistica F = ${show(f, 3)} con df = (${show(dfBetween, 0)}, ${showInt(dfWithin)}).`,
        `${describeP(pValue, 'p-value')} (soglia α = ${alpha}).`,
        significant
          ? 'Almeno una media di gruppo è diversa dalle altre: l’ipotesi nulla di medie tutte uguali viene rifiutata.'
          : 'L’ipotesi nulla di medie tutte uguali non viene rifiutata: i dati non mostrano differenze affidabili tra i gruppi.',
        `Varianza spiegata dai gruppi: η² = ${show(eta2, 3)}, cioè circa il ${show(eta2 * 100, 1)}% della variabilità totale di ${depName}.`,
        Number.isFinite(omega2) ? `ω² = ${show(omega2, 3)}: stima meno distorta della quota di varianza spiegata nella popolazione.` : '',
      ].filter(Boolean),
    },
  ];

  if (posthocRows.length > 0) {
    sections.push({
      heading: `Confronti post-hoc (${postHoc})`,
      body: [
        'L’ANOVA dice solo che i gruppi non sono tutti uguali: per sapere quali coppie differiscono servono i confronti a coppie, con p già corretti per il numero di confronti.',
      ],
      bullets: posthocBullets,
    });
  }

  sections.push({
    heading: 'Assunzioni e robustezza',
    bullets: [
      Number.isFinite(leveneP)
        ? `Omoschedasticità: Levene ${describeP(leveneP)}${Number.isFinite(brownP) ? `, Brown–Forsythe ${describeP(brownP)}` : ''} → ${leveneP < alphaOf(level) ? 'varianze non omogenee, quindi l’ANOVA classica è a rischio e conviene usare Welch o Kruskal–Wallis' : 'assunzione di varianze uguali plausibile'}.`
        : 'Omoschedasticità non verificabile con questi dati.',
      Number.isFinite(sdRatio) ? `Rapporto tra SD massima e minima: ${show(sdRatio, 2)} (valori molto sopra 2 indicano gruppi con dispersione diversa).` : '',
      Number.isFinite(welchP) ? `Welch ANOVA: ${describeP(welchP)} → ${isDecided(welchP, level) ? 'conferma la differenza tra le medie anche senza assumere varianze uguali' : 'non conferma la differenza quando le varianze sono libere di differire'}.` : '',
      'I gruppi dovrebbero provenire da osservazioni indipendenti: la stessa unità non deve comparire in due gruppi.',
    ].filter(Boolean),
  });

  if (useNonParam && kruskal) {
    sections.push({
      heading: 'Alternativa non parametrica',
      bullets: [
        `Kruskal–Wallis: H = ${show(num(kruskal, 'h'), 3)} con df = ${showInt(num(kruskal, 'df'))}, ${describeP(kruskalP)} → ${isDecided(kruskalP, level) ? 'conferma che almeno un gruppo si distribuisce diversamente' : 'non conferma differenze tra i gruppi'}.`,
        Number.isFinite(kruskalEta) ? `η²_H = ${show(kruskalEta, 3)}: dimensione dell’effetto stimata sui ranghi.` : '',
        'Confronta i due esiti: se divergono, il risultato parametrico dipende dall’assunzione di normalità e va presentato con maggiore prudenza.',
      ].filter(Boolean),
    });
  }

  sections.push({
    heading: 'Come leggere i numeri',
    bullets: [
      P_SENTENCE,
      'F confronta la variabilità tra i gruppi con quella dentro i gruppi: valori vicini a 1 indicano che i gruppi non si distinguono.',
      'η² (eta quadro) è la quota di variabilità spiegata dal fattore: 0.01 piccolo, 0.06 medio, 0.14 grande.',
      'I p post-hoc sono già corretti: usali al posto dei p dei singoli t-test, che sarebbero troppo ottimisti.',
    ],
  });

  sections.push({
    heading: 'In pratica',
    body: [
      significant
        ? `Il fattore ${grpName} spiega una parte ${Number.isFinite(eta2) ? interpretEta(eta2) : 'non quantificabile'} della variabilità di ${depName}. Per capire quali gruppi si distinguono, leggi i confronti post-hoc qui sopra.`
        : `Non ci sono prove sufficienti che ${grpName} sposti ${depName}. Con gruppi piccoli l’ANOVA ha poca potenza: l’assenza di significatività non equivale all’assenza di effetto.`,
    ],
  });

  return {
    id: 'report-anova',
    title: 'Report di lettura — ANOVA a una via',
    headline,
    badge: significant ? 'Gruppi diversi' : 'Nessuna differenza',
    tone: significant ? 'caution' : 'neutral',
    intro: [
      `Verifica se la media di ${depName} cambia tra i livelli del fattore ${grpName}. L’ipotesi nulla è che tutte le medie dei gruppi siano uguali.`,
      'L’ANOVA confronta la variabilità tra i gruppi con quella interna ai gruppi: se i gruppi differiscono davvero, la prima è grande rispetto alla seconda.',
    ],
    sections,
    limitations: [
      'L’ANOVA richiede osservazioni indipendenti: misure ripetute sulla stessa unità richiedono un modello per dati appaiati.',
      'Con gruppi molto sbilanciati o varianze molto diverse il test classico può dare p inaffidabili: usa Welch ANOVA o Kruskal–Wallis.',
      'La significatività globale non dice quali gruppi differiscono: servono sempre i confronti post-hoc.',
    ],
  };
};
