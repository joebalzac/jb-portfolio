# Design system

Three layers. Tokens define values, recipes compose them into variants,
components wrap recipes with behaviour and accessibility.

```
src/index.css   @theme      colour · type · spacing · radius · elevation
src/ds/cv.ts    recipes     variant engine, ~55 lines, no dependency
src/ds/*.tsx    components  Button, Link, IconButton, Chip, Surface, Panel, Text
```

## Why it exists

The same ghost button existed in eight places with four different padding
values. Nobody decided that; it drifted. `npm run ds:audit` is the standing
check that it does not happen again.

## Scope

**In scope** — everything in the portfolio and case-study layer.

**Out of scope** — `src/components/apollo/`. That is a deliberate imitation of
someone else's product UI, with its own `product-*` and `app-*` tokens. Mixing
it into this system would mean one of the two had to compromise. The audit
excludes it for that reason, not because it was forgotten.

## API conventions

Every component follows the same shape. If a new one cannot, that is a signal
the component is wrong, not that the convention is.

| Prop | Means | Example |
| --- | --- | --- |
| `tone` | Intent, never colour | `tone="solid"` |
| `size` | Scale | `size="sm"` |
| `class` | **Layout only** — margin, width, grid placement | `class="mt-4"` |

- `class`, not `className`. The rename is the reminder that it is not a
  styling hole.
- Recipes live in `recipes.ts`, apart from components, so a bare class string
  is available where a component API does not fit, and each component module
  exports only components (React Fast Refresh needs that).
- Components name tokens, never raw values. A hex code in `src/ds/` fails
  `npm run ds:test`.

## Contributing

1. **Check the audit first.** `npm run ds:audit` lists repeated class strings.
   A pattern used three or more times earns a recipe; twice is a coincidence.
2. **Recipe before component.** Add to `recipes.ts`, then wrap it only if it
   needs behaviour, state or an accessibility contract.
3. **Extend an axis before adding one.** A fourth `tone` is cheaper than a new
   `emphasis` prop. Two axes is the ceiling before a component wants splitting.
4. **Add a contract test** for anything with an accessibility obligation —
   an accessible name, a focus ring, a disabled state.
5. **Update the snapshot deliberately.** `npm run ds:test:update`, and say in
   the commit why the appearance changed.
6. **Adopt it in the same PR.** A component with no call sites is speculation.

## Versioning

The system ships inside the app, so there is no package version. The snapshot
is the contract instead: `scripts/ds-snapshot.json` holds the rendered class
string of all 49 variants, and any change to it must be intentional and
explained.

If this were extracted to a package, the same snapshot becomes the semver
signal — a changed variant is a minor, a removed tone or renamed prop is a
major.

## Migrations

Adoption is measured, not announced. To move a surface onto the system:

1. `npm run ds:audit` — find the hand-rolled controls in that file
2. Replace them, keeping `class` to layout only
3. Re-run the audit; adoption should rise and duplicates should fall
4. `npm run ds:test` — confirm nothing else shifted

The audit has a floor of 80%. `npm run ds:audit -- --strict` exits non-zero
below it, so it can gate CI once adoption is somewhere worth defending.

## Commands

| | |
| --- | --- |
| `npm run ds:audit` | Adoption rate, hand-rolled controls, duplicated UI |
| `npm run ds:audit -- --strict` | Same, exits 1 below the floor |
| `npm run ds:test` | Accessibility contracts + variant snapshot |
| `npm run ds:test:update` | Accept a deliberate visual change |

## Known gaps

Honest list, so nobody discovers these the hard way:

- **No Storybook.** `/design-system` is the living documentation and renders
  every variant. Storybook would add a second build system and ~300MB of dev
  dependencies to document seven components. Revisit if the set doubles.
- **No pixel regression.** The snapshot compares class strings, which for a
  token-driven system is most of the value — if the classes did not change,
  the render cannot have. It would not catch a token value changing underneath,
  which real visual regression would.
- **No `tailwind-merge`.** Conflicting utilities are not resolved; the
  convention that `class` is layout-only is what prevents the conflict.
