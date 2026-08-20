import type { AboutPage as AboutPageData } from '@mariame/shared';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Seo } from '../components/seo/Seo';
import { getAboutPage } from '../lib/api';
import { absoluteUrl } from '../lib/site';
import { stripHtml, truncate } from '../lib/text';

// Reproduces the reference site's Squarespace "fluid engine" grid for the
// About Me page: a 24-column content grid (see docs/PLAN.md Appendix B /
// the live site's compiled section CSS) split into two stacked rows —
// headline+links on a dark full-bleed hero, then photo+bio on white.
// Column start/span values below are taken directly from the reference
// site's `grid-area` rules, shifted by -1 to drop its leading gutter column.
const gridCols = 'md:grid-cols-[repeat(24,minmax(0,1fr))]';

export function AboutPage() {
  const [page, setPage] = useState<AboutPageData | null>(null);

  useEffect(() => {
    getAboutPage().then(setPage).catch(console.error);
  }, []);

  if (!page) return <p className="px-[5vw]">Loading…</p>;

  const description = page.headline || truncate(stripHtml(page.bio), 160);

  return (
    <div>
      <Seo
        title="About Me"
        description={description}
        image={page.photoUrl}
        url={absoluteUrl('/about-me')}
      />

      {/* Dark hero — matches live site section theme "dark" / darkAccent */}
      <section className="bg-dark-accent text-white">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`mx-auto grid max-w-[1280px] grid-cols-1 items-start gap-x-4 gap-y-8 px-[5vw] py-10 md:py-14 ${gridCols}`}
        >
          <div className="md:col-span-14 md:col-start-1">
            <h1 className="font-heading text-4xl leading-[1.05] font-medium sm:text-5xl md:text-6xl">
              {page.title}
            </h1>
            <h3 className="font-heading mt-3 max-w-xl text-lg font-normal text-white/85 sm:text-xl md:text-2xl">
              {page.headline}
            </h3>
          </div>

          <div className="md:col-span-5 md:col-start-20 md:justify-self-end">
            <p className="text-sm font-bold tracking-wide">My Links</p>
            <div className="mt-2 flex flex-col gap-1 text-xs tracking-wide">
              {page.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit underline underline-offset-2 hover:opacity-70"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Photo + bio — white section */}
      <section className="bg-white text-ink">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`mx-auto grid max-w-[1280px] grid-cols-1 items-start gap-x-4 gap-y-8 px-[5vw] py-10 pb-24 md:py-14 ${gridCols}`}
        >
          {page.photoUrl ? (
            <div className="md:col-span-8 md:col-start-3">
              <img
                src={page.photoUrl}
                alt="Mariam Coulibaly"
                className="aspect-[1954/2800] w-full object-cover"
              />
            </div>
          ) : null}

          <div className="md:col-span-11 md:col-start-14 md:-mt-[1.5vw]">
            <h2 className="font-heading text-2xl font-medium md:text-3xl">
              {page.greeting}
            </h2>
            <p
              className="mt-4 leading-relaxed [&_em]:italic"
              dangerouslySetInnerHTML={{ __html: page.bio }}
            />
          </div>
        </motion.div>
      </section>
    </div>
  );
}
