export const profile = {
  name: 'joseph balzac',
  lines: [
    'design engineer building ai-native products.',
    'currently building agents at eliseai.',
  ],
  location: 'nyc',
};

export const nav = [
  { label: 'work', href: '#work' },
  { label: 'projects', href: '#projects' },
  { label: 'craft', href: '#craft' },
  { label: 'writing', href: '#writing' },
];

export type WorkImage = {
  src?: string;
  caption: string;
  description: string;
};

export type WorkSection = {
  cover?: string;
  coverLogo?: 'eliseai';
  coverLogoColor?: string;
  hero?: WorkImage;
  images: WorkImage[];
};

export type WorkItem = {
  name: string;
  description: string;
  whatIDid: string[];
  images: WorkImage[];
  sections?: WorkSection[];
  cover?: string;
  coverLogo?: 'eliseai';
  coverLogoColor?: string;
  brandTone?: 'dark' | 'soft';
  url?: string;
};

export const work: WorkItem[] = [
  {
    name: 'EliseAI',
    description: 'design, website, ux, engineering and everything in between.',
    brandTone: 'dark',
    cover: '/img/eliseai/cover-graphic.png',
    coverLogo: 'eliseai',
    whatIDid: [
      'shipped across the stack, taking features from design to production.',
      'shipped agentic chat frontend, proactive meeting briefs and reminders.',
      'designed and built the product onboarding that gets people to first value fast.',
      'built the marketing site, engineering blog, and the brand identity for launch.',
      'built the model router, eval harness, and memory system.',
    ],
    images: [
      {
        src: '/img/eliseai/homepage.png',
        caption: 'homepage',
        description:
          'marketing site hero — ai that improves how we live, for property and healthcare.',
      },
      {
        src: '/img/eliseai/voiceai.png',
        caption: 'voiceai',
        description:
          'mobile elise answering leasing calls and booking tours in real time.',
      },
      {
        src: '/img/eliseai/beyond-lofts.png',
        caption: 'beyond lofts',
        description:
          'leasing chat on a property site — tours, questions, and resident help in one thread.',
      },
      {
        src: '/img/eliseai/demo-request.png',
        caption: 'demo request',
        description:
          'demo funnel with social proof and a short getting-started form.',
      },
      {
        src: '/img/eliseai/product-demo.png',
        caption: 'product demo',
        description:
          'interactive product demo — housing and healthcare flows side by side.',
      },
    ],
  },
  {
    name: 'One AI',
    description:
      'eliseai manages the entire renter lifecycle in one connected system.',
    brandTone: 'soft',
    cover: '/img/eliseai/blue-fade.png',
    coverLogo: 'eliseai',
    coverLogoColor: '#ffffff',
    whatIDid: [
      'designed the one ai lifecycle story across inquiry, tour, and renewal.',
      'built conversation surfaces that keep context from first call to signed lease.',
      'shipped product flows for voice, leasing, guided tours, and renewals.',
    ],
    images: [],
    sections: [
      {
        hero: {
          src: '/img/eliseai/one-ai.png',
          caption: 'one ai',
          description:
            'one connected system across the renter lifecycle — inquiry to renewal.',
        },
        images: [
          {
            src: '/img/eliseai/convo-inquiry.png',
            caption: 'inquiry',
            description:
              'voice + leasing handoff — waitlists, sister communities, and next steps in one thread.',
          },
          {
            src: '/img/eliseai/convo-tour.png',
            caption: 'tour & apply',
            description:
              'ai-guided tours in chat, highlighting what makes the unit special.',
          },
          {
            src: '/img/eliseai/convo-renewal.png',
            caption: 'renewal',
            description:
              'sentiment-aware renewal offers when the resident is most likely to stay.',
          },
        ],
      },
    ],
  },
];

export const sideProjects: WorkItem[] = [];

export type WritingPost = {
  title: string;
  date: string;
  url?: string;
};

export const writing: WritingPost[] = [];

export const links = [
  { label: 'GitHub', href: 'https://github.com/joebalzac' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/joebalzac/' },
  { label: 'Dribbble', href: 'https://dribbble.com/joebalzac' },
  { label: 'CodePen', href: 'https://codepen.io/joebalzac' },
  { label: 'Email', href: 'mailto:jgbalzac@gmail.com' },
];
