/** pt-PT: report and table prose (normalised). */
export const timeseriesCopy: Record<string, string> = {
  ' · periodo stagionale = {s1}':
    ' · período sazonal = {s1}',
  ' (ADF p ≈ {s1} resta solo informativo)':
    ' (o p do ADF ≈ {s1} permanece apenas informativo)',
  ', compatibile con una successione casuale':
    ', compatível com uma sucessão aleatória',
  ', la successione non è casuale':
    ', a sucessão não é aleatória',
  '{s1} = {s2} ({s3}): {s4}.':
    '{s1} = {s2} ({s3}): {s4}.',
  'ACF':
    'ACF',
  'Attenzione: almeno una radice è vicina o dentro il cerchio unitario, quindi la stima è al limite della regione ammissibile e le previsioni vanno lette con prudenza.':
    'Atenção: pelo menos uma raiz está próxima ou dentro do círculo unitário, pelo que a estimativa está no limite da região admissível e as previsões devem ser lidas com prudência.',
  'Autocorrelazione e autocorrelazione parziale':
    'Autocorrelação e autocorrelação parcial',
  'autocorrelazione presente':
    'autocorrelação presente',
  'banda di confidenza ±1,96/√N = ±{s1}':
    'banda de confiança ±1,96/√N = ±{s1}',
  'Barre oltre la banda indicano autocorrelazione non spiegata dal caso.':
    'Barras além da banda indicam autocorrelação não explicada pelo acaso.',
  'batte il riferimento più semplice (RMSE {s1})':
    'supera a referência mais simples (RMSE {s1})',
  'c’è un {s1} (Mann–Kendall p = {s2})':
    'há uma {s1} (p de Mann–Kendall = {s2})',
  'circa {s1} deviazioni standard':
    'cerca de {s1} desvios-padrão',
  'compatibile con il caso':
    'compatível com o acaso',
  'Con orizzonti lunghi l’errore cresce: oltre un ciclo stagionale le previsioni vanno lette come indicazione di direzione.':
    'Com horizontes longos o erro cresce: além de um ciclo sazonal as previsões devem ser lidas como indicação de direção.',
  'Confronto dei modelli di previsione':
    'Comparação dos modelos de previsão',
  'Dettaglio':
    'Detalhe',
  'Deviazione standard':
    'Desvio-padrão',
  'Differenziazione: {s1}; scelta {s2}. {s3}':
    'Diferenciação: {s1}; escolha {s2}. {s3}',
  'è sostanzialmente equivalente al riferimento più semplice (RMSE {s1})':
    'é substancialmente equivalente à referência mais simples (RMSE {s1})',
  'Errore standard residuo':
    'Erro padrão residual',
  'Errore standard residuo sulla scala modellata: {s1} su {s2} osservazioni efficaci.':
    'Erro padrão residual na escala modelada: {s1} em {s2} observações eficazes.',
  'errore su un campione di validazione (ultimo 20% della serie)':
    'erro sobre uma amostra de validação (últimos 20% da série)',
  'Forza della stagionalità':
    'Força da sazonalidade',
  'Forza della stagionalità = {s1} (0 = nessuna, 1 = stagionalità dominante).':
    'Força da sazonalidade = {s1} (0 = nenhuma, 1 = sazonalidade dominante).',
  'Gli indici per posizione nel ciclo dicono quali periodi stanno sopra o sotto la tendenza: sono scostamenti medi, non valori assoluti.':
    'Os índices por posição no ciclo dizem quais os períodos que estão acima ou abaixo da tendência: são desvios médios, não valores absolutos.',
  'Gli indici sono scostamenti medi dal trend, centrati su zero: valori positivi indicano periodi sopra la tendenza.':
    'Os índices são desvios médios da tendência, centrados em zero: valores positivos indicam períodos acima da tendência.',
  'Gli intervalli di previsione non includono l’incertezza sulla stima dei parametri né sulla scelta dell’ordine; volatilità condizionale (GARCH) e regressori esterni non sono modellati.':
    'Os intervalos de previsão não incluem a incerteza sobre a estimativa dos parâmetros nem sobre a escolha da ordem; volatilidade condicional (GARCH) e regressores externos não são modelados.',
  'Gli intervalli includono l’accumulo di incertezza dovuto alla differenziazione, ma non l’incertezza sulla stima dei parametri né quella sulla scelta dell’ordine.':
    'Os intervalos incluem a acumulação de incerteza devida à diferenciação, mas não a incerteza sobre a estimativa dos parâmetros nem a sobre a escolha da ordem.',
  'il distacco dal secondo classificato è Δ AICc = {s1}, quindi la scelta è netta':
    'a distância para o segundo classificado é Δ AICc = {s1}, pelo que a escolha é clara',
  'Il MAPE non è definito quando la serie contiene zeri.':
    'O MAPE não é definido quando a série contém zeros.',
  'Il modello {s1} porta la previsione da {s2} al passo {s3} a {s4} al passo {s5}, su {s6} passi.':
    'O modelo {s1} leva a previsão de {s2} no passo {s3} para {s4} no passo {s5}, em {s6} passos.',
  'Il modello migliore in validazione è {s1} (RMSE = {s2}, MAE = {s3}): qualità {s4} rispetto alla variabilità della serie.':
    'O melhor modelo em validação é {s1} (RMSE = {s2}, MAE = {s3}): qualidade {s4} em relação à variabilidade da série.',
  'il secondo classificato è a Δ AICc = {s1}, quindi i dati non distinguono nettamente i due ordini':
    'o segundo classificado está a Δ AICc = {s1}, pelo que os dados não distinguem claramente as duas ordens',
  'Il test ADF non è calcolabile su questa serie: la differenziazione va decisa a mano.':
    'O teste ADF não é calculável nesta série: a diferenciação deve ser decidida manualmente.',
  'Il test ADF sulla serie dà p ≈ {s1}: {s2}.':
    'O teste ADF sobre a série dá p ≈ {s1}: {s2}.',
  'Il test dei runs verifica che l’ordine dei valori sia casuale, non la loro distribuzione.':
    'O teste das runs verifica que a ordem dos valores é aleatória, não a sua distribuição.',
  'Il test di autocorrelazione sui residui non è calcolabile.':
    'O teste de autocorrelação sobre os resíduos não é calculável.',
  'Imposta un periodo stagionale (per esempio 12 per dati mensili, 4 per trimestrali) per stimare gli indici e scomporre la serie.':
    'Defina um período sazonal (por exemplo 12 para dados mensais, 4 para trimestrais) para estimar os índices e decompor a série.',
  'In validazione sugli ultimi {s1} valori l’RMSE è {s2} e il modello {s3}.':
    'Em validação sobre os últimos {s1} valores o RMSE é {s2} e o modelo {s3}.',
  'Indice':
    'Índice',
  'Indici stagionali':
    'Índices sazonais',
  'Intervallo al {s1}%: {s2} – {s3} al primo passo e {s4} – {s5} all’ultimo; l’ampiezza passa da {s6} a {s7}, come ci si aspetta quando l’orizzonte cresce.':
    'Intervalo a {s1}%: {s2} – {s3} no primeiro passo e {s4} – {s5} no último; a amplitude passa de {s6} a {s7}, como se espera quando o horizonte cresce.',
  'L’ACF misura quanto un valore è correlato con quelli precedenti. Se le barre restano dentro la banda ±1,96/√N, la serie non mostra memoria temporale; se escono, il passato contiene informazione sul presente.':
    'A ACF mede quanto um valor está correlacionado com os anteriores. Se as barras permanecerem dentro da banda ±1,96/√N, a série não mostra memória temporal; se saírem, o passado contém informação sobre o presente.',
  'L’analisi descrittiva di una serie storica verifica se i valori sono indipendenti dal tempo: trend, autocorrelazione e stagionalità sono le tre strutture che rendono una serie diversa da un campione casuale.':
    'A análise descritiva de uma série temporal verifica se os valores são independentes do tempo: tendência, autocorrelação e sazonalidade são as três estruturas que tornam uma série diferente de uma amostra aleatória.',
  'la componente stagionale domina la variabilità attorno al trend.':
    'a componente sazonal domina a variabilidade em torno da tendência.',
  'la componente stagionale è presente ma non domina la variabilità attorno al trend.':
    'a componente sazonal está presente mas não domina a variabilidade em torno da tendência.',
  'La differenziazione è impostata a mano, quindi l’ordine non dipende dai test{s1}.':
    'A diferenciação é definida manualmente, pelo que a ordem não depende dos testes{s1}.',
  'La forza della stagionalità è {s1}: {s2}':
    'A força da sazonalidade é {s1}: {s2}',
  'La PACF isola la correlazione al lag k al netto dei lag intermedi: un taglio netto dopo il lag 1 suggerisce un processo AR(1).':
    'A PACF isola a correlação no desfasamento k líquida dos desfasamentos intermédios: um corte claro após o desfasamento 1 sugere um processo AR(1).',
  'La pendenza di Sen è la mediana delle pendenze tra tutte le coppie di punti: è robusta agli outlier.':
    'O declive de Sen é a mediana dos declives entre todos os pares de pontos: é robusto aos valores atípicos.',
  'la radice unitaria non è rifiutata, quindi almeno una differenziazione serve':
    'a raiz unitária não é rejeitada, pelo que é necessária pelo menos uma diferenciação',
  'La ricerca automatica sull\'ordine ha scelto {s1} (AICc = {s2}): {s3}.':
    'A pesquisa automática sobre a ordem escolheu {s1} (AICc = {s2}): {s3}.',
  'La ricerca degli ordini è limitata a p e q ≤ 2 (≤ 1 con meno di 30 osservazioni) e a un termine stagionale AR e MA: ordini maggiori non vengono esplorati.':
    'A pesquisa das ordens está limitada a p e q ≤ 2 (≤ 1 com menos de 30 observações) e a um termo sazonal AR e MA: ordens superiores não são exploradas.',
  'La scomposizione è additiva; con ampiezza stagionale proporzionale al livello serve un modello moltiplicativo.':
    'A decomposição é aditiva; com amplitude sazonal proporcional ao nível é necessário um modelo multiplicativo.',
  'La serie è troppo corta per confrontare modelli di previsione.':
    'A série é demasiado curta para comparar modelos de previsão.',
  'La serie non permette di stimare un modello ARIMA: le previsioni restano quelle dei modelli semplici.':
    'A série não permite estimar um modelo ARIMA: as previsões continuam a ser as dos modelos simples.',
  'la stazionarietà non è rifiutata, quindi la serie non va differenziata':
    'a estacionariedade não é rejeitada, pelo que a série não deve ser diferenciada',
  'La stima ARIMA è condizionale (somma dei quadrati dei residui) e non a massima verosimiglianza esatta: con serie molto corte i primi residui pesano di più.':
    'A estimativa ARIMA é condicional (soma dos quadrados dos resíduos) e não de máxima verosimilhança exata: com séries muito curtas os primeiros resíduos pesam mais.',
  'Lag':
    'Desfasamento',
  'le autocorrelazioni non sono congiuntamente significative (Ljung–Box p = {s1}): non emerge una struttura temporale forte':
    'as autocorrelações não são conjuntamente significativas (p de Ljung–Box = {s1}): não emerge uma estrutura temporal forte',
  'le autocorrelazioni sono congiuntamente significative (Ljung–Box p = {s1}): i valori dipendono dai precedenti':
    'as autocorrelações são conjuntamente significativas (p de Ljung–Box = {s1}): os valores dependem dos anteriores',
  'Le previsioni non hanno una validazione fuori campione: l’errore in campione è ottimista perché i parametri sono stati stimati sugli stessi dati.':
    'As previsões não têm uma validação fora da amostra: o erro na amostra é otimista porque os parâmetros foram estimados sobre os mesmos dados.',
  'Le previsioni sono puntuali: non incorporano l’incertezza del modello né quella dei dati.':
    'As previsões são pontuais: não incorporam a incerteza do modelo nem a dos dados.',
  'Le prime e le ultime osservazioni non hanno trend stimato: la media mobile centrata non è definita ai bordi.':
    'As primeiras e as últimas observações não têm tendência estimada: a média móvel centrada não está definida nas extremidades.',
  'Le prossime {s1} previsioni partono da {s2} e arrivano a {s3}.':
    'As próximas {s1} previsões partem de {s2} e chegam a {s3}.',
  'Le radici AR e MA stanno fuori dal cerchio unitario: il modello è stazionario e invertibile, quindi le previsioni convergono invece di divergere.':
    'As raízes AR e MA estão fora do círculo unitário: o modelo é estacionário e invertível, pelo que as previsões convergem em vez de divergir.',
  'Lettura':
    'Leitura',
  'Limite alto':
    'Limite superior',
  'Limite basso':
    'Limite inferior',
  'Ljung–Box (lag 1–{s1})':
    'Ljung–Box (desfasamento 1–{s1})',
  'Ljung–Box verifica se le prime autocorrelazioni sono congiuntamente nulle.':
    'Ljung–Box verifica se as primeiras autocorrelações são conjuntamente nulas.',
  'Ljung–Box: Q = {s1} con p = {s2}. {s3}.':
    'Ljung–Box: Q = {s1} com p = {s2}. {s3}.',
  'MAE':
    'MAE',
  'Mann–Kendall (trend)':
    'Mann–Kendall (tendência)',
  'Mann–Kendall è non parametrico e resistente agli outlier: p piccolo indica una tendenza monotona.':
    'Mann–Kendall é não paramétrico e resistente aos valores atípicos: um p pequeno indica uma tendência monótona.',
  'MAPE %':
    'MAPE %',
  'Massimo':
    'Máximo',
  'Media':
    'Média',
  'Metrica':
    'Métrica',
  'Minimo':
    'Mínimo',
  'Modello':
    'Modelo',
  'Modello {s1}':
    'Modelo {s1}',
  'modello additivo · periodo {s1}':
    'modelo aditivo · período {s1}',
  'molto buona':
    'muito boa',
  'N = {s1}{s2}':
    'N = {s1}{s2}',
  'Nessun termine AR o MA significativo: il modello si riduce a una media (o a un drift) più rumore.':
    'Nenhum termo AR ou MA significativo: o modelo reduz-se a uma média (ou a um drift) mais ruído.',
  'nessun trend monotono':
    'nenhuma tendência monótona',
  'nessuna autocorrelazione residua, il modello ha catturato la memoria della serie':
    'nenhuma autocorrelação residual, o modelo captou a memória da série',
  'nessuna autocorrelazione rilevante':
    'nenhuma autocorrelação relevante',
  'non batte il riferimento più semplice (RMSE {s1}): la struttura aggiuntiva non ripaga':
    'não supera a referência mais simples (RMSE {s1}): a estrutura adicional não compensa',
  'non c’è evidenza di un {s1} (Mann–Kendall p = {s2})':
    'não há evidência de uma {s1} (p de Mann–Kendall = {s2})',
  'non calcolabile':
    'não calculável',
  'non ci sono altri ordini confrontabili':
    'não há outras ordens comparáveis',
  'Non è stato possibile stimare un modello ARIMA su questa serie: le previsioni mostrate sono quelle dei modelli semplici.':
    'Não foi possível estimar um modelo ARIMA nesta série: as previsões apresentadas são as dos modelos simples.',
  'orizzonte {s1} passi':
    'horizonte de {s1} passos',
  'Osservazioni':
    'Observações',
  'Osservazioni efficaci':
    'Observações eficazes',
  'p':
    'p',
  'PACF':
    'PACF',
  'Passo':
    'Passo',
  'Pendenza di Sen':
    'Declive de Sen',
  'Pendenza di Sen = {s1} per passo: {s2} mediana, robusta agli outlier.':
    'Declive de Sen = {s1} por passo: {s2} mediana, robusta aos valores atípicos.',
  'Posizione nel ciclo':
    'Posição no ciclo',
  'Previsione':
    'Previsão',
  'Previsioni ({s1})':
    'Previsões ({s1})',
  'Primo valore':
    'Primeiro valor',
  'Questi modelli servono da riferimento: il migliore viene confrontato con l’ARIMA, che è il modello usato per le previsioni con intervalli.':
    'Estes modelos servem de referência: o melhor é comparado com o ARIMA, que é o modelo usado para as previsões com intervalos.',
  'Qui {s1}, e {s2}.':
    'Aqui {s1}, e {s2}.',
  'Report di lettura':
    'Relatório de leitura',
  'Residui: Ljung–Box {s1} → {s2}.':
    'Resíduos: Ljung–Box {s1} → {s2}.',
  'Residuo':
    'Resíduo',
  'resta autocorrelazione non spiegata, l’ordine andrebbe rivisto':
    'resta autocorrelação não explicada, a ordem deveria ser revista',
  'RMSE':
    'RMSE',
  'RMSE e MAE sono nella stessa unità della serie; il MAPE è percentuale e non è definito se la serie contiene zeri.':
    'RMSE e MAE estão na mesma unidade da série; o MAPE é percentual e não é definido se a série contiver zeros.',
  'scala non calcolabile':
    'escala não calculável',
  'scarsa (peggio della media)':
    'fraca (pior do que a média)',
  'Scelta della differenziazione':
    'Escolha da diferenciação',
  'Scomposizione':
    'Decomposição',
  'Serie':
    'Série',
  'serie = trend + stagionalità + residuo':
    'série = tendência + sazonalidade + resíduo',
  'Serie di {s1} osservazioni: {s2}.':
    'Série de {s1} observações: {s2}.',
  'serie non casuale':
    'série não aleatória',
  'Serie storica':
    'Série temporal',
  'Serie troppo corta per una validazione fuori campione: l’errore disponibile è quello di adattamento.':
    'Série demasiado curta para uma validação fora da amostra: o erro disponível é o de ajustamento.',
  'Sintesi della serie':
    'Síntese da série',
  'Sono previsioni puntuali: l’intervallo di incertezza crescerebbe con l’orizzonte e non è incluso.':
    'São previsões pontuais: o intervalo de incerteza cresceria com o horizonte e não está incluído.',
  'Stagionalità':
    'Sazonalidade',
  'Stagionalità non richiesta':
    'Sazonalidade não pedida',
  'Statistica':
    'Estatística',
  'Su questa base viene stimato un modello ARIMA/SARIMA: memoria e stagionalità stimate servono a costruire previsioni con intervalli, non solo a descrivere la serie.':
    'Com esta base é estimado um modelo ARIMA/SARIMA: a memória e a sazonalidade estimadas servem para construir previsões com intervalos, não apenas para descrever a série.',
  't':
    't',
  'termine non significativo, il suo contributo non si distingue dal caso':
    'termo não significativo, o seu contributo não se distingue do acaso',
  'termine significativo, aggiunge memoria al modello':
    'termo significativo, acrescenta memória ao modelo',
  'Test':
    'Teste',
  'Test ADF sulla serie':
    'Teste ADF sobre a série',
  'Test dei runs: p = {s1}{s2}.':
    'Teste das runs: p = {s1}{s2}.',
  'Test di casualità e trend':
    'Testes de aleatoriedade e tendência',
  'Trend':
    'Tendência',
  'trend {s1}':
    'tendência {s1}',
  'trend crescente':
    'tendência crescente',
  'trend decrescente':
    'tendência decrescente',
  'Trend e casualità':
    'Tendência e aleatoriedade',
  'Trend, stagionalità e previsioni assumono che il futuro continui il pattern osservato: cambi di regime non sono previsti.':
    'Tendência, sazonalidade e previsões assumem que o futuro continua o padrão observado: mudanças de regime não são previstas.',
  'Ultimo valore':
    'Último valor',
  'Validazione fuori campione: RMSE = {s1}, MAE = {s2}; il modello {s3}.':
    'Validação fora da amostra: RMSE = {s1}, MAE = {s2}; o modelo {s3}.',
  'Valore':
    'Valor',
  'Variazione dal primo all’ultimo valore: {s1} ({s2}).':
    'Variação do primeiro ao último valor: {s1} ({s2}).',
  'Variazione totale':
    'Variação total',
  'Wald–Wolfowitz (runs)':
    'Wald–Wolfowitz (runs)',
};
