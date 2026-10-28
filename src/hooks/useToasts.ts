import { useCallback, useState } from 'react';

export interface Toast {
  id: number;
  title: string;
  msg: string;
  type: 'ok' | 'warn' | 'error';
}

const TOAST_MS = 4000;

/** Coda dei messaggi temporanei. `showToast` è stabile: non ricrea i figli. */
export const useToasts = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (title: string, msg: string, type: Toast['type'] = 'ok') => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, title, msg, type }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, TOAST_MS);
    },
    []
  );

  return { toasts, showToast };
};
