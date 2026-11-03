#!/usr/bin/env node
/**
 * chart-inventory — static inventory of the AnalysisChart models emitted by the
 * procedure runners.
 *
 * It reads every non-test `.ts`/`.tsx` module under `src/analyses/<id>/`,
 * finds the `makeChart({ ... })` calls and reports the `id` and `kind` of each
 * model. No module is imported and no analysis is executed.
 *
 * Usage:
 *   node scripts/chart-inventory.mjs [--analysis <id>] [--json]
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = 'src/analyses';
const CALL = 'makeChart(';
const SKIP = /\.(test|spec)\.(ts|tsx)$|\.d\.ts$/;

const walk = directory => {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(path));
    else if (/\.(ts|tsx)$/.test(entry.name) && !SKIP.test(entry.name)) files.push(path);
  }
  return files.sort();
};

/** Skip a quoted or template string starting at `start`; returns the next index. */
const skipString = (source, start) => {
  const quote = source[start];
  let index = start + 1;
  while (index < source.length) {
    const char = source[index];
    if (char === '\\') {
      index += 2;
      continue;
    }
    if (char === quote) return index + 1;
    if (quote === '`' && char === '$' && source[index + 1] === '{') {
      index += 2;
      let depth = 1;
      while (index < source.length && depth > 0) {
        const inner = source[index];
        if (inner === "'" || inner === '"' || inner === '`') {
          index = skipString(source, index);
          continue;
        }
        if (inner === '{') depth += 1;
        else if (inner === '}') depth -= 1;
        index += 1;
      }
      continue;
    }
    index += 1;
  }
  return index;
};

/** Index of the `}` matching the `{` at `open`, or -1. */
const matchingBrace = (source, open) => {
  let depth = 0;
  let index = open;
  while (index < source.length) {
    const char = source[index];
    if (char === "'" || char === '"' || char === '`') {
      index = skipString(source, index);
      continue;
    }
    if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
    index += 1;
  }
  return -1;
};

const lineNumber = (source, index) => source.slice(0, index).split('\n').length;

const unquote = text => {
  const trimmed = text.trim();
  const quote = trimmed[0];
  if ((quote === "'" || quote === '"' || quote === '`') && trimmed.endsWith(quote)) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
};

/** Value of a top-level property of an object literal (quotes stripped). */
const property = (chunk, key) => {
  let depth = 0;
  let index = 0;
  while (index < chunk.length) {
    const char = chunk[index];
    if (char === "'" || char === '"' || char === '`') {
      index = skipString(chunk, index);
      continue;
    }
    if (char === '{' || char === '[' || char === '(') {
      depth += 1;
      index += 1;
      continue;
    }
    if (char === '}' || char === ']' || char === ')') {
      depth -= 1;
      index += 1;
      continue;
    }
    const before = index === 0 ? '' : chunk[index - 1];
    const isKey =
      depth === 1 &&
      !/[A-Za-z0-9_$]/.test(before) &&
      chunk.startsWith(`${key}:`, index);
    if (!isKey) {
      index += 1;
      continue;
    }
    let end = index + key.length + 1;
    let inner = 0;
    while (end < chunk.length) {
      const next = chunk[end];
      if (next === "'" || next === '"' || next === '`') {
        end = skipString(chunk, end);
        continue;
      }
      if (next === '{' || next === '[' || next === '(') inner += 1;
      else if (next === '}' || next === ']' || next === ')') {
        if (inner === 0) break;
        inner -= 1;
      } else if (next === ',' && inner === 0) break;
      end += 1;
    }
    return unquote(chunk.slice(index + key.length + 1, end));
  }
  return null;
};

const chartsIn = (source, file) => {
  const charts = [];
  let index = source.indexOf(CALL);
  while (index !== -1) {
    const open = source.indexOf('{', index + CALL.length);
    if (open === -1) break;
    const close = matchingBrace(source, open);
    if (close === -1) {
      index = source.indexOf(CALL, index + CALL.length);
      continue;
    }
    const chunk = source.slice(open, close + 1);
    charts.push({
      id: property(chunk, 'id') ?? '(non leggibile)',
      kind: property(chunk, 'kind') ?? '(non leggibile)',
      file,
      line: lineNumber(source, index),
    });
    index = source.indexOf(CALL, close);
  }
  return charts;
};

const inventory = new Map();
for (const file of walk(ROOT)) {
  const rel = relative(ROOT, file);
  if (!rel.includes(sep)) continue;
  const analysis = rel.split(sep)[0];
  const source = readFileSync(file, 'utf8');
  if (!source.includes(CALL)) continue;
  const charts = chartsIn(source, file);
  if (!charts.length) continue;
  if (!inventory.has(analysis)) inventory.set(analysis, []);
  inventory.get(analysis).push(...charts);
}

const analyses = [...inventory.keys()].sort();
for (const analysis of analyses) {
  inventory.get(analysis).sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
}

const kinds = {};
for (const charts of inventory.values()) {
  for (const chart of charts) kinds[chart.kind] = (kinds[chart.kind] ?? 0) + 1;
}
const total = [...inventory.values()].reduce((sum, charts) => sum + charts.length, 0);

const args = process.argv.slice(2);
const wanted = args.includes('--analysis') ? args[args.indexOf('--analysis') + 1] : null;
const asJson = args.includes('--json');

if (wanted && !inventory.has(wanted)) {
  console.error(`Analisi sconosciuta: ${wanted}`);
  console.error(`Analisi disponibili: ${analyses.join(', ')}`);
  process.exit(1);
}

if (asJson) {
  const body = {};
  for (const analysis of wanted ? [wanted] : analyses) body[analysis] = inventory.get(analysis) ?? [];
  console.log(JSON.stringify({ total, analyses: body, kinds }, null, 2));
  process.exit(0);
}

const lines = [];
if (wanted) {
  lines.push(`# Inventario dei grafici — \`${wanted}\``, '');
  lines.push(`Modelli emessi: **${(inventory.get(wanted) ?? []).length}**.`, '');
} else {
  lines.push('# Inventario dei grafici delle procedure', '');
  lines.push('Sorgente: scansione statica di `src/analyses/*/` (esclusi i test).');
  lines.push('Comando: `npm run chart:inventory`.', '');
  lines.push('## Totali', '');
  lines.push(`- Analisi con almeno un grafico: **${analyses.length}**`);
  lines.push(`- Modelli \`AnalysisChart\` emessi: **${total}**`);
  lines.push(`- Kind distinti: **${Object.keys(kinds).length}**`, '');
  lines.push('## Grafici per analisi', '');
  lines.push('| Analisi | Grafici |');
  lines.push('|---|---:|');
  for (const analysis of analyses) lines.push(`| \`${analysis}\` | ${inventory.get(analysis).length} |`);
  lines.push('');
  lines.push('## Kind usati', '');
  lines.push('| Kind | Modelli |');
  lines.push('|---|---:|');
  for (const kind of Object.keys(kinds).sort()) lines.push(`| \`${kind}\` | ${kinds[kind]} |`);
  lines.push('');
}

const sections = wanted ? [wanted] : analyses;
for (const analysis of sections) {
  lines.push(`### \`${analysis}\` (${inventory.get(analysis).length})`, '');
  lines.push('| Grafico | Kind | File |');
  lines.push('|---|---|---|');
  for (const chart of inventory.get(analysis)) {
    lines.push(`| \`${chart.id}\` | \`${chart.kind}\` | \`${chart.file}:${chart.line}\` |`);
  }
  lines.push('');
}

process.stdout.write(`${lines.join('\n')}\n`);
