import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { TableSpec } from '../types';
import type { HeckmanResult, TobitResult } from '../kernels/tobit';

export interface TobitTableNames {
  dep: string;
  predictors: string[];
  lower: number;
  upper: number | null;
}

export interface HeckmanTableNames {
  dep: string;
  predictors: string[];
  selectionDep: string;
  selectionPredictors: string[];
}

const outcomeTerm = (term: string, index: number, predictors: string[]): string => {
  if (index === 0) return copy('(Intercept)');
  if (term === 'lambda') return copy('IMR (λ)');
  return predictors[index - 1] ?? term;
};

const selectionTerm = (index: number, predictors: string[]): string =>
  index === 0 ? copy('(Intercept)') : predictors[index - 1] ?? `z${index}`;

const coefficientRows = (
  coefficients: { term: string; beta: number; se: number; z: number; p: number; lo: number; hi: number }[],
  termOf: (term: string, index: number) => string
) =>
  coefficients.map((value, index) => ({
    term: termOf(value.term, index),
    beta: value.beta,
    se: value.se,
    z: value.z,
    p: value.p,
    ciLo: value.lo,
    ciHi: value.hi,
  }));

const coefficientColumns = () => [
  { key: 'term', label: copy('Termine'), format: 'text' as const },
  { key: 'beta', label: copy('Coefficiente'), format: 'dec4' as const },
  { key: 'se', label: copy('SE'), format: 'dec4' as const },
  { key: 'z', label: copy('z'), format: 'dec3' as const },
  { key: 'p', label: copy('p'), format: 'p' as const },
  { key: 'ciLo', label: copy('CI low'), format: 'dec4' as const },
  { key: 'ciHi', label: copy('CI high'), format: 'dec4' as const },
];

const metric = (label: string, value: string) => ({ metric: label, value });

const meanAbsoluteResidual = (values: number[]): number => {
  const clean = values.filter(value => Number.isFinite(value));
  if (clean.length === 0) return Number.NaN;
  return clean.reduce((sum, value) => sum + Math.abs(value), 0) / clean.length;
};

/**
 * Tables for a Tobit type-I run.
 *
 * The outcome table carries the ML coefficients; the variance table keeps the
 * two quantities that are easy to overlook (sigma and the censoring limits);
 * the diagnostics table the censoring counts and the optimiser status; the fit
 * table the likelihood summary. The report reads these rows instead of
 * recomputing anything.
 */
