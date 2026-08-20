import { useLayoutEffect } from 'react';
import { absoluteUrl } from '../../lib/site';

const SITE_NAME = 'Mariam Coulibaly';

/**
 * Removes the static `index.html` SEO tags (see the `data-seo-fallback`
 * comment there) the first time a real `<Seo>` mounts, so React's own
 * title/meta tags don't end up duplicated alongside the static fallback.
 */
function useRemoveStaticFallbackTags() {
  useLayoutEffect(() => {
    document
      .querySelectorAll('[data-seo-fallback]')
      .forEach((el) => el.remove());
  }, []);
}

export interface SeoProps {
  title: string;
  description: string;
  /** Relative or absolute image URL; resolved to an absolute URL for OG/Twitter crawlers. */
  image?: string;
  /** Canonical URL for this page; also used for og:url when provided. */
  url?: string;
  type?: 'website' | 'article';
}

/**
 * Renders per-page `<title>`, description, Open Graph, and Twitter Card tags.
 * React 19 hoists title/meta/link tags rendered anywhere in the tree into
 * `<head>` and dedupes by tag type, so this can be dropped into any page
 * component without a provider.
 */
export function Seo({ title, description, image, url, type = 'website' }: SeoProps) {
  useRemoveStaticFallbackTags();

  const pageTitle = title === SITE_NAME ? title : `${title} — ${SITE_NAME}`;
  const resolvedImage = image ? absoluteUrl(image) : undefined;

  return (
    <>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      {url ? <meta property="og:url" content={url} /> : null}
      {resolvedImage ? <meta property="og:image" content={resolvedImage} /> : null}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      {resolvedImage ? <meta name="twitter:image" content={resolvedImage} /> : null}
      {url ? <link rel="canonical" href={url} /> : null}
    </>
  );
}
