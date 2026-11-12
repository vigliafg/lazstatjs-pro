import { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { catalogEntries } from '../engine';
import { renderGuide } from './guide';

const stopWords = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'are', 'how', 'can', 'dei', 'del',
  'della', 'delle', 'con', 'per', 'una', 'uno', 'gli', 'che', 'come', 'sono', 'dataset',
]);

const words = (value: string): string[] =>
  value
    .toLowerCase()
    .split(/[^a-z0-9à-ù]+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

export const registerPrompts = (server: McpServer): void => {
  server.registerPrompt(
    'choose-analysis',
    {
      title: 'Choose a LazStats analysis',
      description: 'Suggest runnable analyses for a stated goal and dataset columns',
      argsSchema: z.object({
        goal: z.string(),
        columns: z.string().optional(),
        sample: z.string().optional(),
      }),
    },
    args => {
      const goalWords = words(args.goal);
      const candidates = catalogEntries(false)
        .map(entry => {
          const haystack = `${entry.label} ${entry.description} ${entry.familyLabel}`.toLowerCase();
          const score = goalWords.reduce((sum, word) => sum + (haystack.includes(word) ? 1 : 0), 0);
          return { entry, score };
        })
        .sort((a, b) => b.score - a.score || a.entry.label.localeCompare(b.entry.label))
        .slice(0, 6);
      const lines = [
        `Goal: ${args.goal}`,
        args.columns ? `Columns: ${args.columns}` : '',
        '',
        'Candidate analyses (use describe_analysis before run_analysis):',
        ...candidates.map(({ entry, score }) =>
          `- ${entry.id} — ${entry.label} (${entry.familyLabel}, score ${score}): ${entry.description}`
        ),
        '',
        'Use only columns that exist; pass them as set keys such as role=ColumnName.',
        '',
        'Before running, read describe_analysis and inspect_dataset. Full contracts: lazstats://help.',
      ].filter(line => line !== '');
      return {
        messages: [
          {
            role: 'user' as const,
            content: { type: 'text' as const, text: lines.join('\n') },
          },
        ],
      };
    }
  );

  server.registerPrompt(
    'agent-guide',
    {
      title: 'LazStats MCP agent guide',
      description: 'Return the complete workflow, tool contracts, limits and error recovery',
      argsSchema: z.object({
        task: z.string().optional(),
      }),
    },
    args => {
      const intro = args.task
        ? `Task: ${args.task}\n\nUse the guide below to choose tools and arguments.\n\n`
        : '';
      return {
        messages: [
          {
            role: 'user' as const,
            content: { type: 'text' as const, text: `${intro}${renderGuide()}` },
          },
        ],
      };
    }
  );
};
