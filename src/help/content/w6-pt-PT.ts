import type { HelpTopic } from './types';
import { procedureTopic } from './template';

/** Wave 6 procedures (compact pt-PT edition). */
export const w6Topics: HelpTopic[] = [
  procedureTopic({
    id: "competing", title: "Riscos competitivos", summary: "Estima a incidência cumulativa de uma causa enquanto as outras competem pelo mesmo tempo.",
    goal: "Medir a frequência de uma causa específica quando os sujeitos podem sair por outras causas.",
    steps: ["Escolhe o tempo e o evento com os códigos das causas (0 = censurado).", "Introduz o código da causa de interesse.", "Seleciona as covariáveis e executa o modelo de Fine–Gray.", "Lê a curva de incidência cumulativa e os hazard ratio de subdistribuição."],
    expected: "Resumo de eventos e causas, coeficientes de Fine–Gray com sHR e curva de incidência cumulativa no perfil médio.",
    whenToUse: ["Quando um evento tem várias causas mutuamente exclusivas e não independentes.", "Quando queres a probabilidade de uma causa ao longo do tempo."],
    assumptions: ["As causas são exaustivas e exclusivas; a censura é não informativa.", "Os hazard ratio de subdistribuição são constantes no tempo."],
    reading: ["A CIF é a probabilidade da causa escolhida até t com as outras causas presentes.", "Kaplan–Meier trata as causas competitivas como censura e não dá a CIF."],
    pitfalls: ["Ler a CIF como 1 − sobrevivência da causa escolhida.", "Escolher a causa depois de ver os resultados."],
    charts: ["Curva de incidência cumulativa da causa escolhida.", "Forest plot dos hazard ratio de subdistribuição."],
  }),
  procedureTopic({
    id: "recurrent", title: "Eventos recorrentes", summary: "Modela eventos repetidos por sujeito com Andersen–Gill ou Wei–Lin–Weissfeld e erros robustos.",
    goal: "Estimar o efeito das covariáveis na taxa de eventos repetidos sem supor independência entre eventos do mesmo sujeito.",
    steps: ["Seleciona o id do sujeito e as colunas início, fim e evento em formato início-fim.", "Escolhe Andersen–Gill para o processo global ou Wei–Lin–Weissfeld por número de evento.", "Adiciona as covariáveis e executa.", "Lê os hazard ratio e os intervalos robustos."],
    expected: "Resumo de sujeitos e episódios, hazard ratio com erros agrupados e testes globais.",
    whenToUse: ["Quando o mesmo sujeito pode ter o evento várias vezes: recaídas, falhas, internamentos.", "Quando os eventos de um sujeito estão correlacionados."],
    assumptions: ["Censura não informativa e intervalos início-fim coerentes.", "AG assume um efeito comum; WLW uma baseline por número de evento."],
    reading: ["AG mantém o sujeito em risco após cada evento e usa o tempo de calendário.", "WLW usa o tempo desde o evento anterior e um estrato por número de evento."],
    pitfalls: ["Tratar cada linha como um sujeito independente.", "Confundir tempo de calendário e tempo entre eventos."],
    charts: ["Forest plot dos hazard ratio robustos."],
  }),
  procedureTopic({
    id: "alt", title: "Ensaios de vida acelerada", summary: "Relaciona a duração com uma variável de tensão através de um AFT de Weibull e reporta o fator de aceleração.",
    goal: "Estimar a vida na tensão de uso a partir de ensaios a tensões mais altas.",
    steps: ["Seleciona tempo, evento e a coluna de tensão.", "Escolhe a relação: Arrhenius (1/tensão), potência inversa (log tensão) ou exponencial (tensão).", "Introduz a tensão de uso e as covariáveis.", "Executa e lê o fator de aceleração e os time ratio."],
    expected: "Resumo AFT de Weibull com fator de aceleração, time ratio e gráfico de barras do fator.",
    whenToUse: ["Quando os componentes são testados a tensões superiores às de operação.", "Quando se espera que o mecanismo de falha não mude com a tensão."],
    assumptions: ["A distribuição de Weibull descreve os tempos e o mecanismo não muda.", "A tensão é medida sem erro e os níveis estão bem separados."],
    reading: ["O fator compara a vida na tensão de uso com a da tensão observada mais baixa.", "O time ratio refere-se a uma unidade da variável transformada."],
    pitfalls: ["Extrapolar muito além do intervalo testado sem justificação física.", "Ler o time ratio como se fosse sobre a tensão bruta."],
    charts: ["Forest plot dos time ratio.", "Gráfico de barras do fator de aceleração."],
  }),
  procedureTopic({
    id: "reliability", title: "Crescimento de fiabilidade e RBD", summary: "Segue uma curva de crescimento Crow–AMSAA ou combina fiabilidades de componentes num diagrama série/paralelo.",
    goal: "Ver se um sistema reparável está a melhorar ou calcular a fiabilidade do sistema a partir dos componentes.",
    steps: ["Escolhe crescimento para falhas acumuladas, ou RBD para combinar fiabilidades.", "Para crescimento seleciona tempo e falhas acumuladas e executa.", "Para RBD introduz a fiabilidade de cada componente e agrupa em paralelo as do mesmo estágio.", "Lê os parâmetros ou a fiabilidade do sistema e identifica o estágio mais fraco."],
    expected: "Crescimento: β, λ, MTBF acumulado e instantâneo e gráfico observado/ajustado. RBD: fiabilidade por estágio e do sistema.",
    whenToUse: ["Quando um sistema reparável é melhorado e queres verificar que as falhas diminuem.", "Quando a fiabilidade do sistema deve ser derivada dos componentes."],
    assumptions: ["Crescimento: processo de Poisson não homogéneo com intensidade de lei de potência e correções acumuladas.", "RBD: componentes independentes e fiabilidades conhecidas sem incerteza."],
    reading: ["β < 1 indica uma taxa de falha decrescente; β = 1 é um processo de Poisson homogéneo.", "Em série a fiabilidade é o produto dos estágios; em paralelo 1 − Π(1 − r)."],
    pitfalls: ["Ler a curva de crescimento como previsão além do tempo observado.", "Esquecer que um estágio em série pára o sistema."],
    charts: ["Falhas acumuladas observadas e ajustadas (crescimento).", "Fiabilidade por etapa (RBD)."],
  }),
];
