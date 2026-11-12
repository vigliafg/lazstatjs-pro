import { McpServer, ResourceTemplate } from '@modelcontextprotocol/server';
import { analysisSchema, catalogEntries } from '../engine';
import { McpError } from './errors';
import {
  MCP_HELP_TOPICS,
  MCP_HELP_TOPIC_IDS,
  helpTopic,
  renderGuide,
  renderTopic,
} from './guide';
import { MCP_VERSION } from './limits';

const json = (uri: URL, value: unknown) => ({
  contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(value) }],
});

export const registerResources = (server: McpServer): void => {
  server.registerResource(
    'help',
    'lazstats://help',
    {
      title: 'LazStats MCP agent guide',
      description: 'Complete workflow, tool contracts, error recovery and limits',
      mimeType: 'text/markdown',
    },
    async uri => ({
      contents: [{ uri: uri.href, mimeType: 'text/markdown', text: renderGuide() }],
    })
  );

  const helpTemplate = new ResourceTemplate('lazstats://help/{topic}', {
    list: async () => ({
      resources: MCP_HELP_TOPICS.map(topic => ({
        uri: `lazstats://help/${topic.id}`,
        name: topic.title,
        mimeType: 'text/markdown',
        description: topic.description,
      })),
    }),
    complete: {
      topic: value => MCP_HELP_TOPIC_IDS.filter(id => id.startsWith(value)),
    },
  });

  server.registerResource(
    'help-topic',
    helpTemplate,
    {
      title: 'LazStats MCP help topic',
      description: 'One help topic by id',
      mimeType: 'text/markdown',
    },
    async (uri, variables) => {
      const topic = String(variables.topic ?? '');
      if (!helpTopic(topic)) {
        throw new McpError({
          code: 'E_ARGS',
          kind: 'unknown_help_topic',
          stage: 'args',
          message: `Unknown help topic: ${topic}`,
          details: { topic, topics: MCP_HELP_TOPIC_IDS },
        });
      }
      return {
        contents: [{ uri: uri.href, mimeType: 'text/markdown', text: renderTopic(topic) }],
      };
    }
  );

  server.registerResource(
    'analyses',
    'lazstats://analyses',
    { title: 'LazStats analyses', description: 'Visible analysis catalog', mimeType: 'application/json' },
    async uri => json(uri, { analyses: catalogEntries(true) })
  );

  server.registerResource(
    'engine',
    'lazstats://engine',
    { title: 'LazStats engine', description: 'Engine and MCP limits', mimeType: 'application/json' },
    async uri =>
      json(uri, {
        name: 'lazstats',
        version: MCP_VERSION,
        transport: 'stdio',
        analyses: catalogEntries(false).length,
        limits: { rows: 50_000, columns: 500, timeoutMs: 120_000, concurrentRuns: 4, queue: 16 },
      })
  );

  const template = new ResourceTemplate('lazstats://analyses/{id}', {
    list: async () => ({
      resources: catalogEntries(true).map(entry => ({
        uri: `lazstats://analyses/${entry.id}`,
        name: entry.label,
        mimeType: 'application/json',
        description: entry.description,
      })),
    }),
    complete: {
      id: value => catalogEntries(true).map(entry => entry.id).filter(id => id.startsWith(value)),
    },
  });

  server.registerResource(
    'analysis',
    template,
    { title: 'LazStats analysis', description: 'Analysis schema by id', mimeType: 'application/json' },
    async (uri, variables) => {
      const id = String(variables.id ?? '');
      const schema = analysisSchema(id);
      if (!schema) throw new Error(`Unknown analysis: ${id}`);
      return json(uri, schema);
    }
  );
};
