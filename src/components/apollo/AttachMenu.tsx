import { useRef, useState } from 'react';
import { AppIcon } from './AppIcon';
import { CONNECTORS, ENTITIES, SKILLS } from './options';
import type { DropdownOption } from './Dropdown';
import { useMenu } from './useMenu';

type View = 'root' | 'entities' | 'connectors' | 'skills';

const SECTIONS: {
  id: Exclude<View, 'root'>;
  icon: string;
  label: string;
  key: string;
  options: DropdownOption[];
}[] = [
  { id: 'entities', icon: 'entities', label: 'Entities', key: '@', options: ENTITIES },
  { id: 'connectors', icon: 'connectors', label: 'Connectors', key: '@', options: CONNECTORS },
  { id: 'skills', icon: 'skills', label: 'Skills', key: '/', options: SKILLS },
];

const ROW =
  'flex w-full cursor-pointer items-center gap-3.5 rounded-lg px-3 py-2.5 text-left text-[16px] text-app-ink transition-colors duration-100 hover:bg-app-hover focus-visible:bg-app-hover focus-visible:outline-none';

/**
 * The composer's `+` menu.
 *
 * Mirrors the product: upload, then the three things the composer can mention
 * inline, each badged with the character that invokes it — so the menu teaches
 * the keyboard shortcut rather than replacing it.
 */
export function AttachMenu({ onAdd }: { onAdd: (label: string) => void }) {
  const { open, setOpen, close, rootRef, triggerRef, onMenuKeyDown } = useMenu();
  const [view, setView] = useState<View>('root');
  const fileRef = useRef<HTMLInputElement>(null);

  const section = SECTIONS.find((entry) => entry.id === view);

  const pick = (label: string) => {
    onAdd(label);
    setView('root');
    close();
  };

  return (
    <div className="relative" ref={rootRef} onKeyDown={onMenuKeyDown}>
      {/* Real picker: reads the chosen file's name only — nothing is uploaded. */}
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) pick(file.name);
          event.target.value = '';
        }}
      />

      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Add context"
        onClick={() => {
          setView('root');
          setOpen((current) => !current);
        }}
        className={`grid size-7 shrink-0 cursor-pointer place-items-center rounded-md transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-app-purple-5 focus-visible:outline-none ${
          open
            ? 'bg-app-selected text-app-ink'
            : 'text-app-muted hover:bg-app-hover hover:text-app-ink'
        }`}
      >
        <AppIcon name="plus" className="size-5" />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Add context"
          className="absolute bottom-full left-0 z-30 mb-2.5 w-[320px] rounded-2xl bg-white p-2 shadow-[0_12px_40px_rgba(17,24,39,0.16)] ring-1 ring-black/[0.04] motion-safe:animate-menu-in"
        >
          {view === 'root' ? (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={() => fileRef.current?.click()}
                className={ROW}
              >
                <AppIcon name="paperclip" className="size-5 text-app-ink" />
                Upload from device
              </button>

              {SECTIONS.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  role="menuitem"
                  onClick={() => setView(entry.id)}
                  className={ROW}
                >
                  <AppIcon name={entry.icon} className="size-5 text-app-ink" />
                  {entry.label}
                  <span className="ml-auto flex items-center gap-2.5">
                    <span className="rounded-md bg-app-selected px-2 py-0.5 font-mono text-[13px] text-app-faint">
                      {entry.key}
                    </span>
                    <AppIcon
                      name="chevron-right"
                      className="size-4 text-app-faint"
                    />
                  </span>
                </button>
              ))}
            </>
          ) : section ? (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={() => setView('root')}
                className={`${ROW} text-app-muted`}
              >
                <AppIcon name="arrow-left" className="size-5" />
                {section.label}
              </button>
              <div className="my-1 h-px bg-app-line" />
              {section.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="menuitem"
                  onClick={() => pick(option.label)}
                  className={`${ROW} flex-col !items-start gap-0.5`}
                >
                  <span>{option.label}</span>
                  {option.hint ? (
                    <span className="text-[13px] text-app-faint">
                      {option.hint}
                    </span>
                  ) : null}
                </button>
              ))}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
