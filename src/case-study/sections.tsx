import { useState } from 'react';
import { ApolloApp } from '../components/apollo/ApolloApp';
import { ApolloUI } from '../components/projects/ApolloUI';
import { architecture, caseMeta, collaboration, contributions } from '../data/apollo';
import { ComponentGallery } from './ComponentGallery';
import { useDemoReset } from './presentationContext';
import { Button, ButtonLink, Chip } from '../ds';
import { CodeExcerpt } from '../ds/CodeExcerpt';
import { CaseSection, Eyebrow, Reveal, SHELL } from './primitives';

/* ------------------------------------------------------------------ hero */

export function CaseHero() {
  return (
    <header className="px-6 pt-24 pb-6 sm:px-8 sm:pt-32">
      <div className={SHELL}>
        <Reveal>
          <Eyebrow>{caseMeta.eyebrow}</Eyebrow>
        </Reveal>
        <Reveal delay={60}>
          <h1 className="mt-6 max-w-[22ch] text-[2.1rem] leading-[1.08] font-semibold tracking-[-0.03em] text-ink sm:text-5xl md:text-[3.75rem]">
            {caseMeta.headline}
          </h1>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            {caseMeta.standfirst}
          </p>
        </Reveal>
        <Reveal delay={150}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <ButtonLink href="#experience" tone="solid" size="lg" class="group">
              Try the interface
              <span
                aria-hidden
                className="transition-transform duration-300 ease-product group-hover:translate-x-0.5 motion-reduce:transition-none"
              >
                →
              </span>
            </ButtonLink>
            <ButtonLink href="#engineering" size="lg">
              Read the architecture
            </ButtonLink>
          </div>
        </Reveal>
        <Reveal delay={180}>
          <dl className="mt-14 grid grid-cols-1 gap-x-8 gap-y-6 border-t border-line pt-7 sm:grid-cols-2">
            <div>
              <dt className="font-mono text-[11px] tracking-wide text-faint uppercase">
                role
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink">
                {caseMeta.role}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] tracking-wide text-faint uppercase">
                team
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink">
                {caseMeta.team}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] tracking-wide text-faint uppercase">
                stack
              </dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {caseMeta.stack.map((tech) => (
                  <Chip key={tech}>{tech}</Chip>
                ))}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] tracking-wide text-faint uppercase">
                timeline
              </dt>
              <dd className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent/60" />
                to verify
              </dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </header>
  );
}

/* --------------------------------------------------------- 01 introduction */

export function Introduction() {
  return (
    <CaseSection id="intro" number="01" title="Introduction">
      <div className="grid gap-x-10 gap-y-12 md:grid-cols-2">
        <Reveal>
          <Eyebrow>what i owned</Eyebrow>
          <ul className="mt-5 space-y-5">
            {contributions.mine.map((item) => (
              <li key={item.label} className="flex items-start gap-3">
                <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                <span>
                  <span className="text-sm font-medium text-ink">{item.label}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted">
                    {item.detail}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={60}>
          <Eyebrow>what others owned</Eyebrow>
          <ul className="mt-5 space-y-5">
            {contributions.others.map((item) => (
              <li key={item.label} className="flex items-start gap-3">
                <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-faint" />
                <span>
                  <span className="text-sm font-medium text-muted">{item.label}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted">
                    {item.detail}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <Reveal className="mt-20">
        <div className="border-t border-line pt-7">
          <Eyebrow>{collaboration.title}</Eyebrow>
          <div className="mt-5 grid gap-x-8 gap-y-6 md:grid-cols-3">
            {collaboration.body.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-relaxed text-muted">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </Reveal>
    </CaseSection>
  );
}

/* ---------------------------------------------------- 02 the product experience */

export function ProductExperience() {
  const resetToken = useDemoReset();
  const [autoplay, setAutoplay] = useState(true);
  const [localReset, setLocalReset] = useState(0);

  /* Presentation reset and the section's own restart both remount the player,
     which is the only reliable way to return a timer-driven demo to frame one. */
  const demoKey = `${resetToken}-${localReset}`;

  return (
    <CaseSection id="experience" number="02" title="The product experience">
      <Reveal>
        <ApolloApp key={demoKey} />
      </Reveal>

      {/* Minimal disclosure, kept so nothing here reads as a live integration. */}
      <p className={`${SHELL} mt-3 text-xs text-faint`}>
        Illustrative demo — scripted fixtures, no live service or customer data.
      </p>

      <div className={`${SHELL} mt-20`}>
        <Reveal>
          <div className="flex flex-wrap items-center gap-2 border-t border-line pt-7">
            <span className="mr-auto font-mono text-[11px] tracking-wide text-faint uppercase">
              the same components, marketing chrome
            </span>
            <Button
              onClick={() => setAutoplay((value) => !value)}
              aria-pressed={!autoplay}
            >
              {autoplay ? 'pause' : 'play'}
            </Button>
            <Button onClick={() => setLocalReset((value) => value + 1)}>
              restart
            </Button>
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-8">
        <ApolloUI key={demoKey} autoplay={autoplay} />
      </Reveal>
    </CaseSection>
  );
}

/* ------------------------------------------------ 03 components & interactions */

export function InteractionDesign() {
  return (
    <CaseSection id="interaction" number="03" title="Components & interactions">
      <Reveal>
        <h3 className="max-w-2xl text-xl leading-snug font-medium tracking-tight text-ink sm:text-2xl">
          The pieces on their own. Every tile is the real component, running.
        </h3>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          Each one is importable from{' '}
          <code className="font-mono text-[13px] text-ink">
            src/components/apollo/
          </code>
          . The app in section 02 is these parts composed — nothing in it is
          bespoke.
        </p>
      </Reveal>

      <Reveal delay={60} className="mt-12">
        <ComponentGallery />
      </Reveal>
    </CaseSection>
  );
}

/* --------------------------------------------- 04 engineering & architecture */

export function Engineering() {
  return (
    <CaseSection id="engineering" number="04" title="Engineering & architecture">
      <Reveal>
        <h3 className="max-w-2xl text-xl leading-snug font-medium tracking-tight text-ink sm:text-2xl">
          Three structural decisions.
        </h3>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          React 19 and TypeScript, Tailwind v4 for tokens, Vite to build. No
          router, no animation library, no state library — the interesting work
          was in modelling and composition, not in dependencies.
        </p>
      </Reveal>

      <div className="mt-14 space-y-14">
        {architecture.map((note, index) => (
          <Reveal key={note.id} delay={index === 0 ? 0 : 40}>
            <article className="border-t border-line pt-7">
              <h4 className="text-base font-medium tracking-tight text-ink sm:text-lg">
                {note.title}
              </h4>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                {note.body}
              </p>
              {note.code ? (
                <CodeExcerpt
                  file={note.code.file}
                  startLine={note.code.startLine}
                  note={note.code.note}
                  source={note.code.source}
                />
              ) : null}
            </article>
          </Reveal>
        ))}
      </div>
    </CaseSection>
  );
}
