import { copy } from '../reportCopy';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';
import { describeP, isDecided } from './shared';

export interface NestedAnovaNames {
  dep: string;
  outer: string;
  inner: string;
}

export const nestedAnovaReport = (
  tables: TableSpec[],
  names: NestedAnovaNames,
  level: number
): ReportSpec => {
  const rows = tables.find(table => table.id === 'nested-anova-table')?.rows ?? [];
  const outer = rows[0] ?? {};
  const inner = rows[1] ?? {};
  const outerP = Number(outer.p ?? NaN);
  const innerP = Number(inner.p ?? NaN);

  return {
    id: 'report-nested-anova',
    title: copy('Report di lettura — ANOVA gerarchica'),
    headline: copy(
      '{s1} dentro {s2}: effetto esterno {s3}, effetto interno {s4}.',
      {
        s1: names.inner,
        s2: names.outer,
        s3: describeP(outerP),
        s4: describeP(innerP),
      }
    ),
    badge: copy('Confronto'),
    tone: isDecided(outerP, level) || isDecided(innerP, level) ? 'caution' : 'positive',
    intro: [
      copy('L’ANOVA gerarchica tratta un fattore annidato dentro un altro: ogni livello del fattore interno appartiene a un solo livello del fattore esterno.'),
      copy('È il disegno tipico di classi dentro scuole, soggetti dentro centri o lotti dentro fornitori.'),
    ],
    sections: [
      {
        heading: copy('Risultato'),
        body: [
          copy('Fattore esterno {s1}: F = {s2}, p = {s3}.', {
            s1: names.outer,
            s2: outer.f ?? '—',
            s3: describeP(outerP),
          }),
          copy('Fattore interno {s1}: F = {s2}, p = {s3}.', {
            s1: names.inner,
            s2: inner.f ?? '—',
            s3: describeP(innerP),
          }),
        ],
      },
      {
        heading: copy('Come leggerlo'),
        bullets: [
          copy('Se il fattore esterno è significativo, i gruppi maggiori differiscono tra loro oltre la variabilità delle sottoclassi.'),
          copy('Se il fattore interno è significativo, le sottoclassi differiscono dentro i gruppi: la struttura annidata spiega una parte della variabilità.'),
          copy('Non interpretare il fattore interno come un effetto principale “pulito”: il suo significato dipende dal fattore esterno.'),
        ],
      },
    ],
    limitations: [
      copy('Il modello assume normalità e varianza costante entro cella; con celle molto sbilanciate le stime dei componenti di varianza sono approssimate.'),
    ],
  };
};
