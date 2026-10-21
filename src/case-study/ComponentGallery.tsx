import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '../ds';
import { useInView } from '../lib/useInView';
import { useReducedMotion } from '../lib/useReducedMotion';
import { ApolloBlocks } from '../components/apollo/ApolloBlocks';
import { Composer } from '../components/apollo/Composer';
import { CopyButton } from '../components/apollo/CopyButton';
import {
  ActionGlyph,
  type ActionGlyphType,
} from '../components/apollo/ThinkingStatus';
import { EXCHANGES } from '../components/apollo/conversations';
import { Dropdown } from '../components/apollo/Dropdown';
import { AGENT_MODES, SCOPES } from '../components/apollo/options';
import type { MessageBlock } from '../components/apollo/types';
import { ToolCallStack } from '../components/craft/ToolCallStack';
import { PhaseStepper } from './PhaseStepper';
import { useDemoReset } from './presentationContext';

/**
 * Pulls a real block of each kind out of the shipped conversation fixtures,
 * so the gallery shows the actual renderer output rather than a mock-up.
 */
function firstBlockOfType<T extends MessageBlock['type']>(type: T) {
  for (const thread of EXCHANGES) {
    for (const message of thread) {
      for (const block of message.blocks) {
        if (block.type === type) return block as Extract<MessageBlock, { type: T }>;
      }
    }
  }
  throw new Error(`No fixture block of type ${type}`);
}

const BLOCK_SAMPLES = [
  { type: 'text' as const, label: 'Prose' },
  { type: 'list' as const, label: 'Checklist' },
  { type: 'table' as const, label: 'Table' },
  { type: 'draft' as const, label: 'Draft' },
  { type: 'actions' as const, label: 'Actions' },
].map((entry) => ({ ...entry, block: firstBlockOfType(entry.type) }));

function Tile({
  label,
  note,
  action,
  children,
  span = false,
}: {
  label: string;
  note: string;
  action?: ReactNode;
  /** Receives whether the tile is on screen, so each demo can play itself. */
  children: ReactNode | ((inView: boolean) => ReactNode);
  span?: boolean;
}) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.15 });
  /* The entrance latches: a tile that faded back out on the way past would
     read as a glitch. `inView` stays live so the demos inside can pause. */
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (inView) setRevealed(true);
  }, [inView]);

  return (
    <section
      ref={ref}
      className={`flex flex-col rounded-xl border border-line bg-bg transition-[opacity,transform] duration-700 ease-product motion-reduce:transition-none ${
        revealed ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      } ${span ? 'lg:col-span-2' : ''}`}
    >
      <header className="flex items-start justify-between gap-4 px-4 pt-4 pb-3.5">
        <div className="min-w-0">
          <h4 className="text-sm font-medium text-ink">{label}</h4>
          <p className="mt-1 text-xs leading-relaxed text-muted">{note}</p>
        </div>
        {action ? <div className="flex shrink-0 gap-1.5">{action}</div> : null}
      </header>
      <div className="flex flex-1 flex-col justify-center border-t border-line p-4">
        {typeof children === 'function' ? children(inView) : children}
      </div>
    </section>
  );
}

/**
 * Chained-timeout driver shared by the self-playing tiles.
 *
 * Each demo describes its sequence with awaited waits; the hook runs it only
 * while the tile is visible and motion is allowed, and tears the whole chain
 * down on exit so scrolling away never leaves a half-finished frame.
 */
function useLoop(
  run: (wait: (ms: number) => Promise<void>) => Promise<void>,
  active: boolean,
) {
  const latest = useRef(run);
  latest.current = run;

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(window.setTimeout(resolve, ms));
      });

    void (async () => {
      while (!cancelled) await latest.current(wait);
    })();

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [active]);
}

