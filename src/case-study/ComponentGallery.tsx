import { useState } from 'react';
import { ApolloBlocks } from '../components/apollo/ApolloBlocks';
import { Composer } from '../components/apollo/Composer';
import { CopyButton } from '../components/apollo/CopyButton';
import { EXCHANGES } from '../components/apollo/conversations';
import { Dropdown } from '../components/apollo/Dropdown';
import { AGENT_MODES, COMMUNITIES } from '../components/apollo/options';
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

function Tile({
  label,
  note,
  children,
  span = false,
}: {
  label: string;
  note: string;
  children: React.ReactNode;
  span?: boolean;
}) {
  return (
    <section
      className={`flex flex-col rounded-xl border border-line bg-card ${
        span ? 'lg:col-span-2' : ''
      }`}
    >
      <div className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-3">
        <h4 className="text-sm font-medium text-ink">{label}</h4>
        <span className="shrink-0 font-mono text-[10px] text-faint">live</span>
      </div>
      <div className="flex flex-1 flex-col justify-center bg-bg p-4">
        {children}
      </div>
      <p className="border-t border-line px-4 py-3 text-xs leading-relaxed text-muted">
        {note}
      </p>
    </section>
  );
}

/** Standalone prompt box, wired to a visible log of what it submitted. */
function ComposerTile() {
  const [value, setValue] = useState('');
  const [community, setCommunity] = useState('caladan');
  const [mode, setMode] = useState('full');
  const [sent, setSent] = useState<string[]>([]);

  return (
    <div className="flex flex-col gap-3">
      <Composer
        value={value}
        onChange={setValue}
        onSubmit={() => {
          if (!value.trim()) return;
          setSent((current) => [value.trim(), ...current].slice(0, 3));
          setValue('');
        }}
        community={community}
        onCommunityChange={setCommunity}
        mode={mode}
        onModeChange={setMode}
        placeholder="Type here — Enter sends, Shift+Enter is a newline"
      />
      <div className="min-h-14">
        {sent.length === 0 ? (
          <p className="font-mono text-[11px] text-faint">
            nothing submitted yet
          </p>
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
                : 'border-line bg-bg text-muted hover:border-faint hover:text-ink'
            }`}
          >
            {sample.label}
          </button>
        ))}
      </div>
      <div className="min-h-38 rounded-lg border border-product-line bg-product-bg p-3.5">
        <ApolloBlocks blocks={[active.block]} />
      </div>
      <p className="font-mono text-[11px] text-faint">
        {'{ type: "'}
        {active.type}
        {'" }'} — one renderer, five shapes
      </p>
    </div>
  );
}

function DropdownTile() {
  const [community, setCommunity] = useState('balance');
  const [mode, setMode] = useState('assist');

  const communityLabel = COMMUNITIES.find((c) => c.value === community)?.label;
  const modeLabel = AGENT_MODES.find((m) => m.value === mode)?.label;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-product-line bg-white px-3.5 py-3 text-[13px]">
        <Dropdown
          label="Community"
          value={community}
          options={COMMUNITIES}
          onChange={setCommunity}
        />
        <span aria-hidden className="text-product-line">
          |
        </span>
        <Dropdown
          label="Agent mode"
          value={mode}
          options={AGENT_MODES}
          onChange={setMode}
        />
      </div>
      <p className="font-mono text-[11px] text-muted">
        <span className="text-faint">context ›</span> {communityLabel} ·{' '}
        {modeLabel}
      </p>
      <p className="text-xs leading-relaxed text-muted">
        Open one and use the arrow keys — focus moves with the active option,
        Escape returns to the trigger.
      </p>
    </div>
  );
}

function CopyTile() {
  const draft = firstBlockOfType('draft');

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border border-product-line bg-product-bg p-3.5">
        <ApolloBlocks blocks={[draft]} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <CopyButton text={draft.text} label="Copy draft message" />
        <span className="font-mono text-[10px] text-faint">
          try it — then paste
        </span>
      </div>
    </div>
  );
}

export function ComponentGallery() {
  const resetToken = useDemoReset();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Tile
        label="Prompt box"
        note="Auto-grows to a cap, then scrolls — a composer that grows without limit pushes away the conversation you are trying to read. Send is disabled rather than hidden while empty, so the control never moves."
        span
      >
        <ComposerTile key={resetToken} />
      </Tile>

      <Tile
        label="Thinking states"
        note="Two phases instead of one spinner. The first acknowledges the request inside 600ms; the second accounts for the time with a counter that counts up, because there is no honest denominator for a progress bar here."
      >
        <PhaseStepper key={resetToken} />
      </Tile>

      <Tile
        label="Response blocks"
        note="A discriminated union of block types with one exhaustive renderer. A new answer shape is a data change plus one branch, not a new component — and TypeScript makes a missing case a build error."
      >
        <BlocksTile key={resetToken} />
      </Tile>

      <Tile
        label="Context dropdowns"
        note="Built to the ARIA listbox pattern rather than a styled select, because the trigger sits inline in the composer and has to carry product typography. Agent mode is in the composer because it changes what a reply may do on your behalf."
      >
        <DropdownTile key={resetToken} />
      </Tile>

      <Tile
        label="Copy to clipboard"
        note="Writes through the async Clipboard API, falls back to a selection copy when the browser refuses, and announces the result — a purely visual checkmark is invisible to a screen reader."
      >
        <CopyTile />
      </Tile>

      <Tile
        label="Thinking trace"
        note="Streams the reasoning, holds it long enough to read, then collapses to a receipt that says how long it took. Expanded by default while streaming, because hiding work in progress is what makes a wait feel like a hang."
      >
        <ThinkingTrace key={resetToken} />
      </Tile>

      <Tile
        label="Tool call choreography"
        note="Pending, running and done as three visually distinct states on one timeline. Each step is a scheduled timer torn down on reset, so an interruption never leaves a half-finished sequence."
      >
        <ToolCallStack key={resetToken} />
      </Tile>
    </div>
  );
}
