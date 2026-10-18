import { X, LoaderCircle, AlertCircle } from 'lucide-react';
export function Loading({label = 'Loading…'}) { return <div className="loading"><LoaderCircle className="spin" size={22}/>{label}</div>; }
export function Alert({message, type='error'}) { return message ? <div role="alert" className={`alert ${type}`}><AlertCircle size={17}/>{message}</div> : null; }
export function Empty({icon: Icon, title, subtitle}) { return <div className="empty">{Icon && <Icon size={32}/>}<h3>{title}</h3><p>{subtitle}</p></div>; }
export function Modal({title, onClose, children}) {
  return <div className="modal-backdrop" onMouseDown={(e) => {if(e.target === e.currentTarget) onClose();}}>
    <section role="dialog" aria-modal="true" aria-label={title} className="modal">
      <header className="modal-head"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close"><X size={20}/></button></header>
      <div className="modal-body">{children}</div>
    </section>
  </div>;
}
export function StatusPill({value}) { return <span className={`pill pill-${value}`}>{({todo:'To do',progress:'In progress',done:'Done',active:'Active',completed:'Completed',archived:'Archived',pending:'Pending',approved:'Approved',rejected:'Rejected',superseded:'Superseded',high:'High',medium:'Medium',low:'Low'})[value] || value}</span>; }
export function Pagination({page, count, onChange, perPage=20}) {
  if (count <= perPage) return null;
  return <div className="pager"><button className="button button-secondary" disabled={page === 1} onClick={() => onChange(page - 1)}>Previous</button><span>Page {page} of {Math.ceil(count / perPage)}</span><button className="button button-secondary" disabled={page * perPage >= count} onClick={() => onChange(page + 1)}>Next</button></div>;
}
export function ProgressBar({value, max}) { const pct = max ? Math.round(value / max * 100) : 0; return <div className="progress" aria-label={`${pct}% complete`}><div style={{width:`${pct}%`}}/></div>; }
