/**
 * Builds the multilingual help book: static HTML + CSS + JS under `public/help`.
 *
 * The content lives in `src/help/content` so it is type-checked with the app;
 * this script only renders it. Run through `npm run help:build` (also wired to
 * `predev` and `prebuild`).
 */
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { BOOKS } from '../src/help/content/index.ts';

const OUT = join(process.cwd(), 'public/help');

const esc = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const list = (items, className = '') =>
  items && items.length
    ? `<ul${className ? ` class="${className}"` : ''}>${items.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`
    : '';

const tutorialBlock = (book, topic) => `
      <section id="tutorial" class="level" data-level-panel="tutorial">
        <p class="goal">${esc(topic.tutorial.goal)}</p>
        ${
          topic.tutorial.dataset
            ? `<p class="dataset">${esc(book.ui.exampleData)}: <code>${esc(topic.tutorial.dataset)}</code></p>`
            : ''
        }
        <h3>${esc(book.ui.tutorialHint)}</h3>
        <ol class="steps">${topic.tutorial.steps.map((step) => `<li>${esc(step)}</li>`).join('')}</ol>
        <div class="callout">
          <strong>${esc(book.ui.expected)}</strong>
          <p>${esc(topic.tutorial.expected)}</p>
        </div>
      </section>`;

const advancedBlock = (book, topic) => {
  const a = topic.advanced;
  const section = (title, items, className = '') =>
    items && items.length ? `<h3>${esc(title)}</h3>${list(items, className)}` : '';
  const glossary =
    a.glossary && a.glossary.length
      ? `<h3>${esc(book.ui.glossary)}</h3><dl class="glossary">${a.glossary
          .map((entry) => `<dt>${esc(entry.term)}</dt><dd>${esc(entry.definition)}</dd>`)
          .join('')}</dl>`
      : '';
  return `
      <section id="advanced" class="level" data-level-panel="advanced" hidden>
        ${section(book.ui.assumptions, a.assumptions)}
        ${section(book.ui.whenToUse, a.whenToUse)}
        ${section(book.ui.whenNotToUse, a.whenNotToUse, 'warn')}
        ${section(book.ui.reading, a.reading)}
        ${section(book.ui.pitfalls, a.pitfalls, 'warn')}
        ${glossary}
        ${
          topic.seeAlso && topic.seeAlso.length
            ? `<h3>${esc(book.ui.seeAlso)}</h3><p class="see-also">${topic.seeAlso
                .map((id) => `<a href="./${esc(id)}.html">${esc(id)}</a>`)
                .join(' · ')}</p>`
            : ''
        }
      </section>`;
};

const head = (book, title, extra = '') => `<!doctype html>
<html lang="${esc(book.locale)}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)} · ${esc(book.title)}</title>
<meta name="description" content="${esc(book.subtitle)}" />
<link rel="stylesheet" href="./assets/help.css" />
${extra}
</head>
<body>`;

const nav = (book) => `
<header class="topbar">
  <a class="brand" href="./index.html">${esc(book.title)}</a>
  <nav class="topnav">
    <a href="./index.html#contents">${esc(book.ui.contents)}</a>
    <a href="./print.html">${esc(book.ui.print)}</a>
    <a href="./index.html#search">${esc(book.ui.search)}</a>
  </nav>
</header>`;

const footer = (book) => `
<footer class="footer">
  <p>${esc(book.title)} — ${esc(book.subtitle)}</p>
  <p class="muted">${esc(book.ui.updated)}</p>
</footer>
<script src="./assets/help.js"></script>
</body>
</html>`;

const topicPage = (book, topic, previous, next) => {
  const index = book.topics.indexOf(topic);
  return `${head(book, topic.title)}
${nav(book)}
<main class="page">
  <nav class="breadcrumb"><a href="./index.html">${esc(book.ui.contents)}</a> › <span>${esc(topic.title)}</span></nav>
  <h1>${esc(topic.title)}</h1>
  <p class="summary">${esc(topic.summary)}</p>
  <div class="levels" role="tablist">
    <button type="button" role="tab" class="level-tab" data-level="tutorial">A · ${esc(book.ui.tutorial)}</button>
    <button type="button" role="tab" class="level-tab" data-level="advanced">B · ${esc(book.ui.advanced)}</button>
  </div>
  ${tutorialBlock(book, topic)}
  ${advancedBlock(book, topic)}
  <nav class="pager">
    ${previous ? `<a class="prev" href="./${esc(previous.id)}.html">← ${esc(previous.title)}</a>` : '<span></span>'}
    <span class="muted">${index + 1} / ${book.topics.length}</span>
    ${next ? `<a class="next" href="./${esc(next.id)}.html">${esc(next.title)} →</a>` : '<span></span>'}
  </nav>
</main>
${footer(book)}`;
};

