import { fmtEst, fmtP } from '../format';
import { copy, sourceOf } from '../reportCopy';
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
  const mauchlyP = Number(sphericity.find((row) => sourceOf(String(row.metric)) === copy('Mauchly p'))?.value ?? NaN);
  const gg = Number(sphericity.find((row) => sourceOf(String(row.metric)).startsWith(sourceOf(copy('ε Greenhouse'))))?.value ?? NaN);
  const pGG = Number(sphericity.find((row) => sourceOf(String(row.metric)) === 'p GG')?.value ?? NaN);
  const pHF = Number(sphericity.find((row) => sourceOf(String(row.metric)) === 'p HF')?.value ?? NaN);
  const violated = Number.isFinite(mauchlyP) && mauchlyP < alphaOf(level);
  // When sphericity fails, the decision must follow the corrected p-value.
  const decidedP = violated && Number.isFinite(pGG) ? pGG : p;
  const decided = isDecided(decidedP, level);
  const effect = etaP < 0.01 ? 'trascurabile' : etaP < 0.06 ? 'piccola' : etaP < 0.14 ? 'media' : 'grande';

  return {
    id: 'rm-anova',
    title: copy('Report di lettura'),
    headline: decided
      ? copy('Le condizioni differiscono (F = {s1}, p = {s2}{s3}).', { s1: show(f, 3), s2: fmtP(decidedP), s3: violated ? copy(' corretto GG') : '' })
      : copy('Nessuna differenza tra le condizioni (F = {s1}, p = {s2}{s3}).', { s1: show(f, 3), s2: fmtP(decidedP), s3: violated ? copy(' corretto GG') : '' }),
    badge: violated ? copy('Sfericità violata') : decided ? copy('Differenza rilevata') : copy('Nessuna differenza'),
    tone: violated ? 'caution' : decided ? 'positive' : 'neutral',
    intro: [
      copy('L’ANOVA a misure ripetute confronta k condizioni misurate sulle stesse unità, separando la variabilità tra condizioni da quella tra soggetti.'),
      copy('Le condizioni confrontate sono {s1}.', { s1: names.join(', ') }),
    ],
    sections: [
      {
        heading: copy('La lettura dei risultati'),
        body: [
          copy('F({s1}, {s2}) = {s3}, p{s4} = {s5}: {s6}', { s1: aov[0]?.df ?? '—', s2: aov[2]?.df ?? '—', s3: show(f, 3), s4: violated ? copy(' corretto GG') : '', s5: fmtP(decidedP), s6: decided ? copy('rifiuta l’ipotesi che le medie delle condizioni siano uguali.') : copy('non rifiuta l’ipotesi di uguali medie.') }),
          copy('η²p = {s1}: effetto {s2}. η²G = {s3}.', { s1: show(etaP, 3), s2: effect, s3: show(Number(sphericity.find((row) => sourceOf(String(row.metric)) === copy('η² generalizzato'))?.value ?? NaN), 3) }),
        ],
      },
      {
        heading: 'Sfericità',
        body: [
          violated
            ? copy('Mauchly p = {s1}: l’assunzione di sfericità è violata. Usa il p corretto Greenhouse–Geisser ({s2}, ε = {s3}) o Huynh–Feldt ({s4}).', { s1: fmtP(mauchlyP), s2: fmtP(pGG), s3: show(gg, 3), s4: fmtP(pHF) })
            : copy('Mauchly p = {s1}: non ci sono prove di violazione; il p non corretto è utilizzabile.', { s1: fmtP(mauchlyP) }),
        ],
      },
      {
        heading: copy('Assunzioni e cautele'),
        bullets: [
          copy('Le righe incomplete vengono escluse: ogni soggetto deve avere tutte le k misure.'),
          copy('La sfericità riguarda le differenze tra tutte le coppie di condizioni, non le varianze delle singole condizioni.'),
          copy('Con pochi soggetti Mauchly è poco potente: considera comunque le correzioni se ε è basso.'),
          copy('L’ANOVA within non dice quali condizioni differiscano: servono confronti post-hoc.'),
        ],
      },
    ],
    limitations: [
      copy('Non sono inclusi disegni misti, più fattori within o covariate.'),
      copy('Le correzioni GG/HF modificano i gradi di libertà ma non le medie: gli effetti descrittivi restano invariati.'),
    ],
  };
};
