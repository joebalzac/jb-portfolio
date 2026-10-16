import { useEffect, useId, useRef, useState } from 'react';
import { UiIcon } from './UiIcon';

export type DropdownOption = {
  value: string;
  label: string;
  hint?: string;
};

/**
 * Menu button + listbox, built to the ARIA listbox pattern rather than a
 * styled <select>, because the trigger has to sit inline in the composer and
 * carry product typography.
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
}: {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  align?: 'start' | 'end';
  icon?: string;
  /** Shown when `value` matches no option — e.g. an action menu with no state. */
  placeholder?: string;
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
        className="flex max-w-45 min-w-0 cursor-pointer items-center gap-1.25 rounded-md px-1 py-0.5 whitespace-nowrap text-product-muted transition-colors duration-150 hover:bg-product-hover hover:text-product focus-visible:ring-2 focus-visible:ring-product-ring focus-visible:outline-none"
      >
        {icon ? <UiIcon src={icon} className="size-3.5" /> : null}
        {selected || placeholder ? (
          <span className="truncate">{selected?.label ?? placeholder}</span>
        ) : null}
        <span
          aria-hidden
          className={`transition-transform duration-200 ease-product motion-reduce:transition-none ${
            open ? 'rotate-180' : ''
          }`}
        >
          <UiIcon src="/apollo-ui/chevron.svg" className="size-3.5" />
        </span>
      </button>

      {open ? (
        <ul
          ref={listRef}
          id={id}
          role="listbox"
          aria-label={label}
          className={`absolute bottom-full z-30 mb-2 max-h-56 w-max min-w-45 overflow-y-auto rounded-lg border border-product-line bg-white py-1 shadow-composer motion-safe:animate-menu-in ${
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
                className={`flex cursor-pointer items-start gap-2 px-3 py-1.75 text-left text-product-chip leading-product tracking-product transition-colors duration-100 focus-visible:outline-none ${
                  index === activeIndex
                    ? 'bg-product-soft text-product'
                    : 'text-product-label hover:bg-product-soft'
                }`}
              >
                <span
                  aria-hidden
                  className={`mt-1.25 size-1.25 shrink-0 rounded-full ${
                    isSelected ? 'bg-product-accent' : 'bg-transparent'
                  }`}
                />
                <span className="min-w-0">
                  <span className="block truncate">{option.label}</span>
                  {option.hint ? (
                    <span className="mt-0.5 block text-[11px] text-product-faint">
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