const indexPage = (book) => {
  const entries = book.topics
    .map(
      (topic) => `<li class="topic" data-topic data-keywords="${esc(
        [topic.title, topic.summary, topic.area, topic.id, topic.tutorial.goal].join(' ')
      )}">
        <a href="./${esc(topic.id)}.html"><span class="topic-title">${esc(topic.title)}</span></a>
        <p>${esc(topic.summary)}</p>
      </li>`
    )
    .join('\n');
  const chapters = book.chapters
    .map((chapter) => {
      const topics = book.topics.filter((topic) => topic.area === chapter.id);
      if (!topics.length) return '';
      return `<section class="chapter" id="chapter-${esc(chapter.id)}">
        <h2>${esc(chapter.title)}</h2>
        <p class="blurb">${esc(chapter.blurb)}</p>
        <ul class="topics">${topics
          .map(
            (topic) =>
              `<li><a href="./${esc(topic.id)}.html">${esc(topic.title)}</a> <span class="muted">— ${esc(
                topic.summary
              )}</span></li>`
          )
          .join('')}</ul>
      </section>`;
    })
    .join('\n');
  return `${head(book, book.title)}
${nav(book)}
<main class="page cover">
  <p class="kicker">${esc(book.subtitle)}</p>
  <h1>${esc(book.title)}</h1>
  <p class="preface">${esc(book.preface)}</p>
  <div class="levels-legend">
    <p><strong>A · ${esc(book.ui.tutorial)}</strong> — ${esc(book.ui.tutorialHint)}</p>
    <p><strong>B · ${esc(book.ui.advanced)}</strong> — ${esc(book.ui.advancedHint)}</p>
  </div>
  <div id="search" class="search">
    <label for="q">${esc(book.ui.search)}</label>
    <input id="q" type="search" autocomplete="off" placeholder="${esc(book.ui.search)}…" />
    <p class="empty" id="search-empty" hidden>${esc(book.ui.searchEmpty)}</p>
  </div>
  <div id="contents" class="contents">${chapters}</div>
  <ul class="topics searchable" hidden>${entries}</ul>
  <p class="muted center">${esc(book.ui.updated)}</p>
</main>
${footer(book)}`;
};

const printPage = (book) => `${head(book, book.title, '<link rel="stylesheet" href="./assets/print.css" />')}
<body class="print">
<h1 class="print-title">${esc(book.title)}</h1>
<p class="print-subtitle">${esc(book.subtitle)}</p>
<p class="print-preface">${esc(book.preface)}</p>
${book.topics
  .map(
    (topic) => `<article class="print-topic">
  <h2>${esc(topic.title)}</h2>
  <p class="summary">${esc(topic.summary)}</p>
  <h3>A · ${esc(book.ui.tutorial)}</h3>
  <p>${esc(topic.tutorial.goal)}</p>
  <ol>${topic.tutorial.steps.map((step) => `<li>${esc(step)}</li>`).join('')}</ol>
  <p class="expected"><strong>${esc(book.ui.expected)}</strong> ${esc(topic.tutorial.expected)}</p>
  <h3>B · ${esc(book.ui.advanced)}</h3>
  ${list(topic.advanced.assumptions, '', book.ui.assumptions)}
  ${list(topic.advanced.whenToUse, '', book.ui.whenToUse)}
  ${list(topic.advanced.whenNotToUse, 'warn', book.ui.whenNotToUse)}
  ${list(topic.advanced.reading, '', book.ui.reading)}
  ${list(topic.advanced.pitfalls, 'warn', book.ui.pitfalls)}
</article>`
  )
  .join('\n')}
</body>
</html>`;

