import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { TableSpec } from '../types';
import type { NonlinearModelType, NonlinearResult } from '../kernels/nonlinear';

/** Nome leggibile del modello, con la stessa parola usata dal form. */
export const nonlinearModelLabel = (model: NonlinearModelType): string => {
  switch (model) {
    case 'exponential':
      return copy('Esponenziale');
    case 'logistic':
      return copy('Logistica');
    case 'gompertz':
      return copy('Gompertz');
    case 'power':
      return copy('Potenza');
    case 'michaelis':
      return copy('Michaelis–Menten');
  }
};

export interface NonlinearNames {
  dep: string;
  predictor: string;
}

/**
 * Tabelle della regressione non lineare: i parametri della curva e la sintesi
 * dell'adattamento. Il report legge queste stesse righe, così la prosa non può
 * contraddire i numeri mostrati.
 */
export const nonlinearTables = (result: NonlinearResult, names: NonlinearNames): TableSpec[] => [
  {
    id: 'nonlinear-parameters',
    title: copy('Parametri del modello'),
    subtitle: copy('{s1} · N = {s2}', {
      s1: nonlinearModelLabel(result.model),
      s2: result.n,
    }),
    columns: [
      { key: 'parameter', label: copy('Parametro'), format: 'text' },
      { key: 'estimate', label: copy('Stima'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 't', label: copy('t'), format: 'dec3' },
      { key: 'p', label: copy('p'), format: 'p' },
      { key: 'ciLo', label: copy('CI low'), format: 'dec4' },
      { key: 'ciHi', label: copy('CI high'), format: 'dec4' },
    ],
    rows: result.parameters.map(parameter => ({
      parameter: parameter.name,
      estimate: parameter.estimate,
      se: parameter.se,
      t: parameter.t,
      p: parameter.p,
      ciLo: parameter.ciLo,
      ciHi: parameter.ciHi,
    })),
    notes: [
      copy('Le stime sono ai minimi quadrati sulla curva scelta; gli errori standard vengono dalla matrice jacobiana al punto di ottimo.'),
      copy('Il test t riguarda il singolo parametro: p piccolo indica che il parametro è distinto da zero nella scala della curva.'),
    ],
  },
  {
    id: 'nonlinear-fit',
    title: copy('Bontà di adattamento'),
    subtitle: copy('{s1} su {s2}', { s1: names.dep, s2: names.predictor }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'text' },
    ],
    rows: [
        { metric: copy('Errore quadratico medio (MSE)'), value: result.sse / Math.max(1, result.df) },
      { metric: copy('Modello'), value: nonlinearModelLabel(result.model) },
      { metric: copy('Osservazioni'), value: String(result.n) },
      { metric: copy('df'), value: String(result.df) },
      { metric: copy('SSE'), value: fmtEst(result.sse, 4) },
      { metric: copy('R²'), value: fmtEst(result.r2, 4) },
      { metric: copy('R² corretto'), value: fmtEst(result.adjR2, 4) },
      { metric: copy('RMSE'), value: fmtEst(result.rmse, 4) },
      { metric: copy('Iterazioni'), value: String(result.iterations) },
      { metric: copy('Convergenza'), value: result.converged ? copy('Sì') : copy('No') },
    ],
    notes: [
      copy('R² confronta la curva con la media di Y: non dice se la forma del modello è quella giusta, solo quanto spiega rispetto a una retta piatta.'),
      copy('RMSE è nella stessa unità della variabile dipendente e riassume l’errore tipico della curva.'),
    ],
  },
];
