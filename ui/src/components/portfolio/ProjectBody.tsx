import type { RichTextBlock } from '@mariame/shared';
import { isDirectVideoUrl, toEmbedSrc } from '../../lib/embeds';

function ParagraphBlockView({ text }: { text: string }) {
  return <p className="mb-4 leading-relaxed whitespace-pre-wrap">{text}</p>;
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

function EmbedBlockView({ url, provider }: { url: string; provider?: string }) {
  if (isDirectVideoUrl(url, provider)) {
    return (
      <video
        src={url}
        controls
        className="w-full mb-6 bg-neutral-100"
        preload="metadata"
      >
        <track kind="captions" />
      </video>
    );
  }

  const embedSrc = toEmbedSrc(url, provider);
  if (embedSrc) {
    return (
      <div className="relative w-full mb-6 aspect-video bg-neutral-100">
        <iframe
          src={embedSrc}
          title="Embedded media"
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <p className="mb-4">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        {url}
      </a>
    </p>
  );
}

function LinkBlockView({ url, label }: { url: string; label: string }) {
  return (
    <p className="mb-6">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block border border-ink px-4 py-2 text-sm uppercase tracking-wide hover:bg-ink hover:text-white transition-colors"
      >
        {label}
      </a>
    </p>
  );
}

function BlockView({ block }: { block: RichTextBlock }) {
  switch (block.type) {
    case 'paragraph':
      return <ParagraphBlockView text={block.text} />;
    case 'image':
      return (
        <ImageBlockView url={block.url} alt={block.alt} href={block.href} />
      );
    case 'embed':
      return <EmbedBlockView url={block.url} provider={block.provider} />;
    case 'link':
      return <LinkBlockView url={block.url} label={block.label} />;
    default:
      return null;
  }
}

export function ProjectBody({ body }: { body: RichTextBlock[] }) {
  if (body.length === 0) return null;

  return (
    <div className="mt-8">
      {body.map((block, index) => (
        <BlockView key={`${block.type}-${index}`} block={block} />
      ))}
    </div>
  );
}
