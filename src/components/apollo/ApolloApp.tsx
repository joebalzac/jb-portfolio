import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { ApolloBlocks } from './ApolloBlocks';
import { AppIcon, ApolloMark } from './AppIcon';
import { Composer } from './Composer';
import { CopyButton } from './CopyButton';
import { EXCHANGES, PERSONAS, userMessageText } from './conversations';
import { SuggestionCard } from './SuggestionCard';
import { ThinkingStatus } from './ThinkingStatus';
import { PLANNING_MS, THINKING_MS } from './timing';
import type { ChatMessage } from './types';

type Phase = 'idle' | 'planning' | 'working';

const NAV_ITEMS = [
  { id: 'new', icon: 'new-chat', label: 'New chat' },
  { id: 'history', icon: 'history', label: 'History' },
  { id: 'skills', icon: 'skills', label: 'Skills' },
  { id: 'routines', icon: 'routines', label: 'Routines' },
  { id: 'demos', icon: 'demos', label: 'Shared demos' },
  { id: 'productivity', icon: 'productivity', label: 'Productivity' },
  { id: 'settings', icon: 'settings', label: 'Settings' },
  { id: 'admin', icon: 'admin', label: 'Admin', more: true },
] as const;

/** Sidebar history. Fixtures — no account, no stored conversations. */
const CHATS = [
  'General capabilities across portfolio',
  'Overview of property performance',
  'Available assistant actions',
  'AI work assignment rules',
  'Prospect and resident sentiment',
  'Property management summary',
  'Move-out reason breakdown',
  'Property feedback digest',
];

/** Reply used when a free-typed prompt has no scripted answer behind it. */
function fallbackReply(mode: string): ChatMessage {
  return {
    role: 'apollo',
    blocks: [
      {
        type: 'text',
        text:
          'This surface runs on scripted fixtures, so I don’t have a real answer for that one — there’s no model or service behind this page.' +
          (mode === 'read'
            ? ' You’re also in Read only mode, so I wouldn’t draft or send anything here.'
            : ''),
      },
      {
        type: 'text',
        text: 'Start a new chat and pick a suggestion to see a full scripted exchange, including tables, drafts and action chips.',
      },
    ],
  };
}

/** Plain text of a message, for the clipboard. */
function messageText(message: ChatMessage) {
  return message.blocks
    .map((block) => {
      if (block.type === 'text' || block.type === 'draft') return block.text;
      if (block.type === 'list') return block.items.map((i) => `• ${i}`).join('\n');
      if (block.type === 'actions') return block.items.join(' / ');
      return [block.columns.join('\t'), ...block.rows.map((r) => r.join('\t'))].join('\n');
    })
    .join('\n\n');
}

/**
 * The Apollo application surface, interactive.
 *
 * This is the in-product chrome — a plain app window, no marketing stage
 * behind it. The marketing carousel further down the page is the styled
 * version of the same conversation components.
 */
