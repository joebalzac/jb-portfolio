import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
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
  { id: "search", label: "Search" },
  { id: "atlas", label: "Apollo", active: true },
  { id: "home", label: "Home" },
  { id: "check", label: "Tasks" },
  { id: "person", label: "Contacts" },
  { id: "signature", label: "Leases" },
  { id: "calendar", label: "Calendar" },
  { id: "chart", label: "Reports" },
  { id: "building", label: "Communities" },
  { id: "brain", label: "Knowledge" },
  { id: "gear", label: "Users" },
  { id: "hammer", label: "Maintenance" },
  { id: "refresh", label: "Sync" },
  { id: "phone", label: "Phone" },
  { id: "ladder", label: "Onboarding" },
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

function lastUserIndex(messages: ChatMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].role === "user") return index;
  }
  return -1;
}

function thinksBeforeReply(messages: ChatMessage[], index: number) {
  const userCount = messages.filter(
    (message) => message.role === "user",
  ).length;
  const lastUser = lastUserIndex(messages);
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    if (messages[cursor].role !== "user") continue;
    if (userCount < 2) return true;
    return cursor !== lastUser;
  }
  return false;
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

function Icon({
  children,
  className = "size-3.5",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      {children}
    </svg>
  );
}

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function NavGlyph({ id }: { id: (typeof NAV)[number]["id"] }) {
  switch (id) {
    case "search":
      return (
        <Icon>
          <circle cx="7" cy="7" r="4.2" {...stroke} />
          <path d="M10.2 10.2 13 13" {...stroke} />
        </Icon>
      );
    case "atlas":
      return (
        <Icon>
          <path
            d="M8 1.6 9.1 6.2 13.6 8 9.1 9.8 8 14.4 6.9 9.8 2.4 8 6.9 6.2 8 1.6Z"
            fill="currentColor"
          />
        </Icon>
      );
    case "home":
      return (
        <Icon>
          <path
            d="M2.5 7.2 8 2.8l5.5 4.4V13a1 1 0 0 1-1 1h-3.2V9.6H6.7V14H3.5a1 1 0 0 1-1-1V7.2Z"
            {...stroke}
          />
        </Icon>
      );
    case "check":
      return (
        <Icon>
          <rect x="2.2" y="2.2" width="11.6" height="11.6" rx="2" {...stroke} />
          <path d="M5 8.1 7.1 10.2 11 6" {...stroke} />
        </Icon>
      );
    case "person":
      return (
        <Icon>
          <rect x="2.2" y="2.2" width="11.6" height="11.6" rx="2" {...stroke} />
          <circle cx="8" cy="6.4" r="1.6" {...stroke} />
          <path d="M5 11.4c.5-1.3 1.6-1.9 3-1.9s2.5.6 3 1.9" {...stroke} />
        </Icon>
      );
    case "signature":
      return (
        <Icon>
          <path
            d="M2.4 11.2c2.2-3.4 3-5.2 3.4-5.2.6 0 .4 3.2 1.5 3.2 1 0 1.2-4.6 2.2-4.6.8 0 .6 3.4 1.6 3.4.7 0 1.2-.8 2.5-2.4"
            {...stroke}
          />
        </Icon>
      );
    case "calendar":
      return (
        <Icon>
          <rect
            x="2.2"
            y="3.2"
            width="11.6"
            height="10.2"
            rx="1.6"
            {...stroke}
          />
          <path d="M2.2 6.4h11.6M5.2 2.2v2.2M10.8 2.2v2.2" {...stroke} />
        </Icon>
      );
    case "chart":
      return (
        <Icon>
          <path d="M3 13V8.5M6.5 13V5.5M10 13V7.5M13.2 13V3.5" {...stroke} />
        </Icon>
      );
    case "building":
      return (
        <Icon>
          <path d="M3 13.5V3.2L8 2l5 1.2v10.3" {...stroke} />
          <path
            d="M6.2 6h.1M9.7 6h.1M6.2 8.6h.1M9.7 8.6h.1M7 13.5v-2.2h2v2.2"
            {...stroke}
          />
        </Icon>
      );
    case "brain":
      return (
        <Icon>
          <path
            d="M6 13.2V8.8M10 13.2V8.8M5.2 8.2a2.4 2.4 0 1 1 1.6-4.4A2.6 2.6 0 0 1 11 5.2a2.2 2.2 0 0 1 .2 4.2"
            {...stroke}
          />
        </Icon>
      );
    case "gear":
      return (
        <Icon>
          <circle cx="8" cy="8" r="2" {...stroke} />
          <path
            d="M8 2.4v1.4M8 12.2v1.4M2.4 8h1.4M12.2 8h1.4M4 4l1 1M11 11l1 1M12 4l-1 1M5 11l-1 1"
            {...stroke}
          />
        </Icon>
      );
    case "hammer":
      return (
        <Icon>
          <path
            d="M9.2 2.6 13 6.4 8.2 8.2 3.4 13l-1-1 4.8-4.8L6.2 2.6l3 .0Z"
            {...stroke}
          />
        </Icon>
      );
    case "refresh":
      return (
        <Icon>
          <path d="M13 8a5 5 0 1 1-1.4-3.5" {...stroke} />
          <path d="M13 2.8v3.2H9.8" {...stroke} />
        </Icon>
      );
    case "phone":
      return (
        <Icon>
          <path
            d="M4.2 2.8h2L7.4 6 5.8 7.2a8 8 0 0 0 3 3L10 8.6l3.2 1.2v2a1.2 1.2 0 0 1-1.3 1.2A10.2 10.2 0 0 1 3 4.1a1.2 1.2 0 0 1 1.2-1.3Z"
            {...stroke}
          />
        </Icon>
      );
    case "ladder":
      return (
        <Icon>
          <path
            d="M5 2.2 3.6 13.8M11 2.2 12.4 13.8M4.6 5.6h6.4M4.2 8.4h7.2M3.8 11.2h8"
            {...stroke}
          />
        </Icon>
      );
  }
}

