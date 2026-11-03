import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { TableSpec } from '../types';
import type { QuantileResult } from '../kernels/quantile';

export interface QuantileTableNames {
  dep: string;
  predictors: string[];
}

/**
 * Tabelle della regressione quantilica.
 *
 * La tabella dei coefficienti riporta sempre l'intercetta come prima riga, con
 * l'etichetta stabile `(Intercept)` usata anche dal report. La tabella di
 * adattamento raccoglie i metadati del run: quantile target, osservazioni,
 * parametri, iterazioni del simplesso e perdita asimmetrica minima.
 */
export const quantileTables = (
  result: QuantileResult,
  names: QuantileTableNames
): TableSpec[] => {
  const meanAbsoluteResidual =
    result.residuals.length === 0
      ? Number.NaN
      : result.residuals.reduce((sum, value) => sum + Math.abs(value), 0) /
        result.residuals.length;

  const coefficientRows = result.coefficients.map((coefficient, index) => ({
    predictor: index === 0 ? copy('(Intercept)') : names.predictors[index - 1] ?? `X${index}`,
    beta: coefficient.beta,
    se: coefficient.se,
    t: coefficient.t,
    p: coefficient.p,
    ciLo: coefficient.ciLo,
    ciHi: coefficient.ciHi,
  }));

  return [
    {
      id: 'quantile-coefficients',
      title: copy('Coefficienti della regressione quantilica'),
      subtitle: copy('{s1} · τ = {s2}', {
        s1: names.dep,
        s2: fmtEst(result.tau, 2),
      }),
      columns: [
        { key: 'predictor', label: copy('Predittore'), format: 'text' },
        { key: 'beta', label: copy('Coefficiente'), format: 'dec4' },
        { key: 'se', label: copy('SE'), format: 'dec4' },
        { key: 't', label: copy('t'), format: 'dec4' },
        { key: 'p', label: copy('p'), format: 'p' },
        { key: 'ciLo', label: copy('CI low'), format: 'dec4' },
        { key: 'ciHi', label: copy('CI high'), format: 'dec4' },
      ],
      rows: coefficientRows,
      notes: [
        copy('β misura la variazione del quantile τ della risposta per una unità in più del predittore, al netto degli altri.'),
        copy('L’intercetta è il quantile τ stimato quando tutti i predittori valgono zero.'),
        copy('Gli intervalli sono normali al 95%; il p è di Wald a due code e usa errori standard approssimati.'),
      ],
    },
    {
      id: 'quantile-fit',
      title: copy('Adattamento del modello quantilico'),
      subtitle: copy('{s1} osservazioni · {s2} parametri', {
        s1: result.n,
        s2: result.p,
      }),
      columns: [
        { key: 'metric', label: copy('Metrica'), format: 'text' },
        { key: 'value', label: copy('Valore'), format: 'text' },
      ],
      rows: [
        { metric: copy('Quantile (τ)'), value: fmtEst(result.tau, 2) },
        { metric: copy('Osservazioni'), value: String(result.n) },
        { metric: copy('Parametri'), value: String(result.p) },
        { metric: copy('Iterazioni'), value: String(result.iterations) },
        {
          metric: copy('Convergenza'),
          value: result.converged ? copy('sì') : copy('no'),
        },
        { metric: copy('Funzione obiettivo'), value: fmtEst(result.objective, 4) },
        {
          metric: copy('Residui assoluti medi'),
          value: fmtEst(meanAbsoluteResidual, 4),
        },
      ],
      notes: [
        copy('La funzione obiettivo è la somma della perdita asimmetrica ρτ: con τ = 0,5 coincide con la regressione mediana.'),
        copy('Il numero di iterazioni conta i pivot del simplesso; un valore molto alto segnala un problema numerico.'),
      ],
    },
  ];
};
