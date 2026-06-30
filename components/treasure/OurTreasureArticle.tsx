import React from 'react';
import {
  videoEmbedSrc,
  type OurTreasureContent,
  type TreasureVideo,
  type Para,
} from '@/lib/treasure-content';

/**
 * Pure, props-driven renderer for the "Our Treasure" page.
 * Shares the Reunion page's visual language — purple canvas, coral accent,
 * boxed white/5 cards — so the two memory pages feel like a set.
 * Reused by app/our-treasure/page.tsx and the admin live preview.
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
    <p className={`${className ?? ''} whitespace-pre-line${p.bold ? ' font-semibold' : ''}`}>
      {p.lead && (
        <span className="font-semibold" style={{ color: ACCENT }}>
          {p.lead}
        </span>
      )}
      {p.text}
    </p>
  );
}

/** A single video in a boxed card: optional title, 16:9 player, optional caption. */
function VideoCard({ video, index }: { video: TreasureVideo; index: number }) {
  const embed = videoEmbedSrc(video);

  return (
    <figure className="bg-white/5 rounded-2xl p-4 sm:p-5 border border-white/10">
      {video.title && (
        <figcaption className="mb-3 flex items-center gap-3">
          <span
            className="text-3xl font-bold leading-none select-none"
            style={{ color: 'rgba(217,81,100,0.3)' }}
            aria-hidden
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <h2 className="text-white text-lg sm:text-xl font-bold">{video.title}</h2>
        </figcaption>
      )}

      <div
        className="relative w-full overflow-hidden rounded-xl bg-black/30"
        style={{ aspectRatio: '16 / 9' }}
      >
        {embed?.mode === 'iframe' && (
          <iframe
            src={embed.src}
            title={video.title || `Our Treasure video ${index + 1}`}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        )}
        {embed?.mode === 'file' && (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={embed.src} controls playsInline className="absolute inset-0 h-full w-full" />
        )}
        {!embed && (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-white/40">
            Add a video link in the admin panel to show it here.
          </div>
        )}
      </div>

      {video.caption && (
        <p className="mt-3 text-sm text-white/60 leading-relaxed whitespace-pre-line">
          {video.caption}
        </p>
      )}
    </figure>
  );
}

export default function OurTreasureArticle({ content }: { content: OurTreasureContent }) {
  const { hero, intro, videos, closing } = content;

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
          {hero.byline && (
            <p className="text-white/40 text-center text-xs tracking-widest uppercase mt-6">
              {hero.byline}
            </p>
          )}
        </div>
      </section>

      {/* ── Article ──────────────────────────────── */}
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
        {/* Intro */}
        {intro.length > 0 && (
          <div className="space-y-4 mb-12">
            {intro.map((p, i) => (
              <Paragraph key={i} p={p} className="text-white/90 text-base sm:text-lg leading-relaxed" />
            ))}
          </div>
        )}

        {/* Videos */}
        <div className="space-y-6 sm:space-y-8 mb-14">
          {videos.map((video, i) => (
            <VideoCard key={i} video={video} index={i} />
          ))}
        </div>

        {/* Closing */}
        <div className="text-center space-y-4 pb-4">
          <h2 className="text-white text-xl sm:text-2xl font-bold mb-2">{closing.heading}</h2>
          {closing.paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-white/85 text-base sm:text-lg leading-relaxed whitespace-pre-line"
            >
              {p.text}
            </p>
          ))}
          {closing.signature && (
            <p className="pt-4 font-bold text-2xl" style={{ color: ACCENT }}>
              {closing.signature}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
