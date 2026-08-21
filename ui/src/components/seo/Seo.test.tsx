import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Seo } from './Seo';

function metaContent(property: string) {
  return document.head
    .querySelector(`meta[property="${property}"], meta[name="${property}"]`)
    ?.getAttribute('content');
}

describe('Seo', () => {
  it('sets the document title and description', () => {
    render(
      <Seo title="Resident Home" description="Organized footage." />,
    );

    expect(document.title).toBe('Resident Home — Mariam Coulibaly');
    expect(metaContent('description')).toBe('Organized footage.');
  });

  it('does not suffix the title when it already is the site name', () => {
    render(<Seo title="Mariam Coulibaly" description="Portfolio." />);

    expect(document.title).toBe('Mariam Coulibaly');
  });

  it('renders Open Graph and Twitter tags, resolving the image to an absolute URL', () => {
    const siteUrl = (
      import.meta.env.VITE_SITE_URL ??
      'https://mariamecoulibaly-com-ui.vercel.app'
    ).replace(/\/+$/, '');
    const pageUrl = `${siteUrl}/about-me`;

    render(
      <Seo
        title="About Me"
        description="Bio copy."
        image="/images/about.jpg"
        url={pageUrl}
        type="website"
      />,
    );

    expect(metaContent('og:type')).toBe('website');
    expect(metaContent('og:title')).toBe('About Me — Mariam Coulibaly');
    expect(metaContent('og:description')).toBe('Bio copy.');
    expect(metaContent('og:url')).toBe(pageUrl);
    expect(metaContent('og:image')).toBe(`${siteUrl}/images/about.jpg`);
    expect(metaContent('twitter:card')).toBe('summary_large_image');
    expect(metaContent('twitter:image')).toBe(`${siteUrl}/images/about.jpg`);
    expect(
      document.head.querySelector('link[rel="canonical"]'),
    ).toHaveAttribute('href', pageUrl);
  });

  it('omits og:image, og:url, and the canonical link when not provided', () => {
    render(<Seo title="Mariam Coulibaly" description="Portfolio." />);

    expect(metaContent('og:image')).toBeUndefined();
    expect(metaContent('og:url')).toBeUndefined();
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
  });

  it('removes static index.html fallback tags once a real Seo mounts', () => {
    const staticTitle = document.createElement('title');
    staticTitle.setAttribute('data-seo-fallback', '');
    staticTitle.textContent = 'Mariam Coulibaly';
    const staticMeta = document.createElement('meta');
    staticMeta.setAttribute('data-seo-fallback', '');
    staticMeta.setAttribute('name', 'description');
    staticMeta.setAttribute('content', 'Static fallback description.');
    document.head.append(staticTitle, staticMeta);

    render(<Seo title="Resident Home" description="Organized footage." />);

    expect(document.head.querySelectorAll('[data-seo-fallback]')).toHaveLength(0);
    expect(document.title).toBe('Resident Home — Mariam Coulibaly');
  });
});
