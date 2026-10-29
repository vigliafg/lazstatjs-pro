import type { ReportSection, ReportSpec, TableRow, TableSpec } from './shared';
import { copy } from '../reportCopy';
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
  const adjR2 = num(rowBy(model, 'metric', copy('Adjusted R²')), 'value');
  const f = num(rowBy(model, 'metric', 'F'), 'value');
  const fP = num(rowBy(model, 'metric', 'p (F)'), 'value');
  const modelSignificant = isDecided(fP, level);

  const coefficients = rowsOf(tables, 'reg-coefficients');
  const predictors = coefficients.filter(row => text(row, 'predictor') !== '(Intercept)');
  const significantPredictors = predictors.filter(row => isDecided(num(row, 'p'), level));

  const diagnostics = rowsOf(tables, 'reg-diagnostics');
  const bpP = num(rowBy(diagnostics, 'metric', copy('Breusch–Pagan p')), 'value');
  const residOutliers = num(rowBy(diagnostics, 'metric', copy('Residui studentizzati |z| > 3')), 'value');
  const vifValues = predictors
    .map(row => num(row, 'vif'))
    .filter(value => Number.isFinite(value));
  const maxVif = vifValues.length > 0 ? Math.max(...vifValues) : NaN;

  const residualStats = rowsOf(tables, 'reg-residuals');
  const jbP = num(rowBy(residualStats, 'metric', copy('Jarque–Bera p')), 'ols');
  const lillieforsP = num(rowBy(residualStats, 'metric', copy('Lilliefors p')), 'ols');

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
    const direction = Number.isFinite(b) ? (b > 0 ? copy('aumenta') : b < 0 ? copy('diminuisce') : copy('non cambia')) : copy('non stimabile');
    return copy('{s1}: B = {s2} (CI {s3}% {s4}), {s5} → {s6}. In media, un aumento di una unità di {s7} {s8} {s9} di {s10} a parità delle altre variabili{s11}{s12}.', { s1: name, s2: show(b, 3), s3: level, s4: showCI(lo, hi, 3), s5: describeP(pValue), s6: isDecided(pValue, level) ? copy('predittore significativo') : copy('nessuna evidenza di effetto'), s7: name, s8: direction, s9: depName, s10: show(Math.abs(b), 3), s11: Number.isFinite(beta) ? copy('; β standardizzato = {s1}', { s1: show(beta, 2) }) : '', s12: Number.isFinite(vif) && vif > 5 ? copy('; VIF = {s1} segnala collinearità', { s1: show(vif, 2) }) : '' });
  });

  const headline = !Number.isFinite(fP)
    ? copy('Il modello non è stimabile con i dati disponibili.')
    : modelSignificant
      ? copy('Il modello è significativo (F = {s1}, {s2}) e spiega il {s3}% della variabilità di {s4}.', { s1: show(f, 3), s2: describeP(fP), s3: show((r2 ?? 0) * 100, 1), s4: depName })
      : copy('Il modello non è significativo (F = {s1}, {s2}): i predittori non spiegano {s3} meglio del caso.', { s1: show(f, 3), s2: describeP(fP), s3: depName });

  const sections: ReportSection[] = [
    {
      heading: copy('Il modello nel suo insieme'),
      bullets: [
        copy('Osservazioni usate: {s1} (solo righe complete su tutte le variabili del modello).', { s1: showInt(nObs) }),
        copy('R² = {s1} → il modello spiega il {s2}% della variabilità di {s3}.', { s1: show(r2, 3), s2: show((r2 ?? 0) * 100, 1), s3: depName }),
        copy('R² corretto = {s1} → quota spiegata al netto del numero di predittori; se è molto più basso di R² il modello è sovra-adattato.', { s1: show(adjR2, 3) }),
        copy('Test globale: F = {s1}, {s2} (α = {s3}) → {s4}.', { s1: show(f, 3), s2: describeP(fP), s3: alpha, s4: modelSignificant ? copy('il modello nel complesso è utile') : copy('il modello nel complesso non è distinguibile dal caso') }),
      ],
    },
    {
      heading: copy('Ogni predittore'),
      bullets: predictorBullets.length > 0 ? predictorBullets : [copy('Nessun coefficiente disponibile.')],
    },
    {
      heading: 'Diagnostica',
      bullets: [
        Number.isFinite(bpP)
          ? copy('Breusch–Pagan {s1} → {s2}.', { s1: describeP(bpP), s2: bpP < alphaOf(level) ? copy('eteroschedasticità dei residui: gli errori standard e i p-value possono essere inaffidabili') : copy('nessuna evidenza di eteroschedasticità') })
          : copy('Eteroschedasticità non verificabile.'),
        Number.isFinite(jbP) ? copy('Normalità dei residui: Jarque–Bera {s1}{s2} → {s3}.', { s1: describeP(jbP), s2: Number.isFinite(lillieforsP) ? copy(', Lilliefors {s1}', { s1: describeP(lillieforsP) }) : '', s3: jbP < alphaOf(level) ? copy('residui non gaussiani: gli intervalli di confidenza vanno letti con prudenza') : copy('nessuna evidenza contro la normalità dei residui') }) : '',
        Number.isFinite(residOutliers) && residOutliers > 0 ? copy('{s1} osservazioni con residuo studentizzato oltre 3 SD: verificane l’influenza sulle stime.', { s1: showInt(residOutliers) }) : copy('Nessun residuo studentizzato oltre 3 SD: nessun caso fortemente anomalo rispetto al modello.'),
        Number.isFinite(maxVif) ? copy('VIF massimo = {s1} {s2}.', { s1: show(maxVif, 2), s2: maxVif > 5 ? copy('→ collinearità problematica: i coefficienti dei predittori coinvolti sono instabili') : copy('→ collinearità sotto la soglia di attenzione (5)') }) : '',
      ].filter(Boolean),
    },
  ];

  if (slopeRow) {
    sections.push({
      heading: copy('Stima robusta Theil–Sen'),
      body: [
        copy('Confronto tra OLS e stimatore robusto{s1}: se le due pendenze sono simili, gli outlier non stanno distorcendo il risultato.', { s1: robustSummary ? copy(' ({s1})', { s1: robustSummary }) : '' }),
      ],
      bullets: [
        copy('Pendenza OLS = {s1}, pendenza Theil–Sen = {s2} (CI {s3}% {s4}).', { s1: show(num(slopeRow, 'ols'), 3), s2: show(num(slopeRow, 'ts'), 3), s3: level, s4: showCI(num(slopeRow, 'ciLo'), num(slopeRow, 'ciHi'), 3) }),
        copy('Differenza percentuale: {s1}%.', { s1: Number.isFinite(num(slopeRow, 'ols')) && num(slopeRow, 'ols') !== 0 ? show(Math.abs((num(slopeRow, 'ts') - num(slopeRow, 'ols')) / num(slopeRow, 'ols')) * 100, 1) : '—' }),
      ],
    });
  }

  sections.push({
    heading: copy('Come leggere i numeri'),
    bullets: [
      copy('B è il cambiamento atteso nella variabile dipendente per una unità in più del predittore, tenendo fermi gli altri: l’unità conta, e molto.'),
      copy('Il CI al {s1}% del coefficiente è la forbice dei valori plausibili: se contiene lo zero l’effetto non è distinguibile da nessun effetto.', { s1: level }),
      P_SENTENCE,
      copy('R² alto non significa modello corretto: guarda sempre residui, diagnostica e senso delle variabili.'),
    ],
  });

  sections.push({
    heading: copy('In pratica'),
    body: [
      modelSignificant && significantPredictors.length > 0
        ? copy('I predittori con effetto affidabile sono: {s1}. L’associazione stimata non è una prova di causa-effetto: serve un disegno che escluda fattori confondenti.', { s1: significantPredictors.map(row => text(row, 'predictor')).join(', ') })
        : copy('Nessun predittore mostra un effetto affidabile: il modello, così com’è, non è uno strumento di previsione utile su questi dati.'),
      copy('Equazione stimata: {s1} = {s2}{s3}.', { s1: depName, s2: show(num(coefficients[0], 'b'), 3), s3: predictors.map(row => copy(' + ({s1}) × {s2}', { s1: show(num(row, 'b'), 3), s2: text(row, 'predictor') })).join('') }),
    ],
  });

  return {
    id: 'report-regression',
    title: copy('Report di lettura — Regressione'),
    headline,
    badge: modelSignificant ? copy('Modello utile') : copy('Modello non utile'),
    tone: modelSignificant ? (Number.isFinite(bpP) && bpP < alphaOf(level) ? 'caution' : 'positive') : 'neutral',
    intro: [
      copy('Stima come {s1} cambia al variare di {s2} e quanto quella relazione spiega dei dati osservati.', { s1: depName, s2: predNames.join(', ') }),
      copy('Il modello cerca la retta (o l’iperpiano) che rende minima la somma degli scarti al quadrato: i coefficienti indicano l’effetto di ogni variabile tenendo ferme le altre.'),
    ],
    sections,
    limitations: [
      copy('La regressione descrive associazioni, non cause: variabili omesse o invertite possono spiegare lo stesso pattern.'),
      copy('Le previsioni valgono solo dentro l’intervallo dei valori osservati: fuori da quel range l’estrapolazione è arbitraria.'),
      copy('Le righe incomplete vengono scartate per intero: se i dati mancanti non sono casuali il modello può essere distorto.'),
    ],
  };
};
