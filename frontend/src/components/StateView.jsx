import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import ui from '../styles/ui.module.css';

// Friendly error block with a retry button. Never shows raw server errors.
export function ErrorView({ title = 'Something went wrong', error, onRetry, retrying = false }) {
  return (
    <div className={ui.state} role="alert">
      <span className={ui.stateIcon}><AlertTriangle size={26} /></span>
      <h2>{title}</h2>
      <p>{error?.message || 'Unable to process your request. Please try again.'}</p>
      {onRetry && (
        <button type="button" className={`${ui.btn} ${ui.gold}`} onClick={onRetry} disabled={retrying}>
          <RefreshCw size={16} className={retrying ? 'spin' : ''} /> {retrying ? 'Retrying...' : 'Try again'}
        </button>
      )}
    </div>
  );
}

export function EmptyView({ art, title, text, to, cta }) {
  return (
    <div className={ui.state}>
      {art && <img src={art} alt="" />}
      <h3>{title}</h3>
      <p>{text}</p>
      {to && <Link to={to} className={`${ui.btn} ${ui.gold}`}>{cta}</Link>}
    </div>
  );
}
