import { useEffect, useState } from 'react';

type ToolStatus = 'pending' | 'running' | 'done';

type ToolStep = {
  id: string;
  name: string;
  args: string;
  result: string;
};

const STEPS: ToolStep[] = [
  {
    id: 'search',
    name: 'search_inventory',
    args: '2BR · available',
    result: '3 units',
  },
  {
    id: 'slots',
    name: 'get_tour_slots',
    args: 'unit 4B',
    result: 'Thu 2pm',
  },
];

const TIMING = {
  resetHold: 900,
  stepGap: 420,
  runningFor: 1100,
  doneHold: 2400,
} as const;

export function ToolCallStack() {
  const [statuses, setStatuses] = useState<ToolStatus[]>(
    STEPS.map(() => 'pending'),
  );
  const [active, setActive] = useState(-1);

  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(window.setTimeout(resolve, ms));
      });

    const run = async () => {
      while (!cancelled) {
        setStatuses(STEPS.map(() => 'pending'));
        setActive(-1);
        await wait(TIMING.resetHold);
        if (cancelled) break;

        for (let i = 0; i < STEPS.length; i++) {
          if (cancelled) return;
          setActive(i);
          setStatuses((prev) => prev.map((s, idx) => (idx === i ? 'running' : s)));
          await wait(TIMING.runningFor);
          if (cancelled) return;
          setStatuses((prev) => prev.map((s, idx) => (idx === i ? 'done' : s)));
          await wait(TIMING.stepGap);
        }

        setActive(-1);
        await wait(TIMING.doneHold);
      }
    };

    void run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="w-full max-w-70">
      <div className="mb-3 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span
            className={`absolute inset-0 rounded-full bg-accent ${
              active >= 0 ? 'animate-ping opacity-40' : 'opacity-0'
            }`}
          />
          <span
            className={`relative h-2 w-2 rounded-full ${
              active >= 0 ? 'bg-accent' : 'bg-faint'
            }`}
          />
        </span>
        <span className="font-mono text-[11px] tracking-wide text-muted">
          {active >= 0 ? 'running tools' : statuses.every((s) => s === 'done') ? 'tools complete' : 'awaiting tools'}
        </span>
      </div>

      <ol className="relative space-y-2.5">
        <span
          className="absolute top-3 bottom-3 left-1.75 w-px bg-line"
          aria-hidden
        />
        {STEPS.map((step, i) => {
          const status = statuses[i];
          return (
            <li key={step.id} className="relative flex gap-3 pl-0">
              <span className="relative z-10 mt-1.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-line bg-card">
                {status === 'done' ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                ) : status === 'running' ? (
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink" />
                ) : (
                  <span className="h-1 w-1 rounded-full bg-faint" />
                )}
              </span>

              <div
                className={`min-w-0 flex-1 rounded-xl border px-3 py-2 transition-all duration-300 ${
                  status === 'running'
                    ? 'border-ink/20 bg-bg shadow-[0_0_0_1px_rgba(26,26,26,0.04)]'
                    : status === 'done'
                      ? 'border-line bg-bg'
                      : 'border-transparent bg-transparent opacity-45'
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <code className="truncate font-mono text-[11px] text-ink">
                    {step.name}
                  </code>
                  <span className="shrink-0 font-mono text-[10px] text-faint">
                    {status === 'running'
                      ? '…'
                      : status === 'done'
                        ? step.result
                        : ''}
                  </span>
                </div>
                <p
                  className={`mt-0.5 truncate font-mono text-[10px] transition-opacity duration-300 ${
                    status === 'pending' ? 'opacity-0' : 'text-muted opacity-100'
                  }`}
                >
                  {step.args}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
