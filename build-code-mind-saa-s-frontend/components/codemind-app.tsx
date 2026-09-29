'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, clearToken, getProjectId, setProjectId, setToken, type ApiExperience, type ApiIncident, type ApiProject } from '@/lib/api'
import { usePathname, useRouter } from 'next/navigation'
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Code2,
  Command,
  Database,
  FileCode2,
  GitBranch,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldAlert,
  Users,
  X,
} from 'lucide-react'

type Project = {
  name: string
  summary: string
  members: number
  incidents: number
  memories: number
  mark: string
  tone: string
}

type Incident = {
  id: string
  title: string
  status: 'Resolved' | 'Investigating' | 'Open'
  owner: string
  initials: string
  age: string
  service: string
  match: number
}

const projects: Project[] = []

const incidents: Incident[] = []

const memories: Array<{ id: string; title: string; match: number; service: string; lesson: string; attempts: string }> = []

const members = [
  { name: 'Alice Johnson', role: 'Senior Backend Engineer', access: 'Admin', initials: 'AJ', color: 'lilac' },
  { name: 'Bob Smith', role: 'Software Engineer', access: 'Developer', initials: 'BS', color: 'mint' },
  { name: 'Charlie Davis', role: 'DevOps Engineer', access: 'Developer', initials: 'CD', color: 'peach' },
  { name: 'David Wilson', role: 'Frontend Engineer', access: 'Viewer', initials: 'DW', color: 'sky' },
]

const base = '/company/acme'
const projectPath = `${base}/projects/ecommerce`

function Logo({ light = false }: { light?: boolean }) {
  return (
    <a href="/" className={`brand ${light ? 'brand-light' : ''}`} aria-label="CodeMind home">
      <span className="brand-symbol"><BrainCircuit size={17} /></span>
      <span>Code<span>Mind</span></span>
    </a>
  )
}

function Button({
  children,
  href,
  variant = 'primary',
  onClick,
  type = 'button',
}: {
  children: ReactNode
  href?: string
  variant?: 'primary' | 'secondary' | 'text'
  onClick?: () => void
  type?: 'button' | 'submit'
}) {
  const className = `button button-${variant}`
  return href
    ? <a className={className} href={href}>{children}</a>
    : <button type={type} onClick={onClick} className={className}>{children}</button>
}

function Avatar({ initials, color = 'lilac' }: { initials: string; color?: string }) {
  return <span className={`avatar avatar-${color}`} aria-label={initials}>{initials}</span>
}

function Status({ value }: { value: string }) {
  return <span className={`status status-${value.toLowerCase()}`}><i />{value}</span>
}

function Title({
  eyebrow,
  title,
  sub,
  action,
}: {
  eyebrow?: string
  title: ReactNode
  sub?: string
  action?: ReactNode
}) {
  return (
    <div className="page-title">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {action && <div className="title-actions">{action}</div>}
    </div>
  )
}

function PanelHeading({ title, action }: { title: string; action?: ReactNode }) {
  return <div className="panel-heading"><h2>{title}</h2>{action}</div>
}

function SideNav({ project, path }: { project: boolean; path: string }) {
  const companyLinks = [
    ['Home', base, LayoutDashboard],
    ['Projects', `${base}/projects`, Code2],
    ['Members', `${base}/members`, Users],
    ['Settings', `${base}/settings`, Settings],
  ] as const
  const projectLinks = [
    ['Overview', projectPath, LayoutDashboard],
    ['Workspace', `${projectPath}/workspace`, Code2],
    ['Incidents', `${projectPath}/incidents`, ShieldAlert],
    ['Engineering Memory', `${projectPath}/memory`, BrainCircuit],
    ['Team', `${projectPath}/team`, Users],
    ['Activity', `${projectPath}/activity`, Activity],
    ['Settings', `${projectPath}/settings`, Settings],
  ] as const
  const links = project ? projectLinks : companyLinks

  return (
    <aside className="sidebar">
      <div className="side-brand"><Logo light /></div>
      <a className="workspace-switch" href={base}>
        <span className="company-mark">A</span>
        <span><b>Acme Technologies</b><small>Company workspace</small></span>
        <ChevronDown size={14} />
      </a>
      {project && (
        <a href={projectPath} className="side-project">
          <span>EC</span><div><small>PROJECT</small><b>E-Commerce Platform</b></div><ChevronRight size={14} />
        </a>
      )}
      <div className="nav-label">{project ? 'PROJECT' : 'WORKSPACE'}</div>
      <nav className="side-links" aria-label={project ? 'Project navigation' : 'Company navigation'}>
        {links.map(([label, href, Icon]) => {
          const active = href === base
            ? path === base
            : path === href || (label === 'Incidents' && path.includes('/incidents')) || (label === 'Engineering Memory' && path.includes('/memory'))
          return (
            <a key={href} href={href} className={`side-link ${active ? 'active' : ''}`}>
              <Icon size={16} /><span>{label}</span>{label === 'Incidents' && <small>3</small>}
            </a>
          )
        })}
      </nav>
      <div className="sidebar-bottom">
        <a className="help-link" href="#help"><CircleHelp size={16} />Help center<ArrowUpRight size={13} /></a>
        <div className="user-profile"><Avatar initials="AJ" /><span><b>Alice Johnson</b><small>alice@acme.dev</small></span><MoreHorizontal size={16} /></div>
      </div>
    </aside>
  )
}

function AppShell({ path, children }: { path: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const inProject = path.startsWith(projectPath)
  const pageName = path === base
    ? 'Home'
    : path === projectPath
      ? 'Overview'
      : path.split('/').filter(Boolean).at(-1)?.replaceAll('-', ' ').replace(/\b\w/g, char => char.toUpperCase()) || 'Home'

  return (
    <div className="app-shell">
      <button className={`mobile-scrim ${open ? 'visible' : ''}`} aria-label="Close navigation" onClick={() => setOpen(false)} />
      <div className={`sidebar-wrap ${open ? 'sidebar-open' : ''}`}><SideNav project={inProject} path={path} /></div>
      <div className="app-main">
        <header className="topbar">
          <button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setOpen(!open)}><Menu size={18} /></button>
          <div className="breadcrumbs">
            <a href={base}>Acme Technologies</a><ChevronRight size={13} />
            {inProject && <><a href={projectPath}>E-Commerce Platform</a><ChevronRight size={13} /></>}
            <span>{pageName}</span>
          </div>
          <div className="top-actions">
            <button className="search-shortcut" aria-label="Search"><Search size={15} /><span>Search anything...</span><kbd>⌘ K</kbd></button>
            <button className="top-icon" aria-label="Notifications"><Bell size={17} /><i /></button>
            <span className="top-divider" />
            <button className="user-menu"><Avatar initials="AJ" /><span>Alice</span><ChevronDown size={13} /></button>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  )
}

function ProjectCard({ project, compact = false }: { project: Project; compact?: boolean }) {
  return (
    <article className="project-card">
      <div className="project-card-top">
        <span className={`project-mark tone-${project.tone}`}>{project.mark}</span>
        <button className="icon-button" aria-label={`More about ${project.name}`}><MoreHorizontal size={17} /></button>
      </div>
      <a className="project-card-name" href={projectPath}>{project.name}</a>
      <p>{project.summary}</p>
      <div className="project-stats">
        <span><Users size={13} />{project.members}</span>
        <span><ShieldAlert size={13} />{project.incidents}</span>
        <span><BrainCircuit size={13} />{project.memories}</span>
      </div>
      {!compact && <div className="project-stack">Node.js · MongoDB · React</div>}
      <a className="project-open" href={projectPath}>Open project<ArrowRight size={14} /></a>
    </article>
  )
}

