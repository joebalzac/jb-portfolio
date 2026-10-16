import { useEffect, useState } from 'react';

/**
 * Shared reduced-motion subscription.
 *
 * Returned as state rather than read once, so a preference change mid-session
 * is honored without a reload. Components branch on this value to render the
 * *settled* state directly instead of freezing an animation part-way through.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  return reduced;
}
