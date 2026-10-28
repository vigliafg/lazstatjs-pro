import { fmtP, fmtPct, interpretR } from '../format';
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
    .map((item) => `${item.variable} (PC${item.component + 1}: ${show(item.loading, 3)})`);

  return {
    id: 'pca',
    title: 'Report di lettura',
    headline: `I ${result.retained} componenti ritenuti spiegano il ${fmtPct(explained)} della varianza totale.`,
    badge: kmoOk ? 'Struttura leggibile' : 'Campione debole',
    tone: kmoOk ? 'positive' : 'caution',
    intro: [
      'La PCA riduce un insieme di variabili correlate a pochi componenti non correlati, ordinati per varianza spiegata.',
      `Analisi su ${result.variables.length} variabili e ${result.n} casi completi${result.standardize ? ', matrice di correlazione (variabili standardizzate)' : ', matrice di covarianza (unità originali)'}.`,
    ],
    sections: [
      {
        heading: 'La lettura dei risultati',
        body: [
          `Il primo componente spiega il ${fmtPct(result.variancePct[0])}; i primi ${result.retained} arrivano al ${fmtPct(explained)}.`,
          leading.length > 0
            ? `Le saturazioni più alte sono: ${leading.join(', ')}.`
            : 'Nessuna variabile raggiunge |saturazione| ≥ 0.40 sui componenti ritenuti: la struttura è debole o il numero di componenti è insufficiente.',
          `Comunalità medie: ${show(mean(result.communalities), 3)} (quota di varianza di ogni variabile ripresa dai componenti ritenuti).`,
        ],
      },
      {
        heading: 'Adeguatezza del campione',
        body: [
          `KMO = ${show(result.kmo, 3)} (${kmoLabel(result.kmo)}): ${
            kmoOk
              ? 'la matrice è adatta alla riduzione dimensionale.'
              : 'la correlazione parziale è alta rispetto a quella semplice: i componenti possono essere instabili.'
          }`,
          `Bartlett χ²(${result.bartlettDf}) = ${show(result.bartlettChi2, 3)}, p = ${fmtP(bartlettP)}: ${
            bartlettOk
              ? 'la matrice di correlazione non è sferica, quindi esiste struttura da estrarre.'
              : 'non si rifiuta la sfericità: la PCA potrebbe non aggiungere molto rispetto alle variabili originali.'
          }`,
        ],
      },
      {
        heading: 'Assunzioni e cautele',
        bullets: [
          'La PCA descrive la varianza, non un modello causale: i componenti sono combinazioni lineari, non variabili latenti validate.',
          'Non è applicata alcuna rotazione: i componenti sono quelli della soluzione ortogonale iniziale.',
          'Campioni piccoli e outlier possono cambiare le saturazioni; controlla il rapporto casi/variabili (almeno 5–10 casi per variabile).',
          'Variabili su scale molto diverse richiedono la matrice di correlazione; con unità omogenee la covarianza conserva le differenze di scala.',
        ],
      },
    ],
    limitations: [
      'La PCA non gestisce valori mancanti: i casi incompleti sono esclusi.',
      'KMO e Bartlett richiedono la matrice di correlazione; con la covarianza non sono riportati.',
      'Saturazioni e punteggi sono calcolati sui dati osservati: non c’è inferenza né intervallo di confidenza.',
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
    title: 'Report di lettura',
    headline: `Cronbach α = ${show(result.alpha, 3)} su ${result.k} item: affidabilità ${alphaLabel(result.alpha)}.`,
    badge: adequate ? 'Scala coerente' : 'Coerenza bassa',
    tone: adequate ? 'positive' : 'caution',
    intro: [
      'L’α di Cronbach stima la coerenza interna: quanto gli item di una scala misurano la stessa cosa in modo consistente.',
      `Calcolato su ${result.n} casi completi e ${result.k} item; α standardizzato = ${show(result.standardizedAlpha, 3)}.`,
    ],
    sections: [
      {
        heading: 'La lettura dei risultati',
        body: [
          `α = ${show(result.alpha, 3)} (${alphaLabel(result.alpha)}). La correlazione media tra item è ${show(result.meanInterItem, 3)} (${interpretR(result.meanInterItem)}).`,
          adequate
            ? 'La scala supera la soglia convenzionale di 0.70: la somma degli item è sufficientemente coerente per essere usata come punteggio.'
            : 'La scala è sotto la soglia convenzionale di 0.70: la somma degli item contiene molta varianza specifica di ciascun item.',
        ],
      },
      {
        heading: 'Diagnostica per item',
        body: [
          items.length === 0
            ? 'Nessun item disponibile.'
            : `${items.length} item esaminati; ${result.items.filter((item) => Number.isFinite(item.itemTotal) && item.itemTotal >= 0.3).length} hanno una correlazione item-totale ≥ 0.30.`,
          removable.length > 0
            ? `Eliminando ${removable.map((item) => item.item).join(', ')} l’α aumenterebbe (fino a ${show(Math.max(...removable.map((item) => item.alphaIfDeleted)), 3)}).`
            : 'Nessun item, se eliminato, aumenta l’α in modo sostanziale.',
          weak.length > 0
            ? `Item con r item-totale < 0.30: ${weak.map((item) => item.item).join(', ')}.`
            : 'Tutti gli item correlano almeno 0.30 con il resto della scala.',
        ],
      },
      {
        heading: 'Assunzioni e cautele',
        bullets: [
          'α assume item con la stessa direzione: item reverse-scored devono essere ricodificati prima dell’analisi.',
          'α cresce meccanicamente con il numero di item: confronta scale con lo stesso numero di item.',
          'Un α alto non dimostra che la scala sia unidimensionale; per questo serve un’analisi fattoriale (es. PCA).',
          'I casi incompleti sono esclusi: se le omissioni non sono casuali, l’α può essere distorto.',
        ],
      },
    ],
    limitations: [
      'È riportato l’α di Cronbach; ω di McDonald non è calcolato.',
      'Non sono inclusi intervalli di confidenza bootstrapped per α.',
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
    title: 'Report di analisi fattoriale',
    headline: `${result.factors} fattori spiegano il ${fmtPct(result.cumulativePct[result.factors - 1] ?? 0)} della varianza; omega = ${show(result.omega, 3)}.`,
    badge: result.omega >= 0.8 ? 'Affidabilità buona' : result.omega >= 0.7 ? 'Affidabilità accettabile' : 'Affidabilità da valutare',
    tone: result.omega >= 0.7 ? 'positive' : 'caution',
    intro: [
      `Soluzione ${result.rotation === 'varimax' ? 'varimax' : 'non ruotata'} su ${result.n} casi completi.`,
      `Bartlett χ²(${result.bartlettDf}) = ${show(result.bartlettChi2, 3)}, p = ${fmtP(result.bartlettP)}.`,
    ],
    sections: [
      {
        heading: 'Lettura',
        body: [
          strong > 0
            ? `Ci sono ${strong} loadings sostanziali (|λ| ≥ 0,40): controlla la tabella per attribuire i fattori alle variabili.`
            : 'Nessun loading raggiunge 0,40: la struttura fattoriale è debole o il numero di fattori è insufficiente.',
          `Omega totale = ${show(result.omega, 3)}: stima la quota di varianza affidabile della scala complessiva.`,
          'La parallel analysis confronta gli autovalori osservati con quelli di dati casuali con la stessa numerosità.',
        ],
      },
    ],
    limitations: [
      'La soluzione fattoriale non è unica: rotazioni e numero di fattori cambiano l’interpretazione.',
      'L’analisi fattoriale esplorativa non sostituisce una CFA con ipotesi pre-specificate.',
    ],
  };
};
