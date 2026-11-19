import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Maximize, Minus, Plus } from 'lucide-react';
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
  const skill = skills.find((entry) => entry.id === experience.skillId)!;
  const connected = relatedCareers(careers, skill.id);
  const selectedCareer = connected.find((career) => career.id === careerId) ?? connected[0];
  const portrait = focused && compact;
  const focusKey = `${portrait ? 'portrait' : 'landscape'}-${focused ? experience.id : 'all'}`;

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)');
    const update = () => { setCompact(media.matches); setFocused(media.matches); };
    update();
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
          { data: { id: `experience-${entry.id}`, entityId: entry.id, kind: 'experience', label: entry.title, color: '#236e59' }, position: portrait ? { x: 160, y: 45 } : { x: 120, y } },
          { data: { id: `skill-${capability.id}`, entityId: capability.id, kind: 'skill', label: capability.title, color: '#99702b' }, position: portrait ? { x: 160, y: 175 } : { x: 408, y } },
        ];
      });
      const roleNodes = roles.map((career, index) => ({ data: { id: `career-${career.id}`, entityId: career.id, kind: 'career', label: career.title, color: career.field === 'Aerospace' ? '#a64b34' : '#315fbd' }, position: portrait ? { x: 160, y: 320 + index * 95 } : { x: 700, y: 60 + index * 92 } }));
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
          { selector: 'edge', style: { 'curve-style': portrait ? 'unbundled-bezier' : 'bezier', 'line-color': '#a1aaa5', 'opacity': 0.6, 'width': 1.3, 'control-point-step-size': 40, 'control-point-distances': portrait ? 95 : 40, 'control-point-weights': 0.5 } },
          { selector: 'edge.highlight', style: { 'line-color': '#236e59', 'width': 2.5, 'opacity': 0.9 } },
          { selector: 'node.highlight', style: { 'border-width': 2 } },
          { selector: 'node.selected', style: { 'background-color': 'data(color)', 'color': '#fff', 'border-width': 2 } },
          { selector: '.muted', style: { 'opacity': 0.24 } },
        ],
        minZoom: 0.45,
        maxZoom: 2,
        userZoomingEnabled: false,
        boxSelectionEnabled: false,
        autounselectify: true,
      });
      graph.current = instance;
      instance.on('tap', 'node', (event) => handleTap(event.target.data('entityId'), event.target.data('kind')));
      instance.on('mouseover', 'node', () => { if (graphContainer.current) graphContainer.current.style.cursor = 'pointer'; });
      instance.on('mouseout', 'node', () => { if (graphContainer.current) graphContainer.current.style.cursor = 'grab'; });
      highlightLatest(instance);
      observer = new ResizeObserver(() => { instance.resize(); instance.fit(undefined, 25); });
      observer.observe(graphContainer.current);
      setReady(true);
    }).catch(() => { if (!disposed) setFailed(true); });
    return () => { disposed = true; observer?.disconnect(); graph.current?.destroy(); graph.current = null; };
  }, [focusKey]);

  useEffect(() => { if (graph.current) highlightLatest(graph.current); }, [experience.id, selectedCareer.id, ready]);

  function zoom(factor: number) {
    const instance = graph.current;
    if (instance) instance.zoom({ level: instance.zoom() * factor, renderedPosition: { x: instance.width() / 2, y: instance.height() / 2 } });
  }

  return <div className="relationship-atlas">
    <header className="atlas-title"><div className="c-page-title"><span className="c-eyebrow">03 / RELATIONSHIP EXPLORER</span><h1>Skills & careers atlas</h1><p>Astronomy experience. Industry language. Possible destinations.</p></div><div className="atlas-photo"><img src={`${base}images/nebula.jpg`} width="420" height="320" alt="A nebula surrounded by stars" /><div><strong>7</strong><span>astronomy entry points</span><strong>7</strong><span>source career roles</span></div></div></header>
    <div className="atlas-toolbar"><ExperiencePicker compact experience={experience} onChange={setExperienceId} /><label className="c-checkbox"><input type="checkbox" checked={focused} onChange={(event) => setFocused(event.target.checked)} />Selected connections only</label><div className="atlas-controls" aria-label="Atlas controls"><button className="c-icon" title="Zoom out" aria-label="Zoom out" disabled={!ready} onClick={() => zoom(0.8)}><Minus size={16} /></button><button className="c-icon" title="Zoom in" aria-label="Zoom in" disabled={!ready} onClick={() => zoom(1.25)}><Plus size={16} /></button><button className="c-icon" title="Fit atlas" aria-label="Fit atlas" disabled={!ready} onClick={() => graph.current?.fit(undefined, 25)}><Maximize size={16} /></button></div></div>
    <div className="atlas-workspace"><section className="atlas-visual" aria-label="Skills to careers visualization"><div className="atlas-legend"><span><i className="astronomy-dot" />Astronomy experience</span><span><i className="skill-dot" />Industry skill</span><span><i className="career-dot" />Career</span></div><div className={`atlas-scroll ${portrait ? 'portrait' : ''}`} role="region" tabIndex={0} aria-label="Scrollable skills and careers network"><div className="atlas-column-headings" aria-hidden="true"><span>ASTRONOMY</span><span>INDUSTRY EQUIVALENT</span><span>CAREER CONNECTIONS</span></div><div className="atlas-canvas" ref={graphContainer} data-ready={ready} aria-hidden="true" />{!ready && <p className="atlas-loading" role="status">{failed ? 'Network unavailable. Career connections and wiki topics remain available alongside.' : 'Drawing career connections...'}</p>}</div><div className="atlas-caption"><span>Source: BACAC skills wiki</span><span>Lines show suggested connections, not strength of fit.</span></div></section>
      <aside className="atlas-inspector" aria-label="Connection details"><span className="c-eyebrow">YOUR CONNECTIONS</span><h2>{experience.title}</h2><p className="c-caveat">Industry equivalent: <strong>{skill.title}</strong></p><nav className="atlas-career-index" aria-label="Connected careers">{connected.map((career) => <button key={career.id} aria-pressed={selectedCareer.id === career.id} onClick={() => setCareerId(career.id)}>{career.title}<ArrowRight size={14} /></button>)}</nav><div className="atlas-role-detail"><span className={`c-sector ${selectedCareer.field === 'Aerospace' ? 'aerospace' : ''}`}>{selectedCareer.field}</span><h3>{selectedCareer.title}</h3><p>{selectedCareer.description}</p><h4>Topics to explore next</h4><TopicLinks skills={suggestedTopics(selectedCareer, skill.id, skills)} onSelect={setTopic} /></div><a className="c-source" href="https://github.com/aas-bacac/skills/wiki/Skills">Original wiki<ArrowUpRight size={13} /></a></aside>
    </div><div className="atlas-translation"><Translation skill={skill} /></div><TopicReader skill={topic} onClose={() => setTopic(null)} />
  </div>;
}