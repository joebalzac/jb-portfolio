#!/usr/bin/env node
/**
 * Design-system audit.
 *
 * Measures the two things that actually tell you whether a system is working:
 * how much of the UI is built from it, and how much duplicated UI is left
 * outside it. Runs over the source, needs no browser and no dependencies.
 *
 *   npm run ds:audit            report
 *   npm run ds:audit -- --strict  exit 1 if adoption drops below the floor
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'src');

/** The system's own source is excluded — it cannot adopt itself. */
const EXCLUDE = [join('src', 'ds'), join('src', 'design-system')];

/** Product chrome is a deliberately separate skin; see ds/README.md. */
const OUT_OF_SCOPE = [join('src', 'components', 'apollo')];

const DS_COMPONENTS = [
  'Button', 'ButtonLink', 'IconButton', 'Chip', 'Surface', 'Panel', 'Text', 'CodeExcerpt',
];

/** A hand-rolled control: an interactive element carrying its own styling. */
const HANDROLLED = /<(button|a)\b[^>]*className=["'`{]/gs;
const ADOPTION_FLOOR = 0.8;

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (/\.tsx$/.test(full)) files.push(full);
  }
  return files;
}

const files = walk(SRC).filter((f) => {
  const rel = relative(ROOT, f);
  return !EXCLUDE.some((e) => rel.startsWith(e));
});

let dsUses = 0;
let handRolled = 0;
const offenders = [];
const classStrings = new Map();

for (const file of files) {
  const rel = relative(ROOT, file);
  const src = readFileSync(file, 'utf8');
  const outOfScope = OUT_OF_SCOPE.some((o) => rel.startsWith(o));

  for (const name of DS_COMPONENTS) {
    dsUses += (src.match(new RegExp(`<${name}[\\s/>]`, 'g')) || []).length;
  }

  const raw = (src.match(HANDROLLED) || []).length;
  if (!outOfScope && raw > 0) {
    handRolled += raw;
    offenders.push({ file: rel, count: raw });
  }

  /* Duplicated UI: the same long class string written more than once. */
  for (const m of src.matchAll(/className=["'`]([^"'`{]{40,})["'`]/g)) {
    const key = m[1].replace(/\s+/g, ' ').trim();
    classStrings.set(key, (classStrings.get(key) ?? 0) + 1);
  }
}

const total = dsUses + handRolled;
const adoption = total === 0 ? 1 : dsUses / total;
const duplicated = [...classStrings.entries()].filter(([, n]) => n > 1);

const pct = (n) => `${(n * 100).toFixed(1)}%`;
console.log('\nDesign system audit');
console.log('─'.repeat(52));
console.log(`Files scanned        ${files.length}`);
console.log(`DS component uses    ${dsUses}`);
console.log(`Hand-rolled controls ${handRolled}`);
console.log(`Adoption rate        ${pct(adoption)}  (floor ${pct(ADOPTION_FLOOR)})`);
console.log(`Duplicated UI        ${duplicated.length} class strings repeated`);

if (offenders.length) {
  console.log('\nControls not yet on the system:');
  for (const o of offenders.sort((a, b) => b.count - a.count)) {
    console.log(`  ${String(o.count).padStart(3)}  ${o.file}`);
  }
}
if (duplicated.length) {
  console.log('\nRepeated class strings (candidates for a recipe):');
  for (const [key, n] of duplicated.sort((a, b) => b[1] - a[1]).slice(0, 5)) {
    console.log(`  ${n}x  ${key.slice(0, 68)}…`);
  }
}
console.log('');

if (process.argv.includes('--strict') && adoption < ADOPTION_FLOOR) {
  console.error(`Adoption ${pct(adoption)} is below the ${pct(ADOPTION_FLOOR)} floor.`);
  process.exit(1);
}
