/**
 * "Our Treasure" page content model.
 *
 * The /our-treasure page renders entirely from an `OurTreasureContent` object,
 * exactly like the Reunion page does from `ReunionContent`. It rides the same
 * generic `page_content` table (keyed by slug) and the same admin API route, so
 * the copy and the two showcase videos are editable from the admin panel.
 *
 * `DEFAULT_OUR_TREASURE_CONTENT` is the canonical fallback: it is returned when
 * no row exists yet and is the "Reset to original" baseline in the editor, so
 * the page is never blank.
 */

// Reuse the paragraph primitive from the Reunion model rather than redefining
// it — both pages share the same accent-prefixed paragraph treatment.
import type { Para } from '@/lib/reunion-content';

export type { Para };

export const OUR_TREASURE_SLUG = 'our-treasure';

/**
 * Where a video lives. Keeping the source explicit (rather than guessing from
 * the URL) makes the admin form unambiguous and lets each provider build its
 * own embed URL:
 *  - `youtube` / `vimeo` → streamed iframe player (best for large files)
 *  - `drive`            → Google Drive preview iframe (reuses the gallery's Drive setup)
 *  - `file`             → a direct video file URL rendered in a native <video>
 */
export type VideoKind = 'youtube' | 'vimeo' | 'drive' | 'file';

export type TreasureVideo = {
  kind: VideoKind;
  /** The pasted share link (or bare ID / file URL for `file`). */
  url: string;
  title: string;
  caption?: string;
};

export type OurTreasureContent = {
  hero: { title: string; accent?: string; byline: string };
  intro: Para[];
  videos: TreasureVideo[];
  closing: { heading: string; paragraphs: Para[]; signature?: string };
};

/**
 * Resolve a `TreasureVideo` into something the renderer can drop into the DOM:
 * either an iframe `src` (hosted players + Drive) or a direct file `src` for a
 * native <video>. Returns `null` when the url is blank so the renderer can skip
 * an empty slot instead of rendering a broken player.
 *
 * The parsing is deliberately forgiving about the URL shape an admin might
 * paste — share links, short links, /embed/, /shorts/, ?v=, Drive /file/d/…/view,
 * etc. — because the person filling the form should not have to hand-craft an
 * embed URL.
 */
export function videoEmbedSrc(
  video: TreasureVideo
): { mode: 'iframe' | 'file'; src: string } | null {
  const raw = video.url?.trim();
  if (!raw) return null;

  switch (video.kind) {
    case 'youtube': {
      const id = parseYouTubeId(raw);
      return id ? { mode: 'iframe', src: `https://www.youtube.com/embed/${id}` } : null;
    }
    case 'vimeo': {
      const id = parseVimeoId(raw);
      return id ? { mode: 'iframe', src: `https://player.vimeo.com/video/${id}` } : null;
    }
    case 'drive': {
      const id = parseDriveId(raw);
      return id
        ? { mode: 'iframe', src: `https://drive.google.com/file/d/${id}/preview` }
        : null;
    }
    case 'file':
      return { mode: 'file', src: raw };
    default:
      return null;
  }
}

/** youtu.be/ID · watch?v=ID · /embed/ID · /shorts/ID · or a bare 11-char ID. */
function parseYouTubeId(url: string): string | null {
  if (/^[\w-]{11}$/.test(url)) return url;
  const m = url.match(
    /(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([\w-]{11})/
  );
  return m ? m[1] : null;
}

/** vimeo.com/123456789 · player.vimeo.com/video/123456789 · or a bare numeric ID. */
function parseVimeoId(url: string): string | null {
  if (/^\d+$/.test(url)) return url;
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

/** drive.google.com/file/d/ID/view · open?id=ID · uc?id=ID · or a bare file ID. */
function parseDriveId(url: string): string | null {
  if (/^[\w-]{20,}$/.test(url)) return url;
  const m = url.match(/(?:\/file\/d\/|[?&]id=)([\w-]{20,})/);
  return m ? m[1] : null;
}

export const DEFAULT_OUR_TREASURE_CONTENT: OurTreasureContent = {
  hero: {
    title: 'Our Treasure',
    accent: 'Treasure',
    byline: 'The moments we will always hold close',
  },
  intro: [
    {
      text: 'Some memories are too precious to let fade. These are the moments we keep coming back to — the laughter, the faces, the feeling of being together again. Here are two of our most treasured ones.',
    },
  ],
  videos: [
    { kind: 'youtube', url: '', title: 'Moments We Treasure', caption: '' },
    { kind: 'youtube', url: '', title: 'Memories That Stay', caption: '' },
  ],
  closing: {
    heading: 'Forever Ours',
    paragraphs: [
      {
        text: 'No matter how much time passes, these moments stay with us — a treasure we carry in our hearts.',
      },
    ],
    signature: 'Kenavo — Always',
  },
};
