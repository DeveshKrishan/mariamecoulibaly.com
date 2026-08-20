import type { Project } from '@mariame/shared';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * Project card matching the live site’s blog-basic-grid item:
 * 1:1 thumbnail, title below, no author/date meta (primary/secondary meta
 * are set to “none” on the reference site), subtle fade-in on scroll.
 */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <Link to={`/projects/${project.slug}`} className="group block">
        <div className="relative aspect-square overflow-hidden bg-neutral-100">
          {project.thumbnailUrl ? (
            <img
              src={project.thumbnailUrl}
              alt={project.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : null}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/10"
          />
        </div>
        {/* 20px image→title spacing from tweak-blog-basic-grid-image-spacing */}
        <h2 className="font-heading mt-5 text-lg font-medium tracking-tight md:text-xl">
          {project.title}
        </h2>
      </Link>
    </motion.div>
  );
}
