/** English prose of the tdcox report and its tables. */
export const tdcoxCopy: Record<string, string> = {
  'Report Cox tempo-dipendente':
    'Time-dependent Cox report',
  'Modello di Cox start-stop su {s1} intervalli e {s2} eventi.':
    'Start-stop Cox model on {s1} intervals and {s2} events.',
  'Covariate associate al rischio':
    'Covariates associated with the risk',
  'LR χ² = {s1}, p = {s2}.':
    'LR χ² = {s1}, p = {s2}.',
  'Le covariate possono cambiare valore nel tempo: ogni riga descrive un intervallo start-stop.':
    'Covariates can change value over time: each row describes a start-stop interval.',
  'Il modello nel complesso è significativo: almeno una covariata è associata al rischio.':
    'The model as a whole is significant: at least one covariate is associated with the risk.',
  'Gli hazard ratio sono interpretati come effetto istantaneo della covariata corrente.':
    'The hazard ratios are interpreted as the instantaneous effect of the current covariate.',
  'Il formato richiede intervalli start-stop coerenti e senza sovrapposizioni per soggetto.':
    'The format requires consistent, non-overlapping start-stop intervals per subject.',
  'Non sono inclusi fragilità, rischi competitivi o baseline stratificate.':
    'Frailty, competing risks and stratified baselines are not included.',
  'Cox con covariate tempo-dipendenti':
    'Cox with time-dependent covariates',
  '{s1} intervalli · {s2} eventi':
    '{s1} intervals · {s2} events',
  'Intervalli':
    'Intervals',
  'Formato start-stop: ogni riga è un intervallo in cui le covariate sono costanti.':
    'Start-stop format: each row is an interval in which the covariates are constant.',
  'Il rischio a ogni evento include tutti gli intervalli con start < t ≤ stop.':
    'The risk at each event includes all intervals with start < t ≤ stop.',
  'HR > 1 indica un rischio maggiore per un’unità in più della covariata tempo-dipendente.':
    'HR > 1 indicates a higher risk for one more unit of the time-dependent covariate.',
};
