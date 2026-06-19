import React from 'react';
import { Play } from 'lucide-react';
import type { RewindContent, Para, Song } from '@/lib/rewind-content';

/**
 * Pure, props-driven renderer for the "Rewind: The Songs We Grew Up On" page.
 * Shares the Reunion page's visual language (deep purple canvas, rose accent) so
 * everything under "Echoes & Memories" feels like one family.
 * Reused by app/echoes-and-memories/rewind/page.tsx and the admin live preview.
 */

const ACCENT = 'rgba(217,81,100,1)';

function HeroTitle({ title, accent }: { title: string; accent?: string }) {
  if (!accent || !title.includes(accent)) return <>{title}</>;
  const [before, ...rest] = title.split(accent);
  return (
    <>
      {before}
      <span style={{ color: ACCENT }}>{accent}</span>
      {rest.join(accent)}
    </>
  );
}

function Paragraph({ p, className }: { p: Para; className?: string }) {
  return (
    <p className={`${className ?? ''} whitespace-pre-line`}>
      {p.lead && (
        <span className="font-semibold" style={{ color: ACCENT }}>
          {p.lead}
        </span>
      )}
      {p.text}
    </p>
  );
}

function SongRow({ song, index }: { song: Song; index: number }) {
  const meta = [song.artist, song.year].filter(Boolean).join(' · ');
  return (
    <li className="flex items-start gap-4 rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5">
      <span
        className="text-2xl sm:text-3xl font-bold leading-none select-none w-8 sm:w-10 shrink-0 text-right"
        style={{ color: 'rgba(217,81,100,0.3)' }}
      >
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-white text-base sm:text-lg font-bold leading-snug">{song.title}</h3>
        {meta && <p className="text-white/55 text-sm mt-0.5">{meta}</p>}
        {song.note && <p className="text-white/70 text-sm italic mt-2">{song.note}</p>}
      </div>
      {song.url && (
        <a
          href={song.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/90 transition-colors hover:bg-white/10"
          aria-label={`Listen to ${song.title}`}
        >
          <Play size={13} className="fill-current" /> Listen
        </a>
      )}
    </li>
  );
}

export default function RewindArticle({ content }: { content: RewindContent }) {
  const { hero, intro, playlistEmbedUrl, songsHeading, songs, closing } = content;

  return (
    <>
      {/* ── Hero ─────────────────────────────────── */}
      <section className="w-full py-16 sm:py-20 md:py-28 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1
            className="text-white font-bold leading-[1.2] tracking-tight"
            style={{ fontSize: 'clamp(26px, 4.5vw, 48px)' }}
          >
            <HeroTitle title={hero.title} accent={hero.accent} />
          </h1>
          <div
            className="w-16 h-0.5 mx-auto mt-6 rounded-full"
            style={{ backgroundColor: 'rgba(217,81,100,0.5)' }}
          />
        </div>
      </section>

      {/* ── Article ──────────────────────────────── */}
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
        {hero.byline && (
          <p className="text-white/40 text-center text-xs tracking-widest uppercase mb-10">
            {hero.byline}
          </p>
        )}

        {/* Intro */}
        <div className="space-y-4 mb-12">
          {intro.map((p, i) => (
            <Paragraph key={i} p={p} className="text-white/90 text-base sm:text-lg leading-relaxed" />
          ))}
        </div>

        {/* Optional embedded player */}
        {playlistEmbedUrl && (
          <div className="mb-12 overflow-hidden rounded-2xl border border-white/10">
            <iframe
              src={playlistEmbedUrl}
              title="Playlist"
              loading="lazy"
              className="w-full"
              style={{ height: 380, border: 0 }}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Song list */}
        <div className="mb-14">
          <h2 className="text-white text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: ACCENT }}>
              {songsHeading}
            </span>
            <span className="h-px flex-1" style={{ backgroundColor: 'rgba(217,81,100,0.25)' }} />
          </h2>

          {songs.length === 0 ? (
            <p className="text-white/50 text-sm italic">No songs yet. Add the first one.</p>
          ) : (
            <ul className="space-y-3">
              {songs.map((song, i) => (
                <SongRow key={i} song={song} index={i} />
              ))}
            </ul>
          )}
        </div>

        {/* Closing */}
        <div className="text-center space-y-4">
          <h2 className="text-white text-xl sm:text-2xl font-bold mb-2">{closing.heading}</h2>
          {closing.paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-white/85 text-base sm:text-lg leading-relaxed whitespace-pre-line"
            >
              {p.text}
            </p>
          ))}
        </div>
      </div>
    </>
  );
}
