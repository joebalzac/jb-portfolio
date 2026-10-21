import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { button } from './recipes';

export type ButtonTone = 'ghost' | 'solid' | 'active' | 'quiet';
export type ButtonSize = 'sm' | 'md' | 'lg';

type Shared = {
  tone?: ButtonTone;
  size?: ButtonSize;
  children?: ReactNode;
  class?: string;
};

export function Button({
  tone,
  size,
  class: className,
  ...props
}: Shared & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'type'> & {
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={props.type ?? 'button'}
      {...props}
      className={button({ tone, size, class: className })}
    />
  );
}

export function ButtonLink({
  tone,
  size,
  class: className,
  ...props
}: Shared & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className'>) {
  return <a {...props} className={button({ tone, size, class: className })} />;
}
