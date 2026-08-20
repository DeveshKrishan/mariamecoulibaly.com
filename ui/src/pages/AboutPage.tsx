import type { AboutPage as AboutPageData } from '@mariame/shared';
import { useEffect, useState } from 'react';
import { getAboutPage } from '../lib/api';

export function AboutPage() {
  const [page, setPage] = useState<AboutPageData | null>(null);

  useEffect(() => {
    getAboutPage().then(setPage).catch(console.error);
  }, []);

  if (!page) return <p>Loading…</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl mb-4">{page.headline}</h1>
      <p className="mb-8">{page.bio}</p>
      <h2 className="text-sm uppercase tracking-wide mb-2">My Links</h2>
      <ul>
        {page.links.map((link) => (
          <li key={link.url}>
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="underline">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
