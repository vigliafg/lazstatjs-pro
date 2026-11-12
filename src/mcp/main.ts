import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { closeWorkerPool } from '../engine';
import { PathGuard } from './paths';
import { createMcpServer } from './server';

const parseRoot = (argv: string[]): string | undefined => {
  let root: string | undefined;
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--help' || value === '-h') {
      process.stderr.write(
        'Usage: lazstats-mcp [--root DIR]\n\n' +
          'Stdio MCP server for the LazStats engine. All input paths stay inside DIR.\n'
      );
      process.exit(0);
    }
    if (value === '--root') {
      const next = argv[index + 1];
      if (!next) throw new Error('--root requires a directory');
      root = next;
      index += 1;
      continue;
    }
    if (value.startsWith('--root=')) {
      root = value.slice('--root='.length);
      continue;
    }
    throw new Error(`Unknown argument: ${value}`);
  }
  return root;
};

const run = (): void => {
  let guard: PathGuard;
  try {
    guard = new PathGuard(parseRoot(process.argv.slice(2)) ?? process.env.LAZSTATS_MCP_ROOT);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(2);
    return;
  }
  const handle = serveStdio(() => createMcpServer({ guard }));
  const shutdown = () => {
    closeWorkerPool();
    void handle.close().finally(() => process.exit(0));
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
  process.once('exit', closeWorkerPool);
};

run();
