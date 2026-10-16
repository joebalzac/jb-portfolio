import { useEffect } from 'react';
import { Footer } from '../components/Footer';
import { sections } from '../data/apollo';
import { isPlainClick } from '../lib/useRoute';
import { PresentationBar } from './PresentationBar';
import { PresentationProvider } from './presentation';
import { usePresentation } from './presentationContext';
import {
  CaseHero,
  Engineering,
  InteractionDesign,
  Introduction,
  Outcome,
  ProductExperience,
} from './sections';

/** Case-study header: route back to the portfolio, enter presentation mode. */
function CaseNav({ onNavigate }: { onNavigate: (to: string) => void }) {
  const { active, toggle, index } = usePresentation();
  const current = sections[index];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4 sm:px-8">
        <a
          href="/"
          onClick={(event) => {
            if (!isPlainClick(event)) return;
            event.preventDefault();
            onNavigate('/');
          }}
          className="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
        >
          <span
            aria-hidden
            className="transition-transform duration-300 ease-product group-hover:-translate-x-0.5 motion-reduce:transition-none"
          >
            ←
          </span>
          joseph balzac
        </a>

        <div className="flex items-center gap-3">
          <span
            className="hidden font-mono text-[11px] text-faint sm:inline"
            aria-hidden
          >
            <span className="tabular-nums">{current.number}</span>
            <span className="mx-1.5 opacity-50">/</span>
            {current.title.toLowerCase()}
          </span>
          <button
            type="button"
            onClick={toggle}
            aria-pressed={active}
            className="cursor-pointer rounded-full border border-line px-3.5 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-faint hover:text-ink"
          >
            {active ? 'exit present' : 'present'}
            <kbd className="ml-2 hidden font-mono text-[10px] text-faint not-italic sm:inline">
              P
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
}

function CaseStudyBody({ onNavigate }: { onNavigate: (to: string) => void }) {
  const { active } = usePresentation();

  return (
    <div className="theme-apollo min-h-screen bg-bg text-ink">
      <a
        href="#intro"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-70 focus:rounded-full focus:border focus:border-line focus:bg-bg focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
      >
        Skip to case study
      </a>

      <CaseNav onNavigate={onNavigate} />

      <main
        /* Bottom padding clears the presentation bar so the last section
           is never trapped underneath it. */
        className={active ? 'pb-28' : undefined}
      >
        <CaseHero />
        <Introduction />
        <ProductExperience />
        <InteractionDesign />
        <Engineering />
        <Outcome />
      </main>

      {active ? null : <Footer />}
      <PresentationBar />
    </div>
  );
}

export function ApolloCaseStudy({
  onNavigate,
}: {
  onNavigate: (to: string) => void;
}) {
  useEffect(() => {
    const previous = document.title;
    document.title = 'apollo — case study | joseph balzac';
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <PresentationProvider>
      <CaseStudyBody onNavigate={onNavigate} />
    </PresentationProvider>
  );
}
