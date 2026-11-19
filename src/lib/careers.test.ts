import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildCatalog } from './catalog.ts';
import { buildCareers, experiences, relatedCareers, suggestedTopics } from './careers.ts';

const source = readFileSync(new URL('../content/Skills.md', import.meta.url), 'utf8');
const skills = buildCatalog(source);
const careers = buildCareers(source, skills);

test('all seven career names and five available descriptions come from the wiki', () => {
  assert.equal(careers.length, 7);
  assert.equal(careers.filter((career) => career.hasDescription).length, 5);
  for (const career of careers) {
    assert.ok(source.toLowerCase().includes(career.title.toLowerCase()));
    if (career.hasDescription) assert.ok(source.includes(career.description));
  }
});

test('every astronomy experience resolves to source content and at least one career', () => {
  for (const experience of experiences) {
    assert.ok(skills.some((skill) => skill.id === experience.skillId));
    assert.ok(relatedCareers(careers, experience.skillId).length > 0);
  }
});

test('next topics exclude the selected skill and only reference existing wiki topics', () => {
  const analyst = careers.find((career) => career.id === 'data-analyst')!;
  const topics = suggestedTopics(analyst, 'sql', skills);
  assert.deepEqual(topics.map((skill) => skill.id), ['dashboards', 'collaboration']);
});

test('role-definition drift cannot silently create generic replacement text', () => {
  assert.throws(() => buildCareers(source.replace('data analyst:', 'analyst role:'), skills));
});