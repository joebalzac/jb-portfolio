import { useState } from 'react';
import {
  Button,
  ButtonLink,
  Chip,
  IconButton,
  Panel,
  Surface,
  Text,
  type ButtonSize,
  type ButtonTone,
} from '../ds';
import { CodeExcerpt } from '../ds/CodeExcerpt';
import { isPlainClick } from '../lib/useRoute';
import { COLOR_TOKENS, TYPE_TOKENS } from './tokens';

const TONES: ButtonTone[] = ['ghost', 'solid', 'active', 'quiet'];
const SIZES: ButtonSize[] = ['sm', 'md', 'lg'];

function Section({
  id,
  number,
  title,
  lede,
  children,
}: {
  id: string;
  number: string;
  title: string;
  lede?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 px-6 py-group sm:px-8 sm:py-section">
      <div className="shell">
        <div className="mb-10 flex items-baseline gap-4 border-t border-line pt-5">
          <span className="font-mono text-xs text-faint tabular-nums">{number}</span>
          <h2 className="font-mono text-xs tracking-wide text-muted">
            {title.toLowerCase()}
          </h2>
        </div>
        {lede ? (
          <Text variant="lede" class="mb-10 max-w-2xl">
            {lede}
          </Text>
        ) : null}
        {children}
      </div>
    </section>
  );
}

