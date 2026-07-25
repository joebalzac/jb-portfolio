import { writing } from '../data/site';
import { Section } from './Section';

export function Writing() {
  return (
    <Section id="writing" title="writing">
      {writing.length === 0 ? (
        <p className="text-sm italic text-muted">Nothing published yet.</p>
      ) : (
        <ul className="space-y-3">
          {writing.map((post) => (
            <li key={post.title} className="flex items-baseline gap-4">
              <a
                href={post.url}
                className="text-sm text-ink underline decoration-line underline-offset-2 hover:decoration-ink transition-colors"
              >
                {post.title}
              </a>
              <span className="font-mono text-xs text-faint">
                {post.date}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
