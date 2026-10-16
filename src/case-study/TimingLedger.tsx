import {
  HOLD_AFTER_MS,
  PLANNING_MS,
  REVEAL_OFFSET_MS,
  SEND_AFTER_TYPE_MS,
  STEP_MS,
  THINKING_MS,
  typingDurationMs,
} from '../components/apollo/timing';

/**
 * The derived schedule, made visible.
 *
 * Every number here is imported from the component rather than restated, so
 * the ledger cannot drift from the implementation it documents — which is the
 * same argument the decision itself makes.
 */
const PROMPT =
  'I was in tours all day — who haven’t I marked shown or written notes for?';

const BEATS = [
  { constant: 'REVEAL_OFFSET_MS', label: 'Settle before anything moves', ms: REVEAL_OFFSET_MS },
  { constant: 'typingDurationMs()', label: 'Prompt types, per character', ms: typingDurationMs(PROMPT) },
  { constant: 'SEND_AFTER_TYPE_MS', label: 'Beat before send', ms: SEND_AFTER_TYPE_MS },
  { constant: 'PLANNING_MS', label: 'Acknowledge the request', ms: PLANNING_MS },
  { constant: 'THINKING_MS', label: 'Working, elapsed counting', ms: THINKING_MS },
  { constant: 'STEP_MS', label: 'Answer reveals', ms: STEP_MS },
  { constant: 'HOLD_AFTER_MS', label: 'Hold so it can be read', ms: HOLD_AFTER_MS },
];

const TOTAL = BEATS.reduce((sum, beat) => sum + beat.ms, 0);

export function TimingLedger() {
  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-card">
      <figcaption className="border-b border-line px-4 py-2.5">
        <p className="font-mono text-[11px] text-muted">
          One exchange, computed not configured
        </p>
      </figcaption>

      <div className="px-4 py-4">
        {/* Proportional ribbon of the schedule. */}
        <div
          className="flex h-2 w-full overflow-hidden rounded-full bg-bg"
          role="img"
          aria-label={`Schedule totalling ${(TOTAL / 1000).toFixed(2)} seconds`}
        >
          {BEATS.map((beat, index) => (
            <span
              key={beat.constant}
              style={{ width: `${(beat.ms / TOTAL) * 100}%` }}
              className={`h-full border-r border-card last:border-r-0 ${
                index % 2 === 0 ? 'bg-ink/70' : 'bg-ink/35'
              }`}
            />
          ))}
        </div>

        <dl className="mt-4 space-y-1.5">
          {BEATS.map((beat) => (
            <div
              key={beat.constant}
              className="grid grid-cols-[1fr_auto] items-baseline gap-3"
            >
              <dt className="min-w-0 truncate">
                <code className="font-mono text-[11px] text-ink">
                  {beat.constant}
                </code>
                <span className="ml-2 text-xs text-muted">{beat.label}</span>
              </dt>
              <dd className="font-mono text-[11px] text-muted tabular-nums">
                {beat.ms}ms
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-3 grid grid-cols-[1fr_auto] items-baseline gap-3 border-t border-line pt-3">
          <span className="text-xs text-ink">
            Dwell time for this persona
          </span>
          <span className="font-mono text-[11px] font-medium text-ink tabular-nums">
            {(TOTAL / 1000).toFixed(2)}s
          </span>
        </div>
      </div>

      <p className="border-t border-line px-4 py-2.5 text-xs leading-relaxed text-muted">
        These values are imported from the component, not copied into this page.
        Change a constant or edit the prompt and this ledger — and the progress
        indicator in section 02 — both follow.
      </p>
    </figure>
  );
}
