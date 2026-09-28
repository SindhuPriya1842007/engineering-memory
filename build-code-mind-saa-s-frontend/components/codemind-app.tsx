'use client'

import { useMemo, useState, type ReactNode } from 'react'
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

const projects: Project[] = [
  { name: 'E-Commerce Platform', summary: 'Online shopping, payments, and order management.', members: 8, incidents: 24, memories: 142, mark: 'EC', tone: 'violet' },
  { name: 'AI Assistant', summary: 'A thoughtful AI companion for every customer.', members: 5, incidents: 12, memories: 86, mark: 'AI', tone: 'blue' },
  { name: 'Mobile App', summary: 'A seamless shopping experience, wherever you are.', members: 6, incidents: 18, memories: 64, mark: 'MB', tone: 'mint' },
  { name: 'Internal Tools', summary: 'Tools that help our team do its best work.', members: 4, incidents: 9, memories: 38, mark: 'IT', tone: 'amber' },
]

const incidents: Incident[] = [
  { id: 'INC-042', title: 'MongoDB connection error', status: 'Resolved', owner: 'Alice Johnson', initials: 'AJ', age: '2h ago', service: 'Checkout API', match: 92 },
  { id: 'INC-041', title: 'API timeout error', status: 'Investigating', owner: 'Bob Smith', initials: 'BS', age: '4h ago', service: 'Orders API', match: 84 },
  { id: 'INC-039', title: 'Build failure on main', status: 'Open', owner: 'Charlie Davis', initials: 'CD', age: '6h ago', service: 'Web app', match: 65 },
  { id: 'INC-038', title: 'JWT authentication issue', status: 'Resolved', owner: 'Alice Johnson', initials: 'AJ', age: 'Yesterday', service: 'Auth service', match: 71 },
  { id: 'INC-037', title: 'Payment webhook retries', status: 'Resolved', owner: 'David Wilson', initials: 'DW', age: '2d ago', service: 'Payments', match: 58 },
]

const memories = [
  { id: 'INC-184', title: 'MongoDB connection failure', match: 92, service: 'Checkout API', lesson: 'Network access restrictions can look exactly like a bad connection string.', attempts: '3 attempts' },
  { id: 'INC-037', title: 'JWT authentication issue', match: 71, service: 'Auth service', lesson: 'Check clock drift before rotating signing keys.', attempts: '4 attempts' },
  { id: 'INC-036', title: 'React build failure', match: 65, service: 'Web app', lesson: 'A stale lockfile caused the dependency tree mismatch.', attempts: '2 attempts' },
]

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
  return (
    <>
      <Title eyebrow="COMPANY WORKSPACE" title="Good morning, Alice" sub="Here's what's happening across your engineering team." action={<><Button variant="secondary"><Users size={15} />Invite member</Button><Button href={`${base}/projects/new`}><Plus size={15} />Create project</Button></>} />
      <section className="company-banner">
        <span className="company-banner-icon">A</span>
        <div className="company-banner-copy"><h2>Acme Technologies</h2><p>Shared engineering knowledge across your organization.</p></div>
        <span className="banner-stat"><b>24</b><small>Members</small></span><span className="banner-stat"><b>6</b><small>Projects</small></span>
        <a href={`${base}/members`}>Manage company<ArrowRight size={14} /></a>
      </section>
      <section className="section-block">
        <PanelHeading title="Recent projects" action={<a className="subtle-link" href={`${base}/projects`}>View all projects<ArrowRight size={14} /></a>} />
        <div className="project-grid">{projects.map(project => <ProjectCard key={project.name} project={project} compact />)}</div>
      </section>
      <div className="home-lower">
        <section className="panel"><PanelHeading title="Recent activity" action={<a className="subtle-link" href={`${projectPath}/activity`}>View activity</a>} /><ActivityFeed /></section>
        <section className="memory-promo">
          <div className="promo-orb"><BrainCircuit size={20} /></div><span className="eyebrow">COMPANY ENGINEERING MEMORY</span>
          <h2>Every incident leaves your team a little wiser.</h2><p>142 experiences captured across your active projects.</p>
          <a href={`${projectPath}/memory`}>Browse engineering memory<ArrowRight size={14} /></a>
          <div className="spark-bars">{[20, 30, 24, 39, 34, 47, 40, 58, 52, 65, 56, 80, 70, 94, 86].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div>
        </section>
      </div>
    </>
  )
}

