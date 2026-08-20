import type { Project } from '@mariame/shared';
import { formatDetailDate } from '../../lib/dates';
import { ProjectBody } from './ProjectBody';
import { ProjectPagination } from './ProjectPagination';

function MetaLine({ children }: { children: string }) {
  if (!children || children === 'Coming soon.') return null;
  return <p className="mb-1">{children}</p>;
}

/**
 * Full project detail section: title, date, client/role/summary meta,
 * rich-text body (paragraphs, images, embeds, links), and prev/next nav.
 * Layout mirrors docs/PLAN.md §5.2 ProjectDetail and the live reference site.
 */
export function ProjectDetail({
  project,
  previous,
  next,
}: {
  project: Project;
  previous: Project | null;
  next: Project | null;
}) {
  return (
    <article className="max-w-3xl">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl mb-3">{project.title}</h1>
        <time
          className="block text-sm opacity-70 mb-6"
          dateTime={project.publishedAt}
        >
          {formatDetailDate(project.publishedAt)}
        </time>
        <div className="text-sm space-y-0">
          <MetaLine>{project.client}</MetaLine>
          <MetaLine>{project.role}</MetaLine>
          <MetaLine>{project.summary}</MetaLine>
        </div>
      </header>

      <ProjectBody body={project.body} />

      <ProjectPagination previous={previous} next={next} />
    </article>
  );
}
