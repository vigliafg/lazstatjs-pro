/** English prose of the repeatedAnova report and its tables. */
export const repeatedAnovaCopy: Record<string, string> = {
  'Mauchly p':
    'Mauchly p',
  'ε Greenhouse':
    'Greenhouse ε',
  'Le condizioni differiscono (F = {s1}, p = {s2}{s3}).':
    'The conditions differ (F = {s1}, p = {s2}{s3}).',
  ' corretto GG':
    ' GG-corrected',
  'Nessuna differenza tra le condizioni (F = {s1}, p = {s2}{s3}).':
    'No difference between the conditions (F = {s1}, p = {s2}{s3}).',
  'Sfericità violata':
    'Sphericity violated',
  'L’ANOVA a misure ripetute confronta k condizioni misurate sulle stesse unità, separando la variabilità tra condizioni da quella tra soggetti.':
    'Repeated-measures ANOVA compares k conditions measured on the same units, separating the variability between conditions from that between subjects.',
  'Le condizioni confrontate sono {s1}.':
    'The conditions compared are {s1}.',
  'F({s1}, {s2}) = {s3}, p{s4} = {s5}: {s6}':
    'F({s1}, {s2}) = {s3}, p{s4} = {s5}: {s6}',
  'rifiuta l’ipotesi che le medie delle condizioni siano uguali.':
    'it rejects the hypothesis that the condition means are equal.',
  'non rifiuta l’ipotesi di uguali medie.':
    'it does not reject the hypothesis of equal means.',
  'η²p = {s1}: effetto {s2}. η²G = {s3}.':
    'η²p = {s1}: {s2} effect. η²G = {s3}.',
  'η² generalizzato':
    'generalised η²',
  'Mauchly p = {s1}: l’assunzione di sfericità è violata. Usa il p corretto Greenhouse–Geisser ({s2}, ε = {s3}) o Huynh–Feldt ({s4}).':
    'Mauchly p = {s1}: the sphericity assumption is violated. Use the Greenhouse–Geisser corrected p ({s2}, ε = {s3}) or Huynh–Feldt ({s4}).',
  'Mauchly p = {s1}: non ci sono prove di violazione; il p non corretto è utilizzabile.':
    'Mauchly p = {s1}: there is no evidence of violation; the uncorrected p can be used.',
  'Le righe incomplete vengono escluse: ogni soggetto deve avere tutte le k misure.':
    'Incomplete rows are excluded: each subject must have all k measures.',
  'La sfericità riguarda le differenze tra tutte le coppie di condizioni, non le varianze delle singole condizioni.':
    'Sphericity concerns the differences between all pairs of conditions, not the variances of the individual conditions.',
  'Con pochi soggetti Mauchly è poco potente: considera comunque le correzioni se ε è basso.':
    'With few subjects Mauchly has low power: consider the corrections anyway if ε is low.',
  'L’ANOVA within non dice quali condizioni differiscano: servono confronti post-hoc.':
    'The within ANOVA does not say which conditions differ: post-hoc comparisons are needed.',
  'Non sono inclusi disegni misti, più fattori within o covariate.':
    'Mixed designs, multiple within factors or covariates are not included.',
  'Le correzioni GG/HF modificano i gradi di libertà ma non le medie: gli effetti descrittivi restano invariati.':
    'The GG/HF corrections change the degrees of freedom but not the means: the descriptive effects stay the same.',
  'ANOVA a misure ripetute':
    'Repeated-measures ANOVA',
  '{s1} soggetti · {s2} condizioni · CI {s3}%':
    '{s1} subjects · {s2} conditions · CI {s3}%',
  'Condizioni (within)':
    'Conditions (within)',
  'Errore (Condizioni × Soggetti)':
    'Error (Conditions × Subjects)',
  'F = MS_condizioni / MS_errore, con df = (k−1) e (n−1)(k−1).':
    'F = MS_conditions / MS_error, with df = (k−1) and (n−1)(k−1).',
  'η²p = {s1} · η²G = {s2}.':
    'η²p = {s1} · η²G = {s2}.',
  'sfericità non rifiutata':
    'sphericity not rejected',
  'sfericità violata: usare la correzione':
    'sphericity violated: use the correction',
  '1 = sfericità perfetta':
    '1 = perfect sphericity',
  'nessuna violazione':
    'no violation',
  'ε Greenhouse–Geisser':
    'Greenhouse–Geisser ε',
  'limite inferiore = 1/(k−1)':
    'lower bound = 1/(k−1)',
  'ε Huynh–Feldt':
    'Huynh–Feldt ε',
  'più liberale di GG':
    'more liberal than GG',
  'F (df non corretti)':
    'F (uncorrected df)',
  '{s1}, {s2}':
    '{s1}, {s2}',
  'valido solo con sfericità':
    'valid only with sphericity',
  'p GG':
    'GG p',
  'df = {s1}, {s2}':
    'df = {s1}, {s2}',
  'p HF':
    'HF p',
  'df corretti con ε HF':
    'df corrected with HF ε',
  'SS condizioni / SS totale':
    'SS conditions / total SS',
  'Mauchly richiede normalità multivariata; con n piccolo il test ha potenza bassa.':
    'Mauchly requires multivariate normality; with small n the test has low power.',
  'Se Mauchly è significativo, riportare il p corretto GG (conservativo) o HF.':
    'If Mauchly is significant, report the GG-corrected p (conservative) or HF.',
  'Descrittive per condizione':
    'Descriptives by condition',
  'CI = media ± t({s1}%, df = {s2})·SE.':
    'CI = mean ± t({s1}%, df = {s2})·SE.',
};
