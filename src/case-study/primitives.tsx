import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from '../lib/useReducedMotion';

/** Numbered section with an editorial rule. Scroll target for presentation mode. */
export function CaseSection({
  id,
  number,
  title,
  children,
  wide = false,
}: {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-20 px-6 py-20 sm:px-8 sm:py-28"
    >
      {/* The header rule always sits in the 4xl column so section rules align
          down the page, even when a section's body breaks out wider. */}
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 flex items-baseline gap-4 border-t border-line pt-5">
          <span className="font-mono text-xs text-faint tabular-nums">{number}</span>
          <h2
            id={`${id}-heading`}
            className="font-mono text-xs tracking-wide text-muted"
          >
            {title.toLowerCase()}
          </h2>
        </div>
      </div>
      <div className={wide ? 'mx-auto max-w-7xl' : 'mx-auto max-w-4xl'}>
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

/** Small mono label used above blocks. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[11px] tracking-wide text-faint uppercase">
      {children}
    </span>
  );
}

/**
 * Code excerpt quoted from the repository, with its real path and line range.
 * No syntax highlighter — comments dim, everything else reads as code. The
 * citation is the point; decoration would compete with it.
 */
export function CodeExcerpt({
  file,
  startLine,
  source,
  caption,
  note,
}: {
  file: string;
  /** Omitted for an abridged snippet — numbering non-contiguous lines would lie. */
  startLine?: number;
  source: string;
  caption?: string;
  note?: string;
}) {
  const lines = source.split('\n');
  const numbered = typeof startLine === 'number';
  const base = startLine ?? 0;

  return (
    <figure className="my-6 overflow-hidden rounded-xl border border-line bg-card">
      <figcaption className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <code className="truncate font-mono text-[11px] text-muted">{file}</code>
        <span className="shrink-0 font-mono text-[10px] text-faint tabular-nums">
          {numbered ? `L${base}–${base + lines.length - 1}` : note}
        </span>
      </figcaption>
      <div className="overflow-x-auto">
        <pre className="px-4 py-4 font-mono text-[11.5px] leading-[1.75] sm:text-xs">
          <code>
            {lines.map((line, i) => {
              const comment = /^\s*(\/\/|\/\*|\*)/.test(line);
              return (
                <span
                  key={i}
                  className={
                    numbered ? 'grid grid-cols-[2.25rem_1fr]' : 'block'
                  }
                >
                  {numbered ? (
                    <span
                      aria-hidden
                      className="select-none pr-3 text-right text-faint tabular-nums"
                    >
                      {base + i}
                    </span>
                  ) : null}
                  <span className={comment ? 'text-faint' : 'text-ink'}>
                    {line || ' '}
                  </span>
                </span>
              );
            })}
          </code>
        </pre>
      </div>
      {caption ? (
        <p className="border-t border-line px-4 py-2.5 text-xs leading-relaxed text-muted">
          {caption}
        </p>
      ) : null}
    </figure>
  );
}

/** Visible marker for anything not yet verified. Never styled to blend in. */
export function MetricPlaceholder({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-card/60 px-4 py-4">
      <p className="font-mono text-[11px] text-faint">{label}</p>
      <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted">
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-accent/60"
        />
        to verify
      </p>
    </div>
  );
}

/** Honest provenance label for anything running on scripted data. */
export function DemoNotice({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2.5 rounded-xl border border-line bg-card px-4 py-3 text-xs leading-relaxed text-muted">
      <span
        aria-hidden
        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
      />
      <span>{children}</span>
    </p>
  );
}

/** Two-column problem/decision pairing used through section 03. */
export function Annotation({
  index,
  title,
  problem,
  decision,
  children,
}: {
  index: string;
  title: string;
  problem: string;
  decision: string;
  children?: ReactNode;
}) {
  return (
    <div className="grid gap-x-10 gap-y-4 border-t border-line pt-7 md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
      <div>
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[11px] text-faint tabular-nums">
            {index}
          </span>
          <h3 className="text-base font-medium tracking-tight text-ink sm:text-lg">
            {title}
          </h3>
        </div>
        {children ? <div className="mt-5">{children}</div> : null}
      </div>
      <div className="space-y-4">
        <div>
          <Eyebrow>tension</Eyebrow>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{problem}</p>
        </div>
        <div>
          <Eyebrow>decision</Eyebrow>
          <p className="mt-1.5 text-sm leading-relaxed text-ink">{decision}</p>
        </div>
      </div>
    </div>
  );
}
