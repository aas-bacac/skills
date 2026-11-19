import { fromMarkdown } from 'mdast-util-from-markdown';
import { toMarkdown } from 'mdast-util-to-markdown';
import { toString } from 'mdast-util-to-string';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import type { ListItem, RootContent } from 'mdast';

export const groups = [
  { id: 'general', name: 'General', subtitle: 'Foundations across fields', color: '#236e59' },
  { id: 'data-science', name: 'Data science', subtitle: 'From analysis to applications', color: '#315fbd' },
  { id: 'aerospace', name: 'Aerospace', subtitle: 'Systems, decisions & teams', color: '#ae492b' },
] as const;

export type GroupId = typeof groups[number]['id'];
export type Theme = 'Communication' | 'Modeling & statistics' | 'Software & data' | 'Judgment & growth';
export const themes: Theme[] = ['Communication', 'Modeling & statistics', 'Software & data', 'Judgment & growth'];

const definitions: Record<GroupId, { id: string; title: string; prefix: string; themes: Theme[] }[]> = {
  general: [
    { id: 'collaboration', title: 'Communication & collaboration', prefix: 'teamwork,', themes: ['Communication'] },
    { id: 'learning', title: 'Continuous learning', prefix: 'Continuous learning', themes: ['Judgment & growth'] },
    { id: 'statistics', title: 'Modeling & statistics', prefix: 'mathematical modeling', themes: ['Modeling & statistics'] },
    { id: 'development', title: 'Software development', prefix: 'software development', themes: ['Software & data'] },
    { id: 'business', title: 'Business acumen', prefix: 'business acumen', themes: ['Judgment & growth'] },
  ],
  'data-science': [
    { id: 'roles', title: 'Roles in data science', prefix: 'A note on data science', themes: ['Judgment & growth'] },
    { id: 'sql', title: 'SQL', prefix: 'SQL', themes: ['Software & data'] },
    { id: 'dashboards', title: 'Metrics dashboards', prefix: 'Metrics dashboards', themes: ['Communication', 'Software & data'] },
    { id: 'machine-learning', title: 'Machine learning', prefix: 'Machine Learning', themes: ['Modeling & statistics', 'Software & data'] },
    { id: 'experimentation', title: 'A/B testing & statistics', prefix: 'AB testing', themes: ['Modeling & statistics'] },
    { id: 'engineering', title: 'Software engineering', prefix: 'Software Engineering', themes: ['Software & data'] },
  ],
  aerospace: [
    { id: 'aerospace-roles', title: 'Roles in aerospace', prefix: 'Common jobs', themes: ['Judgment & growth'] },
    { id: 'communication', title: 'Technical communication', prefix: 'Communication', themes: ['Communication'] },
    { id: 'teamwork', title: 'Teamwork', prefix: 'Teamwork:', themes: ['Communication'] },
    { id: 'recommendations', title: 'Making recommendations', prefix: 'Recommendation-making', themes: ['Communication', 'Judgment & growth'] },
    { id: 'decisions', title: 'Decision-making', prefix: 'Decision-making:', themes: ['Judgment & growth'] },
    { id: 'tools', title: 'Python & MATLAB', prefix: 'Software:', themes: ['Software & data'] },
    { id: 'models', title: 'Modeling techniques', prefix: 'Modeling Techniques:', themes: ['Modeling & statistics'] },
  ],
};

export type Skill = {
  id: string;
  title: string;
  group: GroupId;
  themes: Theme[];
  html: string;
  comparisons: { label: 'Astronomy' | 'Industry'; html: string }[];
  searchText: string;
  preview: string;
  unfinished: boolean;
};

export type Connection = { source: string; target: string; label: string };

