import test from 'node:test';
import assert from 'node:assert/strict';
import { enBook } from './en/book';
import { missingHelpContract, procedureTopic } from './template';

const minimal = {
  id: 'example',
  title: 'Example',
  summary: 'One line about the procedure.',
  goal: 'Answer the question the procedure is meant for.',
  steps: ['Choose the variables.', 'Run it.'],
  expected: 'A table and a reading.',
  whenToUse: ['When the assumptions hold.'],
};

test('procedureTopic builds a page with the two-level contract', () => {
  const topic = procedureTopic({
    ...minimal,
    dataset: 'iris',
    assumptions: ['Independent observations.'],
    whenNotToUse: ['When the outcome is a count.'],
    reading: ['Read the p-value next to the effect size.'],
    pitfalls: ['Do not confuse significance with relevance.'],
    charts: ['Interval plot'],
    glossary: [{ term: 'Effect size', definition: 'Magnitude of the difference.' }],
    seeAlso: ['ttest'],
  });

  assert.equal(topic.area, 'procedures');
  assert.equal(topic.id, 'example');
  assert.equal(topic.tutorial.dataset, 'iris');
  assert.deepEqual(topic.tutorial.steps, minimal.steps);
  assert.deepEqual(topic.advanced.whenToUse, minimal.whenToUse);
  assert.deepEqual(topic.advanced.assumptions, ['Independent observations.']);
  assert.equal(topic.advanced.glossary?.length, 1);
  assert.deepEqual(topic.seeAlso, ['ttest']);
  assert.deepEqual(missingHelpContract(topic), []);
});

test('procedureTopic leaves optional sections out instead of inventing them', () => {
  const topic = procedureTopic(minimal);
  assert.equal(topic.tutorial.dataset, undefined);
  assert.equal(topic.advanced.assumptions, undefined);
  assert.equal(topic.advanced.charts, undefined);
  assert.equal(topic.advanced.glossary, undefined);
  assert.equal(topic.seeAlso, undefined);
  assert.deepEqual(missingHelpContract(topic), []);
});

test('procedureTopic rejects an incomplete page', () => {
  assert.throws(() => procedureTopic({ ...minimal, steps: [] }), /steps must have at least one entry/);
  assert.throws(() => procedureTopic({ ...minimal, whenToUse: [] }), /whenToUse must have at least/);
  assert.throws(() => procedureTopic({ ...minimal, goal: '   ' }), /goal must not be empty/);
});

test('every shipped English page satisfies the help contract', () => {
  const problems = enBook.topics.flatMap(missingHelpContract);
  assert.deepEqual(problems, []);
});
