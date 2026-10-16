import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Open/close plumbing shared by the composer's popover menus.
 *
 * Handles the three things every menu gets wrong: closing on an outside
 * pointer, closing on Escape, and returning focus to the trigger afterwards so
 * keyboard users are not dropped at the top of the document.
 */
export function useMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open]);

  /** Roving arrow-key focus across whatever menuitems are currently rendered. */
  const onMenuKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      event.preventDefault();
      const items = Array.from(
        rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
      ).filter((node) => !node.hasAttribute('disabled'));
      if (items.length === 0) return;
      const index = items.indexOf(document.activeElement as HTMLElement);
      const next =
        event.key === 'ArrowDown'
          ? (index + 1) % items.length
          : (index - 1 + items.length) % items.length;
      items[next]?.focus();
    },
    [close],
  );

  return { open, setOpen, close, rootRef, triggerRef, onMenuKeyDown };
}
