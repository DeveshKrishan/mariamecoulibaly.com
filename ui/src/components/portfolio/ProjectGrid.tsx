import type { Project } from '@mariame/shared';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, type CSSProperties, type HTMLAttributes } from 'react';
import { ProjectCard } from './ProjectCard';

function CardPreview({
  project,
  onDelete,
  onThumbnailReplaced,
  dragHandleProps,
  setNodeRef,
  style,
  isDragging,
  showControls,
}: {
  project: Project;
  onDelete?: (slug: string) => void;
  onThumbnailReplaced?: (next: Project) => void;
  dragHandleProps?: HTMLAttributes<HTMLElement>;
  setNodeRef?: (node: HTMLElement | null) => void;
  style?: CSSProperties;
  isDragging?: boolean;
  showControls: boolean;
}) {
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'relative rounded-sm',
        isDragging ? 'opacity-35' : '',
        showControls ? '' : 'cursor-grabbing shadow-lg ring-1 ring-ink/20',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {showControls ? (
        <div className="mb-2 flex items-center gap-2">
          <button
            type="button"
            className="cursor-grab touch-none border border-ink/20 bg-white px-2 py-1 text-xs tracking-wide active:cursor-grabbing"
            aria-label={`Drag to reorder ${project.title}`}
            {...dragHandleProps}
          >
            ⋮⋮ Drag
          </button>
          {onDelete ? (
            <button
              type="button"
              className="border border-red-200 bg-white px-2 py-1 text-xs tracking-wide text-red-800"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(project.slug);
              }}
            >
              Delete
            </button>
          ) : null}
          {project.status === 'draft' ? (
            <span className="bg-ink/80 px-2 py-0.5 text-[10px] tracking-wide text-white uppercase">
              Draft
            </span>
          ) : null}
        </div>
      ) : null}

      <ProjectCard
        project={project}
        animate={false}
        onThumbnailReplaced={onThumbnailReplaced}
      />
    </div>
  );
}

function SortableCard({
  project,
  onDelete,
  onThumbnailReplaced,
}: {
  project: Project;
  onDelete?: (slug: string) => void;
  onThumbnailReplaced?: (next: Project) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.slug });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dragHandleProps = { ...attributes, ...listeners };

  return (
    <CardPreview
      project={project}
      onDelete={onDelete}
      onThumbnailReplaced={onThumbnailReplaced}
      dragHandleProps={dragHandleProps}
      setNodeRef={setNodeRef}
      style={style}
      isDragging={isDragging}
      showControls
    />
  );
}

/**
 * Homepage project index — 3-column inset grid matching the reference
 * site’s `blog-basic-grid` (tweak-blog-basic-grid-columns: 3).
 * When `editable`, cards are sortable via @dnd-kit.
 */
export function ProjectGrid({
  projects,
  editable = false,
  onReorder,
  onDelete,
  onThumbnailReplaced,
}: {
  projects: Project[];
  editable?: boolean;
  onReorder?: (ordered: Project[]) => void;
  onDelete?: (slug: string) => void;
  onThumbnailReplaced?: (next: Project) => void;
}) {
  const sorted = [...projects].sort((a, b) => a.sortOrder - b.sortOrder);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  if (!editable || !onReorder) {
    return (
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onThumbnailReplaced={onThumbnailReplaced}
          />
        ))}
      </div>
    );
  }

  const commitReorder = onReorder;
  const activeProject = activeSlug
    ? sorted.find((p) => p.slug === activeSlug) ?? null
    : null;
  const isDragging = activeSlug !== null;

  function handleDragStart(event: DragStartEvent) {
    setActiveSlug(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveSlug(null);
    if (!over || active.id === over.id) return;
    const oldIndex = sorted.findIndex((p) => p.slug === String(active.id));
    const newIndex = sorted.findIndex((p) => p.slug === String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(sorted, oldIndex, newIndex).map((p, i) => ({
      ...p,
      sortOrder: i,
    }));
    commitReorder(next);
  }

  function handleDragCancel() {
    setActiveSlug(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={sorted.map((p) => p.slug)}
        strategy={rectSortingStrategy}
      >
        <div className="relative">
          {isDragging ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -m-3 overflow-hidden rounded-sm bg-ink/[0.025]"
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: [
                    'linear-gradient(to right, rgba(21,9,9,0.08) 1px, transparent 1px)',
                    'linear-gradient(to bottom, rgba(21,9,9,0.08) 1px, transparent 1px)',
                  ].join(', '),
                  backgroundSize: '20px 20px',
                }}
              />
              <div className="absolute inset-0 hidden sm:block lg:hidden">
                <div className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 bg-ink/25" />
              </div>
              <div className="absolute inset-0 hidden lg:block">
                <div className="absolute top-0 bottom-0 left-[calc((100%-4rem)/3+1rem)] w-px bg-ink/25" />
                <div className="absolute top-0 bottom-0 left-[calc(2*((100%-4rem)/3)+3rem)] w-px bg-ink/25" />
              </div>
            </div>
          ) : null}
          <div className="relative grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((project) => (
              <SortableCard
                key={project.slug}
                project={project}
                onDelete={onDelete}
                onThumbnailReplaced={onThumbnailReplaced}
              />
            ))}
          </div>
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={null}>
        {activeProject ? (
          <CardPreview project={activeProject} showControls={false} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

/** Pure helper for tests: reorder slug list the same way drag-end does. */
export function reorderSlugs(
  slugs: string[],
  activeId: string,
  overId: string,
): string[] {
  const oldIndex = slugs.indexOf(activeId);
  const newIndex = slugs.indexOf(overId);
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return slugs;
  return arrayMove(slugs, oldIndex, newIndex);
}
