/** pt-PT: report and table prose (normalised). */
export const regressionCopy: Record<string, string> = {
  ' ({s1})':
    ' ({s1})',
  ' + ({s1}) × {s2}':
    ' + ({s1}) × {s2}',
  ', Lilliefors {s1}':
    ', Lilliefors {s1}',
  '; VIF = {s1} segnala collinearità':
    '; VIF = {s1} assinala colinearidade',
  '; β standardizzato = {s1}':
    '; β estandardizado = {s1}',
  '{s1} · CI {s2}%':
    '{s1} · CI {s2}%',
  '{s1} ~ {s2}':
    '{s1} ~ {s2}',
  '{s1} osservazioni con residuo studentizzato oltre 3 SD: verificane l’influenza sulle stime.':
    '{s1} observações com resíduo studentizado além de 3 SD: verifique a sua influência nas estimativas.',
  '{s1}: B = {s2} (CI {s3}% {s4}), {s5} → {s6}. In media, un aumento di una unità di {s7} {s8} {s9} di {s10} a parità delle altre variabili{s11}{s12}.':
    '{s1}: B = {s2} (CI {s3}% {s4}), {s5} → {s6}. Em média, um aumento de uma unidade de {s7} {s8} {s9} de {s10}, mantendo as outras variáveis constantes{s11}{s12}.',
  '→ collinearità problematica: i coefficienti dei predittori coinvolti sono instabili':
    '→ colinearidade problemática: os coeficientes dos preditores envolvidos são instáveis',
  '→ collinearità sotto la soglia di attenzione (5)':
    '→ colinearidade abaixo do limiar de atenção (5)',
  '|DFBETAS| massimo':
    '|DFBETAS| máximo',
  '√(SSE / {s1})':
    '√(SSE / {s1})',
  '≈2 assenza di autocorrelazione; ordine righe':
    '≈2 ausência de autocorrelação; ordem das linhas',
  'Adjusted R²':
    'R² ajustado',
  'AIC':
    'AIC',
  'ANOVA del modello':
    'ANOVA do modelo',
  'aumenta':
    'aumenta',
  'B':
    'B',
  'B è il cambiamento atteso nella variabile dipendente per una unità in più del predittore, tenendo fermi gli altri: l’unità conta, e molto.':
    'B é a variação esperada na variável dependente por mais uma unidade do preditor, mantendo os outros fixos: a unidade conta, e muito.',
  'BIC':
    'BIC',
  'Breusch–Pagan {s1} → {s2}.':
    'Breusch–Pagan {s1} → {s2}.',
  'Breusch–Pagan LM':
    'LM de Breusch–Pagan',
  'Breusch–Pagan p':
    'p de Breusch–Pagan',
  'Breusch–Pagan richiede l’ipotesi di normalità dei residui; con N piccolo ha potenza limitata.':
    'Breusch–Pagan exige o pressuposto de normalidade dos resíduos; com N pequeno tem potência limitada.',
  'CI {s1}% · stima OLS':
    'CI {s1}% · estimativa OLS',
  'CI high':
    'CI superior',
  'CI low':
    'CI inferior',
  'CI: B ± t({s1}%, df = {s2})·SE. β std. = B·SD(x)/SD(y).':
    'CI: B ± t({s1}%, df = {s2})·SE. β est. = B·SD(x)/SD(y).',
  'Coefficienti':
    'Coeficientes',
  'Come leggere i numeri':
    'Como ler os números',
  'Con più predittori il Theil–Sen è calcolato separatamente per ciascun predittore e non controlla gli altri: usarlo solo come diagnostica descrittiva.':
    'Com vários preditores o Theil–Sen é calculado separadamente para cada preditor e não controla os outros: usá-lo apenas como diagnóstico descritivo.',
  'Condition index > 30':
    'Índice de condição > 30',
  'Condition index di Belsley calcolato sugli autovalori di XᵀX dopo scala a norma unitaria: valori > 30 suggeriscono collinearità, > 100 sono gravi.':
    'Índice de condição de Belsley calculado sobre os valores próprios de XᵀX após escala a norma unitária: valores > 30 sugerem colinearidade, > 100 são graves.',
  'Condition index massimo':
    'Índice de condição máximo',
  'Confronto tra OLS e stimatore robusto{s1}: se le due pendenze sono simili, gli outlier non stanno distorcendo il risultato.':
    'Comparação entre OLS e estimador robusto{s1}: se os dois declives forem semelhantes, os valores atípicos não estão a distorcer o resultado.',
  'Cook\'s D > 1':
    'D de Cook > 1',
  'Cook\'s D massimo':
    'D de Cook máximo',
  'corretto per numero di predittori':
    'corrigido para o número de preditores',
  'Dettaglio':
    'Detalhe',
  'df':
    'df',
  'DFBETAS oltre 2/√n':
    'DFBETAS além de 2/√n',
  'Diagnostica dei residui':
    'Diagnóstico dos resíduos',
  'Diagnostica del modello':
    'Diagnóstico do modelo',
  'Differenza percentuale: {s1}%.':
    'Diferença percentual: {s1}%.',
  'diminuisce':
    'diminui',
  'Durbin–Watson':
    'Durbin–Watson',
  'Equazione stimata: {s1} = {s2}{s3}.':
    'Equação estimada: {s1} = {s2}{s3}.',
  'Errori standard robusti':
    'Erros padrão robustos',
  'eteroschedasticità dei residui':
    'heterocedasticidade dos resíduos',
  'eteroschedasticità dei residui: gli errori standard e i p-value possono essere inaffidabili':
    'heterocedasticidade dos resíduos: os erros padrão e os valores p podem não ser fiáveis',
  'Eteroschedasticità non verificabile.':
    'Heterocedasticidade não verificável.',
  'Excess kurtosis':
    'Curtose em excesso',
  'F':
    'F',
  'F con 1 e df del modello aumentato':
    'F com 1 e df do modelo aumentado',
  'F({s1}, {s2})':
    'F({s1}, {s2})',
  'h_ii = x_iᵀ(XᵀX)⁻¹x_i':
    'h_ii = x_iᵀ(XᵀX)⁻¹x_i',
  'HC1 = n/(n−k−1); HC3 = 1/(1−h)². La matrice di covarianza robusta non assume varianza costante.':
    'HC1 = n/(n−k−1); HC3 = 1/(1−h)². A matriz de covariância robusta não assume variância constante.',
  'I gradi di libertà restano n−k−1; con pochi casi i test robusti sono instabili.':
    'Os graus de liberdade permanecem n−k−1; com poucos casos os testes robustos são instáveis.',
  'I predittori con effetto affidabile sono: {s1}. L’associazione stimata non è una prova di causa-effetto: serve un disegno che escluda fattori confondenti.':
    'Os preditores com efeito fiável são: {s1}. A associação estimada não é uma prova de causa-efeito: é necessário um delineamento que exclua fatores de confusão.',
  'I residui Theil–Sen sono disponibili per la regressione semplice; con più predittori il TS è univariato e non definisce un modello congiunto.':
    'Os resíduos Theil–Sen estão disponíveis para a regressão simples; com vários preditores o TS é univariado e não define um modelo conjunto.',
  'Il CI al {s1}% del coefficiente è la forbice dei valori plausibili: se contiene lo zero l’effetto non è distinguibile da nessun effetto.':
    'O CI a {s1}% do coeficiente é o intervalo dos valores plausíveis: se contiver o zero o efeito não é distinguível de nenhum efeito.',
  'Il modello cerca la retta (o l’iperpiano) che rende minima la somma degli scarti al quadrato: i coefficienti indicano l’effetto di ogni variabile tenendo ferme le altre.':
    'O modelo procura a reta (ou o hiperplano) que torna mínima a soma dos desvios ao quadrado: os coeficientes indicam o efeito de cada variável mantendo as outras fixas.',
  'Il modello è significativo (F = {s1}, {s2}) e spiega il {s3}% della variabilità di {s4}.':
    'O modelo é significativo (F = {s1}, {s2}) e explica {s3}% da variabilidade de {s4}.',
  'il modello nel complesso è utile':
    'o modelo no seu conjunto é útil',
  'il modello nel complesso non è distinguibile dal caso':
    'o modelo no seu conjunto não é distinguível do acaso',
  'Il modello nel suo insieme':
    'O modelo no seu conjunto',
  'Il modello non è significativo (F = {s1}, {s2}): i predittori non spiegano {s3} meglio del caso.':
    'O modelo não é significativo (F = {s1}, {s2}): os preditores não explicam {s3} melhor do que o acaso.',
  'Il modello non è stimabile con i dati disponibili.':
    'O modelo não é estimável com os dados disponíveis.',
  'In pratica':
    'Na prática',
  'influenza su singolo coefficiente':
    'influência sobre um coeficiente individual',
  'Intercept':
    'Intercepto',
  'Jarque–Bera p':
    'p de Jarque–Bera',
  'La regressione descrive associazioni, non cause: variabili omesse o invertite possono spiegare lo stesso pattern.':
    'A regressão descreve associações, não causas: variáveis omitidas ou invertidas podem explicar o mesmo padrão.',
  'Le previsioni valgono solo dentro l’intervallo dei valori osservati: fuori da quel range l’estrapolazione è arbitraria.':
    'As previsões valem apenas dentro do intervalo dos valores observados: fora desse intervalo a extrapolação é arbitrária.',
  'Le righe incomplete vengono scartate per intero: se i dati mancanti non sono casuali il modello può essere distorto.':
    'As linhas incompletas são descartadas por inteiro: se os dados omissos não forem aleatórios o modelo pode ficar distorcido.',
  'Leverage massimo':
    'Leverage máximo',
  'Lilliefors p':
    'p de Lilliefors',
  'Max':
    'Max',
  'Mean':
    'Média',
  'Median':
    'Mediana',
  'Metrica':
    'Métrica',
  'Min':
    'Min',
  'Modello non utile':
    'Modelo não útil',
  'Modello utile':
    'Modelo útil',
  'MS':
    'MS',
  'N':
    'N',
  'n·ln(SSE/n) + 2(k+1)':
    'n·ln(SSE/n) + 2(k+1)',
  'n·ln(SSE/n) + ln(n)(k+1)':
    'n·ln(SSE/n) + ln(n)(k+1)',
  'Nessun coefficiente disponibile.':
    'Nenhum coeficiente disponível.',
  'Nessun predittore mostra un effetto affidabile: il modello, così com’è, non è uno strumento di previsione utile su questi dati.':
    'Nenhum preditor mostra um efeito fiável: o modelo, tal como está, não é um instrumento de previsão útil sobre estes dados.',
  'Nessun residuo studentizzato oltre 3 SD: nessun caso fortemente anomalo rispetto al modello.':
    'Nenhum resíduo studentizado além de 3 SD: nenhum caso fortemente atípico em relação ao modelo.',
  'nessuna evidenza contro la normalità dei residui':
    'nenhuma evidência contra a normalidade dos resíduos',
  'nessuna evidenza di effetto':
    'nenhuma evidência de efeito',
  'nessuna evidenza di eteroschedasticità':
    'nenhuma evidência de heterocedasticidade',
  'non cambia':
    'não altera',
  'non linearità da potenze dei valori adattati':
    'não linearidade por potências dos valores ajustados',
  'non stimabile':
    'não estimável',
  'Normalità dei residui: Jarque–Bera {s1}{s2} → {s3}.':
    'Normalidade dos resíduos: Jarque–Bera {s1}{s2} → {s3}.',
  'Nota':
    'Nota',
  'numero di dimensioni coinvolte':
    'número de dimensões envolvidas',
  'numero di osservazioni':
    'número de observações',
  'Ogni predittore':
    'Cada preditor',
  'OLS':
    'OLS',
  'OLS B':
    'B do OLS',
  'OLS vs Theil–Sen':
    'OLS vs. Theil–Sen',
  'osservazioni complete (k = {s1} predittori)':
    'observações completas (k = {s1} preditores)',
  'Osservazioni usate: {s1} (solo righe complete su tutte le variabili del modello).':
    'Observações usadas: {s1} (apenas linhas completas em todas as variáveis do modelo).',
  'outlier sui residui studentizzati':
    'valores atípicos nos resíduos studentizados',
  'p':
    'p',
  'p (F)':
    'p (F)',
  'Parametro':
    'Parâmetro',
  'Pendenza OLS = {s1}, pendenza Theil–Sen = {s2} (CI {s3}% {s4}).':
    'Declive OLS = {s1}, declive de Theil–Sen = {s2} (CI {s3}% {s4}).',
  'Predictor':
    'Preditor',
  'predittore significativo':
    'preditor significativo',
  'quadrati e prodotti incrociati dei predittori':
    'quadrados e produtos cruzados dos preditores',
  'quota di varianza spiegata':
    'quota de variância explicada',
  'R':
    'R',
  'R²':
    'R²',
  'R² = {s1} → il modello spiega il {s2}% della variabilità di {s3}.':
    'R² = {s1} → o modelo explica {s2}% da variabilidade de {s3}.',
  'R² alto non significa modello corretto: guarda sempre residui, diagnostica e senso delle variabili.':
    'Um R² alto não significa um modelo correto: veja sempre os resíduos, o diagnóstico e o sentido das variáveis.',
  'R² corretto = {s1} → quota spiegata al netto del numero di predittori; se è molto più basso di R² il modello è sovra-adattato.':
    'R² ajustado = {s1} → quota explicada líquida do número de preditores; se for muito mais baixa do que o R² o modelo está sobreajustado.',
  'R² e F assumono un modello con intercetta. AIC/BIC sono definiti a meno di una costante additiva.':
    'R² e F assumem um modelo com intercepto. AIC/BIC são definidos a menos de uma constante aditiva.',
  'Report di lettura — Regressione':
    'Relatório de leitura — Regressão',
  'RESET F (ŷ²)':
    'F do RESET (ŷ²)',
  'RESET p':
    'p do RESET',
  'residui non gaussiani: gli intervalli di confidenza vanno letti con prudenza':
    'resíduos não gaussianos: os intervalos de confiança devem ser lidos com prudência',
  'Residui OLS':
    'Resíduos OLS',
  'Residui oltre 3 SD':
    'Resíduos além de 3 SD',
  'Residui studentizzati |z| > 3':
    'Resíduos studentizados |z| > 3',
  'Residui Theil–Sen':
    'Resíduos Theil–Sen',
  'SD':
    'SD',
  'SE':
    'SE',
  'SE of estimate':
    'SE da estimativa',
  'SE robusto':
    'SE robusto',
  'Sintesi del modello':
    'Síntese do modelo',
  'Skewness':
    'Assimetria',
  'Slope':
    'Declive',
  'soglia {s1}':
    'limiar {s1}',
  'Source':
    'Fonte',
  'SS':
    'SS',
  'Stima come {s1} cambia al variare di {s2} e quanto quella relazione spiega dei dati osservati.':
    'Estima como {s1} muda com {s2} e quanto essa relação explica dos dados observados.',
  'Stima robusta Theil–Sen':
    'Estimativa robusta de Theil–Sen',
  'Stimatore robusto Theil–Sen':
    'Estimador robusto de Theil–Sen',
  'Stimatori robusti univariati':
    'Estimadores robustos univariados',
  't':
    't',
  'test globale del modello':
    'teste global do modelo',
  'Test globale: F = {s1}, {s2} (α = {s3}) → {s4}.':
    'Teste global: F = {s1}, {s2} (α = {s3}) → {s4}.',
  'Theil–Sen':
    'Theil–Sen',
  'Theil–Sen slope':
    'Declive de Theil–Sen',
  'Theil–Sen: mediana delle pendenze tra tutte le coppie di punti; CI bootstrap percentile (600 repliche, seed fisso).':
    'Theil–Sen: mediana dos declives entre todos os pares de pontos; CI bootstrap percentílico (600 réplicas, seed fixo).',
  'Tolerance':
    'Tolerância',
  'TS CI high':
    'CI superior do TS',
  'TS CI low':
    'CI inferior do TS',
  'Valore':
    'Valor',
  'valori > 1 indicano osservazioni influenti':
    'valores > 1 indicam observações influentes',
  'VIF':
    'VIF',
  'VIF = 1/(1−R²_aux) da regressione del predittore sugli altri; valori > 5 indicano collinearità problematica.':
    'VIF = 1/(1−R²_aux) da regressão do preditor sobre os outros; valores > 5 indicam colinearidade problemática.',
  'VIF massimo = {s1} {s2}.':
    'VIF máximo = {s1} {s2}.',
  'White LM':
    'LM de White',
  'White p':
    'p de White',
  'White usa n·R² della regressione ausiliaria (quadrati e prodotti incrociati); RESET2 aggiunge ŷ². DFBETAS misura il cambio standardizzato di un coefficiente eliminando un’osservazione.':
    'White usa n·R² da regressão auxiliar (quadrados e produtos cruzados); o RESET2 acrescenta ŷ². O DFBETAS mede a variação estandardizada de um coeficiente ao eliminar uma observação.',
  'X scalato a norma unitaria; > 30 collinearità':
    'X escalado a norma unitária; > 30 colinearidade',
  'β std.':
    'β est.',
  'χ² con {s1} df':
    'χ² com {s1} df',
};
