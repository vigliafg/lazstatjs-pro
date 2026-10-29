import { fmtEst, fmtP } from '../format';
import { copy, sourceOf } from '../reportCopy';
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
  const p = Number(test.find((row) => sourceOf(String(row.metric)) === 'p')?.value ?? NaN);
  const w = Number(test.find((row) => sourceOf(String(row.metric)) === copy('W di Kendall'))?.value ?? NaN);
  const significantPairs = nemenyi.filter((row) => row.significant === 'sì');
  const effect =
    w < 0.1 ? 'trascurabile' : w < 0.3 ? 'piccola' : w < 0.5 ? 'moderata' : 'grande';

  return {
    id: 'friedman',
    title: copy('Report di lettura'),
    headline: Number.isFinite(p) && p < alphaOf(level)
      ? copy('Le {s1} misure ripetute differiscono (p = {s2}).', { s1: names.length, s2: fmtP(p) })
      : copy('Non emergono differenze tra le misure ripetute (p = {s1}).', { s1: fmtP(p) }),
    badge: Number.isFinite(p) && p < alphaOf(level) ? copy('Differenza rilevata') : copy('Nessuna differenza'),
    tone: Number.isFinite(p) && p < alphaOf(level) ? 'positive' : 'neutral',
    intro: [
      copy('Il test di Friedman è l’alternativa non parametrica all’ANOVA a misure ripetute: confronta k condizioni misurate sulle stesse unità usando i ranghi dentro ogni blocco (una riga = una unità).'),
      copy('Non richiede normalità né varianze uguali; richiede invece blocchi completi e misure almeno ordinali.'),
    ],
    sections: [
      {
        heading: copy('La lettura dei risultati'),
        body: [
          copy('χ² di Friedman = {s1} con {s2}: {s3}', { s1: test.find((row) => sourceOf(String(row.metric)) === copy('χ² di Friedman'))?.value ?? '—', s2: test.find((row) => row.detail)?.detail ?? '—', s3: Number.isFinite(p) && p < alphaOf(level) ? copy('rifiuta l’ipotesi che tutte le condizioni siano equivalenti.') : copy('non rifiuta l’ipotesi di equivalenza.') }),
          copy('W di Kendall = {s1}: concordanza {s2} tra le condizioni.', { s1: fmtEst(w, 3), s2: effect }),
          copy('Il post-hoc Nemenyi segnala {s1} al livello {s2}%: {s3}.', { s1: significantPairs.length === 0 ? copy('nessun confronto significativo') : significantPairs.length === 1 ? copy('{s1} confronto significativo', { s1: significantPairs.length }) : copy('{s1} confronti significativi', { s1: significantPairs.length }), s2: level, s3: significantPairs.length ? significantPairs.map((row) => row.pair).join(', ') : 'nessuno' }),
        ],
      },
      {
        heading: copy('Assunzioni e cautele'),
        bullets: [
          copy('Ogni riga deve contenere tutte le k misure: le righe incomplete vengono scartate.'),
          copy('Il test usa i ranghi within-block: differenze sistematiche di livello tra blocchi non pesano.'),
          copy('Con pochi blocchi la potenza è bassa; con molti trattamenti Nemenyi diventa conservativo.'),
        ],
      },
    ],
    limitations: [
      copy('Il post-hoc Nemenyi assume blocchi bilanciati e usa l’approssimazione del range studentizzato con df infinito.'),
      copy('Non sono gestiti disegni misti (between + within) né covariate.'),
    ],
  };
};


