import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { buildCatalog, connections, filterSkills, renderMarkdown, themes } from './catalog.ts';

const source = readFileSync(new URL('../content/Skills.md', import.meta.url), 'utf8');
const skills = buildCatalog(source);

test('all 18 original topics are preserved in their sections', () => {
  assert.equal(skills.length, 18);
  assert.equal(skills.filter((skill) => skill.group === 'general').length, 5);
  assert.equal(skills.filter((skill) => skill.group === 'data-science').length, 6);
  assert.equal(skills.filter((skill) => skill.group === 'aerospace').length, 7);
  assert.equal(new Set(skills.map((skill) => skill.id)).size, skills.length);
});

test('source snapshots match local wiki when available', () => {
  for (const page of ['Skills', 'Home']) {
    const wiki = new URL(`../../wiki/${page}.md`, import.meta.url);
    if (existsSync(wiki)) {
      assert.equal(readFileSync(new URL(`../content/${page}.md`, import.meta.url), 'utf8'), readFileSync(wiki, 'utf8'));
    }
  }
});

test('explicit analogues become comparisons without losing their text', () => {
  const sql = skills.find((skill) => skill.id === 'sql')!;
  assert.deepEqual(sql.comparisons.map((entry) => entry.label), ['Astronomy', 'Industry']);
  assert.match(sql.comparisons[0].html, /SDSS/);
  assert.match(sql.comparisons[1].html, /customers/);
  assert.match(skills.find((skill) => skill.id === 'business')!.html, /Placeholder/);
});

test('search combines full source text, categories, and saved filters', () => {
  assert.deepEqual(filterSkills(skills, 'SDSS', 'all', false, []).map((skill) => skill.id), ['sql']);
  assert.equal(filterSkills(skills, 'SDSS', 'aerospace', false, []).length, 0);
  assert.equal(filterSkills(skills, '', 'all', true, ['sql']).length, 1);
  assert.equal(filterSkills(skills, '   ', 'general', false, []).length, 5);
  assert.ok(filterSkills(skills, 'statistical bias', 'all', false, []).length > 0);
});

test('relationships and matrix themes reference real topics', () => {
  const ids = new Set(skills.map((skill) => skill.id));
  for (const connection of connections) {
    assert.ok(ids.has(connection.source) && ids.has(connection.target));
    assert.notEqual(connection.source, connection.target);
    assert.ok(connection.label.length > 10);
  }
  for (const skill of skills) assert.ok(skill.themes.every((theme) => themes.includes(theme)));
});

test('source drift fails loudly and raw HTML is sanitized', () => {
  assert.throws(() => buildCatalog(source.replace('- SQL\n', '- SQL changed\n').replace('- Continuous learning', '- Other learning')));
  assert.doesNotMatch(renderMarkdown('<script>alert(1)</script><a href="javascript:alert(1)">test</a>'), /<script|javascript:/);
});