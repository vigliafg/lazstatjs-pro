import { McpServer } from '@modelcontextprotocol/server';
import type { CallToolResult, ServerContext } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { toolError } from './errors';
import { RunGate } from './gate';
import { MCP_NAME, MCP_VERSION, MAX_TOOL_INPUT_ELEMENTS } from './limits';
import type { PathGuard } from './paths';
import { registerPrompts } from './prompts';
import { registerResources } from './resources';
import { ResultCache } from './resultCache';
import {
  describeAnalysisInput,
  describeAnalysisTool,
  describeAnalysisOutput,
  engineInfoOutput,
  engineInfoTool,
  listAnalysesInput,
  listAnalysesOutput,
  listAnalysesTool,
} from './tools/catalog';
import { inspectDatasetInput, inspectDatasetOutput, inspectDatasetTool } from './tools/inspect';
import {
  validateProjectInput,
  validateProjectOutput,
  validateProjectTool,
} from './tools/project';
import {
  getResultInput,
  getResultOutput,
  getResultTool,
  renderChartInput,
  renderChartOutput,
  renderChartTool,
} from './tools/results';
import { runAnalysisInput, runAnalysisTool, runOutputSchema } from './tools/run';

export interface McpServerOptions {
  guard: PathGuard;
  cache?: ResultCache;
  gate?: RunGate;
}

const safe = (
  handler: (args: unknown, ctx: ServerContext) => Promise<CallToolResult> | CallToolResult
) => async (args: unknown, ctx: ServerContext): Promise<CallToolResult> => {
  try {
    return await handler(args, ctx);
  } catch (error) {
    return toolError(error);
  }
};

export const createMcpServer = (options: McpServerOptions): McpServer => {
  const cache = options.cache ?? new ResultCache();
  const gate = options.gate ?? new RunGate();
  const server = new McpServer(
    { name: MCP_NAME, version: MCP_VERSION },
    {
      maxToolInputElements: MAX_TOOL_INPUT_ELEMENTS,
      instructions:
        'Read-only LazStats engine. Use list_analyses/describe_analysis before run_analysis. ' +
        'Provide exactly one source (dataPath, projectPath or data). Paths are confined to the MCP root. ' +
        'Keep resultId for paginated reads and chart rendering.',
    }
  );

  server.registerTool(
    'engine_info',
    {
      title: 'Engine information',
      description: 'Return engine version, catalog counts, capabilities and MCP limits.',
      outputSchema: engineInfoOutput,
      annotations: { readOnlyHint: true },
    },
    safe(async () => engineInfoTool())
  );

  server.registerTool(
    'list_analyses',
    {
      title: 'List analyses',
      description: 'List runnable analyses, optionally filtered by text or family.',
      inputSchema: listAnalysesInput,
      outputSchema: listAnalysesOutput,
      annotations: { readOnlyHint: true },
    },
    safe(async args => listAnalysesTool(args as z.infer<typeof listAnalysesInput>))
  );

  server.registerTool(
    'describe_analysis',
    {
      title: 'Describe analysis',
      description: 'Return the schema, roles, defaults and example parameters of one analysis.',
      inputSchema: describeAnalysisInput,
      outputSchema: describeAnalysisOutput,
      annotations: { readOnlyHint: true },
    },
    safe(async args => describeAnalysisTool(args as z.infer<typeof describeAnalysisInput>))
  );

  server.registerTool(
    'inspect_dataset',
    {
      title: 'Inspect dataset',
      description: 'Read dataset metadata, columns and a small preview without running an analysis.',
      inputSchema: inspectDatasetInput,
      outputSchema: inspectDatasetOutput,
      annotations: { readOnlyHint: true },
    },
    safe(async args =>
      inspectDatasetTool(args as z.infer<typeof inspectDatasetInput>, options.guard)
    )
  );

  server.registerTool(
    'run_analysis',
    {
      title: 'Run analysis',
      description:
        'Run one analysis from dataPath, projectPath or inline data. Returns a resultId for get_result.',
      inputSchema: runAnalysisInput,
      outputSchema: runOutputSchema,
    },
    safe(async (args, ctx) => {
      const token = (ctx.mcpReq._meta as { progressToken?: string | number } | undefined)
        ?.progressToken;
      const notify = (message: string, progress: number) => {
        if (token === undefined) return;
        void ctx.mcpReq
          .notify({
            method: 'notifications/progress',
            params: { progressToken: token, progress, total: 3, message },
          })
          .catch(() => undefined);
      };
      return runAnalysisTool(
        args as z.infer<typeof runAnalysisInput>,
        options.guard,
        cache,
        gate,
        ctx.mcpReq.signal,
        notify
      );
    })
  );

  server.registerTool(
    'get_result',
    {
      title: 'Get result',
      description: 'Read a cached result section with pagination by resultId.',
      inputSchema: getResultInput,
      outputSchema: getResultOutput,
      annotations: { readOnlyHint: true },
    },
    safe(async args => getResultTool(args as z.infer<typeof getResultInput>, cache))
  );

  server.registerTool(
    'render_chart',
    {
      title: 'Render chart',
      description: 'Render one chart from a cached result as SVG, or return its compiled Vega-Lite spec.',
      inputSchema: renderChartInput,
      outputSchema: renderChartOutput,
      annotations: { readOnlyHint: true },
    },
    safe(async args => renderChartTool(args as z.infer<typeof renderChartInput>, cache))
  );

  server.registerTool(
    'validate_project',
    {
      title: 'Validate project',
      description: 'Validate a .lzs project and return its metadata without modifying it.',
      inputSchema: validateProjectInput,
      outputSchema: validateProjectOutput,
      annotations: { readOnlyHint: true },
    },
    safe(async args =>
      validateProjectTool(args as z.infer<typeof validateProjectInput>, options.guard)
    )
  );

  registerResources(server);
  registerPrompts(server);
  return server;
};
