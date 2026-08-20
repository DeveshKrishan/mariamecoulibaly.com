import { ProjectGrid } from '../components/portfolio/ProjectGrid';
import { Seo } from '../components/seo/Seo';
import { useProjects } from '../hooks/useProjects';
import { absoluteUrl } from '../lib/site';

export function HomePage() {
  const { projects, isLoading, error } = useProjects();

  return (
    <>
      <Seo
        title="Mariam Coulibaly"
        description="Portfolio of Mariam Coulibaly, an emerging media professional from the San Francisco Bay Area."
        url={absoluteUrl('/')}
      />
      {isLoading ? (
        <p>Loading…</p>
      ) : error ? (
        <p>Could not load projects: {error.message}</p>
      ) : (
        <ProjectGrid projects={projects} />
      )}
    </>
  );
}
