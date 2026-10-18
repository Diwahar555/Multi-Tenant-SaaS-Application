import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck } from 'lucide-react';
import { approvalsApi } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { Alert, Empty, Loading, Pagination, StatusPill } from '../components/UI';
import { getError, items } from '../api/client';

export default function Approvals() {
  const {slug,canWrite}=useOrganization();const {user}=useAuth();const [status,setStatus]=useState('pending');const [page,setPage]=useState(1);const [data,setData]=useState(null);const [error,setError]=useState('');const [revision,reload]=useState(0);
  useEffect(()=>{let live=true;setData(null);approvalsApi.list(slug,{status,page}).then(r=>{if(live)setData(r.data);}).catch(e=>{if(live)setError(getError(e));});return()=>{live=false;};},[slug,status,page,revision]);
  const decide=async(a,result)=>{setError('');const decision_note=window.prompt(`Optional note for ${result} decision:`, '');if(decision_note===null)return;try{await approvalsApi.decide(slug,a.id,{status:result,decision_note});reload(n=>n+1);}catch(e){setError(getError(e));}};
  return <><div className="page-heading"><div><span className="form-kicker">REVIEWS & SIGN-OFFS</span><h1>Approval workflows</h1><p>Review task completion requests, approve or reject, and keep an audit trail.</p></div></div><div className="toolbar"><label>Status <select value={status} onChange={e=>{setPage(1);setStatus(e.target.value);}}><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="superseded">Superseded</option></select></label></div><Alert message={error}/>{!data?<Loading/>:items(data).length===0?<Empty icon={ClipboardCheck} title="Nothing to review" subtitle="Request approvals from approval-required tasks to see them here."/>:<section className="panel"><div className="simple-list">{items(data).map(a=><div className="simple-row approval-row" key={a.id}><div><Link className="text-link" to={`/org/${slug}/tasks/${a.task}`}>{a.task_name}</Link><small>{a.project_name} · Requested by {a.requester_name}</small><small>Approver: {a.approver_name} · {a.request_note||'No note'}</small></div><StatusPill value={a.status}/>{a.status==='pending'&&a.approver===user?.id&&canWrite&&<div className="button-row"><button className="button button-primary small" onClick={()=>decide(a,'approved')}>Approve</button><button className="button button-secondary small" onClick={()=>decide(a,'rejected')}>Reject</button></div>}</div>)}</div></section>}{data&&<Pagination page={page} count={data.count??data.length} onChange={setPage}/>}</>;
}
