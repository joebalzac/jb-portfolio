/**
 * Token reference for the documentation page.
 *
 * These mirror the `@theme` block in index.css rather than generating from it —
 * Tailwind v4 keeps tokens in CSS, and parsing them at runtime to render a
 * swatch would be more machinery than the page is worth. The swatches render
 * from the live CSS variable, so a value that drifts shows up visually here.
 */
export const COLOR_TOKENS = [
  { name: 'bg', use: 'Page background' },
  { name: 'ink', use: 'Primary text' },
  { name: 'muted', use: 'Secondary text' },
  { name: 'faint', use: 'Tertiary text, metadata' },
  { name: 'line', use: 'Borders and rules' },
  { name: 'card', use: 'Recessed surfaces' },
  { name: 'accent', use: 'The one highlight colour' },
] as const;

export const TYPE_TOKENS = [
  { variant: 'eyebrow', use: 'Label above a block' },
  { variant: 'lede', use: 'Section opener' },
  { variant: 'title', use: 'Component or card heading' },
  { variant: 'body', use: 'Running copy' },
  { variant: 'detail', use: 'Supporting note' },
  { variant: 'mono', use: 'Code, counts, metadata' },
] as const;
