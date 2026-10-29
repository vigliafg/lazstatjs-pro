import { fmtEst, fmtP } from '../format';
import { copy, sourceOf } from '../reportCopy';
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
  const diag = (name: string) => diagnostics.find(row => sourceOf(String(row.metric)) === name);
  const interactionSignificant = interactionRow ? isDecided(Number(interactionRow.p), level) : false;

  const describe = (row: (typeof rows)[number]): string =>
    copy('{s1}: F({s2}, {s3}) = {s4}, {s5}, η² parziale = {s6}', { s1: String(row.source), s2: Number(row.df), s3: Number(rows.find(r => String(r.source) === 'Residuals')?.df ?? 0), s4: fmtEst(Number(row.f), 3), s5: Number(row.p) < 0.001 ? copy('p < 0.001') : copy('p = {s1}', { s1: fmtP(Number(row.p)) }), s6: fmtEst(Number(row.eta2p), 3) });

  const headline = !anova
    ? copy('Dati insufficienti per stimare il modello.')
    : interactionSignificant
      ? copy('L’interazione {s1} è significativa: l’effetto di un fattore dipende dal livello dell’altro.', { s1: String(interactionRow?.source) })
      : significant.length > 0
        ? copy('{s1} effetto/i {s2} al livello {s3}.', { s1: significant.length, s2: significant.length === 1 ? copy('è significativo') : copy('sono significativi'), s3: (1 - level / 100).toFixed(2) })
        : copy('Nessun effetto raggiunge la significatività al livello {s1}.', { s1: (1 - level / 100).toFixed(2) });

  return {
    id: 'factorial',
    title: copy('Report di lettura'),
    headline,
    badge: interactionSignificant ? copy('Interazione presente') : significant.length > 0 ? copy('Effetti significativi') : copy('Nessun effetto'),
    tone: interactionSignificant ? 'caution' : significant.length > 0 ? 'positive' : 'neutral',
    intro: [
      copy('L’ANOVA a due fattori separa la variabilità della risposta in tre pezzi: quanto dipende dal primo fattore, quanto dal secondo e quanto dalla loro combinazione.'),
      copy('L’ipotesi nulla di ogni riga è “nessun effetto”: se il p scende sotto la soglia, quel termine spiega più variabilità di quanto il caso saprebbe produrre.'),
    ],
    sections: [
      {
        heading: copy('La lettura dei risultati'),
        body: [
          interactionSignificant
            ? copy('L’interazione è significativa ({s1}): gli effetti principali non vanno letti da soli, perché l’effetto di ciascun fattore cambia a seconda del livello dell’altro. Guarda le medie per cella e il grafico: le linee non parallele sono la firma dell’interazione.', { s1: fmtP(Number(interactionRow?.p)) })
            : copy('L’interazione non è significativa: gli effetti dei due fattori possono essere letti separatamente, come se agissero in modo additivo.'),
          ...effects.map(row => describe(row)),
        ],
      },
      {
        heading: copy('Quanto pesa ogni effetto'),
        body: [
          copy('η² parziale dice quale quota della variabilità residua (dopo gli altri termini) spiega quel termine: 0,01 è piccolo, 0,06 medio, 0,14 grande secondo i riferimenti di Cohen. ω² corregge il bias verso l’alto e può essere più piccolo, soprattutto con pochi df.'),
        ],
        bullets: effects.map(row => copy('{s1}: η² parziale = {s2}, ω² = {s3}', { s1: String(row.source), s2: fmtEst(Number(row.eta2p), 3), s3: fmtEst(Number(row.omega2), 3) })),
      },
      {
        heading: copy('Assunzioni e diagnostica'),
        bullets: [
          copy('R² = {s1}: il modello spiega questa quota della variabilità totale.', { s1: fmtEst(Number(diag('R²')?.value), 3) }),
          copy('Levene sulle celle: p = {s1}. Se è sotto 0,05 le varianze non sono omogenee e l’F può essere distorto, soprattutto con gruppi di dimensione diversa.', { s1: fmtP(Number(diag(copy('Levene (celle)'))?.value)) }),
          copy('Lilliefors sui residui: p = {s1}. Con residui non normali valuta una trasformazione (log, radice) o un’analisi per ranghi.', { s1: fmtP(Number(diag(copy('Lilliefors (residui)'))?.value)) }),
          copy('Osservazioni indipendenti: nessuna struttura di misure ripetute o di blocchi è modellata qui.'),
        ],
      },
      {
        heading: copy('Cosa non dice il test'),
        body: [
          copy('Una F significativa dice che almeno una media differisce, non quale coppia: per quello servono i confronti post-hoc. E nessuna F stabilisce la direzione causale degli effetti.'),
        ],
      },
    ],
    limitations: [
      copy('Le SS sequenziali dipendono dall’ordine dei termini quando il disegno non è bilanciato; in quel caso un software che riporta Type III può dare numeri diversi.'),
      copy('Il modello è additivo a due fattori: non gestisce blocchi, covariate, misure ripetute o tre fattori.'),
      copy('Con celle singole la variabilità interna non è stimabile e il test non è calcolabile.'),
    ],
  };
};
