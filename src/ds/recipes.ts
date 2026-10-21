import { cv } from './cv';

/**
 * Every recipe in the system.
 *
 * Kept apart from the components so a recipe can be used on its own — a bare
 * class string for a case the component API does not cover — and so each
 * component module exports only components, which is what React Fast Refresh
 * needs to swap them without remounting.
 */

/**
 * One recipe, two elements.
 *
 * `Button` renders a <button>, `ButtonLink` renders an <a>. A polymorphic `as`
 * prop would collapse them into one component at the cost of generics that
 * make every call site harder to read — and the two really do take different
 * props (`disabled` vs `href`). Explicit beats clever here.
 */
export const button = cv({
  base: 'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full font-mono whitespace-nowrap transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none disabled:cursor-default disabled:opacity-35',
  variants: {
    tone: {
      /** Default. Reads as a control, not as the point of the page. */
      ghost: 'border border-line text-muted hover:border-faint hover:text-ink',
      /** The one action a section wants you to take. */
      solid: 'bg-ink text-bg hover:bg-ink/85',
      /** Selected state for a group of ghosts. */
      active: 'border border-ink bg-ink text-bg',
      /** No chrome until you touch it. */
      quiet: 'text-muted hover:bg-card hover:text-ink',
    },
    size: {
      sm: 'px-2.5 py-1 text-[11px]',
      md: 'px-3.5 py-1.5 text-[11px]',
      lg: 'px-4 py-2 font-sans text-sm',
    },
  },
  defaults: { tone: 'ghost', size: 'md' },
});

export const iconButton = cv({
  base: 'grid shrink-0 cursor-pointer place-items-center rounded-md transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none disabled:cursor-default disabled:opacity-30',
  variants: {
    tone: {
      quiet: 'text-muted hover:bg-card hover:text-ink',
      outlined: 'rounded-full border border-line text-muted hover:text-ink',
      active: 'bg-card text-ink',
    },
    size: { sm: 'size-7', md: 'size-8' },
  },
  defaults: { tone: 'quiet', size: 'md' },
});

export const chip = cv({
  base: 'inline-flex items-center gap-1.5 rounded-full whitespace-nowrap',
  variants: {
    tone: {
      neutral: 'border border-line text-muted',
      accent: 'border border-accent/30 bg-accent/8 text-ink',
      filled: 'bg-card text-ink',
    },
    size: {
      sm: 'px-2 py-0.5 font-mono text-[10px]',
      md: 'px-2.5 py-0.5 font-mono text-[11px]',
    },
  },
  defaults: { tone: 'neutral', size: 'md' },
});

export const surface = cv({
  base: 'rounded-xl',
  variants: {
    tone: {
      outlined: 'border border-line bg-bg',
      sunken: 'border border-line bg-card',
      raised: 'border border-line bg-bg shadow-[0_1px_2px_rgba(17,24,39,0.04),0_12px_32px_rgba(17,24,39,0.06)]',
      bare: '',
    },
    pad: { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' },
  },
  defaults: { tone: 'outlined', pad: 'md' },
});

export const text = cv({
  base: '',
  variants: {
    variant: {
      /** Small mono label above a block. */
      eyebrow: 'font-mono text-[11px] tracking-wide text-faint uppercase',
      /** Section lede. */
      lede: 'text-xl leading-snug font-medium tracking-tight text-ink sm:text-2xl',
      title: 'text-base font-medium tracking-tight text-ink sm:text-lg',
      body: 'text-sm leading-relaxed text-muted',
      detail: 'text-xs leading-relaxed text-muted',
      mono: 'font-mono text-[11px] text-faint',
    },
  },
  defaults: { variant: 'body' },
});
