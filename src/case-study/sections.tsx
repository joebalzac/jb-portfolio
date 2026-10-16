import { useState } from 'react';
import { ApolloApp } from '../components/apollo/ApolloApp';
import { ApolloUI } from '../components/projects/ApolloUI';
import {
  architecture,
  caseMeta,
  collaboration,
  contributions,
  outcomes,
  problem,
  provenance,
  reflection,
} from '../data/apollo';
import { ComponentGallery } from './ComponentGallery';
import { useDemoReset } from './presentationContext';
import {
  CaseSection,
  CodeExcerpt,
  DemoNotice,
  Eyebrow,
  MetricPlaceholder,
  Reveal,
} from './primitives';

/* ------------------------------------------------------------------ hero */

export function CaseHero() {
  return (
    <header className="px-6 pt-24 pb-6 sm:px-8 sm:pt-32">
      <div className="mx-auto max-w-4xl">
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
            <a
              href="#experience"
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm text-bg transition-colors hover:bg-ink/85"
            >
              Try the interface
              <span
                aria-hidden
                className="transition-transform duration-300 ease-product group-hover:translate-x-0.5 motion-reduce:transition-none"
              >
                →
              </span>
            </a>
            <a
              href="#engineering"
              className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-muted transition-colors hover:border-faint hover:text-ink"
            >
              Read the architecture
            </a>
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
                  <span
                    key={tech}
                    className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[11px] text-muted"
                  >
                    {tech}
                  </span>
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
      <Reveal>
        <div className="rounded-xl border border-line bg-card px-5 py-5 sm:px-6">
          <Eyebrow>{provenance.title}</Eyebrow>
          <div className="mt-3 space-y-3">
            {provenance.body.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-relaxed text-muted">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-20">
        <h3 className="max-w-xl text-xl leading-snug font-medium tracking-tight text-ink sm:text-2xl">
          {problem.lede}
        </h3>
      </Reveal>

      <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-3">
        {problem.points.map((point, index) => (
          <Reveal key={point.heading} delay={index * 70}>
            <div className="border-t border-line pt-5">
              <h4 className="text-sm font-medium text-ink">{point.heading}</h4>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">
                {point.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-24">
        <div className="grid gap-x-10 gap-y-12 md:grid-cols-2">
          <div>
            <Eyebrow>what i owned</Eyebrow>
            <ul className="mt-5 space-y-5">
              {contributions.mine.map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  <span>
                    <span className="text-sm font-medium text-ink">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted">
                      {item.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Eyebrow>what others owned</Eyebrow>
            <ul className="mt-5 space-y-5">
              {contributions.others.map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-faint" />
                  <span>
                    <span className="text-sm font-medium text-muted">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted">
                      {item.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-20">
        <div className="border-t border-line pt-7">
          <Eyebrow>{collaboration.title}</Eyebrow>
          <div className="mt-5 grid gap-x-8 gap-y-6 md:grid-cols-3">
            {collaboration.body.map((paragraph) => (
              <p
                key={paragraph}
                className="text-sm leading-relaxed text-muted"
              >
                {paragraph}
              </p>
            ))}
          </div>
          <p className="mt-6 inline-flex items-center gap-1.5 font-mono text-[11px] text-faint">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent/60" />
            {collaboration.placeholder} — to verify
          </p>
        </div>
      </Reveal>
    </CaseSection>
  );
}

/* ---------------------------------------------------- 02 the product experience */

const TRY_IT = [
  { action: 'Pick a suggestion', result: 'Runs that role’s scripted exchange — tables, drafts and action chips.' },
  { action: 'The + menu', result: 'Upload from device, or drill into Entities, Connectors and Skills.' },
  { action: 'Agent & model', result: 'Reads out both settings at rest; either row drills in to change it.' },
  { action: 'Press Stop', result: 'Cancels a reply mid-flight. Lands immediately.' },
  { action: 'Hover a reply', result: 'Reveals a copy control for the whole answer.' },
  { action: 'Drag the corner', result: 'Resizes the window — arrow keys work on the handle too.' },
];

export function ProductExperience() {
  const resetToken = useDemoReset();
  const [autoplay, setAutoplay] = useState(true);
  const [localReset, setLocalReset] = useState(0);

  /* Presentation reset and the section's own restart both remount the player,
     which is the only reliable way to return a timer-driven demo to frame one. */
  const demoKey = `${resetToken}-${localReset}`;

  return (
    <CaseSection id="experience" number="02" title="The product experience" wide>
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <h3 className="max-w-xl text-xl leading-snug font-medium tracking-tight text-ink sm:text-2xl">
            Four roles, one surface — and you can drive it.
          </h3>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            The clearest argument for an interaction decision is the interface
            making it. So this is not a video. Type in it, interrupt it, copy out
            of it. This is the in-product chrome — the application as a property
            manager actually sees it.
          </p>
        </Reveal>

        <Reveal delay={80} className="mt-8">
          <DemoNotice>
            <strong className="font-medium text-ink">Illustrative demo.</strong>{' '}
            Replies come from scripted fixtures — no model, no EliseAI service, no
            customer data. The interaction behavior is the real implementation.
          </DemoNotice>
        </Reveal>
      </div>

      <Reveal delay={120} className="mt-10">
        <ApolloApp key={demoKey} />
      </Reveal>

      <div className="mx-auto mt-14 max-w-4xl">
        <Reveal>
          <Eyebrow>things to try</Eyebrow>
          <dl className="mt-6 grid gap-x-10 gap-y-px sm:grid-cols-2">
            {TRY_IT.map((item) => (
              <div
                key={item.action}
                className="flex flex-col border-t border-line py-3.5 sm:flex-row sm:gap-4"
              >
                <dt className="shrink-0 font-mono text-[11px] text-ink sm:w-40">
                  {item.action}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted sm:mt-0">
                  {item.result}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      {/* The shipped autoplaying version, for contrast. */}
      <div className="mx-auto mt-24 max-w-4xl">
        <Reveal>
          <Eyebrow>the shipped marketing surface</Eyebrow>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
            The same conversation components, restyled for the public marketing
            page — where nobody is going to type anything, so it plays itself.
            Two chromes, one renderer: the app above is built for work, this one
            is built to be looked at — which is why the brand gradient lives
            here, on the highlighted rail item, and the app settles for grey.
            Dwell time is computed from each script, and playback pauses on
            hover or off-screen.
          </p>
        </Reveal>

        <div className="mt-7 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoplay((value) => !value)}
            aria-pressed={!autoplay}
            className="cursor-pointer rounded-full border border-line px-3.5 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-faint hover:text-ink"
          >
            {autoplay ? 'pause autoplay' : 'resume autoplay'}
          </button>
          <button
            type="button"
            onClick={() => setLocalReset((value) => value + 1)}
            className="cursor-pointer rounded-full border border-line px-3.5 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-faint hover:text-ink"
          >
            restart
          </button>
        </div>
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

/* ----------------------------------------------- 05 outcome & reflection */

export function Outcome() {
  return (
    <CaseSection id="outcome" number="05" title="Outcome & reflection">
      <Reveal>
        <Eyebrow>{outcomes.title}</Eyebrow>
        <ul className="mt-5 space-y-4">
          {outcomes.shipped.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              <span className="max-w-2xl text-sm leading-relaxed text-ink sm:text-base">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal delay={60} className="mt-12">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {outcomes.metrics.map((metric) => (
            <MetricPlaceholder key={metric} label={metric} />
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-faint">
          Left unfilled on purpose — I would rather show four visible gaps than
          one number I cannot source.
        </p>
      </Reveal>

      <Reveal className="mt-24">
        <h3 className="font-mono text-xs tracking-wide text-muted">
          {reflection.title.toLowerCase()}
        </h3>
        <div className="mt-7 space-y-7 border-t border-line pt-7">
          {reflection.body.map((paragraph) => (
            <p
              key={paragraph}
              className="max-w-2xl text-base leading-relaxed text-ink sm:text-[1.0625rem] sm:leading-[1.75]"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </Reveal>
    </CaseSection>
  );
}