const CSS = `:root {
  color-scheme: dark;
  --bg: #0d1117;
  --surface: #151b23;
  --surface2: #1c242e;
  --border: #2a3441;
  --text: #e6edf3;
  --text2: #b8c4d0;
  --muted: #8b98a5;
  --accent: #38bdf8;
  --accent2: #a78bfa;
  --warn: #fbbf24;
  --ok: #34d399;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font: 16px/1.65 "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
}
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
code { font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: .9em; background: var(--surface2); padding: .1em .35em; border-radius: 4px; }
.topbar {
  position: sticky; top: 0; z-index: 5;
  display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
  padding: .6rem 1.2rem; background: rgba(13,17,23,.94);
  border-bottom: 1px solid var(--border); backdrop-filter: blur(6px);
}
.brand { font-family: "IBM Plex Mono", monospace; text-transform: uppercase; letter-spacing: .18em; font-size: .72rem; color: var(--text2); }
.topnav { margin-left: auto; display: flex; gap: 1rem; font-size: .8rem; }
.page { max-width: 74ch; margin: 0 auto; padding: 2.2rem 1.4rem 4rem; }
.breadcrumb { font-size: .78rem; color: var(--muted); margin-bottom: .8rem; }
h1 { font-size: 1.9rem; line-height: 1.2; margin: 0 0 .6rem; }
h2 { font-size: 1.25rem; margin: 2rem 0 .4rem; }
h3 { font-size: .78rem; text-transform: uppercase; letter-spacing: .12em; color: var(--accent2); margin: 1.4rem 0 .5rem; }
.summary { color: var(--text2); font-size: 1.02rem; margin: 0 0 1.4rem; }
.kicker { font-family: "IBM Plex Mono", monospace; text-transform: uppercase; letter-spacing: .18em; font-size: .7rem; color: var(--accent); }
.preface { color: var(--text2); font-size: 1.05rem; }
.levels { display: flex; gap: .5rem; margin: 1.4rem 0 1.2rem; border-bottom: 1px solid var(--border); }
.level-tab { background: none; border: 0; border-bottom: 2px solid transparent; color: var(--muted); padding: .5rem .8rem; font: inherit; font-size: .84rem; cursor: pointer; }
.level-tab.active { color: var(--text); border-bottom-color: var(--accent); }
.level-tab:hover { color: var(--text); }
.goal { font-size: 1.05rem; }
.steps { padding-left: 1.3rem; }
.steps li { margin: .35rem 0; }
.dataset { font-size: .9rem; color: var(--text2); }
.callout { border-left: 3px solid var(--ok); background: var(--surface); padding: .7rem 1rem; border-radius: 6px; margin-top: 1rem; }
.callout p { margin: .3rem 0 0; color: var(--text2); }
ul.warn li { color: var(--warn); }
.glossary dt { color: var(--text); font-weight: 600; margin-top: .6rem; }
.glossary dd { margin: .1rem 0 0; color: var(--text2); }
.levels-legend { display: grid; gap: .3rem; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: .8rem 1rem; margin: 1.4rem 0; font-size: .9rem; color: var(--text2); }
.levels-legend p { margin: 0; }
.search { margin: 2rem 0 1rem; }
.search label { display: block; font-family: "IBM Plex Mono", monospace; font-size: .7rem; text-transform: uppercase; letter-spacing: .12em; color: var(--muted); margin-bottom: .3rem; }
.search input { width: 100%; padding: .6rem .8rem; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); color: var(--text); font: inherit; }
.chapter { margin: 1.6rem 0; }
.blurb { color: var(--muted); font-size: .9rem; margin: .2rem 0 .6rem; }
ul.topics { list-style: none; padding: 0; margin: 0; }
ul.topics li { padding: .3rem 0; border-bottom: 1px solid var(--border); font-size: .94rem; }
.muted { color: var(--muted); font-size: .82rem; }
.pager { display: flex; justify-content: space-between; gap: 1rem; margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--border); font-size: .88rem; }
.footer { border-top: 1px solid var(--border); padding: 1.2rem 1.4rem; text-align: center; font-size: .8rem; color: var(--muted); }
.footer p { margin: .2rem 0; }
.center { text-align: center; margin-top: 2.5rem; }
.empty { color: var(--warn); }
@media (min-width: 60rem) {
  .page { padding-top: 3rem; }
}
`;

