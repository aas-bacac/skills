import { useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Flag, Route } from 'lucide-react';
import { relatedCareers, suggestedTopics } from '../../lib/careers';
import type { Skill } from '../../lib/catalog';
import { ExperiencePicker, TopicLinks, TopicReader, Translation, useExperience, type ConceptProps } from './Shared';

export default function CareerRoadmap({ skills, careers, base }: ConceptProps) {
  const { experience, setExperienceId } = useExperience();
  const [careerId, setCareerId] = useState('data-analyst');
  const [inspectedId, setInspectedId] = useState<string | null>(null);
  const [reading, setReading] = useState<Skill | null>(null);
  const detail = useRef<HTMLElement>(null);
  const career = careers.find((entry) => entry.id === careerId)!;
  const start = skills.find((skill) => skill.id === experience.skillId)!;
  const path = suggestedTopics(career, start.id, skills);
  const foundations = path.filter((skill) => skill.group === 'general');
  const specialist = path.filter((skill) => skill.group !== 'general');
  const inspected = skills.find((skill) => skill.id === inspectedId) ?? start;
  const connected = relatedCareers(careers, start.id);

  function chooseExperience(id: string) {
    setExperienceId(id);
    setInspectedId(null);
  }

  function inspectTopic(id: string) {
    setInspectedId(id);
    if (window.matchMedia('(max-width: 1000px)').matches) requestAnimationFrame(() => { detail.current?.focus({ preventScroll: true }); detail.current?.scrollIntoView({ block: 'start' }); });
  }

  return <div className="roadmap-layout">
    <aside className="roadmap-sidebar"><span className="c-eyebrow"><Route size={15} />CAREER PATHS</span><nav aria-label="Career paths">{['Data science', 'Aerospace'].map((field) => <section key={field}><h2>{field}</h2>{careers.filter((entry) => entry.field === field).map((entry) => <button key={entry.id} aria-pressed={career.id === entry.id} className={career.id === entry.id ? 'active' : ''} onClick={() => { setCareerId(entry.id); setInspectedId(null); }}><span>{entry.title}</span><ArrowRight size={14} /></button>)}</section>)}</nav><div className="roadmap-source-note"><img src={`${base}images/nebula.jpg`} width="420" height="320" alt="A field of stars within a nebula" /><span>18 wiki topics. Seven possible destinations.</span></div></aside>
    <div className="roadmap-main"><header className="roadmap-title"><div className="c-page-title"><span className="c-eyebrow">02 / CAREER ROADMAPS</span><h1>{career.title}</h1><p>{career.description}</p></div><span className="roadmap-path-label">SUGGESTED EXPLORATION</span></header>
      <div className="roadmap-start-control"><ExperiencePicker compact experience={experience} onChange={chooseExperience} /><div className="roadmap-relation-state">{career.skillIds.includes(start.id) ? <><span className="roadmap-state-dot" />A connection to this path</> : <>This starting point is not linked to the selected role.</>}</div></div>
      <div className="roadmap-workspace"><section className="roadmap-map" aria-label={`${career.title} topic roadmap`}>
        <div className="roadmap-lane"><span className="roadmap-step">01</span><div className="roadmap-stage-heading"><span>YOUR STARTING POINT</span><h2>{experience.title}</h2></div><button className={`roadmap-node starting ${inspected.id === start.id ? 'selected' : ''}`} aria-pressed={inspected.id === start.id} onClick={() => inspectTopic(start.id)}><span><small>Industry language</small><strong>{start.title}</strong></span><ArrowUpRight size={17} /></button></div>
        {foundations.length > 0 && <div className="roadmap-lane"><span className="roadmap-step">02</span><div className="roadmap-stage-heading"><span>SHARED FOUNDATIONS</span><h2>Capabilities that travel with you</h2></div><div className="roadmap-node-row">{foundations.map((skill) => <button key={skill.id} className={`roadmap-node ${inspected.id === skill.id ? 'selected' : ''}`} aria-pressed={inspected.id === skill.id} onClick={() => inspectTopic(skill.id)}><strong>{skill.title}</strong><ArrowUpRight size={15} /></button>)}</div></div>}
        <div className="roadmap-lane"><span className="roadmap-step">{foundations.length ? '03' : '02'}</span><div className="roadmap-stage-heading"><span>FIELD-SPECIFIC TOPICS</span><h2>More of the industry context</h2></div><div className="roadmap-node-row">{specialist.map((skill) => <button key={skill.id} className={`roadmap-node ${inspected.id === skill.id ? 'selected' : ''}`} aria-pressed={inspected.id === skill.id} onClick={() => inspectTopic(skill.id)}><strong>{skill.title}</strong><ArrowUpRight size={15} /></button>)}</div></div>
        <div className="roadmap-destination"><Flag size={19} /><div><span>A CAREER TO INVESTIGATE</span><h2>{career.title}</h2></div></div><p className="c-caveat">A suggested reading sequence, not a prerequisite chain or a complete training plan. Aerospace associations use field-wide wiki topics.</p>
      </section>
      <aside className="roadmap-detail" ref={detail} tabIndex={-1} aria-label="Selected roadmap topic"><span className="c-eyebrow"><BookOpen size={13} />IN FOCUS</span><Translation skill={inspected} /><button className="c-command" onClick={() => setReading(inspected)}>Read full wiki entry<ArrowUpRight size={14} /></button><div className="roadmap-next"><h3>Another topic on this path</h3><TopicLinks skills={suggestedTopics(career, inspected.id, skills)} onSelect={(skill) => setInspectedId(skill.id)} /></div></aside></div>
      <section className="roadmap-other"><div><span className="c-eyebrow">OTHER DIRECTIONS</span><h2>From the same starting point</h2></div><div>{connected.map((entry) => <button key={entry.id} onClick={() => { setCareerId(entry.id); setInspectedId(null); }}>{entry.title}<ArrowRight size={14} /></button>)}</div><ArrowDown className="roadmap-other-arrow" size={18} /></section>
    </div><TopicReader skill={reading} onClose={() => setReading(null)} />
  </div>;
}