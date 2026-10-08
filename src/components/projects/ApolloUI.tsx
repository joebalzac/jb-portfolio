import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

type Persona = {
  title: string;
  subtitle: string;
  prompt: string;
};

type MessageBlock =
  | { type: "text"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "table"; columns: string[]; rows: string[][] }
  | { type: "draft"; text: string }
  | { type: "actions"; items: string[] };

type ChatMessage = {
  role: "user" | "apollo";
  blocks: MessageBlock[];
};

const PERSONAS: Persona[] = [
  {
    title: "Leasing Agent",
    subtitle: "Turn every tour into a lease, not a to-do list.",
    prompt:
      "I was in tours all day — who haven't I marked shown or written notes for?",
  },
  {
    title: "Maintenance Tech",
    subtitle: "Hands on the repair, Apollo handles the rest.",
    prompt:
      "Unit 204 is having an issue with the disposal. What should I look at first?",
  },
  {
    title: "Community Manager",
    subtitle: "More face time with residents, less time chasing follow-ups.",
    prompt:
      "List all of my upcoming move-ins this month and draft a mass welcome text message with a move-in checklist reminder for all of them.",
  },
  {
    title: "Regionals & Executives",
    subtitle: "The end of dashboards, the start of strategy.",
    prompt:
      "Break down move-outs into controllable vs. uncontrollable reasons across the portfolio. Take conversation history into account in your analysis.",
  },
];

const EXCHANGES: ChatMessage[][] = [
  [
    {
      role: "user",
      blocks: [
        {
          type: "text",
          text: "I was in tours all day — who haven't I marked shown or written notes for?",
        },
      ],
    },
    {
      role: "apollo",
      blocks: [
        {
          type: "text",
          text: "One tour needs marking: Annabel Donovan's self-guided tour on July 1. Mark as shown?",
        },
      ],
    },
    { role: "user", blocks: [{ type: "text", text: "Yes." }] },
    {
      role: "apollo",
      blocks: [
        {
          type: "text",
          text: "Done. Annabel's still in Inquiry status, AI assistant active.",
        },
      ],
    },
    {
      role: "user",
      blocks: [
        { type: "text", text: "What else should I do for her follow-up?" },
      ],
    },
    {
      role: "apollo",
      blocks: [
        {
          type: "text",
          text: "The post-tour cadence is already running automatically (follow-ups at 2 hrs, 2 days, 4 days, 12 days). Beyond that, I'd send a personal note, send a quote for the studio she toured, and assign a leasing agent — no one's on her account yet. I went ahead and drafted the personal note:",
        },
        {
          type: "draft",
          text: "Hi Annabel, thanks for touring the studio on July 1! Let me know if you have questions on pricing or the application — happy to send a quote whenever you're ready.",
        },
        { type: "actions", items: ["Send", "Edit"] },
      ],
    },
    { role: "user", blocks: [{ type: "text", text: "Send it." }] },
    { role: "apollo", blocks: [{ type: "text", text: "Sent." }] },
  ],
  [
    {
      role: "user",
      blocks: [
        {
          type: "text",
          text: "Unit 204 is having an issue with the disposal. What should I look at first?",
        },
      ],
    },
    {
      role: "apollo",
      blocks: [
        {
          type: "text",
          text: "Check the disposal before snaking — this unit has a repeat pattern of jams and slow drains.",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Clear the disposal (steel wool jammed it last time).",
            "If clear, snake the branch line — recurring slow drains suggest buildup past the trap.",
            "Pull the P-trap and check under the cabinet — past jobs found a clog and leak together.",
          ],
        },
        {
          type: "text",
          text: "Four prior plumbing orders on this unit (kitchen + bath), including a recurring under-cabinet leak alongside drainage issues:",
        },
        {
          type: "list",
          items: [
            "Kitchen sink leak + inoperative disposal — repaired",
            "Bath/kitchen under-cabinet leaks — fixed",
            "Tub/shower not draining — cleared",
          ],
        },
      ],
    },
  ],
  [
    {
      role: "user",
      blocks: [
        {
          type: "text",
          text: "List all of my upcoming move-ins this month and draft a mass welcome text message with a move-in checklist reminder for all of them.",
        },
      ],
    },
    {
      role: "apollo",
      blocks: [
        { type: "text", text: "You've got two upcoming June move-ins:" },
        {
          type: "table",
          columns: ["Resident", "Community", "Unit", "Move-in", "SMS status"],
          rows: [
            [
              "Jane Stewart",
              "Balance Bay",
              "12",
              "June 18",
              "INVALID — can't text",
            ],
            ["Maya Martin", "Chicagoland", "34", "June 30", "Opted in"],
          ],
        },
        {
          type: "text",
          text: "Heads-up: Jane's number is invalid for SMS, so only Maya would actually receive a text — you may want to reach her by email instead.\nHere's a draft welcome message for both:",
        },
        {
          type: "draft",
          text: "Hi [first name], welcome to [community name]! We're so excited to have you joining us. Your move-in is coming up soon, and you can get a head start by completing your move-in checklist right in your resident portal. It walks you through everything you need before move-in day. Reach out anytime if you have questions. We can't wait to welcome you home!",
        },
        {
          type: "text",
          text: "Want me to send this? Texting Maya and handling Jane over email?",
        },
      ],
    },
    { role: "user", blocks: [{ type: "text", text: "Yes, let’s do that!" }] },
  ],
  [
    {
      role: "user",
      blocks: [
        {
          type: "text",
          text: "Break down move-outs into controllable vs. uncontrollable reasons across the portfolio. Take conversation history into account in your analysis.",
        },
      ],
    },
    {
      role: "apollo",
      blocks: [
        {
          type: "text",
          text: "58% of the last 12 months’ churn value is controllable: $842.6K across 51 move-outs, vs. $512.3K uncontrollable. Full breakdown on the Portfolio Churn dashboard.\nControllable dollars by driver (leases can cite more than one, so rows overlap):",
        },
        {
          type: "table",
          columns: ["Driver", "Move-outs", "Annualized rent"],
          rows: [
            ["Rent increase / better value elsewhere", "23", "$391,500"],
            ["Community issues (noise, safety)", "21", "$358,940"],
            ["Service & staff complaints", "19", "$311,220"],
            ["Maintenance issues", "17", "$284,600"],
          ],
        },
      ],
    },
  ],
];

