import { fmtP, interpretEta } from '../format';
import { copy, sourceOf } from '../reportCopy';
import { isDecided, show } from '../reportKit';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';

export const ancovaReport = (
  tables: TableSpec[],
  factorName: string,
  covariateNames: string[],
  level: number
): ReportSpec => {
  const model = tables.find((table) => table.id === 'ancova-model')?.rows ?? [];
  const means = tables.find((table) => table.id === 'ancova-means')?.rows ?? [];
  const slopes = tables.find((table) => table.id === 'ancova-slopes')?.rows ?? [];
  const posthoc = tables.find((table) => table.id === 'ancova-posthoc')?.rows ?? [];
  const factorRow = model[0] ?? {};
  const p = Number(factorRow.p ?? NaN);
  const f = Number(factorRow.f ?? NaN);
  const eta = Number(factorRow.etaP ?? NaN);
  const slopesP = Number(slopes.find((row) => sourceOf(String(row.metric)) === copy('p interazione'))?.value ?? NaN);
  const violated = Number.isFinite(slopesP) && slopesP < 1 - level / 100;
  const decided = isDecided(p, level);
  const significantPairs = posthoc.filter((row) => Number(row.pHolm) < 1 - level / 100);

  const biggest = means.reduce(
    (best, row, index) => {
      const value = Number(row.adjusted ?? NaN);
      if (!Number.isFinite(value)) return best;
      if (!best || Math.abs(value) > Math.abs(Number(best.value))) return { value, label: String(row.group), index };
      return best;
    },
    null as null | { value: number; label: string; index: number }
  );

  const covariateText = covariateNames.length === 1 ? covariateNames[0] : copy('{s1} covariate', { s1: covariateNames.length });
  const covariateRows = model.filter((row) => covariateNames.includes(String(row.source)));

  return {
    id: 'ancova',
    title: copy('Report di lettura'),
    headline: violated
      ? copy('Le pendenze differiscono tra i gruppi: l’ANCOVA classica non è affidabile.')
      : decided
        ? copy('Il fattore {s1} ha un effetto dopo l’aggiustamento per {s2} (F = {s3}, p = {s4}).', { s1: factorName, s2: covariateText, s3: show(f, 3), s4: fmtP(p) })
        : copy('Nessun effetto del fattore {s1} dopo l’aggiustamento per {s2} (F = {s3}, p = {s4}).', { s1: factorName, s2: covariateText, s3: show(f, 3), s4: fmtP(p) }),
    badge: violated ? copy('Pendenze non omogenee') : decided ? copy('Effetto del fattore') : copy('Nessun effetto'),
    tone: violated ? 'caution' : decided ? 'positive' : 'neutral',
    intro: [
      copy('L’ANCOVA confronta le medie dei gruppi dopo aver rimosso la parte di variabilità spiegata da una o più covariate continue.'),
      copy('Modello: {s1} + {s2}. Le medie aggiustate sono valutate al valore medio delle covariate.', { s1: factorName, s2: covariateNames.join(' + ') }),
    ],
    sections: [
      {
        heading: copy('La lettura dei risultati'),
        body: [
          copy('Fattore {s1}: F({s2}, {s3}) = {s4}, p = {s5}; η²p = {s6} ({s7}).', { s1: factorName, s2: factorRow.df ?? '—', s3: model.find((row) => row.source === 'Residuo')?.df ?? '—', s4: show(f, 3), s5: fmtP(p), s6: show(eta, 3), s7: interpretEta(eta) }),
          biggest
            ? copy('La media aggiustata più alta è quella di {s1} ({s2}); la media grezza dello stesso gruppo era {s3}.', { s1: biggest.label, s2: show(Number(biggest.value), 3), s3: show(Number(means[biggest.index]?.rawMean ?? NaN), 3) })
            : copy('Medie aggiustate non disponibili.'),
          covariateRows.length > 0
            ? copy('Covariate: {s1}.', { s1: covariateRows
                .map((row) => copy('{s1} (F = {s2}, p = {s3})', { s1: row.source, s2: show(Number(row.f), 3), s3: fmtP(Number(row.p)) }))
                .join('; ') })
            : copy('Nessuna covariata nel modello.'),
        ],
      },
      {
        heading: 'Assunzioni',
        body: [
          Number.isFinite(slopesP)
            ? copy('Omogeneità delle pendenze: F({s1}, {s2}) = {s3}, p = {s4}. {s5}', { s1: slopes.find((row) => sourceOf(String(row.metric)) === copy('df numeratore'))?.value ?? '—', s2: slopes.find((row) => sourceOf(String(row.metric)) === copy('df denominatore'))?.value ?? '—', s3: show(Number(slopes.find((row) => sourceOf(String(row.metric)) === copy('F interazione'))?.value), 3), s4: fmtP(slopesP), s5: 
                violated
                  ? copy('L’ipotesi è violata: riporta il modello con interazione o analizza i gruppi separatamente.')
                  : copy('Non ci sono prove che le pendenze differiscano tra i gruppi.')
               })
            : copy('Il test di omogeneità delle pendenze non è calcolabile (troppi pochi gradi di libertà).'),
          copy('Restano richiesti indipendenza delle osservazioni, linearità della relazione con le covariate e normalità/omoschedasticità dei residui.'),
        ],
      },
      {
        heading: copy('Confronti tra gruppi'),
        body: [
          posthoc.length === 0
            ? copy('Nessun confronto a coppie disponibile.')
            : significantPairs.length > 0
              ? copy('Con correzione Holm risultano significativi: {s1}.', { s1: significantPairs
                  .map((row) => copy('{s1} (Δ = {s2}, p = {s3})', { s1: row.contrast, s2: show(Number(row.difference), 3), s3: fmtP(Number(row.pHolm)) }))
                  .join('; ') })
              : copy('Nessun confronto a coppie resta significativo dopo la correzione di Holm.'),
          copy('Le differenze sono calcolate sulle medie aggiustate, non sulle medie grezze.'),
        ],
      },
      {
        heading: 'Cautele',
        bullets: [
          copy('Le covariate devono essere misurate prima del trattamento e non essere influenzate dal fattore.'),
          copy('Una covariata con forte errore di misura attenua l’aggiustamento e può ridurre la potenza.'),
          copy('Le medie aggiustate dipendono dal valore medio delle covariate: con covariate molto sbilanciate l’estrapolazione può essere fragile.'),
          copy('L’ANCOVA non crea gruppi equivalenti: rimuove solo la parte di differenza lineare associata alle covariate osservate.'),
        ],
      },
    ],
    limitations: [
      copy('Un solo fattore categorico: per disegni fattoriali con covariate serve un modello più generale.'),
      copy('Nessuna selezione automatica del modello: tutte le covariate scelte restano nel modello.'),
      copy('SS tipo III con codifica treatment: con interazioni il significato dei termini cambia.'),
    ],
  };
};
