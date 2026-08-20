import type { Project } from '@mariame/shared';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProject } from '../lib/api';

export function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setNotFound(false);
    setProject(null);
    getProject(slug)
      .then(setProject)
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) return <p>Project not found.</p>;
  if (!project) return <p>Loading…</p>;

  return (
    <article className="max-w-2xl">
      <h1 className="text-3xl mb-1">{project.title}</h1>
      <p className="text-sm opacity-70 mb-6">
        {project.publishedAt} — {project.role}
      </p>
      <p>{project.summary}</p>
    </article>
  );
}