export const tobitTables = (fit: TobitResult, names: TobitTableNames, level: number): TableSpec[] => [
  {
    id: 'tobit-outcome',
    title: copy('Equazione dell’esito (Tobit)'),
    subtitle: copy('{s1} · ML · CI {s2}%', { s1: names.dep, s2: level }),
    columns: coefficientColumns(),
    rows: coefficientRows(fit.coefficients, (term, index) =>
      outcomeTerm(term, index, names.predictors)
    ),
    notes: [
      copy('I coefficienti descrivono la media latente y* = xβ: una unità in più del predittore sposta la media latente di β, non necessariamente la media osservata.'),
      copy('Le righe al limite di censura non sono valori mancanti: contribuiscono alla verosimiglianza con la probabilità di trovarsi oltre il limite.'),
    ],
  },
  {
    id: 'tobit-variance',
    title: copy('Parametri di varianza (Tobit)'),
    subtitle: copy('{s1} · sigma e limiti di censura', { s1: names.dep }),
    columns: [
      { key: 'metric', label: copy('Parametro'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'text' },
    ],
    rows: [
      metric(copy('Sigma (σ)'), fmtEst(fit.sigma, 4)),
      metric(copy('SE di sigma'), fmtEst(fit.sigmaSe, 4)),
      metric(copy('Limite inferiore'), fmtEst(names.lower, 4)),
      metric(
        copy('Limite superiore'),
        names.upper === null ? copy('nessuno') : fmtEst(names.upper, 4)
      ),
    ],
    notes: [
      copy('Sigma è la deviazione standard della componente non spiegata sulla scala latente: non è l’errore standard di una singola previsione osservata.'),
      copy('La censura è di tipo I: tutte le osservazioni oltre il limite sono registrate esattamente al limite, senza informazione sulla distanza.'),
    ],
  },
  {
    id: 'tobit-diagnostics',
    title: copy('Diagnostica (Tobit)'),
    subtitle: copy('{s1} osservazioni · censura a {s2}', {
      s1: fit.n,
      s2: fmtEst(names.lower, 2),
    }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'text' },
    ],
    rows: [
      metric(copy('Osservazioni'), String(fit.n)),
      metric(copy('Censurati a sinistra'), String(fit.nLower)),
      metric(copy('Censurati a destra'), String(fit.nUpper)),
      metric(copy('Non censurati'), String(fit.nUncensored)),
      metric(copy('Iterazioni'), String(fit.iterations)),
      metric(copy('Convergenza'), fit.converged ? copy('sì') : copy('no')),
    ],
    notes: [
      copy('Senza righe censurate il Tobit coincide con una regressione lineare e il modello non è identificato come censurato: la procedura lo segnala come errore.'),
      copy('La convergenza è quella dell’ottimizzatore BFGS; un numero di iterazioni al limite richiede di controllare scala delle colonne e collinearità.'),
    ],
  },
  {
    id: 'tobit-fit',
    title: copy('Adattamento (Tobit)'),
    subtitle: copy('Verosimiglianza e residui · {s1}', { s1: names.dep }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'text' },
    ],
    rows: [
      metric(copy('Log-verosimiglianza'), fmtEst(fit.logLik, 4)),
      metric('AIC', fmtEst(fit.aic, 4)),
      metric(
        copy('Residui assoluti medi'),
        fmtEst(meanAbsoluteResidual(fit.residuals), 4)
      ),
    ],
    notes: [
      copy('La log-verosimiglianza è quella del modello censurato, quindi non è confrontabile con quella di una regressione lineare sugli stessi dati non censurati.'),
      copy('I residui confrontano la risposta osservata con la media condizionata al lato della censura: non sono residui latenti.'),
    ],
  },
];

/**
 * Tables for a Heckman two-step run: outcome equation, selection equation,
 * variance parameters (sigma, rho, lambda), diagnostics and fit summary.
 */
