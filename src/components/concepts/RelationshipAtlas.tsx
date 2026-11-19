import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Maximize, Minus, Plus } from 'lucide-react';
import type { Core } from 'cytoscape';
import { experiences, relatedCareers, suggestedTopics } from '../../lib/careers';
import type { Skill } from '../../lib/catalog';
import { ExperiencePicker, TopicLinks, TopicReader, Translation, useExperience, type ConceptProps } from './Shared';

export default function RelationshipAtlas({ skills, careers, base }: ConceptProps) {
  const { experience, setExperienceId } = useExperience();
  const [careerId, setCareerId] = useState('data-analyst');
  const [focused, setFocused] = useState(false);
  const [compact, setCompact] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [topic, setTopic] = useState<Skill | null>(null);
  const graphContainer = useRef<HTMLDivElement>(null);
  const graph = useRef<Core | null>(null);
  const inspector = useRef<HTMLElement>(null);
  const skill = skills.find((entry) => entry.id === experience.skillId)!;
  const connected = relatedCareers(careers, skill.id);
  const selectedCareer = connected.find((career) => career.id === careerId) ?? connected[0];
  const focusKey = focused ? experience.id : 'all';

  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px)');
    const update = () => setCompact(media.matches);
    setCompact(media.matches);
    setFocused(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const handleTap = useEffectEvent((id: string, kind: string) => {
    if (kind === 'experience') setExperienceId(id);
    if (kind === 'skill') setExperienceId(experiences.find((entry) => entry.skillId === id)!.id);
    if (kind === 'career') {
      setCareerId(id);
      const career = careers.find((entry) => entry.id === id)!;
      if (!career.skillIds.includes(experience.skillId)) setExperienceId(experiences.find((entry) => career.skillIds.includes(entry.skillId))!.id);
    }
  });
  const highlightLatest = useEffectEvent((instance: Core) => {
    instance.elements().removeClass('highlight muted selected');
    const root = instance.getElementById(`experience-${experience.id}`);
    const capability = instance.getElementById(`skill-${experience.skillId}`);
    const neighbors = capability.closedNeighborhood().union(root);
    instance.elements().difference(neighbors).addClass('muted');
    neighbors.addClass('highlight');
    capability.addClass('selected');
    instance.getElementById(`career-${selectedCareer.id}`).addClass('selected');
  });

  useEffect(() => {
    let disposed = false;
    let observer: ResizeObserver | undefined;
    setReady(false);
    setFailed(false);
    if (compact) return;
    Promise.all([import('cytoscape'), document.fonts.ready]).then(([module]) => {
      if (disposed || !graphContainer.current) return;
      const entries = focused ? [experience] : [...experiences];
      const roles = focused ? connected : careers;
      const rows = Math.max(entries.length, roles.length);
      const firstY = (rows - 1) * 46 + 60;
      const nodes = entries.flatMap((entry, index) => {
        const capability = skills.find((candidate) => candidate.id === entry.skillId)!;
        const y = focused ? firstY : 60 + index * 92;
        return [
          { data: { id: `experience-${entry.id}`, entityId: entry.id, kind: 'experience', label: entry.title, color: '#236e59' }, position: { x: 120, y } },
          { data: { id: `skill-${capability.id}`, entityId: capability.id, kind: 'skill', label: capability.title, color: '#99702b' }, position: { x: 408, y } },
        ];
      });
      const roleNodes = roles.map((career, index) => ({ data: { id: `career-${career.id}`, entityId: career.id, kind: 'career', label: career.title, color: career.field === 'Aerospace' ? '#a64b34' : '#315fbd' }, position: { x: 700, y: 60 + index * 92 } }));
      const edges = entries.flatMap((entry) => [
        { data: { id: `translation-${entry.id}`, source: `experience-${entry.id}`, target: `skill-${entry.skillId}` } },
        ...roles.filter((career) => career.skillIds.includes(entry.skillId)).map((career) => ({ data: { id: `${entry.id}-${career.id}`, source: `skill-${entry.skillId}`, target: `career-${career.id}` } })),
      ]);
      const instance = module.default({
        container: graphContainer.current,
        elements: [...nodes, ...roleNodes, ...edges],
        layout: { name: 'preset', padding: 28 },
        style: [
          { selector: 'node', style: { 'shape': 'round-rectangle', 'width': 195, 'height': 60, 'background-color': '#fff', 'border-color': 'data(color)', 'border-width': 1.5, 'label': 'data(label)', 'color': '#23332f', 'font-family': 'DM Sans', 'font-size': 14, 'text-wrap': 'wrap', 'text-max-width': '165px', 'text-valign': 'center', 'text-halign': 'center' } },
          { selector: 'node[kind="skill"]', style: { 'background-color': '#fcf9eb', 'border-style': 'dashed' } },
          { selector: 'edge', style: { 'curve-style': 'bezier', 'line-color': '#a1aaa5', 'opacity': 0.6, 'width': 1.3, 'control-point-step-size': 40, 'control-point-distances': 40, 'control-point-weights': 0.5 } },
          { selector: 'edge.highlight', style: { 'line-color': '#236e59', 'width': 2.5, 'opacity': 0.9 } },
          { selector: 'node.highlight', style: { 'border-width': 2 } },
          { selector: 'node.selected', style: { 'background-color': 'data(color)', 'color': '#fff', 'border-width': 2 } },
          { selector: '.muted', style: { 'opacity': 0.24 } },
        ],
        minZoom: 0.45,
        maxZoom: 2,
        userZoomingEnabled: false,
        userPanningEnabled: false,
        autoungrabify: true,
        boxSelectionEnabled: false,
        autounselectify: true,
      });
      graph.current = instance;
      instance.on('tap', 'node', (event) => handleTap(event.target.data('entityId'), event.target.data('kind')));
      instance.on('mouseover', 'node', () => { if (graphContainer.current) graphContainer.current.style.cursor = 'pointer'; });
      instance.on('mouseout', 'node', () => { if (graphContainer.current) graphContainer.current.style.cursor = 'default'; });
      highlightLatest(instance);
      observer = new ResizeObserver(() => { instance.resize(); instance.fit(undefined, 25); });
      observer.observe(graphContainer.current);
      setReady(true);
    }).catch(() => { if (!disposed) setFailed(true); });
    return () => { disposed = true; observer?.disconnect(); graph.current?.destroy(); graph.current = null; };
  }, [focusKey, compact]);

  useEffect(() => { if (graph.current) highlightLatest(graph.current); }, [experience.id, selectedCareer.id, ready]);

  function zoom(factor: number) {
    const instance = graph.current;
    if (instance) instance.zoom({ level: instance.zoom() * factor, renderedPosition: { x: instance.width() / 2, y: instance.height() / 2 } });
  }

  function selectMobileCareer(entryId: string, id: string) {
    setExperienceId(entryId);
    setCareerId(id);
    inspector.current?.focus({ preventScroll: true });
    inspector.current?.scrollIntoView({ block: 'start' });
  }

  return <div className="relationship-atlas">
    <header className="atlas-title"><div className="c-page-title"><span className="c-eyebrow">03 / RELATIONSHIP EXPLORER</span><h1>Skills & careers atlas</h1><p>Astronomy experience. Industry language. Possible destinations.</p></div><div className="atlas-photo"><img src={`${base}images/nebula.jpg`} width="420" height="320" alt="A nebula surrounded by stars" /><div><strong>7</strong><span>astronomy entry points</span><strong>7</strong><span>source career roles</span></div></div></header>
    <div className="atlas-toolbar"><ExperiencePicker compact experience={experience} onChange={setExperienceId} /><label className="c-checkbox"><input type="checkbox" checked={focused} onChange={(event) => setFocused(event.target.checked)} />Selected connections only</label>{!compact && <div className="atlas-controls" aria-label="Atlas controls"><button className="c-icon" title="Zoom out" aria-label="Zoom out" disabled={!ready} onClick={() => zoom(0.8)}><Minus size={16} /></button><button className="c-icon" title="Zoom in" aria-label="Zoom in" disabled={!ready} onClick={() => zoom(1.25)}><Plus size={16} /></button><button className="c-icon" title="Fit atlas" aria-label="Fit atlas" disabled={!ready} onClick={() => graph.current?.fit(undefined, 25)}><Maximize size={16} /></button></div>}</div>
    <div className="atlas-workspace"><section className="atlas-visual" aria-label="Skills to careers visualization">{!compact && <div className="atlas-legend"><span><i className="astronomy-dot" />Astronomy experience</span><span><i className="skill-dot" />Industry skill</span><span><i className="career-dot" />Career</span></div>}<div className={`atlas-network atlas-scroll ${compact ? 'mobile' : ''}`} data-ready={compact || ready} role="region" tabIndex={compact ? undefined : 0} aria-label="Skills and careers network">
      {compact ? <div className="atlas-mobile-network">{(focused ? [experience] : experiences).map((entry) => {
        const capability = skills.find((candidate) => candidate.id === entry.skillId)!;
        return <section className="atlas-mobile-path" key={entry.id} aria-label={entry.title}>
          <button className="atlas-mobile-node astronomy" aria-pressed={entry.id === experience.id} onClick={() => setExperienceId(entry.id)}><span>Astronomy experience</span><strong>{entry.title}</strong></button>
          <ArrowDown className="atlas-mobile-arrow" size={19} aria-hidden="true" />
          <button className="atlas-mobile-node industry" onClick={() => setTopic(capability)}><span>Industry skill</span><strong>{capability.title}</strong><ArrowUpRight size={16} aria-hidden="true" /></button>
          <ArrowDown className="atlas-mobile-arrow" size={19} aria-hidden="true" />
          <ul className="atlas-mobile-careers">{relatedCareers(careers, entry.skillId).map((career) => <li key={career.id}><button className={`atlas-mobile-node career ${career.field === 'Aerospace' ? 'aerospace' : ''}`} aria-label={career.title} aria-pressed={entry.id === experience.id && career.id === selectedCareer.id} onClick={() => selectMobileCareer(entry.id, career.id)}><span>{career.field}</span><strong>{career.title}</strong><ArrowRight size={16} aria-hidden="true" /></button></li>)}</ul>
        </section>;
      })}</div> : <><div className="atlas-column-headings" aria-hidden="true"><span>ASTRONOMY</span><span>INDUSTRY EQUIVALENT</span><span>CAREER CONNECTIONS</span></div><div className="atlas-canvas" ref={graphContainer} data-ready={ready} aria-hidden="true" />{!ready && <p className="atlas-loading" role="status">{failed ? 'Network unavailable. Career connections and wiki topics remain available alongside.' : 'Drawing career connections...'}</p>}</>}
      </div><div className="atlas-caption"><span>Source: BACAC skills wiki</span><span>Lines show suggested connections, not strength of fit.</span></div></section>
      <aside className="atlas-inspector" ref={inspector} tabIndex={-1} aria-label="Connection details">
        <span className="c-eyebrow">{compact ? 'CAREER DETAILS' : 'YOUR CONNECTIONS'}</span>
        {!compact && <><h2>{experience.title}</h2><p className="c-caveat">Industry equivalent: <strong>{skill.title}</strong></p></>}
        <nav className="atlas-career-index" aria-label="Connected careers">{connected.map((career) => <button key={career.id} aria-pressed={selectedCareer.id === career.id} onClick={() => setCareerId(career.id)}>{career.title}<ArrowRight size={14} /></button>)}</nav>
        <div className="atlas-role-detail"><span className={`c-sector ${selectedCareer.field === 'Aerospace' ? 'aerospace' : ''}`}>{selectedCareer.field}</span><h3>{selectedCareer.title}</h3><p>{selectedCareer.description}</p><h4>Topics to explore next</h4><TopicLinks skills={suggestedTopics(selectedCareer, skill.id, skills)} onSelect={setTopic} /></div>
        <a className="c-source" href="https://github.com/aas-bacac/skills/wiki/Skills">Original wiki<ArrowUpRight size={13} /></a>
      </aside>
    </div><div className="atlas-translation"><Translation skill={skill} /></div><TopicReader skill={topic} onClose={() => setTopic(null)} />
  </div>;
}