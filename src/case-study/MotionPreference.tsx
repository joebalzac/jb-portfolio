import { useReducedMotion } from '../lib/useReducedMotion';

/**
 * Reads the viewer's own preference back to them. More convincing than
 * describing the branch, and it proves the subscription is live — toggle the
 * setting in the OS and this updates without a reload.
 */
export function MotionPreference() {
  const reduced = useReducedMotion();

  return (
    <div className="rounded-xl border border-line bg-card px-4 py-4">
      <p className="font-mono text-[11px] text-faint">your system right now</p>
      <p className="mt-2.5 flex items-center gap-2 text-sm text-ink">
        <span
          aria-hidden
          className={`h-1.5 w-1.5 rounded-full ${
            reduced ? 'bg-accent' : 'bg-ink/40'
          }`}
        />
        <code className="font-mono text-xs">
          prefers-reduced-motion: {reduced ? 'reduce' : 'no-preference'}
        </code>
      </p>
      <p className="mt-3 text-xs leading-relaxed text-muted" aria-live="polite">
        {reduced
          ? 'So this page is rendering settled states directly. Section 02’s conversation is fully present rather than staged, scroll jumps land instantly, and the reveal transitions are not applied at all.'
          : 'So staged reveals, the shimmering planning state and smooth section scrolling are all active. Turn reduced motion on in your OS settings and this panel — and the rest of the page — will change without a reload.'}
      </p>
    </div>
  );
}
