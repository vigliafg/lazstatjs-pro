import { copy } from '../reportCopy';
import { fmtEst, fmtP } from '../format';
import type { TableSpec } from '../types';
import type { DoeResult } from '../kernels/doe';

export interface DoeTablesOptions {
  result: DoeResult;
  responseName: string;
  factorAName: string;
  factorBName: string;
}

export const doeTables = ({
  result,
  responseName,
  factorAName,
  factorBName,
}: DoeTablesOptions): TableSpec[] => {
  const model: TableSpec = {
    id: 'doe-model',
    title: copy('Modello della superficie'),
    subtitle: copy('{s1} ~ {s2} + {s3}', {
      s1: responseName,
      s2: factorAName,
      s3: factorBName,
    }),
    columns: [
      { key: 'term', label: copy('Termine'), align: 'left' },
      { key: 'estimate', label: copy('Stima'), format: 'dec4', align: 'right' },
      { key: 'se', label: copy('Errore standard'), format: 'dec4', align: 'right' },
      { key: 't', label: 't', format: 'dec3', align: 'right' },
      { key: 'p', label: 'p', format: 'p', align: 'right' },
    ],
    rows: result.terms.map(term => ({
      term: term.name
        .replace('A', factorAName)
        .replace('B', factorBName),
      estimate: term.estimate,
      se: term.se,
      t: term.t,
      p: term.p,
    })),
  };

  const fit: TableSpec = {
    id: 'doe-fit',
    title: copy('Bontà del modello'),
    subtitle: copy('N = {s1} · {s2} parametri', { s1: result.n, s2: result.rank }),
    columns: [
      { key: 'metric', label: copy('Metrica'), align: 'left' },
      { key: 'value', label: copy('Valore'), align: 'right' },
    ],
    rows: [
      { metric: 'R²', value: fmtEst(result.r2, 4) },
      { metric: copy('R² corretto'), value: fmtEst(result.adjR2, 4) },
      { metric: copy('RMSE'), value: fmtEst(result.rmse, 4) },
      { metric: 'F', value: fmtEst(result.f, 3) },
      { metric: copy('p del modello'), value: fmtP(result.fP) },
    ],
  };

  const tables = [model, fit];
  if (result.stationary) {
    tables.push({
      id: 'doe-stationary',
      title: copy('Punto stazionario'),
      subtitle:
        result.stationary.kind === 'minimum'
          ? copy('Minimo della superficie')
          : result.stationary.kind === 'maximum'
            ? copy('Massimo della superficie')
            : copy('Punto di sella'),
      columns: [
        { key: 'metric', label: copy('Metrica'), align: 'left' },
        { key: 'value', label: copy('Valore'), align: 'right' },
      ],
      rows: [
        { metric: factorAName, value: fmtEst(result.stationary.a, 4) },
        { metric: factorBName, value: fmtEst(result.stationary.b, 4) },
        { metric: responseName, value: fmtEst(result.stationary.z, 4) },
      ],
    });
  }
  return tables;
};
