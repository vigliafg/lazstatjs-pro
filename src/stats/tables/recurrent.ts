import { fmtEst } from '../format';
import { copy } from '../reportCopy';
import type { TableSpec } from '../types';
import type { RecurrentFit } from '../recurrent/types';

export const recurrentTables = (fit: RecurrentFit, level: number): TableSpec[] => [
  {
    id: 'recurrent-summary',
    title: copy('Sintesi degli eventi ricorrenti'),
    subtitle: copy(
      fit.model === 'ag' ? 'Andersen–Gill · CI {s1}%' : 'Wei–Lin–Weissfeld · CI {s1}%',
      { s1: level }
    ),
    columns: [
      { key: 'metric', label: copy('Voce'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'text' },
    ],
    rows: [
      { metric: copy('Soggetti'), value: String(fit.subjects), raw: fit.subjects },
      { metric: copy('Righe analizzate'), value: String(fit.n), raw: fit.n },
      { metric: copy('Episodi'), value: String(fit.episodes), raw: fit.episodes },
      { metric: copy('Eventi'), value: String(fit.events), raw: fit.events },
      { metric: copy('Covariati'), value: String(fit.k), raw: fit.k },
      { metric: copy('Log-verosimiglianza'), value: fmtEst(fit.logLik, 3), raw: fit.logLik },
      { metric: copy('AIC'), value: fmtEst(fit.aic, 3), raw: fit.aic },
      { metric: copy('Iterazioni'), value: String(fit.iterations), raw: fit.iterations },
      { metric: copy('Convergenza'), value: fit.converged ? 'sì' : 'no', raw: NaN },
      ...fit.warnings.map((warning, index) => ({
        metric: copy('Avviso {s1}', { s1: index + 1 }),
        value: warning,
        raw: NaN,
      })),
    ],
    notes: [
      fit.model === 'ag'
        ? copy('Andersen–Gill tratta ogni evento come un nuovo ingresso nel rischio e usa il tempo di calendario: gli errori standard sono raggruppati per soggetto.')
        : copy('Wei–Lin–Weissfeld crea uno strato per ogni numero di evento e usa il tempo trascorso dal precedente evento.'),
      copy('Gli errori standard robusti tengono conto della correlazione tra eventi dello stesso soggetto.'),
      copy('Il modello assume che le covariati agiscano allo stesso modo su tutti gli eventi; per effetti diversi serve un modello evento-specifico.'),
    ],
  },
  {
    id: 'recurrent-coefficients',
    title: copy('Coefficienti'),
    subtitle: copy('Hazard ratio · errori standard robusti · CI {s1}%', { s1: level }),
    columns: [
      { key: 'term', label: copy('Termine'), format: 'text' },
      { key: 'beta', label: copy('β'), format: 'dec4' },
      { key: 'se', label: copy('SE robusto'), format: 'dec4' },
      { key: 'z', label: copy('z'), format: 'dec3' },
      { key: 'p', label: copy('p'), format: 'p' },
      { key: 'hr', label: copy('HR'), format: 'dec4' },
      { key: 'lo', label: copy('HR low'), format: 'dec4' },
      { key: 'hi', label: copy('HR high'), format: 'dec4' },
    ],
    rows: fit.coefficients.map(row => ({ ...row })),
    notes: [
      copy('HR > 1 indica un rischio più alto di un nuovo evento per un’unità in più del predittore.'),
      copy('Gli errori standard robusti sono più larghi di quelli naive quando gli eventi dello stesso soggetto sono correlati.'),
    ],
  },
  {
    id: 'recurrent-tests',
    title: copy('Test globali'),
    columns: [
      { key: 'test', label: copy('Test'), format: 'text' },
      { key: 'statistic', label: copy('Statistica'), format: 'dec3' },
      { key: 'df', label: copy('df'), format: 'int' },
      { key: 'p', label: copy('p'), format: 'p' },
    ],
    rows: [
      { test: copy('Rapporto di verosimiglianza'), statistic: fit.lr, df: fit.k, p: fit.lrP },
      { test: 'Wald', statistic: fit.wald, df: fit.k, p: fit.waldP },
    ],
    notes: [
      copy('I test globali verificano che tutti i coefficienti siano uguali a zero.'),
    ],
  },
];
