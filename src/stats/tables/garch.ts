import { fmtEst } from '../format';
import { copy } from '../reportCopy';
import type { TableSpec } from '../types';
import type { GarchFit } from '../kernels/garch';

export const garchTables = (fit: GarchFit): TableSpec[] => [
  {
    id: 'garch-model',
    title: copy('Modello GARCH(1,1)'),
    subtitle: copy('{s1} osservazioni', { s1: fit.n }),
    columns: [
      { key: 'metric', label: copy('Voce'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'text' },
    ],
    rows: [
      { metric: copy('Media'), value: fmtEst(fit.mean, 4) },
      { metric: copy('ω (varianza di base)'), value: fmtEst(fit.omega, 5) },
      { metric: copy('α (effetto ARCH)'), value: fmtEst(fit.alpha, 4) },
      { metric: copy('β (persistenza GARCH)'), value: fmtEst(fit.beta, 4) },
      { metric: copy('Persistenza α + β'), value: fmtEst(fit.persistence, 4) },
      { metric: copy('Varianza di lungo periodo'), value: fmtEst(fit.longRunVariance, 4) },
      { metric: copy('Emivita della volatilità'), value: fmtEst(fit.halfLife, 2) },
      { metric: copy('Log-verosimiglianza'), value: fmtEst(fit.logLik, 3) },
      { metric: 'AIC', value: fmtEst(fit.aic, 3) },
      { metric: 'BIC', value: fmtEst(fit.bic, 3) },
      { metric: copy('Convergenza'), value: fit.converged ? copy('raggiunta') : copy('non raggiunta') },
    ],
    notes: [
      copy('α misura la reazione alle innovazioni recenti; β la memoria della volatilità passata.'),
      copy('Con α + β vicino a 1 gli shock di volatilità persistono a lungo; se α + β ≥ 1 il processo non è stazionario in varianza.'),
      copy('La stima è di quasi-massima verosimiglianza gaussiana: non richiede la normalità per la consistenza, ma i test sui residui vanno letti con cautela.'),
    ],
  },
  {
    id: 'garch-coefficients',
    title: copy('Coefficienti del GARCH'),
    columns: [
      { key: 'term', label: copy('Parametro'), format: 'text' },
      { key: 'estimate', label: copy('Stima'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 'z', label: 'z', format: 'dec2' },
      { key: 'p', label: 'p', format: 'p' },
    ],
    rows: fit.coefficients.map(row => ({ ...row })),
    notes: [copy('Gli errori standard vengono dall’Hessiana numerica sulla scala trasformata: con pochi dati sono approssimati.')],
  },
  {
    id: 'garch-diagnostics',
    title: copy('Diagnostica dei residui standardizzati'),
    columns: [
      { key: 'test', label: copy('Test'), format: 'text' },
      { key: 'stat', label: copy('Statistica'), format: 'dec3' },
      { key: 'df', label: 'df', format: 'int' },
      { key: 'p', label: 'p', format: 'p' },
    ],
    rows: [
      {
        test: copy('Ljung–Box sui residui standardizzati'),
        stat: fit.ljungBox.q,
        df: fit.ljungBox.df,
        p: fit.ljungBox.p,
      },
      {
        test: copy('Jarque–Bera'),
        stat: fit.jarqueBera.stat,
        df: 2,
        p: fit.jarqueBera.p,
      },
    ],
    notes: [
      copy('Se il GARCH ha catturato la volatilità, i residui standardizzati non devono mostrare autocorrelazione nei quadrati.'),
      copy('Jarque–Bera rifiuta la normalità: code spesse sono comuni nei rendimenti e non invalidano la stima quasi-gaussiana.'),
    ],
  },
  {
    id: 'garch-forecast',
    title: copy('Previsioni della varianza condizionale'),
    columns: [
      { key: 'step', label: copy('Passo'), format: 'int' },
      { key: 'variance', label: copy('Varianza'), format: 'dec4' },
      { key: 'se', label: copy('DS'), format: 'dec4' },
      { key: 'lo', label: copy('Limite basso'), format: 'dec4' },
      { key: 'hi', label: copy('Limite alto'), format: 'dec4' },
    ],
    rows: fit.forecast.map(point => ({
      step: point.step,
      variance: point.variance,
      se: point.se,
      lo: point.lo,
      hi: point.hi,
    })),
    notes: [
      copy('Le varianze previste convergono alla varianza di lungo periodo con la velocità data dalla persistenza.'),
      copy('Gli intervalli sono per il livello della serie, non per la volatilità: usano la DS condizionale prevista.'),
    ],
  },
];
