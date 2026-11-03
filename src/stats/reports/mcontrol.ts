import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { ReportSpec } from '../report';
import type { MultiControlResult } from '../analysisResults';

export const mcontrolReport = (result: MultiControlResult): ReportSpec => {
  const stable = result.outCount === 0;
  return {
    id: 'quality-mcontrol',
    title: copy('Report di lettura — Carta T²'),
    headline: stable
      ? copy('Nessun sottogruppo oltre il limite: il processo è stabile sul piano multivariato.')
      : copy('{s1} sottogruppi oltre il limite: il processo mostra segnali multivariati.', {
          s1: result.outCount,
        }),
    badge: `T² · ${result.variables.length} ${copy('variabili')}`,
    tone: stable ? 'positive' : 'caution',
    intro: [
      copy('La carta T² di Hotelling sorveglia insieme più variabili e segnala quando la combinazione esce dalla variabilità normale, anche se ogni variabile da sola sembra sotto controllo.'),
      copy('La distanza è misurata con la covarianza tra le variabili: due misure correlate non vanno controllate con due carte separate.'),
    ],
    sections: [
      {
        heading: copy('Limiti e punti'),
        bullets: [
          copy('Variabili: {s1}.', { s1: result.variables.join(', ') }),
          copy('Sottogruppi: {s1} da {s2} osservazioni ciascuno.', {
            s1: result.groups,
            s2: result.subgroup,
          }),
          copy('Limite superiore = {s1}; punti oltre il limite = {s2}.', {
            s1: fmtEst(result.ucl, 4),
            s2: result.outCount,
          }),
        ],
      },
      {
        heading: copy('Come leggerla'),
        body: [
          copy('Un punto alto dice che la combinazione delle variabili è insolita, non quale variabile ha causato il segnale: per quello servono i contributi e l’indagine sul processo.'),
          copy('I limiti della fase I si stimano dai dati storici; con pochi sottogruppi sono instabili e vanno ricalcolati quando il processo cambia.'),
        ],
      },
    ],
    limitations: [
      copy('La carta assume osservazioni indipendenti e distribuzione approssimativamente normale; con dati molto asimmetrici o autocorrelati i limiti F non sono esatti.'),
    ],
  };
};
