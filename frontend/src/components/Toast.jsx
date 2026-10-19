import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import styles from './Toast.module.css';

const ToastContext = createContext(null);
const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback(
    (message, { type = 'info', title, duration = 4000 } = {}) => {
      const id = nextId.current++;
      // keep at most 3 on screen
      setToasts((list) => [...list.slice(-2), { id, type, title, message }]);
      if (duration) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      show,
      success: (msg, opts) => show(msg, { ...opts, type: 'success' }),
      error: (msg, opts) => show(msg, { duration: 6000, ...opts, type: 'error' }),
      info: (msg, opts) => show(msg, { ...opts, type: 'info' }),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={styles.stack} aria-live="polite" aria-atomic="false">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const Icon = ICONS[t.type] || Info;
            return (
              <motion.div
                key={t.id}
                layout
                className={`${styles.toast} ${styles[t.type]}`}
                role={t.type === 'error' ? 'alert' : 'status'}
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
              >
                <Icon size={20} className={styles.icon} aria-hidden="true" />
                <div className={styles.body}>
                  {t.title && <div className={styles.title}>{t.title}</div>}
                  <div className={styles.msg}>{t.message}</div>
                </div>
                <button type="button" className={styles.close} onClick={() => dismiss(t.id)} aria-label="Dismiss">
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
