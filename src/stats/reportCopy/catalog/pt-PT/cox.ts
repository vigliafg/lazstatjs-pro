/** pt-PT: report and table prose (normalised). */
export const coxCopy: Record<string, string> = {
  ' Qui ci sono {s1} osservazioni, {s2} eventi e {s3} censurati.':
    ' Aqui há {s1} observações, {s2} eventos e {s3} censurados.',
  '; B = {s1}':
    '; B = {s1}',
  '{s1} osservazioni · {s2} eventi · {s3} covariariate':
    '{s1} observações · {s2} eventos · {s3} covariáveis',
  '{s1}: HR = {s2} ({s3} – {s4}), {s5} → {s6}{s7}.':
    '{s1}: HR = {s2} ({s3} – {s4}), {s5} → {s6}{s7}.',
  '{s1}: stima instabile (B = {s2}, errore standard = {s3}), coerente con separazione quasi completa: l’hazard ratio non è interpretabile.':
    '{s1}: estimativa instável (B = {s2}, erro padrão = {s3}), coerente com separação quase completa: o hazard ratio não é interpretável.',
  '{s1}: stima non disponibile.':
    '{s1}: estimativa não disponível.',
  'A rischio':
    'Em risco',
  'AIC':
    'AIC',
  'AIC = {s1}: utile solo per confrontare modelli stimati sugli stessi dati.':
    'AIC = {s1}: útil apenas para comparar modelos estimados sobre os mesmos dados.',
  'almeno un coefficiente è diverso da zero':
    'pelo menos um coeficiente é diferente de zero',
  'Avviso {s1}':
    'Aviso {s1}',
  'B':
    'B',
  'B è il logaritmo dell’hazard ratio: B > 0 indica rischio maggiore quando la covariata aumenta.':
    'B é o logaritmo do hazard ratio: B > 0 indica risco maior quando a covariável aumenta.',
  'buona capacità di ordinare i tempi':
    'boa capacidade de ordenar os tempos',
  'Censurati':
    'Censurados',
  'Coefficienti e hazard ratio':
    'Coeficientes e hazard ratios',
  'Come leggere i numeri':
    'Como ler os números',
  'Come regola pratica servono almeno 10 eventi per covariata: sotto questa soglia le stime sono instabili.':
    'Como regra prática são necessários pelo menos 10 eventos por covariável: abaixo deste limiar as estimativas são instáveis.',
  'Con campioni grandi i tre test convergono; con pochi eventi il rapporto di verosimiglianza è il più affidabile.':
    'Com amostras grandes os três testes convergem; com poucos eventos a razão de verosimilhança é a mais fiável.',
  'Concordanza (C di Harrell)':
    'Concordância (C de Harrell)',
  'Concordanza C = {s1}: {s2}.':
    'Concordância C = {s1}: {s2}.',
  'Convergenza':
    'Convergência',
  'Covariata':
    'Covariável',
  'Covariati':
    'Covariáveis',
  'df':
    'df',
  'discriminazione discreta':
    'discriminação razoável',
  'discriminazione modesta':
    'discriminação modesta',
  'È un test asintotico e con pochi eventi ha poca potenza: l’assenza di significatività non prova i rischi proporzionali.':
    'É um teste assintótico e com poucos eventos tem pouca potência: a ausência de significância não prova os riscos proporcionais.',
  'effetto che cambia nel tempo: l’ipotesi di rischi proporzionali è messa in discussione':
    'efeito que muda ao longo do tempo: a hipótese de riscos proporcionais é posta em causa',
  'Effetto rilevato':
    'Efeito detetado',
  'Errore std.':
    'Erro padrão',
  'Eventi':
    'Eventos',
  'Eventi per covariata':
    'Eventos por covariável',
  'Eventi per covariata: {s1}. Sotto 10 le stime diventano fragili e il modello può essere sovra-adattato.':
    'Eventos por covariável: {s1}. Abaixo de 10 as estimativas tornam-se frágeis e o modelo pode ficar sobreajustado.',
  'H₀(t)':
    'H₀(t)',
  'H₀(t) è il rischio cumulato valutato al profilo medio delle covariariate: un profilo ipotetico ma stabile numericamente anche con età o punteggi lontani da zero.':
    'H₀(t) é o risco acumulado avaliado no perfil médio das covariáveis: um perfil hipotético mas numericamente estável mesmo com idades ou pontuações longe de zero.',
  'HR':
    'HR',
  'HR = 1 significa nessun effetto; l’intervallo che contiene 1 è coerente con l’assenza di associazione.':
    'HR = 1 significa nenhum efeito; o intervalo que contém 1 é coerente com a ausência de associação.',
  'HR = 1: nessun effetto. HR > 1: rischio maggiore per valori più alti della covariata. HR < 1: effetto protettivo.':
    'HR = 1: nenhum efeito. HR > 1: risco maior para valores mais altos da covariável. HR < 1: efeito protetor.',
  'HR high':
    'HR superior',
  'HR low':
    'HR inferior',
  'I censurati restano a rischio finché sono osservati: Cox usa questa informazione, mentre scartarli o trattarli come eventi distorce le stime.':
    'Os censurados permanecem em risco enquanto são observados: Cox usa esta informação, ao passo que os descartar ou tratá-los como eventos distorce as estimativas.',
  'I p-value sono test di Wald e non tengono conto dell’incertezza sugli altri coefficienti.':
    'Os valores p são testes de Wald e não têm em conta a incerteza sobre os outros coeficientes.',
  'I rischi proporzionali sono un’assunzione del modello: il test riportato è asintotico e con pochi eventi ha poca potenza.':
    'Os riscos proporcionais são um pressuposto do modelo: o teste apresentado é assintótico e com poucos eventos tem pouca potência.',
  'I tempi di evento uguali sono gestiti con l’approssimazione di Breslow, che con molti pareggi può sottostimare lievemente gli errori standard.':
    'Os tempos de evento iguais são tratados com a aproximação de Breslow, que com muitos empates pode subestimar ligeiramente os erros padrão.',
  'IC {s1}% · HR per un’unità di incremento della covariata':
    'CI {s1}% · HR por uma unidade de incremento da covariável',
  'IC dell’HR che non contiene 1 è coerente con un test di Wald significativo; l’intervallo è moltiplicativo, quindi 0,5 e 2 sono effetti simmetrici.':
    'Um CI do HR que não contém 1 é coerente com um teste de Wald significativo; o intervalo é multiplicativo, pelo que 0,5 e 2 são efeitos simétricos.',
  'Il modello di Cox non è stimabile con i dati disponibili.':
    'O modelo de Cox não é estimável com os dados disponíveis.',
  'Il modello è significativo (LR χ² = {s1}, {s2}) e la covariata più forte è {s3} (HR = {s4}).':
    'O modelo é significativo (LR χ² = {s1}, {s2}) e a covariável mais forte é {s3} (HR = {s4}).',
  'Il modello nel suo insieme':
    'O modelo no seu conjunto',
  'Il modello non è significativo (LR χ² = {s1}, {s2}): le covariariate non spiegano i tempi di evento meglio del caso.':
    'O modelo não é significativo (LR χ² = {s1}, {s2}): as covariáveis não explicam os tempos de evento melhor do que o acaso.',
  'il modello spiega i tempi meglio del nulla':
    'o modelo explica os tempos melhor do que o nulo',
  'Il profilo di rischio cambia con {s1}: per ogni unità in più l’hazard ratio è {s2}. Riporta sempre l’IC e il numero di eventi, e verifica se l’effetto è stabile nei sottogruppi.':
    'O perfil de risco muda com {s1}: por cada unidade adicional o hazard ratio é {s2}. Apresente sempre o CI e o número de eventos, e verifique se o efeito é estável nos subgrupos.',
  'Il test aggiunge un coefficiente per covariata × log(t): se quel coefficiente è diverso da zero l’effetto cambia con il tempo.':
    'O teste acrescenta um coeficiente por covariável × log(t): se esse coeficiente é diferente de zero, o efeito muda com o tempo.',
  'Il test confronta il modello con uno che aggiunge covariata × log(t): un p piccolo segnala che l’effetto non è costante.':
    'O teste compara o modelo com outro que acrescenta covariável × log(t): um p pequeno assinala que o efeito não é constante.',
  'Il test globale dà {s1}: l’effetto di almeno una covariata sembra cambiare nel tempo. Il modello resta una sintesi media, ma HR unico e curve di sopravvivenza previste vanno presentati con prudenza; valuta interazioni con il tempo o modelli stratificati.':
    'O teste global dá {s1}: o efeito de pelo menos uma covariável parece mudar ao longo do tempo. O modelo continua a ser uma síntese média, mas o HR único e as curvas de sobrevivência previstas devem ser apresentados com prudência; considere interações com o tempo ou modelos estratificados.',
  'Il test globale dà {s1}: non emerge un cambiamento dell’effetto nel tempo, quindi l’ipotesi di rischi proporzionali è compatibile con i dati.':
    'O teste global dá {s1}: não emerge uma mudança do efeito ao longo do tempo, pelo que a hipótese de riscos proporcionais é compatível com os dados.',
  'Il test score valutato in β = 0 coincide, per una sola covariata dicotomica, con il log-rank.':
    'O teste score avaliado em β = 0 coincide, para uma única covariável dicotómica, com o log-rank.',
  'In pratica':
    'Na prática',
  'ipotesi nulla: tutti i coefficienti uguali a zero':
    'hipótese nula: todos os coeficientes iguais a zero',
  'Iterazioni':
    'Iterações',
  'L’hazard ratio confronta il rischio istantaneo di evento per un incremento unitario della covariata, a parità delle altre: HR = 2 significa rischio doppio in ogni istante, non durata doppia.':
    'O hazard ratio compara o risco instantâneo de evento por um incremento unitário da covariável, mantendo as outras constantes: HR = 2 significa risco duplo em cada instante, não duração dupla.',
  'La C di Harrell misura l’ordinamento dei tempi, non la calibrazione: un modello può ordinare bene e sbagliare le probabilità assolute.':
    'A C de Harrell mede a ordenação dos tempos, não a calibração: um modelo pode ordenar bem e errar as probabilidades absolutas.',
  'La C di Harrell misura la capacità del modello di ordinare i tempi: 0,5 = caso, 1 = ordine perfetto.':
    'A C de Harrell mede a capacidade do modelo para ordenar os tempos: 0,5 = acaso, 1 = ordenação perfeita.',
  'La regressione di Cox mette in relazione il tempo fino all’evento con una o più covariariate, senza assumere una forma specifica per il rischio di base.{s1}':
    'A regressão de Cox relaciona o tempo até ao evento com uma ou mais covariáveis, sem assumir uma forma específica para o risco de base.{s1}',
  'La relazione tra covariata e log-rischio è assunta lineare: per effetti non lineari servono trasformazioni o spline.':
    'A relação entre a covariável e o log-risco é assumida linear: para efeitos não lineares são necessárias transformações ou splines.',
  'La sopravvivenza di base è valutata al profilo medio delle covariariate e può non corrispondere a un soggetto reale.':
    'A sobrevivência de base é avaliada no perfil médio das covariáveis e pode não corresponder a um sujeito real.',
  'La stima è al limite della regione ammissibile: una covariata predice quasi perfettamente chi ha l’evento. Il coefficiente e l’hazard ratio non vanno riportati come effetto; riduci le covariariate del modello, controlla se la variabile è una conseguenza dell’esito o usa un test esatto.':
    'A estimativa está no limite da região admissível: uma covariável prediz quase perfeitamente quem tem o evento. O coeficiente e o hazard ratio não devem ser apresentados como efeito; reduza as covariáveis do modelo, verifique se a variável é uma consequência do resultado ou use um teste exato.',
  'La verosimiglianza parziale di Cox non richiede di specificare la forma della funzione di rischio di base.':
    'A verosimilhança parcial de Cox não exige especificar a forma da função de risco de base.',
  'Le covariariate non mostrano un’associazione affidabile con il tempo di evento. Con pochi eventi il modello ha poca potenza: l’assenza di significatività non dimostra l’assenza di effetto.':
    'As covariáveis não mostram uma associação fiável com o tempo de evento. Com poucos eventos o modelo tem pouca potência: a ausência de significância não demonstra a ausência de efeito.',
  'le covariariate sono associate al rischio già senza stima completa':
    'as covariáveis estão associadas ao risco mesmo sem estimativa completa',
  'Lettura':
    'Leitura',
  'Log-verosimiglianza':
    'Log-verosimilhança',
  'Log-verosimiglianza nulla':
    'Log-verosimilhança nula',
  'Nessun coefficiente disponibile.':
    'Nenhum coeficiente disponível.',
  'nessun coefficiente distinguibile da zero':
    'nenhum coeficiente distinguível de zero',
  'Nessun effetto':
    'Nenhum efeito',
  'nessuna associazione affidabile con il rischio':
    'nenhuma associação fiável com o risco',
  'nessuna associazione iniziale rilevante':
    'nenhuma associação inicial relevante',
  'nessuna evidenza contro i rischi proporzionali':
    'nenhuma evidência contra os riscos proporcionais',
  'nessuna prova che le covariariate spieghino i tempi':
    'nenhuma prova de que as covariáveis expliquem os tempos',
  'non calcolabile':
    'não calculável',
  'Non calcolabile':
    'Não calculável',
  'non modifica':
    'não altera',
  'Non sono inclusi covariariate dipendenti dal tempo, effetti casuali, stratificazione o rischi competitivi.':
    'Não estão incluídas covariáveis dependentes do tempo, efeitos aleatórios, estratificação ou riscos competitivos.',
  'non verificabile con questi dati':
    'não verificável com estes dados',
  'Ogni covariata':
    'Cada covariável',
  'Osservazioni':
    'Observações',
  'p':
    'p',
  'p grande è ciò che si vuole vedere: indica che l’ipotesi di rischio proporzionale regge.':
    'Um p grande é o que se quer ver: indica que a hipótese de risco proporcional se mantém.',
  'peggio del caso, controlla i segni':
    'pior do que o acaso, verifique os sinais',
  'Per un profilo x la sopravvivenza è S₀(t) elevato a exp((x − x̄)′B): la curva di base non va letta come la sopravvivenza media della coorte.':
    'Para um perfil x a sobrevivência é S₀(t) elevado a exp((x − x̄)′B): a curva de base não deve ser lida como a sobrevivência média da coorte.',
  'Rapporto di verosimiglianza':
    'Razão de verosimilhança',
  'Rapporto di verosimiglianza: χ² = {s1} con {s2} gradi di libertà, {s3} (soglia α = {s4}).':
    'Razão de verosimilhança: χ² = {s1} com {s2} graus de liberdade, {s3} (limiar α = {s4}).',
  'Report di lettura — Regressione di Cox':
    'Relatório de leitura — Regressão de Cox',
  'Rischi proporzionali':
    'Riscos proporcionais',
  'Rischio cumulato di base':
    'Risco acumulado de base',
  'S₀(t)':
    'S₀(t)',
  'Score (log-rank generalizzato)':
    'Score (log-rank generalizado)',
  'servono più eventi (o tempi tutti positivi) per stimare il modello con interazioni':
    'são necessários mais eventos (ou tempos todos positivos) para estimar o modelo com interações',
  'Sintesi del modello di Cox':
    'Síntese do modelo de Cox',
  'Statistica':
    'Estatística',
  'stimatore di Breslow · profilo medio delle covariariate':
    'estimador de Breslow · perfil médio das covariáveis',
  'Stime instabili':
    'Estimativas instáveis',
  'Stime instabili: {s1} separa quasi completamente gli eventi, quindi l’hazard ratio (B = {s2}) non è interpretabile.':
    'Estimativas instáveis: {s1} separa quase completamente os eventos, pelo que o hazard ratio (B = {s2}) não é interpretável.',
  'Tempo':
    'Tempo',
  'Termine':
    'Termo',
  'Test':
    'Teste',
  'test di interazione con log(tempo)':
    'teste de interação com log(tempo)',
  'Test globali sul modello':
    'Testes globais sobre o modelo',
  'un aumento di una unità {s1} il rischio istantaneo di evento':
    'um aumento de uma unidade {s1} o risco instantâneo de evento',
  'Valore':
    'Valor',
  'Verifica dei rischi proporzionali':
    'Verificação dos riscos proporcionais',
  'Voce':
    'Item',
  'z':
    'z',
  'χ²':
    'χ²',
};
