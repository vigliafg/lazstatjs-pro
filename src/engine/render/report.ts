import type { ReportSpec } from '../../stats/reports/shared';
import { escapeHtml, escapeMarkdown } from './table';

export const reportToMarkdown = (report: ReportSpec): string => {
  const lines: string[] = [`## ${escapeMarkdown(report.title)}`, '', `**${escapeMarkdown(report.headline)}**`, ''];
  for (const paragraph of report.intro) lines.push(escapeMarkdown(paragraph), '');
  for (const section of report.sections) {
    lines.push(`### ${escapeMarkdown(section.heading)}`, '');
    for (const paragraph of section.body ?? []) lines.push(escapeMarkdown(paragraph), '');
    for (const bullet of section.bullets ?? []) lines.push(`- ${escapeMarkdown(bullet)}`);
    if (section.bullets?.length) lines.push('');
  }
  if (report.limitations.length > 0) {
    lines.push('### Limitations', '');
    for (const limitation of report.limitations) lines.push(`- ${escapeMarkdown(limitation)}`);
    lines.push('');
  }
  return lines.join('\n').trimEnd();
};

export const reportToHtml = (report: ReportSpec): string => {
  const intro = report.intro.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('');
  const sections = report.sections
    .map(section => {
      const body = (section.body ?? []).map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('');
      const bullets = section.bullets?.length
        ? `<ul>${section.bullets.map(bullet => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>`
        : '';
      return `<h4>${escapeHtml(section.heading)}</h4>${body}${bullets}`;
    })
    .join('');
  const limitations = report.limitations.length
    ? `<h4>Limitations</h4><ul>${report.limitations
        .map(limitation => `<li>${escapeHtml(limitation)}</li>`)
        .join('')}</ul>`
    : '';
  return `<section class="report-block" data-report="${escapeHtml(report.id)}">
<h3>${escapeHtml(report.title)}</h3>
<p class="headline"><strong>${escapeHtml(report.headline)}</strong></p>
${intro}
${sections}
${limitations}
</section>`;
};
