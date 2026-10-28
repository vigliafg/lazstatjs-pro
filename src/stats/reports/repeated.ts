import { fmtEst, fmtP } from '../format';
import { alphaOf, isDecided, show } from '../reportKit';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';

export const friedmanReport = (
  tables: TableSpec[],
  names: string[],
  level: number
): ReportSpec => {
  const test = tables.find((table) => table.id === 'friedman-test')?.rows ?? [];
  const nemenyi = tables.find((table) => table.id === 'friedman-nemenyi')?.rows ?? [];
  const p = Number(test.find((row) => row.metric === 'p')?.value ?? NaN);
  const w = Number(test.find((row) => row.metric === 'W di Kendall')?.value ?? NaN);
  const significantPairs = nemenyi.filter((row) => row.significant === 'sì');
  const effect =
    w < 0.1 ? 'trascurabile' : w < 0.3 ? 'piccola' : w < 0.5 ? 'moderata' : 'grande';

  return {
    id: 'friedman',
    title: 'Report di lettura',
    headline: Number.isFinite(p) && p < alphaOf(level)
      ? `Le ${names.length} misure ripetute differiscono (p = ${fmtP(p)}).`
      : `Non emergono differenze tra le misure ripetute (p = ${fmtP(p)}).`,
    badge: Number.isFinite(p) && p < alphaOf(level) ? 'Differenza rilevata' : 'Nessuna differenza',
    tone: Number.isFinite(p) && p < alphaOf(level) ? 'positive' : 'neutral',
    intro: [
      'Il test di Friedman è l’alternativa non parametrica all’ANOVA a misure ripetute: confronta k condizioni misurate sulle stesse unità usando i ranghi dentro ogni blocco (una riga = una unità).',
      'Non richiede normalità né varianze uguali; richiede invece blocchi completi e misure almeno ordinali.',
    ],
    sections: [
      {
        heading: 'La lettura dei risultati',
        body: [
          `χ² di Friedman = ${test.find((row) => row.metric === 'χ² di Friedman')?.value ?? '—'} con ${test.find((row) => row.detail)?.detail ?? '—'}: ${Number.isFinite(p) && p < alphaOf(level) ? 'rifiuta l’ipotesi che tutte le condizioni siano equivalenti.' : 'non rifiuta l’ipotesi di equivalenza.'}`,
          `W di Kendall = ${fmtEst(w, 3)}: concordanza ${effect} tra le condizioni.`,
          `Il post-hoc Nemenyi segnala ${significantPairs.length === 0 ? 'nessun confronto significativo' : `${significantPairs.length} confront${significantPairs.length === 1 ? 'o' : 'i'} significativ${significantPairs.length === 1 ? 'o' : 'i'}`} al livello ${level}%: ${significantPairs.length ? significantPairs.map((row) => row.pair).join(', ') : 'nessuno'}.`,
        ],
      },
      {
        heading: 'Assunzioni e cautele',
        bullets: [
          'Ogni riga deve contenere tutte le k misure: le righe incomplete vengono scartate.',
          'Il test usa i ranghi within-block: differenze sistematiche di livello tra blocchi non pesano.',
          'Con pochi blocchi la potenza è bassa; con molti trattamenti Nemenyi diventa conservativo.',
        ],
      },
    ],
    limitations: [
      'Il post-hoc Nemenyi assume blocchi bilanciati e usa l’approssimazione del range studentizzato con df infinito.',
      'Non sono gestiti disegni misti (between + within) né covariate.',
    ],
  };
};


