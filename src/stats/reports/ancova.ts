import { fmtP, interpretEta } from '../format';
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
  const slopesP = Number(slopes.find((row) => row.metric === 'p interazione')?.value ?? NaN);
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

  const covariateText = covariateNames.length === 1 ? covariateNames[0] : `${covariateNames.length} covariate`;
  const covariateRows = model.filter((row) => covariateNames.includes(String(row.source)));

  return {
    id: 'ancova',
    title: 'Report di lettura',
    headline: violated
      ? 'Le pendenze differiscono tra i gruppi: l’ANCOVA classica non è affidabile.'
      : decided
        ? `Il fattore ${factorName} ha un effetto dopo l’aggiustamento per ${covariateText} (F = ${show(f, 3)}, p = ${fmtP(p)}).`
        : `Nessun effetto del fattore ${factorName} dopo l’aggiustamento per ${covariateText} (F = ${show(f, 3)}, p = ${fmtP(p)}).`,
    badge: violated ? 'Pendenze non omogenee' : decided ? 'Effetto del fattore' : 'Nessun effetto',
    tone: violated ? 'caution' : decided ? 'positive' : 'neutral',
    intro: [
      'L’ANCOVA confronta le medie dei gruppi dopo aver rimosso la parte di variabilità spiegata da una o più covariate continue.',
      `Modello: ${factorName} + ${covariateNames.join(' + ')}. Le medie aggiustate sono valutate al valore medio delle covariate.`,
    ],
    sections: [
      {
        heading: 'La lettura dei risultati',
        body: [
          `Fattore ${factorName}: F(${factorRow.df ?? '—'}, ${model.find((row) => row.source === 'Residuo')?.df ?? '—'}) = ${show(f, 3)}, p = ${fmtP(p)}; η²p = ${show(eta, 3)} (${interpretEta(eta)}).`,
          biggest
            ? `La media aggiustata più alta è quella di ${biggest.label} (${show(Number(biggest.value), 3)}); la media grezza dello stesso gruppo era ${show(Number(means[biggest.index]?.rawMean ?? NaN), 3)}.`
            : 'Medie aggiustate non disponibili.',
          covariateRows.length > 0
            ? `Covariate: ${covariateRows
                .map((row) => `${row.source} (F = ${show(Number(row.f), 3)}, p = ${fmtP(Number(row.p))})`)
                .join('; ')}.`
            : 'Nessuna covariata nel modello.',
        ],
      },
      {
        heading: 'Assunzioni',
        body: [
          Number.isFinite(slopesP)
            ? `Omogeneità delle pendenze: F(${slopes.find((row) => row.metric === 'df numeratore')?.value ?? '—'}, ${slopes.find((row) => row.metric === 'df denominatore')?.value ?? '—'}) = ${show(Number(slopes.find((row) => row.metric === 'F interazione')?.value), 3)}, p = ${fmtP(slopesP)}. ${
                violated
                  ? 'L’ipotesi è violata: riporta il modello con interazione o analizza i gruppi separatamente.'
                  : 'Non ci sono prove che le pendenze differiscano tra i gruppi.'
              }`
            : 'Il test di omogeneità delle pendenze non è calcolabile (troppi pochi gradi di libertà).',
          'Restano richiesti indipendenza delle osservazioni, linearità della relazione con le covariate e normalità/omoschedasticità dei residui.',
        ],
      },
      {
        heading: 'Confronti tra gruppi',
        body: [
          posthoc.length === 0
            ? 'Nessun confronto a coppie disponibile.'
            : significantPairs.length > 0
              ? `Con correzione Holm risultano significativi: ${significantPairs
                  .map((row) => `${row.contrast} (Δ = ${show(Number(row.difference), 3)}, p = ${fmtP(Number(row.pHolm))})`)
                  .join('; ')}.`
              : 'Nessun confronto a coppie resta significativo dopo la correzione di Holm.',
          'Le differenze sono calcolate sulle medie aggiustate, non sulle medie grezze.',
        ],
      },
      {
        heading: 'Cautele',
        bullets: [
          'Le covariate devono essere misurate prima del trattamento e non essere influenzate dal fattore.',
          'Una covariata con forte errore di misura attenua l’aggiustamento e può ridurre la potenza.',
          'Le medie aggiustate dipendono dal valore medio delle covariate: con covariate molto sbilanciate l’estrapolazione può essere fragile.',
          'L’ANCOVA non crea gruppi equivalenti: rimuove solo la parte di differenza lineare associata alle covariate osservate.',
        ],
      },
    ],
    limitations: [
      'Un solo fattore categorico: per disegni fattoriali con covariate serve un modello più generale.',
      'Nessuna selezione automatica del modello: tutte le covariate scelte restano nel modello.',
      'SS tipo III con codifica treatment: con interazioni il significato dei termini cambia.',
    ],
  };
};
