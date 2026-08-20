import type { Project } from '@mariame/shared';
import { useEffect, useState } from 'react';
import { getProject, getProjects } from '../lib/api';
import { findProjectNeighbors } from '../lib/projectNeighbors';

export function useProject(slug: string | undefined) {
  const [prevSlug, setPrevSlug] = useState(slug);
  const [project, setProject] = useState<Project | null>(null);
  const [previous, setPrevious] = useState<Project | null>(null);
  const [next, setNext] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(slug));
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  if (slug !== prevSlug) {
    setPrevSlug(slug);
    if (slug) {
      setProject(null);
      setPrevious(null);
      setNext(null);
      setIsLoading(true);
      setNotFound(false);
      setError(null);
    }
  }

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    // Load the detail first; neighbor lookup is best-effort so a list
    // endpoint failure still shows the project page.
    getProject(slug)
      .then(async (detail) => {
        if (cancelled) return;
        setProject(detail);

        try {
          const projects = await getProjects();
          if (cancelled) return;
          const neighbors = findProjectNeighbors(projects, slug);
          setPrevious(neighbors.previous);
          setNext(neighbors.next);
        } catch {
          if (!cancelled) {
            setPrevious(null);
            setNext(null);
          }
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        // 404 from getProject surfaces as a thrown Error from the api client.
        if (/status 404/.test(message)) {
          setNotFound(true);
        } else {
          setError(err instanceof Error ? err : new Error(message));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!slug) {
    return {
      project: null,
      previous: null,
      next: null,
      isLoading: false,
      notFound: true,
      error: null,
    };
  }

  return { project, previous, next, isLoading, notFound, error };
}
