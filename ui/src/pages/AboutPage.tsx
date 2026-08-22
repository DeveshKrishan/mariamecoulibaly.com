import type { AboutPage as AboutPageData, AboutPageLink } from '../types/content';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { EditableField } from '../components/edit/EditableField';
import { Seo } from '../components/seo/Seo';
import { getAboutPage, updateAboutPage } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useEditMode } from '../lib/editMode';
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
  const { accessToken } = useAuth();
  const { editMode, runSave } = useEditMode();

  useEffect(() => {
    getAboutPage().then(setPage).catch(console.error);
  }, []);

  async function savePage(next: AboutPageData) {
    if (!accessToken || !page) return;
    const previous = page;
    setPage(next);
    try {
      const saved = await runSave(() => updateAboutPage(next, accessToken));
      setPage(saved);
    } catch {
      setPage(previous);
    }
  }

  function saveField<K extends keyof AboutPageData>(
    key: K,
    value: AboutPageData[K],
  ) {
    if (!page) return;
    void savePage({ ...page, [key]: value });
  }

  function saveLink(index: number, patch: Partial<AboutPageLink>) {
    if (!page) return;
    const links = page.links.map((link, i) =>
      i === index ? { ...link, ...patch } : link,
    );
    void savePage({ ...page, links });
  }

  // Bleed under the fixed header (PageLayout main pt-[4.5rem]) so the
  // transparent nav’s light text sits on the dark hero, not the white page.
  const heroBleed =
    'bg-dark-accent text-white -mt-[4.5rem] pt-[4.5rem]';

  if (!page) {
    return (
      <section className={`${heroBleed} px-[5vw] py-10`}>
        <p>Loading…</p>
      </section>
    );
  }

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
      <section className={heroBleed}>
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
            {editMode ? (
              <EditableField
                value={page.headline}
                editMode
                onSave={(v) => saveField('headline', v)}
                className="font-heading mt-3 max-w-xl text-lg font-normal text-white/85 sm:text-xl md:text-2xl"
                inputClassName="font-heading mt-3 max-w-xl w-full text-lg font-normal text-white sm:text-xl md:text-2xl px-1 outline-white/40"
                aria-label="Headline"
              />
            ) : (
              <h3 className="font-heading mt-3 max-w-xl text-lg font-normal text-white/85 sm:text-xl md:text-2xl">
                {page.headline}
              </h3>
            )}
          </div>

          <div className="md:col-span-5 md:col-start-20 md:justify-self-end">
            <p className="text-sm font-bold tracking-wide">My Links</p>
            <div className="mt-2 flex flex-col gap-1 text-xs tracking-wide">
              {page.links.map((link, index) =>
                editMode ? (
                  <div key={`${link.url}-${index}`} className="flex flex-col gap-1">
                    <EditableField
                      value={link.label}
                      editMode
                      onSave={(v) => saveLink(index, { label: v })}
                      inputClassName="px-1 outline-white/40 text-white"
                      aria-label={`Link ${index + 1} label`}
                    />
                    <EditableField
                      value={link.url}
                      editMode
                      onSave={(v) => saveLink(index, { url: v })}
                      inputClassName="px-1 outline-white/40 text-white/80"
                      aria-label={`Link ${index + 1} URL`}
                    />
                  </div>
                ) : (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit underline underline-offset-2 hover:opacity-70"
                  >
                    {link.label}
                  </a>
                ),
              )}
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
            {editMode ? (
              <>
                <EditableField
                  value={page.greeting}
                  editMode
                  onSave={(v) => saveField('greeting', v)}
                  className="font-heading text-2xl font-medium md:text-3xl"
                  inputClassName="font-heading text-2xl font-medium md:text-3xl px-1"
                  aria-label="Greeting"
                />
                <EditableField
                  value={page.bio}
                  editMode
                  multiline
                  asHtml
                  onSave={(v) => saveField('bio', v)}
                  className="mt-4 leading-relaxed [&_em]:italic"
                  inputClassName="mt-4 w-full leading-relaxed px-1 font-sans text-base"
                  aria-label="Bio"
                />
              </>
            ) : (
              <>
                <h2 className="font-heading text-2xl font-medium md:text-3xl">
                  {page.greeting}
                </h2>
                <p
                  className="mt-4 leading-relaxed [&_em]:italic"
                  dangerouslySetInnerHTML={{ __html: page.bio }}
                />
              </>
            )}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
