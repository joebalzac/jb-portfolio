import { useEffect, useRef, useState } from 'react';
import { sections } from '../data/apollo';
import { Button, IconButton } from '../ds';
import { usePresentation } from './presentationContext';

const TARGET_MINUTES = 15;

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

const SHORTCUTS = [
  ['→ / ↓', 'Next section'],
  ['← / ↑', 'Previous section'],
  ['1 – 5', 'Jump to section'],
  ['R', 'Reset all demos'],
  ['?', 'Toggle this help'],
  ['P', 'Toggle presentation mode'],
  ['Esc', 'Exit presentation mode'],
];

/**
 * Presentation chrome. Purely additive — the page is identical underneath, so
 * nothing about the normal reading experience depends on this being mounted.
 */
export function PresentationBar() {
  const {
    active,
    index,
    go,
    next,
    prev,
    reset,
    exit,
    helpOpen,
    toggleHelp,
  } = usePresentation();
  const [seconds, setSeconds] = useState(0);
  const [resetFlash, setResetFlash] = useState(false);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      startedAt.current = null;
      setSeconds(0);
      return;
    }
    startedAt.current = Date.now();
    const timer = window.setInterval(() => {
      if (!startedAt.current) return;
      setSeconds(Math.floor((Date.now() - startedAt.current) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [active]);

  const onReset = () => {
    reset();
    setResetFlash(true);
    window.setTimeout(() => setResetFlash(false), 1200);
  };

  if (!active) return null;

  const current = sections[index];
  const overTime = seconds > TARGET_MINUTES * 60;

  return (
    <>
      {/* Progress hairline across the top. */}
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 z-60 h-px bg-line"
      >
        <div
          className="h-full bg-ink transition-[width] duration-500 ease-product motion-reduce:transition-none"
          style={{ width: `${((index + 1) / sections.length) * 100}%` }}
        />
      </div>

      {helpOpen ? (
        <div className="fixed inset-x-4 bottom-24 z-60 mx-auto max-w-sm rounded-2xl border border-line bg-bg/95 p-5 shadow-lg backdrop-blur sm:inset-x-auto sm:right-6">
          <h2 className="font-mono text-[11px] tracking-wide text-faint uppercase">
            shortcuts
          </h2>
          <dl className="mt-4 space-y-2.5">
            {SHORTCUTS.map(([keys, label]) => (
              <div key={keys} className="flex items-baseline justify-between gap-4">
                <dt className="shrink-0 font-mono text-[11px] text-ink">{keys}</dt>
                <dd className="text-right text-xs text-muted">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      <nav
        aria-label="Presentation controls"
        className="fixed inset-x-0 bottom-0 z-60 border-t border-line bg-bg/90 backdrop-blur"
      >
        <div className="shell flex items-center gap-3 px-4 py-3 sm:px-6">
          <span className="hidden shrink-0 items-center gap-2 font-mono text-[11px] text-faint sm:flex">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-accent"
            />
            presenting
          </span>

          <ol className="flex min-w-0 flex-1 items-center gap-1">
            {sections.map((section, i) => {
              const selected = i === index;
              return (
                <li key={section.id} className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-current={selected ? 'step' : undefined}
                    title={`${section.number} — ${section.title}`}
                    className="group flex w-full cursor-pointer flex-col gap-1.5 py-1 text-left"
                  >
                    <span
                      className={`h-0.5 w-full rounded-full transition-colors duration-300 ${
                        selected
                          ? 'bg-ink'
                          : 'bg-line group-hover:bg-faint'
                      }`}
                    />
                    <span
                      className={`truncate font-mono text-[10px] transition-colors sm:text-[11px] ${
                        selected ? 'text-ink' : 'text-faint group-hover:text-muted'
                      }`}
                    >
                      <span className="tabular-nums">{section.number}</span>
                      <span className="ml-1.5 hidden sm:inline">
                        {section.title.toLowerCase()}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <span
            className={`shrink-0 font-mono text-[11px] tabular-nums ${
              overTime ? 'text-accent' : 'text-faint'
            }`}
            aria-label={`Elapsed ${formatClock(seconds)} of ${TARGET_MINUTES} minute target`}
          >
            {formatClock(seconds)}
          </span>

          <div className="flex shrink-0 items-center gap-1">
            <IconButton
              label="Previous section"
              tone="outlined"
              onClick={prev}
              disabled={index === 0}
            >
              ‹
            </IconButton>
            <IconButton
              label="Next section"
              tone="outlined"
              onClick={next}
              disabled={index === sections.length - 1}
            >
              ›
            </IconButton>
            <Button onClick={onReset} class="ml-1">
              {resetFlash ? 'reset ✓' : 'reset'}
            </Button>
            <IconButton
              label="Keyboard shortcuts"
              tone="outlined"
              onClick={toggleHelp}
              aria-expanded={helpOpen}
              class="font-mono text-[11px]"
            >
              ?
            </IconButton>
            <Button onClick={exit}>exit</Button>
          </div>
        </div>
      </nav>

      <p aria-live="polite" className="sr-only">
        Section {index + 1} of {sections.length}. {current.title}.
      </p>
    </>
  );
}
