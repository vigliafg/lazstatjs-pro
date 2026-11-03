import { copy } from '../reportCopy';
import type { TableSpec } from '../types';
import type { PropensityResult } from '../kernels/propensity';

export interface PropensityTableNames {
  treatment: string;
  outcome: string;
}

/** Tables of one propensity-score run: model, balance, ATT and sample. */
export const propensityTables = (
  result: PropensityResult,
  names: PropensityTableNames,
  level: number
): TableSpec[] => {
  const methodLabel =
    result.method === 'nearest'
      ? copy('Vicinino più prossimo (1:{s1})', { s1: result.ratio })
      : copy('Ponderazione per probabilità inversa (IPW)');
  const caliperLabel =
    result.caliper > 0
      ? copy('caliper {s1} DP del punteggio', { s1: result.caliper })
      : copy('nessun caliper');

  return [
    {
      id: 'propensity-model',
      title: copy('Modello di propensione'),
      subtitle: copy('{s1} ~ covariabili · logit · CI {s2}%', {
        s1: names.treatment,
        s2: level,
      }),
      columns: [
        { key: 'term', label: copy('Termine'), format: 'text' },
        { key: 'beta', label: copy('B'), format: 'dec4' },
        { key: 'se', label: copy('SE'), format: 'dec4' },
        { key: 'z', label: copy('z'), format: 'dec3' },
        { key: 'p', label: copy('p'), format: 'p' },
      ],
      rows: result.ps.coefficients.map(coefficient => ({
        term: coefficient.term,
        beta: coefficient.beta,
        se: coefficient.se,
        z: coefficient.z,
        p: coefficient.p,
      })),
      notes: [
        copy('Il punteggio di propensione è la probabilità stimata di trattamento; i coefficienti sono sulla scala logit.'),
        copy('Il modello serve a bilanciare i gruppi, non a spiegare l’esito: non interpretarlo come un modello causale.'),
      ],
    },
    {
      id: 'propensity-balance',
      title: copy('Bilanciamento delle covariabili'),
      subtitle: copy('Differenza standardizzata prima e dopo · {s1}', { s1: methodLabel }),
      columns: [
        { key: 'covariate', label: copy('Covariabile'), format: 'text' },
        { key: 'meanTreated', label: copy('Media trattati'), format: 'dec4' },
        { key: 'meanControlBefore', label: copy('Media controlli prima'), format: 'dec4' },
        { key: 'meanControlAfter', label: copy('Media controlli dopo'), format: 'dec4' },
        { key: 'smdBefore', label: copy('SMD prima'), format: 'dec4' },
        { key: 'smdAfter', label: copy('SMD dopo'), format: 'dec4' },
      ],
      rows: result.balance.map(row => ({
        covariate: row.covariate,
        meanTreated: row.meanTreated,
        meanControlBefore: row.meanControlBefore,
        meanControlAfter: row.meanControlAfter,
        smdBefore: row.smdBefore,
        smdAfter: row.smdAfter,
      })),
      notes: [
        copy('SMD = differenza delle medie divisa per la deviazione standard pooled calcolata sull’intero campione prima del matching.'),
        copy('Valori assoluti sotto 0.1 indicano uno squilibrio trascurabile; la soglia è una convenzione, non un test.'),
      ],
    },
    {
      id: 'propensity-att',
      title: copy('Effetto medio sul trattato (ATT)'),
      subtitle: copy('{s1} su {s2} · {s3} · CI {s4}%', {
        s1: names.outcome,
        s2: names.treatment,
        s3: methodLabel,
        s4: level,
      }),
      columns: [
        { key: 'method', label: copy('Metodo'), format: 'text' },
        { key: 'estimate', label: copy('ATT'), format: 'dec4' },
        { key: 'se', label: copy('SE'), format: 'dec4' },
        { key: 'z', label: copy('z'), format: 'dec3' },
        { key: 'p', label: copy('p'), format: 'p' },
        { key: 'lo', label: copy('CI low'), format: 'dec4' },
        { key: 'hi', label: copy('CI high'), format: 'dec4' },
      ],
      rows: [
        {
          method: result.method === 'nearest' ? copy('Matching') : 'IPW',
          estimate: result.att.estimate,
          se: result.att.se,
          z: result.att.z,
          p: result.att.p,
          lo: result.att.lo,
          hi: result.att.hi,
        },
      ],
      notes: [
        result.method === 'nearest'
          ? copy('ATT = media delle differenze appaiate; SE = errore standard di tali differenze. {s1}.', {
              s1: caliperLabel,
            })
          : copy('ATT = differenza delle medie pesate (trattati 1, controlli e/(1−e)); SE dalla regressione WLS.'),
      ],
    },
    {
      id: 'propensity-sample',
      title: copy('Campione e supporto comune'),
      subtitle: copy('{s1}', { s1: methodLabel }),
      columns: [
        { key: 'metric', label: copy('Voce'), format: 'text' },
        { key: 'value', label: copy('Valore'), format: 'text' },
      ],
      rows: [
        { metric: copy('N trattati'), value: String(result.nTreated) },
        { metric: copy('N controlli'), value: String(result.nControl) },
        { metric: copy('Trattati analizzati'), value: String(result.matchedTreated) },
        { metric: copy('Controlli analizzati'), value: String(result.matchedControls) },
        { metric: copy('Trattati scartati (fuori caliper)'), value: String(result.droppedTreated) },
        {
          metric: copy('Effective sample size'),
          value: result.effectiveSampleSize.toFixed(2),
        },
        {
          metric: copy('Supporto comune'),
          value: `${result.commonSupport.lo.toFixed(4)} – ${result.commonSupport.hi.toFixed(4)}`,
        },
      ],
      notes: [
        copy('Con reimmissione lo stesso controllo può essere usato più volte: “controlli analizzati” conta gli appaiamenti, non le unità distinte.'),
        copy('L’effective sample size misura quanta informazione resta dopo la ponderazione; valori molto inferiori al campione indicano pesi estremi.'),
      ],
    },
  ];
};
