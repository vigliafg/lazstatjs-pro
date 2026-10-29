import { createContext, useContext, type ReactNode } from 'react';

export type UiMode = 'guided' | 'expert';

const UiModeContext = createContext<UiMode>('expert');

export const UiModeProvider = ({ mode, children }: { mode: UiMode; children: ReactNode }) => (
  <UiModeContext.Provider value={mode}>{children}</UiModeContext.Provider>
);

export const useUiMode = (): UiMode => useContext(UiModeContext);
