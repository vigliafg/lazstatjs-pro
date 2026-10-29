/** English prose of the correlation report and its tables. */
export const correlationCopy: Record<string, string> = {
  'Spearman ρ':
    'Spearman ρ',
  'Kendall τ':
    'Kendall τ',
  'Pearson r':
    'Pearson r',
  'positiva (al crescere di una cresce l’altra)':
    'positive (as one grows the other grows)',
  'negativa (al crescere di una l’altra cala)':
    'negative (as one grows the other falls)',
  '{s1} × {s2}: {s3} = {s4}, {s5} → associazione {s6}; relazione {s7}; r² = {s8} ({s9}% di varianza condivisa){s10}.':
    '{s1} × {s2}: {s3} = {s4}, {s5} → {s6} association; {s7} relationship; r² = {s8} ({s9}% shared variance){s10}.',
  '{s1} e significativa':
    '{s1} and significant',
  'non significativa':
    'not significant',
  '; Pearson r = {s1} ({s2})':
    '; Pearson r = {s1} ({s2})',
  'Nessuna correlazione calcolabile con i dati disponibili.':
    'No correlation computable with the available data.',
  'L’associazione più forte è {s1} × {s2}: {s3} = {s4}, {s5} e significativa ({s6}).':
    'The strongest association is {s1} × {s2}: {s3} = {s4}, {s5} and significant ({s6}).',
  'Nessuna associazione raggiunge la significatività: la più forte è {s1} × {s2} ({s3} = {s4}, {s5}).':
    'No association reaches significance: the strongest is {s1} × {s2} ({s3} = {s4}, {s5}).',
  'Coppia per coppia':
    'Pair by pair',
  'Quanto è forte il legame':
    'How strong the link is',
  'Il coefficiente va da −1 a +1: {s1} corrisponde a un legame {s2}; il segno indica solo la direzione.':
    'The coefficient ranges from −1 to +1: {s1} corresponds to a {s2} link; the sign indicates only the direction.',
  'Coefficiente non disponibile.':
    'Coefficient not available.',
  'r² = {s1}: le due variabili condividono circa il {s2}% della variabilità, il resto dipende da altro.':
    'r² = {s1}: the two variables share about {s2}% of the variability, the rest depends on other things.',
  'Nessuna coppia supera la soglia scelta: le oscillazioni osservate sono compatibili con il caso.':
    'No pair exceeds the chosen threshold: the observed fluctuations are compatible with chance.',
  '{s1} {s2} la soglia di significatività: con molti confronti qualche falso positivo è atteso, quindi dai priorità alle associazioni più forti e coerenti con l’ipotesi di partenza.':
    '{s1} {s2} the significance threshold: with many comparisons some false positives are expected, so give priority to the strongest associations that are consistent with the starting hypothesis.',
  'coppia supera':
    'pair exceeds',
  'coppie superano':
    'pairs exceed',
  'Correlazioni parziali':
    'Partial correlations',
  'La correlazione parziale misura il legame tra due variabili togliendo l’effetto delle altre: se crolla rispetto a quella semplice, il legame era in buona parte spiegato dalle variabili controllate.':
    'Partial correlation measures the link between two variables after removing the effect of the others: if it collapses compared with the simple one, the link was largely explained by the controlled variables.',
  '{s1} × {s2} controllando {s3}: r = {s4}, {s5} → {s6}.':
    '{s1} × {s2} controlling for {s3}: r = {s4}, {s5} → {s6}.',
  'legame residuo significativo':
    'significant residual link',
  'nessun legame residuo affidabile':
    'no reliable residual link',
  'Pearson misura un legame lineare: una relazione curva forte può dare r vicino a zero.':
    'Pearson measures a linear link: a strong curved relationship can give r close to zero.',
  'Spearman lavora sui ranghi: misura un legame monotono e resiste agli outlier e alle scale non lineari.':
    'Spearman works on ranks: it measures a monotonic link and resists outliers and non-linear scales.',
  'Kendall confronta coppie concordanti e discordanti: è robusto e adatto a campioni piccoli con molti ranghi pari.':
    'Kendall compares concordant and discordant pairs: it is robust and suited to small samples with many tied ranks.',
  'p < {s1} indica che il coefficiente è difficilmente spiegabile dal solo caso; non dice che il legame sia forte.':
    'p < {s1} indicates that the coefficient is hard to explain by chance alone; it does not say that the link is strong.',
  'N varia tra le coppie quando alcune righe hanno valori mancanti: coefficienti con N molto diverso non sono direttamente confrontabili.':
    'N varies between pairs when some rows have missing values: coefficients with very different N are not directly comparable.',
  'Report di lettura — Correlazione':
    'Reading report — Correlation',
  'Nessuna associazione':
    'No association',
  'Misura se due variabili si muovono insieme e con quale intensità, senza ipotizzare quale delle due influenzi l’altra.':
    'It measures whether two variables move together and how strongly, without assuming which of the two influences the other.',
  'Il coefficiente è compreso tra −1 e +1: lo zero indica assenza di legame, i valori estremi un legame quasi perfetto in una direzione o nell’altra.':
    'The coefficient lies between −1 and +1: zero indicates no link, the extreme values an almost perfect link in one direction or the other.',
  'Correlazione non è causalità: una terza variabile può spiegare entrambe, oppure la direzione può essere inversa.':
    'Correlation is not causality: a third variable can explain both, or the direction can be reversed.',
  'Gli outlier e le distribuzioni molto asimmetriche possono gonfiare o azzerare il coefficiente: controlla sempre il grafico a dispersione.':
    'Outliers and strongly skewed distributions can inflate or wipe out the coefficient: always check the scatter plot.',
  'Una correlazione calcolata su un intervallo ristretto di valori tende a sottostimare il legame reale.':
    'A correlation computed on a narrow range of values tends to underestimate the real link.',
  '{s1}-{s2}':
    '{s1}-{s2}',
  'Variabile A':
    'Variable A',
  'Variabile B':
    'Variable B',
  'r²':
    'r²',
  'Correlazioni a coppie':
    'Pairwise correlations',
  'Metodo primario: {s1} · CI {s2}% · eliminazione pairwise':
    'Primary method: {s1} · CI {s2}% · pairwise deletion',
  'Ogni coppia usa tutte le righe con entrambi i valori validi (pairwise deletion): N può variare tra le coppie.':
    'Each pair uses all rows with both values valid (pairwise deletion): N can vary between pairs.',
  'p di Pearson e Spearman: t con df = N − 2. p di Kendall: approssimazione normale con correzione dei ranghi pari.':
    'Pearson and Spearman p: t with df = N − 2. Kendall p: normal approximation with tied-rank correction.',
  'CI di Pearson: trasformazione z di Fisher, tanh(z ± z_crit/√(N−3)).':
    'Pearson CI: Fisher z transformation, tanh(z ± z_crit/√(N−3)).',
  'Variable':
    'Variable',
  'v{s1}':
    'v{s1}',
  '{s1}{s2}':
    '{s1}{s2}',
  'n={s1}':
    'n={s1}',
  'Triangolo inferiore: coefficiente con stelle di significatività (* p<.05, ** p<.01, *** p<.001). Triangolo superiore: N della coppia.':
    'Lower triangle: coefficient with significance stars (* p<.05, ** p<.01, *** p<.001). Upper triangle: N of the pair.',
  'Matrice di correlazione di Spearman (ρ)':
    'Spearman correlation matrix (ρ)',
  'Rho di Spearman sui ranghi.':
    'Spearman\'s rho on the ranks.',
  'Matrice di correlazione di Pearson (r)':
    'Pearson correlation matrix (r)',
  'Coefficiente lineare di Pearson.':
    'Pearson linear coefficient.',
  'Matrice di correlazione di Kendall (τ-b)':
    'Kendall correlation matrix (τ-b)',
  'Tau-b di Kendall con correzione dei ranghi pari.':
    'Kendall\'s tau-b with tied-rank correction.',
  'Descrittive delle variabili':
    'Variable descriptives',
  'controllando per le altre {s1} variabili · CI {s2}%':
    'controlling for the other {s1} variables · CI {s2}%',
  'Controllate':
    'Controlled',
  'r parziale':
    'partial r',
  'Calcolate su casi completi per tutte le variabili selezionate (listwise deletion), per garantire una matrice invertibile.':
    'Computed on complete cases for all selected variables (listwise deletion), to guarantee an invertible matrix.',
  'r parziale da inversa della matrice di correlazione: r_ij·rest = −P_ij/√(P_ii·P_jj); p con t e df = N − q (q = numero di variabili selezionate).':
    'partial r from the inverse of the correlation matrix: r_ij·rest = −P_ij/√(P_ii·P_jj); p with t and df = N − q (q = number of selected variables).',
};
