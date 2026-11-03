import { copy } from '../reportCopy';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';

export const penalizedReport = (
  tables: TableSpec[],
  depName: string,
  level: number
): ReportSpec => {
  const coefficients = tables.find(table => table.id === 'penalized-coefficients')?.rows ?? [];
  const fit = tables.find(table => table.id === 'penalized-fit')?.rows ?? [];
  const metric = (label: string): string =>
    String(fit.find(row => String(row.metric) === label)?.value ?? '—');
  const kept = coefficients
    .slice(1)
    .filter(row => Math.abs(Number(row.coefficient)) > 1e-10)
    .map(row => String(row.term));

  return {
    id: 'report-penalized',
    title: copy('Report di lettura — Regressione penalizzata'),
    headline: copy('{s1}: {s2} coefficienti non nulli su {s3} (λ = {s4}, α = {s5}).', {
      s1: depName,
      s2: kept.length,
      s3: coefficients.length - 1,
      s4: metric('λ'),
      s5: metric('α'),
    }),
    badge: copy('Regressione'),
    tone: kept.length > 0 ? 'positive' : 'neutral',
    intro: [
      copy('Ridge, LASSO ed elastic net aggiungono una penalità ai coefficienti per ridurre la varianza delle stime e gestire la collinearità.'),
      copy('LASSO può azzerare coefficienti, producendo un modello sparso; ridge li riduce senza azzerarli; elastic net combina i due comportamenti.'),
    ],
    sections: [
      {
        heading: copy('Risultato'),
        bullets: [
          copy('Variabili mantenute: {s1}.', { s1: kept.length > 0 ? kept.join(', ') : copy('nessuna') }),
          copy('R² = {s1}; coefficienti non nulli = {s2}; iterazioni = {s3}.', {
            s1: metric('R²'),
            s2: metric('Coefficienti non nulli'),
            s3: metric('Iterazioni'),
          }),
          copy('Convergenza: {s1}.', { s1: metric('Convergenza') }),
        ],
      },
      {
        heading: copy('Come scegliere λ'),
        bullets: [
          copy('λ non va scelto guardando l’R² sul campione: serve validazione incrociata o un criterio esterno.'),
          copy('Valori grandi semplificano il modello ma possono escludere segnali reali; valori piccoli si avvicinano all’OLS e alla sua instabilità.'),
          copy('Le variabili sono standardizzate internamente: i coefficienti restano confrontabili tra loro solo dopo questa trasformazione.'),
          copy('Il livello di confidenza {s1}% è indicato per coerenza con le altre procedure, ma gli intervalli dei coefficienti penalizzati non sono interpretabili come quelli OLS.', {
            s1: level,
          }),
        ],
      },
    ],
    limitations: [
      copy('La penalizzazione introduce distorsione: i coefficienti non sono stimatori non distorti e gli errori standard classici non si applicano.'),
      copy('La selezione di λ e la stima della varianza richiedono ricampionamento, non incluso in questa procedura.'),
    ],
  };
};