export const heckmanTables = (
  fit: HeckmanResult,
  names: HeckmanTableNames,
  level: number
): TableSpec[] => {
  const rhoOutside = Math.abs(fit.rho) > 1;
  const outcomeRows = coefficientRows(fit.coefficients, (term, index) =>
    outcomeTerm(term, index, names.predictors)
  );
  const selectionRows = coefficientRows(fit.selectionCoefficients, (term, index) =>
    selectionTerm(index, names.selectionPredictors)
  );

  return [
    {
      id: 'heckman-outcome',
      title: copy('Equazione dell’esito (Heckman)'),
      subtitle: copy('{s1} · due passi · CI {s2}%', { s1: names.dep, s2: level }),
      columns: coefficientColumns(),
      rows: outcomeRows,
      notes: [
        copy('La riga IMR (λ) è il coefficiente dell’inverse Mills ratio: se è diverso da zero la selezione sposta la media dell’esito osservato.'),
        copy('I coefficienti degli altri regressori sono interpretabili come nell’equazione strutturale, condizionatamente alla correzione per la selezione.'),
      ],
    },
    {
      id: 'heckman-selection',
      title: copy('Equazione di selezione (Heckman)'),
      subtitle: copy('{s1} · probit · CI {s2}%', { s1: names.selectionDep, s2: level }),
      columns: coefficientColumns(),
      rows: selectionRows,
      notes: [
        copy('Il probit modella la probabilità di essere selezionato; i suoi coefficienti sono su scala latente normale e non sono effetti marginali sulla probabilità.'),
        copy('Almeno un predittore della selezione dovrebbe essere escluso dall’equazione dell’esito: senza esclusione la correzione è identificata solo dalla forma funzionale.'),
      ],
    },
    {
      id: 'heckman-variance',
      title: copy('Parametri di varianza (Heckman)'),
      subtitle: copy('{s1} · sigma, rho e lambda', { s1: names.dep }),
      columns: [
        { key: 'metric', label: copy('Parametro'), format: 'text' },
        { key: 'value', label: copy('Valore'), format: 'text' },
      ],
      rows: [
        metric(copy('Sigma (σ)'), fmtEst(fit.sigma, 4)),
        metric(copy('Rho (ρ)'), fmtEst(fit.rho, 4)),
        metric(copy('Lambda (δ)'), fmtEst(fit.lambda, 4)),
        metric(copy('SE di lambda'), fmtEst(fit.lambdaSe, 4)),
        metric(
          copy('Correzione prima fase'),
          fit.seCorrected ? copy('applicata') : copy('non calcolabile')
        ),
      ],
      notes: [
        copy('Sigma è la deviazione standard dei residui dell’equazione dell’esito sul campione selezionato; rho = lambda / sigma misura la correlazione tra le due equazioni.'),
        copy('Gli errori standard della prima fase sono corretti con la formula di Murphy–Topel/Greene; se la matrice di informazione non è invertibile la tabella segnala che la correzione non è stata applicata.'),
        ...(rhoOutside
          ? [
              copy('Rho stimato è fuori dall’intervallo (-1, 1): con campioni piccoli o selezione debole il due passi può produrre un valore non ammissibile. Va letto come segnale di instabilità, non corretto a forza.'),
            ]
          : []),
      ],
    },
    {
      id: 'heckman-diagnostics',
      title: copy('Diagnostica (Heckman)'),
      subtitle: copy('{s1} osservazioni · {s2} selezionate', {
        s1: fit.n,
        s2: fit.nSelected,
      }),
      columns: [
        { key: 'metric', label: copy('Metrica'), format: 'text' },
        { key: 'value', label: copy('Valore'), format: 'text' },
      ],
      rows: [
        metric(copy('Osservazioni'), String(fit.n)),
        metric(copy('Selezionati'), String(fit.nSelected)),
        metric(copy('Non selezionati'), String(fit.n - fit.nSelected)),
        metric('Wald (λ = 0)', fmtEst(fit.wald.statistic, 4)),
        metric(copy('p(Wald)'), fmtEst(fit.wald.p, 4)),
        metric(copy('Iterazioni'), String(fit.iterations)),
        metric(copy('Convergenza'), fit.converged ? copy('sì') : copy('no')),
        metric(copy('Correzione SE'), fit.seCorrected ? copy('sì') : copy('no')),
      ],
      notes: [
        copy('Il test di Wald verifica H0: lambda = 0, cioè assenza di selezione nella media dell’esito osservato. Un p alto non dimostra assenza di selezione, soprattutto con pochi casi.'),
        copy('Il due passi richiede sia righe selezionate sia righe escluse: senza le seconde il probit non è identificato.'),
      ],
    },
    {
      id: 'heckman-fit',
      title: copy('Adattamento (Heckman)'),
      subtitle: copy('Due passi · {s1}', { s1: names.dep }),
      columns: [
        { key: 'metric', label: copy('Metrica'), format: 'text' },
        { key: 'value', label: copy('Valore'), format: 'text' },
      ],
      rows: [
        metric(copy('Log-verosimiglianza'), copy('non definita per il due passi')),
        metric(copy('Sigma (σ)'), fmtEst(fit.sigma, 4)),
        metric(
          copy('Residui assoluti medi'),
          fmtEst(meanAbsoluteResidual(fit.residuals), 4)
        ),
      ],
      notes: [
        copy('Il due passi non massimizza la verosimiglianza congiunta di Heckman: non si riporta una log-verosimiglianza e non si confronta con modelli stimati per massima verosimiglianza.'),
        copy('I residui sono calcolati solo sulle righe selezionate, dove l’esito è osservato.'),
      ],
    },
  ];
};
