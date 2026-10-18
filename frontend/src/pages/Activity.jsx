import { useEffect, useState } from 'react';
import { Activity as ActivityIcon } from 'lucide-react';
import { activityApi } from '../api/endpoints';
import { useOrganization } from '../contexts/OrganizationContext';
import { Alert, Empty, Loading, Pagination } from '../components/UI';
import { getError, items } from '../api/client';
export default function Activity() {
  const {slug}=useOrganization();const [page,setPage]=useState(1);const [data,setData]=useState(null);const [error,setError]=useState('');
  useEffect(()=>{setData(null);activityApi(slug,{page}).then(r=>setData(r.data)).catch(e=>setError(getError(e)));},[slug,page]);
  const verb=(a)=>a.split('.').join(' · ').replaceAll('_',' ');
  return <><div className="page-heading"><div><span className="form-kicker">TEAM TIMELINE</span><h1>Activity log</h1><p>A clear record of the important actions across your workspace.</p></div></div><Alert message={error}/>{!data?<Loading/>:items(data).length===0?<Empty icon={ActivityIcon} title="No activity yet" subtitle="Important workspace changes will appear here."/>:<section className="panel activity-panel">{items(data).map(row=><div className="activity-entry" key={row.id}><div className="activity-bubble"><ActivityIcon size={17}/></div><div className="activity-text"><strong>{row.actor_name}</strong> <span>{verb(row.action)}</span><p>{row.details?.title || row.details?.name || row.details?.email || row.details?.user || row.details?.role || ''}</p></div><time>{new Date(row.created_at).toLocaleString()}</time></div>)}</section>}{data&&<Pagination page={page} count={data.count??data.length} onChange={setPage}/>}</>;
}
