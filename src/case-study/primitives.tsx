import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Text } from '../ds';
import { useReducedMotion } from '../lib/useReducedMotion';

/** One measure for the whole case study. */
export const SHELL = 'shell';

/** Numbered section with an editorial rule. Scroll target for presentation mode. */
export function CaseSection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-20 px-6 py-group sm:px-8 sm:py-section"
    >
      <div className={SHELL}>
        <div className="mb-12 flex items-baseline gap-4 border-t border-line pt-5">
          <span className="font-mono text-xs text-faint tabular-nums">{number}</span>
          <h2
            id={`${id}-heading`}
            className="font-mono text-xs tracking-wide text-muted"
          >
            {title.toLowerCase()}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}

/**
 * Enter-on-scroll wrapper.
 *
 * Under reduced motion it renders settled on first paint — no transition to
 * suppress, because there is nothing to suppress. It also unobserves after the
 * first reveal so scrolling back up does not replay.
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (reduced) {
      setShown(true);
      return;
    }
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.1 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <div
      ref={ref}
      className={`${className} ${
        reduced
          ? ''
          : `transition-[opacity,transform] duration-700 ease-product ${
              shown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`
      }`}
      style={reduced ? undefined : { transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/** Small mono label above a block. Delegates to the system's type scale. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text variant="eyebrow">{children}</Text>;
}
