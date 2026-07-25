import { useState } from 'react';
import { links } from '../../data/site';

const email = links.find((link) => link.label === 'Email')?.href.replace('mailto:', '') ?? '';

export function CopyEmail() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-2 rounded-full border border-line bg-bg px-4 py-2 text-sm text-ink transition-colors hover:border-ink/30"
    >
      <span className="grid h-4 w-4 place-items-center">
        {copied ? (
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
            <path
              d="M3 8.5L6.5 12L13 4.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
            <rect
              x="5.5"
              y="5.5"
              width="8"
              height="8"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <path
              d="M3 10.5V3.5C3 2.94772 3.44772 2.5 4 2.5H10.5"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        )}
      </span>
      {copied ? 'copied' : 'copy email'}
    </button>
  );
}
