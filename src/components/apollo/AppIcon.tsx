import type { ReactNode } from 'react';

/**
 * Inline icon set for the Apollo app chrome.
 *
 * The `/apollo-ui/*.svg` files are `<img>` assets with a baked-in #7A7977
 * stroke, which cannot invert for a white sidebar or a selected row with a
 * purple gradient behind it. These are drawn with `currentColor` instead, so
 * a single `text-*` class recolors them.
 */
const STROKE: Record<string, ReactNode> = {
  menu: <path d="M3.5 6h17M3.5 12h17M3.5 18h17" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.25" />
      <path d="m15.6 15.6 4.2 4.2" />
    </>
  ),
  'new-chat': (
    <>
      <path d="M11 4.5H6.2A2.2 2.2 0 0 0 4 6.7v11.1A2.2 2.2 0 0 0 6.2 20h11.1a2.2 2.2 0 0 0 2.2-2.2V13" />
      <path d="M17.6 3.6a1.98 1.98 0 0 1 2.8 2.8L12.9 14 9 15l1-3.9 7.6-7.5Z" />
    </>
  ),
  history: (
    <>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
      <path d="M3.6 4.6v4.2h4.2" />
      <path d="M12 7.8V12l3 1.8" />
    </>
  ),
  skills: (
    <>
      <path d="M14 3.5H7.2A1.7 1.7 0 0 0 5.5 5.2v13.6A1.7 1.7 0 0 0 7.2 20.5h9.6a1.7 1.7 0 0 0 1.7-1.7V8Z" />
      <path d="M14 3.5V8h4.5" />
    </>
  ),
  routines: (
    <>
      <path d="M4 10a8 8 0 0 1 13.3-3.6L20 9" />
      <path d="M20 4.5V9h-4.5" />
      <path d="M20 14a8 8 0 0 1-13.3 3.6L4 15" />
      <path d="M4 19.5V15h4.5" />
    </>
  ),
  demos: (
    <>
      <rect x="3" y="4.5" width="18" height="12" rx="1.8" />
      <path d="M9 20h6M12 16.5V20" />
    </>
  ),
  productivity: (
    <>
      <path d="m4 15.5 5-5 3.5 3.5L20 6.5" />
      <path d="M15.5 6.5H20V11" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="2.8" />
      <path d="M19.4 14a1.6 1.6 0 0 0 .3 1.8l.1.1a1.9 1.9 0 1 1-2.7 2.7l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a1.9 1.9 0 1 1-3.8 0V20a1.6 1.6 0 0 0-2.7-1.2l-.1.1a1.9 1.9 0 1 1-2.7-2.7l.1-.1A1.6 1.6 0 0 0 4 13.4h-.1a1.9 1.9 0 1 1 0-3.8H4a1.6 1.6 0 0 0 1.2-2.7l-.1-.1a1.9 1.9 0 1 1 2.7-2.7l.1.1A1.6 1.6 0 0 0 10.6 4v-.1a1.9 1.9 0 1 1 3.8 0V4a1.6 1.6 0 0 0 2.7 1.2l.1-.1a1.9 1.9 0 1 1 2.7 2.7l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a1.9 1.9 0 1 1 0 3.8H20a1.6 1.6 0 0 0-1.5 1Z" />
    </>
  ),
  admin: (
    <>
      <path d="M14.2 6.3a3.9 3.9 0 0 0 5.2 5.1l-7.6 7.6a2 2 0 1 1-2.8-2.8l7.6-7.6" />
      <path d="m4.6 4.6 4.6 4.6" />
      <path d="M8.4 3.5 3.5 8.4l2.6 2.6 4.9-4.9Z" />
    </>
  ),
  plus: <path d="M12 5.5v13M5.5 12h13" />,
  mic: (
    <>
      <rect x="9.2" y="3" width="5.6" height="11" rx="2.8" />
      <path d="M5.5 11.2a6.5 6.5 0 0 0 13 0" />
      <path d="M12 17.7V21" />
    </>
  ),
  circle: <circle cx="12" cy="12" r="7.5" />,
  chevron: <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />,
  'chevron-right': <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />,
  'arrow-right': <path d="M4.5 12h15m-6-6 6 6-6 6" />,
  'arrow-return': <path d="M20 5v6.5a2.5 2.5 0 0 1-2.5 2.5H5m0 0 4.5-4.5M5 14l4.5 4.5" />,
  minimize: <path d="M20 4.5 14.5 10m0 0V5.6m0 4.4h4.4M4 19.5 9.5 14m0 0v4.4m0-4.4H5.1" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  folder: (
    <>
      <path d="M3.5 7.3A1.8 1.8 0 0 1 5.3 5.5h3.4l2 2.6h8A1.8 1.8 0 0 1 20.5 10v7.2a1.8 1.8 0 0 1-1.8 1.8H5.3a1.8 1.8 0 0 1-1.8-1.8Z" />
    </>
  ),
  paperclip: (
    <path d="M20 10.6 11.6 19a4.4 4.4 0 0 1-6.3-6.2l8.4-8.4a2.9 2.9 0 1 1 4.1 4.2l-8.4 8.4a1.5 1.5 0 0 1-2.1-2.1l7.8-7.8" />
  ),
  entities: (
    <>
      <rect x="3" y="4" width="18" height="4.2" rx="1.4" />
      <path d="M5 8.2v9.4A2.4 2.4 0 0 0 7.4 20h9.2a2.4 2.4 0 0 0 2.4-2.4V8.2" />
      <path d="M10 12h4" />
    </>
  ),
  connectors: (
    <>
      <rect x="3.6" y="3.6" width="7" height="7" rx="1.6" />
      <rect x="13.4" y="3.6" width="7" height="7" rx="1.6" />
      <rect x="3.6" y="13.4" width="7" height="7" rx="1.6" />
      <rect x="13.4" y="13.4" width="7" height="7" rx="1.6" />
    </>
  ),
  'arrow-left': <path d="M19 12H5m6-6-6 6 6 6" />,
  chat: (
    <>
      <path d="M20.5 11.5a7.6 7.6 0 0 1-8.2 7.6 8.6 8.6 0 0 1-2.6-.5L4.5 20l1.4-4.6a7.5 7.5 0 0 1-.9-3.6 7.6 7.6 0 0 1 7.7-7.6 7.6 7.6 0 0 1 7.8 7.3Z" />
      <path d="M9 10.5h6M9 13.5h4" />
    </>
  ),
};

