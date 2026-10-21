import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { iconButton } from './recipes';

/** Icon-only control. `label` is required — it becomes the accessible name. */
export function IconButton({
  label,
  tone,
  size,
  class: className,
  children,
  ...props
}: {
  label: string;
  tone?: 'quiet' | 'outlined' | 'active';
  size?: 'sm' | 'md';
  class?: string;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'type' | 'aria-label'>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...props}
      className={iconButton({ tone, size, class: className })}
    >
      {children}
    </button>
  );
}