function ActivityFeed() {
  const activity = [
    { initials: 'AJ', color: 'lilac', text: <>Alice Johnson resolved <a href={`${projectPath}/incidents/INC-042`}>MongoDB connection issue</a></>, time: '2 hours ago', icon: Check },
    { initials: 'BS', color: 'mint', text: <>Bob Smith created <a href={`${projectPath}/incidents/INC-041`}>INC-041 · API timeout error</a></>, time: '4 hours ago', icon: Plus },
    { initials: 'CD', color: 'peach', text: <>Charlie Davis added an engineering experience</>, time: 'Yesterday', icon: BrainCircuit },
    { initials: 'DW', color: 'sky', text: <>David Wilson joined the project</>, time: '2 days ago', icon: Users },
  ]
  return (
    <div className="activity-feed">
      {activity.map((item, index) => {
        const Icon = item.icon
        return (
          <div className="activity-row" key={index}>
            <Avatar initials={item.initials} color={item.color} />
            <div className="activity-text"><p>{item.text}</p><span>{item.time}</span></div>
            <span className="activity-mark"><Icon size={13} /></span>
          </div>
        )
      })}
    </div>
  )
}

function CompanyHome() {
  const [projectList, setProjectList] = useState<ApiProject[]>([])
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState('')
  useEffect(() => { Promise.all([api('/auth/me'), api('/projects')]).then(([me, ps]) => { setUser(me.user); setProjectList(ps.projects); if (ps.projects[0]?._id) setProjectId(ps.projects[0]._id) }).catch(e => setError(e.message)) }, [])
  return <>
    <Title eyebrow="COMPANY WORKSPACE" title={`Good morning, ${user?.name?.split(' ')[0] || 'Engineer'}`} sub="Here's what's happening across your engineering team." action={<><Button variant="secondary"><Users size={15} />Invite member</Button><Button href={`${base}/projects/new`}><Plus size={15} />Create project</Button></>} />
    {error && <section className="panel"><p>{error}</p></section>}
    <PanelHeading title="Recent projects" action={<a className="subtle-link" href={`${base}/projects`}>View all projects<ArrowRight size={14} /></a>} />
    <div className="project-grid">{projectList.map((project, i) => <ProjectCard key={project._id} project={{ name: project.name, summary: project.description || 'Engineering project workspace.', members: 0, incidents: 0, memories: 0, mark: project.name.slice(0,2).toUpperCase(), tone: ['violet','blue','mint','amber'][i%4] }} compact />)}</div>
    <section className="learning-banner"><BrainCircuit size={22} /><div><h2>Every incident leaves your team a little wiser.</h2><p>Resolved incidents become searchable engineering experiences through the Memory API.</p></div></section>
  </>
}

function ProjectsPage() {
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<ApiProject[]>([])
  const [error, setError] = useState('')
  useEffect(() => { api('/projects').then(r => setItems(r.projects)).catch(e => setError(e.message)) }, [])
  const filtered = items.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
  return <><Title eyebrow="ACME TECHNOLOGIES" title="Projects" sub="Live projects from your Express backend." action={<Button href={`${base}/projects/new`}><Plus size={15} />Create project</Button>} />
    {error && <section className="panel"><p>{error}</p></section>}
    <div className="toolbar"><label className="search-input"><Search size={15} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search projects..." /></label><span className="result-count">{filtered.length} projects</span></div>
    <div className="project-grid projects-page-grid">{filtered.map((project,i) => <a key={project._id} href={projectPath} onClick={() => setProjectId(project._id)}><ProjectCard project={{ name: project.name, summary: project.description || 'Engineering project workspace.', members: 0, incidents: 0, memories: 0, mark: project.name.slice(0,2).toUpperCase(), tone: ['violet','blue','mint','amber'][i%4] }} /></a>)}</div>
  </>
}

function ProjectOverview() {
  const [items, setItems] = useState<ApiIncident[]>([])
  const [experiences, setExperiences] = useState<ApiExperience[]>([])
  useEffect(() => { const id=getProjectId(); if(!id) return; Promise.all([api(`/incidents?projectId=${id}`), api(`/experiences?projectId=${id}`)]).then(([a,e])=>{setItems(a.incidents);setExperiences(e.experiences)}).catch(()=>{}) }, [])
  return <><Title eyebrow="PROJECT OVERVIEW" title="Engineering workspace" sub="Live incidents and organizational memory." action={<><Button variant="secondary"><GitBranch size={14}/>main</Button><Button href={`${projectPath}/workspace`}><Code2 size={15}/>Open workspace</Button></>} />
    <div className="stats-grid"><div className="panel"><b>Total incidents</b><h2>{items.length}</h2><small>From MongoDB</small></div><div className="panel"><b>Resolved</b><h2>{items.filter(i=>i.status==='resolved').length}</h2><small>Successful resolutions</small></div><div className="panel"><b>Experiences</b><h2>{experiences.length}</h2><small>Captured in memory</small></div><div className="panel"><b>Investigating</b><h2>{items.filter(i=>i.status==='investigating').length}</h2><small>Needs attention</small></div></div>
    <div className="panel" style={{marginTop:20}}><b>Live backend connected</b><p>Incidents and experiences below are loaded from Express + MongoDB.</p></div>{/* label="Total incidents" value={String(items.length)} note="From MongoDB" Icon={ShieldAlert} tone="blue" /><StatCard label="Resolved" value={String(items.filter(i=>i.status==='resolved').length)} note="Successful resolutions" Icon={CheckCircle2} tone="mint" /><StatCard label="Experiences" value={String(experiences.length)} note="Captured in memory" Icon={BrainCircuit} tone="violet" /><StatCard label="Investigating" value={String(items.filter(i=>i.status==='investigating').length)} note="Needs attention" Icon={Activity} tone="amber" />*/}
  </>
}

function IncidentsPage() {
  const [items,setItems]=useState<ApiIncident[]>([]); const [query,setQuery]=useState(''); const [status,setStatus]=useState('All statuses'); const [error,setError]=useState('')
  const load=()=>{const id=getProjectId(); if(!id)return; api(`/incidents?projectId=${id}`).then(r=>setItems(r.incidents)).catch(e=>setError(e.message))}
  useEffect(load,[])
  const shown=items.filter(i=>(status==='All statuses'||i.status===status.toLowerCase()) && `${i.title} ${i.service||''}`.toLowerCase().includes(query.toLowerCase()))
  const label=(s:string)=>s==='resolved'?'Resolved':s==='investigating'?'Investigating':'Open'
  return <><Title eyebrow="E-COMMERCE PLATFORM" title="Incidents" sub="Real incidents stored by the Express backend." action={<Button href={`${projectPath}/workspace`}><Plus size={15}/>Create from workspace</Button>} />
    {error&&<section className="panel"><p>{error}</p></section>}
    <div className="toolbar"><label className="search-input"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search incidents..."/></label><select value={status} onChange={e=>setStatus(e.target.value)}><option>All statuses</option><option>open</option><option>investigating</option><option>resolved</option></select><span className="result-count">{shown.length} incidents</span></div>
    <div className="table-wrap"><table><thead><tr><th>INCIDENT</th><th>STATUS</th><th>SERVICE</th><th>ENVIRONMENT</th><th>CREATED</th><th/></tr></thead><tbody>{shown.map(i=><tr key={i._id}><td><a className="incident-name" href={`${projectPath}/incidents/${i._id}`}><small>{i._id.slice(-8)}</small><b>{i.title}</b></a></td><td><Status value={label(i.status)}/></td><td>{i.service||'—'}</td><td>{i.environment||'—'}</td><td>{i.createdAt?new Date(i.createdAt).toLocaleString():'—'}</td><td><a className="row-arrow" href={`${projectPath}/incidents/${i._id}`}><ArrowUpRight size={15}/></a></td></tr>)}</tbody></table></div>
  </>
}

