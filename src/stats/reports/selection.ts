import { copy } from '../reportCopy';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';

export const selectionReport = (tables: TableSpec[], level: number): ReportSpec => {
  const subsets = tables.find(table => table.id === 'selection-subsets')?.rows ?? [];
  const steps = tables.find(table => table.id === 'selection-steps')?.rows ?? [];
  const model = tables.find(table => table.id === 'selection-model')?.rows ?? [];
  const final = model[0];
  const selected = model
    .slice(1)
    .map(row => String(row.predictor))
    .filter(name => name !== '');
  const best = subsets.reduce<Record<string, unknown> | null>((current, row) => {
    const bic = Number(row.bic);
    if (!Number.isFinite(bic)) return current;
    if (!current || bic < Number(current.bic)) return row;
    return current;
  }, null);

  return {
    id: 'report-selection',
    title: copy('Report di lettura — Selezione delle variabili'),
    headline:
      selected.length > 0
        ? copy('Il modello scelto contiene {s1} predittore/i: {s2}.', {
            s1: selected.length,
            s2: selected.join(', '),
          })
        : copy('Nessun predittore supera il criterio: resta il modello con la sola intercetta.'),
    badge: copy('Regressione'),
    tone: selected.length > 0 ? 'positive' : 'neutral',
    intro: [
      copy('La selezione delle variabili cerca un modello più semplice senza perdere capacità esplicativa, confrontando sottoinsiemi di predittori.'),
      copy('La ricerca esaustiva guarda tutti i sottoinsiemi; lo stepwise aggiunge o toglie una variabile alla volta seguendo il criterio scelto.'),
    ],
    sections: [
      {
        heading: copy('Risultato'),
        bullets: [
          copy('Il modello con il BIC più basso usa {s1} variabili: {s2}.', {
            s1: best ? String(best.size) : '—',
            s2: best ? String(best.variables) : '—',
          }),
          copy('Lo stepwise ha esaminato {s1} passi e si è fermato con {s2} predittore/i.', {
            s1: steps.length,
            s2: selected.length,
          }),
          final
            ? copy('Modello finale: R² = {s1}, R² adattato = {s2}, F = {s3}.', {
                s1: String(final.r2 ?? '—'),
                s2: String(final.adjR2 ?? '—'),
                s3: String(final.f ?? '—'),
              })
            : copy('Il modello finale non contiene predittori significativi.'),
        ],
      },
      {
        heading: copy('Cautele'),
        bullets: [
          copy('La selezione automatica tende a sovrastimare la significatività: i p-value dopo la scelta non sono aggiustati.'),
          copy('Con molti predittori la ricerca esaustiva è limitata: il numero di sottoinsiemi cresce in modo esponenziale.'),
          copy('Usa la selezione per esplorare, poi conferma il modello su dati indipendenti o con validazione incrociata.'),
          copy('Il criterio BIC penalizza di più l’AIC: produce modelli più parsimoniosi.'),
        ],
      },
    ],
    limitations: [
      copy('I risultati dipendono dal criterio e dalla direzione scelti; riporta sempre entrambi insieme al livello di confidenza del {s1}%.', {
        s1: level,
      }),
    ],
  };
};
