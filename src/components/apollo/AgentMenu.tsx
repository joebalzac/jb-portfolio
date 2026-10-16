import { useState } from 'react';
import { AppIcon } from './AppIcon';
import { AGENT_MODES, MODELS } from './options';
import { useMenu } from './useMenu';

type View = 'root' | 'agent' | 'model';

const ROW =
  'flex w-full cursor-pointer items-center gap-4 rounded-lg px-3 py-2.5 text-left transition-colors duration-100 hover:bg-app-hover focus-visible:bg-app-hover focus-visible:outline-none';

/**
 * The composer's agent control.
 *
 * At rest it is a read-out, not a picker: the two settings that change what a
 * reply is allowed to do and how hard it thinks, stated plainly. Either row
 * drills in to change it, which keeps the resting state calm while leaving
 * both settings one click away.
 */
export function AgentMenu({
  mode,
  onModeChange,
  model,
  onModelChange,
}: {
  mode: string;
  onModeChange: (value: string) => void;
  model: string;
  onModelChange: (value: string) => void;
}) {
  const { open, setOpen, close, rootRef, triggerRef, onMenuKeyDown } = useMenu();
  const [view, setView] = useState<View>('root');

  const modeLabel = AGENT_MODES.find((m) => m.value === mode)?.label ?? '';
  const modelLabel = MODELS.find((m) => m.value === model)?.label ?? '';

  const list = view === 'agent' ? AGENT_MODES : MODELS;
  const current = view === 'agent' ? mode : model;
  const commit = (value: string) => {
    if (view === 'agent') onModeChange(value);
    else onModelChange(value);
    setView('root');
    close();
  };

  return (
    <div className="relative" ref={rootRef} onKeyDown={onMenuKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Agent: ${modeLabel}. Model: ${modelLabel}`}
        onClick={() => {
          setView('root');
          setOpen((current) => !current);
        }}
        className="flex max-w-45 min-w-0 cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 whitespace-nowrap text-app-ink transition-colors duration-150 hover:bg-app-hover focus-visible:ring-2 focus-visible:ring-app-purple-5 focus-visible:outline-none"
      >
        <span className="truncate">{modeLabel}</span>
        <AppIcon
          name="chevron"
          className={`size-3.5 text-app-muted transition-transform duration-200 ease-product motion-reduce:transition-none ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Agent settings"
          className="absolute bottom-full right-0 z-30 mb-2.5 w-[380px] rounded-2xl bg-white p-2 shadow-[0_12px_40px_rgba(17,24,39,0.16)] ring-1 ring-black/[0.04] motion-safe:animate-menu-in"
        >
          {view === 'root' ? (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={() => setView('agent')}
                className={ROW}
              >
                <span className="text-[16px] text-app-muted">Agent</span>
                <span className="ml-auto truncate text-[16px] text-app-faint">
                  {modeLabel}
                </span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => setView('model')}
                className={ROW}
              >
                <span className="shrink-0 text-[16px] text-app-muted">Model</span>
                <span className="ml-auto truncate text-[16px] text-app-faint">
                  {modelLabel}
                </span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={() => setView('root')}
                className={`${ROW} text-[16px] text-app-muted`}
              >
                <AppIcon name="arrow-left" className="size-5" />
                {view === 'agent' ? 'Agent' : 'Model'}
              </button>
              <div className="my-1 h-px bg-app-line" />
              {list.map((option) => {
                const selected = option.value === current;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="menuitem"
                    aria-current={selected}
                    onClick={() => commit(option.value)}
                    className={`${ROW} !items-start`}
                  >
                    <span
                      aria-hidden
                      className={`mt-2 size-1.5 shrink-0 rounded-full ${
                        selected ? 'bg-app-purple-5' : 'bg-transparent'
                      }`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] text-app-ink">
                        {option.label}
                      </span>
                      {option.hint ? (
                        <span className="mt-0.5 block text-[13px] text-app-faint">
                          {option.hint}
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