function MemoryPage() {
  const [query,setQuery]=useState(''); const [items,setItems]=useState<ApiExperience[]>([]); const [result,setResult]=useState<any>(null); const [loading,setLoading]=useState(false); const [problem,setProblem]=useState('')
  useEffect(()=>{const id=getProjectId(); if(id) api(`/experiences?projectId=${id}`).then(r=>setItems(r.experiences)).catch(()=>{})},[])
  async function recall(){const id=getProjectId(); if(!id||!query.trim()) return; setLoading(true); try{const r=await api('/memory/recall',{method:'POST',body:JSON.stringify({projectId:id,problem:query,description:query,status:'investigating'})});setResult(r)}catch(e:any){setResult({error:e.message})}finally{setLoading(false)}}
  const filtered=items.filter(x=>`${x.problem} ${x.rootCause||''} ${x.solution||''}`.toLowerCase().includes(query.toLowerCase()))
  return <><Title eyebrow="E-COMMERCE PLATFORM" title="Engineering memory" sub="Search live experiences stored in MongoDB and recalled through Member 3." />
    <div className="memory-search-box"><span className="memory-search-icon"><BrainCircuit size={20}/></span><div><b>Search your team's experience</b><small>RECALL uses the Express backend and Member 3 Memory API.</small></div><label className="search-input"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&recall()} placeholder="Describe the problem and press Enter..."/></label><Button onClick={recall}>{loading?'Searching…':'Recall memory'}</Button></div>
    {result&&<section className="panel" style={{marginTop:16}}><PanelHeading title="Memory result"/><pre style={{whiteSpace:'pre-wrap'}}>{result.error||JSON.stringify(result.recommendation,null,2)}</pre></section>}
    <div className="memory-columns"><section><div className="memory-list-head"><b>{filtered.length} saved experiences</b></div>{filtered.map(m=><article className="memory-card" key={m._id}><div className="memory-card-top"><span><BrainCircuit size={13}/> INCIDENT EXPERIENCE</span></div><b className="memory-card-title">{m.problem}</b><div className="memory-meta">{m.incidentId}<i/> {m.attempts?.length||0} attempts</div><div className="lesson"><BookOpen size={14}/><p><b>Root cause</b>{m.rootCause||'Not recorded'}</p></div><div className="memory-card-footer"><span><CheckCircle2 size={13}/> {m.outcome||'Resolved'}</span><small>{m.createdAt?new Date(m.createdAt).toLocaleDateString():''}</small></div></article>)}</section></div>
  </>
}

// function IncidentDetail({ id }: { id: string }) {
//   const [record,setRecord]=useState<ApiIncident|null>(null); const [attempts,setAttempts]=useState<any[]>([]); const [tab,setTab]=useState('Overview'); const [loading,setLoading]=useState(true); const [memory,setMemory]=useState<any>(null); const [action,setAction]=useState(''); const [message,setMessage]=useState('')
//   const load=()=>api(`/incidents/${id}`).then(r=>{setRecord(r.incident);setAttempts(r.attempts||[])}).catch(e=>setMessage(e.message)).finally(()=>setLoading(false))
//   useEffect(load,[id])
//   async function checkMemory(){if(!record)return; try{setMessage('Searching organizational memory…'); const r=await api('/memory/recall',{method:'POST',body:JSON.stringify({projectId:record.projectId,incidentId:record._id,problem:record.description||record.errorMessage||record.title,description:record.description,errorMessage:record.errorMessage,errorType:record.errorType,service:record.service,environment:record.environment,version:record.version,attempts})});setMemory(r);setMessage('Memory recall completed.')}catch(e:any){setMessage(e.message)}}
//   async function addAttempt(){if(!record||!action.trim())return; await api(`/incidents/${record._id}/attempts`,{method:'POST',body:JSON.stringify({action,result:'inconclusive'})});setAction('');load()}
//   async function resolve(){if(!record)return; const solution=window.prompt('Resolution / solution'); if(!solution)return; const rootCause=window.prompt('Root cause')||''; const verification=window.prompt('Verification')||''; const r=await api(`/incidents/${record._id}/resolve`,{method:'POST',body:JSON.stringify({solution,rootCause,verification,outcome:'resolved'})});setMessage(r.memory?.retained?'Resolved and retained in Memory.':'Resolved; Memory retention is not currently available.');load()}
//   if(loading)return <section className="panel"><p>Loading incident…</p></section>
//   if(!record)return <section className="panel"><p>Incident not found.</p></section>
//   return <><div className="back-row"><a href={`${projectPath}/incidents`}><ChevronRight className="back-chevron" size={14}/>All incidents</a><span>/</span><span>{record._id.slice(-8)}</span><Button variant="secondary" onClick={resolve}>Mark resolved<Check size={14}/></Button></div><Title eyebrow="INCIDENT DETAIL" title={<>{record._id.slice(-8)} — {record.title}</>} sub={record.description||record.errorMessage||'Incident investigation'} action={<Status value={record.status==='resolved'?'Resolved':record.status==='investigating'?'Investigating':'Open'}/>} />
//     <div className="incident-metadata"><div><small>SERVICE</small><b>{record.service||'—'}</b></div><div><small>ENVIRONMENT</small><b>{record.environment||'—'}</b></div><div><small>VERSION</small><b>{record.version||'—'}</b></div><div><small>ERROR</small><b>{record.errorType||'—'}</b></div></div>
//     <div className="tabs detail-tabs">{['Overview','Attempts','Related memory'].map(n=><button key={n} className={n===tab?'active':''} onClick={()=>setTab(n)}>{n}</button>)}</div>
//     <section className="panel detail-panel"><PanelHeading title={tab}/>{tab==='Overview'&&<><p>{record.description||record.errorMessage||'No description recorded.'}</p><div className="detail-tags"><span><ShieldAlert size={13}/>{record.severity||'medium'}</span><span><Code2 size={13}/>{record.service||'service'}</span><span>{record.environment||'development'}</span></div></>}{tab==='Attempts'&&<><div className="toolbar"><input value={action} onChange={e=>setAction(e.target.value)} placeholder="Record an investigation attempt"/><Button onClick={addAttempt}>Add attempt</Button></div>{attempts.map((a,i)=><div className="timeline" key={a._id||i}><div><i className={a.result==='successful'?'success':'fail'}>{a.result==='successful'?<Check size={12}/>:<X size={12}/>}</i><p><b>{a.action}</b><small>{a.notes||a.result}</small></p></div></div>)}</>}{tab==='Related memory'&&<><Button onClick={checkMemory}>{memory?'Refresh recall':'Check Engineering Memory'}<BrainCircuit size={14}/></Button>{memory&&<pre style={{whiteSpace:'pre-wrap',marginTop:16}}>{JSON.stringify(memory.recommendation,null,2)}</pre>}</>}</section>
//     {message&&<section className="panel" style={{marginTop:16}}><p>{message}</p></section>}
//   </>
// }

