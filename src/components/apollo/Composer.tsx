import { useEffect, useId, useRef, useState } from 'react';
import { Dropdown, type DropdownOption } from './Dropdown';
import { AGENT_MODES, ATTACH_OPTIONS, COMMUNITIES } from './options';
import { UiIcon } from './UiIcon';

/**
 * The prompt box.
 *
 * Auto-grows to the content up to a cap, then scrolls — a composer that grows
 * without limit pushes the conversation off screen, which is the thing the
 * person is trying to read. Enter submits, Shift+Enter inserts a newline,
 * Escape clears a draft. The send control is disabled rather than hidden while
 * empty, so its position never shifts.
 */
export function Composer({
  value,
  onChange,
  onSubmit,
  busy = false,
  community,
  onCommunityChange,
  mode,
  onModeChange,
  placeholder = 'Ask Apollo anything…',
  autoFocus = false,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  busy?: boolean;
  community: string;
  onCommunityChange: (value: string) => void;
  mode: string;
  onModeChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const fieldId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [attachments, setAttachments] = useState<DropdownOption[]>([]);
  const [listening, setListening] = useState(false);
  const [citing, setCiting] = useState(false);
  const [scoped, setScoped] = useState(false);

  const canSend = value.trim().length > 0 && !busy;

  // Auto-grow: reset to auto first so the box can shrink as well as grow.
  useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = 'auto';
    node.style.height = `${Math.min(node.scrollHeight, 132)}px`;
  }, [value]);

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  // The mic is a visual affordance only — no audio is captured.
  useEffect(() => {
    if (!listening) return;
    const timer = window.setTimeout(() => setListening(false), 2600);
    return () => window.clearTimeout(timer);
  }, [listening]);

  return (
    <div
      className={`flex w-full max-w-164.5 shrink-0 flex-col justify-between gap-4 self-center rounded-lg border-hair bg-white px-3 py-2.5 shadow-composer transition-shadow duration-200 panel:min-h-35 panel:p-4.5 ${
        busy
          ? 'border-product-line'
          : 'border-product-ring focus-within:ring-2 focus-within:ring-product-ring/40'
      }`}
    >
      {attachments.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {attachments.map((item) => (
            <li
              key={item.value}
              className="flex items-center gap-1.5 rounded-full border border-product-line bg-product-soft py-1 pr-1 pl-2.5 text-[11px] text-product-label motion-safe:animate-chip-in"
            >
              {item.label}
              <button
                type="button"
                onClick={() =>
                  setAttachments((current) =>
                    current.filter((entry) => entry.value !== item.value),
                  )
                }
                aria-label={`Remove ${item.label}`}
                className="grid size-4 cursor-pointer place-items-center rounded-full text-product-faint transition-colors hover:bg-product-line hover:text-product focus-visible:ring-2 focus-visible:ring-product-ring focus-visible:outline-none"
              >
                <span aria-hidden>×</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <label className="sr-only" htmlFor={fieldId}>
        Message Apollo
      </label>
      <textarea
        id={fieldId}
        ref={textareaRef}
        rows={1}
        value={value}
        disabled={busy}
        placeholder={busy ? 'Apollo is working…' : placeholder}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (canSend) onSubmit();
          } else if (event.key === 'Escape' && value) {
            event.preventDefault();
            onChange('');
          }
        }}
        className="w-full resize-none bg-transparent text-sm leading-product tracking-product text-product placeholder:text-product-faint focus:outline-none disabled:text-product-muted"
      />

      <div className="flex min-h-4.5 w-full items-center justify-between gap-3 text-[13px] text-product-muted">
        <div className="flex min-w-0 flex-1 items-center gap-4 panel:gap-5.25">
          <Dropdown
            label="Attach a file"
            value=""
            placeholder="Attach"
            options={ATTACH_OPTIONS}
            icon="/apollo-ui/attach.svg"
            onChange={(next) => {
              const option = ATTACH_OPTIONS.find((item) => item.value === next);
              if (!option) return;
              setAttachments((current) =>
                current.some((entry) => entry.value === next)
                  ? current
                  : [...current, option],
              );
            }}
          />

          <button
            type="button"
            onClick={() => setListening((current) => !current)}
            aria-pressed={listening}
            aria-label={listening ? 'Stop dictation' : 'Start dictation'}
            className={`grid size-4.5 shrink-0 cursor-pointer place-items-center rounded-md transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-product-ring focus-visible:outline-none ${
              listening ? 'text-product-accent' : 'hover:text-product'
            }`}
          >
            <span
              className={
                listening ? 'motion-safe:animate-working-pulse' : undefined
              }
            >
              <UiIcon src="/apollo-ui/microphone.svg" className="size-4.5" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCiting((current) => !current)}
            aria-pressed={citing}
            aria-label="Cite sources in the reply"
            className={`grid size-4.5 shrink-0 cursor-pointer place-items-center rounded-md transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-product-ring focus-visible:outline-none ${
              citing ? 'text-product-accent' : 'hover:text-product'
            }`}
          >
            <UiIcon src="/apollo-ui/document.svg" className="size-4.5" />
          </button>

          <button
            type="button"
            onClick={() => setScoped((current) => !current)}
            aria-pressed={scoped}
            aria-label="Limit the reply to the selected community"
            className={`grid size-4.5 shrink-0 cursor-pointer place-items-center rounded-md transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-product-ring focus-visible:outline-none ${
              scoped ? 'text-product-accent' : 'hover:text-product'
            }`}
          >
            <UiIcon src="/apollo-ui/context.svg" className="size-3.5" />
          </button>

          <span className="hidden min-w-0 panel:contents">
            <Dropdown
              label="Community"
              value={community}
              options={COMMUNITIES}
              onChange={onCommunityChange}
            />
            <Dropdown
              label="Agent mode"
              value={mode}
              options={AGENT_MODES}
              onChange={onModeChange}
            />
          </span>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSend}
          aria-label="Send message"
          className={`grid size-6.5 shrink-0 cursor-pointer place-items-center rounded-full transition-all duration-200 ease-product focus-visible:ring-2 focus-visible:ring-product-ring focus-visible:outline-none motion-reduce:transition-none ${
            canSend
              ? 'bg-product hover:scale-105'
              : 'cursor-default opacity-40'
          }`}
        >
          <UiIcon
            src="/apollo-ui/send.svg"
            className={`size-4 ${canSend ? 'brightness-0 invert' : ''}`}
          />
        </button>
      </div>

      {listening ? (
        <p role="status" className="text-[11px] text-product-accent">
          Dictation is a visual affordance in this demo — no audio is captured.
        </p>
      ) : null}
    </div>
  );
}
