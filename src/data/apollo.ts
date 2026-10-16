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
    'These are my own re-implementations of Apollo surfaces, running on public assets and scripted fixtures — no EliseAI service, customer data or internal code is involved. The production build shipped alongside a full-stack engineer.',
    'I co-owned the interaction design with a product designer and owned the frontend implementation. The agent itself — model routing, tool calling, retrieval — was built by the agent and platform team, and nothing here claims that work.',
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
      'Apollo answers in several shapes. Rather than a component per shape, a response is a discriminated union of blocks with one exhaustive renderer — so a new answer type is a data change plus one branch, and a missing case is a build error instead of a blank space in production.',
    code: {
      lang: 'ts',
      file: 'src/components/apollo/types.ts',
      startLine: 12,
      source: `export type MessageBlock =
  | { type: "text"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "table"; columns: string[]; rows: string[][] }
  | { type: "draft"; text: string }
  | { type: "actions"; items: string[] };`,
    },
    takeaway:
      'The union is the contract between whoever writes conversations and whoever renders them.',
  },
  {
    id: 'layer',
    title: 'One primitive layer, two chromes',
    body:
      'Everything shared lives in `src/components/apollo/`. Two very different surfaces compose it: the in-product app, which is nothing but typing, and the marketing carousel, which nobody types into. They share the renderer and the fixtures and share no layout at all — so a restyle is a chrome change, never a fork of the conversation logic.',
    code: {
      lang: 'txt',
      file: 'src/components/apollo/',
      note: 'module layout',
      source: `types.ts · timing.ts · conversations.ts    shared model
ApolloBlocks.tsx · ThinkingStatus.tsx     renderer
Composer.tsx · AttachMenu.tsx             input
AgentMenu.tsx · Dropdown.tsx · useMenu.ts menus
SuggestionCard.tsx · CopyButton.tsx       controls

ApolloApp.tsx              in-product chrome  ─┐ one
../projects/ApolloUI.tsx   marketing chrome   ─┘ renderer`,
    },
    takeaway: 'Reuse what renders; specialise what choreographs.',
  },
  {
    id: 'theming',
    title: 'Re-theming a subtree with seven variables',
    body:
      'This page had to adopt Apollo’s palette, including components written against the portfolio scale. Tailwind v4 compiles every colour utility to `var(--color-*)`, so rather than rewriting class names I rebound the variables on one wrapper. The reused components are unmodified — they inherit the product colours because the tokens beneath them changed.',
    code: {
      lang: 'css',
      file: 'src/index.css',
      note: 'theme scope',
      source: `.theme-apollo {
  --color-bg: #fdfcfb;
  --color-ink: #0e0d0c;
  --color-muted: #7a7977;
  --color-line: #dddcda;
  --color-accent: #6b4fff;
}`,
    },
    takeaway:
      'Token indirection is the feature. One class re-themes a subtree without touching a component.',
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
    'The thing I would tell a team starting on an agent interface: the hardest problems are temporal, and they do not show up in a static mock. Thinking states, interrupted generation, an answer that arrives in the wrong order — none of those exist in Figma. They only become real when someone can feel them, which is the argument for design engineering as a role rather than a handoff.',
    'What I would change is the interruption model. Playback pauses and a pending reply can be cancelled, but you still cannot take over mid-sequence and redirect the conversation. Building that properly means treating a conversation as editable data rather than a script being played — which is also the version where the design system and the interaction system finally become the same artifact.',
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
