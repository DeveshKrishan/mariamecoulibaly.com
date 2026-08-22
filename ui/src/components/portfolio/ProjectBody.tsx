import type { RichTextBlock } from '../../types/content';

function ParagraphBlockView({ text }: { text: string }) {
  return (
    <p className="mb-4 leading-relaxed whitespace-pre-wrap italic">{text}</p>
  );
}

function ImageBlockView({
  url,
  alt,
  href,
}: {
  url: string;
  alt?: string;
  href?: string;
}) {
  const image = (
    <img
      src={url}
      alt={alt ?? ''}
      loading="lazy"
      className="w-full object-cover"
    />
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block mb-6"
      >
        {image}
      </a>
    );
  }

  return <figure className="mb-6">{image}</figure>;
}

/**
 * Project media CTAs match the Squarespace site: a centered outline button
 * ("Watch Here" / "Listen Here"), never an iframe embed.
 * Legacy `embed` body blocks are rendered the same way for parity.
 */
function LinkBlockView({ url, label }: { url: string; label: string }) {
  return (
    <p className="mb-6 text-center">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="project-cta"
      >
        {label}
      </a>
    </p>
  );
}

/** Renders one rich-text body block (paragraph, image, embed, or link). */
export function ProjectBlock({ block }: { block: RichTextBlock }) {
  switch (block.type) {
    case 'paragraph':
      return <ParagraphBlockView text={block.text} />;
    case 'image':
      return (
        <ImageBlockView url={block.url} alt={block.alt} href={block.href} />
      );
    case 'embed':
      return <LinkBlockView url={block.url} label="Watch Here" />;
    case 'link':
      return <LinkBlockView url={block.url} label={block.label} />;
    default:
      return null;
  }
}

export function ProjectBody({ body }: { body: RichTextBlock[] }) {
  if (body.length === 0) return null;

  return (
    <div className="mt-6">
      {body.map((block, index) => (
        <ProjectBlock key={`${block.type}-${index}`} block={block} />
      ))}
    </div>
  );
}