/** A labelled specimen row, so every example reads the same way. */
function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-3 border-t border-line py-5 sm:grid-cols-[10rem_1fr] sm:gap-6">
      <Text variant="mono" class="pt-1">
        {label}
      </Text>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function DesignSystemPage({
  onNavigate,
}: {
  onNavigate: (to: string) => void;
}) {
  const [themed, setThemed] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur">
        <div className="shell flex items-center justify-between gap-4 px-6 py-4 sm:px-8">
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
          <Text variant="mono">design system</Text>
        </div>
      </header>

      <main>
        <div className="px-6 pt-20 pb-6 sm:px-8 sm:pt-28">
          <div className="shell">
            <Text variant="eyebrow">component library</Text>
            <h1 className="mt-6 max-w-[20ch] text-[2.1rem] leading-[1.08] font-semibold tracking-product-title text-ink sm:text-5xl">
              Tokens, recipes, components.
            </h1>
            <Text variant="body" class="mt-7 max-w-2xl sm:text-base">
              This library came out of a real problem in this repository: the
              same ghost button existed in eight places with four different
              padding values. Nobody decided that — it drifted. The fix is three
              layers, each with one job.
            </Text>
            <div className="mt-8 flex flex-wrap gap-2">
              <ButtonLink href="#components" tone="solid" size="lg">
                Components
              </ButtonLink>
              <ButtonLink href="#theming" size="lg">
                Theming
              </ButtonLink>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- foundations */}
        <Section
          id="foundations"
          number="01"
          title="Foundations"
          lede="Seven colours, six type roles. A scale small enough to hold in your head is a scale people actually use."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Surface tone="sunken" pad="lg">
              <Text variant="eyebrow">colour</Text>
              <ul className="mt-5 flex flex-col gap-3">
                {COLOR_TOKENS.map((token) => (
                  <li key={token.name} className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="size-7 shrink-0 rounded-md border border-line"
                      style={{ background: `var(--color-${token.name})` }}
                    />
                    <span className="min-w-0 flex-1">
                      <code className="font-mono text-[11px] text-ink">
                        --color-{token.name}
                      </code>
                      <Text variant="detail" class="mt-0.5">
                        {token.use}
                      </Text>
                    </span>
                  </li>
                ))}
              </ul>
            </Surface>

            <Surface tone="sunken" pad="lg">
              <Text variant="eyebrow">type</Text>
              <ul className="mt-5 flex flex-col gap-4">
                {TYPE_TOKENS.map((token) => (
                  <li key={token.variant}>
                    <Text variant={token.variant}>
                      {token.variant === 'eyebrow'
                        ? 'eyebrow label'
                        : 'The quick brown fox'}
                    </Text>
                    <Text variant="mono" class="mt-1 block">
                      {token.variant} — {token.use}
                    </Text>
                  </li>
                ))}
              </ul>
            </Surface>
          </div>
        </Section>

        {/* --------------------------------------------------------- recipes */}
        <Section
          id="recipes"
          number="02"
          title="The variant engine"
          lede="Thirty lines instead of a dependency. Every component is a recipe: a base, named axes, and defaults."
        >
          <CodeExcerpt
            file="src/ds/cv.ts"
            note="the whole API"
            source={`const chip = cv({
  base: 'inline-flex items-center rounded-full',
  variants: {
    tone: { neutral: 'border border-line text-muted', accent: '…' },
    size: { sm: 'px-2 py-0.5 text-[10px]', md: 'px-2.5 py-0.5 text-[11px]' },
  },
  defaults: { tone: 'neutral', size: 'md' },
});

chip({ tone: 'accent' })   // types are inferred from the recipe`}
          />
          <Text variant="body" class="mt-6 max-w-2xl">
            TypeScript infers the allowed values from the recipe itself, so{' '}
            <code className="font-mono text-product-chip text-ink">tone="danger"</code>{' '}
            fails to compile on a recipe with no danger tone. Recipes live apart
            from components in{' '}
            <code className="font-mono text-product-chip text-ink">recipes.ts</code>, so
            a bare class string is available when a component API does not fit,
            and each component module exports only components.
          </Text>
        </Section>

        {/* ------------------------------------------------------ components */}
        <Section
          id="components"
          number="03"
          title="Components"
          lede="One API shape across the set: tone for intent, size for scale, class for layout only."
        >
          <Surface pad="lg">
            <Text variant="title">Button</Text>
            <Text variant="detail" class="mt-1 mb-2">
              Renders a button. ButtonLink takes the same recipe and renders an
              anchor — different props, so different components.
            </Text>
            {TONES.map((tone) => (
              <Spec key={tone} label={`tone="${tone}"`}>
                {SIZES.map((size) => (
                  <Button key={size} tone={tone} size={size}>
                    {size}
                  </Button>
                ))}
                <Button tone={tone} disabled>
                  disabled
                </Button>
              </Spec>
            ))}
          </Surface>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Surface pad="lg">
              <Text variant="title">IconButton</Text>
              <Text variant="detail" class="mt-1 mb-2">
                <code className="font-mono">label</code> is required — it becomes
                the accessible name, so an icon-only control cannot ship unnamed.
              </Text>
              <Spec label="tone">
                <IconButton label="Quiet example">‹</IconButton>
                <IconButton label="Outlined example" tone="outlined">
                  ›
                </IconButton>
                <IconButton label="Active example" tone="active">
                  ?
                </IconButton>
                <IconButton label="Disabled example" tone="outlined" disabled>
                  ×
                </IconButton>
              </Spec>
            </Surface>

            <Surface pad="lg">
              <Text variant="title">Chip</Text>
              <Text variant="detail" class="mt-1 mb-2">
                Static label. Anything clickable is a Button.
              </Text>
              <Spec label="tone">
                <Chip>neutral</Chip>
                <Chip tone="accent">accent</Chip>
                <Chip tone="filled">filled</Chip>
                <Chip size="sm">small</Chip>
              </Spec>
            </Surface>
          </div>

          <Surface pad="lg" class="mt-4">
            <Text variant="title">Panel</Text>
            <Text variant="detail" class="mt-1 mb-5">
              The composition case. Dot notation so children read in render
              order, and the regions own how they sit against each other.
            </Text>
            <div className="grid gap-3 sm:grid-cols-2">
              <Panel>
                <Panel.Header
                  title="Panel.Header"
                  note="Title, note and an action slot."
                  action={<Button size="sm">action</Button>}
                />
                <Panel.Body>
                  <Text variant="mono">Panel.Body</Text>
                </Panel.Body>
                <Panel.Footer>Panel.Footer</Panel.Footer>
              </Panel>
              <Panel tone="sunken">
                <Panel.Header title="tone=&quot;sunken&quot;" />
                <Panel.Body>
                  <Text variant="mono">Same regions, different ground</Text>
                </Panel.Body>
              </Panel>
            </div>
          </Surface>

          <Surface pad="lg" class="mt-4">
            <Text variant="title">Surface</Text>
            <Text variant="detail" class="mt-1 mb-5">
              The panel every card, tile and well is built from.
            </Text>
            <div className="grid gap-3 sm:grid-cols-3">
              {(['outlined', 'sunken', 'raised'] as const).map((tone) => (
                <Surface key={tone} tone={tone} pad="md">
                  <Text variant="mono">tone="{tone}"</Text>
                </Surface>
              ))}
            </div>
          </Surface>
        </Section>

        {/* --------------------------------------------------------- theming */}
        <Section
          id="theming"
          number="04"
          title="Theming"
          lede="The components never name a colour. They name a token, and a wrapper decides what that token means."
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button
              tone={themed ? 'ghost' : 'active'}
              onClick={() => setThemed(false)}
            >
              portfolio
            </Button>
            <Button
              tone={themed ? 'active' : 'ghost'}
              onClick={() => setThemed(true)}
            >
              apollo
            </Button>
            <Text variant="mono">
              {themed ? '.theme-apollo' : ':root'} — same markup, rebound tokens
            </Text>
          </div>

          <div className={themed ? 'theme-apollo' : undefined}>
            <Surface tone="sunken" pad="lg" class="mt-6">
              <div className="flex flex-wrap items-center gap-2">
                <Button tone="solid">solid</Button>
                <Button>ghost</Button>
                <Button tone="active">active</Button>
                <Chip tone="accent">accent</Chip>
                <IconButton label="Example" tone="outlined">
                  ›
                </IconButton>
              </div>
              <Text variant="body" class="mt-5">
                Nothing above re-rendered with different classes. The{' '}
                <code className="font-mono text-product-chip text-ink">
                  --color-*
                </code>{' '}
                variables underneath them changed.
              </Text>
            </Surface>
          </div>

          <CodeExcerpt
            file="src/index.css"
            note="theme scope"
            source={`.theme-apollo {
  --color-ink: #0e0d0c;
  --color-muted: #7a7977;
  --color-line: #dddcda;
  --color-accent: #6b4fff;
}`}
          />
        </Section>
        {/* --------------------------------------------------------- quality */}
        <Section
          id="quality"
          number="05"
          title="Quality"
          lede="Contract tests for the promises components make, and a snapshot that fails the build when styling moves without anyone deciding it should."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Surface tone="sunken" pad="lg">
              <Text variant="eyebrow">accessibility contracts</Text>
              <ul className="mt-4 flex flex-col gap-2.5">
                {[
                  'IconButton always has an accessible name',
                  'Button defaults to type="button"',
                  'Every interactive recipe carries a focus ring',
                  'Disabled is both visual and functional',
                  'External links get rel="noreferrer"',
                  'No component hardcodes a hex value',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-accent" />
                    <Text variant="detail">{item}</Text>
                  </li>
                ))}
              </ul>
            </Surface>

            <Surface tone="sunken" pad="lg">
              <Text variant="eyebrow">visual change detection</Text>
              <Text variant="detail" class="mt-4">
                49 variants, each snapshotted as its rendered class string. For
                a token-driven system that is most of what pixel regression
                buys: if the classes did not change, the render cannot have.
                Honest limit — it would not catch a token value changing
                underneath.
              </Text>
              <div className="mt-5 flex flex-wrap gap-2">
                <Chip tone="filled">node --test</Chip>
                <Chip tone="filled">no jest</Chip>
                <Chip tone="filled">no jsdom</Chip>
                <Chip tone="accent">0 new deps</Chip>
              </div>
            </Surface>
          </div>

          <CodeExcerpt
            file="scripts/ds-contract.tsx"
            note="one of thirteen"
            source={`test('every interactive recipe carries a visible focus ring', () => {
  for (const [name, recipe] of [['button', button], ['link', link]]) {
    assert.ok(
      recipe().includes('focus-visible:'),
      \`\${name} must style :focus-visible — keyboard users need to see focus\`,
    );
  }
});`}
          />
        </Section>

        {/* ----------------------------------------------------- measurement */}
        <Section
          id="measurement"
          number="06"
          title="Measurement"
          lede="A system you cannot measure is a folder. npm run ds:audit reports adoption and duplication over the source — no browser, no dependencies."
        >
          <Surface tone="sunken" pad="lg">
            <pre className="overflow-x-auto font-mono text-[11.5px] leading-[1.8] text-ink">
{`Design system audit
────────────────────────────────────────────────────
Files scanned        39
DS component uses    19
Hand-rolled controls 3
Adoption rate        86.4%  (floor 80.0%)
Duplicated UI        13 class strings repeated

Repeated class strings (candidates for a recipe):
  3x  mt-6 inline-flex items-center gap-1 rounded-full …`}
            </pre>
          </Surface>
          <Text variant="body" class="mt-6 max-w-2xl">
            The audit found the gaps that built the last two components. Text
            links were hand-styled in five files, so <code className="font-mono text-[13px] text-ink">Link</code>{' '}
            exists; the skip-link pairing was copied by hand, so{' '}
            <code className="font-mono text-[13px] text-ink">SkipLink</code>{' '}
            does. Adoption went 68% → 86.4% in the same pass.{' '}
            <code className="font-mono text-[13px] text-ink">--strict</code>{' '}
            exits non-zero below the floor, so it can gate CI.
          </Text>
        </Section>

        {/* ----------------------------------------------------- governance */}
        <Section
          id="governance"
          number="07"
          title="Governance"
          lede="Written down in src/ds/README.md, because a convention nobody can cite is a preference."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { t: 'Contribution', d: 'Three uses earns a recipe; twice is a coincidence. Recipe before component. Extend an axis before adding one. Adopt it in the same PR.' },
              { t: 'Versioning', d: 'No package version — it ships inside the app. The snapshot is the contract instead, and every change to it must be explained.' },
              { t: 'Migrations', d: 'Audit the file, replace the controls, re-run the audit, confirm the snapshot. Adoption is measured, not announced.' },
            ].map((item) => (
              <Surface key={item.t} tone="sunken" pad="lg">
                <Text variant="title">{item.t}</Text>
                <Text variant="detail" class="mt-2">{item.d}</Text>
              </Surface>
            ))}
          </div>
          <Text variant="body" class="mt-6 max-w-2xl">
            The README also carries the known gaps — no Storybook, no pixel
            regression, no tailwind-merge — each with the reasoning. A system
            that hides its edges gets discovered the hard way.
          </Text>
        </Section>
      </main>

      <footer className="border-t border-line px-6 py-10 sm:px-8">
        <div className="shell flex flex-wrap items-center justify-between gap-4">
          <Text variant="detail">
            Built with Tailwind v4 tokens, no component dependencies.
          </Text>
          <ButtonLink
            href="/work/apollo"
            onClick={(event) => {
              if (!isPlainClick(event)) return;
              event.preventDefault();
              onNavigate('/work/apollo');
            }}
          >
            see it in use →
          </ButtonLink>
        </div>
      </footer>
    </div>
  );
}
