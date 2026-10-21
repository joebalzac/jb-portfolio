import { cx, type ClassValue } from './cx';

/**
 * Class variants — the whole variant engine, in about thirty lines.
 *
 * A recipe is a base string plus named axes. Calling it with a selection
 * returns the composed class string, and TypeScript infers the allowed values
 * from the recipe itself, so `tone="danger"` fails at the type level when the
 * recipe has no danger tone.
 *
 *   const chip = cv({
 *     base: 'inline-flex rounded-full',
 *     variants: { tone: { neutral: '…', accent: '…' }, size: { sm: '…' } },
 *     defaults: { tone: 'neutral', size: 'sm' },
 *   });
 *   chip({ tone: 'accent' })
 */
type VariantMap = Record<string, Record<string, string>>;

export type VariantProps<V extends VariantMap> = {
  [K in keyof V]?: keyof V[K] & string;
};

type Compound<V extends VariantMap> = VariantProps<V> & { class: string };

export function cv<V extends VariantMap>(config: {
  base?: string;
  variants: V;
  defaults?: VariantProps<V>;
  /** Styles that only apply when several axes line up at once. */
  compound?: Compound<V>[];
}) {
  const { base, variants, defaults, compound } = config;

  return (props?: VariantProps<V> & { class?: ClassValue }) => {
    const chosen = {} as Record<string, string | undefined>;
    const parts: ClassValue[] = [base];

    for (const axis in variants) {
      const value = (props?.[axis] ?? defaults?.[axis]) as string | undefined;
      chosen[axis] = value;
      if (value) parts.push(variants[axis][value]);
    }

    for (const rule of compound ?? []) {
      const matches = Object.entries(rule).every(
        ([key, value]) => key === 'class' || chosen[key] === value,
      );
      if (matches) parts.push(rule.class);
    }

    parts.push(props?.class);
    return cx(...parts);
  };
}
