import { useParams } from 'react-router-dom';
import { ProjectDetail } from '../components/portfolio/ProjectDetail';
import { useProject } from '../hooks/useProject';

export function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const { project, setProject, previous, next, isLoading, notFound, error } =
    useProject(slug);

  if (notFound) {
    return <p className="mx-auto max-w-[1280px] px-[5vw]">Project not found.</p>;
  }
  if (error) {
    return (
      <p className="mx-auto max-w-[1280px] px-[5vw]">
        Could not load project: {error.message}
      </p>
    );
  }
  if (isLoading || !project) {
    return <p className="mx-auto max-w-[1280px] px-[5vw]">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-[1280px] px-[5vw] pb-24">
      <ProjectDetail
        project={project}
        onProjectChange={setProject}
        previous={previous}
        next={next}
      />
    </div>
  );
}
