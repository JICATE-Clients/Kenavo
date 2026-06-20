import React from 'react';

const AboutSection = () => {
  return (
    <section
      id="about"
      className="relative w-full bg-[rgba(78,46,140,1)] py-8 sm:py-10 md:py-12 lg:py-14"
      aria-labelledby="about-heading"
    >
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 sm:gap-6 md:gap-8 lg:gap-10 items-center">
          {/* Image Column */}
          <div className="md:col-span-2 flex justify-center md:justify-start">
            <img
              src="https://api.builder.io/api/v1/image/assets/b95740542f8a4181a070e70dfc13758e/b07c93a4fb548cd640b788c38cbfe06311634054?placeholderIfAbsent=true"
              alt="Class photo"
              className="w-full max-w-[180px] sm:max-w-[220px] md:max-w-[260px] lg:max-w-[300px] aspect-square object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Text Column */}
          <div className="md:col-span-3 text-center md:text-left space-y-3 sm:space-y-4">
            <h1
              id="about-heading"
              className="text-[rgba(217,81,100,1)] font-bold leading-tight"
              style={{ fontSize: 'clamp(24px, 3.5vw, 48px)', lineHeight: '1.15' }}
            >
              151 Boys.
              <br />
              One shared story.
            </h1>
            <p
              className="text-[rgba(254,249,232,1)] font-bold leading-snug"
              style={{ fontSize: 'clamp(16px, 2vw, 22px)', lineHeight: '1.4' }}
            >
              This isn't just a website.
              <br />
              It's a memory you can scroll.
            </p>
          </div>
        </div>

        {/* Bottom Description */}
        <p
          className="text-[rgba(254,249,232,1)] font-normal text-center mt-6 sm:mt-8 md:mt-10 lg:mt-12 leading-relaxed max-w-4xl mx-auto"
          style={{ fontSize: 'clamp(14px, 1.5vw, 18px)', lineHeight: '1.5' }}
        >
          A space for the Montfort Class of 2000 to reconnect, remember, and maybe
          laugh at those old photos. This is where we all meet again with our
          stories, our nicknames, and maybe a better haircut.
        </p>
      </div>
    </section>
  );
};

export default AboutSection;
