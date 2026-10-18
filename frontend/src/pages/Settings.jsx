import { useState } from 'react';
import { Building2, Shield, UserRound } from 'lucide-react';
import { useOrganization } from '../contexts/OrganizationContext';
import { useAuth } from '../contexts/AuthContext';
import { organizationsApi } from '../api/endpoints';
import { Alert } from '../components/UI';
import { getError } from '../api/client';
export default function Settings() {
  const {slug,organization,isOwner,reload}=useOrganization(); const {user,updateProfile}=useAuth();const [name,setName]=useState(organization.name);const [first,setFirst]=useState(user?.first_name||'');const [last,setLast]=useState(user?.last_name||'');const [message,setMessage]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  const saveOrg=async e=>{e.preventDefault();setBusy(true);setError('');try{await organizationsApi.update(slug,{name});await reload();setMessage('Workspace settings saved.');}catch(e){setError(getError(e));}finally{setBusy(false);}};
  const saveProfile=async e=>{e.preventDefault();setBusy(true);setError('');try{await updateProfile({first_name:first,last_name:last});setMessage('Profile updated.');}catch(e){setError(getError(e));}finally{setBusy(false);}};
  return <><div className="page-heading"><div><span className="form-kicker">PREFERENCES & ACCESS</span><h1>Settings</h1><p>Manage your profile and workspace information.</p></div></div><Alert message={error}/><Alert message={message} type="success"/>
    <div className="settings-stack"><section className="panel settings-panel"><div className="settings-icon"><UserRound size={21}/></div><div><h2>Your profile</h2><p className="muted">Information shown to your teammates.</p><form onSubmit={saveProfile} className="form-stack"><div className="field-row"><label>First name<input value={first} onChange={e=>setFirst(e.target.value)}/></label><label>Last name<input value={last} onChange={e=>setLast(e.target.value)}/></label></div><label>Email address<input disabled value={user?.email||''}/></label><button className="button button-primary align-left" disabled={busy}>Save profile</button></form></div></section>
    <section className="panel settings-panel"><div className="settings-icon"><Building2 size={21}/></div><div><h2>Workspace settings</h2><p className="muted">Your organization's identity and preferences.</p><form onSubmit={saveOrg} className="form-stack"><label>Workspace name<input maxLength={150} required disabled={!isOwner} value={name} onChange={e=>setName(e.target.value)}/></label><label>Workspace URL<input disabled value={organization.slug}/></label>{isOwner?<button className="button button-primary align-left" disabled={busy}>Save workspace</button>:<p className="muted">Only the workspace owner can edit these settings.</p>}</form></div></section>
    <section className="panel settings-panel"><div className="settings-icon"><Shield size={21}/></div><div><h2>Security & access</h2><p className="muted">Your role is <strong>{organization.my_role}</strong>. Every project, task, and activity is restricted to authenticated members of this organization.</p><p className="muted">TeamSpace uses short-lived access tokens and HTTP-only refresh cookies.</p></div></section></div>
  </>;
}
