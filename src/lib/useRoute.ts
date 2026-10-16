import { useCallback, useEffect, useState } from 'react';

/**
 * Minimal History API router.
 *
 * The site is a single scrolling page plus one real URL (/work/apollo), so a
 * routing library would be a dependency bought for one route. This hook is the
 * whole router: read the path, subscribe to popstate, push on navigate.
 *
 * Links stay real <a href> elements and only intercept plain left-clicks, so
 * cmd-click, middle-click and "open in new tab" keep working, and the page
 * still resolves if JS hasn't booted yet.
 */
export function normalizePath(pathname: string) {
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

export function useRoute() {
  const [path, setPath] = useState(() =>
    typeof window === 'undefined' ? '/' : normalizePath(window.location.pathname),
  );

  useEffect(() => {
    const sync = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    const next = normalizePath(to);
    if (next === normalizePath(window.location.pathname)) return;
    if (options?.replace) window.history.replaceState(null, '', to);
    else window.history.pushState(null, '', to);
    setPath(next);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  return { path, navigate };
}

/** True for a click we can handle client-side without stealing browser behavior. */
export function isPlainClick(event: React.MouseEvent) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}
