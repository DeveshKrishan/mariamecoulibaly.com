import type { Project } from '../types/content';

/**
 * Neighbors in portfolio sort order (0 = newest).
 * Matches the reference site's item pagination: "Previous" is newer
 * (lower sortOrder), "Next" is older (higher sortOrder).
 */
export function findProjectNeighbors(
  projects: Project[],
  slug: string,
): { previous: Project | null; next: Project | null } {
  const sorted = [...projects].sort((a, b) => a.sortOrder - b.sortOrder);
  const index = sorted.findIndex((project) => project.slug === slug);
  if (index < 0) return { previous: null, next: null };

  return {
    previous: index > 0 ? sorted[index - 1]! : null,
    next: index < sorted.length - 1 ? sorted[index + 1]! : null,
  };
}
