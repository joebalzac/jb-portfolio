import { useEffect, useState } from 'react';
import { nav, profile } from '../data/site';

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

export function Nav() {
  const time = useNycClock();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-end px-8 py-5">
        <nav className="flex items-center gap-6 text-sm text-ink/70">
          {nav.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="hover:text-ink transition-colors"
            >
              {item.label}
            </a>
          ))}
          <span className="text-line">/</span>
          <span className="font-mono text-muted">
            {time} {profile.location}
          </span>
        </nav>
      </div>
    </header>
  );
}
