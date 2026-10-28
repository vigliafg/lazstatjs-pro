import { useEffect, useRef } from 'react';

/**
 * Esegue `run` quando il genitore incrementa `signal`.
 *
 * Sostituisce `forwardRef` + `useImperativeHandle`: il pulsante "Run Analysis"
 * non chiama più il pannello attraverso un ref, ma cambia un valore che il
 * pannello attivo osserva. Alla prima renderizzazione il segnale è già noto,
 * quindi cambiare scheda non esegue l'analisi.
 */
export const useRunSignal = (signal: number, run: () => void) => {
  const runRef = useRef(run);
  runRef.current = run;

  const seen = useRef(signal);
  useEffect(() => {
    if (signal === seen.current) return;
    seen.current = signal;
    runRef.current();
  }, [signal]);
};
