import type { Project } from '@mariame/shared';
import { useEffect, useState } from 'react';
import {
  getAdminProject,
  getProject,
  getProjects,
  listAdminProjects,
} from '../lib/api';
import { useAuth } from '../lib/auth';
import { useEditMode } from '../lib/editMode';
import { findProjectNeighbors } from '../lib/projectNeighbors';

export function useProject(slug: string | undefined) {
  const { accessToken } = useAuth();
  const { editMode } = useEditMode();
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
    const admin = editMode && accessToken;

    const detailPromise = admin
      ? getAdminProject(slug, accessToken)
      : getProject(slug);
    const listPromise = admin
      ? listAdminProjects(accessToken)
      : getProjects();

    Promise.all([detailPromise, listPromise])
      .then(([detail, projects]) => {
        if (cancelled) return;
        const neighbors = findProjectNeighbors(projects, slug);
        setProject(detail);
        setPrevious(neighbors.previous);
        setNext(neighbors.next);
      })
      .catch((err: Error) => {
        if (cancelled) return;
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
  }, [slug, editMode, accessToken]);

  if (!slug) {
    return {
      project: null,
      setProject,
      previous: null,
      next: null,
      isLoading: false,
      notFound: true,
      error: null,
    };
  }

  return {
    project,
    setProject,
    previous,
    next,
    isLoading,
    notFound,
    error,
  };
}
