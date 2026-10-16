/**
 * Case-study content for /work/apollo.
 *
 * Single source of truth for copy so the section components stay presentational.
 * Anything not yet verified is a `placeholder: true` metric and renders as a
 * visible "to verify" chip — never as an invented number.
 */

export const caseMeta = {
  eyebrow: 'case study / eliseai',
  headline:
    'Designing AI interactions that feel clear, responsive, and intuitive.',
  standfirst:
    'Apollo is an AI assistant built into the software property teams already live in. Its hardest design problems are not visual — they are temporal. A person asks a question, and then has to trust a system that pauses, plans, calls tools, and changes its mind in public.',
  role: 'Design engineer — interaction design co-owned, frontend implementation mine',
  team: 'Product designer, full-stack engineer, agent/platform team',
  timeline: { value: 'Timeline', placeholder: true as const },
  stack: ['React 19', 'TypeScript', 'Tailwind v4', 'Vite'],
} as const;

/** Precise provenance. Stated up front so nothing downstream reads as overclaim. */
export const provenance = {
  title: 'What you are looking at',
  body: [
    'The demo in section 02 is my own re-implementation of a surface shipped on EliseAI’s public Apollo marketing experience. It matches the production interface, and it runs on public assets with a scripted conversation — no EliseAI service, customer data, or internal code is involved.',
    'The production build shipped alongside a full-stack engineer. I co-owned the interaction design with a product designer and owned the frontend implementation: conversation and thinking states, navigation, responsive behavior, and motion.',
    'The agent itself — model routing, tool calling, retrieval — was built by the agent and platform team. Nothing in this case study claims that work.',
  ],
} as const;

export const problem = {
  title: 'The problem',
  lede:
    'A leasing agent between tours has about fifteen seconds of patience. The assistant they are asking is slow by nature: it plans, reads lease data, and sometimes writes on their behalf.',
  points: [
    {
      heading: 'Latency you cannot design away',
      body: 'An agent that reasons takes seconds, not milliseconds. The interface has to make that wait legible instead of pretending it is not happening — a spinner says "wait", but it does not say "I understood you".',
    },
    {
      heading: 'Four jobs, one surface',
      body: 'Leasing, maintenance, community management and regional leadership ask structurally different questions. The same chat surface has to answer with a checklist, a comparison table, a draft message, or a portfolio breakdown — without becoming four products.',
    },
    {
      heading: 'Actions, not just answers',
      body: 'Apollo drafts texts and marks tours shown. The moment an assistant can act, the interface owes the user a visible seam between "here is what I found" and "here is what I am about to do on your behalf".',
    },
  ],
} as const;

export type Contribution = { label: string; detail: string };

export const contributions: { mine: Contribution[]; others: Contribution[] } = {
  mine: [
    {
      label: 'Conversation and thinking states',
      detail:
        'The planning → working → answer progression, including the elapsed-time readout and the tool-loading trace that shows what the agent is reaching for.',
    },
    {
      label: 'Response block system',
      detail:
        'A typed block model so one renderer handles prose, ordered checklists, data tables, drafted messages and action chips — and a new response shape is a data change, not a new component.',
    },
    {
      label: 'Motion and timing',
      detail:
        'Every duration in the experience, and the decision to derive dwell time from content rather than hard-code it.',
    },
    {
      label: 'Responsive architecture',
      detail:
        'One DOM tree serving a desktop tab layout and a mobile interleaved layout, with no duplicated markup.',
    },
    {
      label: 'Marketing implementation',
      detail:
        'Frontend implementation of the public Apollo marketing experience.',
    },
  ],
  others: [
    {
      label: 'Agent system',
      detail:
        'Model routing, tool calling and retrieval — built by the agent and platform team.',
    },
    {
      label: 'Production integration',
      detail:
        'The shipped build was completed with a full-stack engineer who owned the data and service layer.',
    },
    {
      label: 'Visual language',
      detail:
        'Co-owned with a product designer; interaction decisions were made jointly in the code and review loop.',
    },
  ],
};

export const collaboration = {
  title: 'How it was built with the team',
  body: [
    'Interaction design was co-owned, not handed over. The product designer and I settled decisions inside the implementation — a timing value or a state transition is faster to resolve by building two versions and looking at them than by annotating a frame.',
    'Production shipped with a full-stack engineer who owned the data and service layer. My side was the interface contract: what shape a response arrives in, and what the interface does during the seconds before it arrives.',
    'The agent team owned model routing and tool calling. The boundary that keeps that clean is the typed response schema — the interface needs to know which shapes an answer can take, not how the agent chose one.',
  ],
  placeholder: 'Process detail — review cadence, design-system ownership',
} as const;

