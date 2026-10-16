import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  HOLD_AFTER_MS,
  MIN_INTERVAL_MS,
  PLANNING_MS,
  REPLY_BEAT_MS,
  REVEAL_OFFSET_MS,
  SEND_AFTER_TYPE_MS,
  STEP_MS,
  THINKING_MS,
  TYPE_INTERVAL_MS,
  typingDurationMs,
} from "../apollo/timing";
import { ApolloBlocks } from "../apollo/ApolloBlocks";
import { NAV, DESKTOP_STAGE, MOBILE_STAGE } from "../apollo/chrome";
import { EXCHANGES, PERSONAS, userMessageText } from "../apollo/conversations";
import { ThinkingStatus } from "../apollo/ThinkingStatus";
import type { ChatMessage } from "../apollo/types";
import { UiIcon } from "../apollo/UiIcon";

function thinksBeforeReply(messages: ChatMessage[], index: number) {
  return messages[index]?.role === "apollo";
}

function slideDurationMs(messages: ChatMessage[]) {
  if (messages.length === 0) return MIN_INTERVAL_MS;

  let duration = REVEAL_OFFSET_MS;
  messages.forEach((message, index) => {
    if (message.role === "user") {
      duration +=
        typingDurationMs(userMessageText(message)) + SEND_AFTER_TYPE_MS;
      return;
    }
    if (thinksBeforeReply(messages, index)) {
      duration += PLANNING_MS + THINKING_MS + STEP_MS;
      return;
    }
    duration += REPLY_BEAT_MS + STEP_MS;
  });
  return Math.max(MIN_INTERVAL_MS, duration + HOLD_AFTER_MS);
}