function ProjectsPage() {
  const [query, setQuery] = useState('')
  const filtered = projects.filter(project => project.name.toLowerCase().includes(query.toLowerCase()))
  return (
    <>
      <Title eyebrow="ACME TECHNOLOGIES" title="Projects" sub="All engineering projects in your company." action={<Button href={`${base}/projects/new`}><Plus size={15} />Create project</Button>} />
      <div className="toolbar"><label className="search-input"><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search projects..." /></label><button className="filter-button"><ChevronDown size={14} />All projects</button><span className="result-count">{filtered.length} projects</span></div>
      <div className="project-grid projects-page-grid">{filtered.map(project => <ProjectCard key={project.name} project={project} />)}</div>
    </>
  )
}

function ProjectOverview() {
  const metrics = [
    { label: 'Total incidents', value: '24', note: 'Across all environments', Icon: ShieldAlert, tone: 'blue' },
    { label: 'Resolved', value: '18', note: '75% resolution rate', Icon: CheckCircle2, tone: 'green' },
    { label: 'Investigating', value: '3', note: 'Active right now', Icon: Search, tone: 'amber' },
    { label: 'Open', value: '3', note: 'Awaiting investigation', Icon: Clock3, tone: 'rose' },
  ]
  return (
    <>
      <Title eyebrow="PROJECT OVERVIEW" title="E-Commerce Platform" sub="A shared view of incidents, activity, and engineering memory." action={<><Button variant="secondary"><GitBranch size={14} />main</Button><Button href={`${projectPath}/workspace`}><Code2 size={15} />Open workspace</Button></>} />
      <div className="project-summary"><span className="project-mark tone-violet">EC</span><div><b>Acme Technologies <ChevronRight size={12} /> E-Commerce Platform</b><small>Online shopping, payments, and order management.</small></div><span className="banner-stat"><b>8</b><small>Members</small></span><span className="banner-stat"><b>24</b><small>Incidents</small></span><span className="banner-stat"><b>142</b><small>Memories</small></span></div>
      <div className="metric-grid">{metrics.map(({ label, value, note, Icon, tone }) => <div className="metric-card" key={label}><span className={`metric-icon ${tone}`}><Icon size={17} /></span><b>{value}</b><strong>{label}</strong><small>{note}</small></div>)}</div>
      <div className="overview-lower"><section className="panel"><PanelHeading title="Recent activity" action={<a className="subtle-link" href={`${projectPath}/activity`}>View all<ArrowRight size={13} /></a>} /><ActivityFeed /></section><section className="panel memory-insight"><span className="promo-orb"><BrainCircuit size={18} /></span><span className="eyebrow">TEAM KNOWLEDGE</span><h2>Engineering memory</h2><p>Experiences that help your team avoid repeating the same investigation.</p><div className="insight-stats"><span><b>142</b><small>experiences</small></span><span><b>37</b><small>reused this month</small></span></div><a href={`${projectPath}/memory`}>Browse team memory<ArrowRight size={14} /></a></section></div>
    </>
  )
}

