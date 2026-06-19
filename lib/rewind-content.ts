/**
 * "Rewind: The Songs We Grew Up On" page content model.
 *
 * This is the first page under the "Echoes & Memories" section. It mirrors the
 * Reunion content pattern (lib/reunion-content.ts): a typed shape + a canonical
 * `DEFAULT_REWIND_CONTENT` baseline kept in code, stored/overridden per-slug in
 * the shared `page_content` table. The page renders entirely from this object so
 * the admin can add / edit / delete songs without touching code.
 *
 * More pages will be added under "Echoes & Memories" later; each gets its own
 * slug + content model following this same template.
 */

/** A paragraph. `lead` is an accent-coloured inline prefix. */
export type Para = { text: string; lead?: string };

/**
 * A single track in the playlist. Only `title` is required so the admin can add
 * a song quickly and fill in the rest later. `url` links out to wherever the
 * song lives (YouTube, Spotify, Apple Music…); `note` is a short memory line.
 */
export type Song = {
  title: string;
  artist?: string;
  year?: string;
  note?: string;
  url?: string;
};

export type RewindContent = {
  hero: { title: string; accent?: string; byline: string };
  intro: Para[];
  /** Optional embedded player (Spotify / YouTube playlist embed URL). */
  playlistEmbedUrl?: string;
  songsHeading: string;
  songs: Song[];
  closing: { heading: string; paragraphs: Para[] };
};

export const REWIND_SLUG = 'rewind-songs';

export const DEFAULT_REWIND_CONTENT: RewindContent = {
  hero: {
    title: 'Rewind: The Songs We Grew Up On',
    accent: 'Rewind',
    byline: 'The soundtrack of our years — press play and travel back',
  },

  intro: [
    {
      text: 'Some songs are not just songs. They are time machines. The opening bars play and suddenly we are back in the dorms, on the bus down the hairpin bends, or dancing the night away at a social — out of tune and not caring one bit.',
    },
    {
      text: 'This is our shared playlist: the tracks that scored our growing up. Add the ones that take you back, and let the memories play.',
    },
  ],

  // Leave blank by default; paste a Spotify/YouTube "embed" URL in the admin
  // editor to show an inline player at the top of the list.
  playlistEmbedUrl: '',

  songsHeading: 'The Playlist',

  songs: [
    {
      title: 'Livin’ on a Prayer',
      artist: 'Bon Jovi',
      year: '1986',
      note: 'The anthem that turned every social into a singalong.',
      url: '',
    },
    {
      title: 'Billie Jean',
      artist: 'Michael Jackson',
      year: '1983',
      note: 'The moonwalk attempts were questionable. The energy wasn’t.',
      url: '',
    },
    {
      title: 'I Want It That Way',
      artist: 'Backstreet Boys',
      year: '1999',
      url: '',
    },
    {
      title: 'Roja (Title Track)',
      artist: 'A.R. Rahman',
      year: '1992',
      note: 'The sound of home.',
      url: '',
    },
    {
      title: 'Summer of ’69',
      artist: 'Bryan Adams',
      year: '1984',
      url: '',
    },
  ],

  closing: {
    heading: 'Add Yours',
    paragraphs: [
      {
        text: 'A playlist like this is never finished. If a song defined your years here, it belongs on this list — let it be heard again.',
      },
    ],
  },
};
