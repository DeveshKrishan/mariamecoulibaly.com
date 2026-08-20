// Falls back to the `ui` Vercel project's production URL, mirroring how
// api.ts defaults VITE_API_URL to a known local/dev value.
const DEFAULT_SITE_URL = 'https://mariamecoulibaly-com-ui.vercel.app';

const SITE_URL = (import.meta.env.VITE_SITE_URL ?? DEFAULT_SITE_URL).replace(
  /\/+$/,
  '',
);

/** Resolves a path (or already-absolute URL) to an absolute URL under the site's base. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