function IncidentsPage() {
  const [tab, setTab] = useState('All')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All statuses')
  const shown = incidents.filter(incident =>
    (tab === 'All' || incident.status === tab)
    && (status === 'All statuses' || incident.status === status)
    && `${incident.title} ${incident.id} ${incident.owner}`.toLowerCase().includes(query.toLowerCase()),
  )
  return (
    <>
      <Title eyebrow="E-COMMERCE PLATFORM" title="Incidents" sub="Investigate production issues and preserve what your team learns." action={<Button><Plus size={15} />New incident</Button>} />
      <div className="incident-alert"><span><i /> <b>3</b> incidents need attention</span><small>Last updated just now</small></div>
      <div className="tabs">{['All', 'Open', 'Investigating', 'Resolved'].map(tabName => <button key={tabName} onClick={() => setTab(tabName)} className={tab === tabName ? 'active' : ''}>{tabName}<span>{tabName === 'All' ? 24 : tabName === 'Open' || tabName === 'Investigating' ? 3 : 18}</span></button>)}</div>
      <div className="toolbar"><label className="search-input"><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search incidents..." /></label><select value={status} onChange={event => setStatus(event.target.value)}><option>All statuses</option><option>Open</option><option>Investigating</option><option>Resolved</option></select><button className="filter-button">Filters</button><span className="result-count">{shown.length} incidents</span></div>
      <div className="table-wrap"><table><thead><tr><th>INCIDENT</th><th>STATUS</th><th>ASSIGNEE</th><th>SERVICE</th><th>CREATED</th><th>MEMORY MATCH</th><th /></tr></thead><tbody>{shown.map(incident => <tr key={incident.id}><td><a className="incident-name" href={`${projectPath}/incidents/${incident.id}`}><small>{incident.id}</small><b>{incident.title}</b></a></td><td><Status value={incident.status} /></td><td><span className="assignee"><Avatar initials={incident.initials} />{incident.owner}</span></td><td>{incident.service}</td><td>{incident.age}</td><td><span className="match-value"><i style={{ background: `linear-gradient(to right, #6b60ed ${incident.match}%, #ececf8 ${incident.match}%)` }} />{incident.match}%</span></td><td><a className="row-arrow" href={`${projectPath}/incidents/${incident.id}`} aria-label={`Open ${incident.id}`}><ArrowUpRight size={15} /></a></td></tr>)}</tbody></table></div>
    </>
  )
}

function MemoryPage() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All experiences')
  const filtered = memories.filter(memory => `${memory.title} ${memory.lesson}`.toLowerCase().includes(query.toLowerCase()))
  return (
    <>
      <Title eyebrow="E-COMMERCE PLATFORM" title="Engineering memory" sub="What your team has learned, ready to help the next person." action={<Button variant="secondary">Filters<ChevronDown size={14} /></Button>} />
      <div className="memory-search-box"><span className="memory-search-icon"><BrainCircuit size={20} /></span><div><b>Search your team's experience</b><small>Find incidents, failed approaches, and proven resolutions.</small></div><label className="search-input"><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search engineering memory..." /></label></div>
      <div className="memory-filters">{['All experiences', 'Incidents', 'Architecture', 'Deployments', 'Failures', 'Resolutions'].map(name => <button key={name} onClick={() => setFilter(name)} className={filter === name ? 'selected' : ''}>{name}</button>)}</div>
      <div className="memory-columns"><section><div className="memory-list-head"><b>{filtered.length} experiences</b><button>Most relevant<ChevronDown size={13} /></button></div>{filtered.map(memory => <article className="memory-card" key={memory.id}><div className="memory-card-top"><span><BrainCircuit size={13} /> INCIDENT EXPERIENCE</span><span className="match-pill">{memory.match}% match<ArrowUpRight size={12} /></span></div><a className="memory-card-title" href={`${projectPath}/memory/${memory.id}`}>{memory.title}<ArrowUpRight size={14} /></a><div className="memory-meta">{memory.id}<i /> {memory.service}<i /> {memory.attempts}</div><div className="lesson"><BookOpen size={14} /><p><b>Key lesson</b>{memory.lesson}</p></div><div className="memory-card-footer"><span><CheckCircle2 size={13} /> Resolved</span><small>Updated 2 days ago</small><a href={`${projectPath}/memory/${memory.id}`}>View experience<ArrowRight size={13} /></a></div></article>)}</section><aside className="memory-aside"><section className="panel"><PanelHeading title="Most referenced" />{memories.map((memory, index) => <a href={`${projectPath}/memory/${memory.id}`} className="rank-row" key={memory.id}><span>0{index + 1}</span><b>{memory.title}<small>Referenced in {8 - index * 2} investigations</small></b></a>)}</section><section className="panel"><PanelHeading title="Your team is learning" /><p>Engineering memory grows with every incident your team investigates and resolves.</p><Button href={`${projectPath}/incidents`} variant="secondary">Explore incidents<ArrowRight size={13} /></Button></section></aside></div>
    </>
  )
}

