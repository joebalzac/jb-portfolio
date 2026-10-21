import type { ReactNode } from 'react';
import { surface } from './recipes';

/** The panel every card, tile and well is built from. */
export function Surface({
  tone,
  pad,
  class: className,
  children,
}: {
  tone?: 'outlined' | 'sunken' | 'raised' | 'bare';
  pad?: 'none' | 'sm' | 'md' | 'lg';
  class?: string;
  children: ReactNode;
}) {
  return <div className={surface({ tone, pad, class: className })}>{children}</div>;
}
