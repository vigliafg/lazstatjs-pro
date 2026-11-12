import test from 'node:test';
import assert from 'node:assert/strict';
import { runCli } from './run';
import type { CliIo } from './types';
import {
  CLI_COMMANDS,
  CLI_EXIT_CODES,
  CLI_OPTIONS,
  CLI_OPTION_GROUPS,
  CLI_PARSE_OPTIONS,
} from './spec';

const capture = (): { io: CliIo; stdout: () => string; stderr: () => string } => {
  let out = '';
  let err = '';
  return {
    io: {
      out: text => {
        out += text;
      },
      err: text => {
        err += text;
      },
    },
    stdout: () => out,
    stderr: () => err,
  };
};

test('root help covers every command, option and exit code', async () => {
  const sink = capture();
  assert.equal(await runCli(['--help'], sink.io), 0);
  const help = sink.stdout();

  for (const command of CLI_COMMANDS) {
    assert.match(help, new RegExp(`\\b${command.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`));
    assert.ok(help.includes(command.summary));
  }
  for (const option of CLI_OPTIONS) assert.ok(help.includes(option.flag), option.flag);
  for (const code of CLI_EXIT_CODES) assert.match(help, new RegExp(`\\b${code.code}\\b`));
  assert.doesNotMatch(sink.stderr(), /error/i);
});

test('every command has a complete, self-contained help page', async () => {
  for (const command of CLI_COMMANDS) {
    const sink = capture();
    assert.equal(await runCli(['help', command.id], sink.io), 0);
    const help = sink.stdout();
    assert.ok(help.includes(command.usage), command.id);
    assert.ok(help.includes('Options:'), command.id);
    assert.ok(help.includes('Examples:'), command.id);
    assert.ok(help.includes('Exit codes:'), command.id);
    for (const key of command.optionKeys) {
      const option = CLI_OPTIONS.find(item => item.key === key);
      assert.ok(option, `${command.id}: ${key}`);
      assert.ok(help.includes(option.flag), `${command.id}: ${option.flag}`);
    }
  }
});

test('<command> --help prints the command help without required arguments', async () => {
  const direct = capture();
  assert.equal(await runCli(['run', '--help'], direct.io), 0);
  const viaHelp = capture();
  assert.equal(await runCli(['help', 'run'], viaHelp.io), 0);
  assert.equal(direct.stdout(), viaHelp.stdout());
  assert.match(direct.stdout(), /Usage:/);
  assert.doesNotMatch(direct.stdout(), /missing_parameter|E_ARGS\//);

  const project = capture();
  assert.equal(await runCli(['project', 'inspect', '--help'], project.io), 0);
  assert.match(project.stdout(), /project inspect/);
  assert.match(project.stdout(), /file\.lzs/);
});

test('--help --json returns the command contract as pure JSON', async () => {
  const root = capture();
  assert.equal(await runCli(['help', '--json'], root.io), 0);
  const payload = JSON.parse(root.stdout()) as {
    schemaVersion: number;
    scope: string;
    commands: { id: string; options: unknown[] }[];
    options: unknown[];
    exitCodes: unknown[];
  };
  assert.equal(payload.schemaVersion, 1);
  assert.equal(payload.scope, 'root');
  assert.equal(payload.commands.length, CLI_COMMANDS.length);
  assert.equal(payload.options.length, CLI_OPTIONS.length);

  const command = capture();
  assert.equal(await runCli(['run', '--help', '--json'], command.io), 0);
  const single = JSON.parse(command.stdout()) as {
    scope: string;
    command: { id: string; options: { key: string }[] };
    options: { key: string }[];
  };
  assert.equal(single.scope, 'command');
  assert.equal(single.command.id, 'run');
  const keys = new Set(single.command.options.map(option => option.key));
  for (const key of ['data', 'project', 'params', 'set', 'report-locale', 'workers']) {
    assert.ok(keys.has(key), key);
  }
});

test('help catalog and parser catalog stay aligned', () => {
  const optionKeys = new Set(CLI_OPTIONS.map(option => option.key));
  assert.deepEqual(
    Object.keys(CLI_PARSE_OPTIONS).sort(),
    [...optionKeys].sort()
  );
  for (const group of CLI_OPTION_GROUPS) {
    for (const key of group.keys) assert.ok(optionKeys.has(key), `${group.title}: ${key}`);
  }
  for (const command of CLI_COMMANDS) {
    for (const key of command.optionKeys) assert.ok(optionKeys.has(key), `${command.id}: ${key}`);
  }
});

test('unknown help topics fail without producing help on stdout', async () => {
  const sink = capture();
  assert.equal(await runCli(['help', 'does-not-exist'], sink.io), 2);
  assert.equal(sink.stdout(), '');
  assert.match(sink.stderr(), /E_ARGS\/unknown_help_topic/);
});