const MIN_INTERVAL_MS = 8000;
const STEP_MS = 1100;
const HOLD_AFTER_MS = 5000;
const REVEAL_OFFSET_MS = 220;
const SEND_AFTER_TYPE_MS = 280;
const REPLY_BEAT_MS = 350;
const PLANNING_MS = 600;
const THINKING_MS = 1000;
const TYPE_INTERVAL_MS = 24;

const WORKING_ACTIONS = [
  { type: "conversation", label: "Loading Conversations" },
  { type: "data", label: "Analyzing lease data" },
  { type: "action", label: "Sending follow-up email" },
] as const;

const NAV = [
  { src: "/apollo-ui/search.svg", label: "Search", size: "size-3.5" },
  { src: "/apollo-ui/atlas.svg", label: "Apollo", size: "size-3.5", active: true },
  { src: "/apollo-ui/smart-home.svg", label: "Home", size: "size-3.5" },
  { src: "/apollo-ui/square-check.svg", label: "Tasks", size: "size-3.5" },
  { src: "/apollo-ui/user-square.svg", label: "Contacts", size: "size-3.5" },
  { src: "/apollo-ui/signature.svg", label: "Leases", size: "size-3.5" },
  { src: "/apollo-ui/calendar.svg", label: "Calendar", size: "size-3.5" },
  { src: "/apollo-ui/chart-bar.svg", label: "Reports", size: "size-3.5" },
  { src: "/apollo-ui/building.svg", label: "Communities", size: "size-3.5" },
  { src: "/apollo-ui/brain.svg", label: "Knowledge", size: "size-3.5" },
  { src: "/apollo-ui/user-cog.svg", label: "Users", size: "size-3.5" },
  { src: "/apollo-ui/hammer.svg", label: "Maintenance", size: "size-3.5" },
  { src: "/apollo-ui/refresh.svg", label: "Sync", size: "size-3.5" },
  { src: "/apollo-ui/phone.svg", label: "Phone", size: "size-3.5" },
  { src: "/apollo-ui/ladder.svg", label: "Onboarding", size: "size-3.5" },
  { src: "/apollo-ui/mood-smile.svg", label: "Sentiment", size: "size-3.5" },
  { src: "/apollo-ui/file-search.svg", label: "File search", size: "size-3.5" },
  { src: "/apollo-ui/bell.svg", label: "Notifications", size: "size-3.5" },
] as const;

