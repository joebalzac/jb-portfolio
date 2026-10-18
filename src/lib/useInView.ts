import { useEffect, useRef, useState } from 'react';

/**
 * Reports whether an element is on screen.
 *
 * Demos use it to run only while visible: animation off screen is wasted work,
 * and a loop that has been cycling unseen for a minute shows you whatever
 * frame it happens to be on rather than starting from the beginning.
 */
export function useInView<T extends HTMLElement>({
  threshold = 0.25,
  once = false,
}: { threshold?: number; once?: boolean } = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.disconnect();
      },
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [once, threshold]);

  return { ref, inView };
}
