import type { ReactNode } from 'react';
import { chip } from './recipes';

/** Static label. For something clickable, reach for Button. */
export function Chip({
  tone,
  size,
  class: className,
  children,
}: {
  tone?: 'neutral' | 'accent' | 'filled';
  size?: 'sm' | 'md';
  class?: string;
  children: ReactNode;
}) {
  return <span className={chip({ tone, size, class: className })}>{children}</span>;
}