export type InteractionDecision = {
  id: string;
  index: string;
  title: string;
  problem: string;
  decision: string;
  evidence?: { file: string; line: number; label: string };
};

export const decisions: InteractionDecision[] = [
  {
    id: 'two-phase',
    index: '01',
    title: 'Two phases, not one spinner',
    problem:
      'A single loading state collapses two different kinds of waiting into one signal. The user cannot tell "I am still reading your question" apart from "I am working on it".',
    decision:
      'The wait is split. A short shimmering "Planning next moves" acknowledges the request within 600ms, then a "Working" panel takes over with an elapsed counter and the skills being loaded. The first phase buys trust; the second accounts for the time.',
    evidence: {
      file: 'src/components/apollo/timing.ts',
      line: 14,
      label: 'phase durations',
    },
  },
  {
    id: 'elapsed',
    index: '02',
    title: 'Show elapsed time, not progress',
    problem:
      'A progress bar for an agent is a lie — there is no denominator. But an unbounded wait with no feedback reads as a hang.',
    decision:
      'A counting elapsed-seconds readout. It is honest about not knowing how long the work will take, while still proving the system is alive. Counting up is defensible; a fake percentage is not.',
  },
  {
    id: 'derived-timing',
    index: '03',
    title: 'Derive timing from content',
    problem:
      'The persona carousel auto-advances, and a progress indicator tracks the dwell. Hard-coding that duration means any copy edit silently desynchronizes the bar from the script.',
    decision:
      'Dwell time is computed by walking the conversation and summing typing, planning, thinking and hold beats. The result is passed into CSS as a custom property that the progress keyframe consumes, so the indicator and the advance share one number by construction.',
    evidence: {
      file: 'src/components/projects/ApolloUI.tsx',
      line: 33,
      label: 'slideDurationMs',
    },
  },
  {
    id: 'interruptible',
    index: '04',
    title: 'Motion yields to the reader',
    problem:
      'Autoplaying motion competes with reading. It is also wasted work when the component is off-screen.',
    decision:
      'Playback pauses on hover, pauses when an IntersectionObserver reports the section out of view, and stops entirely under reduced motion. The scheduler is an array of timeout ids torn down on every dependency change, so an interruption is never a half-finished sequence. The interactive surface above goes further: Stop cancels a pending reply outright, which is the behavior I argued was missing when I first wrote this up.',
    evidence: {
      file: 'src/components/projects/ApolloUI.tsx',
      line: 238,
      label: 'pause conditions',
    },
  },
  {
    id: 'scroll-anchor',
    index: '05',
    title: 'Anchor long answers to their top',
    problem:
      'Chat surfaces scroll to the bottom on new content. When the answer is a long table, that drops the reader at the last row of something they have not started reading.',
    decision:
      'If the incoming message is taller than the viewport, scroll to its top instead of the thread bottom. Short answers still pin to the bottom. Eight lines of code, and it is the difference between reading an answer and hunting for its beginning.',
    evidence: {
      file: 'src/components/projects/ApolloUI.tsx',
      line: 176,
      label: 'scroll anchoring',
    },
  },
  {
    id: 'reduced-motion',
    index: '06',
    title: 'Reduced motion means arrive, not freeze',
    problem:
      'Suppressing animation with CSS alone leaves a staged reveal stuck at frame zero — the content never appears at all.',
    decision:
      'Reduced motion is a branch in the state machine, not a stylesheet override. It sets the visible message count to the full thread and clears the pending phase, so the complete answer is simply present. The preference is subscribed to, so changing it mid-session takes effect without a reload.',
    evidence: {
      file: 'src/components/projects/ApolloUI.tsx',
      line: 75,
      label: 'reduced-motion branch',
    },
  },
];

export type ArchitectureNote = {
  id: string;
  title: string;
  body: string;
  code?: {
    lang: string;
    file: string;
    /** Present only when the snippet is contiguous and verbatim. */
    startLine?: number;
    /** Shown instead of a line range for an abridged snippet. */
    note?: string;
    source: string;
  };
  takeaway?: string;
};

