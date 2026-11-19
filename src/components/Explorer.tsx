import { useDeferredValue, useEffect, useRef, useState } from 'react';
import {
  ArrowDownToLine, ArrowRight, ArrowUpRight, Bookmark, BookOpen, Check, ChevronRight,
  Compass, GitFork, Grid2X2, Info, Layers, Link, Network as NetworkIcon,
  Orbit, Printer, RotateCcw, Search, Sparkles, Telescope, Users, X,
} from 'lucide-react';
import Network from './Network';
import { connections, filterSkills, groups, themes, type Skill } from '../lib/catalog';

type Props = { skills: Skill[]; originalHtml: string; homeHtml: string; base: string };
type View = 'guide' | 'map' | 'matrix';
const views = [
  { id: 'guide', name: 'Field guide', icon: Grid2X2 },
  { id: 'map', name: 'Connections', icon: NetworkIcon },
  { id: 'matrix', name: 'Cross-field', icon: Layers },
] as const;
const storageKey = 'astronomy-skills:saved:v1';

export default function Explorer({ skills, originalHtml, homeHtml, base }: Props) {
  const [view, setView] = useState<View>('guide');
  const [group, setGroup] = useState('all');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [sort, setSort] = useState('source');
  const [saved, setSaved] = useState<string[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [documentView, setDocumentView] = useState<'about' | 'original' | null>(null);
  const drawer = useRef<HTMLDialogElement>(null);
  const documentDialog = useRef<HTMLDialogElement>(null);
  const active = skills.find((skill) => skill.id === activeId);
  const activeGroup = groups.find((entry) => entry.id === active?.group);
  let visible = filterSkills(skills, deferredQuery, group, savedOnly, saved);
  if (sort === 'az') visible = [...visible].sort((first, second) => first.title.localeCompare(second.title));

  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (Array.isArray(stored)) setSaved(stored.filter((id): id is string => typeof id === 'string' && skills.some((skill) => skill.id === id)));
    } catch { setStorageError(true); }
    function readHash() {
      const parameters = new URLSearchParams(location.hash.slice(1));
      const topic = parameters.get('skill');
      const layout = parameters.get('view');
      if (layout === 'guide' || layout === 'map' || layout === 'matrix') setView(layout);
      if (topic && skills.some((skill) => skill.id === topic)) { setActiveId(topic); setDrawerOpen(true); }
    }
    readHash();
    window.addEventListener('hashchange', readHash);
    setLoaded(true);
    return () => window.removeEventListener('hashchange', readHash);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(storageKey, JSON.stringify(saved)); }
    catch { setStorageError(true); }
  }, [saved, loaded]);

  useEffect(() => {
    if (!loaded) return;
    const parameters = new URLSearchParams({ view });
    if (activeId && drawerOpen) parameters.set('skill', activeId);
    history.replaceState(null, '', `${location.pathname}${location.search}#${parameters}`);
  }, [view, activeId, drawerOpen, loaded]);

  useEffect(() => {
    if (drawerOpen && drawer.current && !drawer.current.open) drawer.current.showModal();
    if (!drawerOpen && drawer.current?.open) drawer.current.close();
  }, [drawerOpen]);

  useEffect(() => {
    if (documentView && documentDialog.current && !documentDialog.current.open) documentDialog.current.showModal();
    if (!documentView && documentDialog.current?.open) documentDialog.current.close();
  }, [documentView]);

  function openSkill(id: string) { setActiveId(id); setDrawerOpen(true); setNotice(''); }
  function toggleSaved(id: string) { setSaved((current) => current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]); }
  function chooseGroup(id: string) { setGroup(id); setSavedOnly(false); }
  function reset() { setGroup('all'); setSavedOnly(false); setQuery(''); }
  function topicUrl(id: string) { return `${location.origin}${location.pathname}#view=${view}&skill=${id}`; }
  async function copyLink() {
    if (!active) return;
    try { await navigator.clipboard.writeText(topicUrl(active.id)); setNotice('Link copied.'); }
    catch { setNotice('Copy unavailable. The topic link is shown below.'); }
  }
  function downloadList() {
    const text = ['MY SKILLS EXPLORATION LIST', '', ...skills.filter((skill) => saved.includes(skill.id)).flatMap((skill) => [
      `${skill.title} | ${groups.find((entry) => entry.id === skill.group)!.name}`, topicUrl(skill.id), '',
    ]), 'Source: https://github.com/aas-bacac/skills/wiki', 'Connections and thematic groupings are editorial suggestions, not prerequisites.'].join('\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'my-skills-exploration.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function topicCard(skill: Skill) {
    const category = groups.find((entry) => entry.id === skill.group)!;
    return <article className={`skill-card ${skill.group}`} key={skill.id}>
      <div className="card-top"><span className={`category-label ${skill.group}`}><i />{category.name}</span>
        <button className={`icon-button save-button ${saved.includes(skill.id) ? 'is-saved' : ''}`} title={saved.includes(skill.id) ? `Remove ${skill.title} from saved topics` : `Save ${skill.title}`} aria-label={saved.includes(skill.id) ? `Remove ${skill.title} from saved topics` : `Save ${skill.title}`} aria-pressed={saved.includes(skill.id)} onClick={() => toggleSaved(skill.id)}><Bookmark size={18} fill={saved.includes(skill.id) ? 'currentColor' : 'none'} /></button>
      </div>
      <h3><a href={`#view=${view}&skill=${skill.id}`} onClick={(event) => { event.preventDefault(); openSkill(skill.id); }}>{skill.title}<ArrowUpRight size={19} /></a></h3>
      <p className="card-preview">{skill.preview}</p>
      <div className="card-bottom"><span>{skill.comparisons.length ? 'Astronomy connections' : skill.unfinished ? 'A starting point' : 'Explore topic'}</span><button className="card-open" aria-label={`Read ${skill.title}`} onClick={() => openSkill(skill.id)}><ArrowRight size={17} /></button></div>
    </article>;
  }

  return <>
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href={base} aria-label="Skills beyond astronomy home"><span className="brand-mark"><Orbit size={30} strokeWidth={1.5} /></span><span>Skills<small>BEYOND ASTRONOMY</small></span></a>
        <div className="sidebar-label">THE FIELD GUIDE</div>
        <nav className="primary-nav" aria-label="Browse skills">
          <button className={group === 'all' && !savedOnly ? 'selected' : ''} onClick={() => chooseGroup('all')}><Compass size={18} />All topics<span>{skills.length}</span></button>
          {groups.map((entry, index) => <button key={entry.id} className={group === entry.id && !savedOnly ? `selected ${entry.id}` : entry.id} onClick={() => chooseGroup(entry.id)}><span className="nav-dot" />{entry.name}<span>{[5, 6, 7][index]}</span></button>)}
        </nav>
        <div className="sidebar-rule" />
        <nav className="primary-nav" aria-label="Your collection">
          <button className={savedOnly ? 'selected' : ''} onClick={() => { setSavedOnly(true); setGroup('all'); setQuery(''); }}><Bookmark size={18} />My exploration list<span>{saved.length}</span></button>
          <button onClick={() => setDocumentView('original')}><BookOpen size={18} />Read the original<ArrowUpRight size={14} /></button>
          <button onClick={() => setDocumentView('about')}><Info size={18} />About this guide</button>
        </nav>
        <div className="sidebar-bottom">
          <figure className="astronomy-image"><img src={`${base}images/nebula.jpg`} alt="A colorful nebula and distant stars" width="420" height="320" /><figcaption>New directions.<br />Familiar foundations.</figcaption></figure>
          <p className="image-credit"><a href="https://unsplash.com/photos/E0AHdsENmDg">Jeremy Thomas / Unsplash</a></p>
          <a className="github-link" href="https://github.com/aas-bacac/skills"><GitFork size={16} />AAS-BACAC<ArrowUpRight size={14} /></a>
          <span className="development"><i />A guide in development</span>
        </div>
      </aside>

      <main className="main-content" id="browse" tabIndex={-1}>
        <header className="page-header">
          <div className="breadcrumb"><span>Astronomy</span><ChevronRight size={13} /><span>Beyond academia</span></div>
          <div className="header-line"><h1>{savedOnly ? 'My exploration list' : 'Explore your next direction.'}</h1><span className="edition">FIELD NOTES / 01</span></div>
          <p className="page-intro">{savedOnly ? `${saved.length} saved ${saved.length === 1 ? 'topic' : 'topics'} from the field guide.` : 'The skills you know. The connections you might not have considered.'}</p>
          {!savedOnly && <div className="category-overview">{groups.map((entry, index) => <button key={entry.id} className={`overview-item ${entry.id} ${group === entry.id ? 'chosen' : ''}`} onClick={() => chooseGroup(group === entry.id ? 'all' : entry.id)} aria-pressed={group === entry.id}>
            <span className="overview-icon">{index === 0 ? <Users size={20} /> : index === 1 ? <Sparkles size={20} /> : <Telescope size={20} />}</span><span><strong>{entry.name}</strong><small>{entry.subtitle}</small></span><ArrowUpRight size={16} />
          </button>)}</div>}
        </header>

        <section className="explorer" aria-label="Skill explorer">
          <div className="explorer-toolbar">
            <div className="view-tabs" role="tablist" aria-label="Presentation" onKeyDown={(event) => {
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
              event.preventDefault();
              const index = views.findIndex((entry) => entry.id === view);
              const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
              setView(views[nextIndex].id);
              document.getElementById(`tab-${views[nextIndex].id}`)?.focus();
            }}>{views.map((entry) => <button key={entry.id} id={`tab-${entry.id}`} role="tab" aria-selected={view === entry.id} aria-controls="view-panel" tabIndex={view === entry.id ? 0 : -1} onClick={() => setView(entry.id)}><entry.icon size={16} /><span>{entry.name}</span></button>)}</div>
            <label className="search-field"><Search size={17} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a skill or an idea..." aria-label="Search skills" />{query && <button className="icon-button" onClick={() => setQuery('')} aria-label="Clear search" title="Clear search"><X size={15} /></button>}</label>
          </div>
          <div className="results-line"><span role="status" aria-live="polite">{visible.length} {visible.length === 1 ? 'topic' : 'topics'}{group !== 'all' ? ` in ${groups.find((entry) => entry.id === group)?.name}` : ' across fields'}{query ? ` matching “${query}”` : ''}</span>
            <div className="results-actions">{savedOnly && saved.length > 0 && <><button className="icon-button" title="Download exploration list" aria-label="Download exploration list" onClick={downloadList}><ArrowDownToLine size={17} /></button><button className="icon-button" title="Print exploration list" aria-label="Print exploration list" onClick={() => window.print()}><Printer size={17} /></button></>}
              {view === 'guide' && <label className="sort-label">Order <select aria-label="Topic order" value={sort} onChange={(event) => setSort(event.target.value)}><option value="source">Original</option><option value="az">A to Z</option></select></label>}
              {(group !== 'all' || query) && <button className="quiet-button" onClick={reset}><RotateCcw size={13} />Reset</button>}
            </div>
          </div>
          {storageError && <p className="storage-notice" role="status">Browser storage is unavailable. Saved topics will last for this visit only.</p>}
          <div id="view-panel" role="tabpanel" aria-labelledby={`tab-${view}`}>
            {visible.length === 0 ? <div className="empty-state"><Search size={30} /><h2>{savedOnly && saved.length === 0 ? 'Your next direction starts here.' : 'No topics found.'}</h2><p>{savedOnly && saved.length === 0 ? 'No topics saved yet.' : 'No topics match the current search and category.'}</p><button className="primary-button" onClick={reset}>Browse all topics<ArrowRight size={16} /></button></div>
            : view === 'guide' ? <div className="skills-grid">{visible.map(topicCard)}</div>
            : view === 'map' ? <Network skills={visible} activeId={activeId} onSelect={openSkill} />
            : <section className="matrix-view" aria-label="Skills across fields"><div className="matrix-heading"><h2>One skill can open more than one door.</h2><p>Thematic groupings are editorial suggestions, not a qualification checklist.</p></div><div className="table-scroll"><table><caption className="sr-only">Topics organized by shared theme and career area</caption><thead><tr><th scope="col">Shared theme</th>{groups.map((entry) => <th scope="col" key={entry.id}><span className={`category-label ${entry.id}`}><i />{entry.name}</span></th>)}</tr></thead><tbody>{themes.map((theme, index) => <tr key={theme}><th scope="row"><span className="theme-number">0{index + 1}</span>{theme}</th>{groups.map((entry) => <td key={entry.id}><div className="matrix-topics">{visible.filter((skill) => skill.group === entry.id && skill.themes.includes(theme)).map((skill) => <button key={skill.id} className={`matrix-topic ${entry.id}`} onClick={() => openSkill(skill.id)}>{skill.title}<ArrowUpRight size={13} /></button>)}</div>{!visible.some((skill) => skill.group === entry.id && skill.themes.includes(theme)) && <span className="empty-cell" aria-label="No topics in the current selection">-</span>}</td>)}</tr>)}</tbody></table></div></section>}
          </div>
        </section>
        <footer className="page-footer"><span>Built from the <a href="https://github.com/aas-bacac/skills/wiki">AAS-BACAC skills wiki<ArrowUpRight size={12} /></a></span><a href="https://github.com/aas-bacac/skills/issues">Suggest a change<ArrowUpRight size={13} /></a></footer>
      </main>

      <dialog ref={drawer} className="skill-dialog" aria-labelledby="skill-title" onCancel={(event) => { event.preventDefault(); setDrawerOpen(false); }} onClick={(event) => { if (event.target === drawer.current) setDrawerOpen(false); }}>
        {active && <div className="drawer-content">
          <div className="drawer-top"><span className={`category-label ${active.group}`}><i />{activeGroup?.name}</span><button className="icon-button close-button" aria-label="Close topic" title="Close topic" onClick={() => setDrawerOpen(false)} autoFocus><X size={20} /></button></div>
          <div className="drawer-heading"><span className="eyebrow">THE FIELD GUIDE</span><h2 id="skill-title">{active.title}</h2>
            <div className="drawer-actions"><button className={`save-topic ${saved.includes(active.id) ? 'is-saved' : ''}`} aria-pressed={saved.includes(active.id)} onClick={() => toggleSaved(active.id)}>{saved.includes(active.id) ? <Check size={16} /> : <Bookmark size={16} />}{saved.includes(active.id) ? 'Saved to my list' : 'Save topic'}</button><button className="icon-button" title="Copy topic link" aria-label="Copy topic link" onClick={copyLink}><Link size={17} /></button></div>
            {notice && <p className="copy-notice" role="status">{notice}{notice.startsWith('Copy unavailable') && <input aria-label="Topic link" readOnly value={topicUrl(active.id)} onFocus={(event) => event.target.select()} />}</p>}
          </div>
          {active.unfinished && <div className="draft-note"><span className="draft-dot" />Starting point: this entry is still being developed.</div>}
          <div className="prose topic-body" dangerouslySetInnerHTML={{ __html: active.html }} />
          {active.comparisons.length > 0 && <section className="comparison-section"><h3>Familiar work. A different context.</h3><div className={`comparison-grid ${active.comparisons.length === 1 ? 'single' : ''}`}>{active.comparisons.map((entry) => <div key={entry.label} className={`comparison ${entry.label.toLowerCase()}`}><span className="eyebrow">{entry.label === 'Astronomy' ? <Orbit size={15} /> : <ArrowUpRight size={15} />}{entry.label}</span><div className="prose" dangerouslySetInnerHTML={{ __html: entry.html }} /></div>)}</div></section>}
          <section className="related-section"><h3>Connected topics</h3><p className="related-note">Suggested relationships, not prerequisites.</p><div>{connections.filter((edge) => edge.source === active.id || edge.target === active.id).map((edge) => {
            const relatedId = edge.source === active.id ? edge.target : edge.source;
            const related = skills.find((skill) => skill.id === relatedId)!;
            return <button key={related.id} className="related-topic" onClick={() => { openSkill(related.id); drawer.current?.scrollTo({ top: 0 }); }}><span><strong>{related.title}</strong><small>{edge.label}</small></span><ArrowRight size={16} /></button>;
          })}</div></section>
          <a className="source-link" href="https://github.com/aas-bacac/skills/wiki/Skills">Original wiki text<ArrowUpRight size={14} /></a>
        </div>}
      </dialog>

      <dialog ref={documentDialog} className="document-dialog" aria-label={documentView === 'about' ? 'About this guide' : 'Original wiki content'} onClose={() => setDocumentView(null)}>
        <div className="document-toolbar"><span><BookOpen size={17} />{documentView === 'about' ? 'About this guide' : 'The original field notes'}</span><button className="icon-button" title="Close document" aria-label="Close document" onClick={() => setDocumentView(null)}><X size={20} /></button></div>
        <div className="prose original-document" dangerouslySetInnerHTML={{ __html: documentView === 'about' ? homeHtml : originalHtml }} />
        <div className="document-source"><a href={`https://github.com/aas-bacac/skills/wiki/${documentView === 'about' ? 'Home' : 'Skills'}`}>View source on GitHub<ArrowUpRight size={14} /></a></div>
      </dialog>
    </div>
    <section className="print-summary"><h1>My skills exploration list</h1><p>AAS-BACAC / Skills beyond astronomy</p>{skills.filter((skill) => saved.includes(skill.id)).map((skill) => <article key={skill.id}><h2>{skill.title}</h2><p>{groups.find((entry) => entry.id === skill.group)?.name}</p><div dangerouslySetInnerHTML={{ __html: skill.html }} />{skill.comparisons.map((entry) => <section key={entry.label}><h3>{entry.label}</h3><div dangerouslySetInnerHTML={{ __html: entry.html }} /></section>)}</article>)}<p>Source: https://github.com/aas-bacac/skills/wiki</p></section>
  </>;
}