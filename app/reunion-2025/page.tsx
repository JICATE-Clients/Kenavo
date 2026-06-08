import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Reunion 2025 | Kenavo',
  description: 'A Weekend That Turned Back Time — The KENAVO 25th Reunion, November 7–9, 2025, at Montfort School, Yercaud.',
};

export default function Reunion2025Page() {
  return (
    <div className="bg-[rgba(78,46,140,1)] flex flex-col min-h-screen overflow-x-hidden">
      <Header />

      <main className="flex-1 w-full">

        {/* ── Hero ─────────────────────────────────── */}
        <section className="w-full py-16 sm:py-20 md:py-28 px-4 sm:px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <p className="text-[rgba(217,81,100,1)] text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-4">
              Montfort School, Yercaud · November 7–9, 2025
            </p>
            <h1
              className="text-white font-bold leading-none"
              style={{ fontSize: 'clamp(40px, 7vw, 82px)' }}
            >
              REUNION<span className="text-[rgba(217,81,100,1)]">&nbsp;&apos;25</span>
            </h1>
            <div className="w-16 h-0.5 bg-[rgba(217,81,100,0.5)] mx-auto my-5 rounded-full" />
            <p className="text-white/70 text-base sm:text-xl font-light italic">
              A Weekend That Turned Back Time
            </p>
          </div>
        </section>

        {/* ── Article ──────────────────────────────── */}
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">

          <p className="text-white/40 text-center text-xs tracking-widest uppercase mb-10">
            Written by Joe Abraham &amp; Shankkar S
          </p>

          {/* Intro */}
          <div className="space-y-4 mb-14">
            <p className="text-white/90 text-base sm:text-lg leading-relaxed">
              There are reunions. And then there are moments when time folds, memories breathe again,
              and grown men rediscover the boys they once were. The KENAVO 25th Reunion, held from
              November 7th to 9th, 2025, at Mt. Pico and Montfort School in Yercaud, was undeniably the latter.
            </p>
            <p className="text-white/90 text-base sm:text-lg leading-relaxed">
              What unfolded over these three days was not merely an event—it was a homecoming of the heart,
              a much-needed reminder of the bond we all cherished a lifetime ago, and the rarest of
              opportunities to reignite what made us brothers beyond borders.
            </p>
          </div>

          {/* ── Day 1 ── */}
          <div className="mb-14">
            <div className="flex items-start gap-4 mb-6">
              <span className="text-[rgba(217,81,100,0.25)] text-6xl font-bold leading-none select-none hidden sm:block">01</span>
              <div>
                <p className="text-[rgba(217,81,100,1)] text-xs font-semibold tracking-widest uppercase mb-1">
                  Friday, November 7th
                </p>
                <h2 className="text-white text-xl sm:text-2xl font-bold">When the Boys Returned</h2>
              </div>
            </div>

            <div className="space-y-4 text-white/85 text-base leading-relaxed border-l-2 border-[rgba(217,81,100,0.25)] pl-5 sm:pl-6">
              <p>
                While we planned to start at 5 am from Kochi, none of us could sleep the previous night due
                to the excitement—Doc (Balaji, our paediatric cardiothoracic surgeon) was engulfed in both
                the excitement of the trip and the responsibility to hand over patient care. Antony J, our race
                car driver, had only one condition: his car, and he would do all the driving. Tom, Doc and I
                had no complaints—we reached Coimbatore well ahead of time for a crazy-large breakfast in Tamil Nadu.
              </p>
              <p>
                We met Tarun and Vishnu on the way, then gathered at Durai&apos;s house in Salem—showered with
                love, a sense of belonging, and the most refreshing coconut water. The Bangalore boys, James
                from Dubai, Vinod George (Jeppo) from Canada, Pinga and Hima from Mizoram were all there.
                As we met guys after a break of 25 years, hugs, high fives and sometimes tears followed.
              </p>
              <p>
                A grand lunch at Parashakthi for about 30 of us—known for its authentic biryani—set the tone.
                Then began the all-so-familiar sojourn up that beautiful road with its 20 hairpin bends and
                lush greenery. As we ascended, we could feel a lump in our throats... the nostalgia and joy was
                so overwhelming.
              </p>
              <p>
                By 2:00 pm, classmates from across states, countries and continents began arriving at the resort.
                Familiar faces—some instantly recognisable, others slightly altered by time—exchanged warm
                handshakes, hugs, surprise laughter and the occasional silent, overwhelmed pause. The committee
                had left personalised gift kits on every bed: a white travel case with souvenirs and our attire
                for each upcoming event—a thoughtful touch that set the tone for everything that followed.
              </p>
              <p>
                Tea and snacks quickly turned into an emotional avalanche. Conversations picked up exactly where
                they had paused 25 years ago—unfinished jokes completed, long-forgotten nicknames echoing across
                the lawns, stories buried under responsibilities resurfacing effortlessly.
              </p>
            </div>

            <div className="mt-8 bg-white/5 rounded-2xl p-5 sm:p-7 border border-white/10">
              <p className="text-[rgba(217,81,100,1)] text-xs font-semibold tracking-widest uppercase mb-1">Evening</p>
              <h3 className="text-white text-lg sm:text-xl font-bold mb-4">
                The Class Social — A Night Powered by Nostalgia
              </h3>
              <div className="space-y-3 text-white/85 text-base leading-relaxed">
                <p>
                  As the sun set and the familiar chill of the Shevaroy hills enveloped us, the men slipped into
                  their Kenavo sweatshirts—our unofficial uniform for the night. The Class Social, a men-only
                  gathering, was atop the open rooftop at Mount Pico, decked out to host 70+ boys.
                </p>
                <p>
                  The themed cocktail menu from the &ldquo;Monkey Business – Now on the Rocks&rdquo; poster, with names like
                  Gussale Gussa, Smokey Behind Magic Tent and the outrageously creative Varadha&apos;s Kothu Punch,
                  added humour and identity to the night. Each drink carried a story, a memory, or a bit of mischief.
                </p>
                <p>
                  The night was loud (with a live band adding to the cacophony), heartfelt and hilariously chaotic.
                  Special thanks to Srini—he missed his true calling in stand-up comedy. The night was capped with
                  the band playing backup to Subbu&apos;s dulcet tones and a large bunch of boys jumping in to sing
                  the Kenavo Song—practice for Night 2.
                </p>
              </div>
            </div>
          </div>

          {/* ── Day 2 ── */}
          <div className="mb-14">
            <div className="flex items-start gap-4 mb-6">
              <span className="text-[rgba(217,81,100,0.25)] text-6xl font-bold leading-none select-none hidden sm:block">02</span>
              <div>
                <p className="text-[rgba(217,81,100,1)] text-xs font-semibold tracking-widest uppercase mb-1">
                  Saturday, November 8th
                </p>
                <h2 className="text-white text-xl sm:text-2xl font-bold">Back to Where It All Began</h2>
              </div>
            </div>

            <div className="space-y-4 text-white/85 text-base leading-relaxed border-l-2 border-[rgba(217,81,100,0.25)] pl-5 sm:pl-6">
              <p>
                Morning came early for some, and for many it was just a continuation of the previous night.
                Sleep could wait—we had too much to say and too little time. It was as if the very air knew
                how precious and momentous this time together was; thick with nostalgia and camaraderie.
              </p>
              <p>
                After breakfast, we departed in batches by buses, gazing at the familiar sights leading to
                the Montfort entrance—replete with new arches absent in our days. We re-entered the gorgeous
                campus, drinking in the beautiful trees, lawns and buildings, each one of us secretly wishing
                it had remained exactly as we left it.
              </p>
              <p>
                At 9:20 AM, the reunion&apos;s most anticipated ritual: Kenavo boys in a specially designed white
                shirt commemorating the reunion and beige pants lined up for the walk towards the school assembly—
                and like always, decided to wear it stylishly without blazers. Like the rebel group we always were.
              </p>
            </div>

            <div className="mt-8 bg-white/5 rounded-2xl p-5 sm:p-7 border border-white/10">
              <p className="text-[rgba(217,81,100,1)] text-xs font-semibold tracking-widest uppercase mb-1">9:30 AM</p>
              <h3 className="text-white text-lg sm:text-xl font-bold mb-4">
                General Assembly — A Walk Into Yesterday
              </h3>
              <div className="space-y-3 text-white/85 text-base leading-relaxed">
                <p>
                  The assembly brought us back to our formative years. The school song echoed across the basketball
                  court. There was laughter, pride and more emotion than many expected to feel. Mr. Robert Bellarmin,
                  Mrs. Vijayalakshmi, Mr. Daniel—teachers we had invited—were seated just in front of the stage.
                </p>
                <blockquote className="border-l-2 border-[rgba(217,81,100,0.4)] pl-4 my-4 italic text-white/65 text-sm sm:text-base">
                  &ldquo;Our tender hearts with emotion are beating,<br />
                  In Blue and Gold the words we pen&rdquo;
                  <footer className="text-white/40 text-xs not-italic mt-1">— Our School Song</footer>
                </blockquote>
                <p>
                  This was followed by a touching interaction with present Montfort boys and girls. Their enthusiasm
                  to learn about the various career paths we have pursued since school reminded us of the very
                  questions that once paralysed us with the fear of the unknown.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-white/85 text-base leading-relaxed border-l-2 border-[rgba(217,81,100,0.25)] pl-5 sm:pl-6">
              <p>
                Lunch at the school grounds was every bit as nostalgic as we had hoped—a smorgasbord of veg and
                non-veg options with parathas and dessert, enjoyed alongside teachers and brothers. Cricket, football,
                basketball and table tennis were played with the same spirit we had 25 years ago, though with slightly
                slower reflexes and a lot more laughter.
              </p>
              <p>
                We walked the scouts ground, the horse stables, the junior block, the Charmettes and the famed slopes.
                Some parts of the school had improved; others were in a state of disarray—a reminder that time catches
                up with everyone, even buildings. With heavy hearts did we once again leave our school premises.
              </p>
            </div>

            <div className="mt-8 bg-white/5 rounded-2xl p-5 sm:p-7 border border-white/10">
              <p className="text-[rgba(217,81,100,1)] text-xs font-semibold tracking-widest uppercase mb-1">Evening</p>
              <h3 className="text-white text-lg sm:text-xl font-bold mb-4">
                Evening Social with Brothers &amp; Teachers
              </h3>
              <div className="space-y-3 text-white/85 text-base leading-relaxed">
                <p>
                  Dressed in Kenavo T-shirts, we gathered with the teachers and brothers who shaped us. Brother Montfort
                  made a wonderful statement: &ldquo;One of the most wonderful things your batch has achieved is bringing
                  together 6 past principals! It has never happened in the history of Montfort.&rdquo; Brother George KJ told
                  us our batch remains special in their hearts, and that the Montfortian identity in us will stay
                  till the end of our lives.
                </p>
                <p>
                  The night ended with a wholesome dinner and stories flowing freely. Some of us who had bottled emotions
                  over 25 years were able to vent them to our friends. Some drank it up, some talked and talked. And some
                  chose to dance the night away—to Michael Jackson, Bon Jovi, AR Rahman, Backstreet Boys—giving a release
                  to every pain and tribulation life had brought through our 40s.
                </p>
              </div>
            </div>
          </div>

          {/* ── Day 3 ── */}
          <div className="mb-14">
            <div className="flex items-start gap-4 mb-6">
              <span className="text-[rgba(217,81,100,0.25)] text-6xl font-bold leading-none select-none hidden sm:block">03</span>
              <div>
                <p className="text-[rgba(217,81,100,1)] text-xs font-semibold tracking-widest uppercase mb-1">
                  Sunday, November 9th
                </p>
                <h2 className="text-white text-xl sm:text-2xl font-bold">A Gentle Goodbye</h2>
              </div>
            </div>

            <div className="space-y-4 text-white/85 text-base leading-relaxed border-l-2 border-[rgba(217,81,100,0.25)] pl-5 sm:pl-6">
              <p>
                The final morning was calm and reflective. Over breakfast, conversations carried a softer tone.
                There was gratitude. There was nostalgia. There was the unspoken understanding that weekends like
                this don&apos;t come often—but when they do, they stay with us for years.
              </p>
              <p>
                Check-out was officially until 11 AM, but goodbyes lingered far longer. Most guys, while still
                smiling, did have watery eyes. Everyone made sure to say goodbye backed with a hug. No one was
                in a hurry to leave.
              </p>
              <p>
                As we drove down the hill, Doc Bala had an epiphany: why not visit R Arun, who couldn&apos;t attend?
                So we gate-crashed his place in Salem—took the reunion to him—and had a blast. We left Salem post
                lunch, speeding back to Kochi, which none of us were truly in a hurry to reach after such an
                amazing reunion.
              </p>
            </div>
          </div>

          {/* ── Heart Behind the Event ── */}
          <div className="mb-14 bg-[rgba(64,34,120,0.55)] rounded-2xl p-6 sm:p-8 border border-white/10">
            <h2 className="text-[rgba(217,81,100,1)] text-lg sm:text-xl font-bold mb-4">
              The Heart Behind the Event
            </h2>
            <p className="text-white/85 text-base leading-relaxed mb-5">
              The Core Team&apos;s months of planning—visible throughout the meticulously designed itinerary,
              dress codes, logistics and the homemade warmth of every touchpoint—made all the difference.
              From accommodation to kit bags, from school coordination to the Weekend Task Force roster,
              everything came together seamlessly. And for that, every boy who attended (and even those
              who couldn&apos;t) remains deeply grateful.
            </p>
            <blockquote className="border-l-2 border-[rgba(217,81,100,0.5)] pl-5 italic text-white/80 text-base sm:text-lg leading-relaxed">
              &ldquo;This reunion wasn&apos;t just an event. It was a reminder of who we were,
              who we&apos;ve become, and who we still are when we&apos;re together.&rdquo;
            </blockquote>
          </div>

          {/* ── Closing ── */}
          <div className="text-center space-y-4 pb-4">
            <p className="text-white/85 text-base sm:text-lg leading-relaxed">
              As we drove down from Yercaud&apos;s winding roads back into the rhythm of our everyday lives,
              one thing was certain: we had not simply revisited our past. We had reclaimed a part of ourselves.
            </p>
            <p className="text-white/85 text-base sm:text-lg leading-relaxed">
              The Kenavo 25th Reunion was more than nostalgia—it was belonging, rediscovered. A brotherhood
              reaffirmed. A promise silently renewed.
            </p>
            <div className="pt-5 space-y-1">
              <p className="text-[rgba(217,81,100,1)] font-bold text-xl">Still High. Still Fly. Still Us.</p>
              <p className="text-white font-bold text-2xl">Kenavo — Always</p>
            </div>
            <p className="text-white/30 text-xs italic pt-2">
              *Apologies from Joe — if I missed any person or event, please attribute it to my old age!
              As all of you fellas are always ever young! Cheers!*
            </p>
          </div>
        </div>

        {/* ── Thank You Note ─────────────────────────── */}
        <section className="w-full bg-[rgba(254,249,232,1)] py-16 sm:py-20 px-4 sm:px-6">
          <div className="max-w-xl mx-auto text-center">

            <div className="mb-8 flex justify-center">
              <img
                src="https://api.builder.io/api/v1/image/assets/b95740542f8a4181a070e70dfc13758e/1786e1fe8a5eb8ea616d009a830f24f5eda8fa46?placeholderIfAbsent=true"
                alt="Kenavo Logo"
                className="w-40 h-auto sm:w-52 object-contain"
              />
            </div>

            <h2
              className="font-bold text-[rgba(217,81,100,1)] leading-tight mb-8"
              style={{ fontSize: 'clamp(18px, 3vw, 24px)' }}
            >
              For Every Boy Who Showed Up<br />
              In Person, In Spirit, In Heart
            </h2>

            <div className="space-y-4 text-[rgba(78,46,140,0.85)] text-base sm:text-[17px] leading-relaxed text-left">
              <p>
                Hope everyone&apos;s feeling a little strange this morning. The kind of strange that comes after
                too much laughter, too many hugs, and not enough sleep.
              </p>
              <p>
                Our phones haven&apos;t stopped buzzing—photos, videos, voice notes, and messages that make us
                smile and go quiet at the same time. And somewhere between all that noise, it hits us—this
                weekend was something else. It wasn&apos;t just a reunion. It felt like finding a piece of
                ourselves again.
              </p>
              <p>
                We saw boys who travelled from across the world just to stand together again. We saw friends
                pick up conversations left hanging 25 years ago, like time had waited for us to return.
                We saw kindness, care, and that unmistakable Montfort spirit—the one that never really left us.
              </p>
              <p>
                There were moments of absolute madness—the noise, the teasing, the dancing that made no sense.
                And then there were those quieter bits—a hug that stayed a little longer than expected, a laugh
                that came from somewhere deep. Somewhere in between all that, it hit us… we weren&apos;t
                &ldquo;grown-ups&rdquo; for a while. Not executives, not fathers, not men figuring life out—just the same
                boys who somehow still know how to show up for each other without saying much.
              </p>
              <p>
                To every single one of you who came from across cities, countries and continents—thank you.
                For your energy, your heart, your honesty. For bringing your best selves, and for letting the
                child in you breathe again. And to those who couldn&apos;t make it—we felt you too. You were there
                in every story, every cheer, every toast.
              </p>
            </div>

            <div className="my-8 p-6 bg-[rgba(78,46,140,0.07)] rounded-2xl border border-[rgba(78,46,140,0.12)]">
              <p className="text-[rgba(78,46,140,1)] text-base sm:text-[17px] leading-relaxed font-semibold">
                We also want to say thank you for trusting us. For believing in what we were trying to build,
                for showing up with open hearts, and for helping turn a small idea into something unforgettable.
                This reunion wasn&apos;t ours alone—it belonged to all of us. Every call, every message, every
                little act of help or encouragement made it what it was.
              </p>
            </div>

            <p className="text-[rgba(78,46,140,0.85)] text-base sm:text-[17px] leading-relaxed">
              This reunion wasn&apos;t an event. It was a reminder of who we were, who we&apos;ve become, and who we
              still are when we&apos;re together. And maybe that&apos;s what Montfort really taught us all those years
              ago—that brotherhood doesn&apos;t fade; it just waits, quietly, for weekends like this to bring
              it back to life.
            </p>

            <div className="mt-10 space-y-2">
              <p className="text-[rgba(217,81,100,1)] font-bold text-lg">
                With love, gratitude and hearts full to the brim.
              </p>
              <p className="text-[rgba(78,46,140,1)] font-bold text-xl">The Core Team</p>
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