export function AppIcon({
  name,
  className = 'size-[18px]',
  strokeWidth = 1.7,
}: {
  name: keyof typeof STROKE | string;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`shrink-0 ${className}`}
    >
      {STROKE[name] ?? null}
    </svg>
  );
}

/** The Apollo mark. */
export function ApolloMark({ className = 'size-[15px]' }: { className?: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      className={`shrink-0 ${className}`}
    >
      <path
        d="M43.7275 11.8802C46.075 15.4878 47.4404 19.7934 47.4404 24.4183C47.4404 37.1324 37.1331 47.4398 24.4189 47.4398C19.794 47.4398 15.4884 46.0744 11.8809 43.7269L13.0566 42.8363C16.3592 44.8781 20.2509 46.0579 24.4189 46.058C36.3702 46.058 46.0586 36.3696 46.0586 24.4183C46.0586 20.2503 44.8787 16.3586 42.8369 13.056L43.7275 11.8802ZM24.4189 1.39782C28.4565 1.39782 32.2508 2.43817 35.5498 4.26403L34.3779 5.2025C31.3968 3.65437 28.0102 2.77868 24.4189 2.77868C12.4678 2.77874 2.7794 12.4672 2.7793 24.4183C2.7793 28.0095 3.655 31.3962 5.20312 34.3773L4.26367 35.5482C2.43822 32.2494 1.39844 28.4554 1.39844 24.4183C1.39854 11.7043 11.705 1.39788 24.4189 1.39782Z"
        fill="currentColor"
      />
      <path
        d="M44.446 3.54403L31.6678 20.4183C29.815 22.865 29.7168 26.2173 31.4233 28.7682L36.7877 36.7875L28.7684 31.4231C26.2175 29.7166 22.8652 29.8148 20.4185 31.6676L3.54422 44.4458L16.6519 28.0856C18.6054 25.6473 18.7635 22.2274 17.0432 19.6194L12.0511 12.0509L19.6195 17.043C22.2276 18.7633 25.6475 18.6052 28.0858 16.6517L44.446 3.54403Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Suggestion-card glyph. */
export function StarsIcon({ className = 'size-[18px]' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
      className={`shrink-0 ${className}`}
    >
      <path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828l.645-1.937zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.734 1.734 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.734 1.734 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.734 1.734 0 0 0 3.407 2.31l.387-1.162zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732L9.1 2.137a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L10.863.1z" />
    </svg>
  );
}
