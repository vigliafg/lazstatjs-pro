import { fmtEst, fmtP } from '../format';
import { isDecided, show } from '../reportKit';
import { alphaOf } from '../reportKit';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';

export const repeatedAnovaReport = (
  tables: TableSpec[],
  names: string[],
  level: number
): ReportSpec => {
  const aov = tables.find((table) => table.id === 'rm-anova')?.rows ?? [];
  const sphericity = tables.find((table) => table.id === 'rm-sphericity')?.rows ?? [];
  const p = Number(aov[0]?.p ?? NaN);
  const f = Number(aov[0]?.f ?? NaN);
  const etaP = Number(aov[0]?.etaP ?? NaN);
  const mauchlyP = Number(sphericity.find((row) => row.metric === 'Mauchly p')?.value ?? NaN);
  const gg = Number(sphericity.find((row) => String(row.metric).startsWith('ε Greenhouse'))?.value ?? NaN);
  const pGG = Number(sphericity.find((row) => row.metric === 'p GG')?.value ?? NaN);
  const pHF = Number(sphericity.find((row) => row.metric === 'p HF')?.value ?? NaN);
  const violated = Number.isFinite(mauchlyP) && mauchlyP < alphaOf(level);
  // When sphericity fails, the decision must follow the corrected p-value.
  const decidedP = violated && Number.isFinite(pGG) ? pGG : p;
  const decided = isDecided(decidedP, level);
  const effect = etaP < 0.01 ? 'trascurabile' : etaP < 0.06 ? 'piccola' : etaP < 0.14 ? 'media' : 'grande';

  return {
    id: 'rm-anova',
    title: 'Report di lettura',
    headline: decided
      ? `Le condizioni differiscono (F = ${show(f, 3)}, p = ${fmtP(decidedP)}${violated ? ' corretto GG' : ''}).`
      : `Nessuna differenza tra le condizioni (F = ${show(f, 3)}, p = ${fmtP(decidedP)}${violated ? ' corretto GG' : ''}).`,
    badge: violated ? 'Sfericità violata' : decided ? 'Differenza rilevata' : 'Nessuna differenza',
    tone: violated ? 'caution' : decided ? 'positive' : 'neutral',
    intro: [
      'L’ANOVA a misure ripetute confronta k condizioni misurate sulle stesse unità, separando la variabilità tra condizioni da quella tra soggetti.',
      `Le condizioni confrontate sono ${names.join(', ')}.`,
    ],
    sections: [
      {
        heading: 'La lettura dei risultati',
        body: [
          `F(${aov[0]?.df ?? '—'}, ${aov[2]?.df ?? '—'}) = ${show(f, 3)}, p${violated ? ' corretto GG' : ''} = ${fmtP(decidedP)}: ${decided ? 'rifiuta l’ipotesi che le medie delle condizioni siano uguali.' : 'non rifiuta l’ipotesi di uguali medie.'}`,
          `η²p = ${show(etaP, 3)}: effetto ${effect}. η²G = ${show(Number(sphericity.find((row) => row.metric === 'η² generalizzato')?.value ?? NaN), 3)}.`,
        ],
      },
      {
        heading: 'Sfericità',
        body: [
          violated
            ? `Mauchly p = ${fmtP(mauchlyP)}: l’assunzione di sfericità è violata. Usa il p corretto Greenhouse–Geisser (${fmtP(pGG)}, ε = ${show(gg, 3)}) o Huynh–Feldt (${fmtP(pHF)}).`
            : `Mauchly p = ${fmtP(mauchlyP)}: non ci sono prove di violazione; il p non corretto è utilizzabile.`,
        ],
      },
      {
        heading: 'Assunzioni e cautele',
        bullets: [
          'Le righe incomplete vengono escluse: ogni soggetto deve avere tutte le k misure.',
          'La sfericità riguarda le differenze tra tutte le coppie di condizioni, non le varianze delle singole condizioni.',
          'Con pochi soggetti Mauchly è poco potente: considera comunque le correzioni se ε è basso.',
          'L’ANOVA within non dice quali condizioni differiscano: servono confronti post-hoc.',
        ],
      },
    ],
    limitations: [
      'Non sono inclusi disegni misti, più fattori within o covariate.',
      'Le correzioni GG/HF modificano i gradi di libertà ma non le medie: gli effetti descrittivi restano invariati.',
    ],
  };
};
