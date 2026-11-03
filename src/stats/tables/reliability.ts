import { fmtEst } from '../format';
import { copy } from '../reportCopy';
import type { TableSpec } from '../types';
import type { ReliabilityResult } from '../reliability/types';

export const reliabilityTables = (result: ReliabilityResult, level: number): TableSpec[] => {
  const tables: TableSpec[] = [];
  if (result.growth) {
    const growth = result.growth;
    tables.push({
      id: 'reliability-growth-summary',
      title: copy('Crescita dell’affidabilità (Crow–AMSAA)'),
      subtitle: copy('{s1} guasti · ultimo tempo {s2} · CI {s3}%', {
        s1: growth.n,
        s2: fmtEst(growth.lastTime, 3),
        s3: level,
      }),
      columns: [
        { key: 'metric', label: copy('Voce'), format: 'text' },
        { key: 'value', label: copy('Valore'), format: 'text' },
      ],
      rows: [
        { metric: copy('Guasti cumulati'), value: String(growth.n), raw: growth.n },
        { metric: copy('Ultimo tempo'), value: fmtEst(growth.lastTime, 4), raw: growth.lastTime },
        { metric: copy('β (forma)'), value: fmtEst(growth.beta, 4), raw: growth.beta },
        { metric: copy('λ (scala)'), value: fmtEst(growth.lambda, 6), raw: growth.lambda },
        { metric: copy('MTBF cumulativo'), value: fmtEst(growth.mtbfCumulative, 4), raw: growth.mtbfCumulative },
        {
          metric: copy('MTBF istantaneo'),
          value: fmtEst(growth.mtbfInstantaneous, 4),
          raw: growth.mtbfInstantaneous,
        },
        { metric: copy('Tasso di crescita'), value: fmtEst(growth.growthRate, 4), raw: growth.growthRate },
        { metric: copy('Log-verosimiglianza'), value: fmtEst(growth.logLik, 3), raw: growth.logLik },
        { metric: copy('AIC'), value: fmtEst(growth.aic, 3), raw: growth.aic },
        ...result.warnings.map((warning, index) => ({
          metric: copy('Avviso {s1}', { s1: index + 1 }),
          value: warning,
          raw: NaN,
        })),
      ],
      notes: [
        copy('β < 1 indica un tasso di guasto decrescente, cioè un programma di crescita che sta funzionando; β = 1 è un processo Poisson omogeneo.'),
        copy('Il MTBF istantaneo è la vita media attesa nel momento attuale; quello cumulativo è la media dall’inizio.'),
        copy('Il modello assume un processo di Poisson non omogeneo con intensità a legge di potenza.'),
      ],
    });
    tables.push({
      id: 'reliability-growth-points',
      title: copy('Guasti cumulati e modello'),
      subtitle: copy('Osservati e attesi dal modello di Crow–AMSAA'),
      columns: [
        { key: 'time', label: copy('Tempo'), format: 'dec3' },
        { key: 'observed', label: copy('Osservati'), format: 'dec2' },
        { key: 'fitted', label: copy('Attesi'), format: 'dec3' },
      ],
      rows: growth.points.map(point => ({ ...point })),
      notes: [
        copy('Uno scostamento sistematico tra osservati e attesi suggerisce che la legge di potenza non descrive bene il processo.'),
      ],
    });
  }
  if (result.rbd) {
    const rbd = result.rbd;
    tables.push({
      id: 'reliability-rbd-summary',
      title: copy('Diagramma a blocchi di affidabilità'),
      subtitle: copy('{s1} stadi in serie · CI {s2}%', { s1: rbd.stages.length, s2: level }),
      columns: [
        { key: 'metric', label: copy('Voce'), format: 'text' },
        { key: 'value', label: copy('Valore'), format: 'text' },
      ],
      rows: [
        {
          metric: copy('Affidabilità del sistema'),
          value: fmtEst(rbd.system, 6),
          raw: rbd.system,
        },
        {
          metric: copy('Inaffidabilità del sistema'),
          value: fmtEst(rbd.systemUnreliability, 6),
          raw: rbd.systemUnreliability,
        },
        ...result.warnings.map((warning, index) => ({
          metric: copy('Avviso {s1}', { s1: index + 1 }),
          value: warning,
          raw: NaN,
        })),
      ],
      notes: [
        copy('Il sistema è una serie di stadi: basta un guasto in uno stadio per fermare il sistema.'),
        copy('Dentro ogni stadio i componenti sono in parallelo: lo stadio funziona se almeno un componente funziona.'),
      ],
    });
    tables.push({
      id: 'reliability-rbd-stages',
      title: copy('Stadi del diagramma'),
      subtitle: copy('Affidabilità per stadio e componenti'),
      columns: [
        { key: 'stage', label: copy('Stadio'), format: 'int' },
        { key: 'components', label: copy('Componenti'), format: 'text' },
        { key: 'reliability', label: copy('Affidabilità'), format: 'dec4' },
        { key: 'unreliability', label: copy('Inaffidabilità'), format: 'dec4' },
      ],
      rows: rbd.stages.map(stage => ({
        stage: stage.index,
        components: stage.reliabilities.map(value => fmtEst(value, 4)).join(', '),
        reliability: stage.reliability,
        unreliability: stage.unreliability,
      })),
      notes: [
        copy('L’affidabilità dello stadio è 1 − Π(1 − r_i): aggiungere un componente in parallelo aumenta l’affidabilità.'),
      ],
    });
  }
  return tables;
};
