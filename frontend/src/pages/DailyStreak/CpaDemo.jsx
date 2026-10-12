import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck, X } from 'lucide-react';
import RewardArt from './RewardArt';
import { shortReward } from '../../utils/format';
import styles from './CpaDemo.module.css';

// Placeholder for the real CPA/ad step. It does NOT grant anything,
// the reward is only given by POST /daily-streak/claim afterwards.
// phase: checking | ad | granting | success | error
export default function CpaDemo({ open, phase, reward, result, error, progress, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && (phase === 'success' || phase === 'error') && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, phase, onClose]);

  const done = phase === 'success' || phase === 'error';

  return (
    <AnimatePresence>
      {open && (
        <motion.div className={styles.backdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cpa-title"
            initial={{ scale: 0.94, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
          >
            {done && (
              <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            )}

            {(phase === 'checking' || phase === 'ad' || phase === 'granting') && (
              <>
                <div className={styles.artWrap}>
                  <RewardArt type={reward?.assetType} animate />
                  <span className={styles.glow} />
                </div>
                <h3 id="cpa-title" className={styles.title}>
                  {phase === 'checking' && 'Checking your reward...'}
                  {phase === 'ad' && 'Preparing your reward...'}
                  {phase === 'granting' && 'Confirming with server...'}
                </h3>
                <div className={styles.adBox}>
                  <span className={styles.adTag}>Advertisement</span>
                  <div className={styles.adBody}>
                    <ShieldCheck size={22} />
                    <div>
                      <div className={styles.adTitle}>Reward Verification</div>
                      <div className={styles.adSub}>Sponsored content will appear here</div>
                    </div>
                  </div>
                  <div className={styles.bar}><span style={{ width: `${progress}%` }} /></div>
                </div>
                <p className={styles.wait}>
                  <Loader2 size={14} className="spin" /> Please wait...
                </p>
              </>
            )}

            {phase === 'success' && result && (
              <>
                <motion.div className={styles.successIcon} initial={{ scale: 0.6 }} animate={{ scale: 1 }}>
                  <CheckCircle2 size={44} />
                </motion.div>
                <h3 id="cpa-title" className={styles.title}>Day {result.claim.day} Claimed!</h3>
                <div className={styles.amount}>{shortReward(result.claim.reward)}</div>
                <p className={styles.meta}>
                  Credited to your wallet
                  <br />
                  Ref: <span>{result.transaction?.referenceId || result.claim.referenceId}</span>
                </p>
                <button type="button" className={styles.primary} onClick={onClose}>Awesome</button>
              </>
            )}

            {phase === 'error' && (
              <>
                <div className={styles.errorIcon}><AlertCircle size={40} /></div>
                <h3 id="cpa-title" className={styles.title}>Couldn&apos;t claim</h3>
                <p className={styles.meta}>{error?.message || 'Unable to process your reward. Please try again.'}</p>
                <button type="button" className={styles.primary} onClick={onClose}>OK</button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
