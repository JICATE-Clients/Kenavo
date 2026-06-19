import React from 'react';
import type { ReunionContent, Para, Quote, DayBlock } from '@/lib/reunion-content';

/**
 * Pure, props-driven renderer for the Reunion 2025 page.
 * Same markup the page shipped with originally, now driven by `content`.
 * Reused by app/reunion-2025/page.tsx and the admin live preview.
 */

const ACCENT = 'rgba(217,81,100,1)';

function Paragraph({ p, className }: { p: Para; className?: string }) {
  return (
    <p className={`${className ?? ''} whitespace-pre-line${p.bold ? ' font-semibold' : ''}`}>
      {p.lead && <span className="font-semibold" style={{ color: ACCENT }}>{p.lead}</span>}
      {p.text}
    </p>
  );
}

function Blockquote({
  quote,
  className,
  footerClassName,
}: {
  quote: Quote;
  className: string;
  footerClassName: string;
}) {
  return (
    <blockquote className={className}>
      <span className="whitespace-pre-line">{`“${quote.text}”`}</span>
      {quote.footer && <footer className={footerClassName}>{quote.footer}</footer>}
    </blockquote>
  );
}

/** Render a paragraph list, optionally splicing a blockquote in after a given index. */
function Body({
  paragraphs,
  paraClassName,
  quote,
  quoteAfter,
  quoteClassName,
  quoteFooterClassName,
}: {
  paragraphs: Para[];
  paraClassName?: string;
  quote?: Quote;
  quoteAfter?: number;
  quoteClassName?: string;
  quoteFooterClassName?: string;
}) {
  const at = quote ? (quoteAfter ?? paragraphs.length - 1) : -1;
  return (
    <>
      {paragraphs.map((p, i) => (
        <React.Fragment key={i}>
          <Paragraph p={p} className={paraClassName} />
          {quote && i === at && (
            <Blockquote
              quote={quote}
              className={quoteClassName!}
              footerClassName={quoteFooterClassName!}
            />
          )}
        </React.Fragment>
      ))}
      {/* Quote requested after an out-of-range index → render at the end. */}
      {quote && at >= paragraphs.length && (
        <Blockquote quote={quote} className={quoteClassName!} footerClassName={quoteFooterClassName!} />
      )}
    </>
  );
}

function DayBlockView({ block }: { block: DayBlock }) {
  if (block.style === 'section') {
    return (
      <div className="mt-8">
        <h3 className="text-white text-lg sm:text-xl font-bold mb-4">{block.heading}</h3>
        <div className="space-y-4 text-white/85 text-base leading-relaxed border-l-2 pl-5 sm:pl-6" style={{ borderColor: 'rgba(217,81,100,0.25)' }}>
          <Body paragraphs={block.paragraphs} />
        </div>
      </div>
    );
  }

  // card
  return (
    <div className="mt-8 bg-white/5 rounded-2xl p-5 sm:p-7 border border-white/10">
      {block.eyebrow && (
        <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: ACCENT }}>
          {block.eyebrow}
        </p>
      )}
      <h3 className="text-white text-lg sm:text-xl font-bold mb-4">{block.heading}</h3>
      <div className="space-y-3 text-white/85 text-base leading-relaxed">
        <Body
          paragraphs={block.paragraphs}
          quote={block.quote}
          quoteAfter={block.quoteAfter}
          quoteClassName="border-l-2 pl-4 my-4 italic text-white/65 text-sm sm:text-base"
          quoteFooterClassName="text-white/40 text-xs not-italic mt-1"
        />
      </div>
    </div>
  );
}

function HeroTitle({ title, accent }: { title: string; accent?: string }) {
  if (!accent || !title.includes(accent)) {
    return <>{title}</>;
  }
  const [before, ...rest] = title.split(accent);
  return (
    <>
      {before}
      <span style={{ color: ACCENT }}>{accent}</span>
      {rest.join(accent)}
    </>
  );
}

