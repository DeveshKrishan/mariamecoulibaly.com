import type { Project } from '../types/content';
import { useCallback, useEffect, useState } from 'react';
import { getProjects, listAdminProjects } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useEditMode } from '../lib/editMode';

export function useProjects() {
  const { accessToken } = useAuth();
  const { editMode } = useEditMode();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const load =
      editMode && accessToken
        ? listAdminProjects(accessToken)
        : getProjects();

    load
      .then((data) => {
        if (!cancelled) setProjects(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [editMode, accessToken, reloadKey]);

  return { projects, setProjects, isLoading, error, reload };
}