export const mcnemarReport = (
  tables: TableSpec[],
  names: [string, string],
  level: number
): ReportSpec => {
  const rows = tables.find((table) => table.id === 'mcnemar-test')?.rows ?? [];
  const p = Number(rows.find((row) => sourceOf(String(row.metric)) === copy('p esatto (binomiale)'))?.value ?? NaN);
  const b = Number(rows.find((row) => sourceOf(String(row.metric)).startsWith('b'))?.value ?? NaN);
  const c = Number(rows.find((row) => sourceOf(String(row.metric)).startsWith('c '))?.value ?? NaN);
  const decided = isDecided(p, level);

  return {
    id: 'mcnemar',
    title: copy('Report di lettura'),
    headline: decided
      ? copy('Le due misure cambiano in modo asimmetrico (p esatto = {s1}): {s2} risulta più spesso positiva.', { s1: fmtP(p), s2: b > c ? names[0] : names[1] })
      : copy('Nessuna asimmetria nei cambiamenti tra {s1} e {s2} (p esatto = {s3}).', { s1: names[0], s2: names[1], s3: fmtP(p) }),
    badge: decided ? copy('Cambiamento asimmetrico') : copy('Nessuna asimmetria'),
    tone: decided ? 'positive' : 'neutral',
    intro: [
      copy('McNemar confronta due misure binarie rilevate sulle stesse unità e si concentra sulle coppie che cambiano (discordanti), ignorando quelle concordanti.'),
      copy('È il test giusto per un disegno before/after su esito sì/no, non per due gruppi indipendenti.'),
    ],
    sections: [
      {
        heading: copy('La lettura dei risultati'),
        body: [
          copy('Le coppie discordanti sono b = {s1} ({s2} = 1, {s3} = 0) e c = {s4} ({s5} = 1, {s6} = 0).', { s1: show(b, 0), s2: names[0], s3: names[1], s4: show(c, 0), s5: names[1], s6: names[0] }),
          copy('Il p esatto è {s1}: {s2}', { s1: fmtP(p), s2: decided ? copy('rifiuta l’ipotesi che i due esiti abbiano la stessa probabilità di cambiamento.') : copy('non rifiuta l’ipotesi di simmetria dei cambiamenti.') }),
          copy('L’odds ratio b/c = {s1}: valori sopra 1 indicano che il passaggio 1 → 0 è più frequente del contrario.', { s1: show(Number(rows.find((row) => sourceOf(String(row.metric)).startsWith('Odds'))?.value ?? NaN), 3) }),
        ],
      },
      {
        heading: copy('Assunzioni e cautele'),
        bullets: [
          copy('Le due misure devono riferirsi alle stesse unità e allo stesso intervallo di tempo.'),
          copy('Le coppie concordanti non entrano nel test: la numerosità che conta è b + c.'),
          copy('Con pochi discordanti usare il p esatto; l’approssimazione χ² è solo indicativa.'),
        ],
      },
    ],
    limitations: [
      copy('Non gestisce covariati né più di due occasioni (per tre o più usare Cochran Q).'),
      copy('L’odds ratio b/c può essere infinito quando c = 0.'),
    ],
  };
};


export const cochranReport = (
  tables: TableSpec[],
  names: string[],
  level: number
): ReportSpec => {
  const rows = tables.find((table) => table.id === 'cochran-test')?.rows ?? [];
  const p = Number(rows.find((row) => sourceOf(String(row.metric)) === 'p')?.value ?? NaN);
  const q = Number(rows.find((row) => sourceOf(String(row.metric)).startsWith('Q'))?.value ?? NaN);
  const counts = tables.find((table) => table.id === 'cochran-counts')?.rows ?? [];
  const best = counts.reduce(
    (current, row) => (Number(row.successes) > Number(current.successes) ? row : current),
    counts[0]
  );
  const subtitle = tables.find((table) => table.id === 'cochran-test')?.subtitle ?? '';
  const blocks = sourceOf(subtitle).match(/(\d+) blocchi/)?.[1] ?? '—';
  const decided = isDecided(p, level);

  return {
    id: 'cochran',
    title: copy('Report di lettura'),
    headline: decided
      ? copy('Le condizioni binarie differiscono (Q = {s1}, p = {s2}).', { s1: show(q, 3), s2: fmtP(p) })
      : copy('Nessuna differenza tra le condizioni binarie (Q = {s1}, p = {s2}).', { s1: show(q, 3), s2: fmtP(p) }),
    badge: decided ? copy('Differenza rilevata') : copy('Nessuna differenza'),
    tone: decided ? 'positive' : 'neutral',
    intro: [
      copy('Cochran Q è l’estensione di McNemar a tre o più condizioni binarie misurate sulle stesse unità: verifica se la probabilità di successo cambia tra le condizioni.'),
    ],
    sections: [
      {
        heading: copy('La lettura dei risultati'),
        body: [
          copy('Q = {s1} con {s2} e p = {s3}.', { s1: show(q, 3), s2: rows.find((row) => sourceOf(String(row.detail)).startsWith('df'))?.detail ?? '—', s3: fmtP(p) }),
          copy('{s1}', { s1: decided ? copy('Il test rifiuta l’ipotesi che tutte le condizioni abbiano la stessa probabilità di successo.') : copy('Il test non rifiuta l’ipotesi di uguale probabilità di successo.') }),
          copy('La condizione con più successi è {s1} ({s2} su {s3}).', { s1: String(best?.condition ?? '—'), s2: show(Number(best?.successes ?? NaN), 0), s3: blocks }),
        ],
      },
      {
        heading: copy('Assunzioni e cautele'),
        bullets: [
          copy('Le k misure devono essere binarie (0/1) e rilevate sulle stesse unità.'),
          copy('Le righe incomplete vengono scartate: riporta quanti blocchi restano.'),
          copy('Con poche unità l’approssimazione χ² è ottimistica; valuta test esatti o simulazioni.'),
          copy('Se Q è significativo, individua le coppie con McNemar correggendo per i confronti multipli.'),
        ],
      },
    ],
    limitations: [
      copy('Non produce un post-hoc corretto automaticamente: per le coppie usare McNemar con aggiustamento.'),
      copy('Non gestisce disegni con misure mancanti parziali (listwise deletion).'),
    ],
  };
};


