/**
 * Design-system contract tests.
 *
 * Compiled by Vite, run on Node's built-in test runner — no Jest, no Vitest,
 * no jsdom. Two jobs:
 *
 *   1. Accessibility and API contracts that every component must honour.
 *   2. A snapshot of every recipe's output, so an unintended style change
 *      fails the build. It is not pixel regression, but for a token-driven
 *      system the class string IS the appearance: if it did not change, the
 *      render cannot have.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/* Paths resolve from the project root, not from import.meta.url: this file is
   compiled into .ds-test/ before it runs, so a relative URL would point at the
   build output and the snapshot would silently rewrite itself every time. */
const ROOT = process.cwd();
import {
  Button, ButtonLink, Chip, IconButton, Link, Panel, Surface, Text,
  button, chip, iconButton, link, surface, text,
} from '../src/ds';

/* ----------------------------------------------- accessibility contracts */

test('IconButton always has an accessible name', () => {
  const html = renderToStaticMarkup(<IconButton label="Close panel">×</IconButton>);
  assert.match(html, /aria-label="Close panel"/);
  assert.match(html, /title="Close panel"/);
});

test('Button defaults to type="button" so it never submits a form by accident', () => {
  assert.match(renderToStaticMarkup(<Button>Go</Button>), /type="button"/);
});

test('every interactive recipe carries a visible focus ring', () => {
  for (const [name, recipe] of [
    ['button', button], ['iconButton', iconButton], ['link', link],
  ] as const) {
    assert.ok(
      recipe().includes('focus-visible:'),
      `${name} must style :focus-visible — keyboard users need to see focus`,
    );
  }
});

test('disabled controls are visually and functionally disabled', () => {
  const html = renderToStaticMarkup(<Button disabled>Go</Button>);
  assert.match(html, /disabled/);
  assert.ok(button().includes('disabled:'), 'recipe must style the disabled state');
});

test('external Links get rel="noreferrer"', () => {
  const html = renderToStaticMarkup(
    <Link href="https://example.com" target="_blank">Out</Link>,
  );
  assert.match(html, /rel="noreferrer"/);
});

/* ------------------------------------------------------- API contracts */

test('recipes are pure: same input, same output', () => {
  assert.equal(button({ tone: 'solid' }), button({ tone: 'solid' }));
});

test('the class escape hatch always lands last', () => {
  assert.ok(button({ class: 'mt-4' }).endsWith('mt-4'));
  assert.ok(surface({ class: 'col-span-2' }).endsWith('col-span-2'));
});

test('defaults apply when no variant is passed', () => {
  assert.equal(button(), button({ tone: 'ghost', size: 'md' }));
});

test('components name tokens, never raw colour values', () => {
  const sources = [
    'src/ds/recipes.ts', 'src/ds/Button.tsx', 'src/ds/Chip.tsx',
    'src/ds/Surface.tsx', 'src/ds/Text.tsx', 'src/ds/IconButton.tsx',
  ];
  for (const file of sources) {
    const src = readFileSync(join(ROOT, file), 'utf8');
    const hex = src.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
    assert.deepEqual(
      hex, [],
      `${file} hardcodes ${hex.join(', ')} — use a token so theming works`,
    );
  }
});

test('Panel composes into header, body and footer', () => {
  const html = renderToStaticMarkup(
    <Panel>
      <Panel.Header title="Title" note="Note" />
      <Panel.Body>Body</Panel.Body>
      <Panel.Footer>Footer</Panel.Footer>
    </Panel>,
  );
  for (const part of ['Title', 'Note', 'Body', 'Footer']) {
    assert.ok(html.includes(part), `Panel should render ${part}`);
  }
});

/* ------------------------------------------------- visual-change snapshot */

const SNAPSHOT = join(ROOT, 'scripts', 'ds-snapshot.json');

function everyVariant() {
  const out: Record<string, string> = {};
  for (const tone of ['ghost', 'solid', 'active', 'quiet'] as const)
    for (const size of ['sm', 'md', 'lg'] as const)
      out[`button/${tone}/${size}`] = button({ tone, size });
  for (const tone of ['quiet', 'outlined', 'active'] as const)
    for (const size of ['sm', 'md'] as const)
      out[`iconButton/${tone}/${size}`] = iconButton({ tone, size });
  for (const tone of ['neutral', 'accent', 'filled'] as const)
    for (const size of ['sm', 'md'] as const)
      out[`chip/${tone}/${size}`] = chip({ tone, size });
  for (const tone of ['outlined', 'sunken', 'raised', 'bare'] as const)
    for (const pad of ['none', 'sm', 'md', 'lg'] as const)
      out[`surface/${tone}/${pad}`] = surface({ tone, pad });
  for (const variant of ['eyebrow', 'lede', 'title', 'body', 'detail', 'mono'] as const)
    out[`text/${variant}`] = text({ variant });
  for (const tone of ['nav', 'inline', 'subtle'] as const)
    out[`link/${tone}`] = link({ tone });
  return out;
}

test('no unintended visual change', () => {
  const current = everyVariant();
  if (process.env.UPDATE_SNAPSHOT || !existsSync(SNAPSHOT)) {
    writeFileSync(SNAPSHOT, JSON.stringify(current, null, 2) + '\n');
    console.log(`  snapshot written: ${Object.keys(current).length} variants`);
    return;
  }
  const saved = JSON.parse(readFileSync(SNAPSHOT, 'utf8')) as Record<string, string>;
  const changed = Object.keys(current).filter((k) => saved[k] !== current[k]);
  const added = Object.keys(current).filter((k) => !(k in saved));
  const removed = Object.keys(saved).filter((k) => !(k in current));
  assert.deepEqual(
    { changed, added, removed },
    { changed: [], added: [], removed: [] },
    'Variant styling changed. Intentional? run: npm run ds:test:update',
  );
});

test('snapshot covers every variant of every recipe', () => {
  assert.ok(Object.keys(everyVariant()).length >= 40);
});

/* ---------------------------------------------------------- smoke render */

test('every component renders', () => {
  const html = renderToStaticMarkup(
    <Surface>
      <Text variant="lede">Lede</Text>
      <Button tone="solid">Go</Button>
      <ButtonLink href="#x">Link</ButtonLink>
      <Chip tone="accent">Chip</Chip>
    </Surface>,
  );
  assert.ok(html.length > 100);
});
