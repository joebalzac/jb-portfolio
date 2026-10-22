import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { link } from './recipes';

/** Anchor with the system's link treatments. External targets get rel set. */
export function Link({
  tone,
  class: className,
  children,
  ...props
}: {
  tone?: 'nav' | 'inline' | 'subtle';
  class?: string;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className'>) {
  const external = props.target === '_blank';
  return (
    <a
      {...props}
      rel={props.rel ?? (external ? 'noreferrer' : undefined)}
      className={link({ tone, class: className })}
    >
      {children}
    </a>
  );
}
