import { describe, expect, it } from 'vitest';
import { isDirectVideoUrl, toEmbedSrc } from './embeds';

describe('toEmbedSrc', () => {
  it('converts youtu.be links to embed URLs', () => {
    expect(toEmbedSrc('https://youtu.be/eq6bDsFdjnA')).toBe(
      'https://www.youtube.com/embed/eq6bDsFdjnA',
    );
  });

  it('converts youtube watch links to embed URLs', () => {
    expect(
      toEmbedSrc('https://www.youtube.com/watch?v=eq6bDsFdjnA&si=abc'),
    ).toBe('https://www.youtube.com/embed/eq6bDsFdjnA');
  });

  it('converts vimeo links to embed URLs', () => {
    expect(toEmbedSrc('https://vimeo.com/123456789')).toBe(
      'https://player.vimeo.com/video/123456789',
    );
  });

  it('returns null for direct video files', () => {
    expect(toEmbedSrc('https://example.com/clip.mp4', 'video')).toBeNull();
  });
});

describe('isDirectVideoUrl', () => {
  it('detects mp4 URLs and the video provider', () => {
    expect(isDirectVideoUrl('https://cdn.example.com/a.mp4')).toBe(true);
    expect(isDirectVideoUrl('https://example.com/x', 'video')).toBe(true);
    expect(isDirectVideoUrl('https://youtu.be/abc')).toBe(false);
  });
});