export function ApolloApp() {
  const reduceMotion = useReducedMotion();
  const [thread, setThread] = useState<ChatMessage[]>([]);
  const [persona, setPersona] = useState<number | null>(null);
  const [cursor, setCursor] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [composer, setComposer] = useState('');
  const [scope, setScope] = useState('cross-org');
  const [mode, setMode] = useState('full');
  const [navItem, setNavItem] = useState('new');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [closed, setClosed] = useState(false);
  const timers = useRef<number[]>([]);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  // Elapsed readout while working — counts up, never pretends to know a total.
  useEffect(() => {
    if (phase !== 'working') return;
    setElapsed(0);
    const id = window.setInterval(() => setElapsed((v) => v + 0.1), 100);
    return () => window.clearInterval(id);
  }, [phase]);

  // Anchor a long answer to its top rather than the thread bottom.
  useEffect(() => {
    const node = scrollerRef.current;
    const last = node?.lastElementChild as HTMLElement | null;
    if (!node || !last || thread.length === 0) return;
    node.scrollTop =
      last.offsetHeight > node.clientHeight - 8
        ? last.offsetTop
        : node.scrollHeight;
  }, [phase, thread]);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      clearTimers();
      setStopped(false);
      setNavItem('new');

      const matched = PERSONAS.findIndex((p) => p.prompt === trimmed);

      /* Three cases, and only two of them advance the script:
         a suggestion starts that conversation; the exact next scripted line
         continues it; anything else gets the honest fallback and leaves the
         cursor alone, so a free-typed aside can't pull down the next
         scripted answer as if it were a response. */
      const pending = persona !== null ? EXCHANGES[persona]?.[cursor] : undefined;
      const continues =
        matched < 0 &&
        pending?.role === 'user' &&
        userMessageText(pending) === trimmed;

      const activePersona = matched >= 0 ? matched : persona;
      const nextCursor = matched >= 0 ? 1 : continues ? cursor + 1 : cursor;

      setThread((current) =>
        matched >= 0
          ? [{ role: 'user', blocks: [{ type: 'text', text: trimmed }] }]
          : [...current, { role: 'user', blocks: [{ type: 'text', text: trimmed }] }],
      );
      setPersona(activePersona);
      setComposer('');

      const scripted =
        (matched >= 0 || continues) && activePersona !== null
          ? EXCHANGES[activePersona]?.[nextCursor]
          : undefined;
      const reply =
        scripted && scripted.role === 'apollo' ? scripted : fallbackReply(mode);
      const advanceTo = scripted ? nextCursor + 1 : cursor;

      if (reduceMotion) {
        setThread((current) => [...current, reply]);
        setCursor(advanceTo);
        return;
      }

      setPhase('planning');
      timers.current.push(window.setTimeout(() => setPhase('working'), PLANNING_MS));
      timers.current.push(
        window.setTimeout(() => {
          setPhase('idle');
          setThread((current) => [...current, reply]);
          setCursor(advanceTo);
        }, PLANNING_MS + THINKING_MS),
      );
    },
    [clearTimers, cursor, mode, persona, reduceMotion],
  );

  /** Cancels a pending reply. Lands immediately — that is the whole point. */
  const stop = useCallback(() => {
    clearTimers();
    setPhase('idle');
    setStopped(true);
  }, [clearTimers]);

  const newChat = useCallback(() => {
    clearTimers();
    setThread([]);
    setPersona(null);
    setCursor(0);
    setPhase('idle');
    setComposer('');
    setElapsed(0);
    setStopped(false);
    setNavItem('new');
  }, [clearTimers]);

  const busy = phase !== 'idle';

  /* Only offer to continue when a reply actually follows. One fixture thread
     ends on a user line, and a "continue" chip that leads to the no-answer
     fallback would read as a broken script rather than an honest limit. */
  const nextScripted = persona !== null ? EXCHANGES[persona]?.[cursor] : undefined;
  const replyAfter = persona !== null ? EXCHANGES[persona]?.[cursor + 1] : undefined;
  const followUp =
    nextScripted?.role === 'user' && replyAfter?.role === 'apollo'
      ? userMessageText(nextScripted)
      : null;

  const headerButton =
    'grid size-8 cursor-pointer place-items-center rounded-md text-app-muted transition-colors hover:bg-app-hover hover:text-app-ink focus-visible:ring-2 focus-visible:ring-app-purple-5 focus-visible:outline-none';

  return (
    <section
      data-interactive
      aria-label="Interactive Apollo application"
      className="w-full"
    >
      <div
        className={`relative flex overflow-hidden rounded-xl border border-app-line bg-white shadow-[0_1px_2px_rgba(17,24,39,0.04),0_12px_32px_rgba(17,24,39,0.06)] ${
          expanded ? 'h-[min(860px,90vh)]' : 'h-[min(720px,82vh)]'
        }`}
      >
        {closed ? (
          <div className="grid flex-1 place-items-center">
            <button
              type="button"
              onClick={() => setClosed(false)}
              className="flex cursor-pointer items-center gap-2 rounded-full bg-app-active px-4 py-2.5 text-[15px] text-white transition-transform duration-200 ease-product hover:scale-105 focus-visible:ring-2 focus-visible:ring-app-purple-5 focus-visible:outline-none motion-reduce:transition-none"
            >
              <ApolloMark className="size-4" />
              Open Apollo
            </button>
          </div>
        ) : (
          <>
            {/* Sidebar */}
            <aside
              className={`absolute inset-y-0 left-0 z-20 flex w-[272px] shrink-0 flex-col border-r border-app-line bg-white transition-transform duration-300 ease-product motion-reduce:transition-none panel:static panel:translate-x-0 ${
                sidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
              }`}
            >
              <div className="flex h-14 shrink-0 items-center gap-2.5 px-4">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Hide navigation"
                  className="grid size-7 cursor-pointer place-items-center rounded-md text-app-ink transition-colors hover:bg-app-hover focus-visible:ring-2 focus-visible:ring-app-purple-5 focus-visible:outline-none"
                >
                  <AppIcon name="menu" className="size-[19px]" />
                </button>
                <span className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.01em] text-app-ink">
                  <span className="grid size-5 place-items-center rounded-[4px] bg-app-active text-white">
                    <ApolloMark className="size-[11px]" />
                  </span>
                  Apollo
                </span>
                <button
                  type="button"
                  aria-label="Search conversations"
                  className="ml-auto grid size-7 cursor-pointer place-items-center rounded-md text-app-muted transition-colors hover:bg-app-hover hover:text-app-ink focus-visible:ring-2 focus-visible:ring-app-purple-5 focus-visible:outline-none"
                >
                  <AppIcon name="search" className="size-[17px]" />
                </button>
              </div>

              <nav aria-label="Apollo" className="flex flex-col gap-0.5 px-2.5 pt-1">
                {NAV_ITEMS.map((item) => {
                  const active = navItem === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-current={active ? 'page' : undefined}
                      onClick={() => {
                        setNavItem(item.id);
                        if (item.id === 'new') newChat();
                      }}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-[2px] px-3 py-[7px] text-left text-[15px] transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-app-purple-5 focus-visible:outline-none ${
                        active
                          ? 'bg-app-active font-medium text-white'
                          : 'text-app-ink hover:bg-app-hover'
                      }`}
                    >
                      <AppIcon
                        name={item.icon}
                        className={`size-[18px] ${active ? 'text-white' : 'text-app-muted'}`}
                      />
                      {item.label}
                      {'more' in item && item.more ? (
                        <AppIcon
                          name="chevron-right"
                          className={`ml-auto size-3.5 ${active ? 'text-white/80' : 'text-app-faint'}`}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </nav>

              <p className="px-4 pt-6 pb-1 text-[13px] font-medium text-app-muted">
                Folders
              </p>
              <button
                type="button"
                className="mx-2.5 flex cursor-pointer items-center gap-3 rounded-[2px] px-3 py-[7px] text-left text-[15px] text-app-faint transition-colors hover:bg-app-hover hover:text-app-ink focus-visible:ring-2 focus-visible:ring-app-purple-5 focus-visible:outline-none"
              >
                <AppIcon name="plus" className="size-[18px]" />
                New folder
              </button>

              <p className="px-4 pt-5 pb-1 text-[13px] font-medium text-app-muted">
                Chats
              </p>
              <ul className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-3">
                {CHATS.map((chat, index) => {
                  const active = persona !== null && index === 4;
                  return (
                    <li key={chat}>
                      <button
                        type="button"
                        className={`flex w-full cursor-pointer items-center gap-3 rounded-[2px] px-3 py-[7px] text-left text-[15px] transition-colors hover:bg-app-hover focus-visible:ring-2 focus-visible:ring-app-purple-5 focus-visible:outline-none ${
                          active ? 'font-medium text-app-ink' : 'text-app-ink'
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`size-1.5 shrink-0 rounded-full ${
                            active
                              ? 'bg-app-purple-5'
                              : 'border border-app-faint/70'
                          }`}
                        />
                        <span className="truncate">{chat}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>

            {/* Main column */}
            <div className="flex min-w-0 flex-1 flex-col">
              <header className="flex h-14 shrink-0 items-center gap-2 px-4">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Show navigation"
                  className={`${headerButton} panel:hidden`}
                >
                  <AppIcon name="menu" className="size-[19px]" />
                </button>
                <button
                  type="button"
                  onClick={newChat}
                  className="ml-auto flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-[15px] text-app-ink transition-colors hover:bg-app-hover focus-visible:ring-2 focus-visible:ring-app-purple-5 focus-visible:outline-none"
                >
                  <AppIcon name="new-chat" className="size-[18px]" />
                  <span className="hidden panel:inline">New Chat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  aria-pressed={expanded}
                  aria-label={expanded ? 'Restore size' : 'Expand'}
                  className={headerButton}
                >
                  <AppIcon name="minimize" className="size-[18px]" />
                </button>
                <button
                  type="button"
                  onClick={() => setClosed(true)}
                  aria-label="Close Apollo"
                  className={headerButton}
                >
                  <AppIcon name="close" className="size-[19px]" />
                </button>
              </header>

              <div
                ref={scrollerRef}
                className="min-h-0 flex-1 overflow-y-auto px-5 panel:px-8"
              >
                <div className="mx-auto w-full max-w-[1000px] pt-6 pb-4">
                  {thread.length === 0 && !busy ? (
                    <div className="@container">
                      <h2 className="text-[30px] leading-tight font-semibold tracking-[-0.02em] text-app-ink panel:text-[34px]">
                        Welcome back, Joseph
                      </h2>
                      <p className="mt-2 text-[16px] text-app-muted">
                        Continue where you left off, or start something new.
                      </p>

                      <h3 className="mt-9 text-[17px] font-semibold tracking-[-0.01em] text-app-ink">
                        Continue
                      </h3>
                      <button
                        type="button"
                        onClick={() => send(PERSONAS[0].prompt)}
                        className="group mt-3 flex w-full cursor-pointer items-center gap-3.5 rounded-xl border border-app-line bg-white px-4 py-3.5 text-left transition-[border-color,box-shadow,transform] duration-[128ms] hover:-translate-y-px hover:border-app-purple-5/40 hover:shadow-[0_4px_16px_rgba(17,24,39,0.06)] focus-visible:ring-2 focus-visible:ring-app-purple-5 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                      >
                        <span className="flex size-[38px] shrink-0 items-center justify-center rounded-[10px] bg-app-purple-0 text-app-purple-5">
                          <AppIcon name="chat" className="size-[18px]" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-semibold tracking-[-0.01em] text-app-ink">
                            Post-tour follow-ups across the portfolio
                          </span>
                          <span className="mt-1 block text-[14px] text-app-muted">
                            Caladan Lofts · 7d ago
                          </span>
                        </span>
                        <AppIcon
                          name="arrow-right"
                          className="size-[18px] text-app-purple-5 transition-transform duration-[128ms] group-hover:translate-x-0.5 motion-reduce:transition-none"
                        />
                      </button>

                      <h3 className="mt-9 text-[17px] font-semibold tracking-[-0.01em] text-app-ink">
                        Things Apollo can help with
                      </h3>
                      <p className="mt-1.5 text-[15px] text-app-muted">
                        Start with something Apollo can help you get done.
                      </p>
                      <div className="mt-4 grid gap-3.5 @min-[720px]:grid-cols-2">
                        {PERSONAS.map((p) => (
                          <SuggestionCard
                            key={p.title}
                            title={p.title}
                            description={p.prompt}
                            onClick={() => send(p.prompt)}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-3">
                    {thread.map((message, index) =>
                      message.role === 'user' ? (
                        <div
                          key={`u-${index}`}
                          className="flex w-full justify-end motion-safe:animate-message-enter"
                        >
                          <p className="m-0 max-w-[min(620px,88%)] rounded-xl bg-app-hover px-4 py-3 text-[15px] leading-[1.5] whitespace-pre-wrap text-app-ink">
                            {userMessageText(message)}
                          </p>
                        </div>
                      ) : (
                        <div
                          key={`a-${index}`}
                          className="group flex w-full flex-col gap-1.5 motion-safe:animate-message-enter"
                        >
                          <ApolloBlocks blocks={message.blocks} />
                          <div className="flex transition-opacity duration-200 panel:opacity-0 panel:group-focus-within:opacity-100 panel:group-hover:opacity-100 motion-reduce:opacity-100">
                            <CopyButton text={messageText(message)} />
                          </div>
                        </div>
                      ),
                    )}

                    {phase === 'planning' ? (
                      <p className="m-0 py-1 motion-safe:animate-message-enter">
                        <span className="bg-planning bg-clip-text text-[15px] text-transparent motion-safe:animate-planning-shimmer motion-reduce:bg-none motion-reduce:text-app-muted">
                          Planning next moves
                        </span>
                      </p>
                    ) : null}

                    {phase === 'working' ? (
                      <ThinkingStatus elapsedSeconds={elapsed} />
                    ) : null}

                    {busy ? (
                      <div className="flex">
                        <button
                          type="button"
                          onClick={stop}
                          className="cursor-pointer rounded-full border border-app-line bg-white px-3 py-1 text-[13px] text-app-ink transition-colors hover:border-app-purple-5/50 focus-visible:ring-2 focus-visible:ring-app-purple-5 focus-visible:outline-none"
                        >
                          Stop
                        </button>
                      </div>
                    ) : null}

                    {stopped && !busy ? (
                      <p className="m-0 text-[13px] text-app-muted motion-safe:animate-chip-in">
                        Stopped before replying.
                      </p>
                    ) : null}

                    {followUp && !busy ? (
                      <div className="flex flex-wrap gap-2 motion-safe:animate-chip-in">
                        <button
                          type="button"
                          onClick={() => send(followUp)}
                          className="cursor-pointer rounded-full border border-app-line bg-white px-3 py-1.5 text-left text-[13px] text-app-ink transition-colors hover:border-app-purple-5/50 focus-visible:ring-2 focus-visible:ring-app-purple-5 focus-visible:outline-none"
                        >
                          <span className="text-app-faint">continue →</span>{' '}
                          {followUp}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="shrink-0 px-5 pb-5 panel:px-8">
                <div className="mx-auto w-full max-w-[1000px]">
                  <Composer
                    value={composer}
                    onChange={setComposer}
                    onSubmit={() => send(composer)}
                    busy={busy}
                    scope={scope}
                    onScopeChange={setScope}
                    mode={mode}
                    onModeChange={setMode}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
