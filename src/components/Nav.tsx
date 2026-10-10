import { useEffect, useId, useRef, useState } from 'react';
import { nav, profile } from '../data/site';
import { GitHubIcon } from './GitHubIcon';

const clockFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

function useNycClock() {
  const [time, setTime] = useState(() => clockFormatter.format(new Date()));

  useEffect(() => {
    const id = setInterval(() => {
      setTime(clockFormatter.format(new Date()));
    }, 1000 * 15);
    return () => clearInterval(id);
  }, []);

  return time;
}

function MenuMark({ open }: { open: boolean }) {
  return (
    <span className="relative block h-2.5 w-5.5" aria-hidden="true">
      <span
        className={`absolute top-0 right-0 h-mark rounded-full bg-current transition-menu duration-300 ease-product motion-reduce:transition-none ${
          open ? 'w-5.5 translate-y-shift rotate-45' : 'w-3.25'
        }`}
      />
      <span
        className={`absolute right-0 bottom-0 h-mark w-5.5 rounded-full bg-current transition-transform duration-300 ease-product motion-reduce:transition-none ${
          open ? '-translate-y-shift -rotate-45' : ''
        }`}
      />
    </span>
  );
}

export function Nav() {
  const time = useNycClock();
  const menuId = useId();
  const headerRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)');
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };

    const onPointer = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <header ref={headerRef} className="sticky top-0 z-50">
      <div className="border-b border-line bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-end px-8 py-5">
          <nav className="hidden items-center gap-6 text-sm text-ink/70 md:flex">
            {nav.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="transition-colors hover:text-ink"
              >
                {item.label}
              </a>
            ))}
            <span className="text-line">/</span>
            <span className="font-mono text-muted">
              {time} {profile.location}
            </span>
            <span className="text-line">/</span>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="github-mark inline-flex overflow-visible text-muted transition-colors hover:text-ink"
            >
              <GitHubIcon className="size-3.5" />
            </a>
          </nav>

          <button
            ref={buttonRef}
            type="button"
            className="-my-3 flex h-11 w-11 items-center justify-end text-ink md:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            <MenuMark open={open} />
          </button>
        </div>
      </div>

      <div
        className={`absolute inset-x-0 top-full grid transition-rows duration-300 ease-product motion-reduce:transition-none md:hidden ${
          open ? 'grid-rows-open' : 'pointer-events-none grid-rows-closed'
        }`}
      >
        <div className="overflow-hidden">
          <nav
            id={menuId}
            inert={!open}
            aria-label="Sections"
            className="border-b border-line bg-bg"
          >
            <div className="mx-auto flex max-w-4xl flex-col px-8 pt-1 pb-4 text-sm text-ink/70">
              {nav.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center justify-end transition-colors hover:text-ink"
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-1 flex items-center justify-end gap-4 text-muted">
                <span className="font-mono">
                  {time} {profile.location}
                </span>
                <span className="text-line">/</span>
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className="github-mark -mr-3 inline-flex h-11 w-11 items-center justify-end overflow-visible pr-3 text-muted transition-colors hover:text-ink"
                >
                  <GitHubIcon className="size-3.5" />
                </a>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
