import { useEffect, useState } from 'react';
import { ArrowRight, Blocks, Plus, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { organizationsApi } from '../api/endpoints';
import { getError, items } from '../api/client';
import { Alert, Loading, Modal } from '../components/UI';
import { Brand } from '../components/Layout';
export default function Workspaces() {
  const {user,logout} = useAuth(); const navigate = useNavigate();
  const [data,setData] = useState(null);const [modal,setModal] = useState(false);const [name,setName] = useState('');const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  useEffect(() => {organizationsApi.list().then(r => setData(items(r.data))).catch(e=>setError(getError(e)));},[]);
  const create = async e => {e.preventDefault();setError('');setBusy(true);try{const {data} = await organizationsApi.create({name});navigate(`/org/${data.slug}/dashboard`);}catch(e){setError(getError(e));}finally{setBusy(false);}};
  return <div className="workspace-screen"><header className="workspace-top"><Link to="/organizations" className="brand-title dark"><Brand/>teamspace<span>.</span></Link><div className="workspace-account">{user?.username}<button className="button button-secondary" onClick={async()=>{await logout();navigate('/login');}}><LogOut size={16}/> Sign out</button></div></header>
    <div className="workspace-container"><span className="form-kicker">YOUR WORKSPACES</span><h1>Where would you like to work?</h1><p className="muted">Choose an organization to continue, or create a fresh space for your team.</p><Alert message={error}/>{!data ? <Loading/> : <div className="workspace-grid">{data.map(o=><Link className="workspace-card" key={o.slug} to={`/org/${o.slug}/dashboard`}><span className="workspace-card-icon">{o.name.charAt(0).toUpperCase()}</span><strong>{o.name}</strong><small>{o.my_role} · Organization</small><ArrowRight className="workspace-arrow" size={19}/></Link>)}<button onClick={()=>setModal(true)} className="workspace-card workspace-add"><span className="workspace-card-icon add"><Plus size={23}/></span><strong>Create workspace</strong><small>Start something new</small><ArrowRight className="workspace-arrow" size={19}/></button></div>}
      <div className="workspace-footnote"><Blocks size={17}/> Data is isolated between workspaces — only invited members can view a team's work.</div></div>
    {modal && <Modal title="Create a workspace" onClose={()=>setModal(false)}><form onSubmit={create} className="form-stack"><p className="muted">Give your company or team a home in TeamSpace.</p><label>Organization name<input required maxLength={150} autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Acme Studio"/></label><Alert message={error}/><button disabled={busy} className="button button-primary full">{busy?'Creating…':'Create workspace'} <ArrowRight size={17}/></button></form></Modal>}</div>;
}
