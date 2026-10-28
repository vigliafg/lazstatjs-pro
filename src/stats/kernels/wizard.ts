import { leveneTest, lillieforsTest } from '../distributions';
import { fmtP } from '../format';
import { describeP, isDecided } from '../reportKit';
import { parseNum } from '../core';
import type {
  ColumnKind, ColumnProfile, GroupCheck, WizardContext, WizardGoal, WizardRecommendation, WizardSelection,
} from '../wizard/types';

export const toValues = (rows: string[][], index: number): string[] =>
  rows.map(row => String(row[index] ?? '').trim());

const numericValues = (values: string[]): number[] =>
  values.filter(value => value !== '' && Number.isFinite(parseNum(value))).map(value => parseNum(value));

export const sdOf = (values: number[]): number => {
  if (values.length < 2) return NaN;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
};

export const profileColumns = (
  columns: { name: string }[],
  rows: string[][],
  normalityReps = 400
): ColumnProfile[] =>
  columns.map((column, index) => {
    const values = toValues(rows, index);
    const present = values.filter(value => value !== '');
    const levels = Array.from(new Set(present)).sort();
    const numeric = present.filter(value => Number.isFinite(parseNum(value)));
    const numericShare = present.length > 0 ? numeric.length / present.length : 0;

    let kind: ColumnKind = 'empty';
    if (present.length > 0) {
      if (numericShare >= 0.95) kind = levels.length === 2 ? 'binary' : 'numeric';
      else kind = levels.length === 2 ? 'binary' : 'categorical';
    }

    const numbers = numericValues(values);
    const mean = numbers.length > 0 ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length : NaN;
    const sd = sdOf(numbers);
    const normalityP =
      kind === 'numeric' && numbers.length >= 8 && sd > 0
        ? lillieforsTest(numbers, normalityReps).p
        : NaN;

    return {
      index,
      name: column.name,
      kind,
      n: present.length,
      missing: values.length - present.length,
      unique: levels.length,
      levels: levels.slice(0, 20),
      min: numbers.length > 0 ? Math.min(...numbers) : NaN,
      max: numbers.length > 0 ? Math.max(...numbers) : NaN,
      mean,
      sd,
      normalityP,
    };
  });

/** Mean, SD and normality p-value of the outcome inside each group level. */
export const groupChecks = (
  outcome: (number | null)[],
  labels: (string | null)[]
): GroupCheck[] => {
  const levels = Array.from(
    new Set(labels.filter((label): label is string => label !== null && label !== ''))
  ).sort();

  return levels.map(level => {
    const values = outcome
      .map((value, index) => (labels[index] === level && value !== null ? value : null))
      .filter((value): value is number => value !== null && Number.isFinite(value));
    const mean = values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : NaN;
    const sd = sdOf(values);
    const normalityP =
      values.length >= 8 && sd > 0 ? lillieforsTest(values, 300).p : NaN;
    return { level, n: values.length, mean, sd, normalityP };
  });
};

const notDecided = (groups: GroupCheck[], level: number): boolean =>
  groups.some(group => Number.isFinite(group.normalityP) && isDecided(group.normalityP, level));

const smallGroup = (groups: GroupCheck[]): boolean =>
  groups.some(group => group.n < 5);



const normalitySentence = (context: WizardContext): string => {
  if (context.groups.length === 0) return '';
  const parts = context.groups.map(group =>
    `${group.level}: n = ${group.n}${Number.isFinite(group.normalityP) ? `, Lilliefors p = ${fmtP(group.normalityP)}` : ''}`
  );
  return parts.join(' · ');
};

const assumptionChecks = (context: WizardContext): string[] => {
  const checks: string[] = [];
  if (context.outcome && context.outcome.kind === 'numeric') {
    if (context.groups.length > 0) {
      checks.push(`Distribuzione per gruppo — ${normalitySentence(context)}.`);
      if (Number.isFinite(context.leveneP)) {
        checks.push(
          `Varianze omogenee (Levene): ${describeP(context.leveneP)} → ${isDecided(context.leveneP, context.level) ? 'varianze diverse, Welch è la scelta sicura' : 'nessuna evidenza contro l’uguaglianza delle varianze'}.`
        );
      }
    } else if (Number.isFinite(context.outcome.normalityP)) {
      checks.push(
        `Normalità dell’esito (Lilliefors): ${describeP(context.outcome.normalityP)} → ${isDecided(context.outcome.normalityP, context.level) ? 'normalità rifiutata' : 'compatibile con la gaussiana'}.`
      );
    }
    if (context.paired && Number.isFinite(context.pairedDifferenceP)) {
      checks.push(
        `Normalità delle differenze appaiate (Lilliefors): ${describeP(context.pairedDifferenceP)} → ${isDecided(context.pairedDifferenceP, context.level) ? 'meglio il test dei ranghi' : 't-test appaiato accettabile'}.`
      );
    }
  }
  if (smallGroup(context.groups)) {
    checks.push('Almeno un gruppo ha meno di 5 osservazioni: usa test non parametrici e intervalli bootstrap.');
  }
  return checks;
};