function IncidentDetail({ id }: { id: string }) {
  const record = incidents.find(incident => incident.id === id) || incidents[0]
  const [tab, setTab] = useState('Overview')
  const [memoryLoading, setMemoryLoading] = useState(false)
  const [memoryChecked, setMemoryChecked] = useState(false)

  function checkMemory() {
    setMemoryLoading(true)
    setMemoryChecked(false)
    window.setTimeout(() => {
      setMemoryLoading(false)
      setMemoryChecked(true)
    }, 700)
  }

  return (
    <>
      <div className="back-row"><a href={`${projectPath}/incidents`}><ChevronRight className="back-chevron" size={14} />All incidents</a><span>/</span><span>{record.id}</span><Button variant="secondary">Mark resolved<Check size={14} /></Button></div>
      <Title eyebrow="INCIDENT DETAIL" title={<>{record.id} <span className="title-muted">—</span> {record.title}</>} sub="A complete record of what happened, what was tried, and what worked." action={<Status value={record.status} />} />
      <div className="incident-metadata">{[['SERVICE', record.service], ['ENVIRONMENT', 'Production'], ['DEPLOYMENT', 'v3.1.0 · 5f2a9c1'], ['ASSIGNEE', record.owner], ['CREATED', record.age]].map(([label, value]) => <div key={label}><small>{label}</small><b>{value}</b></div>)}</div>
      <div className="tabs detail-tabs">{['Overview', 'Attempts', 'Logs', 'Related memory'].map(name => <button key={name} className={name === tab ? 'active' : ''} onClick={() => setTab(name)}>{name}</button>)}</div>
      <div className="detail-grid"><div><section className="panel detail-panel"><PanelHeading title={tab === 'Overview' ? 'Problem' : tab} /><p>The application began failing to establish a connection to MongoDB after the latest production deployment. Requests to the checkout service timed out and returned a server selection error.</p><div className="detail-tags"><span><Database size={13} />MongoDB Atlas</span><span><Code2 size={13} />Node.js service</span><span>Production</span></div></section><section className="panel detail-panel"><PanelHeading title="Investigation timeline" /><div className="timeline"><div><i className="fail"><X size={12} /></i><p><b>Changed connection string</b><small>Verified the URI and credentials against the production secret store.</small></p><Status value="Open" /></div><div><i className="fail"><X size={12} /></i><p><b>Restarted application</b><small>Restarted the checkout API to refresh its connection pool.</small></p><Status value="Open" /></div><div><i className="success"><Check size={12} /></i><p><b>Updated network access rules</b><small>Added the production egress IP to MongoDB Atlas access rules.</small></p><Status value="Resolved" /></div></div></section></div><aside className="detail-side"><section className="panel"><h3>Resolution</h3><p>Updated MongoDB network access rules to allow the production egress IP. Connection pool recovered without a code change.</p><Status value="Resolved" /></section><section className="panel"><h3>Related memory</h3><a className="rank-row" href={`${projectPath}/memory/INC-184`}><span><BrainCircuit size={15} /></span><b>MongoDB connection failure<small>92% similar · 3 attempts</small></b></a></section></aside></div>
      <section className="panel incident-memory-panel" aria-labelledby="incident-memory-title">
        <div className="incident-memory-heading"><div><span className="memory-search-icon"><BrainCircuit size={18} /></span><div><span className="eyebrow">INCIDENT → EXPERIENCE</span><h2 id="incident-memory-title">Engineering Memory</h2><p>Search past team experience before repeating an investigation.</p></div></div><button className="button button-primary" onClick={checkMemory} disabled={memoryLoading}>{memoryLoading ? 'Searching memory…' : 'Check Engineering Memory'}<ArrowRight size={14} /></button></div>
        {memoryLoading && <p className="memory-checking"><span />Searching your organization&apos;s engineering memory...</p>}
        {memoryChecked && <div className="memory-result-note"><CheckCircle2 size={15} />Engineering Memory found one highly similar incident and identified a database-version difference.</div>}
        <div className="incident-memory-grid">
          <article><span className="memory-section-label">PREVIOUS SIMILAR INCIDENT</span><a href={`${projectPath}/memory/INC-184`}><b>INC-184 · MongoDB Connection Failure</b><span>92% similarity · Checkout API</span></a></article>
          <article><span className="memory-section-label">PREVIOUS APPROACHES</span><p><i className="memory-failed">×</i> Changed connection string <i className="memory-failed">×</i> Restarted application</p><p><i className="memory-succeeded">✓</i> Updated MongoDB network access</p></article>
          <article><span className="memory-section-label">ENVIRONMENT DIFFERENCES</span><p>Previous: MongoDB 6 · Node.js 18</p><p>Current: MongoDB 7 · Node.js 18</p></article>
          <article><span className="memory-section-label">ROOT CAUSE &amp; RESOLUTION</span><p>Network access restriction on the MongoDB Atlas cluster.</p><p>Allow-listed the production egress IP; the connection pool recovered.</p></article>
        </div>
        <div className="incident-memory-footer"><span><ArrowDownRight size={14} />Developer investigates and records the final experience</span><a href={`${projectPath}/memory/INC-184`}>View saved experience<ArrowRight size={13} /></a></div>
      </section>
    </>
  )
}

