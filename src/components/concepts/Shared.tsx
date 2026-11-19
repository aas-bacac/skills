import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, Orbit, X } from 'lucide-react';
import { experiences, type Career, type Experience } from '../../lib/careers';
import type { Skill } from '../../lib/catalog';

export type ConceptProps = { skills: Skill[]; careers: Career[]; base: string };

export function useExperience() {
  const [experienceId, setExperienceId] = useState<string>('catalogs');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const requested = new URLSearchParams(location.hash.slice(1)).get('experience');
    if (experiences.some((entry) => entry.id === requested)) setExperienceId(requested!);
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) history.replaceState(null, '', `${location.pathname}${location.search}#experience=${experienceId}`);
  }, [experienceId, ready]);
  return { experience: experiences.find((entry) => entry.id === experienceId)!, setExperienceId };
}

export function ExperiencePicker({ experience, onChange, compact = false }: { experience: Experience; onChange: (id: string) => void; compact?: boolean }) {
  if (compact) return <label className="c-select-label">Your astronomy experience<select aria-label="Your astronomy experience" value={experience.id} onChange={(event) => onChange(event.target.value)}>{experiences.map((entry) => <option value={entry.id} key={entry.id}>{entry.title}</option>)}</select></label>;
  return <fieldset className="experience-picker"><legend>Your astronomy experience</legend>{experiences.map((entry, index) => <label key={entry.id} className={experience.id === entry.id ? 'active' : ''}>
    <input type="radio" name="astronomy-experience" value={entry.id} checked={experience.id === entry.id} onChange={() => onChange(entry.id)} />
    <span className="experience-number">0{index + 1}</span><span><strong>{entry.title}</strong><small>{entry.subtitle}</small></span><ArrowRight size={14} />
  </label>)}</fieldset>;
}

export function Translation({ skill }: { skill: Skill }) {
  return <section className="translation" aria-label="Astronomy to industry translation">
    <div className="c-section-heading"><span className="c-eyebrow">INDUSTRY LANGUAGE</span><h2>{skill.title}</h2></div>
    {skill.comparisons.length > 0 ? <div className="translation-columns">{skill.comparisons.map((entry) => <section key={entry.label} className={`translation-${entry.label.toLowerCase()}`}><h3>{entry.label === 'Astronomy' ? <Orbit size={15} /> : <ArrowUpRight size={15} />}{entry.label}</h3><div className="c-prose" dangerouslySetInnerHTML={{ __html: entry.html }} /></section>)}</div> : <div className="c-prose" dangerouslySetInnerHTML={{ __html: skill.html }} />}
    <a className="c-source" href="https://github.com/aas-bacac/skills/wiki/Skills">Wiki source<ArrowUpRight size={12} /></a>
  </section>;
}

export function TopicReader({ skill, onClose }: { skill: Skill | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (skill && dialog.current && !dialog.current.open) dialog.current.showModal();
    if (!skill && dialog.current?.open) dialog.current.close();
  }, [skill]);
  return <dialog className="c-topic-dialog" ref={dialog} aria-labelledby="source-topic-title" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === dialog.current) onClose(); }}>
    {skill && <div><header><span className="c-eyebrow"><BookOpen size={14} />WIKI TOPIC</span><button className="c-icon" title="Close topic" aria-label="Close topic" onClick={onClose} autoFocus><X size={20} /></button></header><h2 id="source-topic-title">{skill.title}</h2>{skill.unfinished && <p className="c-caveat">This wiki entry is a starting point and is still being developed.</p>}<div className="c-prose" dangerouslySetInnerHTML={{ __html: skill.html }} />{skill.comparisons.map((entry) => <section className="c-dialog-comparison" key={entry.label}><h3>{entry.label}</h3><div className="c-prose" dangerouslySetInnerHTML={{ __html: entry.html }} /></section>)}<a className="c-source" href="https://github.com/aas-bacac/skills/wiki/Skills">Original wiki<ArrowUpRight size={13} /></a></div>}
  </dialog>;
}

export function TopicLinks({ skills, onSelect }: { skills: Skill[]; onSelect: (skill: Skill) => void }) {
  return <div className="c-topic-links">{skills.map((skill) => <button key={skill.id} onClick={() => onSelect(skill)}>{skill.title}<ArrowUpRight size={14} /></button>)}</div>;
}