const outcomeName = (context: WizardContext): string =>
  context.outcome ? context.outcome.name : 'la variabile di esito';

const groupName = (context: WizardContext): string =>
  context.groupLevels.length > 0 ? `${context.groupLevels.length} livelli` : 'nessun gruppo selezionato';

export const recommendWizard = (context: WizardContext): WizardRecommendation => {
  const { goal, outcome, second, groups, level } = context;
  const checks = assumptionChecks(context);

  if (goal === 'describe') {
    return {
      analysis: 'descriptive',
      tabLabel: 'Descriptive',
      title: 'Statistiche descrittive',
      headline: 'Fotografa una o più variabili: centro, dispersione, forma e valori anomali.',
      why: [
        'Non c’è un’ipotesi da verificare: il primo passo è capire come sono fatte le variabili, quante osservazioni mancano e se la forma è compatibile con la gaussiana.',
        'Le descrittive decidono i test successivi: asimmetria o outlier spingono verso metodi non parametrici.',
      ],
      selection: ['Seleziona in “Select Variables” tutte le colonne numeriche di interesse.'],
      alternative: 'Se vuoi già confrontare gruppi, passa a Compare groups.',
      checks: checks.length > 0 ? checks : ['Controlla valori mancanti e unità di misura prima di aggregare.'],
      parametric: true,
    };
  }

  if (goal === 'plan') {
    return {
      analysis: 'samplesize',
      tabLabel: 'Sample Size / Power',
      title: 'Numerosità campionaria e potenza',
      headline: 'Calcola quante osservazioni servono prima di raccogliere i dati.',
      why: [
        'La numerosità dipende dall’effetto che vuoi rilevare, dalla variabilità e dalla potenza scelta: calcolarla dopo lo studio è troppo tardi.',
        'Il modulo copre medie, proporzioni, correlazioni, ANOVA e precisione desiderata.',
      ],
      selection: ['Scegli il disegno, inserisci l’effetto atteso (o la SD) e la potenza obiettivo (di solito 0,80).'],
      alternative: 'Con dati già raccolti passa a Compare groups o Predict.',
      checks: ['Definisci l’effetto minimo rilevante prima di guardare i risultati: evita calcoli ispirati dai dati.'],
      parametric: true,
    };
  }

  if (goal === 'forecast') {
    return {
      analysis: 'timeseries',
      tabLabel: 'Time Series',
      title: 'Serie storica e previsioni',
      headline: 'Analizza trend, stagionalità e memoria della serie, poi prevedi con ARIMA/SARIMA.',
      why: [
        'Le osservazioni sono ordinate nel tempo e non indipendenti: trattarle come un campione casuale ignora trend e autocorrelazione.',
        'Il modello ARIMA/SARIMA viene scelto per AICc e le previsioni hanno intervalli che si allargano con l’orizzonte.',
      ],
      selection: [
        'Scegli la colonna della serie, imposta il periodo stagionale (12 per mesi, 4 per trimestri) e l’orizzonte.',
        'Lascia “Auto” per la differenziazione se non hai una ragione per imporla.',
      ],
      alternative: 'Se ti interessa solo la tendenza descrittiva, la stessa scheda riporta Mann–Kendall e la pendenza di Sen.',
      checks: ['Verifica che le righe siano in ordine cronologico e che non ci siano buchi temporali.'],
      parametric: true,
    };
  }

  if (goal === 'survive') {
    const hasGroups = context.groupLevels.length >= 2;
    if (!hasGroups) {
      return {
        analysis: 'cox',
        tabLabel: 'Cox (PH)',
        title: 'Regressione di Cox',
        headline: 'Stima l’effetto di una o più covariariate sul rischio di evento nel tempo.',
        why: [
          'Con covariariate continue (età, dose, punteggio) il confronto tra curve non basta: Cox stima un hazard ratio aggiustato per tutte le variabili.',
          'I censurati restano a rischio finché sono osservati, quindi non vanno scartati.',
        ],
        selection: [
          'Time: la colonna del tempo fino all’evento o alla censura.',
          'Event: la colonna 0/1 che indica se l’evento è avvenuto.',
          'Covariates: le variabili esplicative (le colonne categoriche con pochi livelli vengono codificate automaticamente).',
        ],
        alternative: 'Con un solo gruppo e nessuna covariata usa Survival (KM) per la curva e il log-rank.',
        checks: ['Servono almeno 10 eventi per covariata; controlla la tabella dei rischi proporzionali prima di fidarti dell’HR.'],
        parametric: false,
      };
    }
    return {
      analysis: 'survival',
      tabLabel: 'Survival (KM)',
      title: 'Kaplan–Meier e log-rank',
      headline: `Confronta la sopravvivenza tra i ${context.groupLevels.length} gruppi della colonna del gruppo.`,
      why: [
        'Con pochi gruppi e senza covariariate la curva di Kaplan–Meier e il log-rank sono la lettura più diretta.',
        'La mediana e il RMST riassumono la curva anche quando il follow-up è incompleto.',
      ],
      selection: [
        `Time: la colonna del tempo · Event: la colonna 0/1 · Group: la colonna con ${context.groupLevels.length} livelli.`,
        'Se vuoi aggiustare per altre variabili, passa a Cox (PH).',
      ],
      alternative: 'Per hazard ratio aggiustati o covariariate continue usa Cox (PH).',
      checks: ['Verifica che la censura non sia informativa e che i gruppi siano definiti prima dell’inizio del follow-up.'],
      parametric: false,
    };
  }

  if (goal === 'predict') {
    if (outcome && outcome.kind === 'binary') {
      return {
        analysis: 'logistic',
        tabLabel: 'Logistic Regression',
        title: 'Regressione logistica',
        headline: `Prevedi la probabilità di ${outcome.name} a partire dalle altre variabili.`,
        why: [
          'L’esito è dicotomico: la regressione lineare produrrebbe probabilità fuori da 0–1, la logistica no.',
          'Gli odds ratio e la curva di probabilità rendono leggibile l’effetto di ogni predittore.',
        ],
        selection: [`Outcome: ${outcome.name} · Predictors: le variabili esplicative numeriche.`],
        alternative: 'Se l’esito è continuo usa Regression; se è il tempo fino a un evento usa Cox (PH).',
        checks: ['Servono eventi in entrambe le classi; con classi molto sbilanciate le stime e l’AUC vanno lette con prudenza.'],
        parametric: true,
      };
    }
    if (outcome && outcome.kind === 'numeric') {
      const multiple = context.second !== null && context.second.kind === 'numeric';
      return {
        analysis: 'regression',
        tabLabel: 'Regression',
        title: multiple ? 'Regressione lineare multipla' : 'Regressione lineare semplice',
        headline: `Stima come ${outcome.name} cambia al variare dei predittori.`,
        why: [
          'L’esito è numerico e vuoi quantificare l’effetto di una o più variabili, non solo se esiste un’associazione.',
          'La regressione dà coefficienti interpretabili, intervalli e diagnostica dei residui.',
        ],
        selection: [
          `Y: ${outcome.name}.`,
          multiple && context.second
            ? `X: ${context.second.name} e le altre variabili esplicative.`
            : 'X: seleziona i predittori numerici (aggiungi dummy per le categoriche).',
        ],
        alternative: 'Se ti interessa solo l’associazione tra due variabili, usa Correlation.',
        checks: ['Controlla residui, eteroschedasticità e collinearità (VIF) nella scheda della regressione.'],
        parametric: true,
      };
    }
    return {
      analysis: 'cox',
      tabLabel: 'Cox (PH)',
      title: 'Regressione di Cox',
      headline: 'Se l’esito è un tempo fino a un evento, il modello da usare è Cox.',
      why: [
        'Il tempo di evento è spesso censurato: un modello per esiti continui non gestisce la censura.',
        'Cox stima hazard ratio aggiustati senza assumere una forma per il rischio di base.',
      ],
      selection: ['Time: tempo fino all’evento · Event: 0/1 · Covariates: i predittori.'],
      alternative: 'Se ti serve la probabilità di un esito binario a un tempo fisso, valuta la regressione logistica.',
      checks: ['Controlla i rischi proporzionali e il numero di eventi per covariata.'],
      parametric: false,
    };
  }

  if (goal === 'associate') {
    const bothNumeric =
      outcome?.kind === 'numeric' && (second === null || second.kind === 'numeric');
    if (bothNumeric) {
      const nonNormal =
        (Number.isFinite(outcome!.normalityP) && isDecided(outcome!.normalityP, level)) ||
        (second !== null && Number.isFinite(second.normalityP) && isDecided(second.normalityP, level));
      return {
        analysis: 'correlation',
        tabLabel: 'Correlation',
        title: nonNormal ? 'Correlazione di Spearman' : 'Correlazione di Pearson',
        headline: nonNormal
          ? `Relazione monotona tra ${outcome!.name}${second ? ` e ${second.name}` : ''}: meglio Spearman.`
          : `Relazione lineare tra ${outcome!.name}${second ? ` e ${second.name}` : ''}: Pearson è adatto.`,
        why: [
          'Due variabili numeriche: la correlazione misura quanto si muovono insieme, senza implicare causalità.',
          nonNormal
            ? 'Almeno una variabile si discosta dalla gaussiana o ha outlier: il coefficiente di Spearman è più robusto.'
            : 'Le distribuzioni sono compatibili con la gaussiana, quindi Pearson sfrutta tutta l’informazione.',
        ],
        selection: [
          second
            ? `Variabili: ${outcome!.name} e ${second.name}.`
            : 'Seleziona due colonne numeriche nella scheda Correlation.',
        ],
        alternative: 'Se vuoi prevedere una variabile dall’altra, passa a Regression.',
        checks:
          checks.length > 0
            ? checks
            : ['Controlla il grafico di dispersione: la correlazione non vede le relazioni non monotone.'],
        parametric: !nonNormal,
      };
    }
    return {
      analysis: 'contingency',
      tabLabel: 'Contingency (R×C)',
      title: 'Tabelle di contingenza e χ²',
      headline: 'Verifica se due variabili categoriche sono associate.',
      why: [
        'Con variabili categoriche non ha senso una correlazione: si confrontano frequenze osservate e attese.',
        'Il modulo gestisce tabelle 2×2 e R×C, con Fisher o Monte Carlo quando le celle sono piccole.',
      ],
      selection: ['Scegli le due variabili categoriche e il tipo di tabella.'],
      alternative: 'Per un esito binario con più predittori usa la regressione logistica.',
      checks: ['Se qualche frequenza attesa è sotto 5, leggi il p esatto (Fisher o Monte Carlo), non il χ² asintotico.'],
      parametric: false,
    };
  }

  // goal === 'compare'
  if (!outcome) {
    return {
      analysis: 'ttest',
      tabLabel: 'T-Test',
      title: 'Seleziona la variabile di esito',
      headline: 'Scegli la colonna numerica da confrontare per ottenere una raccomandazione precisa.',
      why: ['Il test dipende dal tipo di esito: continuo, binario o categorico.'],
      selection: ['Indica l’esito (Y) e, se esiste, la colonna dei gruppi.'],
      alternative: 'Per due variabili numeriche guarda Correlation.',
      checks,
      parametric: true,
    };
  }

  if (outcome.kind === 'numeric') {
    if (context.groupLevels.length === 0 || context.groupLevels.length === 1) {
      const normal = Number.isFinite(outcome.normalityP) ? !isDecided(outcome.normalityP, level) : true;
      return {
        analysis: 'ttest',
        tabLabel: 'T-Test',
        title: normal ? 'T-test a un campione' : 'Wilcoxon signed-rank a un campione',
        headline: `Confronta la media di ${outcome.name} con un valore di riferimento.`,
        why: [
          'Hai una sola serie di misure numeriche e un valore teorico o normativo da confrontare.',
          normal
            ? 'La distribuzione è compatibile con la gaussiana: il t-test a un campione è appropriato.'
            : 'La normalità è rifiutata: il test dei ranghi è più prudente.',
        ],
        selection: [`Nel pannello T-Test scegli “One sample”, Y = ${outcome.name} e inserisci μ₀.`],
        alternative: normal ? 'Se la normalità cade, Wilcoxon signed-rank è già nella scheda.' : 'Se la normalità regge, il t-test a un campione è più potente.',
        checks,
        parametric: normal,
      };
    }

    const normal = !notDecided(groups, level) && !smallGroup(groups);
    if (context.groupLevels.length === 2) {
      if (context.paired) {
        const differencesNormal =
          !Number.isFinite(context.pairedDifferenceP) || !isDecided(context.pairedDifferenceP, level);
        return {
          analysis: 'ttest',
          tabLabel: 'T-Test',
          title: differencesNormal ? 'T-test appaiato' : 'Wilcoxon signed-rank',
          headline: `Confronta ${outcome.name} nelle due condizioni misurate sulle stesse righe.`,
          why: [
            'Le due misure appartengono alla stessa unità: il disegno è appaiato e va analizzato sulle differenze riga per riga.',
            differencesNormal
              ? 'Le differenze sono compatibili con la gaussiana, quindi il t-test appaiato è adatto.'
              : 'Le differenze non sono gaussiane: meglio il test dei ranghi.',
          ],
          selection: [`Nel pannello T-Test scegli “Paired”, variabili ${outcome.name} e la seconda misura.`],
          alternative: differencesNormal ? 'Wilcoxon signed-rank resta disponibile come controllo.' : 'Se le differenze tornano normali, il t-test appaiato è più potente.',
          checks,
          parametric: differencesNormal,
        };
      }
      return {
        analysis: 'ttest',
        tabLabel: 'T-Test',
        title: normal ? 'T-test di Welch per due gruppi indipendenti' : 'Mann–Whitney U',
        headline: `Confronta ${outcome.name} tra i due livelli del gruppo.`,
        why: [
          'Due gruppi indipendenti e un esito numerico: il test t confronta le medie, il test dei ranghi confronta le distribuzioni.',
          normal
            ? 'Normalità e varianze compatibili: Welch è la scelta sicura, perché non assume varianze uguali.'
            : 'Almeno un gruppo si discosta dalla gaussiana o è troppo piccolo: Mann–Whitney è più affidabile.',
        ],
        selection: [`Nel pannello T-Test scegli “Independent”, Y = ${outcome.name} e i due gruppi in “Group 1 / Group 2”.`],
        alternative: normal ? 'Se la normalità cade, usa Mann–Whitney (presente nella stessa scheda).' : 'Se le distribuzioni tornano normali, Welch è più potente.',
        checks,
        parametric: normal,
      };
    }

    return {
      analysis: 'anova',
      tabLabel: 'ANOVA',
      title: normal ? 'ANOVA a una via con post-hoc' : 'Kruskal–Wallis con post-hoc',
      headline: `Confronta ${outcome.name} tra i ${context.groupLevels.length} gruppi.`,
      why: [
        'Con tre o più gruppi i t-test a coppie moltiplicano i falsi positivi: serve un test globale seguito da confronti corretti.',
        normal
          ? 'Le assunzioni di normalità e omoschedasticità sono ragionevoli: ANOVA con Tukey.'
          : 'Le assunzioni non reggono: Kruskal–Wallis con Dunn è l’alternativa.',
      ],
      selection: [
        `Nel pannello ANOVA scegli Y = ${outcome.name} e il fattore con ${context.groupLevels.length} livelli.`,
        'Attiva i confronti post-hoc e controlla Levene nella tabella delle assunzioni.',
      ],
      alternative: normal ? 'Per varianze molto diverse usa Welch ANOVA (presente nella scheda).' : 'Se le assunzioni reggono, l’ANOVA è più potente.',
      checks,
      parametric: normal,
    };
  }

  const twoLevels = context.groupLevels.length === 2;
  return {
    analysis: twoLevels ? 'chisquare' : 'contingency',
    tabLabel: twoLevels ? 'Chi-Square (χ²)' : 'Contingency (R×C)',
    title: twoLevels ? 'Chi-square / Fisher per due variabili binarie' : 'Chi-square per tabelle R×C',
    headline: `Verifica se ${outcome.name} è associato al gruppo.`,
    why: [
      'L’esito è categorico: si confrontano frequenze, non medie.',
      'Con celle piccole il p asintotico non è affidabile: la scheda offre Fisher esatto o Monte Carlo.',
    ],
    selection: [`Tabella tra ${outcome.name} e la variabile di gruppo.`],
    alternative: 'Per un esito binario con covariariate usa la regressione logistica.',
    checks: ['Controlla le frequenze attese: sotto 5 in qualche cella leggi il p esatto.'],
    parametric: false,
  };
};

