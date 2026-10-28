import type { ReportSection, ReportSpec, TableRow, TableSpec } from './shared';
import {
  P_SENTENCE, alphaOf, alphaText, ciSentence, describeP, fmtCI, fmtEst, fmtP,
  interpretD, interpretEta, interpretPhi, interpretR, isDecided, num, rowBy,
  rowLike, rowsOf, show, showCI, showInt, subtitleOf, tableById, text,
} from './shared';

export interface TTestReportInput {
  tables: TableSpec[];
  type: 'one' | 'ind' | 'dep';
  name1: string;
  name2: string;
  mu: number;
  level: number;
  equalVar: boolean;
  useNonParam: boolean;
}

export const ttestReport = (input: TTestReportInput): ReportSpec => {
  const { tables, type, name1, name2, mu, level, equalVar, useNonParam } = input;
  const alpha = alphaText(level);

  const main = rowsOf(tables, 'ttest-main')[0];
  const diff = num(main, 'diff');
  const se = num(main, 'se');
  const t = num(main, 't');
  const df = num(main, 'df');
  const pValue = num(main, 'p');
  const lo = num(main, 'ciLo');
  const hi = num(main, 'ciHi');
  const significant = isDecided(pValue, level);

  const effects = rowsOf(tables, 'ttest-effects');
  const d = num(rowLike(effects, 'measure', 'g'), 'estimate');
  const r = num(rowLike(effects, 'measure', 'punto-biseriale'), 'estimate');
  const r2 = num(rowLike(effects, 'measure', 'r²'), 'estimate');

  const assumptions = rowsOf(tables, 'ttest-assumptions');
  const leveneP = num(rowLike(assumptions, 'check', 'levene'), 'p');
  const brownP = num(rowLike(assumptions, 'check', 'brown'), 'p');
  const lillieforsP = num(rowLike(assumptions, 'check', 'lilliefors'), 'p');

  const nonParamTable = type === 'ind' ? 'ttest-mannwhitney' : 'ttest-wilcoxon';
  const nonParam = rowsOf(tables, nonParamTable)[0];
  const nonParamP = num(nonParam, 'p');
  const nonParamName = type === 'ind' ? 'Mann–Whitney U' : 'Wilcoxon signed-rank';

  const varianceIssue = type === 'ind' && equalVar && Number.isFinite(leveneP) && leveneP < alphaOf(level);
  const normalityIssue = Number.isFinite(lillieforsP) && lillieforsP < alphaOf(level);
  const caution = varianceIssue || normalityIssue;

  const comparison = type === 'ind'
    ? `${name1} e ${name2}`
    : type === 'dep'
      ? `${name1} − ${name2}`
      : `${name1} e il valore di riferimento ${mu}`;

  const effectPhrase = Number.isFinite(d)
    ? ` L’effetto è ${interpretD(d)} (Hedges g = ${show(d, 2)}).`
    : '';

  const headline = !Number.isFinite(pValue)
    ? 'Il test non è calcolabile con i dati disponibili.'
    : significant
      ? `Le medie di ${comparison} sono diverse: ${describeP(pValue)} (soglia α = ${alpha}).${effectPhrase}`
      : `Non emerge una differenza statisticamente significativa tra ${comparison}: ${describeP(pValue)} (soglia α = ${alpha}).${effectPhrase}`;

  const decision = significant
    ? `Poiché ${describeP(pValue)} resta sotto la soglia α = ${alpha}, l’ipotesi nulla viene rifiutata: la differenza osservata è difficile da spiegare con la sola variabilità campionaria.`
    : `Poiché ${describeP(pValue)} non raggiunge la soglia α = ${alpha}, l’ipotesi nulla non viene rifiutata: i dati non bastano per affermare che esista una differenza.`;

  const zeroInside =
    type === 'one'
      ? Number.isFinite(lo) && Number.isFinite(hi) && mu >= lo && mu <= hi
      : Number.isFinite(lo) && Number.isFinite(hi) && lo <= 0 && hi >= 0;

  const ciText =
    type === 'one'
      ? `Intervallo di confidenza al ${level}% della media: ${showCI(lo, hi, 3)}. ${zeroInside ? `Contiene ${mu}, quindi è coerente con un test non significativo.` : `Non contiene ${mu}, quindi è coerente con un test significativo.`}`
      : `Intervallo di confidenza al ${level}% della differenza: ${showCI(lo, hi, 3)}. ${zeroInside ? 'Contiene lo zero, quindi è coerente con un test non significativo.' : 'Non contiene lo zero, quindi è coerente con un test significativo.'}`;

  const intro =
    type === 'one'
      ? [
          `Confronta la media di ${name1} con il valore di riferimento μ₀ = ${mu}. L’ipotesi nulla è che la media della popolazione sia uguale a quel valore.`,
          'Il test t divide la distanza tra media osservata e valore atteso per l’errore standard: un t grande significa che la distanza è grande rispetto al rumore dei dati.',
        ]
      : type === 'ind'
        ? [
            `Confronta le medie di due gruppi indipendenti, ${name1} e ${name2}, presi da righe diverse del foglio. L’ipotesi nulla è che le due medie nella popolazione siano uguali.`,
            'Il test t divide la differenza tra le medie per l’errore standard della differenza: un t grande significa che lo scarto è grande rispetto alla variabilità dei due gruppi.',
          ]
        : [
            `Confronta due misure prese sulle stesse righe, ${name1} e ${name2}, lavorando sulle differenze riga per riga. L’ipotesi nulla è che la differenza media nella popolazione sia zero.`,
            'Ogni riga viene ridotta a una sola differenza, poi si controlla quanto quella differenza media è lontana da zero rispetto alla sua variabilità.',
          ];

  const sections: ReportSection[] = [
    {
      heading: 'Il test principale',
      bullets: [
        type === 'one'
          ? `Differenza media rispetto a μ₀: ${show(diff, 3)}.`
          : `Differenza tra le medie: ${show(diff, 3)} (${name1} − ${name2}).`,
        `Errore standard della stima: ${show(se, 3)}.`,
        `Statistica t = ${show(t, 3)} con df = ${show(df, 2)}.`,
        `${describeP(pValue, 'p-value a due code')} (soglia α = ${alpha}).`,
        decision,
        ciText,
      ],
    },
    {
      heading: 'Quanto è grande la differenza',
      bullets: [
        Number.isFinite(d)
          ? `Hedges g = ${show(d, 2)}: effetto ${interpretD(d)} secondo le soglie convenzionali (0.2 piccolo, 0.5 medio, 0.8 grande).`
          : 'Effect size non calcolabile con questo campione.',
        Number.isFinite(r)
          ? `Correlazione con l’appartenenza al gruppo: r = ${show(r, 3)}, cioè un’associazione ${interpretR(r)}.`
          : '',
        Number.isFinite(r2)
          ? `r² = ${show(r2, 3)}: circa il ${show(r2 * 100, 1)}% della variabilità è riconducibile alla differenza tra le condizioni.`
          : '',
        'Un effetto statisticamente significativo può essere piccolo: con molti dati basta una differenza minima. La significatività dice che la differenza è probabilmente reale, non che è importante.',
      ].filter(Boolean),
    },
    {
      heading: 'Assunzioni e alternative',
      bullets: [
        Number.isFinite(lillieforsP)
          ? `Normalità: Lilliefors ${describeP(lillieforsP)} → ${normalityIssue ? `rifiutata, quindi il test t va letto con cautela (soglia ${alpha})` : 'non rifiutata, assunzione ragionevole'}.`
          : 'Normalità: questa tabella non riporta il test sui due gruppi; con n ≥ 30 per gruppo il t-test è comunque robusto, altrimenti controlla le descrittive di ogni gruppo prima di fidarti del p.',
        type === 'ind'
          ? Number.isFinite(leveneP)
            ? `Uguaglianza delle varianze: Levene ${describeP(leveneP)}${Number.isFinite(brownP) ? `, Brown–Forsythe ${describeP(brownP)}` : ''} → ${varianceIssue ? 'varianze probabilmente diverse: meglio il t di Welch' : 'nessuna evidenza contro l’uguaglianza delle varianze'}.`
            : 'Uguaglianza delle varianze non verificabile con questi dati.'
          : '',
        type === 'dep'
          ? 'Nel disegno appaiato l’assunzione riguarda la normalità delle differenze, non delle due misure separatamente: l’ordine delle righe deve corrispondere alla stessa unità osservata.'
          : '',
        useNonParam && Number.isFinite(nonParamP)
          ? `${nonParamName}: ${describeP(nonParamP)} → ${isDecided(nonParamP, level) ? 'conferma la presenza di una differenza' : 'non conferma la differenza'}; confrontare i due risultati dà la misura di quanto l’esito dipenda dall’assunzione di normalità.`
          : '',
      ].filter(Boolean),
    },
    {
      heading: 'In pratica',
      body: [
        significant
          ? `La differenza tra ${comparison} è probabilmente reale. Per decidere se è rilevante, confronta l’ampiezza con quella che consideri clinicamente o praticamente importante: l’effetto misurato è ${Number.isFinite(d) ? interpretD(d) : 'non quantificabile'}.`
          : `I dati non mostrano una differenza affidabile tra ${comparison}. Questo non dimostra che le medie siano identiche: con pochi dati il test ha poca potenza e una differenza reale può restare invisibile.`,
        'Se il risultato è al limite della soglia, aumenta il campione o replica lo studio prima di prendere decisioni.',
      ],
    },
    {
      heading: 'Come leggere i numeri',
      bullets: [
        P_SENTENCE,
        ciSentence(level),
        'df (gradi di libertà) descrive quanta informazione indipendente resta nei dati: più è grande, più il test è preciso.',
        'Hedges g è la differenza espressa in deviazioni standard: rende confrontabili misure con unità diverse.',
      ],
    },
  ];

  return {
    id: 'report-ttest',
    title: 'Report di lettura — Test t',
    headline,
    badge: significant ? 'Differenza rilevata' : 'Nessuna differenza',
    tone: significant ? (caution ? 'caution' : 'positive') : caution ? 'caution' : 'neutral',
    intro,
    sections,
    limitations: [
      type === 'dep'
        ? 'Le righe vengono appaiate per posizione: se l’ordine delle osservazioni non è corretto il test perde senso.'
        : 'Il test riguarda le medie: se la distribuzione è molto asimmetrica, la mediana e i test non parametrici descrivono meglio il fenomeno.',
      'Un p-value non dice nulla sulla dimensione dell’effetto né sulla rilevanza pratica del risultato.',
      'Con più confronti ripetuti aumenta la probabilità di falsi positivi: correggi per le comparazioni multiple o pianifica un solo confronto principale.',
    ],
  };
};
