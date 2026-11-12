import { EngineError } from '../engine';
import type { CliIo } from './types';
import {
  CLI_AGENT_WORKFLOW,
  CLI_COMMANDS,
  CLI_DESCRIPTION,
  CLI_EXIT_CODES,
  CLI_NAME,
  CLI_OPTION_BY_KEY,
  CLI_OPTION_GROUPS,
  CLI_OPTIONS,
  type CliCommandSpec,
  type CliOptionSpec,
} from './spec';

const optionSpec = (key: string): CliOptionSpec => {
  const option = CLI_OPTION_BY_KEY.get(key);
  if (!option) throw new Error(`Unknown CLI option in help catalog: ${key}`);
  return option;
};

const optionDetail = (option: CliOptionSpec): string => {
  const details: string[] = [];
  if (option.choices) details.push(`choices: ${option.choices.join(', ')}`);
  if (option.defaultValue) details.push(`default: ${option.defaultValue}`);
  if (option.repeatable) details.push('repeatable');
  return details.length > 0 ? `${option.description} (${details.join('; ')})` : option.description;
};

const optionLine = (option: CliOptionSpec): string => {
  const label = `  ${option.flag}`;
  const padded = label.length >= 30 ? `${label}\n${' '.repeat(30)}` : label.padEnd(30);
  return `${padded}${optionDetail(option)}\n`;
};

const optionLines = (keys: string[]): string => keys.map(key => optionLine(optionSpec(key))).join('');

const commandById = (id: string): CliCommandSpec | undefined =>
  CLI_COMMANDS.find(command => command.id === id);

export const resolveHelpCommand = (topic?: string): CliCommandSpec | undefined => {
  if (!topic) return undefined;
  const normalized = topic
    .trim()
    .replace(/^lazstats\s+/, '')
    .replace(/\s+/g, ' ');
  if (!normalized) return undefined;
  return commandById(normalized);
};

export const helpPayload = (version: string, topic?: string): Record<string, unknown> => {
  const command = resolveHelpCommand(topic);
  if (topic && !command) {
    throw new EngineError({
      code: 'E_ARGS',
      kind: 'unknown_help_topic',
      stage: 'args',
      message: `Unknown help topic: ${topic}`,
      details: { topic, commands: CLI_COMMANDS.map(item => item.id) },
    });
  }
  const base = {
    schemaVersion: 1,
    name: CLI_NAME,
    version,
    description: CLI_DESCRIPTION,
    exitCodes: CLI_EXIT_CODES,
  };
  if (!command) {
    return {
      ...base,
      scope: 'root',
      usage: [`${CLI_NAME} <command> [options]`, `${CLI_NAME} help [command]`],
      agentWorkflow: CLI_AGENT_WORKFLOW,
      commands: CLI_COMMANDS.map(item => ({
        id: item.id,
        summary: item.summary,
        usage: item.usage,
        arguments: item.arguments,
        options: item.optionKeys.map(key => optionSpec(key)),
        examples: item.examples,
        notes: item.notes,
        ...(item.related ? { related: item.related } : {}),
      })),
      options: CLI_OPTIONS,
    };
  }
  return {
    ...base,
    scope: 'command',
    command: {
      id: command.id,
      summary: command.summary,
      usage: command.usage,
      description: command.description,
      arguments: command.arguments,
      options: command.optionKeys.map(key => optionSpec(key)),
      examples: command.examples,
      notes: command.notes,
      ...(command.related ? { related: command.related } : {}),
    },
    options: command.optionKeys.map(key => optionSpec(key)),
  };
};

const rootHelp = (version: string): string => {
  const lines: string[] = [];
  lines.push(`${CLI_NAME} ${version} — ${CLI_DESCRIPTION}`);
  lines.push('');
  lines.push('Usage:');
  lines.push(`  ${CLI_NAME} <command> [options]`);
  lines.push(`  ${CLI_NAME} help [command] [--json]`);
  lines.push(`  ${CLI_NAME} <command> --help [--json]`);
  lines.push('');
  lines.push('Commands:');
  for (const command of CLI_COMMANDS) {
    lines.push(`  ${command.id.padEnd(18)} ${command.summary}`);
  }
  lines.push('');
  lines.push('Agent workflow:');
  for (const step of CLI_AGENT_WORKFLOW) lines.push(`  - ${step}`);
  lines.push('');
  for (const group of CLI_OPTION_GROUPS) {
    lines.push(`${group.title}:`);
    lines.push(optionLines(group.keys).trimEnd());
    lines.push('');
  }
  lines.push('Exit codes:');
  for (const entry of CLI_EXIT_CODES) {
    lines.push(`  ${entry.code}  ${entry.meaning}`);
  }
  lines.push('');
  lines.push('Examples:');
  for (const command of CLI_COMMANDS) {
    if (command.examples[0]) lines.push(`  ${command.examples[0]}`);
  }
  lines.push('');
  lines.push(`Run \`${CLI_NAME} help <command>\` for the full contract of one command.`);
  return `${lines.join('\n')}\n`;
};

const commandHelp = (version: string, command: CliCommandSpec): string => {
  const lines: string[] = [];
  lines.push(`${CLI_NAME} ${command.id} — ${command.summary}`);
  lines.push('');
  lines.push(`Usage:\n  ${command.usage}`);
  lines.push('');
  lines.push(command.description);
  if (command.arguments.length > 0) {
    lines.push('');
    lines.push('Arguments:');
    for (const argument of command.arguments) {
      const suffix = argument.required ? 'required' : 'optional';
      lines.push(`  ${argument.name.padEnd(18)} ${suffix}; ${argument.description}`);
    }
  }
  lines.push('');
  lines.push('Options:');
  lines.push(optionLines(command.optionKeys).trimEnd());
  if (command.examples.length > 0) {
    lines.push('');
    lines.push('Examples:');
    for (const example of command.examples) lines.push(`  ${example}`);
  }
  if (command.notes.length > 0) {
    lines.push('');
    lines.push('Notes:');
    for (const note of command.notes) lines.push(`  - ${note}`);
  }
  lines.push('');
  lines.push('Exit codes:');
  for (const entry of CLI_EXIT_CODES) {
    lines.push(`  ${entry.code}  ${entry.meaning}`);
  }
  if (command.related && command.related.length > 0) {
    lines.push('');
    lines.push(`See also: ${command.related.map(id => `${CLI_NAME} help ${id}`).join(' · ')}`);
  }
  lines.push('');
  lines.push(`Version: ${version}`);
  return `${lines.join('\n')}\n`;
};

export const renderHelp = (version: string, topic?: string): string => {
  const command = resolveHelpCommand(topic);
  if (topic && !command) {
    throw new EngineError({
      code: 'E_ARGS',
      kind: 'unknown_help_topic',
      stage: 'args',
      message: `Unknown help topic: ${topic}`,
      details: { topic, commands: CLI_COMMANDS.map(item => item.id) },
    });
  }
  return command ? commandHelp(version, command) : rootHelp(version);
};

export const printHelp = (
  io: CliIo,
  version: string,
  topic?: string,
  json = false
): void => {
  if (json) {
    io.out(`${JSON.stringify(helpPayload(version, topic), null, 2)}\n`);
    return;
  }
  io.out(renderHelp(version, topic));
};
