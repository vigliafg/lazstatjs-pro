import { fmtEst, fmtP } from '../format';
import { isDecided, tableById } from '../reportKit';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';

export const factorialReport = (tables: TableSpec[], level: number): ReportSpec => {
  const anova = tableById(tables, 'fac-anova');
  const rows = anova?.rows ?? [];
  const interactionRow = rows.find(row => String(row.source).includes('×'));
  const effects = rows.filter(row => String(row.source) !== 'Residuals' && String(row.source) !== 'Total');
  const significant = effects.filter(row => isDecided(Number(row.p), level));
  const diagnostics = tableById(tables, 'fac-diagnostics')?.rows ?? [];
  const diag = (name: string) => diagnostics.find(row => String(row.metric) === name);
  const interactionSignificant = interactionRow ? isDecided(Number(interactionRow.p), level) : false;

  const describe = (row: (typeof rows)[number]): string =>
    `${String(row.source)}: F(${Number(row.df)}, ${Number(rows.find(r => String(r.source) === 'Residuals')?.df ?? 0)}) = ${fmtEst(Number(row.f), 3)}, ${Number(row.p) < 0.001 ? 'p < 0.001' : `p = ${fmtP(Number(row.p))}`}, η² parziale = ${fmtEst(Number(row.eta2p), 3)}`;

  const headline = !anova
    ? 'Dati insufficienti per stimare il modello.'
    : interactionSignificant
      ? `L’interazione ${String(interactionRow?.source)} è significativa: l’effetto di un fattore dipende dal livello dell’altro.`
      : significant.length > 0
        ? `${significant.length} effetto/i ${significant.length === 1 ? 'è significativo' : 'sono significativi'} al livello ${(1 - level / 100).toFixed(2)}.`
        : `Nessun effetto raggiunge la significatività al livello ${(1 - level / 100).toFixed(2)}.`;

  return {
    id: 'factorial',
    title: 'Report di lettura',
    headline,
    badge: interactionSignificant ? 'Interazione presente' : significant.length > 0 ? 'Effetti significativi' : 'Nessun effetto',
    tone: interactionSignificant ? 'caution' : significant.length > 0 ? 'positive' : 'neutral',
    intro: [
      'L’ANOVA a due fattori separa la variabilità della risposta in tre pezzi: quanto dipende dal primo fattore, quanto dal secondo e quanto dalla loro combinazione.',
      'L’ipotesi nulla di ogni riga è “nessun effetto”: se il p scende sotto la soglia, quel termine spiega più variabilità di quanto il caso saprebbe produrre.',
    ],
    sections: [
      {
        heading: 'La lettura dei risultati',
        body: [
          interactionSignificant
            ? `L’interazione è significativa (${fmtP(Number(interactionRow?.p))}): gli effetti principali non vanno letti da soli, perché l’effetto di ciascun fattore cambia a seconda del livello dell’altro. Guarda le medie per cella e il grafico: le linee non parallele sono la firma dell’interazione.`
            : 'L’interazione non è significativa: gli effetti dei due fattori possono essere letti separatamente, come se agissero in modo additivo.',
          ...effects.map(row => describe(row)),
        ],
      },
      {
        heading: 'Quanto pesa ogni effetto',
        body: [
          'η² parziale dice quale quota della variabilità residua (dopo gli altri termini) spiega quel termine: 0,01 è piccolo, 0,06 medio, 0,14 grande secondo i riferimenti di Cohen. ω² corregge il bias verso l’alto e può essere più piccolo, soprattutto con pochi df.',
        ],
        bullets: effects.map(row => `${String(row.source)}: η² parziale = ${fmtEst(Number(row.eta2p), 3)}, ω² = ${fmtEst(Number(row.omega2), 3)}`),
      },
      {
        heading: 'Assunzioni e diagnostica',
        bullets: [
          `R² = ${fmtEst(Number(diag('R²')?.value), 3)}: il modello spiega questa quota della variabilità totale.`,
          `Levene sulle celle: p = ${fmtP(Number(diag('Levene (celle)')?.value))}. Se è sotto 0,05 le varianze non sono omogenee e l’F può essere distorto, soprattutto con gruppi di dimensione diversa.`,
          `Lilliefors sui residui: p = ${fmtP(Number(diag('Lilliefors (residui)')?.value))}. Con residui non normali valuta una trasformazione (log, radice) o un’analisi per ranghi.`,
          'Osservazioni indipendenti: nessuna struttura di misure ripetute o di blocchi è modellata qui.',
        ],
      },
      {
        heading: 'Cosa non dice il test',
        body: [
          'Una F significativa dice che almeno una media differisce, non quale coppia: per quello servono i confronti post-hoc. E nessuna F stabilisce la direzione causale degli effetti.',
        ],
      },
    ],
    limitations: [
      'Le SS sequenziali dipendono dall’ordine dei termini quando il disegno non è bilanciato; in quel caso un software che riporta Type III può dare numeri diversi.',
      'Il modello è additivo a due fattori: non gestisce blocchi, covariate, misure ripetute o tre fattori.',
      'Con celle singole la variabilità interna non è stimabile e il test non è calcolabile.',
    ],
  };
};