export default function ReunionArticle({ content }: { content: ReunionContent }) {
  const { hero, intro, days, tribute, closing, thankYou } = content;

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
          <div className="w-16 h-0.5 mx-auto mt-6 rounded-full" style={{ backgroundColor: 'rgba(217,81,100,0.5)' }} />
        </div>
      </section>

      {/* ── Article ──────────────────────────────── */}
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
        {hero.byline && (
          <p className="text-white/40 text-center text-xs tracking-widest uppercase mb-10">{hero.byline}</p>
        )}

        {/* Intro */}
        <div className="space-y-4 mb-14">
          <Body paragraphs={intro} paraClassName="text-white/90 text-base sm:text-lg leading-relaxed" />
        </div>

        {/* Days */}
        {days.map((day, di) => (
          <div className="mb-14" key={di}>
            <div className="flex items-start gap-4 mb-6">
              <span
                className="text-6xl font-bold leading-none select-none hidden sm:block"
                style={{ color: 'rgba(217,81,100,0.25)' }}
              >
                {String(di + 1).padStart(2, '0')}
              </span>
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: ACCENT }}>
                  {day.dateLabel}
                </p>
                <h2 className="text-white text-xl sm:text-2xl font-bold">{day.heading}</h2>
              </div>
            </div>

            <div className="space-y-4 text-white/85 text-base leading-relaxed border-l-2 pl-5 sm:pl-6" style={{ borderColor: 'rgba(217,81,100,0.25)' }}>
              <Body paragraphs={day.lead} />
            </div>

            {day.blocks.map((block, bi) => (
              <DayBlockView block={block} key={bi} />
            ))}
          </div>
        ))}

        {/* Tribute */}
        <div className="mb-14 rounded-2xl p-6 sm:p-8 border border-white/10" style={{ backgroundColor: 'rgba(64,34,120,0.55)' }}>
          <h2 className="text-lg sm:text-xl font-bold mb-4" style={{ color: ACCENT }}>{tribute.heading}</h2>
          <div className="space-y-5 text-white/85 text-base leading-relaxed">
            <Body
              paragraphs={tribute.paragraphs}
              quote={tribute.quote}
              quoteAfter={tribute.quoteAfter}
              quoteClassName="border-l-2 pl-5 italic text-white/80 text-base sm:text-lg leading-relaxed"
              quoteFooterClassName="text-white/40 text-xs not-italic mt-1"
            />
          </div>
        </div>

        {/* Closing */}
        <div className="text-center space-y-4 pb-4">
          <h2 className="text-white text-xl sm:text-2xl font-bold mb-2">{closing.heading}</h2>
          {closing.paragraphs.map((p, i) => (
            <p key={i} className="text-white/85 text-base sm:text-lg leading-relaxed whitespace-pre-line">
              {p.text}
            </p>
          ))}
          <div className="pt-5 space-y-1">
            <p className="font-bold text-xl whitespace-pre-line" style={{ color: ACCENT }}>
              {closing.signature.join('\n')}
            </p>
            <p className="text-white font-bold text-2xl">{closing.signatureTitle}</p>
          </div>
          {closing.ps && <p className="text-white/30 text-xs italic pt-2">{closing.ps}</p>}
        </div>
      </div>

      {/* ── Thank You Note ─────────────────────────── */}
      <section className="w-full py-16 sm:py-20 px-4 sm:px-6" style={{ backgroundColor: 'rgba(254,249,232,1)' }}>
        <div className="max-w-xl mx-auto text-center">
          {thankYou.logoUrl && (
            <div className="mb-8 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thankYou.logoUrl} alt="Kenavo Logo" className="w-40 h-auto sm:w-52 object-contain" />
            </div>
          )}

          <h2
            className="font-bold leading-tight mb-8 whitespace-pre-line"
            style={{ color: ACCENT, fontSize: 'clamp(18px, 3vw, 24px)' }}
          >
            {thankYou.heading}
          </h2>

          <div className="space-y-4 text-base sm:text-[17px] leading-relaxed text-left" style={{ color: 'rgba(78,46,140,0.85)' }}>
            {thankYou.paragraphs.map((p, i) => (
              <p key={i} className="whitespace-pre-line">{p.text}</p>
            ))}
          </div>

          <div className="my-8 p-6 rounded-2xl border" style={{ backgroundColor: 'rgba(78,46,140,0.07)', borderColor: 'rgba(78,46,140,0.12)' }}>
            <p className="text-base sm:text-[17px] leading-relaxed font-semibold" style={{ color: 'rgba(78,46,140,1)' }}>
              {thankYou.highlight}
            </p>
          </div>

          <p className="text-base sm:text-[17px] leading-relaxed" style={{ color: 'rgba(78,46,140,0.85)' }}>
            {thankYou.closingParagraph}
          </p>

          <div className="mt-10 space-y-2">
            <p className="font-bold text-lg" style={{ color: ACCENT }}>{thankYou.signoff}</p>
            <p className="font-bold text-xl" style={{ color: 'rgba(78,46,140,1)' }}>{thankYou.signoffTitle}</p>
          </div>
        </div>
      </section>
    </>
  );
}
