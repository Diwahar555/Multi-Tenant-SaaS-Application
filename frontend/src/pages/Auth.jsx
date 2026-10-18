import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, LockKeyhole, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Brand } from '../components/Layout';
import { Alert } from '../components/UI';
import { getError } from '../api/client';
export default function AuthPage({mode='login'}) {
  const register = mode === 'register';
  const {user, login, register: signUp} = useAuth();
  const navigate = useNavigate(); const [params] = useSearchParams();
  const [form, setForm] = useState({username:'', email:'', first_name:'', last_name:'', password:''});
  const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  const next = params.get('next')?.startsWith('/') && !params.get('next')?.startsWith('//') ? params.get('next') : '/organizations';
  if (user) return <Navigate to={next} replace/>;
  const submit = async (e) => {e.preventDefault();setError('');setSaving(true);try {if(register)await signUp(form);else await login(form.username,form.password);navigate(next, {replace:true});}catch(err){setError(getError(err));}finally{setSaving(false);}};
  return <div className="auth-wrap"><div className="auth-side"><div className="auth-side-inner"><div className="brand-title"><Brand/>teamspace<span>.</span></div><div className="auth-intro"><span className="eyebrow"><Sparkles size={15}/> BUILT FOR BETTER TEAMWORK</span><h1>Great work<br/>happens <em>together.</em></h1><p>One beautiful place for your teams, projects, and the work that matters.</p><div className="auth-benefits"><div><CheckCircle2/>Clear visibility across projects</div><div><CheckCircle2/>Stay on top of every task</div><div><CheckCircle2/>Separate, secure workspaces</div></div></div><small>© TeamSpace · Built for teams that move forward</small></div></div>
    <div className="auth-right"><div className="auth-card"><div className="mobile-brand"><Brand/> teamspace.</div><span className="form-kicker">{register ? 'JOIN TEAMSPACE' : 'WELCOME BACK'}</span><h2>{register ? 'Create your account' : 'Log in to your account'}</h2><p className="muted">{register ? 'Start organizing your best work today.' : 'Enter your details to pick up where you left off.'}</p><form onSubmit={submit} className="form-stack"><Alert message={error}/>{register && <div className="field-row"><label>First name<input value={form.first_name} onChange={e => setForm({...form,first_name:e.target.value})} placeholder="Alex"/></label><label>Last name<input value={form.last_name} onChange={e => setForm({...form,last_name:e.target.value})} placeholder="Taylor"/></label></div>}
      <label>{register ? 'Username' : 'Username or email'}<input autoFocus required autoComplete="username" value={form.username} onChange={e => setForm({...form,username:e.target.value})} placeholder={register ? 'alextaylor' : 'Your username or email'}/></label>
      {register && <label>Email address<input required type="email" autoComplete="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} placeholder="alex@company.com"/></label>}
      <label>Password<input required type="password" minLength={register ? 8 : undefined} autoComplete={register ? 'new-password' : 'current-password'} value={form.password} onChange={e => setForm({...form,password:e.target.value})} placeholder={register ? 'At least 8 characters' : 'Enter your password'}/></label>
      <button disabled={saving} className="button button-primary full" type="submit">{saving ? 'Please wait…' : register ? 'Create account' : 'Log in'}<ArrowRight size={18}/></button></form>
      <p className="auth-switch">{register ? 'Already have an account?' : 'New to TeamSpace?'} <Link to={`${register ? '/login' : '/register'}?next=${encodeURIComponent(next)}`}>{register ? 'Log in' : 'Create an account'}</Link></p></div></div>
  </div>;
}
