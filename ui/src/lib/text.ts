/** Stub copy used for content that hasn't been written yet (see project data). */
export const PLACEHOLDER_TEXT = 'Coming soon.';

/** True when `value` is non-empty and isn't the "Coming soon." placeholder. */
export function hasContent(value: string | undefined | null): value is string {
  return Boolean(value) && value !== PLACEHOLDER_TEXT;
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '');
}

export function truncate(text: string, maxLength: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}
