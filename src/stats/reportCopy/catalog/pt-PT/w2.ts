/** Portuguese (Portugal): W2 report and table prose. */
export const w2Copy: Record<string, string> = {
  'Sì': 'Sim',
  'Nessun gruppo cade fuori dalle linee di decisione: le medie sono compatibili con la media generale.':
    'Nenhum grupo fica fora das linhas de decisão: as médias são compatíveis com a média global.',
  '{s1} gruppo/i cadono fuori dalle linee di decisione: {s2}.':
    '{s1} grupo(s) ficam fora das linhas de decisão: {s2}.',
  'Report di lettura — ANOM': 'Relatório de leitura — ANOM',
  'L’ANOM (analisi delle medie) confronta ogni media di gruppo con la media generale, usando linee di decisione che tengono conto del numero di gruppi e della variabilità entro gruppo.':
    'O ANOM (análise de médias) compara cada média de grupo com a média global, usando linhas de decisão que têm em conta o número de grupos e a variabilidade intragrupo.',
  'È la versione grafica e intuitiva dell’ANOVA: invece di un solo test globale mostra quali gruppi si allontanano.':
    'É a versão gráfica e intuitiva da ANOVA: em vez de um único teste global, mostra quais os grupos que se afastam.',
  'Le linee sono costruite al livello α = {s1}%; un gruppo fuori dagli intervalli merita un controllo, non una conclusione automatica.':
    'As linhas são construídas ao nível α = {s1}%; um grupo fora dos intervalos merece uma verificação, não uma conclusão automática.',
  'Con gruppi sbilanciati ogni gruppo ha limiti propri, perché la sua media ha una precisione diversa.':
    'Com grupos desequilibrados, cada grupo tem limites próprios, porque a sua média tem uma precisão diferente.',
  'Cautele': 'Cuidados',
  'Il valore critico usa l’approssimazione Bonferroni-t: è leggermente conservativo rispetto alla distribuzione esatta del massimo modulo studentizzato.':
    'O valor crítico usa a aproximação de Bonferroni-t: é ligeiramente conservador em relação à distribuição exata do módulo estandardizado máximo.',
  'L’ANOM non sostituisce l’ANOVA: serve a localizzare le differenze, non a stimarne l’entità.':
    'O ANOM não substitui a ANOVA: serve para localizar as diferenças, não para estimar a sua magnitude.',
  'Con molti gruppi e pochi dati per gruppo la potenza resta bassa.':
    'Com muitos grupos e poucos dados por grupo, a potência mantém-se baixa.',
  'Il test presuppone osservazioni indipendenti e variabilità confrontabile tra i gruppi.':
    'O teste pressupõe observações independentes e variabilidade comparável entre os grupos.',
  'Report di lettura — Modello lineare generalizzato':
    'Relatório de leitura — Modelo linear generalizado',
  '{s1} spiegato da {s2} predittore/i con famiglia {s3} e link {s4}; devianza = {s5}.':
    '{s1} explicado por {s2} preditor(es) com família {s3} e ligação {s4}; desvio = {s5}.',
  'Il modello non ha raggiunto la convergenza: le stime non sono affidabili.':
    'O modelo não atingiu a convergência: as estimativas não são fiáveis.',
  'Regressione': 'Regressão',
  'Il GLM estende la regressione lineare a risposte non normali: la famiglia definisce la varianza, il link collega la media ai predittori.':
    'O GLM estende a regressão linear a respostas não normais: a família define a variância e a ligação relaciona a média com os preditores.',
  'La scelta di famiglia e link è parte del modello: non è un dettaglio tecnico, cambia il significato dei coefficienti.':
    'A escolha da família e da ligação faz parte do modelo: não é um detalhe técnico, altera o significado dos coeficientes.',
  'Devianza = {s1} su {s2} gradi di libertà; devianza nulla = {s3}.':
    'Desvio = {s1} com {s2} graus de liberdade; desvio nulo = {s3}.',
  'Log-verosimiglianza = {s1}; AIC = {s2}; iterazioni = {s3}.':
    'Log-verossimilhança = {s1}; AIC = {s2}; iterações = {s3}.',
  '{s1} predittore/i su {s2} risultano significativi al livello scelto.':
    '{s1} preditor(es) de {s2} são significativos ao nível escolhido.',
  '{s1}: B = {s2} (CI {s3} – {s4}), p = {s5}.': '{s1}: B = {s2} (IC {s3} – {s4}), p = {s5}.',
  'Come leggerlo': 'Como interpretá-lo',
  'Con link log i coefficienti sono differenze di log-media: exp(B) è un rapporto di medie, non di probabilità.':
    'Com ligação log, os coeficientes são diferenças de log-média: exp(B) é um rácio de médias, não de probabilidades.',
  'Con link logit/probit la risposta è una probabilità: B va letto sulla scala latente.':
    'Com ligação logit/probit, a resposta é uma probabilidade: B deve ser lido na escala latente.',
  'Con famiglia Gamma la risposta deve essere strettamente positiva; con Poisson deve essere un conteggio.':
    'Com a família Gamma, a resposta tem de ser estritamente positiva; com Poisson, tem de ser uma contagem.',
  'Controlla la devianza residua e i residui: un modello può convergere e restare mal specificato.':
    'Verifique o desvio residual e os resíduos: um modelo pode convergir e continuar mal especificado.',
  'Il motore copre le famiglie gaussiana, binomiale, Poisson e Gamma; Tweedie e quasi-verosimiglianze non sono incluse.':
    'O motor abrange as famílias gaussiana, binomial, Poisson e Gamma; Tweedie e as quase-verossimilhanças não estão incluídas.',
  'La bontà del modello non è riassunta da un R²: confronta devianza, AIC e diagnostica dei residui.':
    'A qualidade do modelo não se resume a um R²: compare o desvio, o AIC e o diagnóstico dos resíduos.',
  'La regressione probit modella la probabilità di un esito binario (sì/no) tramite la funzione di ripartizione normale standard, invece del logit usato dalla regressione logistica.':
    'A regressão probit modela a probabilidade de um resultado binário (sim/não) através da função de distribuição normal padrão, em vez do logit usado pela regressão logística.',
  'Come leggere i coefficienti probit': 'Como ler os coeficientes probit',
  'B misura lo spostamento del predittore latente normale: exp(B) non è un odds ratio e non va letto come tale.':
    'B mede o deslocamento do preditor latente normal: exp(B) não é um odds ratio e não deve ser lido como tal.',
  'I coefficienti sono stimati al netto degli altri predittori e con un CI al {s1}%: un intervallo che contiene 0 corrisponde a un effetto non significativo.':
    'Os coeficientes são estimados ajustando para os restantes preditores e com um IC a {s1}%: um intervalo que contém 0 corresponde a um efeito não significativo.',
  '{s1}: {s2}% di classificazioni corrette ({s3} su {s4}).':
    '{s1}: {s2}% de classificações corretas ({s3} em {s4}).',
  'Report di regressione multinomiale': 'Relatório de regressão multinomial',
  'Il modello distingue {s1} classi con un’accuratezza del {s2}%; la classe di riferimento è “{s3}”.':
    'O modelo distingue {s1} classes com uma exatidão de {s2}%; a classe de referência é «{s3}».',
  'La regressione logistica multinomiale modella la probabilità di appartenenza a ciascuna di più classi nominali (non ordinate) a partire da uno o più predittori.':
    'A regressão logística multinomial modela a probabilidade de pertença a cada uma de várias classes nominais (não ordenadas) a partir de um ou mais preditores.',
  'Ogni classe è confrontata con la classe di riferimento “{s1}”: i coefficienti descrivono quanto il logit di quella classe cambia rispetto al riferimento per un’unità in più del predittore.':
    'Cada classe é comparada com a classe de referência «{s1}»: os coeficientes descrevem quanto o logit dessa classe muda em relação à referência por uma unidade adicional do preditor.',
  'Sono state analizzate {s1} osservazioni complete su {s2} classi e {s3} predittore/i.':
    'Foram analisadas {s1} observações completas em {s2} classes e {s3} preditor(es).',
  'Il modello classifica correttamente il {s1}% delle osservazioni; la classe con l’accuratezza più alta è {s2}.':
    'O modelo classifica corretamente {s1}% das observações; a classe com maior exatidão é {s2}.',
  '{s1} ({s2}%)': '{s1} ({s2}%)',
  'non disponibile': 'não disponível',
  '{s1} predittore/i mostrano almeno un coefficiente significativo al livello scelto ({s2}).':
    '{s1} preditor(es) apresentam pelo menos um coeficiente significativo ao nível escolhido ({s2}).',
  'Nessun coefficiente raggiunge la significatività al livello scelto.':
    'Nenhum coeficiente atinge a significância ao nível escolhido.',
  'Convergenza del modello: {s1}.': 'Convergência do modelo: {s1}.',
  'Accuratezza per classe': 'Exatidão por classe',
  'La tabella di classificazione non è disponibile.':
    'A tabela de classificação não está disponível.',
  'Come leggere i coefficienti': 'Como ler os coeficientes',
  'Un odds ratio maggiore di 1 indica che un’unità in più del predittore aumenta le probabilità della classe rispetto al riferimento; un valore minore di 1 le riduce.':
    'Um odds ratio superior a 1 indica que uma unidade adicional do preditor aumenta as probabilidades da classe em relação à referência; um valor inferior a 1 reduz-as.',
  'Gli odds ratio sono stimati al netto degli altri predittori e con un intervallo di confidenza al {s1}%: se l’intervallo contiene 1 l’effetto non è distinguibile da zero.':
    'Os odds ratio são estimados ajustando para os restantes preditores e com um intervalo de confiança a {s1}%: se o intervalo contém 1, o efeito não é distinguível de zero.',
  'I test sui coefficienti sono di Wald (z = B/SE): con campioni piccoli o classi rare possono essere meno affidabili di un confronto basato sulla verosimiglianza.':
    'Os testes sobre os coeficientes são de Wald (z = B/EP): com amostras pequenas ou classes raras podem ser menos fiáveis do que uma comparação baseada na verossimilhança.',
  'Le osservazioni devono essere indipendenti tra loro (una riga = una unità).':
    'As observações devem ser independentes entre si (uma linha = uma unidade).',
  'Le classi dell’esito sono nominali: l’ordine alfabetico o numerico non implica una graduatoria.':
    'As classes do resultado são nominais: a ordem alfabética ou numérica não implica uma hierarquia.',
  'La relazione tra ogni predittore e il logit delle classi è lineare: controlla la forma o usa trasformazioni.':
    'A relação entre cada preditor e o logit das classes é linear: verifique a forma ou use transformações.',
  'Servono osservazioni sufficienti per ogni classe: classi rare o vuote rendono le stime instabili.':
    'São necessárias observações suficientes para cada classe: classes raras ou vazias tornam as estimativas instáveis.',
  'La separazione perfetta (classi predette senza errori) gonfia i coefficienti e invalida i test.':
    'A separação perfeita (classes previstas sem erros) inflaciona os coeficientes e invalida os testes.',
  'Non sono inclusi effetti casuali, interazioni tra predittori o regressione penalizzata.':
    'Não estão incluídos efeitos aleatórios, interações entre preditores nem regressão penalizada.',
  'L’accuratezza dipende dalla distribuzione delle classi: confrontala sempre con la frequenza della classe più comune.':
    'A exatidão depende da distribuição das classes: compare-a sempre com a frequência da classe mais comum.',
  'Il modello non gestisce esiti ordinati: per categorie ordinate serve una regressione ordinale.':
    'O modelo não trata resultados ordenados: para categorias ordenadas é necessária uma regressão ordinal.',
  'Report di lettura — ANOVA gerarchica': 'Relatório de leitura — ANOVA hierárquica',
  '{s1} dentro {s2}: effetto esterno {s3}, effetto interno {s4}.':
    '{s1} dentro de {s2}: efeito externo {s3}, efeito interno {s4}.',
  'L’ANOVA gerarchica tratta un fattore annidato dentro un altro: ogni livello del fattore interno appartiene a un solo livello del fattore esterno.':
    'A ANOVA hierárquica trata um fator aninhado dentro de outro: cada nível do fator interno pertence a um único nível do fator externo.',
  'È il disegno tipico di classi dentro scuole, soggetti dentro centri o lotti dentro fornitori.':
    'É o delineamento típico de turmas dentro de escolas, sujeitos dentro de centros ou lotes dentro de fornecedores.',
  'Fattore esterno {s1}: F = {s2}, p = {s3}.': 'Fator externo {s1}: F = {s2}, p = {s3}.',
  'Fattore interno {s1}: F = {s2}, p = {s3}.': 'Fator interno {s1}: F = {s2}, p = {s3}.',
  'Se il fattore esterno è significativo, i gruppi maggiori differiscono tra loro oltre la variabilità delle sottoclassi.':
    'Se o fator externo é significativo, os grupos principais diferem entre si para além da variabilidade das subclasses.',
  'Se il fattore interno è significativo, le sottoclassi differiscono dentro i gruppi: la struttura annidata spiega una parte della variabilità.':
    'Se o fator interno é significativo, as subclasses diferem dentro dos grupos: a estrutura aninhada explica parte da variabilidade.',
  'Non interpretare il fattore interno come un effetto principale “pulito”: il suo significato dipende dal fattore esterno.':
    'Não interprete o fator interno como um efeito principal «limpo»: o seu significado depende do fator externo.',
  'Il modello assume normalità e varianza costante entro cella; con celle molto sbilanciate le stime dei componenti di varianza sono approssimate.':
    'O modelo pressupõe normalidade e variância constante dentro de cada célula; com células muito desequilibradas, as estimativas das componentes de variância são aproximadas.',
  '{s1}: {s2} (CI {s3} – {s4}), {s5}.': '{s1}: {s2} (IC {s3} – {s4}), {s5}.',
  'Report di lettura — Regressione non lineare': 'Relatório de leitura — Regressão não linear',
  'La curva {s1} aderisce bene ai dati: spiega il {s2}% della variabilità di {s3}.':
    'A curva {s1} ajusta-se bem aos dados: explica {s2}% da variabilidade de {s3}.',
  'La curva {s1} spiega il {s2}% della variabilità di {s3}: l’adattamento è parziale.':
    'A curva {s1} explica {s2}% da variabilidade de {s3}: o ajuste é parcial.',
  'La curva {s1} spiega solo il {s2}% della variabilità di {s3}: la forma scelta non descrive bene i dati.':
    'A curva {s1} explica apenas {s2}% da variabilidade de {s3}: a forma escolhida não descreve bem os dados.',
  'R² {s1}': 'R² {s1}',
  'La regressione non lineare stima i parametri di una curva scelta a priori, invece di una retta: la forma del modello è un’ipotesi, non un risultato dei dati.':
    'A regressão não linear estima os parâmetros de uma curva escolhida a priori, em vez de uma reta: a forma do modelo é uma hipótese, não um resultado dos dados.',
  'Il confronto tra curve diverse non si fa con l’R²: modelli con un numero diverso di parametri vanno confrontati con criteri che penalizzano la complessità.':
    'A comparação entre curvas diferentes não se faz com o R²: modelos com um número diferente de parâmetros devem ser comparados com critérios que penalizam a complexidade.',
  'La curva e i suoi parametri': 'A curva e os seus parâmetros',
  'Modello {s1} stimato su {s2} osservazioni, con {s3} gradi di libertà residui; la convergenza è stata raggiunta in {s4} iterazioni.':
    'Modelo {s1} estimado com {s2} observações, com {s3} graus de liberdade residuais; a convergência foi atingida em {s4} iterações.',
  'R² = {s1}, R² corretto = {s2}, RMSE = {s3} (nella unità di {s4}).':
    'R² = {s1}, R² corrigido = {s2}, RMSE = {s3} (na unidade de {s4}).',
  'Parametri stimati': 'Parâmetros estimados',
  'La convergenza dice che l’algoritmo ha trovato un punto stabile, non che il modello sia quello giusto: controlla sempre i residui e la forma della curva.':
    'A convergência indica que o algoritmo encontrou um ponto estável, não que o modelo seja o correto: verifique sempre os resíduos e a forma da curva.',
  'L’algoritmo non ha raggiunto la convergenza: le stime non sono affidabili e non vanno lette come risultato.':
    'O algoritmo não atingiu a convergência: as estimativas não são fiáveis e não devem ser lidas como resultado.',
  '{s1} parametri su {s2} hanno un p sotto il {s3}%: un parametro non significativo può comunque essere necessario alla forma della curva.':
    '{s1} parâmetros de {s2} têm um p abaixo de {s3}%: um parâmetro não significativo pode ainda assim ser necessário à forma da curva.',
  'La curva interpolata tra i punti osservati è una sintesi del modello: fuori dall’intervallo dei dati la sua forma non è verificata.':
    'A curva interpolada entre os pontos observados é uma síntese do modelo: fora do intervalo dos dados, a sua forma não está verificada.',
  'La scelta della curva deve venire dalla conoscenza del fenomeno, non dal solo confronto degli R².':
    'A escolha da curva deve resultar do conhecimento do fenómeno, não apenas da comparação dos R².',
  'Le stime ai minimi quadrati sono sensibili ai valori estremi e ai punti con leva alta.':
    'As estimativas por mínimos quadrados são sensíveis a valores extremos e a pontos com elevada alavancagem.',
  'Gli errori standard assumono residui indipendenti e a varianza costante: con dati nel tempo o misure ripetute vanno rivisti.':
    'Os erros padrão pressupõem resíduos independentes e de variância constante: com dados ao longo do tempo ou medidas repetidas, devem ser revistos.',
  'Con pochi punti rispetto ai parametri la stima è instabile: servono più osservazioni che parametri.':
    'Com poucos pontos em relação aos parâmetros, a estimativa é instável: são necessárias mais observações do que parâmetros.',
  'Report di lettura — Regressione penalizzata': 'Relatório de leitura — Regressão penalizada',
  '{s1}: {s2} coefficienti non nulli su {s3} (λ = {s4}, α = {s5}).':
    '{s1}: {s2} coeficientes não nulos de {s3} (λ = {s4}, α = {s5}).',
  'Ridge, LASSO ed elastic net aggiungono una penalità ai coefficienti per ridurre la varianza delle stime e gestire la collinearità.':
    'Ridge, LASSO e elastic net acrescentam uma penalização aos coeficientes para reduzir a variância das estimativas e lidar com a colinearidade.',
  'LASSO può azzerare coefficienti, producendo un modello sparso; ridge li riduce senza azzerarli; elastic net combina i due comportamenti.':
    'O LASSO pode anular coeficientes, produzindo um modelo esparso; o ridge redu-los sem os anular; o elastic net combina os dois comportamentos.',
  'Variabili mantenute: {s1}.': 'Variáveis mantidas: {s1}.',
  'nessuna': 'nenhuma',
  'R² = {s1}; coefficienti non nulli = {s2}; iterazioni = {s3}.':
    'R² = {s1}; coeficientes não nulos = {s2}; iterações = {s3}.',
  'Convergenza: {s1}.': 'Convergência: {s1}.',
  'Come scegliere λ': 'Como escolher λ',
  'λ non va scelto guardando l’R² sul campione: serve validazione incrociata o un criterio esterno.':
    'O λ não deve ser escolhido olhando para o R² na amostra: é necessária validação cruzada ou um critério externo.',
  'Valori grandi semplificano il modello ma possono escludere segnali reali; valori piccoli si avvicinano all’OLS e alla sua instabilità.':
    'Valores elevados simplificam o modelo mas podem excluir sinais reais; valores pequenos aproximam-se do OLS e da sua instabilidade.',
  'Le variabili sono standardizzate internamente: i coefficienti restano confrontabili tra loro solo dopo questa trasformazione.':
    'As variáveis são estandardizadas internamente: os coeficientes só são comparáveis entre si após esta transformação.',
  'Il livello di confidenza {s1}% è indicato per coerenza con le altre procedure, ma gli intervalli dei coefficienti penalizzati non sono interpretabili come quelli OLS.':
    'O nível de confiança {s1}% é indicado por coerência com os outros procedimentos, mas os intervalos dos coeficientes penalizados não são interpretáveis como os do OLS.',
  'La penalizzazione introduce distorsione: i coefficienti non sono stimatori non distorti e gli errori standard classici non si applicano.':
    'A penalização introduz enviesamento: os coeficientes não são estimadores não enviesados e os erros padrão clássicos não se aplicam.',
  'La selezione di λ e la stima della varianza richiedono ricampionamento, non incluso in questa procedura.':
    'A seleção de λ e a estimativa da variância exigem reamostragem, não incluída neste procedimento.',
  'Report di lettura — Regressione polinomiale': 'Relatório de leitura — Regressão polinomial',
  '{s1} spiegato da un polinomio di grado {s2} in {s3} (R² = {s4}).':
    '{s1} explicado por um polinómio de grau {s2} em {s3} (R² = {s4}).',
  'La regressione polinomiale estende la retta a una curva: aggiunge potenze di {s1} per catturare andamenti non lineari.':
    'A regressão polinomial estende a reta a uma curva: acrescenta potências de {s1} para captar tendências não lineares.',
  'Il grado misura la flessibilità della curva; un grado alto riduce i residui ma aumenta il rischio di overfitting.':
    'O grau mede a flexibilidade da curva; um grau elevado reduz os resíduos mas aumenta o risco de sobreajustamento.',
  'R² = {s1}, R² adattato = {s2}, F = {s3}, p = {s4}.':
    'R² = {s1}, R² ajustado = {s2}, F = {s3}, p = {s4}.',
  'Il termine di grado più alto è {s1}: B = {s2}, p = {s3}.':
    'O termo de grau mais elevado é {s1}: B = {s2}, p = {s3}.',
  'RMSE = {s1}; AIC = {s2}; BIC = {s3}.': 'RMSE = {s1}; AIC = {s2}; BIC = {s3}.',
  'Come scegliere il grado': 'Como escolher o grau',
  'Confronta R² adattato, AIC e BIC tra gradi diversi: il grado più alto non è automaticamente migliore.':
    'Compare o R² ajustado, o AIC e o BIC entre graus diferentes: o grau mais elevado não é automaticamente melhor.',
  'Guarda il grafico: una curva che insegue ogni punto è un segnale di overfitting.':
    'Observe o gráfico: uma curva que persegue cada ponto é um sinal de sobreajustamento.',
  'Non estrapolare fuori dall’intervallo osservato di {s1}: i polinomi divergono rapidamente.':
    'Não extrapole para fora do intervalo observado de {s1}: os polinómios divergem rapidamente.',
  'La collinearità tra potenze rende i singoli coefficienti instabili anche quando la curva è ben stimata: interpreta la forma, non solo i segni.':
    'A colinearidade entre potências torna instáveis os coeficientes individuais mesmo quando a curva está bem estimada: interprete a forma, não apenas os sinais.',
  'Quantile (τ)': 'Quantil (τ)',
  'sì': 'sim',
  'Funzione obiettivo': 'Função objetivo',
  '{s1}: β = {s2} (CI 95% {s3}), {s4}.': '{s1}: β = {s2} (IC 95% {s3}), {s4}.',
  'Report di lettura — Regressione quantilica': 'Relatório de leitura — Regressão quantílica',
  'Il simplesso non ha raggiunto la convergenza: le stime non sono affidabili.':
    'O simpléx não atingiu a convergência: as estimativas não são fiáveis.',
  'Al quantile τ = {s1}, nessun coefficiente di predittore è significativo (p < {s2}).':
    'No quantil τ = {s1}, nenhum coeficiente de preditor é significativo (p < {s2}).',
  'Al quantile τ = {s1}, 1 coefficiente di predittore su {s2} è significativo (p < {s3}).':
    'No quantil τ = {s1}, 1 coeficiente de preditor de {s2} é significativo (p < {s3}).',
  'Al quantile τ = {s1}, {s2} coefficienti di predittore su {s3} sono significativi (p < {s4}).':
    'No quantil τ = {s1}, {s2} coeficientes de preditor de {s3} são significativos (p < {s4}).',
  'Non convergente': 'Não convergente',
  'La regressione quantilica stima come cambia un quantile condizionale di Y, non la media: al posto della somma dei quadrati minimizza una perdita assoluta asimmetrica.':
    'A regressão quantílica estima como varia um quantil condicional de Y, não a média: em vez da soma dos quadrados, minimiza uma perda absoluta assimétrica.',
  'Con τ = 0,5 è una regressione mediana, robusta agli outlier; con τ vicino a 0 o 1 descrive la coda bassa o alta della distribuzione.':
    'Com τ = 0,5 é uma regressão mediana, robusta a valores atípicos; com τ próximo de 0 ou 1 descreve a cauda inferior ou superior da distribuição.',
  'Il modello usa {s1} osservazioni complete e {s2} parametri (intercetta inclusa), con {s3} iterazioni del simplesso.':
    'O modelo usa {s1} observações completas e {s2} parâmetros (incluindo o termo independente), com {s3} iterações do simpléx.',
  'Il simplesso ha raggiunto la convergenza e la perdita minima vale {s1}.':
    'O simpléx atingiu a convergência e a perda mínima vale {s1}.',
  'La convergenza non è stata raggiunta: aumenta il budget di iterazioni o riduci i predittori prima di leggere i coefficienti.':
    'A convergência não foi atingida: aumente o orçamento de iterações ou reduza os preditores antes de ler os coeficientes.',
  'β misura di quanto cambia il quantile τ di Y per una unità in più del predittore, mantenendo gli altri costanti.':
    'β mede quanto varia o quantil τ de Y por uma unidade adicional do preditor, mantendo os restantes constantes.',
  'L’intercetta è il quantile τ stimato quando tutti i predittori valgono zero: spesso non ha un’interpretazione sostantiva.':
    'O termo independente é o quantil τ estimado quando todos os preditores valem zero: muitas vezes não tem uma interpretação substantiva.',
  'Un intervallo che contiene zero è compatibile con nessun effetto al livello scelto; il p è di Wald e usa errori standard approssimati.':
    'Um intervalo que contém zero é compatível com a ausência de efeito ao nível escolhido; o p é de Wald e usa erros padrão aproximados.',
  'Con più predittori il grafico a punti mostra il profilo del primo predittore alle medie degli altri, non una superficie completa.':
    'Com vários preditores, o gráfico de pontos mostra o perfil do primeiro preditor nas médias dos restantes, não uma superfície completa.',
  'Perché scegliere un quantile': 'Porque escolher um quantil',
  'La media è sensibile agli outlier e alle code pesanti; la mediana e gli altri quantili descrivono il centro o gli estremi della distribuzione condizionata.':
    'A média é sensível a valores atípicos e a caudas pesadas; a mediana e os restantes quantis descrevem o centro ou os extremos da distribuição condicional.',
  'Confrontare quantili diversi dello stesso modello mostra se l’effetto di un predittore cambia lungo la distribuzione, cosa che la regressione lineare non evidenzia.':
    'Comparar quantis diferentes do mesmo modelo mostra se o efeito de um preditor varia ao longo da distribuição, algo que a regressão linear não evidencia.',
  'Il prezzo è che ogni quantile va stimato separatamente: le rette di quantili vicini possono incrociarsi e non c’è una verosimiglianza unica da confrontare con un test LR.':
    'O preço é que cada quantil tem de ser estimado separadamente: as retas de quantis próximos podem cruzar-se e não há uma verossimilhança única para comparar com um teste LR.',
  'Il modello è lineare nei parametri per il quantile scelto: se la relazione cambia forma nelle code, servono trasformazioni o termini aggiunti.':
    'O modelo é linear nos parâmetros para o quantil escolhido: se a relação muda de forma nas caudas, são necessárias transformações ou termos adicionais.',
  'Servono osservazioni sufficienti vicino a τ: con code estreme e campioni piccoli le stime diventano instabili.':
    'São necessárias observações suficientes perto de τ: com caudas extremas e amostras pequenas, as estimativas tornam-se instáveis.',
  'Gli errori standard usano l’approssimazione di Powell/Hall–Sheather (quantreg, se = "nid") e possono essere inaffidabili con pochi casi o residui degeneri.':
    'Os erros padrão usam a aproximação de Powell/Hall–Sheather (quantreg, se = "nid") e podem não ser fiáveis com poucos casos ou resíduos degenerados.',
  'La convergenza del simplesso va controllata: un numero di iterazioni al limite indica un problema numerico, non un risultato.':
    'A convergência do simpléx deve ser verificada: um número de iterações no limite indica um problema numérico, não um resultado.',
  'Non sono inclusi intervalli bootstrap, test tra quantili o correzione per code estreme.':
    'Não estão incluídos intervalos bootstrap, testes entre quantis nem correção para caudas extremas.',
  'Il modello è lineare nei parametri: relazioni non lineari richiedono trasformazioni o termini aggiunti.':
    'O modelo é linear nos parâmetros: relações não lineares exigem transformações ou termos adicionais.',
  'La bontà di adattamento non è riassunta da un R²: valuta la perdita asimmetrica e il confronto tra quantili.':
    'A qualidade do ajustamento não se resume a um R²: avalie a perda assimétrica e a comparação entre quantis.',
  'Report di lettura — Selezione delle variabili': 'Relatório de leitura — Seleção de variáveis',
  'Il modello scelto contiene {s1} predittore/i: {s2}.':
    'O modelo escolhido contém {s1} preditor(es): {s2}.',
  'Nessun predittore supera il criterio: resta il modello con la sola intercetta.':
    'Nenhum preditor supera o critério: fica o modelo apenas com o termo independente.',
  'La selezione delle variabili cerca un modello più semplice senza perdere capacità esplicativa, confrontando sottoinsiemi di predittori.':
    'A seleção de variáveis procura um modelo mais simples sem perder capacidade explicativa, comparando subconjuntos de preditores.',
  'La ricerca esaustiva guarda tutti i sottoinsiemi; lo stepwise aggiunge o toglie una variabile alla volta seguendo il criterio scelto.':
    'A pesquisa exaustiva examina todos os subconjuntos; o stepwise acrescenta ou remove uma variável de cada vez seguindo o critério escolhido.',
  'Il modello con il BIC più basso usa {s1} variabili: {s2}.':
    'O modelo com o BIC mais baixo usa {s1} variáveis: {s2}.',
  'Lo stepwise ha esaminato {s1} passi e si è fermato con {s2} predittore/i.':
    'O stepwise examinou {s1} passos e parou com {s2} preditor(es).',
  'Modello finale: R² = {s1}, R² adattato = {s2}, F = {s3}.':
    'Modelo final: R² = {s1}, R² ajustado = {s2}, F = {s3}.',
  'Il modello finale non contiene predittori significativi.':
    'O modelo final não contém preditores significativos.',
  'La selezione automatica tende a sovrastimare la significatività: i p-value dopo la scelta non sono aggiustati.':
    'A seleção automática tende a sobrestimar a significância: os p-valores após a seleção não são ajustados.',
  'Con molti predittori la ricerca esaustiva è limitata: il numero di sottoinsiemi cresce in modo esponenziale.':
    'Com muitos preditores, a pesquisa exaustiva é limitada: o número de subconjuntos cresce de forma exponencial.',
  'Usa la selezione per esplorare, poi conferma il modello su dati indipendenti o con validazione incrociata.':
    'Use a seleção para explorar e depois confirme o modelo com dados independentes ou validação cruzada.',
  'Il criterio BIC penalizza di più l’AIC: produce modelli più parsimoniosi.':
    'O critério BIC penaliza mais do que o AIC: produz modelos mais parcimoniosos.',
  'I risultati dipendono dal criterio e dalla direzione scelti; riporta sempre entrambi insieme al livello di confidenza del {s1}%.':
    'Os resultados dependem do critério e da direção escolhidos; indique sempre ambos juntamente com o nível de confiança de {s1}%.',
  'Analisi delle medie (ANOM)': 'Análise de médias (ANOM)',
  '{s1} per {s2} · α = {s3}': '{s1} por {s2} · α = {s3}',
  'Fuori limiti': 'Fora dos limites',
  'No': 'Não',
  'Media generale = {s1}; media quadratica entro gruppi = {s2} con {s3} gradi di libertà.':
    'Média global = {s1}; quadrado médio intragrupo = {s2} com {s3} graus de liberdade.',
  'Il valore critico h = {s1} usa l’approssimazione Bonferroni-t della distribuzione del massimo modulo studentizzato.':
    'O valor crítico h = {s1} usa a aproximação de Bonferroni-t da distribuição do módulo estandardizado máximo.',
  '{s1} · famiglia {s2} · link {s3} · CI {s4}%': '{s1} · família {s2} · ligação {s3} · IC {s4}%',
  'I coefficienti sono sulla scala del link: la loro interpretazione cambia con famiglia e link.':
    'Os coeficientes estão na escala da ligação: a sua interpretação muda com a família e a ligação.',
  'Il test z è di Wald; con campioni piccoli può divergere dal test di devianza.':
    'O teste z é de Wald; com amostras pequenas pode divergir do teste de desvio.',
  'Devianza': 'Desvio',
  'Devianza nulla': 'Desvio nulo',
  'df nullo': 'gl do desvio nulo',
  'Dispersione': 'Dispersão',
  'La devianza misura la distanza dal modello saturo; la devianza nulla quella dal solo intercetta.':
    'O desvio mede a distância ao modelo saturado; o desvio nulo, a distância ao modelo apenas com o termo independente.',
  'Per famiglie con dispersione stimata (Gaussiana, Gamma) il rapporto devianza/df è una diagnostica, non un test.':
    'Para famílias com dispersão estimada (Gaussiana, Gamma), o rácio desvio/gl é um diagnóstico, não um teste.',
  'Modello probit': 'Modelo probit',
  'stima di massima verosimiglianza (probit)': 'estimação de máxima verossimilhança (probit)',
  'Coefficienti ed exp(B)': 'Coeficientes e exp(B)',
  'exp(B)': 'exp(B)',
  'exp(B) CI low': 'exp(B) CI inferior',
  'exp(B) CI high': 'exp(B) CI superior',
  'Nel modello probit B è il coefficiente sulla scala normale latente: exp(B) non è un odds ratio ma un fattore moltiplicativo sul predittore latente.':
    'No modelo probit, B é o coeficiente na escala normal latente: exp(B) não é um odds ratio mas um fator multiplicativo sobre o preditor latente.',
  'Un B positivo aumenta la probabilità dell’esito; l’effetto marginale dipende dal punto in cui viene valutato.':
    'Um B positivo aumenta a probabilidade do resultado; o efeito marginal depende do ponto em que é avaliado.',
  'Modello multinomiale': 'Modelo multinomial',
  'stima di massima verosimiglianza · N = {s1}': 'estimação de máxima verossimilhança · N = {s1}',
  'Classi': 'Classes',
  'Classe di riferimento': 'Classe de referência',
  'Accuratezza complessiva (%)': 'Exatidão global (%)',
  'no': 'não',
  'Il modello stima una probabilità per ogni classe; la classe di riferimento ha coefficienti fissati a zero.':
    'O modelo estima uma probabilidade para cada classe; a classe de referência tem os coeficientes fixados em zero.',
  'La deviance confronta la verosimiglianza del modello con quella di un modello saturo: valori più bassi indicano un adattamento migliore.':
    'O desvio compara a verossimilhança do modelo com a de um modelo saturado: valores mais baixos indicam um melhor ajustamento.',
  'Coefficienti per classe': 'Coeficientes por classe',
  'Classe di riferimento: {s1} · CI {s2}%': 'Classe de referência: {s1} · IC {s2}%',
  'Classe': 'Classe',
  'Ogni classe è confrontata con la classe di riferimento: OR > 1 aumenta le probabilità di quella classe rispetto al riferimento.':
    'Cada classe é comparada com a classe de referência: um OR > 1 aumenta as probabilidades dessa classe em relação à referência.',
  'I coefficienti sono stimati al netto degli altri predittori; l’intercetta non ha un odds ratio interpretabile.':
    'Os coeficientes são estimados ajustando para os restantes preditores; o termo independente não tem um odds ratio interpretável.',
  'Classificazione per classe': 'Classificação por classe',
  'Accuratezza complessiva: {s1}%': 'Exatidão global: {s1}%',
  'Corrette': 'Corretas',
  'Accuratezza (%)': 'Exatidão (%)',
  'Probabilità media (%)': 'Probabilidade média (%)',
  'La classe predetta è quella con la probabilità stimata più alta; l’accuratezza per classe è il rapporto tra classificazioni corrette e osservazioni di quella classe.':
    'A classe prevista é a de maior probabilidade estimada; a exatidão por classe é o rácio entre as classificações corretas e as observações dessa classe.',
  'Le classi rare possono avere un’accuratezza instabile perché calcolata su poche osservazioni.':
    'As classes raras podem ter uma exatidão instável porque é calculada com poucas observações.',
  'ANOVA gerarchica': 'ANOVA hierárquica',
  '{s1} per {s2} annidato in {s3}': '{s1} para {s2} aninhado em {s3}',
  'dentro': 'dentro de',
  'Errore': 'Erro',
  'Il fattore esterno è testato contro la media quadratica del fattore annidato, non contro il residuo.':
    'O fator externo é testado contra o quadrado médio do fator aninhado, não contra o resíduo.',
  'Il fattore interno è testato contro il residuo entro cella.':
    'O fator interno é testado contra o resíduo dentro de cada célula.',
  'Descrittive per cella': 'Descritivas por célula',
  'Componenti di varianza': 'Componentes de variância',
  'Stime approssimate per il modello a effetti casuali; con celle sbilanciate sono indicative.':
    'Estimativas aproximadas para o modelo de efeitos aleatórios; com células desequilibradas são indicativas.',
  'Esponenziale': 'Exponencial',
  'Logistica': 'Logística',
  'Gompertz': 'Gompertz',
  'Michaelis–Menten': 'Michaelis–Menten',
  'Parametri del modello': 'Parâmetros do modelo',
  'Le stime sono ai minimi quadrati sulla curva scelta; gli errori standard vengono dalla matrice jacobiana al punto di ottimo.':
    'As estimativas são por mínimos quadrados sobre a curva escolhida; os erros padrão vêm da matriz jacobiana no ponto ótimo.',
  'Il test t riguarda il singolo parametro: p piccolo indica che il parametro è distinto da zero nella scala della curva.':
    'O teste t refere-se ao parâmetro individual: um p pequeno indica que o parâmetro é distinto de zero na escala da curva.',
  '{s1} su {s2}': '{s1} de {s2}',
  'SSE': 'SSE',
  'R² confronta la curva con la media di Y: non dice se la forma del modello è quella giusta, solo quanto spiega rispetto a una retta piatta.':
    'O R² compara a curva com a média de Y: não diz se a forma do modelo é a correta, apenas quanto explica em relação a uma reta plana.',
  'RMSE è nella stessa unità della variabile dipendente e riassume l’errore tipico della curva.':
    'O RMSE está na mesma unidade da variável dependente e resume o erro típico da curva.',
  'Coefficienti penalizzati': 'Coeficientes penalizados',
  '{s1} · {s2} · λ = {s3} · CI {s4}%': '{s1} · {s2} · λ = {s3} · IC {s4}%',
  'Coefficiente': 'Coeficiente',
  'I coefficienti sono sulla scala originale delle variabili; il modello è stato stimato su predittori standardizzati.':
    'Os coeficientes estão na escala original das variáveis; o modelo foi estimado com preditores estandardizados.',
  'Con LASSO i coefficienti esattamente nulli indicano variabili escluse dal modello.':
    'Com o LASSO, os coeficientes exatamente nulos indicam variáveis excluídas do modelo.',
  'Penalità': 'Penalização',
  'Coefficienti non nulli': 'Coeficientes não nulos',
  'λ governa la forza della penalizzazione: valori più alti producono modelli più semplici.':
    'O λ governa a força da penalização: valores mais elevados produzem modelos mais simples.',
  'α = 0 è ridge, α = 1 è LASSO, valori intermedi sono elastic net.':
    'α = 0 é ridge, α = 1 é LASSO, os valores intermédios são elastic net.',
  'Coefficienti del polinomio': 'Coeficientes do polinómio',
  '{s1} su {s2} · grado {s3}': '{s1} de {s2} · grau {s3}',
  'Il modello usa la base polinomiale grezza: i coefficienti sono quelli di x, x², … senza ortogonalizzazione.':
    'O modelo usa a base polinomial bruta: os coeficientes são os de x, x², … sem ortogonalização.',
  'CI al {s1}%.': 'IC a {s1}%.',
  'Gradi di libertà': 'Graus de liberdade',
  '(Intercept)': '(Intercepto)',
  'Coefficienti della regressione quantilica': 'Coeficientes da regressão quantílica',
  '{s1} · τ = {s2}': '{s1} · τ = {s2}',
  'β misura la variazione del quantile τ della risposta per una unità in più del predittore, al netto degli altri.':
    'β mede a variação do quantil τ da resposta por uma unidade adicional do preditor, ajustando para os restantes.',
  'L’intercetta è il quantile τ stimato quando tutti i predittori valgono zero.':
    'O termo independente é o quantil τ estimado quando todos os preditores valem zero.',
  'Gli intervalli sono normali al 95%; il p è di Wald a due code e usa errori standard approssimati.':
    'Os intervalos são normais a 95%; o p é de Wald bilateral e usa erros padrão aproximados.',
  'Adattamento del modello quantilico': 'Ajustamento do modelo quantílico',
  '{s1} osservazioni · {s2} parametri': '{s1} observações · {s2} parâmetros',
  'Residui assoluti medi': 'Resíduos absolutos médios',
  'La funzione obiettivo è la somma della perdita asimmetrica ρτ: con τ = 0,5 coincide con la regressione mediana.':
    'A função objetivo é a soma da perda assimétrica ρτ: com τ = 0,5 coincide com a regressão mediana.',
  'Il numero di iterazioni conta i pivot del simplesso; un valore molto alto segnala un problema numerico.':
    'O número de iterações conta os pivôs do simpléx; um valor muito elevado sinaliza um problema numérico.',
  'Aggiunta': 'Adição',
  'Rimozione': 'Remoção',
  'Partenza': 'Início',
  'Stop': 'Paragem',
  'Migliori sottoinsiemi': 'Melhores subconjuntos',
  'Un modello per dimensione · criterio: {s1}': 'Um modelo por dimensão · critério: {s1}',
  'La ricerca esaustiva valuta tutti i sottoinsiemi fino a un massimo di 8 predittori; oltre quella soglia il costo cresce rapidamente.':
    'A pesquisa exaustiva avalia todos os subconjuntos até um máximo de 8 preditores; acima desse limite o custo cresce rapidamente.',
  'Cp confronta ogni modello con il modello completo: valori vicini al numero di parametri indicano un buon compromesso.':
    'O Cp compara cada modelo com o modelo completo: valores próximos do número de parâmetros indicam um bom compromisso.',
  'Percorso stepwise': 'Percurso stepwise',
  'Direzione: {s1}': 'Direção: {s1}',
  'Azione': 'Ação',
  'Modello selezionato': 'Modelo selecionado',
  'R² = {s1}; R² adattato = {s2}; F = {s3}; p = {s4}.':
    'R² = {s1}; R² ajustado = {s2}; F = {s3}; p = {s4}.',
  'Report di lettura — MANCOVA': 'Relatório de leitura — MANCOVA',
  'Effetto di {s1} su {s2} variabili, al netto di {s3}: Wilk’s λ = {s4}, p = {s5}.': 'Efeito de {s1} sobre {s2} variáveis, ajustado para {s3}: λ de Wilks = {s4}, p = {s5}.',
  'nessuna covariata': 'nenhuma covariável',
  'La MANCOVA estende la MANOVA aggiungendo covariate continue: confronta i gruppi su più esiti simultaneamente, correggendo per variabili che potrebbero spiegare parte delle differenze.': 'A MANCOVA alarga a MANOVA com covariáveis contínuas: compara grupos em vários resultados ao mesmo tempo, corrigindo para variáveis que possam explicar parte das diferenças.',
  'Il test multivariato risponde alla domanda “il gruppo conta, al netto delle covariate?”; i test univariati localizzano l’effetto sulle singole variabili.': 'O teste multivariado responde a «o grupo importa, ajustado para as covariáveis?»; os testes univariados localizam o efeito em cada variável.',
  'Wilk’s λ = {s1}, F = {s2} con {s3} e {s4} gradi di libertà, p = {s5}.': 'λ de Wilks = {s1}, F = {s2} com {s3} e {s4} graus de liberdade, p = {s5}.',
  '{s1} variabili su {s2} mostrano un effetto di gruppo significativo al livello scelto.': '{s1} de {s2} variáveis mostram um efeito de grupo significativo ao nível escolhido.',
  '{s1}: F = {s2}, p = {s3}.': '{s1}: F = {s2}, p = {s3}.',
  'Le medie aggiustate sono i valori attesi se tutti i gruppi avessero la stessa media delle covariate: servono a confrontare i gruppi “a parità di” covariate.': 'As médias ajustadas são os valores esperados se todos os grupos tivessem a mesma média das covariáveis: comparam os grupos «mantendo as covariáveis constantes».',
  'Un effetto multivariato significativo può nascondere variabili non significative e viceversa: leggi insieme il test globale e quelli univariati.': 'Um efeito multivariado significativo pode esconder variáveis não significativas e vice-versa: leia em conjunto o teste global e os univariados.',
  'Le covariate devono essere misurate prima del trattamento e non essere conseguenze del gruppo: altrimenti la correzione toglie parte dell’effetto che vuoi stimare.': 'As covariáveis devem ser medidas antes do tratamento e não ser consequências do grupo: caso contrário, o ajustamento retira parte do efeito que se pretende estimar.',
  'Il modello assume relazioni lineari tra covariate ed esiti e omogeneità delle pendenze tra gruppi; controlla questi punti prima di fidarti del p.': 'O modelo assume relações lineares entre covariáveis e resultados e declives homogéneos entre grupos; verifique estes pontos antes de confiar no valor p.',
  'Non sono inclusi termini di interazione gruppo × covariata, contrasti pianificati o correzioni per test multipli.': 'Não estão incluídos termos de interação grupo × covariável, contrastes planeados ou correções para testes múltiplos.',
  'Con gruppi piccoli o covariate collineari le stime diventano instabili e il test multivariato perde potenza.': 'Com grupos pequenos ou covariáveis colineares as estimativas tornam-se instáveis e o teste multivariado perde potência.',
  'Test multivariato': 'Teste multivariado',
  'Wilk’s lambda · CI {s1}%': 'Lambda de Wilks · IC {s1}%',
  'Wilk’s lambda': 'Lambda de Wilks',
  'Il test multivariato valuta l’effetto del gruppo su tutte le variabili dipendenti insieme, al netto delle covariate.': 'O teste multivariado avalia o efeito do grupo sobre todas as variáveis dependentes em conjunto, ajustado para as covariáveis.',
  'L’approssimazione F di Rao è quella usata da car::Anova; con campioni piccoli il p può differire leggermente.': 'A aproximação F de Rao é a usada por car::Anova; com amostras pequenas o valor p pode diferir ligeiramente.',
  'ANCOVA univariata per variabile': 'ANCOVA univariada por variável',
  'Effetto del gruppo al netto delle covariate': 'Efeito do grupo ajustado para as covariáveis',
  'Medie aggiustate': 'Médias ajustadas',
  'Valori attesi alle medie delle covariate': 'Valores esperados nas médias das covariáveis',
};

