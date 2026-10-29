import { fmtP, fmtPct, interpretR } from '../format';
import { copy } from '../reportCopy';
import { isDecided, show } from '../reportKit';
import { alphaLabel, kmoLabel } from '../multivariate/labels';
import { mean } from '../multivariate/math';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';
import type { AlphaResult, EfaResult, PcaResult } from '../multivariate/types';

export const pcaReport = (tables: TableSpec[], result: PcaResult, level: number): ReportSpec => {
  const eigen = tables.find((table) => table.id === 'pca-eigen')?.rows ?? [];
  const loadings = tables.find((table) => table.id === 'pca-loadings')?.rows ?? [];
  const adequacy = tables.find((table) => table.id === 'pca-adequacy')?.rows ?? [];
  const explained = result.cumulativePct[result.retained - 1] ?? NaN;
  const bartlettP = result.bartlettP;
  const kmoOk = Number.isFinite(result.kmo) && result.kmo >= 0.7;
  const bartlettOk = isDecided(bartlettP, level);

  const strongest = result.variables
    .map((variable, index) => {
      let best = 0;
      for (let component = 1; component < result.retained; component += 1) {
        if (Math.abs(result.loadings[index][component]) > Math.abs(result.loadings[index][best])) best = component;
      }
      return { variable, component: best, loading: result.loadings[index][best] };
    })
    .sort((a, b) => Math.abs(b.loading) - Math.abs(a.loading))
    .slice(0, 5);

  const leading = strongest
    .filter((item) => Math.abs(item.loading) >= 0.4)
    .map((item) => copy('{s1} (PC{s2}: {s3})', { s1: item.variable, s2: item.component + 1, s3: show(item.loading, 3) }));

  return {
    id: 'pca',
    title: copy('Report di lettura'),
    headline: copy('I {s1} componenti ritenuti spiegano il {s2} della varianza totale.', { s1: result.retained, s2: fmtPct(explained) }),
    badge: kmoOk ? copy('Struttura leggibile') : copy('Campione debole'),
    tone: kmoOk ? 'positive' : 'caution',
    intro: [
      copy('La PCA riduce un insieme di variabili correlate a pochi componenti non correlati, ordinati per varianza spiegata.'),
      copy('Analisi su {s1} variabili e {s2} casi completi{s3}.', { s1: result.variables.length, s2: result.n, s3: result.standardize ? copy(', matrice di correlazione (variabili standardizzate)') : copy(', matrice di covarianza (unità originali)') }),
    ],
    sections: [
      {
        heading: copy('La lettura dei risultati'),
        body: [
          copy('Il primo componente spiega il {s1}; i primi {s2} arrivano al {s3}.', { s1: fmtPct(result.variancePct[0]), s2: result.retained, s3: fmtPct(explained) }),
          leading.length > 0
            ? copy('Le saturazioni più alte sono: {s1}.', { s1: leading.join(', ') })
            : copy('Nessuna variabile raggiunge |saturazione| ≥ 0.40 sui componenti ritenuti: la struttura è debole o il numero di componenti è insufficiente.'),
          copy('Comunalità medie: {s1} (quota di varianza di ogni variabile ripresa dai componenti ritenuti).', { s1: show(mean(result.communalities), 3) }),
        ],
      },
      {
        heading: copy('Adeguatezza del campione'),
        body: [
          copy('KMO = {s1} ({s2}): {s3}', { s1: show(result.kmo, 3), s2: kmoLabel(result.kmo), s3: 
            kmoOk
              ? copy('la matrice è adatta alla riduzione dimensionale.')
              : copy('la correlazione parziale è alta rispetto a quella semplice: i componenti possono essere instabili.')
           }),
          copy('Bartlett χ²({s1}) = {s2}, p = {s3}: {s4}', { s1: result.bartlettDf, s2: show(result.bartlettChi2, 3), s3: fmtP(bartlettP), s4: 
            bartlettOk
              ? copy('la matrice di correlazione non è sferica, quindi esiste struttura da estrarre.')
              : copy('non si rifiuta la sfericità: la PCA potrebbe non aggiungere molto rispetto alle variabili originali.')
           }),
        ],
      },
      {
        heading: copy('Assunzioni e cautele'),
        bullets: [
          copy('La PCA descrive la varianza, non un modello causale: i componenti sono combinazioni lineari, non variabili latenti validate.'),
          copy('Non è applicata alcuna rotazione: i componenti sono quelli della soluzione ortogonale iniziale.'),
          copy('Campioni piccoli e outlier possono cambiare le saturazioni; controlla il rapporto casi/variabili (almeno 5–10 casi per variabile).'),
          copy('Variabili su scale molto diverse richiedono la matrice di correlazione; con unità omogenee la covarianza conserva le differenze di scala.'),
        ],
      },
    ],
    limitations: [
      copy('La PCA non gestisce valori mancanti: i casi incompleti sono esclusi.'),
      copy('KMO e Bartlett richiedono la matrice di correlazione; con la covarianza non sono riportati.'),
      copy('Saturazioni e punteggi sono calcolati sui dati osservati: non c’è inferenza né intervallo di confidenza.'),
    ],
  };
};

