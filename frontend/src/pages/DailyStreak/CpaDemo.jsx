import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Clock, Loader2, RefreshCw, ShieldCheck, X } from 'lucide-react';
import RewardArt from './RewardArt';
import CountUp from '../../components/CountUp';
import { formatDuration, isRetryable, shortReward } from '../../utils/format';
import styles from './CpaDemo.module.css';

const STEPS = [
  { key: 'checking', label: 'Checking eligibility' },
  { key: 'ad', label: 'Reward verification' },
  { key: 'granting', label: 'Confirming with server' },
];

// Placeholder for the real CPA/ad step. It does NOT grant anything,
// the reward is only given by POST /daily-streak/claim afterwards.
// phase: checking | ad | granting | success | error
export default function CpaDemo({ open, phase, reward, result, error, progress, onClose, onRetry }) {
  const done = phase === 'success' || phase === 'error';
  const focusRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && done && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, done, onClose]);

  // move focus to the main action once the result is in
  useEffect(() => {
    if (open && done) focusRef.current?.focus();
  }, [open, done]);

  const stepIndex = STEPS.findIndex((s) => s.key === phase);
  const claim = result?.claim;
  const next = result?.state?.nextReward;
  const nextDay = result?.state?.streak?.currentDay;
  const st = result?.state;
  const cycleDone = claim && st && claim.day >= st.streak.totalRewards; // claimed the last day
  const unlockIn = st?.streak?.nextClaimAt ? new Date(st.streak.nextClaimAt) - new Date(st.serverTime) : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className={styles.backdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cpa-title"
            aria-describedby="cpa-desc"
            initial={{ scale: 0.94, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
          >
            {done && (
              <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            )}

            {!done && (
              <>
                <div className={styles.artWrap}>
                  <RewardArt type={reward?.assetType} animate />
                  <span className={styles.glow} />
                </div>
                <h3 id="cpa-title" className={styles.title}>Preparing your reward...</h3>
                {reward && <p className={styles.kicker}>{shortReward(reward)}</p>}
                <div className={styles.adBox}>
                  <span className={styles.adTag}>Advertisement</span>
                  <div className={styles.adBody}>
                    <ShieldCheck size={22} />
                    <div>
                      <div className={styles.adTitle}>Reward Verification</div>
                      <div className={styles.adSub}>Sponsored content will appear here</div>
                    </div>
                  </div>
                  <div className={styles.bar} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Verification progress">
                    <span style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <ol className={styles.steps} id="cpa-desc" aria-live="polite">
                  {STEPS.map((s, i) => (
                    <li key={s.key} className={i < stepIndex ? styles.stepDone : i === stepIndex ? styles.stepNow : ''}>
                      {i < stepIndex ? <CheckCircle2 size={14} /> : i === stepIndex ? <Loader2 size={14} className="spin" /> : <span className={styles.stepDot} />}
                      {s.label}
                    </li>
                  ))}
                </ol>
                <p className={styles.wait}>Please wait, don&apos;t close this window.</p>
              </>
            )}

            {phase === 'success' && claim && (
              <>
                <div className={styles.celebrate} aria-hidden="true">
                  <span className={styles.burst} />
                  <motion.div
                    className={styles.prize}
                    initial={{ scale: 0.6, opacity: 0, y: 8 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  >
                    <RewardArt type={reward?.assetType} />
                  </motion.div>
                  <span className={styles.successBadge}><CheckCircle2 size={22} /></span>
                </div>
                <h3 id="cpa-title" className={styles.title}>Day {claim.day} Claimed!</h3>
                <div className={styles.amount}>
                  {claim.reward.currency === 'INR' ? '₹' : '+'}
                  <CountUp value={claim.reward.amount} duration={700} />
                  <span className={styles.amountUnit}>{claim.reward.currency === 'INR' ? ' Gift Card' : ' VEs'}</span>
                </div>
                <p className={styles.meta} id="cpa-desc">
                  Credited to your wallet
                  <br />
                  Ref: <span>{result.transaction?.referenceId || claim.referenceId}</span>
                </p>
                {next && !cycleDone && (
                  <div className={styles.nextBox}>
                    <Clock size={16} />
                    <span>
                      Next up: <b>Day {nextDay}</b> · {shortReward(next)}
                      {unlockIn > 0 && <small>Unlocks in {formatDuration(unlockIn)}. Keep your streak going!</small>}
                    </span>
                  </div>
                )}
                {cycleDone && <div className={styles.nextBox}><span>You finished the full streak. A new cycle starts next time.</span></div>}
                <button ref={focusRef} type="button" className={styles.primary} onClick={onClose}>Awesome</button>
                <Link to="/history" className={styles.secondary} onClick={onClose}>View history</Link>
              </>
            )}

            {phase === 'error' && (
              <>
                <div className={styles.errorIcon}><AlertCircle size={40} /></div>
                <h3 id="cpa-title" className={styles.title}>Couldn&apos;t claim</h3>
                <p className={styles.meta} id="cpa-desc">{error?.message || 'Unable to process your reward. Please try again.'}</p>
                {isRetryable(error) ? (
                  <>
                    <button ref={focusRef} type="button" className={styles.primary} onClick={onRetry}>
                      <RefreshCw size={16} /> Try again
                    </button>
                    <button type="button" className={styles.secondary} onClick={onClose}>Close</button>
                  </>
                ) : (
                  <button ref={focusRef} type="button" className={styles.primary} onClick={onClose}>OK</button>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
