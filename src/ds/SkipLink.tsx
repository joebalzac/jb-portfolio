import type { ReactNode } from 'react';

/**
 * Keyboard skip target.
 *
 * Visually hidden until focused, then becomes a real control in the top-left.
 * In the system because every page needs one and nobody remembers the
 * sr-only/focus:not-sr-only pairing from memory.
 */
export function SkipLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-70 focus:rounded-control focus:border focus:border-line focus:bg-bg focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
    >
      {children}
    </a>
  );
}
