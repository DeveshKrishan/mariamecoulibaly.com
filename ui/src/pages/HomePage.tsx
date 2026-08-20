import { ProjectGrid } from '../components/portfolio/ProjectGrid';
import { Seo } from '../components/seo/Seo';
import { useProjects } from '../hooks/useProjects';
import { absoluteUrl } from '../lib/site';

export function HomePage() {
  const { projects, isLoading, error } = useProjects();

  return (
    <div className="mx-auto max-w-[1280px] px-[5vw] pb-24">
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
    </div>
  );
}
