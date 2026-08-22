import type { Project } from '../types/content';
import { describe, expect, it } from 'vitest';
import { findProjectNeighbors } from './projectNeighbors';

function project(partial: Partial<Project> & Pick<Project, 'slug' | 'sortOrder'>): Project {
  return {
    id: partial.slug,
    title: partial.slug,
    publishedAt: '2026-01-01',
    client: '',
    role: '',
    summary: '',
    body: [],
    thumbnailUrl: '',
    status: 'published',
    ...partial,
  };
}

describe('findProjectNeighbors', () => {
  const projects = [
    project({ slug: 'newest', sortOrder: 0 }),
    project({ slug: 'middle', sortOrder: 1 }),
    project({ slug: 'oldest', sortOrder: 2 }),
  ];

  it('returns older as next and newer as previous', () => {
    expect(findProjectNeighbors(projects, 'middle')).toEqual({
      previous: projects[0],
      next: projects[2],
    });
  });

  it('returns only next for the newest project', () => {
    expect(findProjectNeighbors(projects, 'newest')).toEqual({
      previous: null,
      next: projects[1],
    });
  });

  it('returns only previous for the oldest project', () => {
    expect(findProjectNeighbors(projects, 'oldest')).toEqual({
      previous: projects[1],
      next: null,
    });
  });

  it('returns null neighbors for an unknown slug', () => {
    expect(findProjectNeighbors(projects, 'missing')).toEqual({
      previous: null,
      next: null,
    });
  });
});
