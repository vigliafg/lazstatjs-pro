import { fmtEst } from '../format';
import { copy } from '../reportCopy';
import { isDecided } from '../reportKit';
import type { TableSpec } from '../types';
import type { CoxFit } from '../cox/types';

const PH_SENTENCE = (p: number, level: number): string => {
  if (!Number.isFinite(p)) return copy('non verificabile con questi dati');
  return isDecided(p, level)
    ? copy('effetto che cambia nel tempo: l’ipotesi di rischi proporzionali è messa in discussione')
    : copy('nessuna evidenza contro i rischi proporzionali');
};

export const coxTables = (fit: CoxFit, level: number): TableSpec[] => {
  const tables: TableSpec[] = [];
  const eventsPerVariable = fit.k > 0 ? fit.events / fit.k : NaN;

  tables.push({
    id: 'cox-summary',
    title: copy('Sintesi del modello di Cox'),
    subtitle: copy('{s1} osservazioni · {s2} eventi · {s3} covariariate', { s1: fit.n, s2: fit.events, s3: fit.k }),
    columns: [
      { key: 'metric', label: copy('Voce'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'text' },
    ],
    rows: [
      { metric: copy('Osservazioni'), value: String(fit.n), raw: fit.n },
      { metric: copy('Eventi'), value: String(fit.events), raw: fit.events },
      { metric: copy('Censurati'), value: String(fit.censored), raw: fit.censored },
      { metric: copy('Covariati'), value: String(fit.k), raw: fit.k },
      { metric: copy('Eventi per covariata'), value: fmtEst(eventsPerVariable, 1), raw: eventsPerVariable },
      { metric: copy('Log-verosimiglianza'), value: fmtEst(fit.logLik, 3), raw: fit.logLik },
      { metric: copy('Log-verosimiglianza nulla'), value: fmtEst(fit.logLikNull, 3), raw: fit.logLikNull },
      { metric: copy('AIC'), value: fmtEst(fit.aic, 3), raw: fit.aic },
      { metric: copy('Concordanza (C di Harrell)'), value: fmtEst(fit.concordance, 3), raw: fit.concordance },
      { metric: copy('Iterazioni'), value: String(fit.iterations), raw: fit.iterations },
      { metric: copy('Convergenza'), value: fit.converged ? 'sì' : 'no', raw: NaN },
      ...fit.warnings.map((warning, index) => ({
        metric: copy('Avviso {s1}', { s1: index + 1 }),
        value: warning,
        raw: NaN,
      })),
    ],
    notes: [
      copy('La verosimiglianza parziale di Cox non richiede di specificare la forma della funzione di rischio di base.'),
      copy('Come regola pratica servono almeno 10 eventi per covariata: sotto questa soglia le stime sono instabili.'),
      copy('La C di Harrell misura la capacità del modello di ordinare i tempi: 0,5 = caso, 1 = ordine perfetto.'),
    ],
  });

  tables.push({
    id: 'cox-tests',
    title: copy('Test globali sul modello'),
    subtitle: copy('ipotesi nulla: tutti i coefficienti uguali a zero'),
    columns: [
      { key: 'test', label: copy('Test'), format: 'text' },
      { key: 'statistic', label: copy('Statistica'), format: 'dec3' },
      { key: 'df', label: copy('df'), format: 'int' },
      { key: 'p', label: copy('p'), format: 'p' },
      { key: 'reading', label: copy('Lettura'), format: 'text' },
    ],
    rows: [
      {
        test: copy('Rapporto di verosimiglianza'),
        statistic: fit.lr,
        df: fit.df,
        p: fit.lrP,
        reading: isDecided(fit.lrP, level)
          ? copy('il modello spiega i tempi meglio del nulla')
          : copy('nessuna prova che le covariariate spieghino i tempi'),
      },
      {
        test: 'Wald',
        statistic: fit.wald,
        df: fit.df,
        p: fit.waldP,
        reading: isDecided(fit.waldP, level)
          ? copy('almeno un coefficiente è diverso da zero')
          : copy('nessun coefficiente distinguibile da zero'),
      },
      {
        test: copy('Score (log-rank generalizzato)'),
        statistic: fit.score,
        df: fit.df,
        p: fit.scoreP,
        reading: isDecided(fit.scoreP, level)
          ? copy('le covariariate sono associate al rischio già senza stima completa')
          : copy('nessuna associazione iniziale rilevante'),
      },
    ],
    notes: [
      copy('Con campioni grandi i tre test convergono; con pochi eventi il rapporto di verosimiglianza è il più affidabile.'),
      copy('Il test score valutato in β = 0 coincide, per una sola covariata dicotomica, con il log-rank.'),
    ],
  });

  tables.push({
    id: 'cox-coefficients',
    title: copy('Coefficienti e hazard ratio'),
    subtitle: copy('IC {s1}% · HR per un’unità di incremento della covariata', { s1: level }),
    columns: [
      { key: 'term', label: copy('Covariata'), format: 'text' },
      { key: 'beta', label: copy('B'), format: 'dec4' },
      { key: 'se', label: copy('Errore std.'), format: 'dec4' },
      { key: 'z', label: copy('z'), format: 'dec3' },
      { key: 'p', label: copy('p'), format: 'p' },
      { key: 'hr', label: copy('HR'), format: 'dec3' },
      { key: 'lo', label: copy('HR low'), format: 'dec3' },
      { key: 'hi', label: copy('HR high'), format: 'dec3' },
    ],
    rows: fit.coefficients.map(coefficient => ({
      term: coefficient.term,
      beta: coefficient.beta,
      se: coefficient.se,
      z: coefficient.z,
      p: coefficient.p,
      hr: coefficient.hr,
      lo: coefficient.lo,
      hi: coefficient.hi,
    })),
    notes: [
      copy('B è il logaritmo dell’hazard ratio: B > 0 indica rischio maggiore quando la covariata aumenta.'),
      copy('HR = 1 significa nessun effetto; l’intervallo che contiene 1 è coerente con l’assenza di associazione.'),
      copy('I p-value sono test di Wald e non tengono conto dell’incertezza sugli altri coefficienti.'),
    ],
  });

  tables.push({
    id: 'cox-ph',
    title: copy('Verifica dei rischi proporzionali'),
    subtitle: copy('test di interazione con log(tempo)'),
    columns: [
      { key: 'term', label: copy('Termine'), format: 'text' },
      { key: 'chi2', label: copy('χ²'), format: 'dec3' },
      { key: 'df', label: copy('df'), format: 'int' },
      { key: 'p', label: copy('p'), format: 'p' },
      { key: 'reading', label: copy('Lettura'), format: 'text' },
    ],
    rows:
      fit.ph.length > 0
        ? [
            ...fit.ph.map(row => ({
              term: row.term,
              chi2: row.chi2,
              df: row.df,
              p: row.p,
              reading: PH_SENTENCE(row.p, level),
            })),
            {
              term: 'Globale',
              chi2: fit.phGlobal.chi2,
              df: fit.phGlobal.df,
              p: fit.phGlobal.p,
              reading: PH_SENTENCE(fit.phGlobal.p, level),
            },
          ]
        : [
            {
              term: copy('Non calcolabile'),
              chi2: NaN,
              df: 0,
              p: NaN,
              reading: copy('servono più eventi (o tempi tutti positivi) per stimare il modello con interazioni'),
            },
          ],
    notes: [
      copy('Il test aggiunge un coefficiente per covariata × log(t): se quel coefficiente è diverso da zero l’effetto cambia con il tempo.'),
      copy('p grande è ciò che si vuole vedere: indica che l’ipotesi di rischio proporzionale regge.'),
      copy('È un test asintotico e con pochi eventi ha poca potenza: l’assenza di significatività non prova i rischi proporzionali.'),
    ],
  });

  tables.push({
    id: 'cox-baseline',
    title: copy('Rischio cumulato di base'),
    subtitle: copy('stimatore di Breslow · profilo medio delle covariariate'),
    columns: [
      { key: 'time', label: copy('Tempo'), format: 'dec2' },
      { key: 'risk', label: copy('A rischio'), format: 'int' },
      { key: 'events', label: copy('Eventi'), format: 'int' },
      { key: 'hazard', label: copy('H₀(t)'), format: 'dec4' },
      { key: 'survival', label: copy('S₀(t)'), format: 'dec3' },
    ],
    rows: fit.baseline.map(row => ({ ...row })),
    notes: [
      copy('H₀(t) è il rischio cumulato valutato al profilo medio delle covariariate: un profilo ipotetico ma stabile numericamente anche con età o punteggi lontani da zero.'),
      copy('Per un profilo x la sopravvivenza è S₀(t) elevato a exp((x − x̄)′B): la curva di base non va letta come la sopravvivenza media della coorte.'),
    ],
  });

  return tables;
};
