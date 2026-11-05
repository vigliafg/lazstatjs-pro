import { chi2SF } from './distributions';

/** Un test di rapporto di verosimiglianza per un termine del modello. */
export interface LrEffect {
  term: string;
  df: number;
  lr: number;
  p: number;
}

export interface LogLikFit {
  logLik: number;
  df: number;
}

/**
 * Test LR di un termine: 2·(log-verosimiglianza completa − ridotta), con i
 * gradi di libertà della differenza e il p dalla χ². Restituisce `null` quando
 * il modello ridotto non è stimabile o la differenza di df non è positiva.
 */
export const lrTest = (
  term: string,
  fullLogLik: number,
  fullDf: number,
  reduced: LogLikFit | null
): LrEffect | null => {
  if (!reduced) return null;
  const df = fullDf - reduced.df;
  if (!(df > 0) || !Number.isFinite(fullLogLik) || !Number.isFinite(reduced.logLik)) return null;
  const lr = Math.max(0, 2 * (fullLogLik - reduced.logLik));
  return { term, df, lr, p: chi2SF(lr, df) };
};