const DESKTOP_STAGE =
  "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a95a49759ad77ed32691f7a_Desktop_ApolloDoes_Visual-1.avif";
const MOBILE_STAGE =
  "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a95a4994a6e8b9999049b16_Desktop_ApolloDoes_Visual.avif";

function typingDurationMs(text: string) {
  const step = text.length > 90 ? 2 : 1;
  return Math.ceil(Math.max(text.length, 1) / step) * TYPE_INTERVAL_MS;
}

function userMessageText(message: ChatMessage) {
  return message.blocks
    .filter(
      (block): block is Extract<MessageBlock, { type: "text" }> =>
        block.type === "text",
    )
    .map((block) => block.text)
    .join("\n");
}

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

function UiIcon({ src, className }: { src: string; className: string }) {
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      className={`block aspect-square max-w-none shrink-0 object-contain ${className}`}
    />
  );
}

function ActionGlyph({
  type,
}: {
  type: (typeof WORKING_ACTIONS)[number]["type"];
}) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (type === "conversation") {
    return (
      <svg viewBox="0 0 16 16" width="10.5" height="10.5" aria-hidden>
        <path d="M3.2 2.4h6.4L12 4.8v7.6a1 1 0 0 1-1 1H3.2a1 1 0 0 1-1-1V3.4a1 1 0 0 1 1-1Z" {...common} />
        <path d="M4.4 7.2h5.2M4.4 9.6h3.2" {...common} />
      </svg>
    );
  }
  if (type === "data") {
    return (
      <svg viewBox="0 0 16 16" width="10.5" height="10.5" aria-hidden>
        <rect x="1.6" y="2.2" width="12.8" height="9.2" rx="1.2" {...common} />
        <path d="M3.2 5.2 1.8 6.4 3.2 7.6M5.6 8.2 7.8 4.4" {...common} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" width="10.5" height="10.5" aria-hidden>
      <path d="M2.4 5.4 8 2.6l5.6 2.8L8 8.2 2.4 5.4Z" {...common} />
      <path d="M2.4 5.4V10.6L8 13.4l5.6-2.8V5.4" {...common} />
    </svg>
  );
}

