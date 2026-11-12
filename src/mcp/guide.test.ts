import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MCP_DOCUMENTATION,
  MCP_ERROR_GUIDES,
  MCP_HELP_TOPICS,
  MCP_HELP_TOPIC_IDS,
  MCP_INSTRUCTIONS,
  MCP_RULES,
  MCP_TOOL_GUIDES,
  MCP_TOOL_IDS,
  MCP_WORKFLOW,
  renderGuide,
  renderTopic,
  toolDescription,
} from './guide';

const plannedTools = [
  'describe_analysis',
  'engine_info',
  'get_result',
  'inspect_dataset',
  'list_analyses',
  'render_chart',
  'run_analysis',
  'validate_project',
];

test('guide documents exactly the eight MCP tools', () => {
  assert.deepEqual([...MCP_TOOL_IDS].sort(), plannedTools);
  assert.equal(MCP_TOOL_GUIDES.length, 8);
  for (const tool of MCP_TOOL_GUIDES) {
    assert.ok(tool.purpose.length > 20, tool.id);
    assert.ok(tool.when.length > 20, tool.id);
    assert.ok(tool.arguments.length > 0, tool.id);
    assert.ok(tool.returns.length > 0, tool.id);
    assert.ok(toolDescription(tool.id).includes(tool.purpose), tool.id);
  }
  assert.throws(() => toolDescription('missing'));
});

test('guide covers every documented error code', () => {
  const codes = MCP_ERROR_GUIDES.map(error => error.code);
  assert.deepEqual(codes.sort(), [
    'E_ANALYSIS',
    'E_ARGS',
    'E_BUSY',
    'E_CANCELLED',
    'E_DATA',
    'E_INTERNAL',
    'E_PARAMS',
    'E_RESULT_EXPIRED',
    'E_RUN',
    'E_TIMEOUT',
  ]);
  const guide = renderGuide();
  for (const code of codes) assert.ok(guide.includes(code), code);
});

test('every help topic is unique, linked and renderable', () => {
  assert.equal(new Set(MCP_HELP_TOPIC_IDS).size, MCP_HELP_TOPIC_IDS.length);
  for (const topic of MCP_HELP_TOPICS) {
    assert.ok(topic.title.length > 0, topic.id);
    assert.ok(topic.description.length > 0, topic.id);
    const rendered = renderTopic(topic.id);
    assert.ok(rendered.includes(topic.title), topic.id);
    assert.ok(rendered.length > 40, topic.id);
  }
  assert.throws(() => renderTopic('missing'));
});

test('full guide contains workflow, rules, tools and documentation metadata', () => {
  const guide = renderGuide();
  for (const step of MCP_WORKFLOW) assert.ok(guide.includes(step));
  for (const rule of MCP_RULES) assert.ok(guide.includes(rule));
  for (const tool of MCP_TOOL_IDS) assert.ok(guide.includes(`### ${tool}`), tool);
  assert.deepEqual(MCP_DOCUMENTATION.topics, MCP_HELP_TOPIC_IDS);
  assert.equal(MCP_DOCUMENTATION.guide, 'lazstats://help');
  assert.equal(MCP_DOCUMENTATION.version, 1);
});

test('server instructions stay concise and state the critical contracts', () => {
  assert.ok(MCP_INSTRUCTIONS.length < 1_500, String(MCP_INSTRUCTIONS.length));
  for (const phrase of [
    'exactly one source',
    'dataPath',
    'projectPath',
    'resultId',
    'lazstats://help',
    'isError',
  ]) {
    assert.ok(MCP_INSTRUCTIONS.includes(phrase), phrase);
  }
});
