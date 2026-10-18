import { useEffect, useState } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Activity, ArrowLeftRight, Bell, Blocks, ChartNoAxesCombined, ChevronDown, FolderKanban, LayoutDashboard, LogOut, Menu, Plus, Settings, Users, X, ListTodo, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { organizationsApi } from '../api/endpoints';
import { items } from '../api/client';
import { Loading, Alert } from './UI';
const links = [
  {path:'dashboard', label:'Overview', icon:LayoutDashboard},
  {path:'projects', label:'Projects', icon:FolderKanban},
  {path:'tasks', label:'Task board', icon:ListTodo},
  {path:'approvals', label:'Approvals', icon:ClipboardCheck},
  {path:'notifications', label:'Notifications', icon:Bell},
  {path:'members', label:'Team members', icon:Users},
  {path:'activity', label:'Activity log', icon:Activity},
  {path:'settings', label:'Settings', icon:Settings},
];
export function Brand() {return <span className="brand-mark"><Blocks size={22} strokeWidth={2.4}/></span>;}
export function ProtectedRoute() { const {user, loading} = useAuth(); const location = useLocation(); if (loading) return <div className="center-screen"><Loading label="Opening your workspace…"/></div>; if (!user) return <NavigateLogin next={location.pathname + location.search}/>; return <Outlet/>; }
function NavigateLogin({next}) {const navigate = useNavigate(); useEffect(() => {navigate(`/login?next=${encodeURIComponent(next)}`, {replace:true});}, [navigate,next]); return null;}
export function OrganizationLayout() {
  const {organization, loading, error, slug} = useOrganization();
  const {user, logout} = useAuth(); const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [orgs, setOrgs] = useState([]);
  useEffect(() => {setOpen(false);setSwitchOpen(false);}, [slug]);
  const openSwitch = async () => {try {const {data} = await organizationsApi.list();setOrgs(items(data));} catch {} setSwitchOpen(x => !x);};
  if (loading) return <div className="center-screen"><Loading/></div>;
  if (error) return <div className="center-screen error-page"><Alert message={error}/><Link to="/organizations" className="button button-primary">Choose a workspace</Link></div>;
  const doLogout = async () => {await logout();navigate('/login');};
  return <div className="app-shell">
    {open && <div className="mobile-shade" onClick={() => setOpen(false)}/>}
    <aside className={`sidebar ${open ? 'sidebar-open':''}`}>
      <div className="sidebar-brand"><Brand/><span>teamspace<span className="brand-dot">.</span></span><button className="mobile-only icon-button" onClick={() => setOpen(false)}><X size={20}/></button></div>
      <div className="workspace-picker">
        <div className="workspace-current" onClick={openSwitch} role="button" tabIndex={0} onKeyDown={e => {if(e.key === 'Enter')openSwitch();}}>
          <span className="workspace-avatar">{organization?.name?.charAt(0).toUpperCase()}</span><div><strong>{organization?.name}</strong><small>{organization?.my_role} workspace</small></div><ChevronDown size={15}/>
        </div>
        {switchOpen && <div className="workspace-menu">{orgs.map(o => <button key={o.id} onClick={() => navigate(`/org/${o.slug}/dashboard`)}>{o.name}</button>)}<Link to="/organizations"><Plus size={14}/> All workspaces</Link></div>}
      </div>
      <div className="nav-caption">WORKSPACE</div>
      <nav className="side-nav">{links.map(({path,label,icon:Icon}) => <NavLink key={path} to={`/org/${slug}/${path}`} className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}><Icon size={19}/>{label}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="help-tile"><ChartNoAxesCombined size={20}/><strong>Stay in sync</strong><p>Everything your team needs to move work forward.</p></div><button onClick={doLogout} className="nav-item logout"><LogOut size={18}/>Sign out</button></div>
    </aside>
    <div className="main-panel"><header className="topbar"><button className="icon-button mobile-only" onClick={() => setOpen(true)}><Menu size={22}/></button><div className="breadcrumb"><span>Workspace</span><span className="slash">/</span><strong>{organization?.name}</strong></div><div className="topbar-right"><Link aria-label="Notifications" title="Notifications" className="topbar-notifications" to={`/org/${slug}/notifications`}><Bell size={19}/></Link><span className="role-pill">{organization?.my_role}</span><span className="user-avatar" title={user?.username}>{(user?.first_name || user?.username || '?').charAt(0).toUpperCase()}</span></div></header><main className="content"><Outlet/></main></div>
  </div>;
}