export const connections: Connection[] = [
  { source: 'collaboration', target: 'communication', label: 'Adapting technical ideas to an audience' },
  { source: 'collaboration', target: 'teamwork', label: 'Working within a larger collaboration' },
  { source: 'collaboration', target: 'dashboards', label: 'Communicating findings' },
  { source: 'collaboration', target: 'recommendations', label: 'Communicating a course of action' },
  { source: 'statistics', target: 'machine-learning', label: 'Model evaluation and statistical bias' },
  { source: 'statistics', target: 'experimentation', label: 'Statistical reasoning and uncertainty' },
  { source: 'statistics', target: 'models', label: 'Connecting observations to models' },
  { source: 'development', target: 'engineering', label: 'Developing reliable software' },
  { source: 'development', target: 'tools', label: 'Programming for technical work' },
  { source: 'development', target: 'sql', label: 'Working with data in code' },
  { source: 'business', target: 'recommendations', label: 'Balancing technical work and organizational goals' },
  { source: 'business', target: 'decisions', label: 'Making decisions under constraints' },
  { source: 'learning', target: 'roles', label: 'Exploring new technical directions' },
  { source: 'learning', target: 'aerospace-roles', label: 'Exploring new technical directions' },
  { source: 'sql', target: 'dashboards', label: 'Turning queried data into reports' },
  { source: 'machine-learning', target: 'engineering', label: 'Software behind machine learning applications' },
  { source: 'machine-learning', target: 'experimentation', label: 'Evaluation, metrics, and bias' },
  { source: 'communication', target: 'recommendations', label: 'Explaining the implications of technical findings' },
  { source: 'models', target: 'decisions', label: 'Using models to inform uncertain decisions' },
];

export function renderMarkdown(markdown: string): string {
  return sanitizeHtml(marked.parse(markdown, { async: false }), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3']),
    transformTags: {
      a: (tagName, attributes) => ({
        tagName,
        attribs: { ...attributes, href: attributes.href === 'Skills' ? '#browse' : attributes.href },
      }),
    },
  });
}

function comparison(item: ListItem): { label: 'Astronomy' | 'Industry'; html: string } | null {
  const first = item.children[0];
  if (first?.type !== 'paragraph' || first.children[0]?.type !== 'text') return null;
  const match = /^(astronomy equivalents?|industry(?: equivalent)?):\s*/i.exec(first.children[0].value);
  if (!match) return null;
  const cleaned = structuredClone(item.children);
  const paragraph = cleaned[0];
  if (paragraph.type === 'paragraph' && paragraph.children[0].type === 'text') {
    paragraph.children[0].value = paragraph.children[0].value.slice(match[0].length);
  }
  return {
    label: match[1].toLowerCase().startsWith('astronomy') ? 'Astronomy' : 'Industry',
    html: renderMarkdown(toMarkdown({ type: 'root', children: cleaned })),
  };
}

export function buildCatalog(markdown: string): Skill[] {
  const document = fromMarkdown(markdown);
  const skills: Skill[] = [];
  let groupIndex = -1;
  for (const node of document.children) {
    if (node.type === 'heading' && node.depth === 2) {
      groupIndex += 1;
      if (toString(node) !== ['General', 'Data Science', 'Aerospace'][groupIndex]) {
        throw new Error('Source section changed; review catalog metadata.');
      }
    }
    if (node.type !== 'list' || groupIndex < 0) continue;
    const group = groups[groupIndex].id;
    const metadata = definitions[group];
    if (node.children.length !== metadata.length) throw new Error(`Topic count changed in ${group}.`);
    for (const [index, item] of node.children.entries()) {
      const definition = metadata[index];
      if (!toString(item.children[0]).startsWith(definition.prefix)) {
        throw new Error(`Source order changed near ${definition.id}.`);
      }
      const comparisons: Skill['comparisons'] = [];
      const children: RootContent[] = [];
      for (const child of item.children) {
        if (child.type !== 'list') {
          children.push(child);
          continue;
        }
        const remaining = child.children.filter((entry) => {
          const extracted = comparison(entry);
          if (extracted) comparisons.push(extracted);
          return !extracted;
        });
        if (remaining.length) children.push({ ...child, children: remaining });
      }
      const fullText = toString(item);
      const childList = item.children.find((child) => child.type === 'list');
      const previewText = childList ? toString(childList.children[0]) : toString(item.children[0]);
      skills.push({
        ...definition,
        group,
        html: renderMarkdown(toMarkdown({ type: 'root', children })),
        comparisons,
        searchText: `${definition.title} ${group} ${definition.themes.join(' ')} ${fullText}`.toLowerCase(),
        preview: previewText.replace(/^(astronomy equivalents?|industry(?: equivalent)?):\s*/i, ''),
        unfinished: /placeholder/i.test(fullText) || !childList,
      });
    }
  }
  if (groupIndex !== 2) throw new Error('Expected all three source sections.');
  return skills;
}

export function filterSkills(skills: Skill[], query: string, group: string, savedOnly: boolean, saved: string[]): Skill[] {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return skills.filter((skill) =>
    (group === 'all' || skill.group === group) &&
    (!savedOnly || saved.includes(skill.id)) &&
    terms.every((term) => skill.searchText.includes(term)),
  );
}