function ActionGlyph({
  type,
}: {
  type: (typeof WORKING_ACTIONS)[number]["type"];
}) {
  if (type === "conversation") {
    return (
      <Icon className="size-2.625">
        <path
          d="M3 2.2h7.2l2.2 2.2v8.2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.2a1 1 0 0 1 1-1Z"
          {...stroke}
        />
        <path d="M4.2 7.2h5.2M4.2 9.6h3.4" {...stroke} />
      </Icon>
    );
  }
  if (type === "data") {
    return (
      <Icon className="size-2.625">
        <path d="M3 4.2 1.6 5.6 3 7M6.2 7.6 8.6 3.4" {...stroke} />
        <rect x="1.2" y="1.6" width="13.6" height="10.2" rx="1.4" {...stroke} />
        <path d="M1.2 11.8h13.6" {...stroke} />
      </Icon>
    );
  }
  return (
    <Icon className="size-2.625">
      <path d="M2.2 5.2 8 2.4l5.8 2.8L8 8 2.2 5.2Z" {...stroke} />
      <path d="M2.2 5.2V11L8 13.6 13.8 11V5.2" {...stroke} />
    </Icon>
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
      <div className="flex min-h-7.875 w-full items-center gap-1.75 px-1.3125 py-1.3125 text-sm leading-product tracking-product text-product-muted">
        <span
          className="grid size-5.25 place-items-center motion-safe:animate-working-pulse"
          aria-hidden
        >
          <Icon className="size-4.5 text-product-accent">
            <path
              d="M8 1.4 9.05 6.1 13.8 8 9.05 9.9 8 14.6 6.95 9.9 2.2 8 6.95 6.1 8 1.4Z"
              fill="currentColor"
            />
          </Icon>
        </span>
        <span>Working</span>
        <span
          className="size-0.4375 shrink-0 rounded-full bg-product-muted"
          aria-hidden
        />
        <span>{elapsedSeconds.toFixed(1)}s</span>
      </div>
      <div className="flex w-full gap-1.75 px-1.3125">
        <span
          className="mx-2.0625 w-px shrink-0 self-stretch bg-product-line"
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
        <p className="m-0 px-1.3125 py-1.3125 motion-safe:animate-message-enter">
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

function MenuIcon() {
  return (
    <span className="flex w-4.375 flex-col gap-0.95" aria-hidden>
      <span className="h-px w-3.25 bg-product" />
      <span className="h-px w-3.25 bg-product" />
      <span className="h-px w-3.25 bg-product" />
    </span>
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
        <div className="absolute inset-x-0 top-0 -bottom-6 overflow-hidden bg-black/2 panel:inset-x-auto panel:top-14 panel:-bottom-8 panel:left-1/2 panel:w-[calc(100%-128px)] panel:-translate-x-1/2 panel:rounded-2xl panel:bg-black/2 panel:p-1">
          <div className="flex h-full w-full overflow-hidden rounded-product bg-product-bg shadow-product panel:rounded-xl">
            <div className="flex h-full w-10 shrink-0 flex-col overflow-hidden bg-product text-white">
              <div className="grid h-10.75 shrink-0 place-items-center">
                <Icon className="size-3.5">
                  <path
                    d="M4 3.5 8.5 8 4 12.5M8 3.5 12.5 8 8 12.5"
                    {...stroke}
                  />
                </Icon>
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-0.625 overflow-hidden p-1.5625">
                {NAV.map((item) => (
                  <span
                    className={`grid size-6.66675 shrink-0 place-items-center rounded-product-mark ${
                      "active" in item && item.active ? "bg-product-accent" : ""
                    }`}
                    key={item.label}
                  >
                    <NavGlyph id={item.id} />
                  </span>
                ))}
              </div>
              <div className="flex h-21.25 shrink-0 flex-col items-center justify-center gap-1.5625 px-3.125">
                <img
                  src="https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a99c21d8224474fd312458b_Frame%201216043788.png"
                  alt=""
                  className="size-6.66675 rounded-full object-cover"
                />
                <img
                  src="https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a99cc9870c17f342bbf7407_Frame%201216043789%20(1).png"
                  alt=""
                  className="size-6.66675 object-contain"
                />
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col bg-product-bg">
              <header className="flex min-h-12 shrink-0 items-center justify-between overflow-hidden px-4 py-3 text-sm leading-product font-normal tracking-product panel:min-h-15.25 panel:px-7 panel:py-5.25">
                <MenuIcon />
                <div className="flex shrink-0 items-center gap-5 panel:gap-5.25">
                  <span className="hidden items-center gap-2.625 whitespace-nowrap panel:inline-flex">
                    <Icon className="size-4.375">
                      <path
                        d="M9.2 2.4 13.2 6.4 6.2 13.4H2.2v-4L9.2 2.4Z"
                        {...stroke}
                      />
                    </Icon>
                    New Chat
                  </span>
                  <Icon className="size-4.375">
                    <path
                      d="M6 3.2H3.4v2.6M10 3.2h2.6v2.6M13 10v2.6H10.4M3.4 10v2.6H6"
                      {...stroke}
                    />
                  </Icon>
                  <Icon className="size-4.375">
                    <path
                      d="M4.2 4.2 11.8 11.8M11.8 4.2 4.2 11.8"
                      {...stroke}
                    />
                  </Icon>
                </div>
              </header>

              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-3.5 pt-3 pb-10 panel:px-12 panel:pt-6 panel:pb-11 panel:max-wide:px-7">
                <ConversationPreview
                  key={`${current.title}-${activeIndex}`}
                  messages={currentMessages}
                  reduceMotion={reduceMotion}
                  active={inView}
                  onComposerTextChange={setComposerText}
                />

                <div className="flex w-full max-w-164.5 shrink-0 flex-col justify-between gap-4 self-center overflow-hidden rounded-lg border-hair border-product-ring bg-white px-3 py-2.5 shadow-composer panel:min-h-35 panel:p-4.375">
                  <p className="m-0 text-sm leading-product tracking-product wrap-anywhere whitespace-pre-wrap text-product">
                    {composerText}
                    <span className="ml-px inline-block h-3.5 w-px translate-y-0.5 bg-product align-text-bottom motion-safe:animate-blink" />
                  </p>
                  <div className="flex h-4.375 w-full items-center justify-between text-product-muted">
                    <div className="flex min-w-0 flex-1 items-center gap-4 overflow-hidden panel:gap-5.25">
                      <Icon className="size-4.375">
                        <path
                          d="M10.2 3.6 6.2 7.6a2.2 2.2 0 0 0 3.1 3.1l4.2-4.2a1.5 1.5 0 0 0-2.1-2.1L7.2 8.6"
                          {...stroke}
                        />
                      </Icon>
                      <Icon className="size-4.375">
                        <rect
                          x="6"
                          y="2"
                          width="4"
                          height="7.2"
                          rx="2"
                          {...stroke}
                        />
                        <path
                          d="M4.2 8.2a3.8 3.8 0 0 0 7.6 0M8 12v2"
                          {...stroke}
                        />
                      </Icon>
                      <Icon className="size-4.375">
                        <path
                          d="M4 2.2h5.2L12 5v8.6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3.2a1 1 0 0 1 1-1Z"
                          {...stroke}
                        />
                        <path d="M5.2 8h5M5.2 10.4h3.4" {...stroke} />
                      </Icon>
                      <span className="hidden items-center gap-1.3125 whitespace-nowrap panel:inline-flex">
                        <Icon className="size-3.5">
                          <circle cx="8" cy="8" r="5.2" {...stroke} />
                          <path d="M8 5.2v3l2 1.2" {...stroke} />
                        </Icon>
                        Caladan Lofts
                        <Icon className="size-3.5">
                          <path d="M4 6.2 8 10.2 12 6.2" {...stroke} />
                        </Icon>
                      </span>
                      <span className="hidden items-center gap-1.3125 whitespace-nowrap panel:inline-flex">
                        Full Agent
                        <Icon className="size-3.5">
                          <path d="M4 6.2 8 10.2 12 6.2" {...stroke} />
                        </Icon>
                      </span>
                    </div>
                    <Icon className="size-4.375 text-product">
                      <path d="M2.4 8h10.4M9.2 4.2 13.2 8l-4 3.8" {...stroke} />
                    </Icon>
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
              className={`relative flex min-w-0 flex-1 cursor-pointer flex-col items-start gap-1.5 border-0 border-t border-ink/15 bg-transparent pt-5 text-left font-sans text-muted transition-colors duration-300 max-panel:w-full max-panel:flex-none max-panel:py-4 max-panel:order-[calc(var(--tab-index)*2+1)] max-panel:last-of-type:border-b ${
                selected ? "text-ink max-panel:pb-0" : ""
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
              <span className="text-product-title leading-product-title font-product tracking-product-title max-wide:text-[clamp(16px,2vw,22px)] max-panel:text-xl">
                {slide.title}
              </span>
              <span
                className={`text-lg leading-product font-normal tracking-product max-wide:text-[clamp(14px,1.6vw,18px)] max-panel:text-base ${
                  selected ? "text-muted max-panel:block" : "max-panel:hidden"
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
