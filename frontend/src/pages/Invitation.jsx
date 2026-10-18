import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, UserRoundPlus } from 'lucide-react';
import { api, getError } from '../api/client';
import { Alert } from '../components/UI';
import { Brand } from '../components/Layout';
export default function Invitation() {
  const {token}=useParams();const navigate=useNavigate();const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  const accept=async()=>{setBusy(true);setError('');try{const {data}=await api.post(`/invitations/${encodeURIComponent(token)}/accept/`);navigate(`/org/${data.slug}/dashboard`,{replace:true});}catch(e){setError(getError(e));}finally{setBusy(false);}};
  return <div className="invite-screen"><div className="invite-card"><div className="brand-title dark"><Brand/>teamspace<span>.</span></div><div className="invite-icon"><UserRoundPlus size={28}/></div><h1>You've been invited!</h1><p className="muted">Accept the invitation to join your team's workspace. Make sure you're signed in with the email address that received the invitation.</p><Alert message={error}/><button disabled={busy} onClick={accept} className="button button-primary full">{busy?'Joining…':'Accept invitation'} <ArrowRight size={17}/></button><Link to="/organizations" className="text-link">Back to workspaces</Link></div></div>;
}
