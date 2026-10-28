import test from 'node:test';
import assert from 'node:assert/strict';
import { addRecentProject, parseRecentProjects } from './recent';

test('recent projects are newest-first, deduplicated and capped', () => {
  let list: string[] = [];
  for (const name of ['a.lzs', 'b.lzs', 'a.lzs', 'c.lzs', 'd.lzs', 'e.lzs', 'f.lzs']) {
    list = addRecentProject(list, name);
  }
  assert.deepEqual(list, ['f.lzs', 'e.lzs', 'd.lzs', 'c.lzs', 'a.lzs']);
  assert.deepEqual(addRecentProject(list, '  '), list);
});

test('parsing tolerates invalid storage', () => {
  assert.deepEqual(parseRecentProjects(null), []);
  assert.deepEqual(parseRecentProjects('nope'), []);
  assert.deepEqual(parseRecentProjects('["a.lzs", 3, " a.lzs ", "b.lzs"]'), ['a.lzs', 'b.lzs']);
});
