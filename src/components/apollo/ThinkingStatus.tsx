/**
 * Extracted from the Apollo conversation surface so the interactive demos
 * reuse the real implementation instead of a lookalike copy.
 */

const WORKING_ACTIONS = [
  { type: "conversation", label: "Loading Conversations" },
  { type: "data", label: "Analyzing lease data" },
  { type: "action", label: "Sending follow-up email" },
] as const;

function ActionGlyph({
  type,
}: {
  type: (typeof WORKING_ACTIONS)[number]["type"];
}) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (type === "conversation") {
    return (
      <svg viewBox="0 0 16 16" width="10.5" height="10.5" aria-hidden>
        <path d="M3.2 2.4h6.4L12 4.8v7.6a1 1 0 0 1-1 1H3.2a1 1 0 0 1-1-1V3.4a1 1 0 0 1 1-1Z" {...common} />
        <path d="M4.4 7.2h5.2M4.4 9.6h3.2" {...common} />
      </svg>
    );
  }
  if (type === "data") {
    return (
      <svg viewBox="0 0 16 16" width="10.5" height="10.5" aria-hidden>
        <rect x="1.6" y="2.2" width="12.8" height="9.2" rx="1.2" {...common} />
        <path d="M3.2 5.2 1.8 6.4 3.2 7.6M5.6 8.2 7.8 4.4" {...common} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" width="10.5" height="10.5" aria-hidden>
      <path d="M2.4 5.4 8 2.6l5.6 2.8L8 8.2 2.4 5.4Z" {...common} />
      <path d="M2.4 5.4V10.6L8 13.4l5.6-2.8V5.4" {...common} />
    </svg>
  );
}

export function ThinkingStatus({ elapsedSeconds }: { elapsedSeconds: number }) {
  return (
    <div className="flex w-full flex-col motion-safe:animate-message-enter">
      <div className="flex min-h-8 w-full items-center gap-1.75 px-1.25 py-1.25 text-sm leading-product tracking-product text-product-muted">
        <span
          className="grid size-5.25 place-items-center text-product-accent motion-safe:animate-working-pulse"
          aria-hidden
        >
          <svg viewBox="0 0 21 21" width="21" height="21" aria-hidden>
            <path
              d="M10.5 1.8 11.9 8.1 18.2 10.5 11.9 12.9 10.5 19.2 9.1 12.9 2.8 10.5 9.1 8.1 10.5 1.8Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span>Working</span>
        <span
          className="size-0.5 shrink-0 rounded-full bg-product-muted"
          aria-hidden
        />
        <span>{elapsedSeconds.toFixed(1)}s</span>
      </div>
      <div className="flex w-full gap-1.75 px-1.25">
        <span
          className="mx-2 w-px shrink-0 self-stretch bg-product-line"
          aria-hidden
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1.75 py-3.5 text-sm leading-product tracking-product text-product-muted">
          <p className="m-0 w-full">
            Let me load the matching skills to continue.
          </p>
          {WORKING_ACTIONS.map((action) => (
            <div
              className="flex w-full items-center gap-1.75"
              key={action.type}
            >
              <span className="grid size-5.25 shrink-0 place-items-center overflow-hidden rounded-product-mark border border-product-line bg-product-soft text-product-label">
                <ActionGlyph type={action.type} />
              </span>
              <span>{action.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
