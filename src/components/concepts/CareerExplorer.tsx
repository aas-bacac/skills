import { useDeferredValue, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, Search, X } from 'lucide-react';
import { relatedCareers, suggestedTopics } from '../../lib/careers';
import type { Skill } from '../../lib/catalog';
import { ExperiencePicker, TopicLinks, TopicReader, Translation, useExperience, type ConceptProps } from './Shared';

export default function CareerExplorer({ skills, careers, base }: ConceptProps) {
  const { experience, setExperienceId } = useExperience();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [field, setField] = useState('all');
  const [connectedOnly, setConnectedOnly] = useState(true);
  const [careerId, setCareerId] = useState('data-analyst');
  const [topic, setTopic] = useState<Skill | null>(null);
  const detail = useRef<HTMLElement>(null);
  const currentSkill = skills.find((skill) => skill.id === experience.skillId)!;
  const related = relatedCareers(careers, experience.skillId);
  const terms = deferredQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const visible = careers.filter((career) => (field === 'all' || career.field === field) && (!connectedOnly || related.includes(career)) && terms.every((term) => `${career.title} ${career.description} ${career.skillIds.map((id) => skills.find((skill) => skill.id === id)!.searchText).join(' ')}`.toLowerCase().includes(term)));
  const selected = visible.find((career) => career.id === careerId) ?? visible[0] ?? related[0];

  function chooseExperience(id: string) {
    setExperienceId(id);
    setQuery('');
    setField('all');
  }

  function chooseCareer(id: string) {
    setCareerId(id);
    if (window.matchMedia('(max-width: 1250px)').matches) requestAnimationFrame(() => { detail.current?.focus({ preventScroll: true }); detail.current?.scrollIntoView({ block: 'start' }); });
  }

  return <div className="career-explorer">
    <aside className="explorer-experience"><span className="c-eyebrow">START WITH WHAT YOU KNOW</span><ExperiencePicker experience={experience} onChange={chooseExperience} /><div className="c-photo"><img src={`${base}images/nebula.jpg`} width="420" height="320" alt="A nebula and distant stars" /><span>Astronomy is a starting point.</span></div></aside>
    <div className="explorer-center"><header className="c-page-title"><span className="c-eyebrow">01 / CAREER EXPLORER</span><h1>Careers beyond astronomy</h1><p>Different settings. Familiar capabilities.</p></header>
      <Translation skill={currentSkill} />
      <section className="career-results" aria-label="Career results"><div className="c-section-heading"><h2>Career connections</h2><span role="status">{visible.length} of {careers.length} roles</span></div>
        <div className="career-filters"><label className="c-search"><Search size={17} /><input type="search" placeholder="Search roles or skills" aria-label="Search careers" value={query} onChange={(event) => setQuery(event.target.value)} />{query && <button className="c-icon" aria-label="Clear search" title="Clear search" onClick={() => setQuery('')}><X size={15} /></button>}</label><select aria-label="Career sector" value={field} onChange={(event) => setField(event.target.value)}><option value="all">All sectors</option><option>Data science</option><option>Aerospace</option></select></div>
        <label className="c-checkbox"><input type="checkbox" checked={connectedOnly} onChange={(event) => setConnectedOnly(event.target.checked)} />Connected to this experience</label>
        <div className="career-card-grid">{visible.map((career) => <article key={career.id} className={`career-card ${selected.id === career.id ? 'chosen' : ''}`}><div className="career-card-meta"><span className={`c-sector ${career.field === 'Aerospace' ? 'aerospace' : ''}`}>{career.field}</span>{related.includes(career) && <span className="c-connected"><Check size={12} />Connected</span>}</div><h3>{career.title}</h3><p>{career.description}</p><div className="career-card-topics">{career.skillIds.slice(0, 3).map((id) => <span key={id}>{skills.find((skill) => skill.id === id)!.title}</span>)}</div><button className="c-card-command" aria-pressed={selected.id === career.id} onClick={() => chooseCareer(career.id)}>Explore {career.title.toLowerCase()}<ArrowRight size={15} /></button></article>)}</div>
        {visible.length === 0 && <div className="c-empty"><h3>No matching careers</h3><button className="c-command" onClick={() => { setQuery(''); setField('all'); setConnectedOnly(false); }}>Show all seven roles<ArrowRight size={15} /></button></div>}
      </section>
    </div>
    <aside className="career-detail" ref={detail} tabIndex={-1} aria-label="Selected career"><span className="c-eyebrow">A CLOSER LOOK</span><h2>{selected.title}</h2><p className="c-sector-description">{selected.field}</p><p className="career-description">{selected.description}</p><h3>Topics to explore next</h3><TopicLinks skills={suggestedTopics(selected, experience.skillId, skills)} onSelect={setTopic} /><p className="c-caveat">Suggested topics, not a list of qualifications you lack.</p><a className="c-source" href="https://github.com/aas-bacac/skills/wiki/Skills">Source and original wording<ArrowUpRight size={13} /></a></aside>
    <TopicReader skill={topic} onClose={() => setTopic(null)} />
  </div>;
}