import { copy } from '../reportCopy';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';
import { describeP, isDecided, rowsOf } from './shared';

/**
 * Written interpretation of a 2SLS run.
 *
 * The text reads the tables already shown to the user (structural equation,
 * first stage, diagnostics): it never recomputes the estimates, so the prose
 * cannot disagree with the numbers on screen.
 */
export const ivReport = (
  tables: TableSpec[],
  depName: string,
  robust: boolean,
  level: number
): ReportSpec => {
  const structural = rowsOf(tables, 'iv-structural').filter(
    row => String(row.term) !== '(Intercept)'
  );
  const firstStage = rowsOf(tables, 'iv-first-stage').filter(row => typeof row.f === 'number');
  const diagnostics = rowsOf(tables, 'iv-diagnostics');

  const diagnostic = (metric: string) =>
    diagnostics.find(row => String(row.metric) === metric);
  const valueOf = (metric: string): number =>
    Number(diagnostic(metric)?.value ?? Number.NaN);
  const pOf = (metric: string): number => Number(diagnostic(metric)?.p ?? Number.NaN);

  const significant = structural.filter(row => isDecided(Number(row.p), level));
  const weak = firstStage.filter(row => Number(row.f) < 10);
  const sargan = diagnostic('Sargan');
  const wuHausman = diagnostic('Wu–Hausman');
  const sarganP = pOf('Sargan');
  const wuP = pOf('Wu–Hausman');

  const engagement = !sargan || Number.isNaN(sarganP)
    ? copy('Il test di Sargan non è calcolabile con identificazione esatta.')
    : isDecided(sarganP, level)
      ? copy('Sargan rifiuta la validità degli strumenti: la specificazione va discussa.')
      : copy('Sargan non rifiuta la validità congiunta degli strumenti.');
  const exogeneity = !wuHausman || Number.isNaN(wuP)
    ? copy('Il test di Wu–Hausman non è calcolabile con identificazione esatta.')
    : isDecided(wuP, level)
      ? copy('Wu–Hausman indica endogeneità: la stima 2SLS è preferibile all’OLS.')
      : copy('Wu–Hausman non rifiuta l’esogeneità dei regressori strumentati.');

  const headline =
    structural.length === 0
      ? copy('L’equazione strutturale non contiene regressori oltre all’intercetta.')
      : copy('{s1} spiegato con 2SLS da {s2} regressore/i; R² = {s3}, sigma = {s4}.', {
          s1: depName,
          s2: structural.length,
          s3: valueOf('R²').toFixed(3),
          s4: valueOf('Sigma').toFixed(3),
        });

  return {
    id: 'report-iv',
    title: copy('Report di lettura — Variabili strumentali (2SLS)'),
    headline,
    badge: copy('Regressione'),
    tone: weak.length > 0 ? 'caution' : significant.length > 0 ? 'positive' : 'neutral',
    intro: [
      copy('La stima 2SLS sostituisce i regressori endogeni con la parte spiegata dagli strumenti: il coefficiente misura l’effetto della variazione esogena, non della variabile osservata.'),
      copy('La coerenza della stima dipende da due ipotesi non verificabili con i soli dati: gli strumenti devono essere rilevanti per i regressori endogeni ed esclusi dall’equazione strutturale.'),
    ],
    sections: [
      {
        heading: copy('Risultato'),
        bullets: [
          copy('Osservazioni = {s1}; R² = {s2}; R² corretto = {s3}; sigma = {s4}.', {
            s1: diagnostic('Osservazioni')?.value ?? '—',
            s2: valueOf('R²').toFixed(4),
            s3: valueOf('R² corretto').toFixed(4),
            s4: valueOf('Sigma').toFixed(4),
          }),
          ...firstStage.map(row =>
            copy('Primo stadio di {s1}: F = {s2} (df {s3}), {s4}.', {
              s1: String(row.endog),
              s2: Number(row.f).toFixed(3),
              s3: String(row.df1),
              s4:
                Number(row.f) < 10
                  ? copy('strumenti potenzialmente deboli')
                  : copy('strumenti sufficientemente forti'),
            })
          ),
          copy('Sargan: {s1}. {s2}', {
            s1: describeP(sarganP, 'p(Sargan)'),
            s2: engagement,
          }),
          copy('Wu–Hausman: {s1}. {s2}', {
            s1: describeP(wuP, 'p(Wu–Hausman)'),
            s2: exogeneity,
          }),
          ...structural.map(row =>
            copy('{s1}: B = {s2} (CI {s3} – {s4}), {s5}.', {
              s1: String(row.term),
              s2: Number(row.beta).toFixed(4),
              s3: Number(row.ciLo).toFixed(4),
              s4: Number(row.ciHi).toFixed(4),
              s5: describeP(Number(row.p)),
            })
          ),
        ],
      },
      {
        heading: copy('Come leggerlo'),
        bullets: [
          copy('Un F parziale del primo stadio inferiore a 10 è un segnale convenzionale di strumenti deboli: la stima può essere molto imprecisa e gli errori standard ingannevoli.'),
          copy('Sargan richiede più strumenti che regressori endogeni e verifica solo l’ortogonalità congiunta: un p alto non dimostra che gli strumenti siano validi.'),
          copy('Wu–Hausman confronta OLS e 2SLS: un p basso suggerisce che il regressore sia effettivamente endogeno e che l’OLS sia distorto.'),
          robust
            ? copy('Sono riportati errori standard HC1 robusti all’eteroschedasticità: cambiano le inferenze, non i coefficienti.')
            : copy('Gli errori standard sono omoschedastici: se la varianza dei residui non è costante, attiva gli errori robusti HC1.'),
        ],
      },
    ],
    limitations: [
      copy('La validità degli strumenti non è verificabile dai dati: rilevanza ed esclusione vanno argomentate dal disegno dello studio.'),
      copy('Il motore stima modelli lineari; con più regressori endogeni la diagnostica è riportata per ciascun primo stadio, ma il test di Sargan resta congiunto.'),
      copy('Con identificazione esatta Sargan e Wu–Hausman non sono calcolabili; con strumenti deboli l’inferenza asintotica è fragile.'),
    ],
  };
};
