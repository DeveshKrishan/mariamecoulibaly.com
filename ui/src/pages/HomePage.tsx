import { ProjectGrid } from '../components/portfolio/ProjectGrid';
import { useProjects } from '../hooks/useProjects';

export function HomePage() {
  const { projects, isLoading, error } = useProjects();

  if (isLoading) return <p>Loading…</p>;
  if (error) return <p>Could not load projects: {error.message}</p>;

  return <ProjectGrid projects={projects} />;
}
