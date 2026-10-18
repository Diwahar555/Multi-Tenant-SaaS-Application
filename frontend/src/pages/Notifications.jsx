import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationsApi } from '../api/endpoints';
import { useOrganization } from '../contexts/OrganizationContext';
import { Alert, Empty, Loading, Pagination } from '../components/UI';
import { getError, items } from '../api/client';
export default function Notifications() {
  const {slug}=useOrganization();const [page,setPage]=useState(1);const [data,setData]=useState(null);const [error,setError]=useState('');const [revision,reload]=useState(0);
  useEffect(()=>{let alive=true;setData(null);notificationsApi.list(slug,{page}).then(r=>{if(alive)setData(r.data);}).catch(e=>{if(alive)setError(getError(e));});return()=>{alive=false;};},[slug,page,revision]);
  const run=async(fn)=>{setError('');try{await fn();reload(x=>x+1);}catch(e){setError(getError(e));}};
  return <><div className="page-heading"><div><span className="form-kicker">INBOX</span><h1>Notifications</h1><p>Task assignments, discussion updates, and approval decisions.</p></div><button className="button button-secondary" onClick={()=>run(()=>notificationsApi.readAll(slug))}><CheckCheck size={16}/> Mark all as read</button></div><Alert message={error}/>{!data?<Loading/>:items(data).length===0?<Empty icon={Bell} title="You're all caught up" subtitle="Your new notifications will show up here."/>:<section className="panel"><div className="panel-heading"><h2>{data.unread_count} unread</h2></div><div className="simple-list">{items(data).map(n=><div className={`simple-row notification-row ${n.read_at?'':'unread'}`} key={n.id}><div><strong>{n.title}</strong><small>{n.message}</small><small>{new Date(n.created_at).toLocaleString()}</small>{n.path?.startsWith(`/org/${slug}/`)&&<Link className="text-link" to={n.path}>View task / review</Link>}</div>{!n.read_at&&<button className="button button-secondary small" onClick={()=>run(()=>notificationsApi.update(slug,n.id,true))}>Mark read</button>}</div>)}</div></section>}{data&&<Pagination page={page} count={data.count??data.length} onChange={setPage}/>}</>;
}
