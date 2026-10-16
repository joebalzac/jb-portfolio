import { useEffect, useId, useRef, useState } from 'react';
import { AppIcon } from './AppIcon';
import { Dropdown, type DropdownOption } from './Dropdown';
import { AGENT_MODES, ATTACH_OPTIONS, SCOPES } from './options';

/**
 * The Apollo app composer.
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
  scope,
  onScopeChange,
  mode,
  onModeChange,
  placeholder = 'Describe a task or ask a question (use @ for entities and connectors)',
  autoFocus = false,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  busy?: boolean;
  scope: string;
  onScopeChange: (value: string) => void;
  mode: string;
  onModeChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const fieldId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [attachments, setAttachments] = useState<DropdownOption[]>([]);
  const [listening, setListening] = useState(false);
  const [scoped, setScoped] = useState(false);

  const canSend = value.trim().length > 0 && !busy;

  // Auto-grow: reset to auto first so the box can shrink as well as grow.
  useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = 'auto';
    node.style.height = `${Math.min(node.scrollHeight, 150)}px`;
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

  const iconButton =
    'grid size-7 shrink-0 cursor-pointer place-items-center rounded-md transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-app-purple-5 focus-visible:outline-none';

  return (
    <div
      className={`flex w-full flex-col gap-3 rounded-xl border bg-white px-4 pt-3.5 pb-3 transition-shadow duration-200 ${
        busy
          ? 'border-app-line'
          : 'border-app-line focus-within:border-app-purple-5/50 focus-within:shadow-[0_0_0_3px_rgba(121,80,242,0.08)]'
      }`}
    >
      {attachments.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {attachments.map((item) => (
            <li
              key={item.value}
              className="flex items-center gap-1.5 rounded-full border border-app-line bg-app-hover py-1 pr-1 pl-2.5 text-[12px] text-app-ink motion-safe:animate-chip-in"
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
                className="grid size-4 cursor-pointer place-items-center rounded-full text-app-faint transition-colors hover:bg-app-line hover:text-app-ink focus-visible:ring-2 focus-visible:ring-app-purple-5 focus-visible:outline-none"
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
        className="w-full resize-none bg-transparent text-[16px] leading-[1.5] text-app-ink placeholder:text-app-faint focus:outline-none disabled:text-app-muted"
      />

      <div className="flex w-full items-center gap-2 text-[15px] text-app-muted">
        <Dropdown
          label="Attach a file"
          value=""
          options={ATTACH_OPTIONS}
          onChange={(next) => {
            const option = ATTACH_OPTIONS.find((item) => item.value === next);
            if (!option) return;
            setAttachments((current) =>
              current.some((entry) => entry.value === next)
                ? current
                : [...current, option],
            );
          }}
          renderTrigger={(open) => (
            <span
              className={`${iconButton} ${
                open ? 'bg-app-hover text-app-ink' : 'hover:bg-app-hover hover:text-app-ink'
              }`}
            >
              <AppIcon name="plus" className="size-5" />
            </span>
          )}
        />

        <button
          type="button"
          onClick={() => setListening((current) => !current)}
          aria-pressed={listening}
          aria-label={listening ? 'Stop dictation' : 'Start dictation'}
          className={`${iconButton} ${
            listening
              ? 'text-app-purple-5'
              : 'hover:bg-app-hover hover:text-app-ink'
          }`}
        >
          <span
            className={listening ? 'motion-safe:animate-working-pulse' : undefined}
          >
            <AppIcon name="mic" className="size-[18px]" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => setScoped((current) => !current)}
          aria-pressed={scoped}
          aria-label="Limit the reply to the selected scope"
          className={`${iconButton} ${
            scoped ? 'text-app-purple-5' : 'hover:bg-app-hover hover:text-app-ink'
          }`}
        >
          <AppIcon name="circle" className="size-4" />
        </button>

        <Dropdown
          label="Scope"
          value={scope}
          options={SCOPES}
          onChange={onScopeChange}
        />
        <Dropdown
          label="Agent mode"
          value={mode}
          options={AGENT_MODES}
          onChange={onModeChange}
        />

        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSend}
          aria-label="Send message"
          className={`ml-auto ${iconButton} ${
            canSend
              ? 'text-app-ink hover:bg-app-hover'
              : 'cursor-default text-app-faint opacity-60'
          }`}
        >
          <AppIcon name="arrow-return" className="size-[18px]" />
        </button>
      </div>

      {listening ? (
        <p role="status" className="text-[12px] text-app-purple-5">
          Dictation is a visual affordance in this demo — no audio is captured.
        </p>
      ) : null}
    </div>
  );
}
