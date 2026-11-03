/** pt-PT: report and table prose (normalised). */
export const miCopy: Record<string, string> = {
  '{s1} celle imputate con {s2} dataset; FMI massimo {s3}.':
    '{s1} células imputadas com {s2} conjuntos de dados; FMI máximo {s3}.',
  '{s1} righe · {s2} imputazioni · {s3} iterazioni':
    '{s1} linhas · {s2} imputações · {s3} iterações',
  '% mancante':
    '% omisso',
  'CI {s1}%':
    'CI {s1}%',
  'CI high':
    'CI superior',
  'CI low':
    'CI inferior',
  'Coefficienti pooled con regole di Rubin; R² è la media delle imputazioni.':
    'Coeficientes agregados com as regras de Rubin; o R² é a média das imputações.',
  'Con poche osservazioni o variabili molto correlate il modello di imputazione può essere instabile.':
    'Com poucas observações ou variáveis muito correlacionadas o modelo de imputação pode ser instável.',
  'Dati mancanti':
    'Dados omissos',
  'df Rubin':
    'df de Rubin',
  'FMI':
    'FMI',
  'Il livello di confidenza delle stime pooled è {s1}%.':
    'O nível de confiança das estimativas agregadas é {s1}%.',
  'Imputazione stabile':
    'Imputação estável',
  'L’imputazione assume dati mancanti a caso (MAR) condizionatamente alle altre variabili.':
    'A imputação assume dados omissos aleatórios (MAR) condicionados às outras variáveis.',
  'La frazione di informazione mancante è contenuta: le stime sono relativamente stabili.':
    'A fração de informação omissa é contida: as estimativas são relativamente estáveis.',
  'Le stime pooled combinano la variabilità dentro e tra le imputazioni: i CI tengono conto dell’incertezza dovuta ai dati mancanti.':
    'As estimativas agregadas combinam a variabilidade dentro e entre as imputações: os CI têm em conta a incerteza devida aos dados omissos.',
  'Le stime pooled qui riportate riguardano media e SD, non modelli di regressione completi.':
    'As estimativas agregadas aqui apresentadas dizem respeito à média e ao SD, não a modelos de regressão completos.',
  'Le variabili selezionate vengono imputate con un modello lineare sulle altre variabili.':
    'As variáveis selecionadas são imputadas com um modelo linear sobre as outras variáveis.',
  'Mancanti':
    'Omissos',
  'Media':
    'Média',
  'Modello di imputazione: regressione lineare a catene, {s1} iterazioni per dataset.':
    'Modelo de imputação: regressão linear por cadeias, {s1} iterações por conjunto de dados.',
  'Modello lineare pooled: R² medio = {s1} su {s2} predittori.':
    'Modelo linear agregado: R² médio = {s1} com {s2} preditores.',
  'Molte informazioni mancanti':
    'Muita informação omissa',
  'Nessun modello di regressione pooled richiesto.':
    'Não foi pedido nenhum modelo de regressão agregado.',
  'Osservati':
    'Observados',
  'p':
    'p',
  'Pooling di Rubin: varianza totale = varianza within + (1 + 1/m)·varianza between.':
    'Agregação de Rubin: variância total = variância intra + (1 + 1/m)·variância entre imputações.',
  'R² medio = {s1} · {s2}% CI':
    'R² médio = {s1} · CI {s2}%',
  'Regressione pooled':
    'Regressão agregada',
  'Report di imputazione multipla':
    'Relatório de imputação múltipla',
  'SD pooled':
    'SD agregado',
  'SE':
    'SE',
  'Stime pooled (Rubin)':
    'Estimativas agregadas (Rubin)',
  't':
    't',
  'Termine':
    'Termo',
  'Una FMI alta indica che i dati mancanti dominano l’incertezza: interpreta le stime con cautela.':
    'Uma FMI elevada indica que os dados omissos dominam a incerteza: interprete as estimativas com cautela.',
  'Variabile':
    'Variável',
  'Variabili: {s1}.':
    'Variáveis: {s1}.',
  'β':
    'β',
  'Riepilogo per variabile': 'Resumo por variável',
  'Codici osservati': 'Códigos observados',
  'Le variabili categoriche sono imputate con una regressione logistica (due categorie) o multinomiale (più categorie) sulle altre variabili e sulle covariabili numeriche.': 'As variáveis categóricas são imputadas com regressão logística (duas categorias) ou multinomial (mais de duas) sobre as restantes variáveis e as covariáveis numéricas.',
  'Le categorie sono i codici interi osservati, ordinati numericamente; l’imputazione non può produrre codici nuovi.': 'As categorias são os códigos inteiros observados, ordenados numericamente; a imputação não pode produzir códigos novos.',
  'Conteggi osservati e completati per categoria': 'Contagens observadas e completadas por categoria',
  'Dopo l’ultima delle {s1} imputazioni': 'Após a última das {s1} imputações',
  'Completati': 'Completados',
  'Prop. osservata': 'Prop. observada',
  'Prop. completata': 'Prop. completada',
  'I conteggi completati sono quelli dell’ultimo dataset imputato: servono a confrontare la distribuzione osservata con quella ricostruita.': 'As contagens completadas são as do último conjunto imputado: comparam a distribuição observada com a reconstruída.',
  'Una differenza sistematica tra proporzione osservata e completata segnala che il modello di imputazione sta spostando la distribuzione.': 'Uma diferença sistemática entre proporção observada e completada indica que o modelo de imputação está a deslocar a distribuição.',
  'Proporzioni pooled (Rubin)': 'Proporções pooled (Rubin)',
  'CI {s1}% · pooling sulle {s2} imputazioni': 'IC {s1}% · pooling sobre {s2} imputações',
  'Pooling di Rubin sulle proporzioni: varianza totale = varianza within + (1 + 1/m)·varianza between.': 'Pooling de Rubin sobre proporções: variância total = variância within + (1 + 1/m)·variância between.',
  'Le proporzioni di ciascuna variabile sommano a 1; gli intervalli di categorie rare possono essere molto ampi.': 'As proporções de cada variável somam 1; os intervalos de categorias raras podem ser muito amplos.',
  'Report di imputazione multipla categorica': 'Relatório de imputação múltipla categórica',
  '{s1} celle categoriche imputate con {s2} dataset; FMI massimo {s3}.': '{s1} células categóricas imputadas com {s2} conjuntos; FMI máximo {s3}.',
  'Variabili categoriche: {s1}.': 'Variáveis categóricas: {s1}.',
  'Modello di imputazione: catene con regressione logistica o multinomiale, {s1} iterazioni per dataset.': 'Modelo de imputação: regressões logística ou multinomial em cadeia, {s1} iterações por conjunto.',
  'Categorie osservate: {s1} in totale; le proporzioni pooled sono combinate con le regole di Rubin.': 'Categorias observadas: {s1} no total; as proporções pooled são combinadas com as regras de Rubin.',
  'Le proporzioni pooled sono la media delle proporzioni di categoria nelle {s1} imputazioni; gli intervalli combinano la variabilità dentro e tra le imputazioni.': 'As proporções pooled são a média das proporções de categoria nas {s1} imputações; os intervalos combinam a variabilidade dentro e entre imputações.',
  'Ogni variabile mantiene solo le categorie osservate: l’imputazione non inventa codici nuovi, ma redistribuisce le righe mancanti tra le categorie esistenti.': 'Cada variável mantém apenas as suas categorias observadas: a imputação não inventa códigos novos, mas redistribui as linhas em falta pelas categorias existentes.',
  'Una FMI alta indica che i dati mancanti dominano l’incertezza delle proporzioni: interpreta le stime con cautela.': 'Um FMI alto indica que os dados em falta dominam a incerteza das proporções: interpreta as estimativas com cautela.',
  'La frazione di informazione mancante è contenuta: le proporzioni pooled sono relativamente stabili.': 'A fração de informação em falta é contida: as proporções pooled são relativamente estáveis.',
  'Il modello assume che i dati manchino a caso (MAR) condizionatamente alle altre variabili categoriche e alle covariabili numeriche incluse.': 'O modelo assume dados em falta ao acaso (MAR) condicionados às restantes variáveis categóricas e às covariáveis numéricas incluídas.',
  'Le altre variabili categoriche entrano nel modello come dummy (K−1 per variabile) usando i valori correnti della catena; le covariabili numeriche entrano come effetti lineari.': 'As restantes variáveis categóricas entram como dummies (K−1 por variável) usando os valores atuais da cadeia; as covariáveis numéricas entram como efeitos lineares.',
  'Le righe usate per stimare ciascun modello condizionale sono quelle in cui la variabile da imputare è osservata; le altre variabili possono essere già state imputate nella stessa iterazione.': 'As linhas usadas para estimar cada modelo condicional são aquelas em que a variável a imputar está observada; as restantes variáveis podem já ter sido imputadas na mesma iteração.',
  'Categorie con proporzione pooled inferiore al 5%: {s1}. Queste stime sono le più sensibili al modello e al numero di imputazioni.': 'Categorias com proporção pooled inferior a 5%: {s1}. Estas estimativas são as mais sensíveis ao modelo e ao número de imputações.',
  'Nessuna categoria pooled scende sotto il 5%: le proporzioni stimate sono distribuite in modo non estremo.': 'Nenhuma categoria pooled desce abaixo de 5%: as proporções estimadas não são extremas.',
  'Con categorie rare gli errori standard possono essere instabili anche quando il modello converge.': 'Com categorias raras os erros padrão podem ser instáveis mesmo quando o modelo converge.',
  'L’imputazione assume dati mancanti a caso (MAR) condizionatamente alle variabili osservate: se il meccanismo è MNAR le stime possono essere distorte.': 'A imputação assume dados em falta ao acaso (MAR) condicionados às variáveis observadas: se o mecanismo for MNAR as estimativas podem estar enviesadas.',
  'Il percorso categorico non usa la massima verosimiglianza a informazione completa (FIML): l’incertezza è quella del pooling di Rubin sulle imputazioni.': 'O percurso categórico não usa máxima verosimilhança de informação completa (FIML): a incerteza vem do pooling de Rubin sobre as imputações.',
  'Non è disponibile un modello gerarchico o multilivello per le categorie: strutture di clustering non vengono modellate.': 'Não está disponível um modelo hierárquico ou multinível para categorias: as estruturas de clustering não são modeladas.',
  'Categorie rare e variabili quasi separate rendono instabili i coefficienti logistici e quindi le proporzioni imputate.': 'Categorias raras e variáveis quase separadas tornam os coeficientes logísticos instáveis e, por isso, também as proporções imputadas.',
  'Le stime pooled qui riportate riguardano le proporzioni di categoria, non modelli di regressione categorica completi.': 'As estimativas pooled aqui apresentadas dizem respeito a proporções de categoria, não a modelos de regressão categórica completos.',
};
