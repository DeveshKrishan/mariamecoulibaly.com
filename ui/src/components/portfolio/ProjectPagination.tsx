import type { Project } from '@mariame/shared';
import { Link } from 'react-router-dom';

function PaginationLink({
  project,
  direction,
}: {
  project: Project;
  direction: 'previous' | 'next';
}) {
  const label = direction === 'previous' ? 'Previous' : 'Next';
  const alignment =
    direction === 'previous' ? 'items-start text-left' : 'items-end text-right';

  return (
    <Link
      to={`/projects/${project.slug}`}
      className={`flex flex-col gap-1 ${alignment} group min-w-0`}
    >
      <span className="text-xs uppercase tracking-wide opacity-60">
        {label}
      </span>
      <span className="font-heading text-lg group-hover:underline truncate max-w-full">
        {project.title}
      </span>
    </Link>
  );
}

/**
 * Prev/next project links matching the reference site's item pagination.
 * "Previous" = newer (lower sortOrder), "Next" = older (higher sortOrder).
 */
export function ProjectPagination({
  previous,
  next,
}: {
  previous: Project | null;
  next: Project | null;
}) {
  if (!previous && !next) return null;

  return (
    <nav
      aria-label="Project pagination"
      className="mt-16 pt-8 border-t border-ink/10 grid grid-cols-2 gap-6"
    >
      <div>{previous ? <PaginationLink project={previous} direction="previous" /> : null}</div>
      <div className="flex justify-end">
        {next ? <PaginationLink project={next} direction="next" /> : null}
      </div>
    </nav>
  );
}
