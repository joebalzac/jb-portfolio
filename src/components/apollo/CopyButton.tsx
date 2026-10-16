import { useEffect, useRef, useState } from 'react';

/**
 * Clipboard write with a feedback state and a fallback.
 *
 * `navigator.clipboard` needs a secure context and can reject when the
 * document is not focused, so a failed write falls back to a selection-based
 * copy rather than silently doing nothing. The result is announced, because a
 * purely visual confirmation is invisible to a screen reader.
 */
function legacyCopy(text: string) {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  document.body.removeChild(area);
  return ok;
}

export function CopyButton({
  text,
  label = 'Copy message',
}: {
  text: string;
  label?: string;
}) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const copy = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      ok = legacyCopy(text);
    }
    setState(ok ? 'copied' : 'failed');
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState('idle'), 1800);
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      className="group flex shrink-0 cursor-pointer items-center gap-1.25 rounded-md px-1.5 py-1 text-[11px] text-product-faint transition-colors duration-150 hover:bg-product-hover hover:text-product-label focus-visible:ring-2 focus-visible:ring-product-ring focus-visible:outline-none"
    >
      <span aria-hidden className="grid size-3.5 place-items-center">
        {state === 'copied' ? (
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
            <path
              d="M3.2 8.4 6.2 11.4 12.8 4.8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
            <rect
              x="5.4"
              y="5.4"
              width="8"
              height="8"
              rx="1.4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="M10.6 5.4V4a1.4 1.4 0 0 0-1.4-1.4H4a1.4 1.4 0 0 0-1.4 1.4v5.2A1.4 1.4 0 0 0 4 10.6h1.4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </span>
      <span className="font-mono">
        {state === 'copied' ? 'copied' : state === 'failed' ? 'blocked' : 'copy'}
      </span>
      <span role="status" aria-live="polite" className="sr-only">
        {state === 'copied'
          ? 'Copied to clipboard'
          : state === 'failed'
            ? 'Copy was blocked by the browser'
            : ''}
      </span>
    </button>
  );
}