function ConversationPreview({
  messages,
  reduceMotion,
  active,
  onComposerTextChange,
}: {
  messages: ChatMessage[];
  reduceMotion: boolean;
  active: boolean;
  onComposerTextChange?: (text: string) => void;
}) {
  const thread = Array.isArray(messages) ? messages : [];
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(
    reduceMotion ? thread.length : 0,
  );
  const [phase, setPhase] = useState<"idle" | "planning" | "working">("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [composerTarget, setComposerTarget] = useState("");

  useEffect(() => {
    const nextThread = Array.isArray(messages) ? messages : [];

    if (reduceMotion) {
      setVisibleCount(nextThread.length);
      setPhase("idle");
      setComposerTarget("");
      return;
    }

    if (!active) {
      setVisibleCount(0);
      setPhase("idle");
      setComposerTarget("");
      return;
    }

    setVisibleCount(0);
    setPhase("idle");
    setElapsedSeconds(0);
    setComposerTarget("");

    const timers: number[] = [];
    let at = REVEAL_OFFSET_MS;

    nextThread.forEach((message, index) => {
      if (message.role === "user") {
        const text = userMessageText(message);
        timers.push(window.setTimeout(() => setComposerTarget(text), at));
        at += typingDurationMs(text);
        timers.push(
          window.setTimeout(() => {
            setPhase("idle");
            setVisibleCount(index + 1);
            setComposerTarget("");
          }, at),
        );
        at += SEND_AFTER_TYPE_MS;
        return;
      }

      if (thinksBeforeReply(nextThread, index)) {
        timers.push(
          window.setTimeout(() => {
            setElapsedSeconds(0);
            setPhase("planning");
          }, at),
        );
        at += PLANNING_MS;
        timers.push(
          window.setTimeout(() => {
            setElapsedSeconds(0);
            setPhase("working");
          }, at),
        );
        at += THINKING_MS;
      } else {
        at += REPLY_BEAT_MS;
      }

      timers.push(
        window.setTimeout(() => {
          setPhase("idle");
          setVisibleCount(index + 1);
        }, at),
      );
      at += STEP_MS;
    });

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [active, messages, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) {
      onComposerTextChange?.(composerTarget);
      return;
    }

    if (!composerTarget) {
      onComposerTextChange?.("");
      return;
    }

    let typed = 0;
    const step = composerTarget.length > 90 ? 2 : 1;
    onComposerTextChange?.("");
    const timer = window.setInterval(() => {
      typed = Math.min(composerTarget.length, typed + step);
      onComposerTextChange?.(composerTarget.slice(0, typed));
      if (typed >= composerTarget.length) window.clearInterval(timer);
    }, TYPE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [composerTarget, onComposerTextChange, reduceMotion]);

  useEffect(() => {
    if (reduceMotion || phase !== "working") return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((current) =>
        Math.min(current + 0.1, THINKING_MS / 1000),
      );
    }, 100);
    return () => window.clearInterval(timer);
  }, [phase, reduceMotion]);

  useEffect(() => {
    const node = scrollerRef.current;
    const last = node?.lastElementChild as HTMLElement | null;
    if (!node || !last) return;
    node.scrollTop =
      last.offsetHeight > node.clientHeight - 8
        ? last.offsetTop
        : node.scrollHeight;
  }, [phase, visibleCount]);

  return (
    <div
      className="flex min-h-0 w-full flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden"
      ref={scrollerRef}
    >
      {thread.slice(0, visibleCount).map((message, index) =>
        message.role === "user" ? (
          <div
            className="flex w-full items-end justify-end motion-safe:animate-message-enter"
            key={`user-${index}`}
          >
            <p className="m-0 max-w-[min(520px,86%)] rounded-lg bg-product-soft px-4 py-3 text-sm leading-product tracking-product whitespace-pre-wrap text-product max-panel:max-w-9/10 max-panel:px-3 max-panel:py-2.5">
              {userMessageText(message)}
            </p>
          </div>
        ) : (
          <div
            className="flex w-full flex-col motion-safe:animate-message-enter"
            key={`apollo-${index}`}
          >
            <ApolloBlocks blocks={message.blocks} />
          </div>
        ),
      )}
      {phase === "planning" ? (
        <p className="m-0 px-1.25 py-1.25 motion-safe:animate-message-enter">
          <span className="bg-planning bg-clip-text text-sm leading-product tracking-product text-transparent motion-safe:animate-planning-shimmer motion-reduce:bg-none motion-reduce:text-product-muted">
            Planning next moves
          </span>
        </p>
      ) : null}
      {phase === "working" ? (
        <ThinkingStatus elapsedSeconds={elapsedSeconds} />
      ) : null}
    </div>
  );
}

/**
 * `autoplay` lets a host pause the carousel without reaching inside it — used
 * by the case study so a live walkthrough can hold on one persona. Hover and
 * off-screen pausing still apply on top of it.
 */
export function ApolloUI({ autoplay = true }: { autoplay?: boolean } = {}) {
  const rootRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [composerText, setComposerText] = useState("");
  const [narrow, setNarrow] = useState(false);
  const slides = PERSONAS;
  const paused =
    !autoplay || !inView || hovered || reduceMotion || slides.length < 2;
  const current = slides[activeIndex] ?? slides[0];
  const currentMessages = EXCHANGES[activeIndex] ?? EXCHANGES[0];
  const currentDurationMs = slideDurationMs(currentMessages);
  const tabGap = 12;

  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabId = (index: number) => `${baseId}-tab-${index}`;
  const panelId = (index: number) => `${baseId}-panel-${index}`;

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex((index + slides.length) % slides.length);
    },
    [slides.length],
  );

  const advance = useCallback(() => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  /**
   * Roving focus for the tablist. Selection follows focus, which is the
   * expected behavior for tabs whose panels are cheap to render.
   */
  const focusTab = useCallback(
    (index: number) => {
      const next = (index + slides.length) % slides.length;
      goTo(next);
      tabRefs.current[next]?.focus();
    },
    [goTo, slides.length],
  );

  const onTabKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          event.preventDefault();
          focusTab(activeIndex + 1);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault();
          focusTab(activeIndex - 1);
          break;
        case "Home":
          event.preventDefault();
          focusTab(0);
          break;
        case "End":
          event.preventDefault();
          focusTab(slides.length - 1);
          break;
        default:
          break;
      }
    },
    [activeIndex, focusTab, slides.length],
  );

  useEffect(() => {
    const media = window.matchMedia("(max-width: 720px)");
    const sync = () => setNarrow(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReduceMotion(media.matches);
    syncMotion();
    media.addEventListener("change", syncMotion);
    return () => media.removeEventListener("change", syncMotion);
  }, []);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      {
        threshold: 0.35,
      },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(advance, currentDurationMs);
    return () => window.clearTimeout(timer);
  }, [advance, currentDurationMs, paused]);

  return (
    <section
      ref={rootRef}
      data-interactive
      aria-label="Apollo for every role"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex w-full flex-col gap-8 text-product max-panel:gap-0"
      style={
        {
          "--active": activeIndex,
          "--persona-duration": `${currentDurationMs}ms`,
        } as CSSProperties
      }
    >
      <div
        className="relative h-[min(520px,70vh)] overflow-hidden rounded-product bg-white bg-cover bg-center inset-shadow-stage max-panel:order-[calc(var(--active)*2+2)] max-panel:my-4 panel:h-150 panel:rounded-xl"
        style={{
          /* Brand tint sits under the remote backdrop, so a blocked CDN or a
             bad network degrades to an intentional surface rather than a hole.
             The demo itself — chrome, icons, conversation — is entirely local. */
          backgroundColor: "#ebe8f2",
          backgroundImage: `url("${narrow ? MOBILE_STAGE : DESKTOP_STAGE}")`,
        }}
        role="tabpanel"
        id={panelId(activeIndex)}
        aria-labelledby={tabId(activeIndex)}
        tabIndex={0}
      >
        <p className="sr-only">
          {current.title}: {current.subtitle} Illustrative demo of the Apollo
          conversation surface, playing the prompt “{current.prompt}” with
          scripted responses.
        </p>
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -bottom-6 overflow-hidden bg-black/2 panel:inset-x-auto panel:top-10 panel:-bottom-8 panel:left-1/2 panel:w-[calc(100%-48px)] panel:-translate-x-1/2 panel:rounded-2xl panel:bg-black/2 panel:p-1">
          <div className="flex h-full w-full overflow-hidden rounded-product bg-product-bg shadow-product panel:rounded-xl">
            <div className="flex h-full w-10 shrink-0 flex-col overflow-hidden bg-product text-white">
              <div className="grid h-10.75 shrink-0 place-items-center">
                <UiIcon src="/apollo-ui/chevron-double-right.svg" className="size-3.5" />
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-0.75 overflow-hidden p-1.5">
                {NAV.map((item) => (
                  <span
                    className={`grid size-6.75 shrink-0 place-items-center rounded-product-mark ${
                      "active" in item && item.active ? "bg-apollo-gradient" : ""
                    }`}
                    key={item.label}
                  >
                    <UiIcon src={item.src} className={item.size} />
                  </span>
                ))}
              </div>
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

            <div className="flex min-w-0 flex-1 flex-col bg-product-bg">
              <header className="flex min-h-12 shrink-0 items-center justify-between overflow-hidden px-4 py-3 text-sm leading-product font-normal tracking-product panel:min-h-15.25 panel:px-7 panel:py-5.25">
                <div className="flex min-w-0 items-center gap-2.75">
                  <UiIcon src="/apollo-ui/menu.svg" className="size-4.5" />
                  <span className="truncate">Chat Name</span>
                </div>
                <div className="flex shrink-0 items-center gap-5.25">
                  <span className="hidden items-center gap-2.75 whitespace-nowrap panel:inline-flex">
                    <UiIcon src="/apollo-ui/new-chat.svg" className="size-4.5" />
                    New Chat
                  </span>
                  <UiIcon src="/apollo-ui/expand.svg" className="size-4.5" />
                  <UiIcon src="/apollo-ui/close.svg" className="size-4.5" />
                </div>
              </header>

              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-3.5 pt-3 pb-10 panel:px-8 panel:pt-6 panel:pb-11">
                <ConversationPreview
                  key={`${current.title}-${activeIndex}`}
                  messages={currentMessages}
                  reduceMotion={reduceMotion}
                  active={inView}
                  onComposerTextChange={setComposerText}
                />

                <div className="flex w-full max-w-164.5 shrink-0 flex-col justify-between gap-4 self-center overflow-hidden rounded-lg border-hair border-product-ring bg-white px-3 py-2.5 shadow-composer panel:min-h-35 panel:p-4.5">
                  <p className="m-0 text-sm leading-product tracking-product wrap-anywhere whitespace-pre-wrap text-product">
                    {composerText}
                    <span className="ml-px inline-block h-3.5 w-px translate-y-0.5 bg-product align-text-bottom motion-safe:animate-blink" />
                  </p>
                  <div className="flex h-4.5 w-full items-center justify-between text-product-muted">
                    <div className="flex min-w-0 flex-1 items-center gap-4 overflow-hidden panel:gap-5.25">
                      <UiIcon src="/apollo-ui/attach.svg" className="size-4.5" />
                      <UiIcon src="/apollo-ui/microphone.svg" className="size-4.5" />
                      <UiIcon src="/apollo-ui/document.svg" className="size-4.5" />
                      <span className="grid size-4.5 shrink-0 place-items-center">
                        <UiIcon src="/apollo-ui/context.svg" className="size-3.5" />
                      </span>
                      <span className="hidden items-center gap-1.25 whitespace-nowrap panel:inline-flex">
                        Caladan Lofts
                        <UiIcon src="/apollo-ui/chevron.svg" className="size-3.5" />
                      </span>
                      <span className="hidden items-center gap-1.25 whitespace-nowrap panel:inline-flex">
                        Full Agent
                        <UiIcon src="/apollo-ui/chevron.svg" className="size-3.5" />
                      </span>
                    </div>
                    <UiIcon src="/apollo-ui/send.svg" className="size-4.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative flex w-full gap-3 max-panel:contents"
        role="tablist"
        aria-label="Choose a role"
        aria-orientation="horizontal"
        onKeyDown={onTabKeyDown}
      >
        <span
          className="pointer-events-none absolute top-0 left-0 z-10 h-px bg-ink transition-transform duration-560 ease-product motion-reduce:transition-none max-panel:hidden"
          style={{
            width: `calc((100% - ${(slides.length - 1) * tabGap}px) / ${slides.length})`,
            transform: `translateX(calc(var(--active, 0) * (100% + ${tabGap}px)))`,
          }}
        />
        {slides.map((slide, index) => {
          const selected = index === activeIndex;
          return (
            <button
              className={`relative flex min-w-0 flex-1 cursor-pointer flex-col items-start gap-1.5 border-0 border-t border-ink/15 bg-transparent pt-5 text-left font-sans transition-colors duration-300 max-panel:w-full max-panel:flex-none max-panel:py-4 max-panel:order-[calc(var(--tab-index)*2+1)] max-panel:last-of-type:border-b ${
                selected ? "max-panel:pb-0" : ""
              }`}
              key={slide.title}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={tabId(index)}
              aria-selected={selected}
              aria-controls={panelId(index)}
              tabIndex={selected ? 0 : -1}
              onClick={() => goTo(index)}
              style={{ "--tab-index": index } as CSSProperties}
            >
              {selected ? (
                <span className="pointer-events-none absolute -top-px left-0 hidden h-px w-full bg-ink motion-safe:animate-persona-progress motion-reduce:w-[68%] motion-reduce:animate-none max-panel:block" />
              ) : null}
              <span
                className={`text-product-title leading-product-title font-product tracking-product-title max-wide:text-[clamp(16px,2vw,22px)] max-panel:text-xl ${
                  selected ? "text-[#181819]" : "text-muted"
                }`}
              >
                {slide.title}
              </span>
              <span
                className={`text-lg leading-product font-normal tracking-product max-wide:text-[clamp(14px,1.6vw,18px)] max-panel:text-base ${
                  selected ? "text-[#515152] max-panel:block" : "text-muted max-panel:hidden"
                }`}
              >
                {slide.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {current.title}. {current.subtitle}
      </p>
    </section>
  );
}
