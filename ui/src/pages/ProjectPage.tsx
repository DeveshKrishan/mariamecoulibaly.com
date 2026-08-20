import { useParams } from 'react-router-dom';
import { ProjectDetail } from '../components/portfolio/ProjectDetail';
import { useProject } from '../hooks/useProject';

export function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const { project, previous, next, isLoading, notFound, error } =
    useProject(slug);

  if (notFound) return <p>Project not found.</p>;
  if (error) return <p>Could not load project: {error.message}</p>;
  if (isLoading || !project) return <p>Loading…</p>;

  return (
    <ProjectDetail project={project} previous={previous} next={next} />
  );
}
