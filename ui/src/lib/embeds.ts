/**
 * Turn a watch / share URL into an embeddable player URL when possible.
 * Returns null when the URL cannot be embedded as an iframe.
 */
export function toEmbedSrc(url: string, provider?: string): string | null {
  if (provider === 'video' || /\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return null;
  }

  const youtube = parseYouTubeId(url);
  if (youtube || provider === 'youtube') {
    return youtube ? `https://www.youtube.com/embed/${youtube}` : null;
  }

  const vimeo = parseVimeoId(url);
  if (vimeo || provider === 'vimeo') {
    return vimeo ? `https://player.vimeo.com/video/${vimeo}` : null;
  }

  return null;
}

function parseYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (
      parsed.hostname === 'youtu.be' ||
      parsed.hostname.endsWith('.youtu.be')
    ) {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      return id || null;
    }
    if (
      parsed.hostname.includes('youtube.com') ||
      parsed.hostname.includes('youtube-nocookie.com')
    ) {
      const fromQuery = parsed.searchParams.get('v');
      if (fromQuery) return fromQuery;
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts[0] === 'embed' || parts[0] === 'shorts') {
        return parts[1] || null;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function parseVimeoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('vimeo.com')) return null;
    const parts = parsed.pathname.split('/').filter(Boolean);
    const id = parts.find((part) => /^\d+$/.test(part));
    return id || null;
  } catch {
    return null;
  }
}

export function isDirectVideoUrl(url: string, provider?: string): boolean {
  return provider === 'video' || /\.(mp4|webm|ogg)(\?|$)/i.test(url);
}
