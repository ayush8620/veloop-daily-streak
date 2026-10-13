import { Loader2 } from 'lucide-react';
import useServerWaking from '../hooks/useServerWaking';

export default function WakingNotice({ className }) {
  const waking = useServerWaking();
  if (!waking) return null;

  return (
    <div className={className} role="status" aria-live="polite" data-testid="waking-notice">
      <Loader2 size={14} className="spin" /> Waking up the server, this can take up to a minute on first load...
    </div>
  );
}
