import type { HelpTopic } from '../types';

/** Chapters that explain the application itself, before the procedures. */
export const areaTopics: HelpTopic[] = [
  {
    id: 'start-tour',
    area: 'start',
    title: 'Primeiros passos: dados, análise, resultados',
    summary: 'Todo o ciclo em três gestos, para saber onde está cada coisa.',
    tutorial: {
      goal: 'Executar uma primeira análise de princípio a fim sem saber nada do programa.',
      dataset: 'score-groups.csv',
      steps: [
        'Abra DADOS: é uma folha de cálculo com uma linha de cabeçalho e uma coluna por variável.',
        'Prima Importar e escolha score-groups.csv: o delimitador e os decimais são detetados automaticamente.',
        'Verifique o tipo por baixo de cada cabeçalho: num para números, cat para grupos.',
        'Passe a ANÁLISE, procure «Teste t», preencha o painel Configuração e prima Executar análise.',
        'Leia o relatório de leitura que encerra cada execução e descarregue o relatório HTML a partir da barra de saída.',
      ],
      expected: 'Na saída aparecem tabelas, eventuais gráficos e um comentário em linguagem simples; voltar a executar nunca substitui o cartão anterior.',
    },
    advanced: {
      whenToUse: [
        'Quando quer um único fluxo para dados, cálculo e relatório, sem passar ficheiros entre programas.',
        'Quando precisa de um resultado reproduzível: os dados e os parâmetros ficam dentro do projeto .lzs.',
      ],
      reading: [
        'Os cartões de saída são instantâneos: ficam como foram produzidos mesmo que os dados mudem depois.',
        'A etiqueta «desatualizado» significa que a grelha mudou depois de esse resultado ter sido produzido.',
      ],
      pitfalls: [
        'Nunca edite números no relatório: corrija os dados e volte a executar.',
        'Guarde o projeto antes de experiências longas: a gravação automática vive no navegador.',
      ],
      glossary: [
        { term: 'Procedimento', definition: 'Uma única análise estatística, por exemplo o teste t.' },
        { term: 'Cartão de resultado', definition: 'O bloco que contém tabelas, gráficos e o relatório de uma execução.' },
      ],
    },
    seeAlso: ['data-import', 'analysis-workflow', 'output-console'],
  },
  {
    id: 'data-import',
    area: 'data',
    title: 'Importar ficheiros CSV, TSV, Excel, SPSS e Stata',
    summary: 'Trazer dados para dentro sem estragar números e categorias.',
    tutorial: {
      goal: 'Importar um ficheiro com decimais por vírgula e grupos textuais.',
      dataset: 'score-groups.csv',
      steps: [
        'Em DADOS prima Importar e escolha o ficheiro: CSV, TSV, TXT, JSON, Excel (.xlsx) e SPSS/Stata (.sav/.dta); a pré-visualização mostra as primeiras linhas.',
        'Verifique o delimitador detetado (vírgula, ponto e vírgula, tabulador) e o separador decimal.',
        'Indique se a primeira linha é o cabeçalho e escolha Aplicar como = Substituir a grelha.',
        'Prima Importar e leia quantas linhas e colunas entraram.',
      ],
      expected: 'A grelha mostra uma coluna por variável e uma linha por observação, com tipos de coluna sensatos.',
    },
    advanced: {
      assumptions: [
        'Cada linha é uma observação completa; as variáveis são colunas.',
        'Os códigos de omissão têm de ser declarados depois da importação (por exemplo -9, NA).',
      ],
      whenToUse: [
        'Ficheiros exportados de Excel, R, SPSS ou de um inquérito online.',
        'Vários ficheiros com as mesmas colunas para empilhar verticalmente (Acrescentar linhas).',
      ],
      whenNotToUse: ['Dados não organizados como uma linha por caso: reformule-os primeiro.'],
      reading: [
        '«linhas e colunas importadas» confirma a dimensão; «cabeçalhos duplicados renomeados» assinala nomes repetidos.',
        '«BOM removido» é normal em ficheiros guardados pelo Excel.',
      ],
      pitfalls: [
        'Um separador decimal errado transforma números em texto: verifique o tipo depois de importar.',
        'As células vazias são sempre omissas; não é preciso nenhum código especial.',
      ],
      glossary: [
        { term: 'Delimitador', definition: 'O caráter que separa as colunas num ficheiro de texto.' },
        { term: 'Código de omissão', definition: 'Um valor convencional, como -9, que tem de ser lido como ausente.' },
      ],
    },
    seeAlso: ['data-editor', 'data-clean', 'projects'],
  },
  {
    id: 'data-editor',
    area: 'data',
    title: 'Editar dados na grelha',
    summary: 'Tipos de coluna, validação, anulação e preenchimento rápido.',
    tutorial: {
      goal: 'Corrigir um valor e converter uma coluna de texto em números.',
      dataset: 'score-groups.csv',
      steps: [
        'Faça duplo clique numa célula e escreva o novo valor; Enter confirma e desce.',
        'Mude o tipo na lista pendente por baixo do cabeçalho (num, int, cat, str).',
        'Prima Validar para listar as células inválidas; a Correção automática tenta a conversão.',
        'Use Ctrl+Z para anular e Ctrl+Y para refazer; selecione um intervalo e prima Ctrl+D para preencher para baixo.',
      ],
      expected: 'A célula mostra o novo valor, a barra de estado atualiza a contagem de inválidos e a anulação repõe o estado anterior.',
    },
    advanced: {
      whenToUse: [
        'Correções pequenas ou sistemáticas antes de uma análise.',
        'Adicionar colunas calculadas com uma fórmula (por exemplo Score_Post - Score_Pre).',
      ],
      reading: [
        'O tipo de coluna determina a validação, a Correção automática e a exportação para Excel; as análises continuam a inferir números a partir dos valores.',
        'O inspetor de variáveis mostra valores omissos, valores distintos e funções.',
      ],
      pitfalls: [
        'Renomear uma coluna atualiza as fórmulas, mas os parâmetros de análise que a usam têm de ser selecionados de novo.',
        'Ordenar a grelha altera a ordem das linhas: as análises emparelhadas dependem dessa ordem.',
      ],
      glossary: [
        { term: 'Validação', definition: 'Verificar que cada célula é compatível com o tipo declarado.' },
        { term: 'Coluna calculada', definition: 'Uma coluna cujo valor é uma fórmula, recalculada a cada edição.' },
      ],
    },
    seeAlso: ['data-import', 'data-clean', 'levels'],
  },
  {
    id: 'data-clean',
    area: 'data',
    title: 'Limpar e transformar dados',
    summary: 'Localizar e substituir, valores omissos, linhas vazias e duplicados.',
    tutorial: {
      goal: 'Unificar uma etiqueta escrita de várias formas e preencher células vazias com a média.',
      dataset: 'score-groups.csv',
      steps: [
        'Prima Limpar e abra Localizar / Substituir; escolha uma coluna ou Todas as colunas.',
        'Escreva o texto a localizar e a substituição e prima Aplicar.',
        'Na secção Omissos escolha Média e prima Preencher para a coluna numérica.',
        'Em Arrumar remova as linhas vazias e os duplicados um de cada vez, lendo a mensagem de resultado.',
      ],
      expected: 'Uma mensagem indica quantas substituições ou células mudaram; todas as operações podem ser anuladas com Ctrl+Z.',
    },
    advanced: {
      whenToUse: [
        'Antes de qualquer análise, para evitar categorias duplicadas (Sim/sim, SI/si).',
        'Para eliminar linhas que são cópias exatas e inflacionam as contagens.',
      ],
      whenNotToUse: ['Não impute pela média quando há muitos valores omissos ou não aleatórios: considere a imputação múltipla.'],
      reading: [
        '«Sem correspondências» significa que o texto não existe, não que a operação falhou.',
        '«células preenchidas com» indica o valor usado na imputação.',
      ],
      pitfalls: [
        'A substituição por regex é poderosa: teste-a primeiro numa só coluna.',
        'A imputação pela média reduz a variabilidade e subestima os erros padrão.',
      ],
      glossary: [
        { term: 'Imputação simples', definition: 'Substituir um valor omisso pela média, mediana, moda ou uma constante.' },
        { term: 'Duplicado', definition: 'Uma linha idêntica a outra em todas as colunas.' },
      ],
    },
    seeAlso: ['data-editor', 'levels', 'mi'],
  },
  {
    id: 'levels',
    area: 'data',
    title: 'Níveis e etiquetas dos grupos',
    summary: 'Dar nomes legíveis aos códigos, escolher a ordem e o nível de referência.',
    tutorial: {
      goal: 'Mostrar «Tratamento» e «Controlo» em vez de 1 e 0 nas tabelas.',
      dataset: 'score-groups.csv',
      steps: [
        'Abra o menu da coluna de grupo e escolha Editar níveis.',
        'Escreva uma etiqueta ao lado de cada código e ordene-os com as setas.',
        'Marque o grupo que quer como referência do modelo.',
        'Prima Aplicar níveis e volte a executar a análise.',
      ],
      expected: 'As tabelas, os gráficos e os relatórios usam as etiquetas; as análises baseadas em modelos comparam com a referência.',
    },
    advanced: {
      whenToUse: [
        'Sempre que um grupo tiver códigos numéricos pouco claros.',
        'Em modelos com intercepto: a referência decide como se leem os coeficientes.',
      ],
      reading: [
        'O código fica nas células; a etiqueta é apenas apresentação.',
        'As células com valores fora da lista aparecem como «não consta da lista» e permanecem nos dados.',
      ],
      pitfalls: [
        'Remover um nível nunca elimina observações: só muda a forma como são apresentadas.',
        'Mudar a referência altera os coeficientes, não a qualidade do modelo.',
      ],
      glossary: [
        { term: 'Nível de referência', definition: 'A categoria com que os outros grupos são comparados no modelo.' },
        { term: 'Codificação por tratamento', definition: 'Um esquema em que cada grupo é comparado com a referência.' },
      ],
    },
    seeAlso: ['data-editor', 'anova', 'regression'],
  },
  {
    id: 'analysis-workflow',
    area: 'analysis',
    title: 'Escolher e executar uma análise',
    summary: 'Biblioteca, pesquisa, painel de configuração, nível de confiança e reexecuções.',
    tutorial: {
      goal: 'Encontrar o procedimento certo e obter um resultado completo.',
      dataset: 'score-groups.csv',
      steps: [
        'Abra ANÁLISE: a biblioteca lista os procedimentos por família.',
        'Escreva o nome do teste ou o problema na caixa de pesquisa (por exemplo «comparar dois grupos»).',
        'Selecione o procedimento: o painel Configuração mostra apenas os parâmetros de que precisa.',
        'Escolha as variáveis, defina o nível de confiança e prima Executar análise (Ctrl/⌘+Enter).',
        'Use Em direto para voltar a executar automaticamente quando os dados ou os parâmetros mudarem.',
      ],
      expected: 'Um novo cartão é acrescentado à saída; o anterior fica para comparação.',
    },
    advanced: {
      whenToUse: [
        'Sempre: é o único caminho para tabelas, gráficos e relatório escrito.',
        'Em direto é prático durante a exploração, mas deve estar desligado em procedimentos pesados.',
      ],
      reading: [
        'A etiqueta «pesada» assinala os procedimentos a executar explicitamente.',
        'Se uma coluna mudou, o procedimento pede para voltar a selecionar as variáveis afetadas.',
      ],
      pitfalls: [
        'Mudar o nível de confiança não altera os dados, mas altera todas as estimativas.',
        'Reexecutar sem alterações cria cartões duplicados: use Aplicar para reutilizar os parâmetros.',
      ],
      glossary: [
        { term: 'Nível de confiança', definition: 'A cobertura dos intervalos: 95% é a escolha habitual.' },
        { term: 'Instantâneo', definition: 'Uma cópia estática de um resultado, independente de dados posteriores.' },
      ],
    },
    seeAlso: ['choosing-test', 'output-console', 'start-tour'],
  },
  {
    id: 'choosing-test',
    area: 'analysis',
    title: 'Que teste devo usar?',
    summary: 'Um mapa rápido da pergunta ao procedimento, mais o assistente guiado.',
    tutorial: {
      goal: 'Escolher um procedimento a partir do tipo de pergunta e de dados.',
      dataset: 'score-groups.csv',
      steps: [
        'Abra o procedimento guiado (família Guiado).',
        'Escolha a pergunta: descrever, comparar grupos ou prever um resultado.',
        'Defina o resultado, os grupos e se as medidas são independentes ou emparelhadas.',
        'Leia a recomendação e prima Abrir para carregar o procedimento com os parâmetros prontos.',
      ],
      expected: 'O procedimento sugerido abre no painel com as variáveis já selecionadas; só tem de o executar.',
    },
    advanced: {
      whenToUse: ['No início, quando não quer escolher a família errada.'],
      reading: [
        'Resultado numérico + 2 grupos independentes → teste t ou Mann-Whitney; mais grupos → ANOVA ou Kruskal-Wallis.',
        'Resultado numérico + medidas emparelhadas → teste t emparelhado ou Wilcoxon.',
        'Resultado binário → logística ou qui-quadrado; tempo até um evento → sobrevivência.',
      ],
      pitfalls: [
        'A recomendação nunca verifica os pressupostos: confirme a normalidade, a independência e a dimensão da amostra.',
        'Com poucos casos, os testes não paramétricos são muitas vezes a melhor escolha.',
      ],
      glossary: [
        { term: 'Emparelhado', definition: 'Medidas repetidas na mesma unidade (antes/depois).' },
        { term: 'Não paramétrico', definition: 'Um teste que não assume uma forma de distribuição específica.' },
      ],
    },
    seeAlso: ['analysis-workflow', 'ttest', 'nonparamrm'],
  },
  {
    id: 'output-console',
    area: 'output',
    title: 'Ler e exportar resultados',
    summary: 'Cartões, estrutura, cópia, gráficos PNG, relatórios HTML/Word e livros Excel.',
    tutorial: {
      goal: 'Levar os resultados num formato que possa usar.',
      dataset: 'score-groups.csv',
      steps: [
        'Execute uma análise e veja o cartão: primeiro as tabelas, depois o relatório de leitura, depois os gráficos editáveis.',
        'Clique num gráfico para abrir o editor: altere o tema, as cores e as opções do procedimento e prima Concluído.',
        'Abra a Estrutura para saltar para um cartão ou reduzi-lo com a seta.',
        'Prima Relatório para descarregar um ficheiro HTML para impressão, ou Word para um ficheiro editável.',
        'Use XLSX para obter os dados e as tabelas num livro; Gráficos descarrega os ficheiros PNG.',
      ],
      expected: 'Os ficheiros descarregados contêm os mesmos números apresentados no ecrã, com títulos e cabeçalhos coerentes.',
    },
    advanced: {
      whenToUse: [
        'Para partilhar um resultado com alguém que não usa o programa.',
        'Para arquivar uma versão congelada de uma análise.',
      ],
      reading: [
        '«desatualizado» significa que os dados mudaram depois da execução: volte a executar antes de exportar.',
        'Os gráficos continuam editáveis após recarregar; os cartões guardados com o motor antigo são estáticos: volte a executá-los para obter um gráfico editável.',
        'Definições → Gráficos define o estilo predefinido dos gráficos futuros; os cartões existentes não mudam.',
      ],
      pitfalls: [
        'Exportar um cartão desatualizado produz um relatório formalmente correto mas desatualizado.',
        'O filtro de linhas «só na vista» não altera os números usados pelas análises.',
      ],
      glossary: [
        { term: 'Relatório de leitura', definition: 'O comentário em linguagem simples que encerra cada análise.' },
        { term: 'Livro', definition: 'O ficheiro .xlsx com várias folhas, uma por tabela.' },
      ],
    },
    seeAlso: ['analysis-workflow', 'projects'],
  },
  {
    id: 'projects',
    area: 'output',
    title: 'Guardar e reabrir um projeto',
    summary: 'Ficheiros .lzs, gravação automática e como restaurar uma cópia de segurança.',
    tutorial: {
      goal: 'Manter dados, definições e parâmetros para retomar amanhã.',
      dataset: 'score-groups.csv',
      steps: [
        'Em DADOS prima Guardar projeto e dê um nome ao ficheiro .lzs.',
        'Recarregue a página: a gravação automática restaura a sessão a partir do navegador.',
        'Prima Abrir projeto e escolha o ficheiro para substituir a sessão atual.',
        'Em Definições pode restaurar uma cópia de segurança IndexedDB se a gravação automática tiver falhado.',
      ],
      expected: 'Depois de abrir, encontra novamente a grelha, os níveis, os parâmetros e os cartões de saída guardados.',
    },
    advanced: {
      whenToUse: [
        'Antes de mudar de conjunto de dados ou de tentar experiências arriscadas.',
        'Para partilhar um caso com um colega, juntamente com dados e parâmetros.',
      ],
      reading: [
        'O projeto também guarda instantâneos da saída: legíveis mas não recalculáveis.',
        'Os campos acrescentados em versões mais recentes são opcionais: os ficheiros antigos abrem com os valores predefinidos.',
      ],
      pitfalls: [
        'A gravação automática vive no navegador: limpar os dados do site elimina-a.',
        'Um ficheiro .lzs não é uma cópia de segurança dos dados originais: guarde também o CSV de origem.',
      ],
      glossary: [
        { term: '.lzs', definition: 'O formato do projeto: JSON com dados, definições e parâmetros.' },
        { term: 'Cópia de segurança IndexedDB', definition: 'Uma cópia local de segurança usada pela gravação automática.' },
      ],
    },
    seeAlso: ['data-import', 'output-console'],
  },
];
