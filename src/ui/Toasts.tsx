import { AnimatePresence, motion } from 'motion/react';
import type { Toast } from '../hooks/useToasts';

export interface ToastsProps {
  toasts: Toast[];
}

/** Coda dei messaggi temporanei. La temporizzazione vive in `useToasts`. */
export const Toasts = ({ toasts }: ToastsProps) => (
  <div className="fixed bottom-10 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
    <AnimatePresence>
      {toasts.map(t => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className={`bg-surface border border-border2 rounded p-3 shadow-2xl min-w-[250px] pointer-events-auto border-l-4 ${
            t.type === 'ok' ? 'border-l-green' : t.type === 'warn' ? 'border-l-yellow' : 'border-l-red'
          }`}
        >
          <div className={`text-[11px] font-bold mb-1 ${
            t.type === 'ok' ? 'text-green' : t.type === 'warn' ? 'text-yellow' : 'text-red'
          }`}>
            {t.title}
          </div>
          <div className="text-[11px] text-text2" dangerouslySetInnerHTML={{ __html: t.msg }} />
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);
