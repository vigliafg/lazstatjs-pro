import { buildReportDocument } from '../../io/reportExport';
import type { SuccessEnvelope } from '../result';
import { chartKey, type ChartSvg } from './chart';
import { escapeHtml, tableToHtml } from './table';
import { reportToHtml } from './report';

const svgFor = (svgs: ChartSvg[], id: string): string | null =>
  svgs.find(entry => entry.key === chartKey(id))?.svg ?? null;

export const renderHtml = (envelope: SuccessEnvelope, svgs: ChartSvg[] = []): string => {
  const result = envelope.result;
  const title = result.title ?? envelope.analysis.label;
  const body: string[] = [];
  body.push(`<section class="metadata"><p><strong>Analysis:</strong> ${escapeHtml(
    `${envelope.analysis.label} (${envelope.analysis.id})`
  )}</p><p><strong>Input:</strong> ${escapeHtml(envelope.input.source)} · ${envelope.input.rows} rows · ${
    envelope.input.columns
  } columns</p><p><strong>Confidence:</strong> ${envelope.ciLevel}% · <strong>Locale:</strong> ${escapeHtml(
    envelope.reportLocale
  )}</p></section>`);

  if (envelope.warnings.length > 0) {
    body.push(
      `<section class="warnings"><h3>Warnings</h3><ul>${envelope.warnings
        .map(warning => `<li>${escapeHtml(warning)}</li>`)
        .join('')}</ul></section>`
    );
  }

  if (result.report) body.push(reportToHtml(result.report));
  for (const table of result.tables) body.push(tableToHtml(table));

  const charts = [...(result.charts ?? []), ...(result.panels ?? [])];
  if (charts.length > 0) {
    body.push('<section class="charts"><h3>Charts</h3>');
    for (const chart of charts) {
      if (chart.kind === 'panel') {
        for (const child of chart.children) {
          const svg = svgFor(svgs, `${chart.id}-${child.id}`);
          if (svg) {
            body.push(
              `<figure data-chart-surface="true"><figcaption>${escapeHtml(
                `${chart.title} — ${child.title}`
              )}</figcaption>${svg}</figure>`
            );
          }
        }
      } else {
        const svg = svgFor(svgs, chart.id);
        if (svg) {
          body.push(
            `<figure data-chart-surface="true"><figcaption>${escapeHtml(
              chart.title
            )}</figcaption>${svg}</figure>`
          );
        }
      }
    }
    body.push('</section>');
  }

  return buildReportDocument(body.join('\n'), {
    title,
    generatedAt: envelope.generatedAt ?? '',
    lang: envelope.reportLocale,
    details: [
      `LazStats ${envelope.engine.version}`,
      `${envelope.input.rows} rows`,
      `${envelope.input.columns} columns`,
    ],
  });
};
