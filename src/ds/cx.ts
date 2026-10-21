/**
 * Joins class values, dropping anything falsy.
 *
 * Deliberately not tailwind-merge: that package exists to resolve conflicting
 * utilities at runtime, and it costs ~6kB to do it. This system avoids the
 * conflict instead — recipes own their visual properties, and the `class`
 * escape hatch is for layout (margin, width, grid placement), not for
 * restyling. Documented rather than defended: if a caller passes `px-2` to a
 * recipe that already sets `px-4`, both land and the cascade decides.
 */
export type ClassValue = string | false | null | undefined;

export function cx(...values: ClassValue[]) {
  return values.filter(Boolean).join(' ');
}
