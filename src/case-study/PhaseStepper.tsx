import { useCallback, useEffect, useState } from 'react';
import { useReducedMotion } from '../lib/useReducedMotion';
import { useDemoReset } from './presentationContext';

/**
 * Manual driver for the four states a reply passes through.
 *
 * Section 02 plays the real component on a timer; this lets you stop on a
 * single frame and compare. Same tokens and keyframes as the product surface
 * (`bg-planning`, `animate-planning-shimmer`, `animate-working-pulse`) so the
 * comparison is honest rather than a redrawing.
 */
const PHASES = [
  {
    id: 'idle',
    label: 'Idle',
    note: 'Prompt sent. Nothing acknowledged yet — this is the gap that reads as a hang.',
  },
  {
    id: 'planning',
    label: 'Planning',
    note: 'First acknowledgement, under 600ms. Says "I heard you" before it can say anything useful.',
  },
  {
    id: 'working',
    label: 'Working',
    note: 'Elapsed time counts up and the skills being loaded are named. Honest about duration, specific about activity.',
  },
  {
    id: 'answer',
    label: 'Answer',
    note: 'Reply replaces the status in place. No layout jump, because the status block and the answer share a column.',
  },
] as const;

type PhaseId = (typeof PHASES)[number]['id'];

const SKILLS = ['Loading conversations', 'Analyzing lease data'];

export function PhaseStepper() {
  const resetToken = useDemoReset();
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<PhaseId>('idle');
  const [elapsed, setElapsed] = useState(0);

  const stepIndex = PHASES.findIndex((p) => p.id === phase);
  const current = PHASES[stepIndex];

  // Reset when presentation mode asks for a clean slate.
  useEffect(() => {
    setPhase('idle');
    setElapsed(0);
  }, [resetToken]);

  useEffect(() => {
    if (phase !== 'working') return;
    setElapsed(0);
    const timer = window.setInterval(() => {
      setElapsed((value) => Math.min(value + 0.1, 9.9));
    }, 100);
    return () => window.clearInterval(timer);
  }, [phase]);

  const step = useCallback((direction: 1 | -1) => {
    setPhase((currentPhase) => {
      const index = PHASES.findIndex((p) => p.id === currentPhase);
      const next = Math.max(0, Math.min(PHASES.length - 1, index + direction));
      return PHASES[next].id;
    });
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card">
      {/* Product-skinned stage, matching the real surface's tokens. */}
      <div className="min-h-57 bg-product-bg px-4 py-4 sm:px-5">
        <div className="flex w-full justify-end">
          <p className="m-0 max-w-[86%] rounded-lg bg-product-soft px-3.5 py-2.5 text-[13px] leading-product tracking-product text-product">
            Who haven’t I marked shown from today’s tours?
          </p>
        </div>

        <div className="mt-3">
          {phase === 'idle' ? (
            <p className="m-0 px-1 py-1 text-[13px] leading-product text-product-muted/50">
              &nbsp;
            </p>
          ) : null}

          {phase === 'planning' ? (
            <p className="m-0 px-1 py-1">
              <span
                className={`bg-planning bg-clip-text text-[13px] leading-product tracking-product text-transparent ${
                  reduced
                    ? 'bg-none text-product-muted'
                    : 'animate-planning-shimmer'
                }`}
              >
                Planning next moves
              </span>
            </p>
          ) : null}

          {phase === 'working' ? (
            <div className="flex w-full flex-col">
              <div className="flex min-h-8 items-center gap-1.75 px-1 text-[13px] leading-product tracking-product text-product-muted">
                <span
                  aria-hidden
                  className={`grid size-5 place-items-center text-product-accent ${
                    reduced ? '' : 'animate-working-pulse'
                  }`}
                >
                  <svg viewBox="0 0 21 21" width="18" height="18" aria-hidden>
                    <path
                      d="M10.5 1.8 11.9 8.1 18.2 10.5 11.9 12.9 10.5 19.2 9.1 12.9 2.8 10.5 9.1 8.1 10.5 1.8Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <span>Working</span>
                <span
                  aria-hidden
                  className="size-0.5 shrink-0 rounded-full bg-product-muted"
                />
                <span className="tabular-nums">{elapsed.toFixed(1)}s</span>
              </div>
              <div className="flex gap-1.75 px-1">
                <span
                  aria-hidden
                  className="mx-2 w-px shrink-0 self-stretch bg-product-line"
                />
                <div className="flex flex-col gap-1.75 py-3 text-[13px] leading-product tracking-product text-product-muted">
                  {SKILLS.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {phase === 'answer' ? (
            <div
              className={`flex flex-col gap-2 ${
                reduced ? '' : 'animate-message-enter'
              }`}
            >
              <p className="m-0 text-[13px] leading-product tracking-product text-product">
                One tour needs marking: Annabel Donovan’s self-guided tour on
                July 1. Mark as shown?
              </p>
              <div className="flex gap-2">
                {['Mark as shown', 'Skip'].map((action) => (
                  <span
                    key={action}
                    className="rounded-full border border-product-line bg-white px-3 py-1 text-[12px] leading-product-title tracking-product text-product"
                  >
                    {action}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Controls */}
      <div className="border-t border-line px-4 py-3">
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Reply state"
        >
          {PHASES.map((item, index) => {
            const selected = item.id === phase;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPhase(item.id)}
                aria-pressed={selected}
                className={`cursor-pointer rounded-full border px-3 py-1 font-mono text-[11px] transition-colors duration-200 ${
                  selected
                    ? 'border-ink bg-ink text-bg'
                    : 'border-line bg-bg text-muted hover:border-faint hover:text-ink'
                }`}
              >
                <span className="tabular-nums">{index + 1}</span>
                <span className="mx-1.5 opacity-40" aria-hidden>
                  ·
                </span>
                {item.label}
              </button>
            );
          })}
          <span className="ml-auto flex gap-1">
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={stepIndex === 0}
              aria-label="Previous state"
              className="grid h-7 w-7 cursor-pointer place-items-center rounded-full border border-line text-muted transition-colors hover:text-ink disabled:cursor-default disabled:opacity-30"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              disabled={stepIndex === PHASES.length - 1}
              aria-label="Next state"
              className="grid h-7 w-7 cursor-pointer place-items-center rounded-full border border-line text-muted transition-colors hover:text-ink disabled:cursor-default disabled:opacity-30"
            >
              ›
            </button>
          </span>
        </div>
        <p
          aria-live="polite"
          className="mt-3 min-h-9 text-xs leading-relaxed text-muted"
        >
          <span className="text-ink">{current.label}.</span> {current.note}
        </p>
      </div>
    </div>
  );
}
