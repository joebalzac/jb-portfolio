/**
 * Case-study content for /work/apollo.
 *
 * Single source of truth for copy so the section components stay presentational.
 */

export const caseMeta = {
  eyebrow: 'case study / eliseai',
  headline:
    'Designing AI interactions that feel clear, responsive, and intuitive.',
  standfirst:
    'Apollo is an AI assistant built into the software property teams already live in. Its hardest design problems are not visual — they are temporal. A person asks a question, and then has to trust a system that pauses, plans, calls tools, and changes its mind in public.',
  role: 'Design engineer — interaction design co-owned, frontend implementation mine',
  team: 'Product designer, full-stack engineer, agent/platform team',
  stack: ['React 19', 'TypeScript', 'Tailwind v4', 'Vite'],
} as const;

/** Precise provenance. Stated up front so nothing downstream reads as overclaim. */
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
      'Apollo answers in several shapes — prose, checklists, tables, drafted messages, action chips. Rather than a component per shape, a response is a discriminated union with one exhaustive renderer: a new answer type is a data change, and a missing case is a build error rather than a blank space in production.',
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
  },
  {
    id: 'layer',
    title: 'One primitive layer, two chromes',
    body:
      'Everything shared lives in `src/components/apollo/` — the renderer, the composer, the menus, the fixtures. The in-product app and the marketing carousel compose the same parts and share no layout at all, so a restyle is a chrome change rather than a fork of the conversation logic.',
  },
  {
    id: 'theming',
    title: 'Re-theming by token, not by rewrite',
    body:
      'Tailwind v4 compiles every colour utility to `var(--color-*)`. Rebinding seven variables on a single wrapper re-themes the entire subtree, so components originally written against the portfolio palette adopt Apollo’s without being touched.',
    code: {
      lang: 'css',
      file: 'src/index.css',
      note: 'theme scope',
      source: `.theme-apollo {
  --color-ink: #0e0d0c;
  --color-muted: #7a7977;
  --color-line: #dddcda;
  --color-accent: #6b4fff;
}`,
    },
  },
];

export const sections = [
  { id: 'intro', number: '01', title: 'Introduction' },
  { id: 'experience', number: '02', title: 'The product experience' },
  { id: 'interaction', number: '03', title: 'Components & interactions' },
  { id: 'engineering', number: '04', title: 'Engineering & architecture' },
] as const;

export type SectionId = (typeof sections)[number]['id'];