export const alphaReport = (tables: TableSpec[], result: AlphaResult): ReportSpec => {
  const items = tables.find((table) => table.id === 'alpha-items')?.rows ?? [];
  const weak = result.items.filter((item) => Number.isFinite(item.itemTotal) && item.itemTotal < 0.3);
  const removable = result.items.filter(
    (item) => Number.isFinite(item.alphaIfDeleted) && item.alphaIfDeleted > result.alpha + 0.005
  );
  const adequate = Number.isFinite(result.alpha) && result.alpha >= 0.7;

  return {
    id: 'alpha',
    title: copy('Report di lettura'),
    headline: copy('Cronbach α = {s1} su {s2} item: affidabilità {s3}.', { s1: show(result.alpha, 3), s2: result.k, s3: alphaLabel(result.alpha) }),
    badge: adequate ? copy('Scala coerente') : copy('Coerenza bassa'),
    tone: adequate ? 'positive' : 'caution',
    intro: [
      copy('L’α di Cronbach stima la coerenza interna: quanto gli item di una scala misurano la stessa cosa in modo consistente.'),
      copy('Calcolato su {s1} casi completi e {s2} item; α standardizzato = {s3}.', { s1: result.n, s2: result.k, s3: show(result.standardizedAlpha, 3) }),
    ],
    sections: [
      {
        heading: copy('La lettura dei risultati'),
        body: [
          copy('α = {s1} ({s2}). La correlazione media tra item è {s3} ({s4}).', { s1: show(result.alpha, 3), s2: alphaLabel(result.alpha), s3: show(result.meanInterItem, 3), s4: interpretR(result.meanInterItem) }),
          adequate
            ? copy('La scala supera la soglia convenzionale di 0.70: la somma degli item è sufficientemente coerente per essere usata come punteggio.')
            : copy('La scala è sotto la soglia convenzionale di 0.70: la somma degli item contiene molta varianza specifica di ciascun item.'),
        ],
      },
      {
        heading: copy('Diagnostica per item'),
        body: [
          items.length === 0
            ? copy('Nessun item disponibile.')
            : copy('{s1} item esaminati; {s2} hanno una correlazione item-totale ≥ 0.30.', { s1: items.length, s2: result.items.filter((item) => Number.isFinite(item.itemTotal) && item.itemTotal >= 0.3).length }),
          removable.length > 0
            ? copy('Eliminando {s1} l’α aumenterebbe (fino a {s2}).', { s1: removable.map((item) => item.item).join(', '), s2: show(Math.max(...removable.map((item) => item.alphaIfDeleted)), 3) })
            : copy('Nessun item, se eliminato, aumenta l’α in modo sostanziale.'),
          weak.length > 0
            ? copy('Item con r item-totale < 0.30: {s1}.', { s1: weak.map((item) => item.item).join(', ') })
            : copy('Tutti gli item correlano almeno 0.30 con il resto della scala.'),
        ],
      },
      {
        heading: copy('Assunzioni e cautele'),
        bullets: [
          copy('α assume item con la stessa direzione: item reverse-scored devono essere ricodificati prima dell’analisi.'),
          copy('α cresce meccanicamente con il numero di item: confronta scale con lo stesso numero di item.'),
          copy('Un α alto non dimostra che la scala sia unidimensionale; per questo serve un’analisi fattoriale (es. PCA).'),
          copy('I casi incompleti sono esclusi: se le omissioni non sono casuali, l’α può essere distorto.'),
        ],
      },
    ],
    limitations: [
      copy('È riportato l’α di Cronbach; ω di McDonald non è calcolato.'),
      copy('Non sono inclusi intervalli di confidenza bootstrapped per α.'),
    ],
  };
};

export const efaReport = (tables: TableSpec[], result: EfaResult): ReportSpec => {
  const strong = result.loadings.reduce(
    (count, row) => count + row.filter(value => Math.abs(value) >= 0.4).length,
    0
  );
  return {
    id: 'efa',
    title: copy('Report di analisi fattoriale'),
    headline: copy('{s1} fattori spiegano il {s2} della varianza; omega = {s3}.', { s1: result.factors, s2: fmtPct(result.cumulativePct[result.factors - 1] ?? 0), s3: show(result.omega, 3) }),
    badge: result.omega >= 0.8 ? copy('Affidabilità buona') : result.omega >= 0.7 ? copy('Affidabilità accettabile') : copy('Affidabilità da valutare'),
    tone: result.omega >= 0.7 ? 'positive' : 'caution',
    intro: [
      copy('Soluzione {s1} su {s2} casi completi.', { s1: result.rotation === 'varimax' ? 'varimax' : copy('non ruotata'), s2: result.n }),
      copy('Bartlett χ²({s1}) = {s2}, p = {s3}.', { s1: result.bartlettDf, s2: show(result.bartlettChi2, 3), s3: fmtP(result.bartlettP) }),
    ],
    sections: [
      {
        heading: 'Lettura',
        body: [
          strong > 0
            ? copy('Ci sono {s1} loadings sostanziali (|λ| ≥ 0,40): controlla la tabella per attribuire i fattori alle variabili.', { s1: strong })
            : copy('Nessun loading raggiunge 0,40: la struttura fattoriale è debole o il numero di fattori è insufficiente.'),
          copy('Omega totale = {s1}: stima la quota di varianza affidabile della scala complessiva.', { s1: show(result.omega, 3) }),
          copy('La parallel analysis confronta gli autovalori osservati con quelli di dati casuali con la stessa numerosità.'),
        ],
      },
    ],
    limitations: [
      copy('La soluzione fattoriale non è unica: rotazioni e numero di fattori cambiano l’interpretazione.'),
      copy('L’analisi fattoriale esplorativa non sostituisce una CFA con ipotesi pre-specificate.'),
    ],
  };
};
