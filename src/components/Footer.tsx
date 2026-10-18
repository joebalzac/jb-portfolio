import { links } from '../data/site';

export function Footer({ shellClass = 'max-w-4xl' }: { shellClass?: string } = {}) {
  return (
    <footer className="border-t border-line px-8 py-10">
      <div
        className={`mx-auto flex w-full flex-wrap items-center justify-between gap-4 ${shellClass}`}
      >
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith('mailto:') ? undefined : '_blank'}
              rel="noreferrer"
              className="text-sm text-muted transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <span className="font-mono text-xs text-faint">
          © {new Date().getFullYear()} Joseph Balzac
        </span>
      </div>
    </footer>
  );
}