/** Flattens any block to the plain text the clipboard should receive. */
function blockText(block: MessageBlock) {
  if (block.type === 'text' || block.type === 'draft') return block.text;
  if (block.type === 'list') return block.items.map((i) => `• ${i}`).join('\n');
  if (block.type === 'actions') return block.items.join(' / ');
  return [block.columns.join('\t'), ...block.rows.map((r) => r.join('\t'))].join('\n');
}

const DEMO_PROMPTS = [
  'Who haven’t I marked shown from today’s tours?',
  'Draft a welcome text for this month’s move-ins.',
];

function ComposerTile({ inView }: { inView: boolean }) {
  const reduced = useReducedMotion();
  const [value, setValue] = useState('');
  const [scope, setScope] = useState('cross-org');
  const [mode, setMode] = useState('full');
  const [sent, setSent] = useState<string[]>([]);
  /* The demo types for you until you take the field, then never again. */
  const [taken, setTaken] = useState(false);
  const turn = useRef(0);

  const submit = (text: string) => {
    if (!text.trim()) return;
    setSent((current) => [text.trim(), ...current].slice(0, 2));
    setValue('');
  };

  useLoop(async (wait) => {
    const prompt = DEMO_PROMPTS[turn.current % DEMO_PROMPTS.length];
    turn.current += 1;
    setValue('');
    await wait(500);
    for (let i = 1; i <= prompt.length; i++) {
      setValue(prompt.slice(0, i));
      await wait(26);
    }
    await wait(650);
    submit(prompt);
    await wait(1900);
  }, inView && !taken && !reduced);

  return (
    <div
      className="flex flex-col gap-3"
      onPointerDownCapture={() => setTaken(true)}
      onKeyDownCapture={() => setTaken(true)}
    >
      <Composer
        value={value}
        onChange={(next) => {
          setTaken(true);
          setValue(next);
        }}
        onSubmit={() => submit(value)}
        scope={scope}
        onScopeChange={setScope}
        mode={mode}
        onModeChange={setMode}
        placeholder="Type here — Enter sends, Shift+Enter is a newline"
      />
      <div className="min-h-9">
        {sent.length === 0 ? (
          <p className="font-mono text-[11px] text-faint">nothing submitted yet</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {sent.map((entry, index) => (
              <li
                key={`${entry}-${index}`}
                className="truncate font-mono text-[11px] text-muted motion-safe:animate-chip-in"
              >
                <span className="text-faint">submitted ›</span> {entry}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function BlocksTile({ inView }: { inView: boolean }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [taken, setTaken] = useState(false);
  const active = BLOCK_SAMPLES[index];

  useLoop(async (wait) => {
    await wait(2300);
    setIndex((i) => (i + 1) % BLOCK_SAMPLES.length);
  }, inView && !taken && !reduced);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {BLOCK_SAMPLES.map((sample, i) => (
          <Button
            key={sample.type}
            size="sm"
            tone={i === index ? 'active' : 'ghost'}
            aria-pressed={i === index}
            onClick={() => {
              setTaken(true);
              setIndex(i);
            }}
          >
            {sample.label}
          </Button>
        ))}
      </div>
      <div className="min-h-38 rounded-lg border border-app-line bg-white p-3.5">
        <div key={index} className="motion-safe:animate-message-enter">
          <ApolloBlocks blocks={[active.block]} />
        </div>
      </div>
    </div>
  );
}

function DropdownTile({ inView }: { inView: boolean }) {
  const reduced = useReducedMotion();
  const [scope, setScope] = useState('cross-org');
  const [mode, setMode] = useState('full');
  const [taken, setTaken] = useState(false);
  const turn = useRef(0);
  const scopeLabel = SCOPES.find((s) => s.value === scope)?.label;
  const modeLabel = AGENT_MODES.find((m) => m.value === mode)?.label;

  /* Cycles the selection rather than opening the menu — an overlay that opens
     by itself reads as a bug, where a value changing reads as a demo. */
  useLoop(async (wait) => {
    await wait(2100);
    turn.current += 1;
    if (turn.current % 2) {
      setScope(SCOPES[turn.current % SCOPES.length].value);
    } else {
      setMode(AGENT_MODES[turn.current % AGENT_MODES.length].value);
    }
  }, inView && !taken && !reduced);

  return (
    <div className="flex flex-col gap-3" onPointerDownCapture={() => setTaken(true)}>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-app-line bg-white px-3 py-2.5 text-[14px]">
        <Dropdown label="Scope" value={scope} options={SCOPES} onChange={setScope} />
        <span aria-hidden className="text-app-line">|</span>
        <Dropdown
          label="Agent mode"
          value={mode}
          options={AGENT_MODES}
          onChange={setMode}
        />
      </div>
      <p className="font-mono text-[11px] text-muted">
        <span className="text-faint">context ›</span>{' '}
        <span key={`${scope}-${mode}`} className="motion-safe:animate-chip-in">
          {scopeLabel} · {modeLabel}
        </span>
      </p>
    </div>
  );
}

const COPY_SAMPLES = [
  { type: 'draft' as const, label: 'a drafted message' },
  { type: 'list' as const, label: 'a checklist' },
  { type: 'table' as const, label: 'a table' },
].map((entry) => ({ ...entry, block: firstBlockOfType(entry.type) }));

function CopyTile({ inView }: { inView: boolean }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const sample = COPY_SAMPLES[index];

  useLoop(async (wait) => {
    await wait(3200);
    setIndex((i) => (i + 1) % COPY_SAMPLES.length);
  }, inView && !reduced);

  return (
    <div className="flex flex-col gap-3">
      <div className="max-h-44 overflow-hidden rounded-lg border border-app-line bg-white p-3.5">
        <div key={index} className="motion-safe:animate-message-enter">
          <ApolloBlocks blocks={[sample.block]} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <CopyButton text={blockText(sample.block)} label={`Copy ${sample.label}`} />
        <span className="font-mono text-[10px] text-faint">{sample.label}</span>
      </div>
    </div>
  );
}

/** The spark the product pulses while a reply is being worked on. */
function SparkGlyph({ size = 26 }: { size?: number }) {
  return (
    <svg viewBox="0 0 21 21" width={size} height={size} aria-hidden>
      <path
        d="M10.5 1.8 11.9 8.1 18.2 10.5 11.9 12.9 10.5 19.2 9.1 12.9 2.8 10.5 9.1 8.1 10.5 1.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

const GLYPHS = [
  { id: 'spark', label: 'Working', caption: 'pulses while the agent is busy' },
  { id: 'conversation', label: 'Loading conversations', caption: 'reading prior threads' },
  { id: 'data', label: 'Analyzing lease data', caption: 'querying records' },
  { id: 'action', label: 'Sending follow-up', caption: 'acting on your behalf' },
] as const;

/**
 * The working glyphs, enlarged.
 *
 * In the product these sit at 10.5px inside the thinking panel, where the
 * motion is barely perceptible. Blown up they show what the panel is actually
 * doing: each stroke draws itself, and the row being worked on is the one
 * carrying the running indicator.
 */
function GlyphTile({ inView }: { inView: boolean }) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);

  useLoop(async (wait) => {
    await wait(2800);
    setActive((i) => (i + 1) % GLYPHS.length);
  }, inView && !reduced);

  return (
    <ul className="flex flex-col gap-2">
      {GLYPHS.map((glyph, index) => {
        const isActive = index === active;
        const done = index < active;
        return (
          <li
            key={glyph.id}
            className={`flex items-center gap-3.5 rounded-lg border px-3 py-2.5 transition-colors duration-300 ${
              isActive
                ? 'border-product-ring bg-white'
                : 'border-transparent bg-transparent'
            }`}
          >
            <span
              className={`grid size-11 shrink-0 place-items-center rounded-lg border transition-colors duration-300 ${
                isActive
                  ? 'border-product-ring bg-product-soft text-product-accent'
                  : 'border-product-line bg-product-soft text-product-label'
              } ${!reduced && isActive && glyph.id !== 'spark' ? 'glyph-draw' : ''} ${
                !reduced && isActive && glyph.id === 'spark'
                  ? 'animate-working-pulse'
                  : ''
              }`}
              style={{ animationDelay: `${index * 120}ms` }}
            >
              {glyph.id === 'spark' ? (
                <SparkGlyph />
              ) : (
                <ActionGlyph type={glyph.id as ActionGlyphType} size={24} />
              )}
            </span>

            <span className="min-w-0 flex-1">
              <span
                className={`block truncate text-[13px] transition-colors duration-300 ${
                  isActive ? 'text-ink' : 'text-muted'
                }`}
              >
                {glyph.label}
              </span>
              <span className="block truncate font-mono text-[11px] text-faint">
                {glyph.caption}
              </span>
            </span>

            <span className="flex w-10 shrink-0 justify-end">
              {isActive ? (
                <span className="flex gap-0.5" aria-hidden>
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="size-1 rounded-full bg-accent motion-safe:animate-working-pulse"
                      style={{ animationDelay: `${dot * 160}ms` }}
                    />
                  ))}
                </span>
              ) : done ? (
                <svg viewBox="0 0 16 16" className="size-3.5 text-faint" aria-hidden>
                  <path
                    d="M3.2 8.4 6.2 11.4 12.8 4.8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Plays itself in view; the arrows hand the timeline to the reader. */
function ToolTile({ inView }: { inView: boolean }) {
  const reduced = useReducedMotion();
  const [manual, setManual] = useState(false);
  const [step, setStep] = useState(0);
  const max = 2;

  return (
    <>
      <ToolCallStack autoplay={!manual && inView && !reduced} step={step} />
      <div className="mt-4 flex gap-1.5">
        <Button
          size="sm"
          aria-label="Previous step"
          disabled={manual && step <= -1}
          onClick={() => {
            setManual(true);
            setStep((s) => Math.max(-1, s - 1));
          }}
        >
          ‹
        </Button>
        <Button
          size="sm"
          aria-label="Next step"
          disabled={manual && step >= max}
          onClick={() => {
            setManual(true);
            setStep((s) => Math.min(max, s + 1));
          }}
        >
          ›
        </Button>
        <Button size="sm" aria-pressed={manual} onClick={() => setManual((m) => !m)}>
          {manual ? 'play' : 'step'}
        </Button>
      </div>
    </>
  );
}

export function ComponentGallery() {
  const resetToken = useDemoReset();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Tile
        label="Prompt box"
        note="Auto-grows to a cap, then scrolls. Enter sends, Shift+Enter newlines, Escape clears."
        span
      >
        {(inView) => <ComposerTile key={resetToken} inView={inView} />}
      </Tile>

      <Tile
        label="Thinking states"
        note="Two phases instead of one spinner, and a count that is honest about not knowing the total."
      >
        <PhaseStepper key={resetToken} />
      </Tile>

      <Tile
        label="Response blocks"
        note="One typed union, one exhaustive renderer, five answer shapes."
      >
        {(inView) => <BlocksTile key={resetToken} inView={inView} />}
      </Tile>

      <Tile
        label="Context dropdowns"
        note="ARIA listbox — arrow keys move, Escape returns focus to the trigger."
      >
        {(inView) => <DropdownTile key={resetToken} inView={inView} />}
      </Tile>

      <Tile
        label="Copy to clipboard"
        note="Async clipboard with a selection fallback, and the result announced."
      >
        {(inView) => <CopyTile key={resetToken} inView={inView} />}
      </Tile>

      <Tile
        label="Working glyphs"
        note="The icons from the thinking panel at four times their shipped size, drawing themselves."
      >
        {(inView) => <GlyphTile key={resetToken} inView={inView} />}
      </Tile>

      <Tile
        label="Tool calls"
        note="Pending, running and done as three visually distinct states."
      >
        {(inView) => <ToolTile key={resetToken} inView={inView} />}
      </Tile>
    </div>
  );
}
