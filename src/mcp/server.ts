import { McpServer } from '@modelcontextprotocol/server';
import type { CallToolResult, ServerContext } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { toolError } from './errors';
import { MCP_INSTRUCTIONS, toolDescription } from './guide';
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
  engineInfoInput,
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
      instructions: MCP_INSTRUCTIONS,
    }
  );

  server.registerTool(
    'engine_info',
    {
      title: 'Engine information',
      description: toolDescription('engine_info'),
      inputSchema: engineInfoInput,
      outputSchema: engineInfoOutput,
      annotations: { readOnlyHint: true },
    },
    safe(async args => engineInfoTool(args as z.infer<typeof engineInfoInput>))
  );

  server.registerTool(
    'list_analyses',
    {
      title: 'List analyses',
      description: toolDescription('list_analyses'),
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
      description: toolDescription('describe_analysis'),
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
      description: toolDescription('inspect_dataset'),
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
      description: toolDescription('run_analysis'),
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
      description: toolDescription('get_result'),
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
      description: toolDescription('render_chart'),
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
      description: toolDescription('validate_project'),
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
