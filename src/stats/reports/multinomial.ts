import { fmtEst } from '../format';
import { copy, sourceOf } from '../reportCopy';
import { isDecided, numOf, rowsOf, textOf } from '../reportKit';
import type { ReportSpec } from '../report';
import { lrEffectsSection } from './effects';
import type { TableSpec } from '../types';

/**
 * Written report for a multinomial fit.
 *
 * It reads only the result tables, so the prose always agrees with the numbers
 * on screen and never calls the statistical kernel.
 */
export const multinomialReport = (tables: TableSpec[], level: number): ReportSpec => {
  const effectsSection = lrEffectsSection(tables, 'multinomial-effects', level);
  const fit = rowsOf(tables, 'multinomial-fit');
  const coefficientRows = rowsOf(tables, 'multinomial-coefficients');
  const classification = rowsOf(tables, 'multinomial-classification');

  const byMetric = (label: string) =>
    fit.find(row => sourceOf(textOf(row, 'metric')) === sourceOf(copy(label)));
  const metricNumber = (label: string) => numOf(byMetric(label), 'value');

  const n = metricNumber('Osservazioni');
  const classes = metricNumber('Classi');
  const accuracy = metricNumber('Accuratezza complessiva (%)');
  const reference = textOf(byMetric('Classe di riferimento'), 'value');
  const predictors = metricNumber('Predittori');
  const converged = textOf(byMetric('Convergenza'), 'value');

  const slopes = coefficientRows.filter(row => textOf(row, 'term') !== '(Intercept)');
  const significant = slopes.filter(row => isDecided(numOf(row, 'p'), level));
  const significantTerms = Array.from(new Set(significant.map(row => textOf(row, 'term'))));

  const describeClass = (row: (typeof classification)[number]): string =>
    copy('{s1}: {s2}% di classificazioni corrette ({s3} su {s4}).', {
      s1: textOf(row, 'class'),
      s2: fmtEst(numOf(row, 'accuracy'), 1),
      s3: numOf(row, 'correct'),
      s4: numOf(row, 'n'),
    });

  const best = classification.reduce<(typeof classification)[number] | undefined>(
    (winner, row) =>
      !winner || numOf(row, 'accuracy') > numOf(winner, 'accuracy') ? row : winner,
    undefined
  );

  return {
    id: 'report-multinomial',
    title: copy('Report di regressione multinomiale'),
    headline: copy(
      'Il modello distingue {s1} classi con un’accuratezza del {s2}%; la classe di riferimento è “{s3}”.',
      { s1: fmtEst(classes, 0), s2: fmtEst(accuracy, 1), s3: reference }
    ),
    badge:
      significantTerms.length > 0
        ? copy('Predittori associati all’esito')
        : copy('Nessun predittore significativo'),
    tone: significantTerms.length > 0 ? 'positive' : 'neutral',
    intro: [
      copy(
        'La regressione logistica multinomiale modella la probabilità di appartenenza a ciascuna di più classi nominali (non ordinate) a partire da uno o più predittori.'
      ),
      copy(
        'Ogni classe è confrontata con la classe di riferimento “{s1}”: i coefficienti descrivono quanto il logit di quella classe cambia rispetto al riferimento per un’unità in più del predittore.',
        { s1: reference }
      ),
      copy('Sono state analizzate {s1} osservazioni complete su {s2} classi e {s3} predittore/i.', {
        s1: n,
        s2: classes,
        s3: predictors,
      }),
    ],
    sections: [
      ...(effectsSection ? [effectsSection] : []),
      {
        heading: copy('La lettura dei risultati'),
        body: [
          copy(
            'Il modello classifica correttamente il {s1}% delle osservazioni; la classe con l’accuratezza più alta è {s2}.',
            {
              s1: fmtEst(accuracy, 1),
              s2: best
                ? copy('{s1} ({s2}%)', {
                    s1: textOf(best, 'class'),
                    s2: fmtEst(numOf(best, 'accuracy'), 1),
                  })
                : copy('non disponibile'),
            }
          ),
          significantTerms.length > 0
            ? copy(
                '{s1} predittore/i mostrano almeno un coefficiente significativo al livello scelto ({s2}).',
                {
                  s1: significantTerms.length,
                  s2: significantTerms.join(', '),
                }
              )
            : copy('Nessun coefficiente raggiunge la significatività al livello scelto.'),
          copy('Convergenza del modello: {s1}.', { s1: converged || copy('non disponibile') }),
        ],
      },
      {
        heading: copy('Accuratezza per classe'),
        body: classification.length > 0
          ? classification.map(row => describeClass(row))
          : [copy('La tabella di classificazione non è disponibile.')],
      },
      {
        heading: copy('Come leggere i coefficienti'),
        body: [
          copy(
            'Un odds ratio maggiore di 1 indica che un’unità in più del predittore aumenta le probabilità della classe rispetto al riferimento; un valore minore di 1 le riduce.'
          ),
          copy(
            'Gli odds ratio sono stimati al netto degli altri predittori e con un intervallo di confidenza al {s1}%: se l’intervallo contiene 1 l’effetto non è distinguibile da zero.',
            { s1: level }
          ),
          copy(
            'I test sui coefficienti sono di Wald (z = B/SE): con campioni piccoli o classi rare possono essere meno affidabili di un confronto basato sulla verosimiglianza.'
          ),
        ],
      },
      {
        heading: copy('Assunzioni e cautele'),
        bullets: [
          copy('Le osservazioni devono essere indipendenti tra loro (una riga = una unità).'),
          copy('Le classi dell’esito sono nominali: l’ordine alfabetico o numerico non implica una graduatoria.'),
          copy('La relazione tra ogni predittore e il logit delle classi è lineare: controlla la forma o usa trasformazioni.'),
          copy('Servono osservazioni sufficienti per ogni classe: classi rare o vuote rendono le stime instabili.'),
          copy('La separazione perfetta (classi predette senza errori) gonfia i coefficienti e invalida i test.'),
        ],
      },
    ],
    limitations: [
      copy('Non sono inclusi effetti casuali, interazioni tra predittori o regressione penalizzata.'),
      copy('L’accuratezza dipende dalla distribuzione delle classi: confrontala sempre con la frequenza della classe più comune.'),
      copy('Il modello non gestisce esiti ordinati: per categorie ordinate serve una regressione ordinale.'),
    ],
  };
};
