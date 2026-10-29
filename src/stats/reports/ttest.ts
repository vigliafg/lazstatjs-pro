import type { ReportSection, ReportSpec, TableRow, TableSpec } from './shared';
import { copy } from '../reportCopy';
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
  const nonParamName = type === 'ind' ? copy('Mann–Whitney U') : copy('Wilcoxon signed-rank');

  const varianceIssue = type === 'ind' && equalVar && Number.isFinite(leveneP) && leveneP < alphaOf(level);
  const normalityIssue = Number.isFinite(lillieforsP) && lillieforsP < alphaOf(level);
  const caution = varianceIssue || normalityIssue;

  const comparison = type === 'ind'
    ? copy('{s1} e {s2}', { s1: name1, s2: name2 })
    : type === 'dep'
      ? copy('{s1} − {s2}', { s1: name1, s2: name2 })
      : copy('{s1} e il valore di riferimento {s2}', { s1: name1, s2: mu });

  const effectPhrase = Number.isFinite(d)
    ? copy(' L’effetto è {s1} (Hedges g = {s2}).', { s1: interpretD(d), s2: show(d, 2) })
    : '';

  const headline = !Number.isFinite(pValue)
    ? copy('Il test non è calcolabile con i dati disponibili.')
    : significant
      ? copy('Le medie di {s1} sono diverse: {s2} (soglia α = {s3}).{s4}', { s1: comparison, s2: describeP(pValue), s3: alpha, s4: effectPhrase })
      : copy('Non emerge una differenza statisticamente significativa tra {s1}: {s2} (soglia α = {s3}).{s4}', { s1: comparison, s2: describeP(pValue), s3: alpha, s4: effectPhrase });

  const decision = significant
    ? copy('Poiché {s1} resta sotto la soglia α = {s2}, l’ipotesi nulla viene rifiutata: la differenza osservata è difficile da spiegare con la sola variabilità campionaria.', { s1: describeP(pValue), s2: alpha })
    : copy('Poiché {s1} non raggiunge la soglia α = {s2}, l’ipotesi nulla non viene rifiutata: i dati non bastano per affermare che esista una differenza.', { s1: describeP(pValue), s2: alpha });

  const zeroInside =
    type === 'one'
      ? Number.isFinite(lo) && Number.isFinite(hi) && mu >= lo && mu <= hi
      : Number.isFinite(lo) && Number.isFinite(hi) && lo <= 0 && hi >= 0;

  const ciText =
    type === 'one'
      ? copy('Intervallo di confidenza al {s1}% della media: {s2}. {s3}', { s1: level, s2: showCI(lo, hi, 3), s3: zeroInside ? copy('Contiene {s1}, quindi è coerente con un test non significativo.', { s1: mu }) : copy('Non contiene {s1}, quindi è coerente con un test significativo.', { s1: mu }) })
      : copy('Intervallo di confidenza al {s1}% della differenza: {s2}. {s3}', { s1: level, s2: showCI(lo, hi, 3), s3: zeroInside ? copy('Contiene lo zero, quindi è coerente con un test non significativo.') : copy('Non contiene lo zero, quindi è coerente con un test significativo.') });

  const intro =
    type === 'one'
      ? [
          copy('Confronta la media di {s1} con il valore di riferimento μ₀ = {s2}. L’ipotesi nulla è che la media della popolazione sia uguale a quel valore.', { s1: name1, s2: mu }),
          copy('Il test t divide la distanza tra media osservata e valore atteso per l’errore standard: un t grande significa che la distanza è grande rispetto al rumore dei dati.'),
        ]
      : type === 'ind'
        ? [
            copy('Confronta le medie di due gruppi indipendenti, {s1} e {s2}, presi da righe diverse del foglio. L’ipotesi nulla è che le due medie nella popolazione siano uguali.', { s1: name1, s2: name2 }),
            copy('Il test t divide la differenza tra le medie per l’errore standard della differenza: un t grande significa che lo scarto è grande rispetto alla variabilità dei due gruppi.'),
          ]
        : [
            copy('Confronta due misure prese sulle stesse righe, {s1} e {s2}, lavorando sulle differenze riga per riga. L’ipotesi nulla è che la differenza media nella popolazione sia zero.', { s1: name1, s2: name2 }),
            copy('Ogni riga viene ridotta a una sola differenza, poi si controlla quanto quella differenza media è lontana da zero rispetto alla sua variabilità.'),
          ];

  const sections: ReportSection[] = [
    {
      heading: copy('Il test principale'),
      bullets: [
        type === 'one'
          ? copy('Differenza media rispetto a μ₀: {s1}.', { s1: show(diff, 3) })
          : copy('Differenza tra le medie: {s1} ({s2} − {s3}).', { s1: show(diff, 3), s2: name1, s3: name2 }),
        copy('Errore standard della stima: {s1}.', { s1: show(se, 3) }),
        copy('Statistica t = {s1} con df = {s2}.', { s1: show(t, 3), s2: show(df, 2) }),
        copy('{s1} (soglia α = {s2}).', { s1: describeP(pValue, copy('p-value a due code')), s2: alpha }),
        decision,
        ciText,
      ],
    },
    {
      heading: copy('Quanto è grande la differenza'),
      bullets: [
        Number.isFinite(d)
          ? copy('Hedges g = {s1}: effetto {s2} secondo le soglie convenzionali (0.2 piccolo, 0.5 medio, 0.8 grande).', { s1: show(d, 2), s2: interpretD(d) })
          : copy('Effect size non calcolabile con questo campione.'),
        Number.isFinite(r)
          ? copy('Correlazione con l’appartenenza al gruppo: r = {s1}, cioè un’associazione {s2}.', { s1: show(r, 3), s2: interpretR(r) })
          : '',
        Number.isFinite(r2)
          ? copy('r² = {s1}: circa il {s2}% della variabilità è riconducibile alla differenza tra le condizioni.', { s1: show(r2, 3), s2: show(r2 * 100, 1) })
          : '',
        copy('Un effetto statisticamente significativo può essere piccolo: con molti dati basta una differenza minima. La significatività dice che la differenza è probabilmente reale, non che è importante.'),
      ].filter(Boolean),
    },
    {
      heading: copy('Assunzioni e alternative'),
      bullets: [
        Number.isFinite(lillieforsP)
          ? copy('Normalità: Lilliefors {s1} → {s2}.', { s1: describeP(lillieforsP), s2: normalityIssue ? copy('rifiutata, quindi il test t va letto con cautela (soglia {s1})', { s1: alpha }) : copy('non rifiutata, assunzione ragionevole') })
          : copy('Normalità: questa tabella non riporta il test sui due gruppi; con n ≥ 30 per gruppo il t-test è comunque robusto, altrimenti controlla le descrittive di ogni gruppo prima di fidarti del p.'),
        type === 'ind'
          ? Number.isFinite(leveneP)
            ? copy('Uguaglianza delle varianze: Levene {s1}{s2} → {s3}.', { s1: describeP(leveneP), s2: Number.isFinite(brownP) ? copy(', Brown–Forsythe {s1}', { s1: describeP(brownP) }) : '', s3: varianceIssue ? copy('varianze probabilmente diverse: meglio il t di Welch') : copy('nessuna evidenza contro l’uguaglianza delle varianze') })
            : copy('Uguaglianza delle varianze non verificabile con questi dati.')
          : '',
        type === 'dep'
          ? copy('Nel disegno appaiato l’assunzione riguarda la normalità delle differenze, non delle due misure separatamente: l’ordine delle righe deve corrispondere alla stessa unità osservata.')
          : '',
        useNonParam && Number.isFinite(nonParamP)
          ? copy('{s1}: {s2} → {s3}; confrontare i due risultati dà la misura di quanto l’esito dipenda dall’assunzione di normalità.', { s1: nonParamName, s2: describeP(nonParamP), s3: isDecided(nonParamP, level) ? copy('conferma la presenza di una differenza') : copy('non conferma la differenza') })
          : '',
      ].filter(Boolean),
    },
    {
      heading: copy('In pratica'),
      body: [
        significant
          ? copy('La differenza tra {s1} è probabilmente reale. Per decidere se è rilevante, confronta l’ampiezza con quella che consideri clinicamente o praticamente importante: l’effetto misurato è {s2}.', { s1: comparison, s2: Number.isFinite(d) ? interpretD(d) : copy('non quantificabile') })
          : copy('I dati non mostrano una differenza affidabile tra {s1}. Questo non dimostra che le medie siano identiche: con pochi dati il test ha poca potenza e una differenza reale può restare invisibile.', { s1: comparison }),
        copy('Se il risultato è al limite della soglia, aumenta il campione o replica lo studio prima di prendere decisioni.'),
      ],
    },
    {
      heading: copy('Come leggere i numeri'),
      bullets: [
        P_SENTENCE,
        ciSentence(level),
        copy('df (gradi di libertà) descrive quanta informazione indipendente resta nei dati: più è grande, più il test è preciso.'),
        copy('Hedges g è la differenza espressa in deviazioni standard: rende confrontabili misure con unità diverse.'),
      ],
    },
  ];

  return {
    id: 'report-ttest',
    title: copy('Report di lettura — Test t'),
    headline,
    badge: significant ? copy('Differenza rilevata') : copy('Nessuna differenza'),
    tone: significant ? (caution ? 'caution' : 'positive') : caution ? 'caution' : 'neutral',
    intro,
    sections,
    limitations: [
      type === 'dep'
        ? copy('Le righe vengono appaiate per posizione: se l’ordine delle osservazioni non è corretto il test perde senso.')
        : copy('Il test riguarda le medie: se la distribuzione è molto asimmetrica, la mediana e i test non parametrici descrivono meglio il fenomeno.'),
      copy('Un p-value non dice nulla sulla dimensione dell’effetto né sulla rilevanza pratica del risultato.'),
      copy('Con più confronti ripetuti aumenta la probabilità di falsi positivi: correggi per le comparazioni multiple o pianifica un solo confronto principale.'),
    ],
  };
};
