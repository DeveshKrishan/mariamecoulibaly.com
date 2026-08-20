import type { Project } from '@mariame/shared';
import { ProjectCard } from './ProjectCard';

/**
 * Homepage project index — 3-column inset grid matching the reference
 * site’s `blog-basic-grid` (tweak-blog-basic-grid-columns: 3).
 */
export function ProjectGrid({ projects }: { projects: Project[] }) {
  const sorted = [...projects].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
