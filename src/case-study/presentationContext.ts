import { createContext, useContext } from 'react';

export type PresentationValue = {
  /** Presentation chrome visible. The page stays fully usable when false. */
  active: boolean;
  toggle: () => void;
  exit: () => void;
  /** Index into `sections` currently in view, or being presented. */
  index: number;
  go: (index: number) => void;
  next: () => void;
  prev: () => void;
  /** Bumped to remount every interactive demo — the reliable reset. */
  resetToken: number;
  reset: () => void;
  helpOpen: boolean;
  toggleHelp: () => void;
};

export const PresentationContext = createContext<PresentationValue | null>(null);

export function usePresentation() {
  const value = useContext(PresentationContext);
  if (!value) {
    throw new Error('usePresentation must be used inside <PresentationProvider>');
  }
  return value;
}

/**
 * Remount key for any interactive demo. Reading it through context means a
 * demo opts in with `key={useDemoReset()}` and nothing else.
 */
export function useDemoReset() {
  return usePresentation().resetToken;
}
