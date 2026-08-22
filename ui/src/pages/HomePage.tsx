import type { Project } from '../types/content';
import { useNavigate } from 'react-router-dom';
import { ProjectGrid } from '../components/portfolio/ProjectGrid';
import { Seo } from '../components/seo/Seo';
import { useProjects } from '../hooks/useProjects';
import {
  createProject,
  deleteProject,
  reorderProjects,
  type ProjectWritePayload,
} from '../lib/api';
import { useAuth } from '../lib/auth';
import { useEditMode } from '../lib/editMode';
import { absoluteUrl } from '../lib/site';
import { slugifyTitle, uniqueSlug } from '../lib/slug';

export function HomePage() {
  const { projects, setProjects, isLoading, error } = useProjects();
  const { accessToken } = useAuth();
  const { editMode, runSave } = useEditMode();
  const navigate = useNavigate();

  async function handleReorder(ordered: Project[]) {
    if (!accessToken) return;
    const previous = projects;
    setProjects(ordered);
    try {
      await runSave(() =>
        reorderProjects(
          ordered.map((p) => p.slug),
          accessToken,
        ),
      );
    } catch {
      setProjects(previous);
    }
  }

  async function handleDelete(slug: string) {
    if (!accessToken) return;
    if (!window.confirm(`Soft-delete project “${slug}”?`)) return;
    const previous = projects;
    setProjects(projects.filter((p) => p.slug !== slug));
    try {
      await runSave(() => deleteProject(slug, accessToken));
    } catch {
      setProjects(previous);
    }
  }

  async function handleAdd() {
    if (!accessToken) return;
    const existing = new Set(projects.map((p) => p.slug));
    const slug = uniqueSlug(slugifyTitle('Untitled'), existing);
    const payload: ProjectWritePayload & { slug: string } = {
      slug,
      title: 'Untitled',
      client: '',
      role: '',
      summary: '',
      body: [],
      thumbnailUrl: '',
      sortOrder: projects.length + 1,
      status: 'draft',
      publishedAt: new Date().toISOString().slice(0, 10),
    };
    try {
      const created = await runSave(() => createProject(payload, accessToken));
      setProjects([...projects, created]);
      navigate(`/projects/${created.slug}?edit=1`);
    } catch {
      // runSave already set error status
    }
  }

  return (
    <div className="mx-auto max-w-[1280px] px-[5vw] pb-24">
      <Seo
        title="Mariam Coulibaly"
        description="Portfolio of Mariam Coulibaly, an emerging media professional from the San Francisco Bay Area."
        url={absoluteUrl('/')}
      />
      {editMode ? (
        <div className="mb-8 flex justify-end">
          <button
            type="button"
            onClick={() => void handleAdd()}
            className="border border-ink px-4 py-2 text-sm tracking-wide hover:bg-ink hover:text-white"
          >
            + Add project
          </button>
        </div>
      ) : null}
      {isLoading ? (
        <p>Loading…</p>
      ) : error ? (
        <p>Could not load projects: {error.message}</p>
      ) : (
        <ProjectGrid
          projects={projects}
          editable={editMode}
          onReorder={editMode ? handleReorder : undefined}
          onDelete={editMode ? handleDelete : undefined}
          onThumbnailReplaced={
            editMode
              ? (next) => {
                  setProjects((prev) =>
                    prev.map((p) => (p.id === next.id ? next : p)),
                  );
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
