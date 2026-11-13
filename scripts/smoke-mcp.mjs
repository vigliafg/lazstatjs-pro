/** Smoke-test the built stdio server over the real MCP client transport. */
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const packageVersion = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
const server = process.env.LAZSTATS_MCP
  ? resolve(root, process.env.LAZSTATS_MCP)
  : join(root, 'dist-mcp', 'lazstats-mcp.mjs');
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [server, '--root', root],
  cwd: root,
  stderr: 'pipe',
});
let stderr = '';
transport.stderr.on('data', chunk => {
  stderr += String(chunk);
});
const client = new Client({ name: 'lazstats-mcp-smoke', version: '1.0.0' });
await client.connect(transport);
try {
  const tools = await client.listTools();
  const names = tools.tools.map(tool => tool.name).sort();
  if (names.length !== 8) throw new Error(`Expected 8 tools, got ${names.length}: ${names.join(',')}`);
  const info = await client.callTool({ name: 'engine_info', arguments: {} });
  if (info.isError) throw new Error('engine_info failed');
  if (info.structuredContent?.version !== packageVersion) {
    throw new Error(
      `engine_info version ${info.structuredContent?.version} does not match package ${packageVersion}`
    );
  }
  if (info.structuredContent?.documentation?.guide !== 'lazstats://help') {
    throw new Error('engine_info is missing the help documentation link');
  }
  const guide = await client.readResource({ uri: 'lazstats://help' });
  if (!String(guide.contents[0]?.text ?? '').includes('### run_analysis')) {
    throw new Error('lazstats://help is incomplete');
  }
  const fallback = await client.callTool({ name: 'engine_info', arguments: { help: true } });
  if (!String(fallback.structuredContent?.documentation?.guideText ?? '').includes('## Tools')) {
    throw new Error('engine_info help fallback is incomplete');
  }
  const run = await client.callTool({
    name: 'run_analysis',
    arguments: {
      analysisId: 'descriptive',
      dataPath: 'samples/descriptive/iris/data.csv',
      set: { descVars: ['Sepal_Length', 'Sepal_Width'] },
    },
  });
  if (run.isError) throw new Error(`run_analysis failed: ${JSON.stringify(run.structuredContent)}`);
  console.log(`smoke ok: ${names.length} tools, resultId=${run.structuredContent?.resultId}`);
} finally {
  await client.close();
}
if (stderr.trim()) process.stderr.write(stderr);
