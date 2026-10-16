/**
 * Extracted from the Apollo conversation surface so the interactive demos
 * reuse the real implementation instead of a lookalike copy.
 */

export function UiIcon({ src, className }: { src: string; className: string }) {
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      className={`block aspect-square max-w-none shrink-0 object-contain ${className}`}
    />
  );
}
