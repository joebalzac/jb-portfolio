import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { ApolloBlocks } from './ApolloBlocks';
import { Composer } from './Composer';
import { CopyButton } from './CopyButton';
import { DESKTOP_STAGE, MOBILE_STAGE, NAV } from './chrome';
import { EXCHANGES, PERSONAS, userMessageText } from './conversations';
import { ThinkingStatus } from './ThinkingStatus';
import { PLANNING_MS, THINKING_MS } from './timing';
import type { ChatMessage } from './types';
import { UiIcon } from './UiIcon';

type Phase = 'idle' | 'planning' | 'working';

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
        text: 'Start a new chat and pick a role to see a full scripted exchange, including tables, drafts and action chips.',
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
 * The Apollo surface, interactive.
 *
 * Same chrome, same renderer and same composer geometry as the shipped
 * marketing version — the difference is that every control here is wired:
 * the composer accepts input, the dropdowns commit, the clipboard writes, the
 * rail collapses, and a pending reply can be cancelled.
 */
export function ApolloPlayground() {
  const reduceMotion = useReducedMotion();
  const [thread, setThread] = useState<ChatMessage[]>([]);
  const [persona, setPersona] = useState<number | null>(null);
  const [cursor, setCursor] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [composer, setComposer] = useState('');
  const [community, setCommunity] = useState('caladan');
  const [mode, setMode] = useState('full');
  const [navOpen, setNavOpen] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [closed, setClosed] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const timers = useRef<number[]>([]);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 720px)');
    const sync = () => setNarrow(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  // Elapsed readout while working — counts up, never pretends to know a total.
  useEffect(() => {
    if (phase !== 'working') return;
    setElapsed(0);
    const id = window.setInterval(() => {
      setElapsed((value) => value + 0.1);
    }, 100);
    return () => window.clearInterval(id);
  }, [phase]);

  // Anchor a long answer to its top rather than the thread bottom.
  useEffect(() => {
    const node = scrollerRef.current;
    const last = node?.lastElementChild as HTMLElement | null;
    if (!node || !last) return;
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

      const matched = PERSONAS.findIndex((p) => p.prompt === trimmed);

      /* Three cases, and only two of them advance the script:
         a role prompt starts that conversation; the exact next scripted line
         continues it; anything else gets the honest fallback and leaves the
         cursor alone, so a free-typed aside can't pull down the next
         scripted answer as if it were a response. */
      const pending =
        persona !== null ? EXCHANGES[persona]?.[cursor] : undefined;
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
      timers.current.push(
        window.setTimeout(() => setPhase('working'), PLANNING_MS),
      );
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
  }, [clearTimers]);

  const busy = phase !== 'idle';

  /* Only offer to continue when a reply actually follows. One fixture thread
     ends on a user line, and a "continue" chip that leads to the no-answer
     fallback would read as a broken script rather than an honest limit. */
  const nextScripted =
    persona !== null ? EXCHANGES[persona]?.[cursor] : undefined;
  const replyAfter =
    persona !== null ? EXCHANGES[persona]?.[cursor + 1] : undefined;
  const followUp =
    nextScripted?.role === 'user' && replyAfter?.role === 'apollo'
      ? userMessageText(nextScripted)
      : null;

  return (
    <section
      data-interactive
      aria-label="Interactive Apollo conversation surface"
      className="flex w-full flex-col text-product"
    >
      {/* Same stage as the shipped surface: marketing backdrop, brand tint
          underneath so a blocked CDN degrades to an intentional colour. */}
      <div
        className={`relative overflow-hidden rounded-product bg-white bg-cover bg-center inset-shadow-stage panel:rounded-xl ${
          expanded
            ? 'h-[min(760px,88vh)]'
            : 'h-[min(520px,70vh)] panel:h-150'
        }`}
        style={{
          backgroundColor: '#ebe8f2',
          backgroundImage: `url("${narrow ? MOBILE_STAGE : DESKTOP_STAGE}")`,
        }}
      >
        {closed ? (
          <div className="absolute inset-0 grid place-items-center">
            <button
              type="button"
              onClick={() => setClosed(false)}
              className="flex cursor-pointer items-center gap-2 rounded-full bg-product px-4 py-2.5 text-sm text-white shadow-product transition-transform duration-200 ease-product hover:scale-105 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none motion-reduce:transition-none"
            >
              <UiIcon src="/apollo-ui/atlas.svg" className="size-4" />
              Open Apollo
            </button>
          </div>
        ) : (
          <div
            className={`absolute overflow-hidden bg-black/2 panel:rounded-2xl panel:bg-black/2 panel:p-1 ${
              expanded
                ? 'inset-0 panel:inset-2'
                : 'inset-x-0 top-0 -bottom-6 panel:inset-x-auto panel:top-10 panel:-bottom-8 panel:left-1/2 panel:w-[calc(100%-48px)] panel:-translate-x-1/2'
            }`}
          >
            <div className="flex h-full w-full overflow-hidden rounded-product bg-product-bg shadow-product panel:rounded-xl">
              {/* Nav rail — the double chevron is the real collapse control. */}
              <div
                className={`flex h-full shrink-0 flex-col overflow-hidden bg-product text-white transition-[width] duration-300 ease-product motion-reduce:transition-none ${
                  navOpen ? 'w-42' : 'w-10'
                }`}
              >
                <div
                  className={`flex h-10.75 shrink-0 items-center ${
                    navOpen ? 'justify-between pl-3' : 'justify-center'
                  }`}
                >
                  {navOpen ? (
                    <span className="truncate text-[13px] tracking-product">
                      Apollo
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setNavOpen((value) => !value)}
                    aria-expanded={navOpen}
                    aria-label={
                      navOpen ? 'Collapse navigation' : 'Expand navigation'
                    }
                    className={`grid size-7 shrink-0 cursor-pointer place-items-center rounded-product-mark transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-product-ring focus-visible:outline-none ${
                      navOpen ? 'mr-1.5' : ''
                    }`}
                  >
                    <span
                      className={`grid place-items-center transition-transform duration-300 ease-product motion-reduce:transition-none ${
                        navOpen ? 'rotate-180' : ''
                      }`}
                    >
                      <UiIcon
                        src="/apollo-ui/chevron-double-right.svg"
                        className="size-3.5"
                      />
                    </span>
                  </button>
                </div>

                <nav
                  aria-label="Apollo sections"
                  className="flex min-h-0 flex-1 flex-col gap-0.75 overflow-y-auto p-1.5 scrollbar-none [&::-webkit-scrollbar]:hidden"
                >
                  {NAV.map((item) => {
                    const active = 'active' in item && item.active;
                    return (
                      <span
                        key={item.label}
                        title={item.label}
                        className={`flex shrink-0 items-center gap-2.5 rounded-product-mark ${
                          navOpen
                            ? 'h-6.75 px-1.75'
                            : 'size-6.75 justify-center'
                        } ${active ? 'bg-product-accent' : ''}`}
                      >
                        <UiIcon src={item.src} className={item.size} />
                        {navOpen ? (
                          <span className="truncate text-[12px] tracking-product">
                            {item.label}
                          </span>
                        ) : null}
                      </span>
                    );
                  })}
                </nav>

                <div className="flex h-21.25 shrink-0 flex-col items-center justify-center gap-1.5 p-3.25">
                  <span className="grid size-6.75 place-items-center rounded-full bg-product-pill">
                    <UiIcon src="/apollo-ui/question.svg" className="size-3.5" />
                  </span>
                  <span className="relative grid size-6.75 place-items-center rounded-full bg-product-pill">
                    <UiIcon src="/apollo-ui/headset.svg" className="size-3.5" />
                    <span className="absolute top-0 left-5 size-1.75 rounded-full border-dot border-product bg-product-online" />
                  </span>
                </div>
              </div>

              {/* Conversation column */}
              <div className="flex min-w-0 flex-1 flex-col bg-product-bg">
                <header className="flex min-h-12 shrink-0 items-center justify-between overflow-hidden px-4 py-3 text-sm leading-product font-normal tracking-product panel:min-h-15.25 panel:px-7 panel:py-5.25">
                  <div className="flex min-w-0 items-center gap-2.75">
                    <UiIcon src="/apollo-ui/menu.svg" className="size-4.5" />
                    <span className="truncate">
                      {persona !== null ? PERSONAS[persona].title : 'New Chat'}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-5.25 text-product-muted">
                    <button
                      type="button"
                      onClick={newChat}
                      className="hidden cursor-pointer items-center gap-2.75 whitespace-nowrap text-product transition-colors hover:text-product-accent focus-visible:ring-2 focus-visible:ring-product-ring focus-visible:outline-none panel:inline-flex"
                    >
                      <UiIcon src="/apollo-ui/new-chat.svg" className="size-4.5" />
                      New Chat
                    </button>
                    <button
                      type="button"
                      onClick={newChat}
                      aria-label="New chat"
                      className="grid size-4.5 cursor-pointer place-items-center transition-colors hover:text-product focus-visible:ring-2 focus-visible:ring-product-ring focus-visible:outline-none panel:hidden"
                    >
                      <UiIcon src="/apollo-ui/new-chat.svg" className="size-4.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpanded((value) => !value)}
                      aria-pressed={expanded}
                      aria-label={expanded ? 'Restore panel size' : 'Expand panel'}
                      className="grid size-4.5 cursor-pointer place-items-center transition-colors hover:text-product focus-visible:ring-2 focus-visible:ring-product-ring focus-visible:outline-none"
                    >
                      <UiIcon src="/apollo-ui/expand.svg" className="size-4.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setClosed(true)}
                      aria-label="Close Apollo"
                      className="grid size-4.5 cursor-pointer place-items-center transition-colors hover:text-product focus-visible:ring-2 focus-visible:ring-product-ring focus-visible:outline-none"
                    >
                      <UiIcon src="/apollo-ui/close.svg" className="size-4.5" />
                    </button>
                  </div>
                </header>

                <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-3.5 pt-3 pb-10 panel:px-8 panel:pt-6 panel:pb-11">
                  <div
                    ref={scrollerRef}
                    className="flex min-h-0 w-full flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden"
                  >
                    {thread.length === 0 && !busy ? (
                      <div className="flex flex-col gap-3">
                        <p className="m-0 text-sm leading-product tracking-product text-product-muted">
                          Pick a role to run its scripted exchange, or type
                          anything below.
                        </p>
                        <ul className="grid gap-2 panel:grid-cols-2">
                          {PERSONAS.map((p) => (
                            <li key={p.title}>
                              <button
                                type="button"
                                onClick={() => send(p.prompt)}
                                className="group h-full w-full cursor-pointer rounded-lg border border-product-line bg-white px-3 py-2.5 text-left transition-all duration-200 ease-product hover:-translate-y-px hover:border-product-ring hover:shadow-composer focus-visible:ring-2 focus-visible:ring-product-ring focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                              >
                                <span className="flex items-center gap-2">
                                  <span className="text-[13px] font-medium tracking-product text-product">
                                    {p.title}
                                  </span>
                                  <span
                                    aria-hidden
                                    className="ml-auto text-product-faint transition-transform duration-200 ease-product group-hover:translate-x-0.5 motion-reduce:transition-none"
                                  >
                                    →
                                  </span>
                                </span>
                                <span className="mt-0.5 line-clamp-2 block text-[12px] leading-product tracking-product text-product-muted">
                                  {p.prompt}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {thread.map((message, index) =>
                      message.role === 'user' ? (
                        <div
                          key={`u-${index}`}
                          className="flex w-full items-end justify-end motion-safe:animate-message-enter"
                        >
                          <p className="m-0 max-w-[min(520px,86%)] rounded-lg bg-product-soft px-4 py-3 text-sm leading-product tracking-product whitespace-pre-wrap text-product max-panel:max-w-9/10 max-panel:px-3 max-panel:py-2.5">
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
                      <p className="m-0 px-1.25 py-1.25 motion-safe:animate-message-enter">
                        <span className="bg-planning bg-clip-text text-sm leading-product tracking-product text-transparent motion-safe:animate-planning-shimmer motion-reduce:bg-none motion-reduce:text-product-muted">
                          Planning next moves
                        </span>
                      </p>
                    ) : null}

                    {phase === 'working' ? (
                      <ThinkingStatus elapsedSeconds={elapsed} />
                    ) : null}

                    {busy ? (
                      <div className="flex px-1.25">
                        <button
                          type="button"
                          onClick={stop}
                          className="cursor-pointer rounded-full border border-product-line bg-white px-3 py-1 text-[12px] text-product-label transition-colors hover:border-product-ring hover:text-product focus-visible:ring-2 focus-visible:ring-product-ring focus-visible:outline-none"
                        >
                          Stop
                        </button>
                      </div>
                    ) : null}

                    {stopped && !busy ? (
                      <p className="m-0 px-1.25 text-[12px] leading-product tracking-product text-product-muted motion-safe:animate-chip-in">
                        Stopped before replying.
                      </p>
                    ) : null}

                    {followUp && !busy ? (
                      <div className="flex flex-wrap gap-2 px-1.25 motion-safe:animate-chip-in">
                        <button
                          type="button"
                          onClick={() => send(followUp)}
                          className="cursor-pointer rounded-full border border-product-line bg-white px-3 py-1.5 text-left text-[12px] leading-product tracking-product text-product-label transition-colors hover:border-product-ring hover:text-product focus-visible:ring-2 focus-visible:ring-product-ring focus-visible:outline-none"
                        >
                          <span className="text-product-faint">continue →</span>{' '}
                          {followUp}
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <Composer
                    value={composer}
                    onChange={setComposer}
                    onSubmit={() => send(composer)}
                    busy={busy}
                    community={community}
                    onCommunityChange={setCommunity}
                    mode={mode}
                    onModeChange={setMode}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
