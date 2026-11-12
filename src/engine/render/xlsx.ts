import type { WorkbookSheet } from '../../io/xlsx';
import { writeWorkbook } from '../../io/xlsx';
import type { TableSpec } from '../../stats/types';
import { formatCell } from '../../stats/format';
import type { SuccessEnvelope } from '../result';

const tableSheet = (table: TableSpec): WorkbookSheet => {
  const rows: (string | number)[][] = [];
  rows.push(table.columns.map(column => column.label));
  for (const row of table.rows) {
    rows.push(table.columns.map(column => formatCell(row[column.key], column.format)));
  }
  if (table.subtitle) rows.unshift([table.subtitle]);
  if (table.notes?.length) rows.push([], ...table.notes.map(note => [note]));
  return { name: table.title, rows };
};

const infoSheet = (envelope: SuccessEnvelope): WorkbookSheet => ({
  name: 'Info',
  rows: [
    ['LazStats'],
    ['Version', envelope.engine.version],
    ['Analysis', `${envelope.analysis.id} — ${envelope.analysis.label}`],
    ['Input', envelope.input.source],
    ['Rows', envelope.input.rows],
    ['Columns', envelope.input.columns],
    ['Confidence', `${envelope.ciLevel}%`],
    ['Report locale', envelope.reportLocale],
    ['Schema version', envelope.schemaVersion],
  ],
});

const reportSheet = (envelope: SuccessEnvelope): WorkbookSheet | null => {
  const report = envelope.result.report;
  if (!report) return null;
  const rows: (string | number)[][] = [
    [report.title],
    [report.headline],
    [],
    ...report.intro.map(paragraph => [paragraph]),
  ];
  for (const section of report.sections) {
    rows.push([], [section.heading]);
    for (const paragraph of section.body ?? []) rows.push([paragraph]);
    for (const bullet of section.bullets ?? []) rows.push([`• ${bullet}`]);
  }
  if (report.limitations.length > 0) {
    rows.push([], ['Limitations']);
    for (const limitation of report.limitations) rows.push([`• ${limitation}`]);
  }
  return { name: 'Report', rows };
};

const dataSheet = (envelope: SuccessEnvelope): WorkbookSheet | null => {
  if (!envelope.data) return null;
  return {
    name: 'Data',
    rows: [
      envelope.data.cols.map(column => column.name),
      ...envelope.data.rows.map(row => [...row]),
    ],
  };
};

export const renderXlsx = (
  envelope: SuccessEnvelope,
  includeDataSheet = false
): Uint8Array => {
  const sheets: WorkbookSheet[] = [infoSheet(envelope)];
  for (const table of envelope.result.tables) sheets.push(tableSheet(table));
  const report = reportSheet(envelope);
  if (report) sheets.push(report);
  if (includeDataSheet) {
    const data = dataSheet(envelope);
    if (data) sheets.push(data);
  }
  return writeWorkbook(sheets);
};