export const architecture: ArchitectureNote[] = [
  {
    id: 'block-model',
    title: 'Model the response, not the markup',
    body:
      'Apollo answers in several shapes. Rather than a component per shape with overlapping props, responses are a discriminated union of blocks. One renderer switches on the tag; TypeScript makes a missing case a compile error rather than a blank space in production. Adding a response type is a data change plus one branch.',
    code: {
      lang: 'ts',
      file: 'src/components/apollo/types.ts',
      startLine: 12,
      source: `export type MessageBlock =
  | { type: "text"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "table"; columns: string[]; rows: string[][] }
  | { type: "draft"; text: string }
  | { type: "actions"; items: string[] };

export type ChatMessage = {
  role: "user" | "apollo";
  blocks: MessageBlock[];
};`,
    },
    takeaway:
      'The union is the contract between whoever writes conversations and whoever renders them.',
  },
  {
    id: 'timing',
    title: 'Timing as derived state',
    body:
      'This is the decision I would defend hardest. The carousel needs to know how long a conversation takes to play. That number is not a constant — it is a function of the script. So it is computed from the script, floored to a minimum, and then handed to CSS as a custom property so the progress animation and the auto-advance timer read the same value.',
    code: {
      lang: 'ts',
      file: 'src/components/projects/ApolloUI.tsx',
      startLine: 33,
      source: `function slideDurationMs(messages: ChatMessage[]) {
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
}`,
    },
    takeaway:
      'Edit a message and the progress bar retimes itself. No constant to remember to update.',
  },
  {
    id: 'state-machine',
    title: 'One phase variable, three exclusive states',
    body:
      'The conversation surface holds a single `phase` of "idle" | "planning" | "working" rather than separate booleans. Two loading states cannot be true at once, so the type makes that impossible instead of relying on discipline. Everything else — visible message count, elapsed seconds, composer text — is driven off that one value.',
    code: {
      lang: 'ts',
      file: 'src/components/projects/ApolloUI.tsx',
      startLine: 65,
      source: `const [visibleCount, setVisibleCount] = useState(
  reduceMotion ? thread.length : 0,
);
const [phase, setPhase] = useState<"idle" | "planning" | "working">("idle");
const [elapsedSeconds, setElapsedSeconds] = useState(0);
const [composerTarget, setComposerTarget] = useState("");`,
    },
    takeaway:
      'Impossible states are unrepresentable, so no reconciliation logic is needed.',
  },
  {
    id: 'tokens',
    title: 'Two token families in one theme',
    body:
      'The portfolio and the product it embeds are different design languages, and the embedded one has to look like itself — not like my site wearing a product costume. So the Tailwind v4 theme carries two namespaces: portfolio tokens, and a `product-*` skin with its own color, leading, tracking, shadow and a 0.5px hairline border width. Nesting a product surface inside an editorial page becomes a naming decision instead of a pile of one-off overrides.',
    code: {
      lang: 'css',
      file: 'src/index.css',
      note: 'abridged from @theme',
      source: `/* portfolio */
--color-bg: #fdfdfc;
--color-ink: #1a1a1a;
--color-muted: #8a8880;

/* embedded product skin */
--color-product: #0e0d0c;
--color-product-accent: #6b4fff;
--color-product-soft: #f6f4f2;
--leading-product: 1.4;
--tracking-product-title: -0.03em;
--border-width-hair: 0.5px;`,
    },
    takeaway:
      'Theme-level separation, so neither language can quietly drift into the other.',
  },
  {
    id: 'responsive',
    title: 'One DOM tree, two layouts',
    body:
      'On desktop the stage sits above a row of persona tabs. On mobile the stage moves to sit directly under whichever tab is active. The obvious implementations are a duplicated tree or a JS layout switch — both cost correctness. Instead the active index is written to CSS as a custom property and flex `order` is computed from it, so the single tree reorders itself at the breakpoint.',
    code: {
      lang: 'tsx',
      file: 'src/components/projects/ApolloUI.tsx',
      note: 'abridged — L347, L353, L476',
      source: `style={{ "--active": activeIndex } as CSSProperties}

// stage, reordered under the active tab below the panel breakpoint
className="max-panel:order-[calc(var(--active)*2+2)]"

// each tab, interleaved with it
className="max-panel:order-[calc(var(--tab-index)*2+1)]"`,
    },
    takeaway:
      'No duplicated markup, no resize listener driving layout, one source of truth for which persona is active.',
  },
  {
    id: 'layer',
    title: 'One primitive layer, two surfaces',
    body:
      'Building the interactive demo forced the boundary to become real. Everything shared now lives in `src/components/apollo/` — the block renderer, the thinking panel, the composer, the dropdown, the clipboard button, the timing constants and the conversation fixtures. Two very different surfaces compose them: the autoplaying marketing carousel, which nobody types into, and the interactive playground, which is nothing but typing. Neither duplicates the other, and the demo in section 02 is therefore the same renderer that ships, not a lookalike.',
    code: {
      lang: 'txt',
      file: 'src/components/apollo/',
      note: 'module layout',
      source: `types.ts           MessageBlock, ChatMessage, Persona
timing.ts          every duration, read by 3 consumers
conversations.ts   scripted fixtures + userMessageText
ApolloBlocks.tsx   the exhaustive block renderer
ThinkingStatus.tsx planning / working panel
Composer.tsx       prompt box, auto-grow, submit rules
Dropdown.tsx       ARIA listbox, roving focus
CopyButton.tsx     clipboard + fallback + announcement
ApolloPlayground.tsx  interactive composition
chrome.ts / UiIcon.tsx / options.ts`,
    },
    takeaway:
      'Reuse what renders; specialize what choreographs. The folder is the argument.',
  },
  {
    id: 'theming',
    title: 'Re-theming a subtree with seven variables',
    body:
      'This page had to adopt Apollo’s palette, including components originally written against the portfolio scale. Tailwind v4 compiles every color utility to `var(--color-*)`, so instead of rewriting class names I rebound the variables on one wrapper. `ThinkingTrace`, `ToolCallStack` and the footer are unmodified — they inherit the product colors because the tokens beneath them changed.',
    code: {
      lang: 'css',
      file: 'src/index.css',
      note: 'theme scope',
      source: `.theme-apollo {
  --color-bg: #fdfcfb;
  --color-ink: #0e0d0c;
  --color-muted: #7a7977;
  --color-faint: #a9a8a5;
  --color-line: #dddcda;
  --color-card: #f6f4f2;
  --color-accent: #6b4fff;
}`,
    },
    takeaway:
      'Token indirection is the feature. One class re-themes a subtree without touching a component.',
  },
];