export const mcnemarReport = (
  tables: TableSpec[],
  names: [string, string],
  level: number
): ReportSpec => {
  const rows = tables.find((table) => table.id === 'mcnemar-test')?.rows ?? [];
  const p = Number(rows.find((row) => row.metric === 'p esatto (binomiale)')?.value ?? NaN);
  const b = Number(rows.find((row) => String(row.metric).startsWith('b'))?.value ?? NaN);
  const c = Number(rows.find((row) => String(row.metric).startsWith('c '))?.value ?? NaN);
  const decided = isDecided(p, level);

  return {
    id: 'mcnemar',
    title: 'Report di lettura',
    headline: decided
      ? `Le due misure cambiano in modo asimmetrico (p esatto = ${fmtP(p)}): ${b > c ? names[0] : names[1]} risulta più spesso positiva.`
      : `Nessuna asimmetria nei cambiamenti tra ${names[0]} e ${names[1]} (p esatto = ${fmtP(p)}).`,
    badge: decided ? 'Cambiamento asimmetrico' : 'Nessuna asimmetria',
    tone: decided ? 'positive' : 'neutral',
    intro: [
      'McNemar confronta due misure binarie rilevate sulle stesse unità e si concentra sulle coppie che cambiano (discordanti), ignorando quelle concordanti.',
      'È il test giusto per un disegno before/after su esito sì/no, non per due gruppi indipendenti.',
    ],
    sections: [
      {
        heading: 'La lettura dei risultati',
        body: [
          `Le coppie discordanti sono b = ${show(b, 0)} (${names[0]} = 1, ${names[1]} = 0) e c = ${show(c, 0)} (${names[1]} = 1, ${names[0]} = 0).`,
          `Il p esatto è ${fmtP(p)}: ${decided ? 'rifiuta l’ipotesi che i due esiti abbiano la stessa probabilità di cambiamento.' : 'non rifiuta l’ipotesi di simmetria dei cambiamenti.'}`,
          `L’odds ratio b/c = ${show(Number(rows.find((row) => String(row.metric).startsWith('Odds'))?.value ?? NaN), 3)}: valori sopra 1 indicano che il passaggio 1 → 0 è più frequente del contrario.`,
        ],
      },
      {
        heading: 'Assunzioni e cautele',
        bullets: [
          'Le due misure devono riferirsi alle stesse unità e allo stesso intervallo di tempo.',
          'Le coppie concordanti non entrano nel test: la numerosità che conta è b + c.',
          'Con pochi discordanti usare il p esatto; l’approssimazione χ² è solo indicativa.',
        ],
      },
    ],
    limitations: [
      'Non gestisce covariati né più di due occasioni (per tre o più usare Cochran Q).',
      'L’odds ratio b/c può essere infinito quando c = 0.',
    ],
  };
};


export const cochranReport = (
  tables: TableSpec[],
  names: string[],
  level: number
): ReportSpec => {
  const rows = tables.find((table) => table.id === 'cochran-test')?.rows ?? [];
  const p = Number(rows.find((row) => row.metric === 'p')?.value ?? NaN);
  const q = Number(rows.find((row) => String(row.metric).startsWith('Q'))?.value ?? NaN);
  const counts = tables.find((table) => table.id === 'cochran-counts')?.rows ?? [];
  const best = counts.reduce(
    (current, row) => (Number(row.successes) > Number(current.successes) ? row : current),
    counts[0]
  );
  const subtitle = tables.find((table) => table.id === 'cochran-test')?.subtitle ?? '';
  const blocks = subtitle.match(/(\d+) blocchi/)?.[1] ?? '—';
  const decided = isDecided(p, level);

  return {
    id: 'cochran',
    title: 'Report di lettura',
    headline: decided
      ? `Le condizioni binarie differiscono (Q = ${show(q, 3)}, p = ${fmtP(p)}).`
      : `Nessuna differenza tra le condizioni binarie (Q = ${show(q, 3)}, p = ${fmtP(p)}).`,
    badge: decided ? 'Differenza rilevata' : 'Nessuna differenza',
    tone: decided ? 'positive' : 'neutral',
    intro: [
      'Cochran Q è l’estensione di McNemar a tre o più condizioni binarie misurate sulle stesse unità: verifica se la probabilità di successo cambia tra le condizioni.',
    ],
    sections: [
      {
        heading: 'La lettura dei risultati',
        body: [
          `Q = ${show(q, 3)} con ${rows.find((row) => String(row.detail).startsWith('df'))?.detail ?? '—'} e p = ${fmtP(p)}.`,
          `${decided ? 'Il test rifiuta l’ipotesi che tutte le condizioni abbiano la stessa probabilità di successo.' : 'Il test non rifiuta l’ipotesi di uguale probabilità di successo.'}`,
          `La condizione con più successi è ${String(best?.condition ?? '—')} (${show(Number(best?.successes ?? NaN), 0)} su ${blocks}).`,
        ],
      },
      {
        heading: 'Assunzioni e cautele',
        bullets: [
          'Le k misure devono essere binarie (0/1) e rilevate sulle stesse unità.',
          'Le righe incomplete vengono scartate: riporta quanti blocchi restano.',
          'Con poche unità l’approssimazione χ² è ottimistica; valuta test esatti o simulazioni.',
          'Se Q è significativo, individua le coppie con McNemar correggendo per i confronti multipli.',
        ],
      },
    ],
    limitations: [
      'Non produce un post-hoc corretto automaticamente: per le coppie usare McNemar con aggiustamento.',
      'Non gestisce disegni con misure mancanti parziali (listwise deletion).',
    ],
  };
};


