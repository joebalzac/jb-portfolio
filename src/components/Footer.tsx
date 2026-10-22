import { links } from '../data/site';
import { Link } from '../ds';

export function Footer() {
  return (
    <footer className="border-t border-line px-8 py-10">
      <div className="shell flex flex-wrap items-center justify-between gap-4">
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              target={link.href.startsWith('mailto:') ? undefined : '_blank'}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <span className="font-mono text-xs text-faint">
          © {new Date().getFullYear()} Joseph Balzac
        </span>
      </div>
    </footer>
  );
}
