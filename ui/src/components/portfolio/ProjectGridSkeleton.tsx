import { SkeletonBlock } from '../skeleton/SkeletonBlock';

/** Matches ProjectGrid / ProjectCard spacing while project data loads. */
const GRID_CLASS =
  'grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3';

function SkeletonCard() {
  return (
    <div aria-hidden="true">
      <SkeletonBlock className="aspect-square" />
      {/* 20px image→title spacing from tweak-blog-basic-grid-image-spacing */}
      <SkeletonBlock className="mt-5 h-6 w-3/4" />
    </div>
  );
}

export function ProjectGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className={GRID_CLASS}
      role="status"
      aria-busy="true"
      aria-label="Loading projects"
    >
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
      <span className="sr-only">Loading projects</span>
    </div>
  );
}
