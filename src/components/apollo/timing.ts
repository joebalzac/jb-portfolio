/**
 * Timing for the Apollo conversation player.
 *
 * Kept in its own module because these values are the interaction design —
 * they are read by the component, by the derived dwell-time calculation, and
 * by the case study that documents them. One source, three consumers.
 */
export const MIN_INTERVAL_MS = 8000;
export const STEP_MS = 1100;
export const HOLD_AFTER_MS = 5000;
export const REVEAL_OFFSET_MS = 220;
export const SEND_AFTER_TYPE_MS = 280;
export const REPLY_BEAT_MS = 350;
export const PLANNING_MS = 600;
export const THINKING_MS = 1000;
export const TYPE_INTERVAL_MS = 24;

/**
 * How long a prompt takes to type out. Long prompts advance two characters a
 * tick so a 150-character question does not outstay its welcome.
 */
export function typingDurationMs(text: string) {
  const step = text.length > 90 ? 2 : 1;
  return Math.ceil(Math.max(text.length, 1) / step) * TYPE_INTERVAL_MS;
}
