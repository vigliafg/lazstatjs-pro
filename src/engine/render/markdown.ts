import type { SuccessEnvelope } from '../result';
import { reportToMarkdown } from './report';
import { escapeMarkdown, tableToMarkdown } from './table';

export const renderMarkdown = (envelope: SuccessEnvelope): string => {
  const result = envelope.result;
  const lines: string[] = [];
  lines.push(`# ${escapeMarkdown(result.title ?? envelope.analysis.label)}`, '');
  lines.push(
    `- **Analysis:** ${escapeMarkdown(envelope.analysis.id)} (${escapeMarkdown(envelope.analysis.family)})`,
    `- **Input:** ${escapeMarkdown(envelope.input.source)}`,
    `- **Rows / columns:** ${envelope.input.rows} / ${envelope.input.columns}`,
    `- **Confidence:** ${envelope.ciLevel}%`,
    `- **Report locale:** ${escapeMarkdown(envelope.reportLocale)}`,
    ''
  );
  if (envelope.warnings.length > 0) {
    lines.push('## Warnings', '');
    for (const warning of envelope.warnings) lines.push(`- ${escapeMarkdown(warning)}`);
    lines.push('');
  }
  if (result.report) {
    lines.push(reportToMarkdown(result.report), '');
  }
  if (result.tables.length > 0) {
    lines.push('## Tables', '');
    for (const table of result.tables) lines.push(tableToMarkdown(table), '');
  }
  const charts = [...(result.charts ?? []), ...(result.panels ?? [])];
  if (charts.length > 0) {
    lines.push('## Charts', '');
    for (const chart of charts) {
      lines.push(`- **${escapeMarkdown(chart.title)}** (\`${chart.id}\`)`);
    }
    lines.push('');
  }
  return `${lines.join('\n').trimEnd()}\n`;
};
