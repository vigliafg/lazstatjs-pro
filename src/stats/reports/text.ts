import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { TextResult } from '../w9Results';
import type { ReportSpec } from '../report';

export const textReport = (result: TextResult): ReportSpec => {
  const top = result.terms[0];
  const topic = result.topics[0];
  const heading =
    result.mode === 'topics'
      ? copy('Argomenti')
      : result.mode === 'similarity'
        ? copy('Similarità')
        : copy('Frequenze e TF-IDF');
  return {
    id: 'text',
    title: copy('Report di lettura — Text mining'),
    headline:
      result.mode === 'topics' && topic
        ? copy('{s1} documenti, {s2} termini: l’argomento 1 pesa il {s3}%.', {
            s1: result.documents,
            s2: result.vocabulary,
            s3: fmtEst(100 * topic.prevalence, 1),
          })
        : top
          ? copy('{s1} documenti, {s2} termini: il termine più frequente è “{s3}”.', {
              s1: result.documents,
              s2: result.vocabulary,
              s3: top.term,
            })
          : copy('Nessun termine disponibile.'),
    badge: copy('{s1} gettoni', { s1: result.totalTokens }),
    tone: 'neutral',
    intro: [
      copy('Il testo è stato normalizzato in minuscolo, privato della punteggiatura e diviso in gettoni; le stopword sono state rimosse se richiesto.'),
      copy('La matrice termine-documento conta quante volte ogni termine compare in ciascun documento; il TF-IDF riduce il peso dei termini presenti ovunque.'),
    ],
    sections: [
      {
        heading: copy('Corpus'),
        bullets: [
          copy('Documenti: {s1}.', { s1: result.documents }),
          copy('Vocabolario: {s1} termini.', { s1: result.vocabulary }),
          copy('Lunghezza media: {s1} gettoni per documento.', {
            s1: fmtEst(result.averageLength, 1),
          }),
        ],
      },
      {
        heading,
        body:
          result.mode === 'topics'
            ? [
                copy('Il modello LDA (latent Dirichlet allocation) stima argomenti come distribuzioni di termini e pesi per documento.'),
                copy('La perplessità del corpus è {s1}: valori più bassi indicano un modello che descrive meglio i testi.', {
                  s1: fmtEst(result.perplexity ?? NaN, 1),
                }),
                copy('I pesi dei documenti sono normalizzati a uno: indicano la mescolanza di argomenti, non il numero di parole.'),
              ]
            : result.mode === 'similarity'
              ? [
                  copy('La similarità è il coseno tra vettori TF-IDF: 1 significa documenti identici in vocabolario e pesi, 0 nessuna sovrapposizione.'),
                  copy('Valori alti tra documenti brevi sono comuni: confronta anche la lunghezza e il numero di termini condivisi.'),
                ]
              : [
                  copy('Le frequenze grezze sono dominanti nei documenti lunghi: il TF-IDF e la similarità aiutano a correggere questa asimmetria.'),
                  copy('Termini rari ma discriminanti possono essere esclusi dalla soglia di frequenza minima: controlla il vocabolario prima di interpretare.'),
                ],
      },
      {
        heading: copy('Limiti'),
        body: [
          copy('La tokenizzazione non riconosce lemmi, negazioni o entità: “non buono” e “buono” restano termini diversi o vicini a seconda del contesto.'),
          copy('Il modello di argomenti è esplorativo: il numero di argomenti va scelto e confrontato, non accettato come verità.'),
          copy('Il testo è trattato come una borsa di parole: l’ordine e la sintassi non entrano nel modello.'),
        ],
      },
    ],
    limitations: [
      copy('I risultati dipendono dalla lingua, dalle stopword e dalla pulizia del testo: documenta la pipeline prima di confrontare corpus diversi.'),
    ],
  };
};
