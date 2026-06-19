/**
 * Reunion 2025 page content model.
 *
 * The /reunion-2025 page renders entirely from a `ReunionContent` object.
 * `DEFAULT_REUNION_CONTENT` holds the canonical copy (lifted verbatim from the
 * original hardcoded page) so the page is never blank: it is used whenever there
 * is no `page_content` row in the database yet, and as the "Reset to original"
 * baseline in the admin editor.
 *
 * The shape mirrors the page's anatomy so the admin editor can present a
 * section-by-section form while the bespoke layout renders itself from data.
 */

/** A paragraph. `lead` is an accent-coloured inline prefix ("Prelude: "). */
export type Para = { text: string; lead?: string; bold?: boolean };

/** A styled blockquote. `footer` is the small attribution line below it. */
export type Quote = { text: string; footer?: string };

/**
 * A sub-block inside a day.
 *  - `card`    → boxed (white/5) panel with an optional eyebrow + heading
 *  - `section` → border-left group with a heading (no box)
 * `quoteAfter` is the paragraph index the quote renders after (default: end).
 */
export type DayBlock = {
  style: 'card' | 'section';
  eyebrow?: string;
  heading: string;
  paragraphs: Para[];
  quote?: Quote;
  quoteAfter?: number;
};

export type Day = {
  dateLabel: string; // "Friday, November 7th"
  heading: string;   // "When the Boys Returned!"
  lead: Para[];      // opening border-left paragraphs
  blocks: DayBlock[];
};

export type Tribute = {
  heading: string;
  paragraphs: Para[];
  quote: Quote;
  quoteAfter?: number;
};

export type Closing = {
  heading: string;
  paragraphs: Para[];   // text may contain \n for line breaks
  signature: string[];  // ["Still High.", "Still Fly.", "Still Us."]
  signatureTitle: string;
  ps?: string;
};

export type ThankYou = {
  logoUrl: string;
  heading: string;          // may contain \n
  paragraphs: Para[];
  highlight: string;        // the boxed emphasised paragraph
  closingParagraph: string;
  signoff: string;
  signoffTitle: string;
};

export type ReunionContent = {
  hero: { title: string; accent?: string; byline: string };
  intro: Para[];
  days: Day[];
  tribute: Tribute;
  closing: Closing;
  thankYou: ThankYou;
};

export const REUNION_SLUG = 'reunion-2025';

