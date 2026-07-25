export const profile = {
  name: 'Joseph Balzac',
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

export type WorkItem = {
  name: string;
  description: string;
  whatIDid: string[];
  images: WorkImage[];
  cover?: string;
  coverLogo?: 'eliseai';
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
    name: 'milbotix',
    description:
      'the web design and setup tooling behind smartsocks, a health wearable in a sock.',
    brandTone: 'soft',
    whatIDid: [
      'led the web design and setup for smartsocks.',
      'automated the manual onboarding and halved startup time.',
      'shipped user-validated prototypes with an outsourced team, plus the diagnostic tools the engineers worked from.',
      'piloted the ux across care organisations.',
    ],
    images: [
      {
        caption: 'smartsocks',
        description:
          'the wearable itself — hardware paired with the companion app.',
      },
      {
        caption: 'placeholder',
        description: 'add a caption for this image.',
      },
      {
        caption: 'placeholder',
        description: 'add a caption for this image.',
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