function ApolloBlocks({ blocks }: { blocks: MessageBlock[] }) {
  return (
    <div className="flex max-w-full flex-col gap-2.5">
      {blocks.map((block, index) => {
        if (block.type === "text") {
          return (
            <div className="flex flex-col gap-2.5" key={index}>
              {block.text
                .split("\n")
                .filter(Boolean)
                .map((line, lineIndex) => (
                  <p
                    className="m-0 text-sm leading-product tracking-product text-product"
                    key={`${index}-${lineIndex}`}
                  >
                    {line}
                  </p>
                ))}
            </div>
          );
        }
        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag
              className={`m-0 flex list-outside flex-col gap-1.5 text-sm leading-product tracking-product text-product ${
                block.ordered ? "list-decimal pl-5" : "list-disc pl-list"
              }`}
              key={index}
            >
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ListTag>
          );
        }
        if (block.type === "table") {
          return (
            <div
              className="w-full overflow-x-auto rounded-lg border border-product-line"
              key={index}
            >
              <table className="w-full min-w-full border-collapse text-xs leading-product-table tracking-product">
                <thead>
                  <tr>
                    {block.columns.map((column) => (
                      <th
                        className="bg-product-soft px-2 py-1.75 text-left align-top font-medium whitespace-nowrap text-product-label first:whitespace-normal max-panel:whitespace-normal"
                        key={column}
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td
                          className={`border-t border-product-line px-2 py-1.75 text-left align-top whitespace-nowrap text-product first:whitespace-normal max-panel:whitespace-normal ${
                            cell.startsWith("INVALID")
                              ? "font-medium text-product-alert"
                              : ""
                          }`}
                          key={`${rowIndex}-${cellIndex}`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (block.type === "draft") {
          return (
            <p
              className="m-0 rounded-r-lg border-l-2 border-product-accent bg-product-soft px-3.5 py-3 text-sm leading-product tracking-product whitespace-pre-wrap text-product"
              key={index}
            >
              {block.text}
            </p>
          );
        }
        return (
          <div className="flex flex-wrap gap-2" key={index}>
            {block.items.map((item) => (
              <span
                className="rounded-full border border-product-line bg-white px-3 py-1.5 text-product-chip leading-product-title tracking-product text-product"
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function ThinkingStatus({ elapsedSeconds }: { elapsedSeconds: number }) {
  return (
    <div className="flex w-full flex-col motion-safe:animate-message-enter">
      <div className="flex min-h-8 w-full items-center gap-1.75 px-1.25 py-1.25 text-sm leading-product tracking-product text-product-muted">
        <span
          className="grid size-5.25 place-items-center text-product-accent motion-safe:animate-working-pulse"
          aria-hidden
        >
          <svg viewBox="0 0 21 21" width="21" height="21" aria-hidden>
            <path
              d="M10.5 1.8 11.9 8.1 18.2 10.5 11.9 12.9 10.5 19.2 9.1 12.9 2.8 10.5 9.1 8.1 10.5 1.8Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span>Working</span>
        <span
          className="size-0.5 shrink-0 rounded-full bg-product-muted"
          aria-hidden
        />
        <span>{elapsedSeconds.toFixed(1)}s</span>
      </div>
      <div className="flex w-full gap-1.75 px-1.25">
        <span
          className="mx-2 w-px shrink-0 self-stretch bg-product-line"
          aria-hidden
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1.75 py-3.5 text-sm leading-product tracking-product text-product-muted">
          <p className="m-0 w-full">
            Let me load the matching skills to continue.
          </p>
          {WORKING_ACTIONS.map((action) => (
            <div
              className="flex w-full items-center gap-1.75"
              key={action.type}
            >
              <span className="grid size-5.25 shrink-0 place-items-center overflow-hidden rounded-product-mark border border-product-line bg-product-soft text-product-label">
                <ActionGlyph type={action.type} />
              </span>
              <span>{action.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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

export function ApolloUI() {
  const rootRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [composerText, setComposerText] = useState("");
  const [narrow, setNarrow] = useState(false);
  const slides = PERSONAS;
  const paused = !inView || hovered || reduceMotion || slides.length < 2;
  const current = slides[activeIndex] ?? slides[0];
  const currentMessages = EXCHANGES[activeIndex] ?? EXCHANGES[0];
  const currentDurationMs = slideDurationMs(currentMessages);
  const tabGap = 12;

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex((index + slides.length) % slides.length);
    },
    [slides.length],
  );

  const advance = useCallback(() => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

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
          backgroundImage: `url("${narrow ? MOBILE_STAGE : DESKTOP_STAGE}")`,
        }}
        aria-hidden
      >
        <div className="absolute inset-x-0 top-0 -bottom-6 overflow-hidden bg-black/2 panel:inset-x-auto panel:top-10 panel:-bottom-8 panel:left-1/2 panel:w-[calc(100%-48px)] panel:-translate-x-1/2 panel:rounded-2xl panel:bg-black/2 panel:p-1">
          <div className="flex h-full w-full overflow-hidden rounded-product bg-product-bg shadow-product panel:rounded-xl">
            <div className="flex h-full w-10 shrink-0 flex-col overflow-hidden bg-product text-white">
              <div className="grid h-10.75 shrink-0 place-items-center">
                <UiIcon src="/apollo-ui/chevron-double-right.svg" className="size-3.5" />
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-0.75 overflow-hidden p-1.5">
                {NAV.map((item) => (
                  <span
                    className={`grid size-6.75 shrink-0 place-items-center rounded-product-mark ${
                      "active" in item && item.active ? "bg-product-accent" : ""
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
              type="button"
              role="tab"
              aria-selected={selected}
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
