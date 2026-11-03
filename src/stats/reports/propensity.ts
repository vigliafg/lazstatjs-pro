import { copy } from '../reportCopy';
import type { ReportSpec } from './shared';
import { describeP, isDecided, num, rowsOf, show, showCI, text } from './shared';
import type { TableSpec } from '../types';

const numericText = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

/**
 * Discursive report for a propensity-score run.
 *
 * It reads only the tables already shown to the user: the prose cannot diverge
 * from the numbers, and no kernel is imported here.
 */
export const propensityReport = (
  tables: TableSpec[],
  level: number,
  treatmentName: string,
  outcomeName: string
): ReportSpec => {
  const attRows = rowsOf(tables, 'propensity-att');
  const balanceRows = rowsOf(tables, 'propensity-balance');
  const sampleRows = rowsOf(tables, 'propensity-sample');
  const modelRows = rowsOf(tables, 'propensity-model');

  const attRow = attRows[0];
  const estimate = num(attRow, 'estimate');
  const se = num(attRow, 'se');
  const p = num(attRow, 'p');
  const lo = num(attRow, 'lo');
  const hi = num(attRow, 'hi');
  const method = text(attRow, 'method');
  const significant = isDecided(p, level);
  const excludesZero = Number.isFinite(lo) && Number.isFinite(hi) && (lo > 0 || hi < 0);

  const smdAfter = balanceRows
    .map(row => num(row, 'smdAfter'))
    .filter(Number.isFinite)
    .map(value => Math.abs(value));
  const worstSmd = smdAfter.length > 0 ? Math.max(...smdAfter) : Number.NaN;
  const imbalanced = Number.isFinite(worstSmd) && worstSmd > 0.1;
  const predictors = modelRows.filter(row => text(row, 'term') !== '(Intercept)');
  const significantPredictors = predictors.filter(row => isDecided(num(row, 'p'), level)).length;

  const sampleValue = (label: string): string => {
    const row = sampleRows.find(item => text(item, 'metric') === copy(label));
    return text(row, 'value');
  };
  const treated = sampleValue('N trattati');
  const controls = sampleValue('N controlli');
  const dropped = sampleValue('Trattati scartati (fuori caliper)');
  const ess = numericText(sampleValue('Effective sample size'));
  const support = sampleValue('Supporto comune');

  const methodText = method === 'Matching' ? copy('matching per vicinino più prossimo') : 'IPW';

  return {
    id: 'report-propensity',
    title: copy('Report di lettura — Propensity score'),
    headline: Number.isFinite(estimate)
      ? copy('ATT di {s1} su {s2} = {s3} (CI {s4}%), {s5}.', {
          s1: treatmentName,
          s2: outcomeName,
          s3: show(estimate, 4),
          s4: level,
          s5: describeP(p),
        })
      : copy('L’ATT non è calcolabile con i dati e i parametri scelti.'),
    badge: copy('Propensity'),
    tone: !Number.isFinite(estimate) || imbalanced ? 'caution' : significant ? 'positive' : 'neutral',
    intro: [
      copy('Metodo: {s1}. Trattati: {s2}; controlli: {s3}.', {
        s1: methodText,
        s2: treated,
        s3: controls,
      }),
      copy('ATT = {s1} (SE {s2}, CI {s3}%: {s4}).', {
        s1: show(estimate, 4),
        s2: show(se, 4),
        s3: level,
        s4: showCI(lo, hi, 4),
      }),
    ],
    sections: [
      {
        heading: copy('Modello di propensione'),
        bullets: [
          copy('{s1} covariabili nel modello; {s2} risultano associate al trattamento al livello scelto.', {
            s1: predictors.length,
            s2: significantPredictors,
          }),
          copy('La bontà del modello di propensione si valuta dal bilanciamento prodotto, non dall’AUC o dai p dei coefficienti.'),
        ],
      },
      {
        heading: copy('Bilanciamento e stima'),
        bullets: [
          copy('Il valore assoluto più alto degli SMD dopo l’aggiustamento è {s1}.', {
            s1: show(worstSmd, 3),
          }),
          imbalanced
            ? copy('Resta uno squilibrio superiore a 0.1: l’ATT va letto con cautela e il modello di propensione può essere rivisto.')
            : copy('Nessuna covariabile supera la soglia convenzionale di 0.1 dopo l’aggiustamento.'),
          copy('Trattati scartati per assenza di controlli nel caliper: {s1}. Supporto comune: {s2}.', {
            s1: dropped === '' ? '0' : dropped,
            s2: support === '' ? '—' : support,
          }),
          Number.isFinite(ess)
            ? copy('Effective sample size = {s1}: pesi estremi riducono l’informazione disponibile.', {
                s1: show(ess, 1),
              })
            : copy('Effective sample size non calcolabile.'),
        ],
      },
      {
        heading: copy('Come leggerlo'),
        bullets: [
          excludesZero
            ? copy('L’intervallo di confidenza non contiene lo zero: la direzione dell’effetto è coerente, ma resta un’associazione aggiustata, non una prova automatica di causalità.')
            : copy('L’intervallo di confidenza contiene lo zero: i dati non escludono un effetto nullo.'),
          copy('Il matching confronta unità con punteggi simili; l’IPW ricostruisce un campione pseudo-trattato con pesi. Entrambi richiedono che le covariabili osservate bastino a controllare il confounding.'),
        ],
      },
    ],
    limitations: [
      copy('Confounding non misurato: nessun metodo basato sul propensity score può correggere variabili non osservate o mal misurate.'),
      copy('Il matching 1:k con reimmissione riusa i controlli; con rapporto maggiore di 1 l’ATT resta una media di differenze appaiate, non un campione indipendente.'),
      copy('L’IPW può produrre pesi estremi quando i punteggi sono vicini a 1; l’effective sample size segnala la perdita di informazione.'),
      copy('Il supporto comune è descritto dall’intervallo dei punteggi, non da un test formale di sovrapposizione.'),
    ],
  };
};
