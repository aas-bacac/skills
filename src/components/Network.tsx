import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { Maximize, Minus, Plus } from 'lucide-react';
import type { Core } from 'cytoscape';
import { connections, groups, type Skill } from '../lib/catalog';

type Props = { skills: Skill[]; activeId: string | null; onSelect: (id: string) => void };

export default function Network({ skills, activeId, onSelect }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const graph = useRef<Core | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [compact, setCompact] = useState(false);
  const onTap = useEffectEvent((id: string) => onSelect(id));
  const latestActive = useEffectEvent(() => activeId);
  const idsKey = skills.map((skill) => skill.id).join('|');

  useEffect(() => {
    const media = window.matchMedia('(max-width: 700px)');
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  function highlight(instance: Core, selected: string | null) {
    instance.elements().removeClass('active related muted');
    if (!selected || instance.getElementById(selected).empty()) return;
    const node = instance.getElementById(selected);
    const neighborhood = node.closedNeighborhood();
    instance.elements().difference(neighborhood).addClass('muted');
    neighborhood.addClass('related');
    node.addClass('active');
  }

  useEffect(() => {
    let disposed = false;
    let observer: ResizeObserver | undefined;
    setReady(false);
    setFailed(false);
    Promise.all([import('cytoscape'), document.fonts.ready]).then(([module]) => {
      if (disposed || !container.current) return;
      const ids = new Set(skills.map((skill) => skill.id));
      const elements = skills.map((skill) => {
        const groupIndex = groups.findIndex((group) => group.id === skill.group);
        const siblings = skills.filter((entry) => entry.group === skill.group);
        const index = siblings.findIndex((entry) => entry.id === skill.id);
        const column = groupIndex * 330;
        return {
          data: { id: skill.id, label: skill.title, color: groups[groupIndex].color },
          position: { x: column + (index % 2 ? 48 : -24), y: 80 + index * 102 },
        };
      });
      const instance = module.default({
        container: container.current,
        elements: [
          ...elements,
          ...connections.filter((edge) => ids.has(edge.source) && ids.has(edge.target)).map((edge, index) => ({
            data: { ...edge, id: `edge-${index}` },
          })),
        ],
        layout: { name: 'preset', padding: 45 },
        style: [
          { selector: 'node', style: {
            'background-color': '#ffffff', 'border-color': 'data(color)', 'border-width': 1.5,
            'color': '#23362e', 'label': 'data(label)', 'font-family': 'DM Sans', 'font-size': 16,
            'text-wrap': 'wrap', 'text-max-width': '150px', 'text-valign': 'center', 'text-halign': 'center',
            'shape': 'round-rectangle', 'width': 178, 'height': 66,
          } },
          { selector: 'edge', style: {
            'width': 1.5, 'line-color': '#71857a', 'opacity': 0.3,
            'curve-style': 'bezier', 'control-point-step-size': 80,
          } },
          { selector: 'node.related', style: { 'border-width': 3 } },
          { selector: 'edge.related', style: { 'line-color': '#236e59', 'width': 3, 'opacity': 0.9 } },
          { selector: 'node.active', style: { 'background-color': 'data(color)', 'color': '#ffffff', 'border-width': 3 } },
          { selector: '.muted', style: { 'opacity': 0.15 } },
        ],
        minZoom: 0.35,
        maxZoom: 2,
        wheelSensitivity: 0.15,
        userZoomingEnabled: false,
        boxSelectionEnabled: false,
        autounselectify: true,
      });
      graph.current = instance;
      instance.on('tap', 'node', (event) => onTap(event.target.id()));
      instance.on('mouseover', 'node', () => { if (container.current) container.current.style.cursor = 'pointer'; });
      instance.on('mouseout', 'node', () => { if (container.current) container.current.style.cursor = 'grab'; });
      highlight(instance, latestActive());
      observer = new ResizeObserver(() => { instance.resize(); instance.fit(undefined, 40); });
      observer.observe(container.current);
      setReady(true);
    }).catch(() => { if (!disposed) setFailed(true); });
    return () => { disposed = true; observer?.disconnect(); graph.current?.destroy(); graph.current = null; };
  }, [idsKey]);

  useEffect(() => { if (graph.current) highlight(graph.current, activeId); }, [activeId, ready]);

  function zoom(factor: number) {
    const instance = graph.current;
    if (instance) instance.zoom({ level: instance.zoom() * factor, renderedPosition: { x: instance.width() / 2, y: instance.height() / 2 } });
  }

  return (
    <section className="network-view" aria-label="Skills connection map">
      <div className="map-heading">
        <div><h2>Different fields. Shared foundations.</h2><p>Suggested connections, not prerequisites.</p></div>
        <div className="zoom-tools" aria-label="Map controls">
          <button className="icon-button" title="Zoom out" aria-label="Zoom out" onClick={() => zoom(0.8)} disabled={!ready}><Minus size={17} /></button>
          <button className="icon-button" title="Zoom in" aria-label="Zoom in" onClick={() => zoom(1.25)} disabled={!ready}><Plus size={17} /></button>
          <button className="icon-button" title="Fit map" aria-label="Fit map" onClick={() => graph.current?.fit(undefined, 40)} disabled={!ready}><Maximize size={16} /></button>
        </div>
      </div>
      <div className="map-legend">{groups.map((group) => <span key={group.id}><i style={{ background: group.color }} />{group.name}</span>)}</div>
      <div className="graph-stage" role="region" aria-label="Scrollable connection map" tabIndex={0}>
        {!ready && <p className="map-loading" role="status">{failed ? 'Map unavailable. All topics are listed below.' : 'Drawing connections...'}</p>}
        <div ref={container} className="network-canvas" aria-hidden="true" data-ready={ready} />
      </div>
      <details className="map-index" open={failed || compact || undefined}>
        <summary>Topic index <span>{skills.length} topics</span></summary>
        <div className="map-topic-index">{skills.map((skill) => <button key={skill.id} onClick={() => onSelect(skill.id)} className={`topic-chip ${skill.group}`}>{skill.title}</button>)}</div>
      </details>
    </section>
  );
}