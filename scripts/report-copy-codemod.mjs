/**
 * One-off codemod: wraps the Italian prose of report builders and table specs
 * in `copy(...)`.
 *
 * The source text stays the message id (gettext style): `copy()` looks the
 * sentence up in the catalog of the active report locale and falls back to the
 * Italian source. Comments, imports and identifiers are never touched.
 *
 * Usage: `node scripts/report-copy-codemod.mjs src/stats/reports/ttest.ts`
 */
import { readFileSync, writeFileSync } from 'node:fs';

const path = process.argv[2];
if (!path) {
  console.error('usage: node scripts/report-copy-codemod.mjs <report.ts>');
  process.exit(1);
}

const MIN = 8;

const isProse = value => value.length >= MIN && /[a-zà-ù]/i.test(value) && /\s/.test(value);

const quotedEnd = (text, start) => {
  const quoteChar = text[start];
  for (let i = start + 1; i < text.length; i++) {
    if (text[i] === '\\') i += 1;
    else if (text[i] === quoteChar) return i;
  }
  return -1;
};

const stringEnd = (text, start) => quotedEnd(text, start);

const interpolationEnd = (text, start) => {
  let depth = 1;
  for (let i = start + 1; i < text.length; i++) {
    const ch = text[i];
    if (ch === '\\') {
      i += 1;
      continue;
    }
    if (ch === "'" || ch === '"') {
      const end = quotedEnd(text, i);
      if (end < 0) return -1;
      i = end;
      continue;
    }
    if (ch === '`') {
      const end = templateEnd(text, i);
      if (end < 0) return -1;
      i = end;
      continue;
    }
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
};

const templateEnd = (text, start) => {
  for (let i = start + 1; i < text.length; i++) {
    const ch = text[i];
    if (ch === '\\') i += 1;
    else if (ch === '`') return i;
    else if (ch === '$' && text[i + 1] === '{') {
      const end = interpolationEnd(text, i + 1);
      if (end < 0) return -1;
      i = end;
    }
  }
  return -1;
};

const quote = value => `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

/** True when the emitted code already ends with `copy(` (idempotent reruns). */
const alreadyWrapped = out => /(?:^|[^\w$.])copy\(\s*$/.test(out.slice(-16));

/** Rewrites every prose literal of a fragment, skipping comments. */
const rewrite = (text) => {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '/' && text[i + 1] === '/') {
      const end = text.indexOf('\n', i);
      const stop = end < 0 ? text.length : end;
      out += text.slice(i, stop);
      i = stop - 1;
      continue;
    }
    if (ch === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);
      const stop = end < 0 ? text.length : end + 2;
      out += text.slice(i, stop);
      i = stop - 1;
      continue;
    }
    if (ch === "'" || ch === '"') {
      const end = quotedEnd(text, i);
      if (end < 0) {
        out += text.slice(i);
        break;
      }
      const literal = text.slice(i, end + 1);
      const value = literal.slice(1, -1);
      out += isProse(value) && !alreadyWrapped(out) ? `copy(${literal})` : literal;
      i = end;
      continue;
    }
    if (ch === '`') {
      const end = templateEnd(text, i);
      if (end < 0) {
        out += text.slice(i);
        break;
      }
      const body = text.slice(i + 1, end);
      if (!body.includes('${')) {
        out += isProse(body) && !alreadyWrapped(out) ? `copy(${text.slice(i, end + 1)})` : text.slice(i, end + 1);
        i = end;
        continue;
      }
      const slots = [];
      let template = '';
      for (let k = 0; k < body.length; k++) {
        const current = body[k];
        if (current === '\\') {
          template += current + (body[k + 1] ?? '');
          k += 1;
          continue;
        }
        if (current === '$' && body[k + 1] === '{') {
          const close = interpolationEnd(body, k + 1);
          if (close < 0) throw new Error('unbalanced interpolation');
          const expression = rewrite(body.slice(k + 2, close));
          const name = `s${slots.length + 1}`;
          slots.push(`${name}: ${expression}`);
          template += `{${name}}`;
          k = close;
          continue;
        }
        template += current;
      }
      out += `copy(${quote(template)}, { ${slots.join(', ')} })`;
      i = end;
      continue;
    }
    out += ch;
  }
  return out;
};

const original = readFileSync(path, 'utf8');
let rewritten = rewrite(original);
const importPath = path.includes('/reports/') || path.includes('/tables/') ? '../reportCopy' : './reportCopy';
if (!rewritten.includes(`from '${importPath}'`)) {
  rewritten = rewritten.replace(/(^import[^;]*;\n)/m, `$1import { copy } from '${importPath}';\n`);
}
writeFileSync(path, rewritten);
const before = (original.match(/\bcopy\(/g) ?? []).length;
const after = (rewritten.match(/\bcopy\(/g) ?? []).length;
console.log(`${path}: ${after - before} literals wrapped`);
