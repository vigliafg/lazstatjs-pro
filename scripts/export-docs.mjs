/**
 * Export the machine-readable CLI and MCP contracts as repository reference
 * pages. `--check` fails when the committed pages are stale.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import {
  CLI_COMMANDS,
  CLI_DESCRIPTION,
  CLI_EXIT_CODES,
  CLI_OPTION_BY_KEY,
  CLI_OPTIONS,
} from '../src/cli/spec.ts';
import {
  MCP_ERROR_GUIDES,
  MCP_HELP_TOPICS,
  MCP_RULES,
  MCP_TOOL_GUIDES,
  MCP_WORKFLOW,
} from '../src/mcp/guide.ts';

const check = process.argv.includes('--check');
const generated = '<!-- Generato da scripts/export-docs.mjs: non modificare a mano. -->';
const cell = value => String(value).replace(/\|/g, '\\|').replace(/\n/g, ' ');

const optionTable = keys =>
  [
    '| Opzione | Descrizione |',
    '| --- | --- |',
    ...keys.map(key => {
      const option = CLI_OPTION_BY_KEY.get(key);
      if (!option) throw new Error(`Unknown option: ${key}`);
      const details = [];
      if (option.choices) details.push(`scelte: ${option.choices.join(', ')}`);
      if (option.defaultValue) details.push(`default: ${option.defaultValue}`);
      if (option.repeatable) details.push('ripetibile');
      const description = [option.description, ...details].join('; ');
      return `| \`${cell(option.flag)}\` | ${cell(description)} |`;
    }),
  ].join('\n');

export const renderCliReference = () => {
  const lines = [
    '# Riferimento CLI',
    '',
    generated,
    '',
    `Sorgente: \`src/cli/spec.ts\`. ${CLI_DESCRIPTION}`,
    '',
    '## Comandi',
    '',
    '| Comando | Scopo |',
    '| --- | --- |',
    ...CLI_COMMANDS.map(command => `| \`${command.id}\` | ${cell(command.summary)} |`),
    '',
    '## Opzioni globali',
    '',
    'Tutte le opzioni sono derivate dal catalogo usato dal parser. Ogni comando accetta solo le opzioni elencate nella propria sezione.',
    '',
    optionTable(CLI_OPTIONS.map(option => option.key)),
    '',
  ];
  for (const command of CLI_COMMANDS) {
    lines.push(`## ${command.id}`, '', command.summary, '', `Uso: \`${command.usage}\``, '', command.description, '');
    if (command.arguments.length > 0) {
      lines.push('| Argomento | Obbligatorio | Descrizione |', '| --- | --- | --- |');
      for (const argument of command.arguments) {
        lines.push(`| \`${argument.name}\` | ${argument.required ? 'sì' : 'no'} | ${cell(argument.description)} |`);
      }
      lines.push('');
    }
    lines.push(optionTable(command.optionKeys), '');
    lines.push('Esempi:', '');
    for (const example of command.examples) lines.push(`- \`${example}\``);
    lines.push('');
    if (command.notes.length > 0) {
      lines.push('Note:', '');
      for (const note of command.notes) lines.push(`- ${note}`);
      lines.push('');
    }
  }
  lines.push('## Codici di uscita', '', '| Codice | Significato |', '| --- | --- |');
  for (const entry of CLI_EXIT_CODES) lines.push(`| ${entry.code} | ${cell(entry.meaning)} |`);
  lines.push('');
  return lines.join('\n');
};

export const renderMcpReference = () => {
  const lines = [
    '# Riferimento MCP',
    '',
    generated,
    '',
    'Sorgente: `src/mcp/guide.ts`. La guida runtime è servita da `lazstats://help` e dai topic `lazstats://help/{topic}`.',
    '',
    '## Workflow',
    '',
    ...MCP_WORKFLOW.map((step, index) => `${index + 1}. ${step}`),
    '',
    '## Regole',
    '',
    ...MCP_RULES.map(rule => `- ${rule}`),
    '',
    '## Tool',
    '',
  ];
  for (const tool of MCP_TOOL_GUIDES) {
    lines.push(`### ${tool.id}`, '', tool.purpose, '', `**Quando:** ${tool.when}`, '', '**Argomenti:**');
    for (const argument of tool.arguments) lines.push(`- ${argument}`);
    lines.push('', '**Restituisce:**');
    for (const item of tool.returns) lines.push(`- ${item}`);
    if (tool.next) lines.push('', `**Prossimo passo:** ${tool.next}`);
    lines.push('');
  }
  lines.push('## Errori', '', '| Codice | Causa | Recupero |', '| --- | --- | --- |');
  for (const error of MCP_ERROR_GUIDES) {
    lines.push(`| \`${error.code}\` | ${cell(error.cause)} | ${cell(error.recovery)} |`);
  }
  lines.push('', '## Topic di help', '', '| Topic | Contenuto |', '| --- | --- |');
  for (const topic of MCP_HELP_TOPICS) {
    lines.push(`| \`${topic.id}\` | ${cell(topic.description)} |`);
  }
  lines.push('');
  return lines.join('\n');
};

const outputs = new Map([
  [join('docs', 'cli', 'riferimento.md'), renderCliReference()],
  [join('docs', 'mcp', 'riferimento.md'), renderMcpReference()],
]);

let stale = false;
for (const [path, content] of outputs) {
  let current = null;
  try {
    current = readFileSync(path, 'utf8');
  } catch {
    current = null;
  }
  if (check) {
    if (current !== content) {
      stale = true;
      console.error(`✘ riferimento non aggiornato: ${path}`);
    }
    continue;
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, 'utf8');
  console.log(`✔ ${path}`);
}

if (check) {
  if (stale) {
    console.error('Esegui `npm run docs:build` e ricontrolla.');
    process.exit(1);
  }
  console.log(`✔ docs: ${outputs.size} riferimenti allineati`);
}
