import { useState, type ReactNode } from 'react';
import { ApolloBlocks } from '../components/apollo/ApolloBlocks';
import { Composer } from '../components/apollo/Composer';
import { CopyButton } from '../components/apollo/CopyButton';
import { EXCHANGES } from '../components/apollo/conversations';
import { Dropdown } from '../components/apollo/Dropdown';
import { AGENT_MODES, SCOPES } from '../components/apollo/options';
import type { MessageBlock } from '../components/apollo/types';
import { ThinkingTrace } from '../components/craft/ThinkingTrace';
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

const CONTROL =
  'cursor-pointer rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-muted transition-colors hover:border-faint hover:text-ink disabled:cursor-default disabled:opacity-35';

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
  children: ReactNode;
  span?: boolean;
}) {
  return (
    <section
      className={`flex flex-col rounded-xl border border-line bg-bg ${
        span ? 'lg:col-span-2' : ''
      }`}
    >
      <header className="flex items-start justify-between gap-4 px-4 pt-4 pb-3.5">
        <div className="min-w-0">
          <h4 className="text-sm font-medium text-ink">{label}</h4>
          <p className="mt-1 text-xs leading-relaxed text-muted">{note}</p>
        </div>
        {action ? <div className="flex shrink-0 gap-1.5">{action}</div> : null}
      </header>
      <div className="flex flex-1 flex-col justify-center border-t border-line p-4">
        {children}
      </div>
    </section>
  );
}

function ComposerTile() {
  const [value, setValue] = useState('');
  const [scope, setScope] = useState('cross-org');
  const [mode, setMode] = useState('full');
  const [sent, setSent] = useState<string[]>([]);

  return (
    <div className="flex flex-col gap-3">
      <Composer
        value={value}
        onChange={setValue}
        onSubmit={() => {
          if (!value.trim()) return;
          setSent((current) => [value.trim(), ...current].slice(0, 2));
          setValue('');
        }}
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

function BlocksTile() {
  const [index, setIndex] = useState(0);
  const active = BLOCK_SAMPLES[index];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {BLOCK_SAMPLES.map((sample, i) => (
          <button
            key={sample.type}
            type="button"
            onClick={() => setIndex(i)}
            aria-pressed={i === index}
            className={`cursor-pointer rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors duration-200 ${
              i === index
                ? 'border-ink bg-ink text-bg'
                : 'border-line text-muted hover:border-faint hover:text-ink'
            }`}
          >
            {sample.label}
          </button>
        ))}
      </div>
      <div className="min-h-38 rounded-lg border border-app-line bg-white p-3.5">
        <ApolloBlocks blocks={[active.block]} />
      </div>
    </div>
  );
}

function DropdownTile() {
  const [scope, setScope] = useState('balance');
  const [mode, setMode] = useState('assist');
  const scopeLabel = SCOPES.find((s) => s.value === scope)?.label;
  const modeLabel = AGENT_MODES.find((m) => m.value === mode)?.label;

  return (
    <div className="flex flex-col gap-3">
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
        <span className="text-faint">context ›</span> {scopeLabel} · {modeLabel}
      </p>
    </div>
  );
}

function CopyTile() {
  const draft = firstBlockOfType('draft');
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border border-app-line bg-white p-3.5">
        <ApolloBlocks blocks={[draft]} />
      </div>
      <CopyButton text={draft.text} label="Copy draft message" />
    </div>
  );
}

/** Replay is the interaction: the loop runs once, on demand. */
function TraceTile() {
  const [run, setRun] = useState(0);
  return (
    <Tile
      label="Thinking trace"
      note="Streams the reasoning, holds it, then collapses to a receipt."
      action={
        <button type="button" onClick={() => setRun((r) => r + 1)} className={CONTROL}>
          replay
        </button>
      }
    >
      <ThinkingTrace key={run} />
    </Tile>
  );
}

/** Hand the timeline to the reader so they can stop on a single state. */
function ToolTile() {
  const [auto, setAuto] = useState(false);
  const [step, setStep] = useState(0);
  const max = 2;

  return (
    <Tile
      label="Tool calls"
      note="Pending, running and done as three visually distinct states."
      action={
        <>
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(-1, s - 1))}
            disabled={auto || step <= -1}
            aria-label="Previous step"
            className={CONTROL}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(max, s + 1))}
            disabled={auto || step >= max}
            aria-label="Next step"
            className={CONTROL}
          >
            ›
          </button>
          <button
            type="button"
            onClick={() => setAuto((a) => !a)}
            aria-pressed={auto}
            className={CONTROL}
          >
            {auto ? 'manual' : 'auto'}
          </button>
        </>
      }
    >
      <ToolCallStack autoplay={auto} step={step} />
    </Tile>
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
        <ComposerTile key={resetToken} />
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
        <BlocksTile key={resetToken} />
      </Tile>

      <Tile
        label="Context dropdowns"
        note="ARIA listbox — arrow keys move, Escape returns focus to the trigger."
      >
        <DropdownTile key={resetToken} />
      </Tile>

      <Tile
        label="Copy to clipboard"
        note="Async clipboard with a selection fallback, and the result announced."
      >
        <CopyTile key={resetToken} />
      </Tile>

      <TraceTile key={`trace-${resetToken}`} />
      <ToolTile key={`tool-${resetToken}`} />
    </div>
  );
}