const PRINT_CSS = `@page { margin: 18mm; }
body.print { background: #fff; color: #111; font-size: 11pt; max-width: 100%; padding: 0 8mm; }
body.print a { color: #111; }
.print-title { font-size: 26pt; margin-bottom: .2rem; }
.print-subtitle { color: #555; font-size: 12pt; margin-top: 0; }
.print-preface { color: #333; }
.print-topic { break-before: page; page-break-before: always; }
.print-topic:first-of-type { break-before: auto; page-break-before: auto; }
.print-topic h2 { font-size: 17pt; margin-bottom: .2rem; }
.print-topic h3 { font-size: 9pt; letter-spacing: .1em; color: #0b5cad; border-bottom: 1px solid #ddd; padding-bottom: 2px; }
.print-topic ul.warn li { color: #92400e; }
.print-topic .expected { background: #f1f5f9; padding: .4rem .6rem; border-left: 3px solid #0ea5e9; }
`;

const JS = `(function () {
  var STORE = 'lazstats.help.level';
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-level]'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-level-panel]'));
  function show(level) {
    panels.forEach(function (panel) { panel.hidden = panel.getAttribute('data-level-panel') !== level; });
    tabs.forEach(function (tab) {
      var on = tab.getAttribute('data-level') === level;
      tab.classList.toggle('active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    try { localStorage.setItem(STORE, level); } catch (e) {}
  }
  if (tabs.length && panels.length) {
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () { show(tab.getAttribute('data-level')); });
    });
    var initial = location.hash === '#advanced' ? 'advanced' : location.hash === '#tutorial' ? 'tutorial' : null;
    if (!initial) { try { initial = localStorage.getItem(STORE); } catch (e) {} }
    show(initial === 'advanced' ? 'advanced' : 'tutorial');
  }
  var input = document.getElementById('q');
  if (input) {
    var topics = Array.prototype.slice.call(document.querySelectorAll('[data-topic]'));
    var empty = document.getElementById('search-empty');
    var contents = document.getElementById('contents');
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      topics.forEach(function (topic) {
        var hay = (topic.getAttribute('data-keywords') || '').toLowerCase();
        var match = !q || hay.indexOf(q) !== -1;
        topic.hidden = !match;
        if (match) shown += 1;
      });
      if (empty) empty.hidden = shown !== 0;
      if (contents) contents.hidden = q.length > 0;
    });
  }
})();
`;

const bookFiles = (book) => {
  const dir = join(OUT, book.locale);
  mkdirSync(join(dir, 'assets'), { recursive: true });
  writeFileSync(join(dir, 'assets/help.css'), CSS);
  writeFileSync(join(dir, 'assets/print.css'), PRINT_CSS);
  writeFileSync(join(dir, 'assets/help.js'), JS);
  writeFileSync(join(dir, 'index.html'), indexPage(book));
  writeFileSync(join(dir, 'print.html'), printPage(book));
  book.topics.forEach((topic, index) => {
    writeFileSync(
      join(dir, `${topic.id}.html`),
      topicPage(book, topic, book.topics[index - 1], book.topics[index + 1])
    );
  });
  const search = book.topics.map((topic) => ({
    id: topic.id,
    title: topic.title,
    summary: topic.summary,
    area: topic.area,
    text: [
      topic.tutorial.goal,
      ...topic.tutorial.steps,
      ...(topic.advanced.assumptions ?? []),
      ...topic.advanced.whenToUse,
      ...(topic.advanced.pitfalls ?? []),
    ].join(' '),
  }));
  writeFileSync(join(dir, 'search.json'), JSON.stringify(search));
  return book.topics.length;
};

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

let total = 0;
for (const book of BOOKS) {
  const topics = bookFiles(book);
  total += topics;
  console.log(`help/${book.locale}: ${topics} topics`);
  // Example datasets are shared by every locale; a locale folder can override one.
  const shared = join(process.cwd(), 'src/help/content/data');
  const override = join(process.cwd(), 'src/help/content', book.locale, 'data');
  mkdirSync(join(OUT, book.locale, 'data'), { recursive: true });
  if (existsSync(shared)) cpSync(shared, join(OUT, book.locale, 'data'), { recursive: true });
  if (existsSync(override)) cpSync(override, join(OUT, book.locale, 'data'), { recursive: true });
  console.log(`help/${book.locale}: ${readdirSync(join(OUT, book.locale, 'data')).length} example datasets`);
}

writeFileSync(
  join(OUT, 'index.html'),
  `<!doctype html><meta charset="utf-8"><title>LazStats help</title>
<meta http-equiv="refresh" content="0; url=./${BOOKS[0].locale}/index.html">
<p><a href="./${BOOKS[0].locale}/index.html">Open the help book</a></p>`
);
console.log(`help: ${BOOKS.length} locales, ${total} topics`);
