/**
 * Code excerpt quoted from the repository, with its real path and line range.
 * No syntax highlighter — comments dim, everything else reads as code. The
 * citation is the point; decoration would compete with it.
 */
export function CodeExcerpt({
  file,
  startLine,
  source,
  caption,
  note,
}: {
  file: string;
  /** Omitted for an abridged snippet — numbering non-contiguous lines would lie. */
  startLine?: number;
  source: string;
  caption?: string;
  note?: string;
}) {
  const lines = source.split('\n');
  const numbered = typeof startLine === 'number';
  const base = startLine ?? 0;

  return (
    <figure className="my-6 overflow-hidden rounded-xl border border-line bg-card">
      <figcaption className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <code className="truncate font-mono text-[11px] text-muted">{file}</code>
        <span className="shrink-0 font-mono text-[10px] text-faint tabular-nums">
          {numbered ? `L${base}–${base + lines.length - 1}` : note}
        </span>
      </figcaption>
      <div className="overflow-x-auto">
        <pre className="px-4 py-4 font-mono text-[11.5px] leading-[1.75] sm:text-xs">
          <code>
            {lines.map((line, i) => {
              const comment = /^\s*(\/\/|\/\*|\*)/.test(line);
              return (
                <span
                  key={i}
                  className={
                    numbered ? 'grid grid-cols-[2.25rem_1fr]' : 'block'
                  }
                >
                  {numbered ? (
                    <span
                      aria-hidden
                      className="select-none pr-3 text-right text-faint tabular-nums"
                    >
                      {base + i}
                    </span>
                  ) : null}
                  <span className={comment ? 'text-faint' : 'text-ink'}>
                    {line || ' '}
                  </span>
                </span>
              );
            })}
          </code>
        </pre>
      </div>
      {caption ? (
        <p className="border-t border-line px-4 py-2.5 text-xs leading-relaxed text-muted">
          {caption}
        </p>
      ) : null}
    </figure>
  );
}
