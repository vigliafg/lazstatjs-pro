import type { TableSpec } from '../../stats/types';
import { formatCell } from '../../stats/format';

export const escapeMarkdown = (value: string): string =>
  value.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');

export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const cellText = (value: unknown, format?: TableSpec['columns'][number]['format']): string =>
  formatCell(value as never, format);

export const tableToMarkdown = (table: TableSpec): string => {
  const lines: string[] = [];
  lines.push(`### ${escapeMarkdown(table.title)}`);
  if (table.subtitle) lines.push('', `_${escapeMarkdown(table.subtitle)}_`);
  lines.push('');
  if (table.columns.length === 0) {
    lines.push('_No columns._');
    return lines.join('\n');
  }
  lines.push(`| ${table.columns.map(column => escapeMarkdown(column.label)).join(' | ')} |`);
  lines.push(
    `| ${table.columns
      .map(column => (column.align === 'right' ? '---:' : column.align === 'left' ? ':---' : '---'))
      .join(' | ')} |`
  );
  for (const row of table.rows) {
    lines.push(
      `| ${table.columns
        .map(column => escapeMarkdown(cellText(row[column.key], column.format)))
        .join(' | ')} |`
    );
  }
  if (table.notes?.length) {
    lines.push('');
    for (const note of table.notes) lines.push(`> ${escapeMarkdown(note)}`);
  }
  return lines.join('\n');
};

export const tableToHtml = (table: TableSpec): string => {
  const head = table.columns
    .map(column => {
      const align = column.align ? ` style="text-align:${column.align}"` : '';
      return `<th${align}>${escapeHtml(column.label)}</th>`;
    })
    .join('');
  const body = table.rows
    .map(
      row =>
        `<tr>${table.columns
          .map(column => {
            const align = column.align ? ` style="text-align:${column.align}"` : '';
            return `<td${align}>${escapeHtml(cellText(row[column.key], column.format))}</td>`;
          })
          .join('')}</tr>`
    )
    .join('');
  const notes = table.notes?.length
    ? `<ul class="table-notes">${table.notes.map(note => `<li>${escapeHtml(note)}</li>`).join('')}</ul>`
    : '';
  return `<section class="table-block" data-table="${escapeHtml(table.id)}">
<h3>${escapeHtml(table.title)}</h3>
${table.subtitle ? `<p class="subtitle">${escapeHtml(table.subtitle)}</p>` : ''}
<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
${notes}
</section>`;
};
