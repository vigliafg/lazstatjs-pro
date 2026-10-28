import { fmtEst, fmtP } from '../format';
import type { ReportSpec } from '../report';
import type { GeeStats } from '../gee/types';

export const geeReport = (stats: GeeStats, level: number): ReportSpec => ({
  id: 'gee',
  title: 'Report GEE',
  headline: `Modello ${stats.family === 'gaussian' ? 'gaussiano' : 'binomiale'} con correlazione ${stats.correlation} su ${stats.clusters} cluster.`,
  badge: stats.clusters >= 10 ? 'Inferenza cluster-robusta' : 'Pochi cluster',
  tone: stats.clusters >= 10 ? 'neutral' : 'caution',
  intro: [
    `N = ${stats.n}; dimensione massima cluster = ${stats.maxCluster}.`,
    `Alpha = ${fmtEst(stats.alpha, 3)}; phi = ${fmtEst(stats.phi, 3)}.`,
  ],
  sections: [
    {
      heading: 'Lettura',
      body: [
        'GEE stima effetti marginali (population-averaged), non effetti condizionati al cluster come i modelli misti.',
        'Gli errori standard robusti tengono conto della correlazione dentro cluster; con pochi cluster sono instabili.',
        `I coefficienti sono interpretabili come nel GLM corrispondente; il livello di confidenza è ${level}%.`,
      ],
    },
  ],
  limitations: [
    'La correlazione di lavoro è exchangeable o independence, non AR(1) o non strutturata.',
    'Con meno di 10–15 cluster il sandwich può sottostimare l’errore.',
    'GEE non fornisce previsioni specifiche per cluster né componenti di varianza.',
  ],
});
