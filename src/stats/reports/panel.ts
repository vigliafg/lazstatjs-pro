import { copy } from '../reportCopy';
import {
  alphaText,
  describeP,
  isDecided,
  num,
  rowBy,
  rowsOf,
  show,
  showCI,
  text,
  type ReportSpec,
} from './shared';
import type { TableSpec } from '../types';

/** Reading of the coefficients, read from the table rows themselves. */
const coefficientSentence = (row: Record<string, unknown>, termKey = 'term'): string =>
  copy('{s1}: B = {s2} (CI {s3}), {s4}.', {
    s1: String(row[termKey] ?? '—'),
    s2: show(Number(row.beta), 4),
    s3: showCI(Number(row.ciLo), Number(row.ciHi)),
    s4: describeP(Number(row.p)),
  });

/**
 * Written interpretation of a panel run.
 *
 * As in the other reports of the wave, the prose reads the tables already shown
 * to the user: it never re-estimates the model and cannot disagree with the
 * numbers on screen. No kernel import is needed.
 */
export const panelReport = (tables: TableSpec[], depName: string, level: number): ReportSpec => {
  const feRows = rowsOf(tables, 'panel-fe');
  const reRows = rowsOf(tables, 'panel-re');
  const fitRows = rowsOf(tables, 'panel-fit');
  const varianceRows = rowsOf(tables, 'panel-variance');
  const hausmanRow = rowsOf(tables, 'panel-hausman')[0];

  // The fit table builds the R² labels from a template with the model name as
  // parameter, so the report must rebuild the same message (and not a literal
  // "R² within (FE)") for `rowBy` to find the row in every language.
  const fitValue = (template: string, parameter?: string): string =>
    text(
      rowBy(fitRows, 'metric', parameter === undefined ? copy(template) : copy(template, { s1: parameter })),
      'value'
    );
  const varianceValue = (label: string): string =>
    text(rowBy(varianceRows, 'component', copy(label)), 'value');

  const primary = feRows.length > 0 ? feRows : reRows;
  const primaryLabel = feRows.length > 0 ? copy('FE') : copy('RE');
  const slopes = primary.filter(row => text(row, 'term') !== copy('(Intercept)'));
  const significant = slopes.filter(row => isDecided(num(row, 'p'), level));

  const hausmanP = num(hausmanRow, 'p');
  const hausmanStatistic = num(hausmanRow, 'statistic');
  const hausmanValid =
    hausmanRow !== undefined &&
    text(hausmanRow, 'verdict') === copy('Differenza tra le covarianze definita positiva');
  const decided = hausmanRow !== undefined && hausmanValid && isDecided(hausmanP, level);

  const headline =
    hausmanRow !== undefined && !hausmanValid
      ? copy('Il test di Hausman non è definito positivamente: la scelta tra FE e RE va argomentata dal disegno, non dal test.')
      : hausmanRow !== undefined && decided
        ? copy('Hausman rifiuta il modello a effetti casuali (χ² = {s1}, {s2}): gli effetti di entità sono correlati con i regressori.', {
            s1: show(hausmanStatistic, 3),
            s2: describeP(hausmanP, 'p'),
          })
        : hausmanRow !== undefined
          ? copy('Hausman non rifiuta il modello a effetti casuali (χ² = {s1}, {s2}): il RE resta l’opzione più efficiente.', {
              s1: show(hausmanStatistic, 3),
              s2: describeP(hausmanP, 'p'),
            })
          : slopes.length === 0
            ? copy('Il modello panel non contiene regressori oltre all’intercetta.')
            : copy('{s1} spiegato da {s2} regressore/i nel modello a effetti {s3}.', {
                s1: depName,
                s2: slopes.length,
                s3: primaryLabel === copy('FE') ? copy('fissi') : copy('casuali'),
              });

  const badge =
    hausmanRow !== undefined
      ? copy('FE + RE')
      : primaryLabel === copy('FE')
        ? copy('Effetti fissi')
        : copy('Effetti casuali');

  const tone =
    hausmanRow !== undefined && !hausmanValid
      ? 'caution'
      : significant.length > 0
        ? 'positive'
        : 'neutral';

  const sections: ReportSpec['sections'] = [
    {
      heading: copy('La lettura dei risultati'),
      body: [
        copy('Il modello usa {s1} osservazioni su {s2} entità e {s3} periodi; il panel è {s4}.', {
          s1: fitValue('Osservazioni'),
          s2: fitValue('Entità'),
          s3: fitValue('Periodi'),
          s4: fitValue('Panel bilanciato') === copy('sì') ? copy('bilanciato') : copy('non bilanciato'),
        }),
        copy('R² within = {s1}, R² between = {s2}, R² overall = {s3} per il modello a effetti {s4}.', {
          s1: fitValue('R² within ({s1})', primaryLabel),
          s2: fitValue('R² between ({s1})', primaryLabel),
          s3: fitValue('R² overall ({s1})', primaryLabel),
          s4: primaryLabel === copy('FE') ? copy('fissi') : copy('casuali'),
        }),
        significant.length === 0
          ? copy('Nessun coefficiente di regressore è significativo al livello scelto (p < {s1}).', {
              s1: alphaText(level),
            })
          : copy('{s1} coefficiente/i di regressore su {s2} sono significativi al livello scelto (p < {s3}).', {
              s1: significant.length,
              s2: slopes.length,
              s3: alphaText(level),
            }),
        ...primary.map(row => coefficientSentence(row)),
      ],
    },
    {
      heading: copy('Componenti di varianza'),
      body: [
        copy('σ² idiosincratico = {s1}: è la variabilità che resta dentro ogni entità dopo i regressori.', {
          s1: varianceValue('σ² idiosincratico (entro entità)'),
        }),
        copy('σ² entità = {s1}: misura quanto i livelli medi delle entità differiscono tra loro.', {
          s1: varianceValue('σ² entità (tra entità)'),
        }),
        copy('θ = {s1}: è il peso della media di entità nella trasformazione del modello RE; con θ vicino a uno il RE si avvicina al FE.', {
          s1: varianceValue('θ (quasi-demeaning)'),
        }),
      ],
    },
  ];

  if (hausmanRow !== undefined) {
    sections.push({
      heading: copy('Scelta tra effetti fissi e casuali'),
      body: [
        copy('Hausman verifica se gli effetti di entità sono correlati con i regressori: sotto l’ipotesi nulla il modello a effetti casuali è coerente ed efficiente.'),
        hausmanValid
          ? copy('Statistica χ² = {s1} con {s2} gradi di libertà, {s3}.', {
              s1: show(hausmanStatistic, 4),
              s2: String(num(hausmanRow, 'df')),
              s3: describeP(hausmanP),
            })
          : copy('La differenza tra le matrici di covarianza non è definita positiva: la statistica ({s1}) non ha una distribuzione χ² valida e va letta solo come diagnostica.', {
              s1: show(hausmanStatistic, 4),
            }),
        decided
          ? copy('Il test rifiuta l’ipotesi nulla: il modello a effetti fissi è la scelta coerente, perché il RE sarebbe distorto dalla correlazione tra effetti e regressori.')
          : hausmanValid
            ? copy('Il test non rifiuta l’ipotesi nulla: il modello a effetti casuali resta preferibile per efficienza, se le assunzioni sul disegno sono credibili.')
            : copy('Quando il test non è utilizzabile, la scelta dipende dal disegno: effetti fissi se le differenze tra entità sono sistematiche, effetti casuali se le entità sono un campione casuale.'),
      ],
    });
  }

  sections.push({
    heading: copy('Assunzioni e cautele'),
    bullets: [
      copy('Le osservazioni della stessa entità sono correlate nel tempo: il FE riporta errori standard cluster-robust per entità e il RE li affianca a quelli classici, che non correggono l’autocorrelazione.'),
      copy('Il modello è a effetti individuali: shock comuni a tutti i periodi (effetti temporali) non sono inclusi e possono distorcere stime e test.'),
      copy('La variabile dipendente ritardata tra i regressori introduce una distorsione (bias di Nickell) che né FE né RE correggono: servono stimatori GMM dinamici, non disponibili in questa procedura.'),
      copy('Con panel non bilanciati la decomposizione usa la media armonica dei periodi; software diversi possono adottare correzioni dei gradi di libertà differenti.'),
    ],
  });

  return {
    id: 'report-panel',
    title: copy('Report di lettura — Modelli panel (FE/RE)'),
    headline,
    badge,
    tone,
    intro: [
      copy('Un panel osserva le stesse entità in più periodi: separare la variabilità dentro ciascuna entità da quella tra entità è il problema centrale di questi modelli.'),
      copy('Gli effetti fissi eliminano ogni caratteristica stabile dell’entità, anche non osservata; gli effetti casuali la trattano come un effetto casuale non correlato con i regressori e guadagnano efficienza se questa ipotesi regge.'),
    ],
    sections,
    limitations: [
      copy('Non sono inclusi effetti temporali a due vie, panel dinamici (GMM di Arellano–Bond) né stimatori per variabili strumentali panel.'),
      copy('Il modello RE assume che gli effetti di entità non siano correlati con i regressori: se l’ipotesi è falsa la stima è distorta, e il test di Hausman può non essere informativo.'),
      copy('La procedura richiede righe complete e una cella entità-periodo per osservazione: dati mancanti o duplicati vanno sistemati prima del run.'),
    ],
  };
};
