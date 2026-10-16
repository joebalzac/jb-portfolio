import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { sections, type SectionId } from '../data/apollo';
import { PresentationContext } from './presentationContext';

function scrollToSection(id: SectionId, instant: boolean) {
  const node = document.getElementById(id);
  if (!node) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  node.scrollIntoView({
    /* `html { scroll-behavior: smooth }` is set globally, and 'auto' resolves
       to that CSS value — so suppressing motion needs an explicit 'instant'. */
    behavior: reduce || instant ? 'instant' : 'smooth',
    block: 'start',
  });
}

/** True when a keystroke belongs to whatever the user is typing in. */
function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    el.isContentEditable
  );
}

export function PresentationProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(
    () =>
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('present') === '1',
  );
  const [index, setIndex] = useState(0);
  const [resetToken, setResetToken] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);

  // Keep ?present=1 in the URL so a presentation link can be opened directly.
  useEffect(() => {
    const url = new URL(window.location.href);
    const has = url.searchParams.get('present') === '1';
    if (active === has) return;
    if (active) url.searchParams.set('present', '1');
    else url.searchParams.delete('present');
    window.history.replaceState(null, '', url.toString());
  }, [active]);

  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(sections.length - 1, next));
      /* Stepping to a neighbor animates; a numbered jump across the page
         would be a long, disorienting smooth scroll, so it lands instantly. */
      scrollToSection(sections[clamped].id, Math.abs(clamped - index) > 1);
      setIndex(clamped);
    },
    [index],
  );

  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);
  const reset = useCallback(() => setResetToken((token) => token + 1), []);
  const toggle = useCallback(() => setActive((value) => !value), []);
  const exit = useCallback(() => {
    setActive(false);
    setHelpOpen(false);
  }, []);
  const toggleHelp = useCallback(() => setHelpOpen((value) => !value), []);

  // Scroll-spy: keeps the section index honest when the user scrolls manually
  // rather than stepping with the keyboard.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const found = sections.findIndex((s) => s.id === visible.target.id);
        if (found >= 0) setIndex(found);
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.25, 0.5] },
    );
    sections.forEach((section) => {
      const node = document.getElementById(section.id);
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const key = event.key;

      // Toggle works outside presentation mode too — that is how you enter it.
      if (key === 'p' || key === 'P') {
        event.preventDefault();
        toggle();
        return;
      }

      if (!active) return;

      if (key === 'ArrowRight' || key === 'ArrowDown' || key === 'PageDown') {
        event.preventDefault();
        next();
      } else if (key === 'ArrowLeft' || key === 'ArrowUp' || key === 'PageUp') {
        event.preventDefault();
        prev();
      } else if (key === 'r' || key === 'R') {
        event.preventDefault();
        reset();
      } else if (key === 'Escape') {
        event.preventDefault();
        exit();
      } else if (key === '?') {
        event.preventDefault();
        toggleHelp();
      } else if (/^[1-9]$/.test(key)) {
        event.preventDefault();
        go(Number(key) - 1);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, exit, go, next, prev, reset, toggle, toggleHelp]);

  const value = useMemo(
    () => ({
      active,
      toggle,
      exit,
      index,
      go,
      next,
      prev,
      resetToken,
      reset,
      helpOpen,
      toggleHelp,
    }),
    [active, toggle, exit, index, go, next, prev, resetToken, reset, helpOpen, toggleHelp],
  );

  return (
    <PresentationContext.Provider value={value}>
      {children}
    </PresentationContext.Provider>
  );
}
