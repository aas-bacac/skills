import { fromMarkdown } from 'mdast-util-from-markdown';
import { toString } from 'mdast-util-to-string';
import type { Skill } from './catalog.ts';

export type Career = {
  id: string;
  title: string;
  field: 'Data science' | 'Aerospace';
  description: string;
  hasDescription: boolean;
  skillIds: string[];
};

const careerDefinitions = [
  { id: 'data-analyst', title: 'Data analyst', prefix: 'data analyst:', field: 'Data science', skillIds: ['sql', 'dashboards', 'collaboration'] },
  { id: 'data-scientist', title: 'Data scientist', prefix: 'data scientist:', field: 'Data science', skillIds: ['statistics', 'sql', 'machine-learning', 'experimentation'] },
  { id: 'applied-scientist', title: 'Applied scientist', prefix: 'applied scientist:', field: 'Data science', skillIds: ['statistics', 'machine-learning', 'engineering'] },
  { id: 'ml-researcher', title: 'Machine learning researcher', prefix: 'machine learning researcher:', field: 'Data science', skillIds: ['statistics', 'machine-learning', 'learning'] },
  { id: 'ml-engineer', title: 'Machine learning engineer', prefix: 'machine learning engineer:', field: 'Data science', skillIds: ['development', 'engineering', 'machine-learning', 'sql'] },
  { id: 'systems-engineer', title: 'Systems engineer', prefix: null, field: 'Aerospace', skillIds: ['models', 'recommendations', 'communication', 'teamwork', 'decisions'] },
  { id: 'test-engineer', title: 'Test engineer', prefix: null, field: 'Aerospace', skillIds: ['models', 'tools', 'communication', 'decisions'] },
] as const;

export const experiences = [
  { id: 'catalogs', title: 'Query astronomical catalogs', subtitle: 'Samples, selection criteria, databases', skillId: 'sql' },
  { id: 'measurements', title: 'Measure & report findings', subtitle: 'Measurable quantities and conclusions', skillId: 'dashboards' },
  { id: 'models', title: 'Fit models to observations', subtitle: 'Parameter estimation and statistical bias', skillId: 'machine-learning' },
  { id: 'collaboration', title: 'Work in a large collaboration', subtitle: 'Shared software, simulations, hardware', skillId: 'collaboration' },
  { id: 'software', title: 'Develop scientific software', subtitle: 'Code and collaborative development', skillId: 'development' },
  { id: 'communication', title: 'Explain technical findings', subtitle: 'Technical detail, audience, implications', skillId: 'communication' },
  { id: 'modeling', title: 'Model a physical system', subtitle: 'Monte Carlo, signal-to-noise, throughput', skillId: 'models' },
] as const;

export type Experience = typeof experiences[number];

export function buildCareers(markdown: string, skills: Skill[]): Career[] {
  const document = fromMarkdown(markdown);
  const rootItems = document.children.flatMap((node) => node.type === 'list' ? node.children : []);
  const roleItem = rootItems.find((item) => toString(item.children[0]).startsWith('A note on data science subdisciplines:'));
  const roleParagraphs = roleItem?.children.flatMap((node) => node.type === 'list' ? node.children.map((item) => toString(item)) : []) ?? [];
  const aerospace = rootItems.find((item) => toString(item).startsWith('Common jobs for astronomers in aerospace:'));
  const ids = new Set(skills.map((skill) => skill.id));
  return careerDefinitions.map((definition) => {
    const paragraph = definition.prefix ? roleParagraphs.find((text) => text.startsWith(definition.prefix!)) : undefined;
    if (definition.prefix && !paragraph) throw new Error(`Missing wiki definition for ${definition.id}.`);
    if (!definition.prefix && !toString(aerospace).toLowerCase().includes(definition.title.toLowerCase())) {
      throw new Error(`Missing wiki role name: ${definition.id}.`);
    }
    if (!definition.skillIds.every((id) => ids.has(id))) throw new Error(`Unknown skill for ${definition.id}.`);
    return {
      id: definition.id,
      title: definition.title,
      field: definition.field,
      description: paragraph ? paragraph.slice(definition.prefix!.length).trim() : 'Named in the aerospace section. A role description has not yet been added to the wiki.',
      hasDescription: !!paragraph,
      skillIds: [...definition.skillIds],
    };
  });
}

export function relatedCareers(careers: Career[], skillId: string): Career[] {
  return careers.filter((career) => career.skillIds.includes(skillId));
}

export function suggestedTopics(career: Career, currentSkillId: string, skills: Skill[]): Skill[] {
  return career.skillIds.filter((id) => id !== currentSkillId).map((id) => skills.find((skill) => skill.id === id)!);
}