import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { TableSpec } from '../types';
import type { CapabilityResult, ControlResult, ParetoResult } from '../kernels/quality';

export interface QualityControlTablesOptions {
  result: ControlResult;
  variableName: string;
}

export const controlTables = ({ result, variableName }: QualityControlTablesOptions): TableSpec[] => {
  const rows: TableSpec['rows'] = [
    { metric: copy('Tipo di carta'), value: result.chart.toUpperCase() },
    { metric: copy('Centro (CL)'), value: fmtEst(result.center, 4) },
    { metric: copy('Sigma stimata'), value: fmtEst(result.sigma, 4) },
    { metric: copy('Limite superiore (UCL)'), value: fmtEst(result.ucl, 4) },
    { metric: copy('Limite inferiore (LCL)'), value: fmtEst(result.lcl, 4) },
    { metric: copy('Punti fuori controllo'), value: result.outCount },
  ];
  if (result.chart === 'xbar') {
    rows.push(
      { metric: copy('Dimensione sottogruppo'), value: result.subgroup },
      { metric: copy('Centro della gamma (R̄)'), value: fmtEst(result.rCenter ?? NaN, 4) },
      { metric: copy('Limite superiore R'), value: fmtEst(result.rUcl ?? NaN, 4) },
      { metric: copy('Limite inferiore R'), value: fmtEst(result.rLcl ?? NaN, 4) }
    );
    if (result.subgroupSizes && result.subgroupSizes.length > 1) {
      rows.push({
        metric: copy('Sottogruppi a dimensione variabile'),
        value: result.subgroupSizes.join(', '),
      });
    }
  }
  const tables: TableSpec[] = [
    {
      id: 'quality-control-summary',
      title: copy('Sintesi della carta di controllo'),
      subtitle: variableName,
      columns: [
        { key: 'metric', label: copy('Metrica'), align: 'left' },
        { key: 'value', label: copy('Valore'), align: 'right' },
      ],
      rows,
    },
  ];
  if (result.ranges && result.ranges.length > 0) {
    tables.push({
      id: 'quality-control-ranges',
      title: copy('Sottogruppi e ampiezze'),
      subtitle: copy('{s1} sottogruppi di {s2}', { s1: result.ranges.length, s2: result.subgroup }),
      columns: [
        { key: 'subgroup', label: copy('Sottogruppo'), format: 'int', align: 'right' },
        ...(result.subgroupSizes
          ? [{ key: 'n', label: copy('N sottogruppo'), format: 'int' as const, align: 'right' as const }]
          : []),
        { key: 'mean', label: copy('Media'), format: 'dec3', align: 'right' },
        { key: 'range', label: copy('Ampiezza'), format: 'dec3', align: 'right' },
        ...(result.limits.length > 0
          ? [
              { key: 'lcl', label: copy('LCL del punto'), format: 'dec3' as const, align: 'right' as const },
              { key: 'ucl', label: copy('UCL del punto'), format: 'dec3' as const, align: 'right' as const },
            ]
          : []),
      ],
      rows: result.points.map((point, index) => ({
        subgroup: index + 1,
        ...(result.subgroupSizes ? { n: result.subgroupSizes[index] ?? null } : {}),
        mean: point.value,
        range: result.ranges?.[index] ?? null,
        ...(result.limits.length > 0
          ? { lcl: result.limits[index]?.lcl ?? null, ucl: result.limits[index]?.ucl ?? null }
          : {}),
      })),
    });
  }
  return tables;
};

export const capabilityTables = (result: CapabilityResult, variableName: string): TableSpec[] => [
  {
    id: 'quality-capability',
    title: copy('Capacità del processo'),
    subtitle: variableName,
    columns: [
      { key: 'metric', label: copy('Metrica'), align: 'left' },
      { key: 'value', label: copy('Valore'), align: 'right' },
    ],
    rows: [
      { metric: copy('N'), value: result.n },
      { metric: copy('Media'), value: fmtEst(result.mean, 4) },
      { metric: copy('Deviazione standard'), value: fmtEst(result.sd, 4) },
      { metric: copy('Minimo'), value: fmtEst(result.min, 4) },
      { metric: copy('Massimo'), value: fmtEst(result.max, 4) },
      { metric: copy('LSL'), value: fmtEst(result.lsl, 4) },
      { metric: copy('USL'), value: fmtEst(result.usl, 4) },
      { metric: copy('Target'), value: fmtEst(result.target, 4) },
      { metric: copy('Cp'), value: fmtEst(result.cp, 3) },
      { metric: copy('Cpk'), value: fmtEst(result.cpk, 3) },
      { metric: copy('CPU'), value: fmtEst(result.cpu, 3) },
      { metric: copy('CPL'), value: fmtEst(result.cpl, 3) },
      { metric: copy('Fuori specifica (%)'), value: fmtEst(result.pctOut, 4) },
      { metric: copy('Fuori specifica (ppm)'), value: fmtEst(result.ppm, 1) },
    ],
  },
];

export const paretoTables = (result: ParetoResult, categoryName: string): TableSpec[] => [
  {
    id: 'quality-pareto',
    title: copy('Conteggi del Pareto'),
    subtitle: copy('{s1} · {s2} osservazioni', { s1: categoryName, s2: result.total }),
    columns: [
      { key: 'category', label: copy('Categoria'), align: 'left' },
      { key: 'count', label: copy('Conteggio'), format: 'int', align: 'right' },
      { key: 'pct', label: copy('Percentuale'), format: 'dec1', align: 'right' },
      { key: 'cumulative', label: copy('Cumulata (%)'), format: 'dec1', align: 'right' },
    ],
    rows: result.rows.map(row => ({
      category: row.category,
      count: row.count,
      pct: row.pct,
      cumulative: row.cumulative,
    })),
  },
];

export interface VariabilityRow {
  category: string;
  n: number;
  mean: number;
  sd: number;
  min: number;
  max: number;
}

export const variabilityTables = (
  rows: VariabilityRow[],
  variableName: string,
  groupName: string
): TableSpec[] => [
  {
    id: 'quality-variability',
    title: copy('Variabilità per gruppo'),
    subtitle: copy('{s1} per {s2}', { s1: variableName, s2: groupName }),
    columns: [
      { key: 'category', label: groupName, align: 'left' },
      { key: 'n', label: copy('N'), format: 'int', align: 'right' },
      { key: 'mean', label: copy('Media'), format: 'dec3', align: 'right' },
      { key: 'sd', label: copy('Deviazione standard'), format: 'dec3', align: 'right' },
      { key: 'min', label: copy('Minimo'), format: 'dec3', align: 'right' },
      { key: 'max', label: copy('Massimo'), format: 'dec3', align: 'right' },
    ],
    rows: rows.map(row => ({ ...row })),
  },
];