export type Honest = { title: string; body: string };

/** Findings from auditing my own component for this case study. */
export const audit: Honest[] = [
  {
    title: 'The tab pattern was incomplete',
    body:
      'Writing this up, I re-read my own markup and found `role="tablist"` with tabs that had no `aria-controls`, no associated panels, and no arrow-key handling — a half-implemented ARIA pattern, which is worse than none, because it promises assistive tech a contract it does not honor. Fixed as part of this build: real roving focus, Home/End, and proper panel association.',
  },
  {
    title: 'The stage is hidden from assistive tech',
    body:
      'The simulated product chrome is `aria-hidden`. That is deliberate — it is an illustration of an interface, not an interface, and exposing a fake nav rail of eighteen unlabeled icons to a screen reader would be noise. The conversation content is announced through a live region instead. I would rather state that tradeoff than let it look like an oversight.',
  },
  {
    title: 'Typing state re-renders the tree',
    body:
      'Composer text is lifted to the top-level component so the typing simulation can drive the composer that lives outside the conversation scroller. That means a re-render per character. At this scale it is imperceptible, and I measured before accepting it — but the honest fix is a ref-and-subscribe or a portal, and I would take it if this surface grew.',
  },
];

export const outcomes = {
  title: 'What shipped',
  shipped: [
    'The Apollo conversation surface in production, built with a full-stack engineer.',
    'The role-aware experience on EliseAI’s public Apollo marketing page.',
    'A typed response-block system now used for every Apollo answer shape.',
  ],
  /** Deliberately unfilled. Rendered as visible "to verify" chips. */
  metrics: [
    'Launch date',
    'Adoption / usage',
    'Performance or engagement delta',
    'Team or customer feedback',
  ],
} as const;

export const reflection = {
  title: 'Reflection',
  body: [
    'The thing I would tell a team starting on an agent interface: your hardest problems are temporal, and they will not show up in a static mock. Thinking states, interrupted generation, an answer that arrives in the wrong order — none of those exist in Figma. They only become real when someone can feel them, which is the argument for design engineering as a role rather than a handoff.',
    'What I got right was treating timing as derived data instead of a pile of constants. What I would change is the interruption model. Right now playback pauses; it does not let you take over mid-sequence and drive the conversation yourself. A real agent interface needs a stop button that lands instantly, and the scripted player taught me how much of that is a scheduling problem rather than a UI one.',
    'Scaling this further, I would push the choreography into a declarative description a designer could edit — a conversation as data, with phases and beats, rendered by a player neither of us has to touch. That is the version where the design system and the interaction system are the same artifact, which is where I think this work is heading.',
  ],
} as const;

export const sections = [
  { id: 'intro', number: '01', title: 'Introduction' },
  { id: 'experience', number: '02', title: 'The product experience' },
  { id: 'interaction', number: '03', title: 'Components & interactions' },
  { id: 'engineering', number: '04', title: 'Engineering & architecture' },
  { id: 'outcome', number: '05', title: 'Outcome & reflection' },
] as const;

export type SectionId = (typeof sections)[number]['id'];
