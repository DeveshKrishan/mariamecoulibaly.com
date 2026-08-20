import type { Project } from '@mariame/shared';
import { useEffect, useState } from 'react';
import { getProject, getProjects } from '../lib/api';
import { findProjectNeighbors } from '../lib/projectNeighbors';

export function useProject(slug: string | undefined) {
  const [project, setProject] = useState<Project | null>(null);
  const [previous, setPrevious] = useState<Project | null>(null);
  const [next, setNext] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(slug));
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      setNotFound(true);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setNotFound(false);
    setError(null);
    setProject(null);
    setPrevious(null);
    setNext(null);

    Promise.all([getProject(slug), getProjects()])
      .then(([detail, projects]) => {
        if (cancelled) return;
        const neighbors = findProjectNeighbors(projects, slug);
        setProject(detail);
        setPrevious(neighbors.previous);
        setNext(neighbors.next);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        // 404 from getProject surfaces as a thrown Error from the api client.
        if (/status 404/.test(err.message)) {
          setNotFound(true);
        } else {
          setError(err);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { project, previous, next, isLoading, notFound, error };
}