function WorkspacePage() {
  const [activeFile, setActiveFile] = useState('src/services/db.ts')
  const [openFiles, setOpenFiles] = useState(['src/services/db.ts', 'src/app.ts'])
  const [scenario, setScenario] = useState<'similar' | 'related' | 'new'>('similar')
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [terminalOpen, setTerminalOpen] = useState(true)

  const fileContents: Record<string, string> = {
    'src/app.ts': "import express from 'express'\nimport { connectDatabase } from './services/db'\nimport { registerRoutes } from './components/routes'\n\nconst app = express()\napp.use(express.json())\n\nasync function startServer() {\n  await connectDatabase()\n  registerRoutes(app)\n  app.listen(process.env.PORT ?? 3000)\n}\n\nstartServer().catch(console.error)",
    'src/db.ts': "export { connectDatabase } from './services/db'\nexport { createConnectionOptions } from './utils/database'",
    'src/auth.ts': "import jwt from 'jsonwebtoken'\n\nexport function createSession(userId: string) {\n  return jwt.sign({ sub: userId }, process.env.JWT_SECRET!, {\n    expiresIn: '12h',\n    issuer: 'acme-api',\n  })\n}\n\nexport function verifySession(token: string) {\n  return jwt.verify(token, process.env.JWT_SECRET!)\n}",
    'src/services/db.ts': "import mongoose from 'mongoose'\n\nconst options = {\n  maxPoolSize: 10,\n  serverSelectionTimeoutMS: 5000,\n  socketTimeoutMS: 45000,\n}\n\nexport async function connectDatabase() {\n  try {\n    await mongoose.connect(process.env.MONGO_URI!, options)\n    console.log(\"Database connected\")\n  } catch (error) {\n    console.error(\"MongoDB connection failed\", error)\n    throw error\n  }\n}",
    'src/services/checkout.ts': "import { Order } from '../models/order'\nimport { paymentService } from './payments'\n\nexport async function createCheckout(userId: string) {\n  const order = await Order.findOne({ userId, status: 'draft' })\n  if (!order) throw new Error('No active order')\n\n  const payment = await paymentService.charge(order)\n  order.status = 'paid'\n  await order.save()\n  return { order, payment }\n}",
    'src/utils/database.ts': "import type { ConnectOptions } from 'mongoose'\n\nexport function createConnectionOptions(): ConnectOptions {\n  return {\n    maxPoolSize: 10,\n    serverSelectionTimeoutMS: 5000,\n    retryWrites: true,\n  }\n}",
    'tests/database.test.ts': "import { describe, expect, it } from 'vitest'\nimport { createConnectionOptions } from '../src/utils/database'\n\ndescribe('database options', () => {\n  it('uses a bounded connection pool', () => {\n    expect(createConnectionOptions().maxPoolSize).toBe(10)\n  })\n})",
    'package.json': '{\n  "name": "acme-checkout-api",\n  "scripts": {\n    "dev": "tsx watch src/app.ts",\n    "test": "vitest run"\n  },\n  "dependencies": {\n    "mongoose": "^8.9.0",\n    "express": "^4.21.0"\n  }\n}',
    'README.md': '# Acme Checkout API\n\nNode.js service for checkout, orders, and payments.\n\n## Development\n\n1. Set MONGO_URI in your environment.\n2. Run npm run dev.\n3. Run npm test before opening a pull request.',
  }
  const [source, setSource] = useState((fileContents[activeFile] || '// Select a file to inspect').split('\n'))
  const activeLine = source.findIndex(line => line.includes('mongoose.connect') || line.includes('Database connected'))

  function selectFile(file: string) {
    setActiveFile(file)
    setOpenFiles(current => current.includes(file) ? current : [...current, file])
  }

  function checkMemory() {
    setSearched(false)
    setSearching(true)
    window.setTimeout(() => {
      setSearching(false)
      setSearched(true)
    }, 800)
  }

  function renderCode(line: string) {
    const tokens = line.split(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b(?:import|from|export|async|await|const|function|return|try|catch|throw|new|if|else|type|interface)\b|\b\d+\b|\b(?:true|false|null|undefined)\b)/g)
    return tokens.map((token, index) => {
      const className = /^("|')/.test(token) || token.startsWith('`') ? 'syntax-string' : /^(import|from|export|async|await|const|function|return|try|catch|throw|new|if|else|type|interface)$/.test(token) ? 'syntax-keyword' : /^\d+$/.test(token) ? 'syntax-number' : /^(true|false|null|undefined)$/.test(token) ? 'syntax-literal' : ''
      return className ? <span className={className} key={`${index}-${token}`}>{token}</span> : <span key={`${index}-${token}`}>{token || ' '}</span>
    })
  }

  const scenarios = [
    { id: 'similar', label: 'Similar issue' },
    { id: 'related', label: 'Related issue' },
    { id: 'new', label: 'New issue' },
  ] as const

  return (
    <div className="workspace-page">
      <div className="workspace-heading"><div><span className="eyebrow">E-COMMERCE PLATFORM / WORKSPACE</span><h1>Developer workspace</h1><p>Explore code with your team&apos;s engineering experience close at hand.</p></div><div><Button variant="secondary"><GitBranch size={14} />main<ChevronDown size={13} /></Button><Button variant="secondary">Repository<ArrowUpRight size={14} /></Button></div></div>
      <div className="ide-window">
        <div className="ide-top"><span className="window-dots"><i /><i /><i /></span><span><Code2 size={13} /> ecommerce-platform</span><span className="ide-branch"><GitBranch size={12} /> main <span className="ide-separator">/</span> TypeScript</span></div>
        <div className="ide-body">
          <aside className="file-tree" aria-label="Project file explorer"><div className="explorer-heading"><b>EXPLORER</b><button aria-label="Project files"><MoreHorizontal size={14} /></button></div><span className="tree-root">⌄ ECOMMERCE-PLATFORM</span><span className="tree-folder">⌄ src</span><span className="tree-folder tree-nested">⌄ components</span><span className="tree-folder tree-nested">⌄ services</span><button className={`tree-file ${activeFile === 'src/services/db.ts' ? 'selected' : ''}`} onClick={() => selectFile('src/services/db.ts')}><FileCode2 size={13} />db.ts</button><button className={`tree-file ${activeFile === 'src/services/checkout.ts' ? 'selected' : ''}`} onClick={() => selectFile('src/services/checkout.ts')}><FileCode2 size={13} />checkout.ts</button><span className="tree-folder tree-nested">⌄ utils</span><button className={`tree-file ${activeFile === 'src/utils/database.ts' ? 'selected' : ''}`} onClick={() => selectFile('src/utils/database.ts')}><FileCode2 size={13} />database.ts</button>{['src/app.ts', 'src/db.ts', 'src/auth.ts'].map(file => <button key={file} className={`tree-file ${activeFile === file ? 'selected' : ''}`} onClick={() => selectFile(file)}><FileCode2 size={13} />{file.split('/').pop()}</button>)}<span className="tree-folder">⌄ tests</span><button className={`tree-file ${activeFile === 'tests/database.test.ts' ? 'selected' : ''}`} onClick={() => selectFile('tests/database.test.ts')}><FileCode2 size={13} />database.test.ts</button>{['package.json', 'README.md'].map(file => <button key={file} className={`tree-file ${activeFile === file ? 'selected' : ''}`} onClick={() => selectFile(file)}><FileCode2 size={13} />{file}</button>)}</aside>
          <section className="editor-column" aria-label="Code editor">
            <div className="editor-tabs" role="tablist" aria-label="Open files">{openFiles.map(file => <button key={file} role="tab" aria-selected={activeFile === file} className={`editor-tab ${activeFile === file ? 'active' : ''}`} onClick={() => setActiveFile(file)}><FileCode2 size={12} />{file.split('/').pop()}</button>)}</div>
            <div className="code-viewport" role="region" aria-label={`${activeFile} source code`}><div className="editor-breadcrumb"><span>src</span><ChevronRight size={11} /><span>{activeFile.split('/').slice(1, -1).join('/') || 'root'}</span><ChevronRight size={11} /><b>{activeFile.split('/').pop()}</b></div>
            <div className="code-editor"> <textarea
    className="code-input"
    value={source.join('\n')}
    onChange={(e) => setSource(e.target.value.split('\n'))}
    spellCheck={false}
  /> </div> 
            </div>
            <section className={`terminal ${terminalOpen ? '' : 'terminal-collapsed'}`} aria-label="Terminal"><div className="terminal-head"><span><Command size={12} /> TERMINAL <small>npm run dev</small></span><button onClick={() => setTerminalOpen(open => !open)} aria-expanded={terminalOpen}>{terminalOpen ? 'Hide terminal' : 'Show terminal'}<ChevronDown className={terminalOpen ? '' : 'terminal-expand-icon'} size={13} /></button></div>{terminalOpen && <div className="terminal-output"><code><span>$ npm run dev</span><span className="terminal-success">✓ Starting development server...</span><span className="terminal-error">Error: MongoServerSelectionError</span><span className="terminal-error">MongoNetworkError: connection refused</span><span className="terminal-prompt">$ <i /></span></code></div>}</section>
          </section>
          <aside className="ai-panel memory-ai-panel" aria-label="Engineering Memory"><div className="memory-panel-title"><BrainCircuit size={16} /><b>Engineering Memory</b><span className="prototype-label">DEMO</span></div><div className="scenario-control"><span>Test scenario</span><div role="group" aria-label="Engineering memory test scenario">{scenarios.map(option => <button key={option.id} className={scenario === option.id ? 'selected' : ''} aria-pressed={scenario === option.id} onClick={() => { setScenario(option.id); setSearched(false) }}>{option.label}</button>)}</div></div><div className="problem-callout"><ShieldAlert size={15} /><div><small>PROBLEM DETECTED</small><b>MongoDB connection failed</b></div></div><button className="memory-search-button" onClick={checkMemory} disabled={searching}>{searching ? <><span className="loading-dot" />Searching...</> : 'Check Engineering Memory'}<ArrowRight size={13} /></button>
            {searching && <div className="memory-loading" role="status"><span className="loading-spinner" />Searching your organization&apos;s engineering memory...</div>}
            {searched && scenario === 'similar' && <div className="memory-outcome similar-outcome"><div className="outcome-heading"><CheckCircle2 size={15} /><b>Similar engineering experience found</b></div><div className="match-score"><strong>92%</strong><span>match</span></div><a className="outcome-incident" href={`${projectPath}/memory/INC-184`}><span>INC-184</span><b>MongoDB Connection Failure</b><ArrowUpRight size={13} /></a><div className="approach-list"><small>PREVIOUS INVESTIGATION</small><p className="failed-approach">× Changed connection string</p><p className="failed-approach">× Restarted application</p><p className="successful-approach">✓ Updated MongoDB network access</p></div><div className="environment-diff"><b>Current environment differs</b><div><span>Previous</span><span>MongoDB 6 · Node.js 18</span></div><div><span>Current</span><span>MongoDB 7 · Node.js 18</span></div></div><p className="memory-warning">The previous incident was highly similar, but the database version differs. Verify compatibility and network access before applying the previous resolution.</p><a className="memory-view-link" href={`${projectPath}/memory/INC-184`}>View Experience<ArrowRight size={13} /></a></div>}
            {searched && scenario === 'related' && <div className="memory-outcome related-outcome"><div className="outcome-heading"><BrainCircuit size={15} /><b>Related engineering experience found</b></div><div className="match-score"><strong>68%</strong><span>match</span></div><p className="related-copy">Your organization has encountered MongoDB connectivity problems before, but this incident is not sufficiently similar to a previous incident.</p><div className="related-list"><a href={`${projectPath}/memory/INC-184`}><b>INC-184 · MongoDB Connection Failure</b><span>Checkout API · Network access</span></a><a href={`${projectPath}/memory/INC-038`}><b>INC-038 · JWT authentication issue</b><span>Auth service · Environment configuration</span></a><a href={`${projectPath}/memory/INC-041`}><b>INC-041 · API timeout error</b><span>Orders API · Connection pool</span></a></div><a className="memory-view-link" href={`${projectPath}/memory`}>View Related Memory<ArrowRight size={13} /></a></div>}
            {searched && scenario === 'new' && <div className="memory-outcome new-outcome"><div className="outcome-heading"><CheckCircle2 size={15} /><b>No previous experience found</b></div><p>This appears to be a new issue for your organization.</p><p>Engineering Memory could not find a sufficiently similar previous incident.</p><a className="memory-view-link" href={`${projectPath}/incidents`}>Start Investigation<ArrowRight size={13} /></a></div>}
            {!searched && !searching && <div className="memory-empty-hint"><span>Choose a demo scenario, then check your team&apos;s saved experience.</span></div>}
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
  const router = useRouter()
  return (
    <>
      <Title eyebrow="ACME TECHNOLOGIES / PROJECTS" title="Create a project" sub="Set up a dedicated workspace for your engineering team." />
      <form className="create-form" onSubmit={event => { event.preventDefault(); router.push(projectPath) }}>
        <div className="form-step"><i>1</i><span><b>Project details</b><small>Give your project a name and tell your team what it's about.</small></span></div>
        <label>Project name<input defaultValue="E-Commerce Platform" required /></label>
        <label>Description<textarea defaultValue="Online shopping platform with modern payment and order management." rows={3} /></label>
        <div className="form-two"><label>Tech stack<select defaultValue="MERN"><option>MERN</option><option>Next.js + PostgreSQL</option><option>Python + FastAPI</option></select></label><label>Repository URL<input defaultValue="https://github.com/acme/ecommerce" /></label></div>
        <div className="form-step"><i>2</i><span><b>Invite your team</b><small>Choose the people who should have access to this project.</small></span></div>
        <div className="invite-pills">{members.slice(0, 3).map(member => <label key={member.initials}><input type="checkbox" defaultChecked /><Avatar initials={member.initials} color={member.color} />{member.name.split(' ')[0]}<small>{member.access}</small></label>)}</div>
        <div className="form-footer"><Button href={`${base}/projects`} variant="secondary">Cancel</Button><Button type="submit">Create project<ArrowRight size={14} /></Button></div>
      </form>
    </>
  )
}

function AuthPage({ setup = false }: { setup?: boolean }) {
  const [tab, setTab] = useState('create')
  const router = useRouter()
  return (
    <div className="auth-page"><a className="auth-return" href="/"><ChevronRight className="back-chevron" size={14} />Back to CodeMind</a><form className="auth-card" onSubmit={event => { event.preventDefault(); router.push(base) }}><Logo /><div className="auth-heading"><h1>{setup ? 'Create or join a company' : 'Welcome back!'}</h1><p>{setup ? 'Start collaborating with your team.' : 'Log in to continue to your workspace.'}</p></div>{setup && <div className="auth-tabs"><button type="button" onClick={() => setTab('create')} className={tab === 'create' ? 'selected' : ''}>Create company</button><button type="button" onClick={() => setTab('join')} className={tab === 'join' ? 'selected' : ''}>Join company</button></div>}{setup && tab === 'create' && <label>Company name<input defaultValue="Acme Technologies" required /></label>}{setup && tab === 'create' && <label>Company description<textarea defaultValue="Building innovative solutions together." rows={2} /></label>}{setup && tab === 'join' && <label>Invitation link<input placeholder="Paste your invitation link" required /></label>}{!setup && <><label>Email address<input type="email" placeholder="you@company.com" required /></label><label>Password<input type="password" placeholder="Enter your password" required /></label><div className="auth-forgot"><label><input type="checkbox" /> Remember me</label><a href="#forgot">Forgot password?</a></div></>}<Button type="submit">{setup ? (tab === 'create' ? 'Create company' : 'Join company') : 'Log in'}<ArrowRight size={14} /></Button>{!setup && <p className="auth-signup">Don&apos;t have an account? <a href="/company/setup">Sign up</a></p>}</form></div>
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
