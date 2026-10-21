import type { ElementType, ReactNode } from 'react';
import { text } from './recipes';

const DEFAULT_TAG: Record<string, ElementType> = {
  eyebrow: 'span',
  lede: 'h3',
  title: 'h4',
  body: 'p',
  detail: 'p',
  mono: 'span',
};

/** Typography scale. `as` overrides the element without changing the style. */
export function Text({
  variant = 'body',
  as,
  class: className,
  children,
}: {
  variant?: 'eyebrow' | 'lede' | 'title' | 'body' | 'detail' | 'mono';
  as?: ElementType;
  class?: string;
  children: ReactNode;
}) {
  const Tag = as ?? DEFAULT_TAG[variant] ?? 'p';
  return <Tag className={text({ variant, class: className })}>{children}</Tag>;
}