export const jonckheereReport = (
  tables: TableSpec[],
  names: string[],
  level: number
): ReportSpec => {
  const rows = tables.find((table) => table.id === 'jonckheere-test')?.rows ?? [];
  const p = Number(rows.find((row) => row.metric === 'p (due code)')?.value ?? NaN);
  const z = Number(rows.find((row) => row.metric === 'z')?.value ?? NaN);
  const effect = Number(rows.find((row) => row.metric === 'r = z/√N')?.value ?? NaN);
  const decided = isDecided(p, level);
  const direction = z > 0 ? 'crescente' : 'decrescente';

  return {
    id: 'jonckheere',
    title: 'Report di lettura',
    headline: decided
      ? `Trend ${direction} lungo l’ordine dei gruppi (z = ${show(z, 3)}, p = ${fmtP(p)}).`
      : `Nessuna tendenza monotonica lungo l’ordine dei gruppi (z = ${show(z, 3)}, p = ${fmtP(p)}).`,
    badge: decided ? `Trend ${direction}` : 'Nessun trend',
    tone: decided ? 'positive' : 'neutral',
    intro: [
      'Il test di Jonckheere–Terpstra verifica un’ipotesi di trend tra gruppi ordinati, usando l’ordine delle colonne selezionate: è più potente di Kruskal–Wallis quando l’alternativa è monotònica.',
      `L’ordine inserito è ${names.join(' < ')}.`,
    ],
    sections: [
      {
        heading: 'La lettura dei risultati',
        body: [
          `U = ${rows.find((row) => String(row.metric).startsWith('U'))?.value ?? '—'} contro un atteso di ${rows.find((row) => row.metric === 'E[U]')?.value ?? '—'} sotto H₀.`,
          `${decided ? `I valori tendono a ${direction === 'crescente' ? 'crescere' : 'decrescere'} passando da ${names[0]} a ${names[names.length - 1]}.` : 'La successione dei gruppi non mostra un andamento monotònico convincente.'}`,
          `Dimensione dell’effetto r = ${show(effect, 3)} (0,1 piccolo, 0,3 medio, 0,5 grande).`,
        ],
      },
      {
        heading: 'Assunzioni e cautele',
        bullets: [
          'I gruppi devono essere ordinati prima di eseguire il test: l’ordine non può essere scelto guardando i risultati.',
          'Le osservazioni devono essere indipendenti tra loro e almeno ordinali.',
          'Il test rileva un trend, non quale coppia differisca: per i confronti puntuali servono post-hoc dedicati.',
        ],
      },
    ],
    limitations: [
      'Approssimazione normale: con gruppi molto piccoli il p può essere impreciso.',
      'Non gestisce blocchi o misure ripetute: per quelle usare Friedman.',
    ],
  };
};
