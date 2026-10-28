import { fmtEst } from '../format';
import { isDecided } from '../reportKit';
import type { TableSpec } from '../types';
import type { CoxFit } from '../cox/types';

const PH_SENTENCE = (p: number, level: number): string => {
  if (!Number.isFinite(p)) return 'non verificabile con questi dati';
  return isDecided(p, level)
    ? 'effetto che cambia nel tempo: l’ipotesi di rischi proporzionali è messa in discussione'
    : 'nessuna evidenza contro i rischi proporzionali';
};

export const coxTables = (fit: CoxFit, level: number): TableSpec[] => {
  const tables: TableSpec[] = [];
  const eventsPerVariable = fit.k > 0 ? fit.events / fit.k : NaN;

  tables.push({
    id: 'cox-summary',
    title: 'Sintesi del modello di Cox',
    subtitle: `${fit.n} osservazioni · ${fit.events} eventi · ${fit.k} covariariate`,
    columns: [
      { key: 'metric', label: 'Voce', format: 'text' },
      { key: 'value', label: 'Valore', format: 'text' },
    ],
    rows: [
      { metric: 'Osservazioni', value: String(fit.n), raw: fit.n },
      { metric: 'Eventi', value: String(fit.events), raw: fit.events },
      { metric: 'Censurati', value: String(fit.censored), raw: fit.censored },
      { metric: 'Covariati', value: String(fit.k), raw: fit.k },
      { metric: 'Eventi per covariata', value: fmtEst(eventsPerVariable, 1), raw: eventsPerVariable },
      { metric: 'Log-verosimiglianza', value: fmtEst(fit.logLik, 3), raw: fit.logLik },
      { metric: 'Log-verosimiglianza nulla', value: fmtEst(fit.logLikNull, 3), raw: fit.logLikNull },
      { metric: 'AIC', value: fmtEst(fit.aic, 3), raw: fit.aic },
      { metric: 'Concordanza (C di Harrell)', value: fmtEst(fit.concordance, 3), raw: fit.concordance },
      { metric: 'Iterazioni', value: String(fit.iterations), raw: fit.iterations },
      { metric: 'Convergenza', value: fit.converged ? 'sì' : 'no', raw: NaN },
      ...fit.warnings.map((warning, index) => ({
        metric: `Avviso ${index + 1}`,
        value: warning,
        raw: NaN,
      })),
    ],
    notes: [
      'La verosimiglianza parziale di Cox non richiede di specificare la forma della funzione di rischio di base.',
      'Come regola pratica servono almeno 10 eventi per covariata: sotto questa soglia le stime sono instabili.',
      'La C di Harrell misura la capacità del modello di ordinare i tempi: 0,5 = caso, 1 = ordine perfetto.',
    ],
  });

  tables.push({
    id: 'cox-tests',
    title: 'Test globali sul modello',
    subtitle: 'ipotesi nulla: tutti i coefficienti uguali a zero',
    columns: [
      { key: 'test', label: 'Test', format: 'text' },
      { key: 'statistic', label: 'Statistica', format: 'dec3' },
      { key: 'df', label: 'df', format: 'int' },
      { key: 'p', label: 'p', format: 'p' },
      { key: 'reading', label: 'Lettura', format: 'text' },
    ],
    rows: [
      {
        test: 'Rapporto di verosimiglianza',
        statistic: fit.lr,
        df: fit.df,
        p: fit.lrP,
        reading: isDecided(fit.lrP, level)
          ? 'il modello spiega i tempi meglio del nulla'
          : 'nessuna prova che le covariariate spieghino i tempi',
      },
      {
        test: 'Wald',
        statistic: fit.wald,
        df: fit.df,
        p: fit.waldP,
        reading: isDecided(fit.waldP, level)
          ? 'almeno un coefficiente è diverso da zero'
          : 'nessun coefficiente distinguibile da zero',
      },
      {
        test: 'Score (log-rank generalizzato)',
        statistic: fit.score,
        df: fit.df,
        p: fit.scoreP,
        reading: isDecided(fit.scoreP, level)
          ? 'le covariariate sono associate al rischio già senza stima completa'
          : 'nessuna associazione iniziale rilevante',
      },
    ],
    notes: [
      'Con campioni grandi i tre test convergono; con pochi eventi il rapporto di verosimiglianza è il più affidabile.',
      'Il test score valutato in β = 0 coincide, per una sola covariata dicotomica, con il log-rank.',
    ],
  });

  tables.push({
    id: 'cox-coefficients',
    title: 'Coefficienti e hazard ratio',
    subtitle: `IC ${level}% · HR per un’unità di incremento della covariata`,
    columns: [
      { key: 'term', label: 'Covariata', format: 'text' },
      { key: 'beta', label: 'B', format: 'dec4' },
      { key: 'se', label: 'Errore std.', format: 'dec4' },
      { key: 'z', label: 'z', format: 'dec3' },
      { key: 'p', label: 'p', format: 'p' },
      { key: 'hr', label: 'HR', format: 'dec3' },
      { key: 'lo', label: 'HR low', format: 'dec3' },
      { key: 'hi', label: 'HR high', format: 'dec3' },
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
      'B è il logaritmo dell’hazard ratio: B > 0 indica rischio maggiore quando la covariata aumenta.',
      'HR = 1 significa nessun effetto; l’intervallo che contiene 1 è coerente con l’assenza di associazione.',
      'I p-value sono test di Wald e non tengono conto dell’incertezza sugli altri coefficienti.',
    ],
  });

  tables.push({
    id: 'cox-ph',
    title: 'Verifica dei rischi proporzionali',
    subtitle: 'test di interazione con log(tempo)',
    columns: [
      { key: 'term', label: 'Termine', format: 'text' },
      { key: 'chi2', label: 'χ²', format: 'dec3' },
      { key: 'df', label: 'df', format: 'int' },
      { key: 'p', label: 'p', format: 'p' },
      { key: 'reading', label: 'Lettura', format: 'text' },
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
              term: 'Non calcolabile',
              chi2: NaN,
              df: 0,
              p: NaN,
              reading: 'servono più eventi (o tempi tutti positivi) per stimare il modello con interazioni',
            },
          ],
    notes: [
      'Il test aggiunge un coefficiente per covariata × log(t): se quel coefficiente è diverso da zero l’effetto cambia con il tempo.',
      'p grande è ciò che si vuole vedere: indica che l’ipotesi di rischio proporzionale regge.',
      'È un test asintotico e con pochi eventi ha poca potenza: l’assenza di significatività non prova i rischi proporzionali.',
    ],
  });

  tables.push({
    id: 'cox-baseline',
    title: 'Rischio cumulato di base',
    subtitle: 'stimatore di Breslow · profilo medio delle covariariate',
    columns: [
      { key: 'time', label: 'Tempo', format: 'dec2' },
      { key: 'risk', label: 'A rischio', format: 'int' },
      { key: 'events', label: 'Eventi', format: 'int' },
      { key: 'hazard', label: 'H₀(t)', format: 'dec4' },
      { key: 'survival', label: 'S₀(t)', format: 'dec3' },
    ],
    rows: fit.baseline.map(row => ({ ...row })),
    notes: [
      'H₀(t) è il rischio cumulato valutato al profilo medio delle covariariate: un profilo ipotetico ma stabile numericamente anche con età o punteggi lontani da zero.',
      'Per un profilo x la sopravvivenza è S₀(t) elevato a exp((x − x̄)′B): la curva di base non va letta come la sopravvivenza media della coorte.',
    ],
  });

  return tables;
};
