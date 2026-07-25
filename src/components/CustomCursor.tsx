import { useEffect, useRef, useState } from 'react';

const DOT_SIZE = 8;

export function CustomCursor() {
  const tipRef = useRef<HTMLDivElement>(null);
  const [closeMode, setCloseMode] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const tip = tipRef.current;
    if (!tip) return;

    document.documentElement.classList.add('cursor-none');

    let hovering = false;
    let isClose = false;

    const syncMode = () => {
      isClose = document.documentElement.dataset.cursorMode === 'close';
      setCloseMode(isClose);
    };

    const render = (x: number, y: number) => {
      if (isClose) {
        tip.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        return;
      }
      const scale = hovering ? 2.5 : 1;
      tip.style.transform = `translate3d(${x - DOT_SIZE / 2}px, ${y - DOT_SIZE / 2}px, 0) scale(${scale})`;
    };

    const handleMove = (event: MouseEvent) => {
      tip.style.opacity = '1';
      syncMode();
      render(event.clientX, event.clientY);
    };

    const handleOver = (event: MouseEvent) => {
      hovering = Boolean((event.target as HTMLElement).closest('a, button'));
      syncMode();
      render(event.clientX, event.clientY);
    };

    const handleLeaveWindow = () => {
      tip.style.opacity = '0';
    };

    const observer = new MutationObserver(syncMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-cursor-mode'],
    });
    syncMode();

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseover', handleOver);
    document.documentElement.addEventListener('mouseleave', handleLeaveWindow);

    return () => {
      document.documentElement.classList.remove('cursor-none');
      observer.disconnect();
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseover', handleOver);
      document.documentElement.removeEventListener('mouseleave', handleLeaveWindow);
    };
  }, []);

  return (
    <div
      ref={tipRef}
      className={
        closeMode
          ? 'pointer-events-none fixed top-0 left-0 z-100 flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1.5 text-sm text-accent opacity-0 backdrop-blur-sm transition-[opacity,transform] duration-150 ease-out'
          : 'pointer-events-none fixed top-0 left-0 z-100 h-2 w-2 rounded-full bg-ink opacity-0 transition-[opacity,transform] duration-150 ease-out'
      }
    >
      {closeMode ? (
        <>
          close <span aria-hidden>✕</span>
        </>
      ) : null}
    </div>
  );
}
