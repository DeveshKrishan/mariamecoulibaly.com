import type { Project } from '../../types/content';
import { Link } from 'react-router-dom';
import { useEditMode } from '../../lib/editMode';

function PaginationLink({
  project,
  direction,
  editMode,
}: {
  project: Project;
  direction: 'previous' | 'next';
  editMode: boolean;
}) {
  const label = direction === 'previous' ? 'Previous' : 'Next';
  const alignment =
    direction === 'previous' ? 'items-start text-left' : 'items-end text-right';
  const to = `/projects/${project.slug}${editMode ? '?edit=1' : ''}`;

  return (
    <Link
      to={to}
      className={`group flex min-w-0 flex-col gap-1 ${alignment}`}
    >
      <span className="text-xs tracking-wide uppercase opacity-60">
        {label}
      </span>
      <span className="font-heading max-w-full truncate text-lg group-hover:underline">
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
  const { editMode } = useEditMode();
  if (!previous && !next) return null;

  return (
    <nav
      aria-label="Project pagination"
      className="mt-16 grid grid-cols-2 gap-6 border-t border-ink/10 pt-8"
    >
      <div>
        {previous ? (
          <PaginationLink
            project={previous}
            direction="previous"
            editMode={editMode}
          />
        ) : null}
      </div>
      <div className="flex justify-end">
        {next ? (
          <PaginationLink
            project={next}
            direction="next"
            editMode={editMode}
          />
        ) : null}
      </div>
    </nav>
  );
}
