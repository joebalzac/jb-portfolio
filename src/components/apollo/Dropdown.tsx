import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { AppIcon } from './AppIcon';
import { UiIcon } from './UiIcon';

export type DropdownOption = {
  value: string;
  label: string;
  hint?: string;
};

/**
 * Menu button + listbox, built to the ARIA listbox pattern rather than a
 * styled <select>, because the trigger has to sit inline in the composer and
 * carry the app's own typography.
 *
 * Keyboard: Enter/Space/Down/Up opens, arrows move the active option, Enter or
 * Space commits, Escape closes and returns focus to the trigger, Home/End jump.
 * Pointer: click outside or blur closes without committing.
 */
export function Dropdown({
  label,
  value,
  options,
  onChange,
  align = 'start',
  icon,
  placeholder,
  renderTrigger,
}: {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  align?: 'start' | 'end';
  icon?: string;
  /** Shown when `value` matches no option — e.g. an action menu with no state. */
  placeholder?: string;
  /** Replaces the default trigger content, for icon-only menus. */
  renderTrigger?: (open: boolean) => ReactNode;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  useEffect(() => {
    if (!open) return;
    setActiveIndex(Math.max(0, selectedIndex));
  }, [open, selectedIndex]);

  // Close on outside pointer, and keep focus behavior predictable.
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open]);

  // Move DOM focus with the active option so screen readers follow along.
  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.children[activeIndex] as
      | HTMLElement
      | undefined;
    node?.focus();
  }, [activeIndex, open]);

  const commit = (index: number) => {
    const option = options[index];
    if (option) onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className="relative min-w-0" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={selected ? `${label}: ${selected.label}` : label}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={
          renderTrigger
            ? 'cursor-pointer rounded-md focus-visible:ring-2 focus-visible:ring-app-purple-5 focus-visible:outline-none'
            : 'flex max-w-45 min-w-0 cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 whitespace-nowrap text-app-muted transition-colors duration-150 hover:bg-app-hover hover:text-app-ink focus-visible:ring-2 focus-visible:ring-app-purple-5 focus-visible:outline-none'
        }
      >
        {renderTrigger ? (
          renderTrigger(open)
        ) : (
          <>
            {icon ? <UiIcon src={icon} className="size-3.5" /> : null}
            {selected || placeholder ? (
              <span className="truncate">{selected?.label ?? placeholder}</span>
            ) : null}
            <AppIcon
              name="chevron"
              className={`size-3.5 transition-transform duration-200 ease-product motion-reduce:transition-none ${
                open ? 'rotate-180' : ''
              }`}
            />
          </>
        )}
      </button>

      {open ? (
        <ul
          ref={listRef}
          id={id}
          role="listbox"
          aria-label={label}
          className={`absolute bottom-full z-30 mb-2 max-h-56 w-max min-w-45 overflow-y-auto rounded-lg border border-app-line bg-white py-1 shadow-[0_8px_24px_rgba(17,24,39,0.12)] motion-safe:animate-menu-in ${
            align === 'end' ? 'right-0' : 'left-0'
          }`}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              close();
            } else if (event.key === 'ArrowDown') {
              event.preventDefault();
              setActiveIndex((index) => (index + 1) % options.length);
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              setActiveIndex(
                (index) => (index - 1 + options.length) % options.length,
              );
            } else if (event.key === 'Home') {
              event.preventDefault();
              setActiveIndex(0);
            } else if (event.key === 'End') {
              event.preventDefault();
              setActiveIndex(options.length - 1);
            } else if (event.key === 'Tab') {
              setOpen(false);
            }
          }}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              /* eslint-disable-next-line jsx-a11y/role-supports-aria-props */
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                tabIndex={index === activeIndex ? 0 : -1}
                onClick={() => commit(index)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    commit(index);
                  }
                }}
                className={`flex cursor-pointer items-start gap-2 px-3 py-1.75 text-left text-[14px] leading-snug transition-colors duration-100 focus-visible:outline-none ${
                  index === activeIndex
                    ? 'bg-app-selected text-app-ink'
                    : 'text-app-ink hover:bg-app-hover'
                }`}
              >
                <span
                  aria-hidden
                  className={`mt-1.25 size-1.25 shrink-0 rounded-full ${
                    isSelected ? 'bg-app-purple-5' : 'bg-transparent'
                  }`}
                />
                <span className="min-w-0">
                  <span className="block truncate">{option.label}</span>
                  {option.hint ? (
                    <span className="mt-0.5 block text-[11px] text-app-faint">
                      {option.hint}
                    </span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