export const jonckheereReport = (
  tables: TableSpec[],
  names: string[],
  level: number
): ReportSpec => {
  const rows = tables.find((table) => table.id === 'jonckheere-test')?.rows ?? [];
  const p = Number(rows.find((row) => sourceOf(String(row.metric)) === copy('p (due code)'))?.value ?? NaN);
  const z = Number(rows.find((row) => sourceOf(String(row.metric)) === 'z')?.value ?? NaN);
  const effect = Number(rows.find((row) => sourceOf(String(row.metric)) === copy('r = z/√N'))?.value ?? NaN);
  const decided = isDecided(p, level);
  const direction = z > 0 ? 'crescente' : 'decrescente';

  return {
    id: 'jonckheere',
    title: copy('Report di lettura'),
    headline: decided
      ? copy('Trend {s1} lungo l’ordine dei gruppi (z = {s2}, p = {s3}).', { s1: direction, s2: show(z, 3), s3: fmtP(p) })
      : copy('Nessuna tendenza monotonica lungo l’ordine dei gruppi (z = {s1}, p = {s2}).', { s1: show(z, 3), s2: fmtP(p) }),
    badge: decided ? copy('Trend {s1}', { s1: direction }) : copy('Nessun trend'),
    tone: decided ? 'positive' : 'neutral',
    intro: [
      copy('Il test di Jonckheere–Terpstra verifica un’ipotesi di trend tra gruppi ordinati, usando l’ordine delle colonne selezionate: è più potente di Kruskal–Wallis quando l’alternativa è monotònica.'),
      copy('L’ordine inserito è {s1}.', { s1: names.join(' < ') }),
    ],
    sections: [
      {
        heading: copy('La lettura dei risultati'),
        body: [
          copy('U = {s1} contro un atteso di {s2} sotto H₀.', { s1: rows.find((row) => sourceOf(String(row.metric)).startsWith('U'))?.value ?? '—', s2: rows.find((row) => sourceOf(String(row.metric)) === 'E[U]')?.value ?? '—' }),
          copy('{s1}', { s1: decided ? copy('I valori tendono a {s1} passando da {s2} a {s3}.', { s1: direction === 'crescente' ? 'crescere' : 'decrescere', s2: names[0], s3: names[names.length - 1] }) : copy('La successione dei gruppi non mostra un andamento monotònico convincente.') }),
          copy('Dimensione dell’effetto r = {s1} (0,1 piccolo, 0,3 medio, 0,5 grande).', { s1: show(effect, 3) }),
        ],
      },
      {
        heading: copy('Assunzioni e cautele'),
        bullets: [
          copy('I gruppi devono essere ordinati prima di eseguire il test: l’ordine non può essere scelto guardando i risultati.'),
          copy('Le osservazioni devono essere indipendenti tra loro e almeno ordinali.'),
          copy('Il test rileva un trend, non quale coppia differisca: per i confronti puntuali servono post-hoc dedicati.'),
        ],
      },
    ],
    limitations: [
      copy('Approssimazione normale: con gruppi molto piccoli il p può essere impreciso.'),
      copy('Non gestisce blocchi o misure ripetute: per quelle usare Friedman.'),
    ],
  };
};
