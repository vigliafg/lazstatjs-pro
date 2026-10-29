import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ANALYSIS_IDS } from '../analyses/registry';
import { BOOKS } from './content';
import { TOPIC_ORDER } from './content/order';

/** Registry id → help topic id (only the guided procedure differs). */
const topicOf = (analysisId: string): string =>
  analysisId === 'guided' ? 'wizard' : analysisId;

const nonEmpty = (values: readonly string[] | undefined, label: string): void => {
  assert.ok(values && values.length > 0, `${label} is empty`);
  for (const value of values) assert.ok(value.trim().length > 0, `${label} has a blank entry`);
};

test('every locale ships the same topics in the same order', () => {
  const reference = BOOKS[0];
  assert.ok(reference);
  for (const book of BOOKS.slice(1)) {
    assert.deepEqual(
      book.topics.map(topic => topic.id),
      reference.topics.map(topic => topic.id),
      `${book.locale} topic order differs`
    );
  }
  assert.deepEqual(
    reference.topics.map(topic => topic.id),
    [...TOPIC_ORDER],
    'book order must follow TOPIC_ORDER so links stay aligned'
  );
});

test('every registry procedure has a complete two-level page', () => {
  for (const book of BOOKS) {
    for (const analysisId of ANALYSIS_IDS) {
      const id = topicOf(analysisId);
      const topic = book.topics.find(entry => entry.id === id);
      assert.ok(topic, `${book.locale}: missing topic for ${analysisId}`);
      assert.equal(topic.area, 'procedures', `${book.locale}: ${id} must live in Procedure`);
      assert.ok(topic.title.trim() && topic.summary.trim(), `${book.locale}: ${id} title/summary`);
      assert.ok(topic.tutorial.goal.trim(), `${book.locale}: ${id} tutorial goal`);
      nonEmpty(topic.tutorial.steps, `${book.locale}: ${id} tutorial steps`);
      assert.ok(topic.tutorial.expected.trim(), `${book.locale}: ${id} expected output`);
      nonEmpty(topic.advanced.whenToUse, `${book.locale}: ${id} when to use`);
      nonEmpty(topic.advanced.reading, `${book.locale}: ${id} how to read`);
      nonEmpty(topic.advanced.pitfalls, `${book.locale}: ${id} pitfalls`);
    }
  }
});

test('ids are unique, chapters are known and cross references resolve', () => {
  for (const book of BOOKS) {
    const ids = book.topics.map(topic => topic.id);
    assert.equal(new Set(ids).size, ids.length, `${book.locale}: duplicate topic ids`);
    const chapters = new Set(book.chapters.map(chapter => chapter.id));
    for (const topic of book.topics) {
      assert.ok(chapters.has(topic.area), `${book.locale}: ${topic.id} has unknown area`);
      for (const reference of topic.seeAlso ?? []) {
        assert.ok(
          book.topics.some(entry => entry.id === reference),
          `${book.locale}: ${topic.id} points to missing topic ${reference}`
        );
      }
      if (topic.tutorial.dataset) {
        const path = join('src/help/content/data', topic.tutorial.dataset);
        assert.ok(existsSync(path), `${book.locale}: missing dataset ${topic.tutorial.dataset}`);
      }
      for (const entry of topic.advanced.glossary ?? []) {
        assert.ok(entry.term.trim() && entry.definition.trim(), `${book.locale}: ${topic.id} glossary`);
      }
    }
    for (const value of Object.values(book.ui)) {
      assert.ok(value.trim().length > 0, `${book.locale}: empty book label`);
    }
  }
});

test('every chapter has topics and filesystem-safe ids', () => {
  for (const book of BOOKS) {
    for (const chapter of book.chapters) {
      assert.ok(
        book.topics.some(topic => topic.area === chapter.id),
        `${book.locale}: chapter ${chapter.id} is empty`
      );
    }
    for (const topic of book.topics) {
      assert.match(topic.id, /^[a-z0-9-]+$/, `${book.locale}: unsafe topic id ${topic.id}`);
    }
  }
});
