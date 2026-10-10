import { useEffect, useState } from 'react';

const THOUGHT =
  'Need availability for a 2BR next month. Check inventory, then confirm tour slots before replying.';

const PHASES = {
  idle: 600,
  streamMsPerChar: 28,
  holdOpen: 1400,
  collapsed: 2200,
} as const;

type Phase = 'idle' | 'streaming' | 'open' | 'collapsed';

export function ThinkingTrace() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [chars, setChars] = useState(0);
  const [seconds, setSeconds] = useState('1.8');

  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(window.setTimeout(resolve, ms));
      });

    const run = async () => {
      while (!cancelled) {
        setPhase('idle');
        setChars(0);
        await wait(PHASES.idle);
        if (cancelled) break;

        setPhase('streaming');
        const started = performance.now();
        for (let i = 1; i <= THOUGHT.length; i++) {
          if (cancelled) return;
          setChars(i);
          await wait(PHASES.streamMsPerChar);
        }

        const elapsed = ((performance.now() - started) / 1000).toFixed(1);
        setSeconds(elapsed);
        setPhase('open');
        await wait(PHASES.holdOpen);
        if (cancelled) break;

        setPhase('collapsed');
        await wait(PHASES.collapsed);
      }
    };

    void run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  const open = phase === 'streaming' || phase === 'open';
  const done = phase === 'collapsed' || phase === 'open';

  return (
    <div className="w-full max-w-70" aria-live="polite">
      <div className="flex w-full items-center gap-2" aria-expanded={open}>
        <span
          className={`grid h-4 w-4 place-items-center transition-transform duration-300 ${
            open ? 'rotate-90' : 'rotate-0'
          }`}
        >
          <svg viewBox="0 0 12 12" className="h-3 w-3 text-muted" fill="none">
            <path
              d="M4 2.5L8 6L4 9.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="font-mono text-[11px] tracking-wide text-muted">
          {phase === 'idle' || phase === 'streaming'
            ? 'thinking'
            : `thought for ${seconds}s`}
        </span>
        {(phase === 'idle' || phase === 'streaming') && (
          <span className="ml-auto flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1 w-1 animate-pulse rounded-full bg-faint"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </span>
        )}
        {done && phase === 'collapsed' && (
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
        )}
      </div>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-400 ease-out ${
          open ? 'grid-rows-open opacity-100' : 'grid-rows-closed opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="mt-3 border-l border-line pl-3 font-mono text-[11px] leading-relaxed text-muted">
            {THOUGHT.slice(0, chars)}
            {phase === 'streaming' && (
              <span className="ml-px inline-block h-3 w-px translate-y-0.5 animate-pulse bg-accent align-middle" />
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
