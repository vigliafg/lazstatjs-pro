import type { ReportSection, ReportSpec, TableRow, TableSpec } from './shared';
import {
  P_SENTENCE, alphaOf, alphaText, ciSentence, describeP, fmtCI, fmtEst, fmtP,
  interpretD, interpretEta, interpretPhi, interpretR, isDecided, num, rowBy,
  rowLike, rowsOf, show, showCI, showInt, subtitleOf, tableById, text,
} from './shared';

export interface RegressionReportInput {
  tables: TableSpec[];
  depName: string;
  predNames: string[];
  level: number;
}

export const regressionReport = (input: RegressionReportInput): ReportSpec => {
  const { tables, depName, predNames, level } = input;
  const alpha = alphaText(level);

  const model = rowsOf(tables, 'reg-model');
  const nObs = num(rowBy(model, 'metric', 'N'), 'value');
  const r2 = num(rowBy(model, 'metric', 'R²'), 'value');
  const adjR2 = num(rowBy(model, 'metric', 'Adjusted R²'), 'value');
  const f = num(rowBy(model, 'metric', 'F'), 'value');
  const fP = num(rowBy(model, 'metric', 'p (F)'), 'value');
  const modelSignificant = isDecided(fP, level);

  const coefficients = rowsOf(tables, 'reg-coefficients');
  const predictors = coefficients.filter(row => text(row, 'predictor') !== '(Intercept)');
  const significantPredictors = predictors.filter(row => isDecided(num(row, 'p'), level));

  const diagnostics = rowsOf(tables, 'reg-diagnostics');
  const bpP = num(rowBy(diagnostics, 'metric', 'Breusch–Pagan p'), 'value');
  const residOutliers = num(rowBy(diagnostics, 'metric', 'Residui studentizzati |z| > 3'), 'value');
  const vifValues = predictors
    .map(row => num(row, 'vif'))
    .filter(value => Number.isFinite(value));
  const maxVif = vifValues.length > 0 ? Math.max(...vifValues) : NaN;

  const residualStats = rowsOf(tables, 'reg-residuals');
  const jbP = num(rowBy(residualStats, 'metric', 'Jarque–Bera p'), 'ols');
  const lillieforsP = num(rowBy(residualStats, 'metric', 'Lilliefors p'), 'ols');

  const robustRows = rowsOf(tables, 'reg-robust');
  const slopeRow = rowLike(robustRows, 'measure', 'slope');
  const robustSummary = subtitleOf(tables, 'reg-robust');

  const predictorBullets = predictors.map(row => {
    const name = text(row, 'predictor');
    const b = num(row, 'b');
    const beta = num(row, 'beta');
    const pValue = num(row, 'p');
    const lo = num(row, 'ciLo');
    const hi = num(row, 'ciHi');
    const vif = num(row, 'vif');
    const direction = Number.isFinite(b) ? (b > 0 ? 'aumenta' : b < 0 ? 'diminuisce' : 'non cambia') : 'non stimabile';
    return `${name}: B = ${show(b, 3)} (CI ${level}% ${showCI(lo, hi, 3)}), ${describeP(pValue)} → ${isDecided(pValue, level) ? 'predittore significativo' : 'nessuna evidenza di effetto'}. In media, un aumento di una unità di ${name} ${direction} ${depName} di ${show(Math.abs(b), 3)} a parità delle altre variabili${Number.isFinite(beta) ? `; β standardizzato = ${show(beta, 2)}` : ''}${Number.isFinite(vif) && vif > 5 ? `; VIF = ${show(vif, 2)} segnala collinearità` : ''}.`;
  });

  const headline = !Number.isFinite(fP)
    ? 'Il modello non è stimabile con i dati disponibili.'
    : modelSignificant
      ? `Il modello è significativo (F = ${show(f, 3)}, ${describeP(fP)}) e spiega il ${show((r2 ?? 0) * 100, 1)}% della variabilità di ${depName}.`
      : `Il modello non è significativo (F = ${show(f, 3)}, ${describeP(fP)}): i predittori non spiegano ${depName} meglio del caso.`;

  const sections: ReportSection[] = [
    {
      heading: 'Il modello nel suo insieme',
      bullets: [
        `Osservazioni usate: ${showInt(nObs)} (solo righe complete su tutte le variabili del modello).`,
        `R² = ${show(r2, 3)} → il modello spiega il ${show((r2 ?? 0) * 100, 1)}% della variabilità di ${depName}.`,
        `R² corretto = ${show(adjR2, 3)} → quota spiegata al netto del numero di predittori; se è molto più basso di R² il modello è sovra-adattato.`,
        `Test globale: F = ${show(f, 3)}, ${describeP(fP)} (α = ${alpha}) → ${modelSignificant ? 'il modello nel complesso è utile' : 'il modello nel complesso non è distinguibile dal caso'}.`,
      ],
    },
    {
      heading: 'Ogni predittore',
      bullets: predictorBullets.length > 0 ? predictorBullets : ['Nessun coefficiente disponibile.'],
    },
    {
      heading: 'Diagnostica',
      bullets: [
        Number.isFinite(bpP)
          ? `Breusch–Pagan ${describeP(bpP)} → ${bpP < alphaOf(level) ? 'eteroschedasticità dei residui: gli errori standard e i p-value possono essere inaffidabili' : 'nessuna evidenza di eteroschedasticità'}.`
          : 'Eteroschedasticità non verificabile.',
        Number.isFinite(jbP) ? `Normalità dei residui: Jarque–Bera ${describeP(jbP)}${Number.isFinite(lillieforsP) ? `, Lilliefors ${describeP(lillieforsP)}` : ''} → ${jbP < alphaOf(level) ? 'residui non gaussiani: gli intervalli di confidenza vanno letti con prudenza' : 'nessuna evidenza contro la normalità dei residui'}.` : '',
        Number.isFinite(residOutliers) && residOutliers > 0 ? `${showInt(residOutliers)} osservazioni con residuo studentizzato oltre 3 SD: verificane l’influenza sulle stime.` : 'Nessun residuo studentizzato oltre 3 SD: nessun caso fortemente anomalo rispetto al modello.',
        Number.isFinite(maxVif) ? `VIF massimo = ${show(maxVif, 2)} ${maxVif > 5 ? '→ collinearità problematica: i coefficienti dei predittori coinvolti sono instabili' : '→ collinearità sotto la soglia di attenzione (5)'}.` : '',
      ].filter(Boolean),
    },
  ];

  if (slopeRow) {
    sections.push({
      heading: 'Stima robusta Theil–Sen',
      body: [
        `Confronto tra OLS e stimatore robusto${robustSummary ? ` (${robustSummary})` : ''}: se le due pendenze sono simili, gli outlier non stanno distorcendo il risultato.`,
      ],
      bullets: [
        `Pendenza OLS = ${show(num(slopeRow, 'ols'), 3)}, pendenza Theil–Sen = ${show(num(slopeRow, 'ts'), 3)} (CI ${level}% ${showCI(num(slopeRow, 'ciLo'), num(slopeRow, 'ciHi'), 3)}).`,
        `Differenza percentuale: ${Number.isFinite(num(slopeRow, 'ols')) && num(slopeRow, 'ols') !== 0 ? show(Math.abs((num(slopeRow, 'ts') - num(slopeRow, 'ols')) / num(slopeRow, 'ols')) * 100, 1) : '—'}%.`,
      ],
    });
  }

  sections.push({
    heading: 'Come leggere i numeri',
    bullets: [
      'B è il cambiamento atteso nella variabile dipendente per una unità in più del predittore, tenendo fermi gli altri: l’unità conta, e molto.',
      `Il CI al ${level}% del coefficiente è la forbice dei valori plausibili: se contiene lo zero l’effetto non è distinguibile da nessun effetto.`,
      P_SENTENCE,
      'R² alto non significa modello corretto: guarda sempre residui, diagnostica e senso delle variabili.',
    ],
  });

  sections.push({
    heading: 'In pratica',
    body: [
      modelSignificant && significantPredictors.length > 0
        ? `I predittori con effetto affidabile sono: ${significantPredictors.map(row => text(row, 'predictor')).join(', ')}. L’associazione stimata non è una prova di causa-effetto: serve un disegno che escluda fattori confondenti.`
        : 'Nessun predittore mostra un effetto affidabile: il modello, così com’è, non è uno strumento di previsione utile su questi dati.',
      `Equazione stimata: ${depName} = ${show(num(coefficients[0], 'b'), 3)}${predictors.map(row => ` + (${show(num(row, 'b'), 3)}) × ${text(row, 'predictor')}`).join('')}.`,
    ],
  });

  return {
    id: 'report-regression',
    title: 'Report di lettura — Regressione',
    headline,
    badge: modelSignificant ? 'Modello utile' : 'Modello non utile',
    tone: modelSignificant ? (Number.isFinite(bpP) && bpP < alphaOf(level) ? 'caution' : 'positive') : 'neutral',
    intro: [
      `Stima come ${depName} cambia al variare di ${predNames.join(', ')} e quanto quella relazione spiega dei dati osservati.`,
      'Il modello cerca la retta (o l’iperpiano) che rende minima la somma degli scarti al quadrato: i coefficienti indicano l’effetto di ogni variabile tenendo ferme le altre.',
    ],
    sections,
    limitations: [
      'La regressione descrive associazioni, non cause: variabili omesse o invertite possono spiegare lo stesso pattern.',
      'Le previsioni valgono solo dentro l’intervallo dei valori osservati: fuori da quel range l’estrapolazione è arbitraria.',
      'Le righe incomplete vengono scartate per intero: se i dati mancanti non sono casuali il modello può essere distorto.',
    ],
  };
};
