/** pt-PT: report and table prose (normalised). */
export const logisticCopy: Record<string, string> = {
  '{s1} · N = {s2}':
    '{s1} · N = {s2}',
  '{s1} predittori pesano':
    '{s1} preditores pesam',
  '{s1}: OR = {s2} (CI {s3} – {s4}), p = {s5}: un’unità in più {s6} le probabilità dell’esito di circa {s7}%.':
    '{s1}: OR = {s2} (CI {s3} – {s4}), p = {s5}: mais uma unidade {s6} as probabilidades do resultado em cerca de {s7}%.',
  '{s1}%':
    '{s1}%',
  '1 predittore pesa':
    '1 preditor pesa',
  'Accuratezza':
    'Exatidão',
  'AIC':
    'AIC',
  'Almeno un coefficiente è molto grande: i dati separano quasi perfettamente gli esiti e le stime/SE non sono affidabili.':
    'Pelo menos um coeficiente é muito grande: os dados separam quase perfeitamente os resultados e as estimativas/SE não são fiáveis.',
  'Assunzioni e cautele':
    'Pressupostos e cautelas',
  'Attenzione: separazione':
    'Atenção: separação',
  'AUC':
    'AUC',
  'AUC = {s1}: probabilità che un caso con esito positivo riceva un punteggio più alto di un caso negativo. Accuratezza alla soglia scelta: {s2}.':
    'AUC = {s1}: probabilidade de um caso com resultado positivo receber uma pontuação mais alta do que um caso negativo. Exatidão no limiar escolhido: {s2}.',
  'B':
    'B',
  'BIC':
    'BIC',
  'CI {s1}%':
    'CI {s1}%',
  'Classificazione':
    'Classificação',
  'Coefficienti e odds ratio':
    'Coeficientes e odds ratios',
  'Come leggere gli odds ratio':
    'Como ler os odds ratios',
  'Cox–Snell R²':
    'R² de Cox–Snell',
  'df':
    'df',
  'Diagnostica':
    'Diagnóstico',
  'Eventi (Y = 1)':
    'Eventos (Y = 1)',
  'Eventi per parametro':
    'Eventos por parâmetro',
  'Firth penalized likelihood':
    'Verosimilhança penalizada de Firth',
  'Gli esiti devono essere indipendenti tra loro (una riga = una unità).':
    'Os resultados têm de ser independentes entre si (uma linha = uma unidade).',
  'Gli OR sono stimati al netto degli altri predittori e con un CI al {s1}%: un intervallo che contiene 1 corrisponde a un effetto non significativo.':
    'Os OR são estimados líquidos dos outros preditores e com um CI a {s1}%: um intervalo que contém 1 corresponde a um efeito não significativo.',
  'I dati separano quasi perfettamente gli esiti: le stime non sono affidabili.':
    'Os dados separam quase perfeitamente os resultados: as estimativas não são fiáveis.',
  'Il modello contiene {s1} predittore/i su {s2} osservazioni e {s3} eventi.':
    'O modelo contém {s1} preditor(es) em {s2} observações e {s3} eventos.',
  'Il modello è significativo (LR p = {s1}) e {s2} sul risultato.':
    'O modelo é significativo (p do LR = {s1}) e {s2} sobre o resultado.',
  'Il modello non è significativo (LR p = {s1}).':
    'O modelo não é significativo (p do LR = {s1}).',
  'Il p è di Wald (z = B/SE): con campioni piccoli o effetti forti può essere meno affidabile del test LR.':
    'O p é de Wald (z = B/SE): com amostras pequenas ou efeitos fortes pode ser menos fiável do que o teste LR.',
  'Il test LR confronta il modello con quello che contiene solo l’intercetta: p piccolo = almeno un predittore aggiunge informazione.':
    'O teste LR compara o modelo com o que contém apenas o intercepto: p pequeno = pelo menos um preditor acrescenta informação.',
  'Il test LR vale {s1} con {s2} gradi di libertà: {s3}':
    'O teste LR vale {s1} com {s2} graus de liberdade: {s3}',
  'L’accuratezza dipende dalla soglia: riportala sempre insieme a sensibilità e specificità.':
    'A exatidão depende do limiar: apresente-a sempre com a sensibilidade e a especificidade.',
  'L’AUC non dipende dalla soglia: 0,5 è il caso, 0,7 accettabile, 0,8 buono, 0,9 eccellente.':
    'A AUC não depende do limiar: 0,5 é o acaso, 0,7 aceitável, 0,8 bom, 0,9 excelente.',
  'L’intervallo dell’OR è calcolato su scala logaritmica: exp(B ± z·SE). Se contiene 1, l’effetto non è significativo.':
    'O intervalo do OR é calculado na escala logarítmica: exp(B ± z·SE). Se contiver 1, o efeito não é significativo.',
  'L’ipotesi nulla del test LR è “nessun predittore aggiunge informazione rispetto alla sola intercetta”; ogni coefficiente risponde invece alla domanda “questo predittore pesa, al netto degli altri?”.':
    'A hipótese nula do teste LR é «nenhum preditor acrescenta informação em relação ao intercepto apenas»; cada coeficiente responde, em vez disso, à pergunta «este preditor pesa, líquido dos outros?».',
  'L’odds ratio non è un rischio relativo: OR = 2 significa che gli odds raddoppiano, non che la probabilità raddoppia. Con esiti frequenti la differenza tra le due letture è grande, con esiti rari è piccola.':
    'O odds ratio não é um risco relativo: OR = 2 significa que as odds duplicam, não que a probabilidade duplica. Com resultados frequentes a diferença entre as duas leituras é grande, com resultados raros é pequena.',
  'La bontà di adattamento è riassunta da pseudo-R² e AUC: non sostituiscono un controllo dei residui per la forma della relazione.':
    'A qualidade do ajustamento é resumida por pseudo-R² e AUC: não substituem uma verificação dos resíduos para a forma da relação.',
  'La lettura dei risultati':
    'A leitura dos resultados',
  'La regressione logistica modella la probabilità di un esito binario (sì/no) in funzione di uno o più predittori, invece di modellare direttamente il valore medio come fa la regressione lineare.':
    'A regressão logística modela a probabilidade de um resultado binário (sim/não) em função de um ou mais preditores, em vez de modelar diretamente o valor médio como faz a regressão linear.',
  'La relazione tra predittore e logit della probabilità è lineare: con predittori continui controlla la forma o usa trasformazioni.':
    'A relação entre o preditor e o logit da probabilidade é linear: com preditores contínuos verifique a forma ou use transformações.',
  'La separazione (outcome predetto perfettamente) gonfia i coefficienti e invalida i test.':
    'A separação (resultado previsto perfeitamente) inflaciona os coeficientes e invalida os testes.',
  'La soglia 0,5 è arbitraria: se il costo di un falso negativo è alto, abbassala e guarda come cambiano sensibilità e specificità.':
    'O limiar 0,5 é arbitrário: se o custo de um falso negativo é alto, baixe-o e veja como mudam a sensibilidade e a especificidade.',
  'La verosimiglianza penalizzata di Firth mantiene finite le stime; gli errori standard restano approssimati.':
    'A verosimilhança penalizada de Firth mantém as estimativas finitas; os erros padrão permanecem aproximados.',
  'Le pseudo-R² non hanno il significato dell’R² lineare: valori intorno a 0,2–0,4 indicano già un buon adattamento.':
    'Os pseudo-R² não têm o significado do R² linear: valores em torno de 0,2–0,4 indicam já um bom ajustamento.',
  'Log-verosimiglianza':
    'Log-verosimilhança',
  'Log-verosimiglianza nulla':
    'Log-verosimilhança nula',
  'LR χ² (vs modello nullo)':
    'χ² do LR (vs. modelo nulo)',
  'McFadden R²':
    'R² de McFadden',
  'McFadden R² = {s1}: valori sopra 0,2 indicano un modello con potere esplicativo reale, ma non vanno confrontati con l’R² della regressione lineare.':
    'R² de McFadden = {s1}: valores acima de 0,2 indicam um modelo com poder explicativo real, mas não devem ser comparados com o R² da regressão linear.',
  'Metrica':
    'Métrica',
  'Modello debole':
    'Modelo fraco',
  'Modello informativo':
    'Modelo informativo',
  'Modello logistico':
    'Modelo logístico',
  'Nagelkerke R²':
    'R² de Nagelkerke',
  'non calcolabile.':
    'não calculável.',
  'non rifiuta l’ipotesi che nessun predittore conti.':
    'não rejeita a hipótese de que nenhum preditor conta.',
  'Non sono inclusi modelli con effetti casuali, interazioni, regressione penalizzata o aggiustamento per dati sbilanciati.':
    'Não estão incluídos modelos com efeitos aleatórios, interações, regressão penalizada ou ajustamento para dados desequilibrados.',
  'OR':
    'OR',
  'OR > 1 aumenta le probabilità dell’esito per un’unità in più del predittore; OR < 1 le riduce. OR = 1 non ha effetto.':
    'OR > 1 aumenta as probabilidades do resultado por mais uma unidade do preditor; OR < 1 reduz. OR = 1 não tem efeito.',
  'OR CI high':
    'CI superior do OR',
  'OR CI low':
    'CI inferior do OR',
  'Osservazioni':
    'Observações',
  'p':
    'p',
  'p del modello':
    'p do modelo',
  'Predittore':
    'Preditor',
  'Quanto discrimina il modello':
    'Quanto discrimina o modelo',
  'Raccogli più casi, riduci i predittori o usa una regressione penalizzata (Firth).':
    'Recolha mais casos, reduza os preditores ou use uma regressão penalizada (Firth).',
  'Report di lettura':
    'Relatório de leitura',
  'rifiuta l’ipotesi che nessun predittore conti.':
    'rejeita a hipótese de que nenhum preditor conta.',
  'SE':
    'SE',
  'Sensibilità':
    'Sensibilidade',
  'Separazione gestita da Firth':
    'Separação tratada por Firth',
  'Servono eventi sufficienti: meno di 10 eventi per parametro rende le stime instabili (regola pratica EPV).':
    'São necessários eventos suficientes: menos de 10 eventos por parâmetro torna as estimativas instáveis (regra prática EPV).',
  'soglia p ≥ {s1} → Y = 1':
    'limiar p ≥ {s1} → Y = 1',
  'Specificità':
    'Especificidade',
  'stima di massima verosimiglianza':
    'estimativa de máxima verosimilhança',
  'Valore':
    'Valor',
  'Wald z':
    'z de Wald',
};