export const DEFAULT_REUNION_CONTENT: ReunionContent = {
  hero: {
    title: 'KENAVO 25th Reunion: A Weekend That Turned Back Time',
    accent: '25th',
    byline: 'The Three Days That Became a Lifetime Memory – Joe Abraham & Shankkar S',
  },

  intro: [
    {
      text: 'There are reunions. And then there are moments when time folds, memories breathe again, and grown men rediscover the boys they once were. The KENAVO 25th Reunion, held from November 7th to 9th, 2025, at Mt. Pico and Montfort School in Yercaud, was undeniably the latter.',
    },
    {
      text: 'What unfolded over these three days was not merely an event—it was a homecoming of the heart, a much-needed reminder of the bond that we all cherished a lifetime ago and the rarest of opportunities to reignite what made us brothers beyond borders.',
    },
  ],

  days: [
    {
      dateLabel: 'Friday, November 7th',
      heading: 'When the Boys Returned!',
      lead: [
        {
          lead: 'Prelude: ',
          text: 'While we planned to start at 5 am from Kochi, none of us (Antony, Tom, Balaji and me) could sleep the previous night due to the excitement, as for Doc (as we call our friend Balaji), he was engulfed in both the excitement of the trip and the responsibility to check on his patients and ensure that the handover was proper. Doc, being Doc, had to ensure that his patients were taken care of (being a paediatric cardiothoracic surgeon) and also kept our patience tested while we waited for him to start, till 6:45 AM, from Kochi. Antony J (Doc Anto or Anto as I like to call him), our race car driver, had only one condition for the trip - his car and he would do all the driving!. Tom, Doc, and I had no complaints, and this ensured that we reached Coimbatore well ahead of time and had a crazy-large breakfast in Tamil Nadu as a way of setting the mood for getting back to school. On our way, we met Tarun (Tarunesh) and Vishnu at a McD not too far from our spot, where we saw Tarun downing a large burger under the pretext of having missed breakfast. Our next stop was at our friend Annadurai’s (or Durai as we like to call him), and the 6 of us decided to go together in 2 cars. Anto, being Anto, floored the gas, and Vishnu, hyped by Anto’s driving, decided to follow suit, giving poor Tarun a real bout of motion sickness. A lot of us met up at our dear friend Durai’s house in Salem, where we were showered with love and a sense of belonging (and the most refreshing coconut water), which set a beautiful stage for the start of the day’s event. We got to meet the Bangalore boys (Nirmal, Vardha), the boys who joined the Bangalore boys, James (from Dubai), Vinod George [Jeppo] (Canada), Pinga, and Hima (from Mizoram). Durai’s house was being flooded with everyone who was coming into Salem (Omm, Hari, MK Deepan), and the boys were at Salem (Arun [Nandhi]). As we met guys after a break of 25 years, lot of hugs, high fives and sometimes tears followed. Everybody else who were on their way for the reuniuon, Durai ensured that his house was their first stop before all of us gathered together for our first real meal together after 2 decades and a half.',
        },
        {
          text: 'This was followed by a grand lunch organised (and paid for) by the Salem boys (Subbu and gang) for about 30 of us @ Parashakthi (the bro love had already begun and the locals were showing us a thing or two about hospitality, known for its authentic biryani (Tom’s favourite and by the end ours too) and myriad complementary non-veg offerings - the day kept getting better and better. This was a fantastic start, and we topped it off with a large group photo in front of the restaurant (after the smokes, of course!)',
        },
        {
          text: 'Then began the all so familiar sojourn we were so thorough with during our years at Monfort, starting from the serene temple at the foothills before the first hairpin bend. We then all started to make our way up that beautiful road with its 20 hairpin bends and lush greenery. As we ascended up the hills, we could feel a lump in our throats…the nostalgia and joy was so overwhelming indeed. The air gets colder as you drive higher and this bought back some core memories for me (Shankkar), as a boy traveling from Sri Lanka after summer holidays and it was always bittersweet as you’re unsure of a new year in school and all the challenges that may bring, but then you think of meeting all your mates and that uncertainty dies down and is filled with excitement for what may come. It looked like Yercaud had changed significantly since I last visited in 2001! It was bustling with loads of new shops, and the lake was no longer a lazy zone for couples in love but was packed with families trying to get a boat ride in. Modernisation and commercialisation had certainly caught up with our laid-back town of Yercaud.',
        },
        {
          lead: 'Reunion: ',
          text: 'By 2.00 pm, classmates from across states, countries and continents began arriving at the resort to catch the first item on the carefully planned itinerary.',
        },
        {
          text: 'The reception desk buzzed with excitement as familiar faces—some instantly recognisable, others slightly altered by time—exchanged warm handshakes, hugs, surprise laughter and the occasional silent, overwhelmed pause. “Come on, da, co-operate da” was heard when everyone needed to be herded for some tea. That’s when you knew you were back in school mode. It was magical to see how easily everyone slipped back into their teenage selves and began ribbing one another with abandon. There was already a sense that this weekend just would not suffice to fit all of the bottled emotions of 25 years.',
        },
        {
          text: 'You know the organisation committee Top Guns were on their game when you arrived into your villas and their on the beds sat gift kits personalised with name tags awaiting each of us a thoughtful touch that set the tone for what the committee (Puru, Ranga, Prasanna, Subbu, Abishek, Vikky, Karthi, Suraj, Charlie and many more) had envisioned: a reunion where every detail mattered. The kit comprised a white travel case which contained souvenirs and our attire for each upcoming event.',
        },
        {
          text: 'Tea and snacks were served at 4.00 pm, and this simple gathering quickly turned into an emotional avalanche. Conversations picked up exactly where they had paused 25 years ago—unfinished jokes were completed, long-forgotten nicknames echoed across the lawns and stories buried under responsibilities resurfaced effortlessly. It was hard to break away and get ready for the Class social that evening, as we wanted to be among our friends and not waste a single minute.',
        },
      ],
      blocks: [
        {
          style: 'card',
          eyebrow: 'Evening',
          heading: 'The Class Social – A Night Powered by Nostalgia',
          paragraphs: [
            {
              text: 'As the sun was setting and the familiar chill of the Shevaroy hills enveloped us, the men slipped into their Kenavo sweatshirts (fantastic colour selection for the theme - Purple, apologies Charlie if that’s a little basic), our unofficial uniform of the day. The Class Social, a men-only gathering, was a whirlwind of banter, cheering and legendary camaraderie. The gathering was atop the open space at Mount Pico’s rooftop, and it was decked out to host 70+ boys and some revelry (we had to play cool on the first night as we had an early start to school the next day)',
            },
            { text: 'The highlight?' },
            {
              text: 'The themed cocktail menu from the “Monkey Business – Now on the Rocks” poster, with names harkening back to classics like Gussale Gussa, Smokey Behind Magic Tent and the outrageously creative Varadha’s Kothu Punch, added humour and identity to the night. Each drink carried a story, a memory or a bit of mischief.',
            },
            {
              text: 'The night was loud (with a live band adding to the cacophony), heartfelt and hilariously chaotic (special thanks to Srini - he missed his true calling - Stand Up Comedy). Chats were burning like campfires in every corner of the roof, and the band were belting out some bangers. The night was capped with the band playing backup to Subbu’s dulcet tones (Ilaya Nila) and a large bunch of boys jumping in to sing the Kenavo Song (practice for night 2). Groans were heard when we were ushered back to the rooms for the school assembly the next day, but there was no denying the weekend was off to a fitting start for a milestone celebration.',
            },
          ],
        },
      ],
    },

    {
      dateLabel: 'Saturday, November 8th',
      heading: 'Back to Where It All Began',
      lead: [
        {
          text: 'Morning came early for some, and for many, it was just a continuation of the previous night (for those who didn’t sleep at all!), but sleep deprivation did nothing to dull the excitement. Sleep could wait, as we had too much to say and too little time. It was as if the very air knew how precious and momentous this time together was; it was thick with nostalgia and camaraderie.',
        },
        {
          text: 'After breakfast, we departed in batches by buses looking out at the familiar sights that led us to the Montfort entrance. We entered the school entrance (replete with new arches that were absent in our days). We (re)entered the gorgeous campus drinking with delight the beautiful trees, lawns, buildings etc. Each one of us secretly wished that our school remained exactly the way it was when we left it. However that was not to be as time takes a toll on all. We first stopped at the entrance of our gorgeous chapel—a place sacred not just in structure, but in memory. Many an important memory was etched along those beautiful stone steps.',
        },
        {
          text: 'At 9:20 AM, the reunion’s most anticipated ritual took place: Kenavo boys in a specially designed white shirt with markings commemorating the reunion and beige pants lined up for the walk towards the school assembly - and like always, decided to wear it stylishly and without blazers (like the rebel group that we always were).',
        },
        {
          text: 'The lining up itself was a throwback to the numerous times we had to form lines to do anything - sports, movies, prize night, assemblies….you name it, and we had a line for it. It has to be said that the gentlemen looked great in their attire and gave special meaning to “Montfort boys shall aye be Men”',
        },
        {
          text: 'As we walked towards the assembly and took our seats, we felt a familiar sense of unity settle quietly between us. I’m sure we all thought back to the times we had to conduct assemblies and would add a little bit of spice to wake up the sleepyheads with a cool new song, action news, or even some jokes when we could sneak them in.',
        },
      ],
      blocks: [
        {
          style: 'card',
          eyebrow: '9:30 AM',
          heading: 'General Assembly – A Walk Into Yesterday',
          quoteAfter: 0,
          quote: {
            text: 'Our tender hearts with emotion are beating,\nIn Blue and Gold the words we pen',
            footer: '— Our School Song',
          },
          paragraphs: [
            {
              text: 'From 9:30 am to 11.00 am, the assembly brought us back to our formative years. The school song—printed beautifully in the reunion booklet—echoed across the basketball court, or were we hallucinating that? The newly enclosed and converted area for assemblies was a far cooler option than the blazing, sun-soaked assemblies of our youth.',
            },
            {
              text: 'There was laughter, pride and more emotion than many expected to feel. It was amusing to see that the students sometimes had the same look that we used to have at long assemblies when our eyes glazed over the proceedings. The teachers that we had invited were all a part of the assembly and they were seated just in front of the stage. Some of our teachers who were still at the school were Mr. Robert Bellarmin, Mrs. Vijayalakshmi, Mr. Daniel. It was endearing to see that we had once sat/stood in their spots and had similar experiences. The sense of shared experiences echoing across time and space was humbling.',
            },
          ],
        },
        {
          style: 'card',
          heading: 'Interaction with Current Students',
          paragraphs: [
            { text: 'This was followed by a touching interaction with the present Montfort boys and girls.' },
            {
              text: 'Listening to them, seeing the campus through their eyes, we realised how much the world has changed—and yet how much Montfort’s core remains the same. Their enthusiasm to learn more about the various career paths we have pursued since leaving school, and questions about which stream they should follow.',
            },
            {
              text: 'These were the very questions that plagued us and sometimes paralysed us with the fear of the unknown beyond the school walls. It was good to see students still cared about their future and asked some intelligent questions about what to expect after school. We did our best to excite them with future prospects and instil a sense of calm before they jump headlong into their final school exams.',
            },
          ],
        },
        {
          style: 'section',
          heading: 'Lunch & Games at School',
          paragraphs: [
            {
              text: 'Lunch at the school grounds was every bit as nostalgic as we had hoped. There was a lot of milling around outside the refectory like the good old days when you knew something special was being cooked for lunch/dinner. The kitchen crew really brought out their A-game with a smorgasbord of veg and non-veg options with parathas and dessert to boot. We got to sit with some of our teachers and brothers as they dined and reminisced with us.',
            },
            {
              text: 'From there, it was time for games—cricket, football, basket ball, table tennis—played with the same spirit we had 25 years ago, though with slightly slower reflexes and a lot more laughter. It was great fun to guys like Omm, Abishek and Jeppo have the same moves playing basketball and the energy was awe-inspiring. A few took to the pull ups bar where we faced our harrowing skill tests which later paved way for our early body building attempts.',
            },
            {
              text: 'We had a chance to walk around campus, and the rest of the gang see the scouts ground, where the horse stables were and didn’t realize how the time flew. Some of us took a leisurely stroll across the grounds and junior block, and Balaji specifically had some choice stories to boot (my fav was Mola chasing Bala all over the junior block in his towel!). It was lovely to see some parts of the school had improved but also a little disheartening to see others in a state of disarray. It’s a reminder of time catches up with everyone, even buildings.',
            },
            {
              text: 'And the Charmettes and the famed slopes with the cow shed and the laundry area! Several memories were created here were relived in our minds. Some of us even spent All of us wanted to stay here longer and just be left to ourselves. We had to give ourselves a reality check that that we are no longer little boys studying here, but life-hardened men, but ever a Montfortian at heart. With heavy hearts did we once again leave our school premises for another evening social with our brothers and teachers at the resort venue.',
            },
          ],
        },
        {
          style: 'card',
          eyebrow: 'Evening',
          heading: 'Evening Social with Brothers & Teachers',
          paragraphs: [
            {
              text: 'By evening, dressed in Kenavo T-shirts and casual trousers, we gathered again—this time with the teachers and brothers who shaped us. Hundreds of photos were taken with our teachers and friends as we wanted this moment to last a lifetime. Brother Montfort made a wonderful statement in his speech saying that “One of the most wonderful things that our batch has achieved, is bringing together 6 past principals together!!! It has never happened in the history of Montfort, 6 past principals and the current principal, all seated together and having dinner together! Brother George KJ told us that our batch remains special in their hearts and he was sure that the Montfortian identity in us will stay with us till the end of our lives.',
            },
            {
              text: 'These interactions became some of the weekend’s most meaningful moments. Many of them still remembered names, quirks, and incidents that even we had forgotten. It also gave us a sweet reminder that our batch was indeed one of the most loved amongst the various batches of Montfort men!',
            },
            {
              text: 'The night ended with a wholesome dinner at the resort—stories flowing as easily as the a bunch of folks the night went on and did not end. Some of us who had bottled up good and bad emotions over the last 25 years, were able to vent it out to our friends, some drank it up, some talked and talked. And yet some of us …chose to dance the night away, to Michael jackson, Bon Jovi, AR Rahman, Backstreet boys etc etc… retro numbers, giving a “release” to every to every pain and tribulation we had experienced, as life catches up to our 40s. Amidst all this, we did try to sing the Kenavo song together, but man, we were so totally out of tune! We did truly enjoy the rendition of the song by Gopi and also the original version of it sung in 2000!',
            },
          ],
        },
      ],
    },

    {
      dateLabel: 'Sunday, November 9th',
      heading: 'A Gentle Goodbye',
      lead: [
        {
          text: 'To reminisce the good old days of morning mass, Suresh, Bala, Anto and I (Joe) attended mass and also took part in the reading. Doc Bala had a bit of a fan following with top students asking for his picture and details and what it would take to be a doctor like him.',
        },
        { text: 'The final morning was calm and reflective. Over breakfast, conversations carried a softer tone.' },
        { text: 'There was gratitude.' },
        { text: 'There was nostalgia.' },
        { text: 'There was the unspoken understanding that weekends like this don’t come often — but when they do, they stay with us for years.' },
        {
          text: 'Check-out was officially until 11 AM, but goodbyes lingered far longer than that. Most guys, while still smiling, did have watery eyes for sure..! Everyone made sure that we did say a goodbye to each other backed with a hug.',
        },
        { text: 'No one was in a hurry to leave.' },
        {
          text: 'As we were driving down hill Doc Bala had this epifini to which Anto, Tom and I readily agreed, to meet with R Arun- as so all of us along with Omm and Annadurai figured out were Arun’s house was and gate crashed his place. He could not attend the reunion so we took the reunion to him and had a blast! We left Salem post lunch with Arun, Omm, Annadurai, Anto, Tom and I. With Doc Anto at the helm we were finally speeding back to Kochi, which I am sure none of us were in a hurry to get back after such an amazing reunion! Thanks to everyone who made it happen!',
        },
      ],
      blocks: [],
    },
  ],

  tribute: {
    heading: 'The Heart Behind the Event – A Tribute to the Team',
    quoteAfter: 1,
    quote: {
      text: 'This reunion wasn’t just an event. It was a reminder of who we were, who we’ve become, and who we still are when we’re together.',
    },
    paragraphs: [
      { text: 'The Core Team’s heartfelt message of thanks captured what most of us felt but could not fully articulate' },
      { text: 'Thank you!', bold: true },
      {
        text: 'Their months of planning—visible throughout the meticulously designed itinerary, dress codes, logistics, and the homemade warmth of every touchpoint—made all the difference.',
      },
      {
        text: 'From accommodation to kit bags, from school coordination to the “Weekend Task Force” roster, everything came together seamlessly.',
      },
      { text: 'And for that, every boy who attended (and even those who couldn’t) remains deeply grateful.' },
    ],
  },

  closing: {
    heading: 'A Reunion That Became a Memory for Life',
    paragraphs: [
      {
        text: 'As we drove down from Yercaud’s winding roads back into the rhythm of our everyday lives, one thing was certain:',
      },
      { text: 'We had not simply revisited our past.\nWe had reclaimed a part of ourselves.' },
      {
        text: 'The Kenavo 25th Reunion was more than nostalgia—it was belonging, rediscovered.\nA brotherhood reaffirmed.\nA promise silently renewed.',
      },
    ],
    signature: ['Still High.', 'Still Fly.', 'Still Us.'],
    signatureTitle: 'Kenavo—Always',
    ps: 'PS:- Apologies from Joe - If I missed to mention any person or event in the above blog, please attribute it to my old age! As all of you fellas are always ever young! Cheers!',
  },

  thankYou: {
    logoUrl:
      'https://api.builder.io/api/v1/image/assets/b95740542f8a4181a070e70dfc13758e/1786e1fe8a5eb8ea616d009a830f24f5eda8fa46?placeholderIfAbsent=true',
    heading: 'For Every Boy Who Showed Up\nIn Person, In Spirit, In Heart',
    paragraphs: [
      {
        text: "Hope everyone's feeling a little strange this morning. The kind of strange that comes after too much laughter, too many hugs, and not enough sleep.",
      },
      {
        text: "Our phones haven't stopped buzzing—photos, videos, voice notes, and messages that make us smile and go quiet at the same time. And somewhere between all that noise, it hits us—this weekend was something else. It wasn't just a reunion. It felt like finding a piece of ourselves again.",
      },
      {
        text: 'We saw boys who travelled from across the world just to stand together again. We saw friends pick up conversations left hanging 25 years ago, like time had waited for us to return. We saw kindness, care, and that unmistakable Montfort spirit—the one that never really left us.',
      },
      {
        text: "There were moments of absolute madness—the noise, the teasing, the dancing that made no sense. And then there were those quieter bits—a hug that stayed a little longer than expected, a laugh that came from somewhere deep. Somewhere in between all that, it hit us… we weren't “grown-ups” for a while. Not executives, not fathers, not men figuring life out—just the same boys who somehow still know how to show up for each other without saying much.",
      },
      {
        text: "To every single one of you who came from across cities, countries and continents—thank you. For your energy, your heart, your honesty. For bringing your best selves, and for letting the child in you breathe again. And to those who couldn't make it—we felt you too. You were there in every story, every cheer, every toast.",
      },
    ],
    highlight:
      "We also want to say thank you for trusting us. For believing in what we were trying to build, for showing up with open hearts, and for helping turn a small idea into something unforgettable. This reunion wasn't ours alone—it belonged to all of us. Every call, every message, every little act of help or encouragement made it what it was.",
    closingParagraph:
      "This reunion wasn't an event. It was a reminder of who we were, who we've become, and who we still are when we're together. And maybe that's what Montfort really taught us all those years ago—that brotherhood doesn't fade; it just waits, quietly, for weekends like this to bring it back to life.",
    signoff: 'With love, gratitude and hearts full to the brim.',
    signoffTitle: 'The Core Team',
  },
};
