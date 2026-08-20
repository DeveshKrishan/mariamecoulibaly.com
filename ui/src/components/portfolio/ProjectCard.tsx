import type { Project } from '@mariame/shared';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { formatShortDate } from '../../lib/dates';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <Link to={`/projects/${project.slug}`} className="block group">
        <div className="aspect-[4/3] bg-neutral-100 overflow-hidden">
          {project.thumbnailUrl ? (
            <img
              src={project.thumbnailUrl}
              alt={project.title}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="font-heading">{project.title}</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity">
            {formatShortDate(project.publishedAt)}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