function IncidentDetail({ id }: { id: string }) {
  const [record, setRecord] = useState<ApiIncident | null>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [tab, setTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [memory, setMemory] = useState<any>(null);
  const [action, setAction] = useState("");
  const [attemptResult, setAttemptResult] = useState("inconclusive");
  const [attemptNotes, setAttemptNotes] = useState("");
  const [message, setMessage] = useState("");

  const load = () =>
    api(`/incidents/${id}`)
      .then((r) => {
        setRecord(r.incident);
        setAttempts(r.attempts || []);
      })
      .catch((e) => setMessage(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, [id]);

  async function checkMemory() {
    if (!record) return;

    try {
      setMessage("Searching organizational memory…");

      const r = await api("/memory/recall", {
        method: "POST",
        body: JSON.stringify({
          projectId: record.projectId,
          incidentId: record._id,
          problem:
            record.description ||
            record.errorMessage ||
            record.title,
          description: record.description,
          errorMessage: record.errorMessage,
          errorType: record.errorType,
          service: record.service,
          environment: record.environment,
          version: record.version,
          attempts,
        }),
      });

      setMemory(r);
      setMessage("Memory recall completed.");
    } catch (e: any) {
      setMessage(e.message);
    }
  }

  async function addAttempt() {
    if (!record || !action.trim()) return;

    await api(`/incidents/${record._id}/attempts`, {
      method: "POST",
      body: JSON.stringify({
        action,
        result: attemptResult,
        notes: attemptNotes,
      }),
    });

    setAction("");
    setAttemptNotes("");
    setAttemptResult("inconclusive");
    load();
  }

  async function resolve() {
    if (!record) return;

    const solution = window.prompt("Resolution / solution");
    if (!solution) return;

    const rootCause = window.prompt("Root cause") || "";
    const verification = window.prompt("Verification") || "";
    const lesson = window.prompt("Lesson learned (what should the team remember next time?)") || "";

    const r = await api(`/incidents/${record._id}/resolve`, {
      method: "POST",
      body: JSON.stringify({
        solution,
        rootCause,
        verification,
        lesson,
        outcome: "resolved",
      }),
    });

    setMessage(
      r.memory?.retained
        ? "Resolved and retained in Memory."
        : "Resolved; Memory retention is not currently available."
    );

    load();
  }

  if (loading)
    return (
      <section className="panel">
        <p>Loading incident…</p>
      </section>
    );

  if (!record)
    return (
      <section className="panel">
        <p>Incident not found.</p>
      </section>
    );

  return (
    <>
      <div className="back-row">
        <a href={`${projectPath}/incidents`}>
          <ChevronRight className="back-chevron" size={14} />
          All incidents
        </a>

        <span>/</span>
        <span>{record._id.slice(-8)}</span>

        <Button variant="secondary" onClick={resolve}>
          Mark resolved
          <Check size={14} />
        </Button>
      </div>

      <Title
        eyebrow="INCIDENT DETAIL"
        title={
          <>
            {record._id.slice(-8)} — {record.title}
          </>
        }
        sub={
          record.description ||
          record.errorMessage ||
          "Incident investigation"
        }
        action={
          <Status
            value={
              record.status === "resolved"
                ? "Resolved"
                : record.status === "investigating"
                ? "Investigating"
                : "Open"
            }
          />
        }
      />

      <div className="incident-metadata">
        <div>
          <small>SERVICE</small>
          <b>{record.service || "—"}</b>
        </div>

        <div>
          <small>ENVIRONMENT</small>
          <b>{record.environment || "—"}</b>
        </div>

        <div>
          <small>VERSION</small>
          <b>{record.version || "—"}</b>
        </div>

        <div>
          <small>ERROR</small>
          <b>{record.errorType || "—"}</b>
        </div>
      </div>

      <div className="tabs detail-tabs">
        {["Overview", "Attempts", "Related memory"].map((n) => (
          <button
            key={n}
            className={n === tab ? "active" : ""}
            onClick={() => setTab(n)}
          >
            {n}
          </button>
        ))}
      </div>

      <section className="panel detail-panel">
        <PanelHeading title={tab} />

        {tab === "Overview" && (
          <>
            <p>
              {record.description ||
                record.errorMessage ||
                "No description recorded."}
            </p>

            <div className="detail-tags">
              <span>
                <ShieldAlert size={13} />
                {record.severity || "medium"}
              </span>

              <span>
                <Code2 size={13} />
                {record.service || "service"}
              </span>

              <span>{record.environment || "development"}</span>
            </div>
          </>
        )}

        {tab === "Attempts" && (
          <>
            <div className="toolbar">
              <input
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="Record an investigation attempt"
              />
              <select value={attemptResult} onChange={(e) => setAttemptResult(e.target.value as "failed" | "successful" | "inconclusive")}>
                <option value="failed">Failed</option>
                <option value="inconclusive">Inconclusive</option>
                <option value="successful">Successful</option>
              </select>
              <input
                value={attemptNotes}
                onChange={(e) => setAttemptNotes(e.target.value)}
                placeholder="What happened?"
              />
              <Button onClick={addAttempt}>Add attempt</Button>
            </div>

            {attempts.map((a, i) => (
              <div className="timeline" key={a._id || i}>
                <div>
                  <i
                    className={
                      a.result === "successful" ? "success" : "fail"
                    }
                  >
                    {a.result === "successful" ? (
                      <Check size={12} />
                    ) : (
                      <X size={12} />
                    )}
                  </i>

                  <p>
                    <b>{a.action}</b>
                    <small>{a.notes || a.result}</small>
                  </p>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === "Related memory" && (
          <>
            <Button onClick={checkMemory}>
              {memory ? "Refresh recall" : "Check Engineering Memory"}
              <BrainCircuit size={14} />
            </Button>

            {memory && (
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  marginTop: 16,
                }}
              >
                {JSON.stringify(memory.recommendation, null, 2)}
              </pre>
            )}
          </>
        )}
      </section>

      {message && (
        <section className="panel" style={{ marginTop: 16 }}>
          <p>{message}</p>
        </section>
      )}
    </>
  );
}

function WorkspacePage() {
  const [activeFile, setActiveFile] = useState('src/services/db.ts')
  const [openFiles, setOpenFiles] = useState(['src/services/db.ts', 'src/app.ts'])
  const [terminalOpen, setTerminalOpen] = useState(true)
  const [running, setRunning] = useState(false)
  const [incident, setIncident] = useState<ApiIncident | null>(null)
  const [memory, setMemory] = useState<any>(null)
  const [memoryLoading, setMemoryLoading] = useState(false)
  const [attemptAction, setAttemptAction] = useState('')
  const [attemptResult, setAttemptResult] = useState<'failed' | 'successful' | 'inconclusive'>('failed')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [asking, setAsking] = useState(false)
  const [message, setMessage] = useState('')
  const [terminalLines, setTerminalLines] = useState<string[]>(['$ npm run dev'])
  const [terminalCommand, setTerminalCommand] = useState('')

  const fileContents: Record<string, string> = {
    'src/app.ts': "import express from 'express'\nimport { connectDatabase } from './services/db'\nimport { registerRoutes } from './components/routes'\n\nconst app = express()\napp.use(express.json())\n\nasync function startServer() {\n  await connectDatabase()\n  registerRoutes(app)\n  app.listen(process.env.PORT ?? 3000)\n}\n\nstartServer().catch(console.error)",
    'src/services/db.ts': "import mongoose from 'mongoose'\n\nconst options = {\n  maxPoolSize: 10,\n  serverSelectionTimeoutMS: 5000,\n  socketTimeoutMS: 45000,\n}\n\nexport async function connectDatabase() {\n  try {\n    await mongoose.connect(process.env.MONGO_URI!, options)\n    console.log(\"Database connected\")\n  } catch (error) {\n    console.error(\"MongoDB connection failed\", error)\n    throw error\n  }\n}",
    'src/services/checkout.ts': "import { Order } from '../models/order'\nimport { paymentService } from './payments'\n\nexport async function createCheckout(userId: string) {\n  const order = await Order.findOne({ userId, status: 'draft' })\n  if (!order) throw new Error('No active order')\n\n  const payment = await paymentService.charge(order)\n  order.status = 'paid'\n  await order.save()\n  return { order, payment }\n}",
    'src/utils/database.ts': "import type { ConnectOptions } from 'mongoose'\n\nexport function createConnectionOptions(): ConnectOptions {\n  return {\n    maxPoolSize: 10,\n    serverSelectionTimeoutMS: 5000,\n    retryWrites: true,\n  }\n}",
    'src/auth.ts': "import jwt from 'jsonwebtoken'\n\nexport function createSession(userId: string) {\n  return jwt.sign({ sub: userId }, process.env.JWT_SECRET!, {\n    expiresIn: '12h',\n    issuer: 'acme-api',\n  })\n}",
    'src/db.ts': "export { connectDatabase } from './services/db'\nexport { createConnectionOptions } from './utils/database'",
    'tests/database.test.ts': "import { describe, expect, it } from 'vitest'\nimport { createConnectionOptions } from '../src/utils/database'\n\ndescribe('database options', () => {\n  it('uses a bounded connection pool', () => {\n    expect(createConnectionOptions().maxPoolSize).toBe(10)\n  })\n})",
    'package.json': '{\n  "name": "acme-checkout-api",\n  "scripts": {\n    "dev": "tsx watch src/app.ts",\n    "test": "vitest run"\n  },\n  "dependencies": {\n    "mongoose": "^8.9.0",\n    "express": "^4.21.0"\n  }\n}',
    'README.md': '# Acme Checkout API\n\nNode.js service for checkout, orders, and payments.\n\n## Development\n\n1. Set MONGO_URI in your environment.\n2. Run npm run dev.\n3. Run npm test before opening a pull request.'
  }
  const [source, setSource] = useState(fileContents[activeFile].split('\n'))

  function selectFile(file: string) {
    setActiveFile(file)
    setSource((fileContents[file] || '// Select a file to inspect').split('\n'))
    setOpenFiles(current => current.includes(file) ? current : [...current, file])
  }

  async function runWorkspace() {
    const projectId = getProjectId()
    if (!projectId) {
      setMessage('Select a project first so Engineering Memory knows which team owns this experience.')
      return
    }
    setRunning(true)
    setMessage('Running workspace and capturing the failure…')
    setMemory(null)
    setTerminalLines(lines => [...lines, '$ npm run dev', '✓ Starting development server…', 'Error: MongoServerSelectionError', 'MongoNetworkError: connection refused'])
    try {
      await api('/events/batch', {
        method: 'POST',
        body: JSON.stringify({
          events: [
            { projectId, type: 'RUN_STARTED', source: 'workspace', payload: { command: 'npm run dev', filePath: 'src/app.ts' } },
            { projectId, type: 'TERMINAL_ERROR', source: 'workspace', payload: { errorType: 'MongoServerSelectionError', message: 'MongoNetworkError: connection refused', command: 'npm run dev' } },
          ]
        })
      })

      const result = await api<{ incident: ApiIncident }>('/incidents', {
        method: 'POST',
        body: JSON.stringify({
          projectId,
          title: 'MongoDB connection failure',
          description: 'The checkout service fails to start because the database connection is refused.',
          errorMessage: 'MongoNetworkError: connection refused',
          errorType: 'MongoServerSelectionError',
          stackTrace: 'MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017',
          filePath: 'src/services/db.ts',
          lineNumber: 10,
          command: 'npm run dev',
          logs: 'Error: MongoServerSelectionError\nMongoNetworkError: connection refused',
          language: 'TypeScript',
          framework: 'Express',
          runtime: 'Node.js 20',
          service: 'Checkout API',
          environment: 'development',
          version: '2.8.1',
          severity: 'high',
          recentChange: 'Updated MongoDB connection handling'
        })
      })
      setIncident(result.incident)
      setMessage('Failure captured. Engineering Memory is checking prior team experience and generating an initial investigation plan…')
      await checkMemory(result.incident)
    } catch (error: any) {
      setTerminalLines(lines => [...lines, `✕ ${error.message || 'Command failed'}`])
      setMessage(error.message || 'Workspace run failed.')
    } finally {
      setRunning(false)
    }
  }

  async function runTerminalCommand() {
    const command = terminalCommand.trim()
    if (!command || running) return
    setTerminalCommand('')
    if (command === 'npm run dev') {
      await runWorkspace()
      return
    }
    if (command === 'npm test' || command === 'npm run test') {
      setTerminalLines(lines => [...lines, `$ ${command}`, '✓ database.test.ts  4 passed', '✓ Test suite completed'])
      setMessage('Tests passed in the simulated workspace. No new incident was created.')
      return
    }
    if (command === 'git diff') {
      setTerminalLines(lines => [...lines, '$ git diff', 'diff --git a/src/services/db.ts b/src/services/db.ts', '+  maxPoolSize: 10,', '+  serverSelectionTimeoutMS: 5000'])
      return
    }
    if (command === 'clear') {
      setTerminalLines([])
      return
    }
    setTerminalLines(lines => [...lines, `$ ${command}`, `command not found: ${command.split(' ')[0]}`])
  }

  async function checkMemory(target = incident) {
    if (!target) return
    setMemoryLoading(true)
    try {
      const result = await api('/memory/recall', {
        method: 'POST',
        body: JSON.stringify({
          projectId: target.projectId,
          incidentId: target._id,
          problem: target.description || target.errorMessage || target.title,
          description: target.description,
          errorMessage: target.errorMessage,
          errorType: target.errorType,
          stackTrace: target.stackTrace,
          service: target.service,
          language: target.language,
          framework: target.framework,
          environment: target.environment,
          version: target.version,
          attempts: []
        })
      })
      setMemory(result)
      setMessage(result.matchFound ? 'Memory found. Review the evidence before changing the code.' : 'No close memory found. This may be a new failure pattern.')
    } catch (error: any) {
      setMessage(error.message || 'Memory recall failed.')
    } finally {
      setMemoryLoading(false)
    }
  }

  async function askMemory() {
    const projectId = getProjectId()
    if (!projectId || !question.trim()) return
    setAsking(true)
    try {
      const result = await api('/memory/reflect', {
        method: 'POST',
        body: JSON.stringify({ projectId, query: `${question.trim()}\n\nCurrent workspace context — file: ${activeFile}\n\`\`\`typescript\n${source.join('\n')}\n\`\`\`` })
      })
      setAnswer(result.answer || 'No synthesized answer was returned.')
    } catch (error: any) {
      setAnswer(error.message || 'Engineering Memory could not answer that question.')
    } finally {
      setAsking(false)
    }
  }

  async function recordAttempt(result: 'failed' | 'successful') {
    if (!incident || !attemptAction.trim()) return
    try {
      await api(`/incidents/${incident._id}/attempts`, {
        method: 'POST',
        body: JSON.stringify({ action: attemptAction, result, notes: result === 'failed' ? 'Failure persisted after the attempted change.' : 'Failure cleared after the attempted change.' })
      })
      setAttemptAction('')
      setAttemptResult(result)
      setMessage(`Recorded ${result} attempt. This becomes part of the experience when the incident is resolved.`)
    } catch (error: any) {
      setMessage(error.message || 'Could not record attempt.')
    }
  }

  async function resolveIncident() {
    if (!incident) return
    const solution = window.prompt('What fixed the incident?')
    if (!solution) return
    const rootCause = window.prompt('Root cause') || ''
    const lesson = window.prompt('What should the team remember next time?') || ''
    const verification = window.prompt('How did you verify the fix?') || ''
    try {
      const result = await api(`/incidents/${incident._id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ solution, rootCause, lesson, verification, outcome: 'resolved' })
      })
      setIncident(result.incident)
      setMessage(result.memory?.retained ? 'Resolved and retained in Engineering Memory.' : 'Resolved. Memory retention is not currently available.')
    } catch (error: any) {
      setMessage(error.message || 'Could not resolve incident.')
    }
  }

  const scenarios = memory?.matches || []
  const recommendation = memory?.recommendation || {}

  return (
    <div className="workspace-page">
      <div className="workspace-heading">
        <div><span className="eyebrow">E-COMMERCE PLATFORM / WORKSPACE</span><h1>Developer workspace</h1><p>Run code, investigate failures, and keep your team&apos;s hard-won engineering knowledge beside the editor.</p></div>
        <div><Button variant="secondary" onClick={runWorkspace}><Command size={14} />{running ? 'Running…' : 'Run workspace'}</Button><Button variant="secondary" href={`${projectPath}/incidents`}>Incidents<ArrowUpRight size={14} /></Button></div>
      </div>
      <div className="ide-window">
        <div className="ide-top"><span className="window-dots"><i /><i /><i /></span><span><Code2 size={13} /> ecommerce-platform</span><span className="ide-branch"><GitBranch size={12} /> main <span className="ide-separator">/</span> TypeScript</span></div>
        <div className="ide-body">
          <aside className="file-tree" aria-label="Project file explorer">
            <div className="explorer-heading"><b>EXPLORER</b><button aria-label="Project files"><MoreHorizontal size={14} /></button></div>
            <span className="tree-root">⌄ ECOMMERCE-PLATFORM</span><span className="tree-folder">⌄ src</span><span className="tree-folder tree-nested">⌄ services</span>
            {['src/services/db.ts','src/services/checkout.ts'].map(file => <button key={file} className={`tree-file ${activeFile === file ? 'selected' : ''}`} onClick={() => selectFile(file)}><FileCode2 size={13} />{file.split('/').pop()}</button>)}
            <span className="tree-folder tree-nested">⌄ utils</span><button className={`tree-file ${activeFile === 'src/utils/database.ts' ? 'selected' : ''}`} onClick={() => selectFile('src/utils/database.ts')}><FileCode2 size={13} />database.ts</button>
            {['src/app.ts','src/db.ts','src/auth.ts'].map(file => <button key={file} className={`tree-file ${activeFile === file ? 'selected' : ''}`} onClick={() => selectFile(file)}><FileCode2 size={13} />{file.split('/').pop()}</button>)}
            <span className="tree-folder">⌄ tests</span><button className={`tree-file ${activeFile === 'tests/database.test.ts' ? 'selected' : ''}`} onClick={() => selectFile('tests/database.test.ts')}><FileCode2 size={13} />database.test.ts</button>
            {['package.json','README.md'].map(file => <button key={file} className={`tree-file ${activeFile === file ? 'selected' : ''}`} onClick={() => selectFile(file)}><FileCode2 size={13} />{file}</button>)}
          </aside>
          <section className="editor-column" aria-label="Code editor">
            <div className="editor-tabs" role="tablist" aria-label="Open files">{openFiles.map(file => <button key={file} role="tab" aria-selected={activeFile === file} className={`editor-tab ${activeFile === file ? 'active' : ''}`} onClick={() => selectFile(file)}><FileCode2 size={12} />{file.split('/').pop()}</button>)}</div>
            <div className="code-viewport" role="region" aria-label={`${activeFile} source code`}><div className="editor-breadcrumb"><span>src</span><ChevronRight size={11} /><span>{activeFile.split('/').slice(1,-1).join('/') || 'root'}</span><ChevronRight size={11} /><b>{activeFile.split('/').pop()}</b></div><div className="code-editor"><textarea className="code-input" value={source.join('\n')} onChange={e => setSource(e.target.value.split('\n'))} spellCheck={false} /></div></div>
            <section className={`terminal ${terminalOpen ? '' : 'terminal-collapsed'}`} aria-label="Terminal"><div className="terminal-head"><span><Command size={12} /> TERMINAL <small>npm run dev</small></span><button onClick={() => setTerminalOpen(open => !open)} aria-expanded={terminalOpen}>{terminalOpen ? 'Hide terminal' : 'Show terminal'}<ChevronDown className={terminalOpen ? '' : 'terminal-expand-icon'} size={13} /></button></div>{terminalOpen && <div className="terminal-output"><code>{terminalLines.map((line, i) => <span key={`${line}-${i}`} className={line.startsWith('Error') || line.startsWith('✕') || line.includes('command not found') ? 'terminal-error' : line.startsWith('✓') ? 'terminal-success' : ''}>{line}</span>)}<span className="terminal-prompt"><b>$</b><input aria-label="Terminal command" value={terminalCommand} onChange={e => setTerminalCommand(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') runTerminalCommand() }} placeholder="type a command…" /><i /></span></code></div>}</section>
          </section>
          <aside className="ai-panel memory-ai-panel" aria-label="Engineering Memory">
            <div className="memory-panel-title"><BrainCircuit size={16} /><b>Engineering Memory</b><span className="prototype-label">LIVE</span></div>
            <div className="memory-context-label">{incident ? 'INCIDENT MODE' : 'CODEBASE MODE'}</div>
            <div className="memory-outcome related-outcome memory-ask-first">
              <div className="outcome-heading"><BrainCircuit size={15} /><b>Ask your team memory</b></div>
              <p className="related-copy">Ask about past incidents, known fixes, failed approaches, or what your team learned. This is available before you run anything.</p>
              <div className="workspace-question-row"><input value={question} onChange={e => setQuestion(e.target.value)} placeholder={incident ? 'Why did this fail before?' : 'What do we know about MongoDB failures?'} onKeyDown={e => { if (e.key === 'Enter') askMemory() }} /><button onClick={askMemory} disabled={asking}>{asking ? '…' : 'Ask'}</button></div>
              {answer && <p className="workspace-answer">{answer}</p>}
            </div>
            {!incident && <div className="memory-empty-hint"><b>Ready before the first run.</b><span> The assistant can explain code, search team memory, and answer questions now. Once a command fails, it automatically switches into incident mode.</span></div>}
            {incident && <>
              <div className="problem-callout"><ShieldAlert size={15} /><div><small>PROBLEM DETECTED</small><b>{incident.errorType || incident.title}</b><span>{incident.errorMessage}</span></div></div>
              <div className="memory-outcome similar-outcome">
                <div className="outcome-heading">{memory?.matchFound ? <CheckCircle2 size={15} /> : <Activity size={15} />}<b>{memoryLoading ? 'Searching engineering memory…' : memory?.matchFound ? 'Prior team experience found' : 'No prior memory — here is the initial investigation plan'}</b></div>
                {memoryLoading && <div className="memory-loading"><span className="loading-spinner" />Recalling similar incidents and lessons…</div>}
                {!memoryLoading && memory && scenarios.length > 0 && <div className="related-list">{scenarios.slice(0,3).map((item:any) => <div key={item.incidentId || item.title}><b>{item.title}</b><span>{item.summary}</span></div>)}</div>}
                {!memoryLoading && memory?.recommendation?.previousAttempts?.length > 0 && <div className="approach-list"><small>REMEMBERED ATTEMPTS</small>{memory.recommendation.previousAttempts.slice(0,4).map((item:any,i:number) => <p key={i} className={item.result === 'successful' ? 'successful-approach' : 'failed-approach'}>{item.result === 'successful' ? '✓' : '×'} {item.action || item}</p>)}</div>}
                {!memoryLoading && memory?.recommendation?.successfulSolution && <p className="memory-warning"><b>Remembered solution:</b> {memory.recommendation.successfulSolution}</p>}
                {!memoryLoading && memory?.recommendation?.reasoning && <div className="initial-plan"><small>{memory?.matchFound ? 'WHY THIS MATTERS' : 'SUGGESTED NEXT STEPS'}</small>{memory.recommendation.reasoning.split('\n').filter(Boolean).slice(0,4).map((item:string,i:number) => <p key={i}><span>{i + 1}</span>{item}</p>)}</div>}
                {!memoryLoading && !memory && <button className="memory-search-button" onClick={() => checkMemory()} disabled={memoryLoading}>Check Engineering Memory <ArrowRight size={13} /></button>}
              </div>
              <div className="memory-outcome related-outcome">
                <div className="outcome-heading"><Activity size={15} /><b>Investigation loop</b></div>
                <input value={attemptAction} onChange={e => setAttemptAction(e.target.value)} placeholder="What did you try?" />
                <div className="workspace-attempt-actions"><button onClick={() => recordAttempt('failed')}>Record failed</button><button onClick={() => recordAttempt('successful')}>Record successful</button></div>
                {incident.status !== 'resolved' && <button className="memory-search-button" onClick={resolveIncident}>Resolve &amp; remember <BrainCircuit size={13} /></button>}
              </div>
            </>}
            {message && <p className="workspace-message">{message}</p>}
          </aside>
        </div>
      </div>
    </div>
  )
}

function TeamPage() {
  return (
    <>
      <Title eyebrow="E-COMMERCE PLATFORM" title="Project team" sub="The engineers building and learning together." action={<Button><Plus size={15} />Invite member</Button>} />
      <div className="team-summary"><span><b>8</b><small>Project members</small></span><span><b>42</b><small>Experiences contributed</small></span><span><b>38</b><small>Incidents resolved</small></span><div className="avatar-stack">{members.map(member => <Avatar key={member.initials} initials={member.initials} color={member.color} />)}<span>+4</span></div></div>
      <div className="table-wrap"><table><thead><tr><th>MEMBER</th><th>ROLE</th><th>ACCESS</th><th>EXPERIENCES</th><th>INCIDENTS RESOLVED</th><th /></tr></thead><tbody>{members.map(member => <tr key={member.name}><td><span className="assignee"><Avatar initials={member.initials} color={member.color} /><span><b>{member.name}</b><small>{member.name.toLowerCase().replace(' ', '.')}@acme.dev</small></span></span></td><td>{member.role}</td><td><span className="role-pill">{member.access}</span></td><td>{member.access === 'Admin' ? 28 : member.access === 'Developer' ? 19 : 7}</td><td>{member.access === 'Admin' ? 12 : member.access === 'Developer' ? 8 : 3}</td><td><button className="icon-button" aria-label={`More options for ${member.name}`}><MoreHorizontal size={16} /></button></td></tr>)}</tbody></table></div>
    </>
  )
}

function SimplePage({ title }: { title: string }) {
  return <><Title eyebrow="ACME TECHNOLOGIES" title={title} sub="Manage your company workspace and shared engineering knowledge." /><section className="panel simple-panel"><BrainCircuit size={25} /><h2>{title} workspace</h2><p>This area is ready for your team. Explore projects, incidents, and engineering memory from the navigation.</p><Button href={title.toLowerCase().includes('project') ? base : projectPath}>Back to overview<ArrowRight size={14} /></Button></section></>
}

function CreateProject() {
  const router=useRouter(); const [name,setName]=useState(''); const [description,setDescription]=useState(''); const [repositoryUrl,setRepositoryUrl]=useState(''); const [loading,setLoading]=useState(false); const [error,setError]=useState('')
  async function submit(e:any){e.preventDefault(); const me=await api('/auth/me'); const org=me.organizations?.[0]?._id; if(!org){setError('Create a company first.');return} setLoading(true);try{const r=await api('/projects',{method:'POST',body:JSON.stringify({organizationId:org,name,description,repositoryUrl,techStack:[]})});setProjectId(r.project._id);router.push(projectPath)}catch(e:any){setError(e.message)}finally{setLoading(false)}}
  return <><Title eyebrow="ACME TECHNOLOGIES / PROJECTS" title="Create a project" sub="Create a real project in MongoDB."/><form className="create-form" onSubmit={submit}><label>Project name<input value={name} onChange={e=>setName(e.target.value)} required/></label><label>Description<textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3}/></label><label>Repository URL<input value={repositoryUrl} onChange={e=>setRepositoryUrl(e.target.value)} placeholder="https://github.com/..."/></label>{error&&<p>{error}</p>}<div className="form-footer"><Button href={`${base}/projects`} variant="secondary">Cancel</Button><Button type="submit">{loading?'Creating…':'Create project'}<ArrowRight size={14}/></Button></div></form></>
}

// function AuthPage({ setup = false }: { setup?: boolean }) {
//   const [tab,setTab]=useState<'create'|'join'>('create'); const [name,setName]=useState(''); const [company,setCompany]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const router=useRouter()
//   async function submit(e:any){e.preventDefault();setError('');try{if(setup){const r=await api('/auth/register',{method:'POST',body:JSON.stringify({name:name||company.split(' ')[0]||'Engineer',email,password})});setToken(r.token);await api('/organizations',{method:'POST',body:JSON.stringify({name:company,description:'Engineering workspace'})});router.push(base)}else{const r=await api('/auth/login',{method:'POST',body:JSON.stringify({email,password})});setToken(r.token);const ps=await api('/projects');if(ps.projects?.[0]?._id)setProjectId(ps.projects[0]._id);router.push(base)}}catch(e:any){setError(e.message)}}
//   return <div className="auth-page"><a className="auth-return" href="/"><ChevronRight className="back-chevron" size={14}/>Back to CodeMind</a><form className="auth-card" onSubmit={submit}><Logo/><div className="auth-heading"><h1>{setup?'Create your company workspace':'Welcome back!'}</h1><p>{setup?'Create an account and company to start storing engineering memory.':'Log in to your live engineering workspace.'}</p></div>{setup&&<><label>Your name<input value={name} onChange={e=>setName(e.target.value)} required/></label><label>Company name<input value={company} onChange={e=>setCompany(e.target.value)} required/></label></>}{!setup&&<><label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label></>}{error&&<p>{error}</p>}<Button type="submit">{setup?'Create company':'Log in'}<ArrowRight size={14}/></Button>{!setup&&<p className="auth-signup">Don&apos;t have an account? <a href="/company/setup">Sign up</a></p>}</form></div>
// }

function AuthPage({ setup = false }: { setup?: boolean }) {
  const [tab, setTab] = useState<'create' | 'join'>('create')

  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // ----------------------------------------
      // CREATE COMPANY WORKSPACE
      // ----------------------------------------
      if (setup) {
        // Basic frontend validation
        if (!name.trim()) {
          setError('Please enter your name.')
          return
        }

        if (!company.trim()) {
          setError('Please enter your company name.')
          return
        }

        if (!email.trim()) {
          setError('Please enter your email address.')
          return
        }

        if (!password) {
          setError('Please enter a password.')
          return
        }

        if (password.length < 8) {
          setError('Password must be at least 8 characters.')
          return
        }

        // 1. Create user account
        const registerResponse = await api('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        })

        // 2. Save JWT token
        setToken(registerResponse.token)

        // 3. Create company/organization
        await api('/organizations', {
          method: 'POST',
          body: JSON.stringify({
            name: company.trim(),
            description: 'Engineering workspace',
          }),
        })

        // 4. Go to company dashboard
        router.push(base)

        return
      }

      // ----------------------------------------
      // LOGIN
      // ----------------------------------------
      if (!email.trim()) {
        setError('Please enter your email address.')
        return
      }

      if (!password) {
        setError('Please enter your password.')
        return
      }

      const loginResponse = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      })

      // Save JWT
      setToken(loginResponse.token)

      // Load projects after login
      const projectsResponse = await api('/projects')

      if (projectsResponse.projects?.[0]?._id) {
        setProjectId(projectsResponse.projects[0]._id)
      }

      router.push(base)
    } catch (e: any) {
      console.error('Authentication error:', e)
      setError(e?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <a className="auth-return" href="/">
        <ChevronRight className="back-chevron" size={14} />
        Back to CodeMind
      </a>

      <form className="auth-card" onSubmit={submit}>
        <Logo />

        <div className="auth-heading">
          <h1>
            {setup
              ? 'Create your company workspace'
              : 'Welcome back!'}
          </h1>

          <p>
            {setup
              ? 'Create an account and company to start storing engineering memory.'
              : 'Log in to your live engineering workspace.'}
          </p>
        </div>

        {setup ? (
          <>
            {/* NAME */}
            <label>
              Your name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alice Johnson"
                required
              />
            </label>

            {/* EMAIL */}
            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alice@company.com"
                required
              />
            </label>

            {/* PASSWORD */}
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                minLength={8}
                required
              />
            </label>

            {/* COMPANY */}
            <label>
              Company name
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Technologies"
                required
              />
            </label>
          </>
        ) : (
          <>
            {/* LOGIN EMAIL */}
            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alice@company.com"
                required
              />
            </label>

            {/* LOGIN PASSWORD */}
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
              />
            </label>
          </>
        )}

        {error && (
          <p className="auth-error">
            {error}
          </p>
        )}

        <Button type="submit">
          {loading
            ? setup
              ? 'Creating…'
              : 'Logging in…'
            : setup
              ? 'Create company'
              : 'Log in'}

          {!loading && <ArrowRight size={14} />}
        </Button>

        {!setup && (
          <p className="auth-signup">
            Don't have an account?{' '}
            <a href="/company/setup">Sign up</a>
          </p>
        )}
      </form>
    </div>
  )
}

function LandingPage() {
  const code = [
    "import mongoose from 'mongoose'",
    '',
    'const connection = {',
    '  maxPoolSize: 10,',
    '  serverSelectionTimeoutMS: 5000,',
    '}',
    '',
    'export async function connect() {',
    '  await mongoose.connect(process.env.URI)',
    "  console.info('database connected')",
    '}',
  ]
  return (
    <div className="landing-page">
      <header className="landing-nav"><Logo /><nav><a href="#features">Features</a><a href="#how-it-works">How it works</a><a href="#about">About</a></nav><div><Button href="/login" variant="text">Log in</Button><Button href="/company/setup">Get started<ArrowRight size={14} /></Button></div></header>
      <section className="hero"><div className="hero-copy"><span className="announcement"><i />A better way to learn from incidents<ArrowRight size={13} /></span><h1>Your team&apos;s<br /><span>engineering memory.</span></h1><p>Capture what your engineers learn, remember what failed, and reuse your team&apos;s experience when the next incident happens.</p><div className="hero-cta"><Button href="/company/setup">Get started<ArrowRight size={15} /></Button><a href="#how-it-works"><span>▶</span> See how it works</a></div><div className="hero-social"><div className="avatar-stack">{members.map(member => <Avatar key={member.initials} initials={member.initials} color={member.color} />)}</div><span>Built for teams who learn together</span><i /><b>★★★★★</b><span>Engineering-led</span></div></div>
        <div className="hero-visual"><div className="visual-glow" /><div className="code-window"><div className="code-window-top"><span className="window-dots"><i /><i /><i /></span><span><GitBranch size={12} /> main / checkout-service</span><span className="production"><i /> Production</span></div><div className="hero-code"><aside>EXPLORER<br /><br /><span>⌄ src</span><br />　⌄ services<br />　　connection.ts<br />　⌄ checkout<br />　　index.ts</aside><section><div className="code-tab"><FileCode2 size={13} />connection.ts</div>{code.map((line, index) => <div className="hero-code-line" key={index}><span>{index + 1}</span><code>{line || ' '}</code></div>)}</section><aside><div className="assistant-head"><BrainCircuit size={14} />AI Assistant</div><div className="problem-card"><span><ShieldAlert size={13} />Pattern detected</span><small>MongoServerSelectionError</small><small>Connection failed after deployment.</small></div><div className="memory-match"><b>Similar experience found</b><p>MongoDB connection failure</p><strong>92% match</strong></div></aside></div><div className="hero-bottom"><div><span><Users size={15} /></span><span><b>Collaborate</b>with your team</span></div><div><span><ShieldAlert size={15} /></span><span><b>Solve problems</b>faster</span></div><div><span><BrainCircuit size={15} /></span><span><b>Build company</b>knowledge</span></div></div></div></div>
      </section>
      <section className="landing-section" id="features"><div><span className="eyebrow">A BETTER ENGINEERING WORKFLOW</span><h2>Make every incident count.</h2><p>CodeMind connects the way your team builds, fixes, and learns.</p><div className="feature-grid"><article className="feature-card"><span><Code2 size={19} /></span><h3>Stay in the flow</h3><p>Bring your repository, workspace, and proven team context together.</p></article><article className="feature-card"><span><ShieldAlert size={19} /></span><h3>Resolve with context</h3><p>Find similar incidents and understand what your team already tried.</p></article><article className="feature-card"><span><BrainCircuit size={19} /></span><h3>Build shared memory</h3><p>Turn each resolution into searchable knowledge for the whole company.</p></article></div></div></section>
      <section className="landing-section" id="how-it-works"><div><span className="eyebrow">FROM INCIDENT TO INSIGHT</span><h2>Less repeated work. More collective wisdom.</h2><p>Capture the path to a fix once, then make it useful across your projects.</p></div></section>
      <footer className="landing-footer" id="about"><Logo /><span>Better development. Stronger teams. Smarter companies.</span><span>© 2026 CodeMind</span></footer>
    </div>
  )
}

export default function CodeMindApp() {
  const path = usePathname() || '/'
  const normalized = path.replace(/\/$/, '') || '/'
  const project = normalized.startsWith(projectPath)
  const incidentId = normalized.split('/').at(-1) || ''
  const page = useMemo(() => {
    if (normalized === '/login') return <AuthPage />
    if (normalized === '/company/setup') return <AuthPage setup />
    if (normalized === '/') return <LandingPage />
    if (normalized === base) return <CompanyHome />
    if (normalized === `${base}/projects`) return <ProjectsPage />
    if (normalized === `${base}/projects/new`) return <CreateProject />
    if (normalized === projectPath) return <ProjectOverview />
    if (normalized === `${projectPath}/incidents`) return <IncidentsPage />
    if (normalized.startsWith(`${projectPath}/incidents/`)) return <IncidentDetail id={incidentId} />
    if (normalized === `${projectPath}/memory` || normalized.startsWith(`${projectPath}/memory/`)) return <MemoryPage />
    if (normalized === `${projectPath}/workspace`) return <WorkspacePage />
    if (normalized === `${projectPath}/team`) return <TeamPage />
    const title = normalized.split('/').at(-1)?.replaceAll('-', ' ').replace(/\b\w/g, char => char.toUpperCase()) || 'Workspace'
    return <SimplePage title={title} />
  }, [incidentId, normalized])

  if (normalized === '/' || normalized === '/login' || normalized === '/company/setup') return page
  return <AppShell path={normalized}>{page}</AppShell>
}
