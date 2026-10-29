import { fmtEst, fmtP } from '../format';
import { copy } from '../reportCopy';
import type { ReportSpec } from '../report';
import type { GeeStats } from '../gee/types';

export const geeReport = (stats: GeeStats, level: number): ReportSpec => ({
  id: 'gee',
  title: copy('Report GEE'),
  headline: copy('Modello {s1} con correlazione {s2} su {s3} cluster.', { s1: stats.family === 'gaussian' ? 'gaussiano' : 'binomiale', s2: stats.correlation, s3: stats.clusters }),
  badge: stats.clusters >= 10 ? copy('Inferenza cluster-robusta') : copy('Pochi cluster'),
  tone: stats.clusters >= 10 ? 'neutral' : 'caution',
  intro: [
    copy('N = {s1}; dimensione massima cluster = {s2}.', { s1: stats.n, s2: stats.maxCluster }),
    copy('Alpha = {s1}; phi = {s2}.', { s1: fmtEst(stats.alpha, 3), s2: fmtEst(stats.phi, 3) }),
  ],
  sections: [
    {
      heading: 'Lettura',
      body: [
        copy('GEE stima effetti marginali (population-averaged), non effetti condizionati al cluster come i modelli misti.'),
        copy('Gli errori standard robusti tengono conto della correlazione dentro cluster; con pochi cluster sono instabili.'),
        copy('I coefficienti sono interpretabili come nel GLM corrispondente; il livello di confidenza è {s1}%.', { s1: level }),
      ],
    },
  ],
  limitations: [
    copy('La correlazione di lavoro è exchangeable o independence, non AR(1) o non strutturata.'),
    copy('Con meno di 10–15 cluster il sandwich può sottostimare l’errore.'),
    copy('GEE non fornisce previsioni specifiche per cluster né componenti di varianza.'),
  ],
});
