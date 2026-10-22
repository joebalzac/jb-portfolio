import type { ReactNode } from 'react';
import { cx } from './cx';
import { surface } from './recipes';

/**
 * Compound panel: header, body, footer.
 *
 * The composition case the flat components could not cover. `Surface` gives
 * you a box; `Panel` gives you a box with regions that know how to sit
 * against each other — the dividing rules, the padding relationship and the
 * body's fill behaviour are the component's business, not the caller's.
 *
 *   <Panel>
 *     <Panel.Header title="Prompt box" note="Auto-grows to a cap." />
 *     <Panel.Body>{children}</Panel.Body>
 *   </Panel>
 *
 * Dot notation rather than a `sections` prop array: the children read in the
 * order they render, and a consumer can interleave anything they like.
 */
export function Panel({
  tone = 'outlined',
  class: className,
  children,
}: {
  tone?: 'outlined' | 'sunken' | 'raised' | 'bare';
  class?: string;
  children: ReactNode;
}) {
  return (
    <section className={cx(surface({ tone, pad: 'none' }), 'flex flex-col', className)}>
      {children}
    </section>
  );
}

function Header({
  title,
  note,
  action,
}: {
  title: ReactNode;
  note?: ReactNode;
  /** Controls that belong to the panel, not to its content. */
  action?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4 px-4 pt-4 pb-3.5">
      <div className="min-w-0">
        <h4 className="text-sm font-medium text-ink">{title}</h4>
        {note ? (
          <p className="mt-1 text-xs leading-relaxed text-muted">{note}</p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 gap-1.5">{action}</div> : null}
    </header>
  );
}

function Body({ class: className, children }: { class?: string; children: ReactNode }) {
  return (
    <div
      className={cx(
        'flex flex-1 flex-col justify-center border-t border-line p-4',
        className,
      )}
    >
      {children}
    </div>
  );
}

function Footer({ children }: { children: ReactNode }) {
  return (
    <div className="border-t border-line px-4 py-3 text-xs leading-relaxed text-muted">
      {children}
    </div>
  );
}

Panel.Header = Header;
Panel.Body = Body;
Panel.Footer = Footer;
