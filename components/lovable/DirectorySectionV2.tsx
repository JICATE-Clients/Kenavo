'use client';

import React from 'react';
import Link from 'next/link';

const DirectorySectionV2 = () => {
  return (
    <section
      id="directory"
      className="w-full min-h-[480px] md:h-[320px] lg:h-[350px] bg-[rgba(78,46,140,1)] relative overflow-hidden !m-0 !p-0"
      aria-labelledby="directory-heading"
      style={{ margin: 0, padding: 0 }}
    >
      {/* Mountain Background - Full Section */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Mobile Mountain */}
        <img
          src="/images/mountain-background.png"
          alt=""
          className="absolute w-full h-full object-cover object-bottom opacity-40 md:hidden"
          style={{ transform: 'scale(1.8) translateY(15%)' }}
        />
        {/* Desktop Mountain */}
        <img
          src="/images/mountain-background.png"
          alt=""
          className="hidden md:block absolute w-full h-full object-contain object-right-bottom opacity-70"
          style={{ transform: 'scale(1.2) translateX(-5%)' }}
        />
      </div>

      {/* Fade the dark base of the mountain image into the section's purple so
          it doesn't form a hard horizontal band below the content. Sits above
          the mountain (z-0) but below the content (z-10). */}
      <div className="absolute bottom-0 left-0 right-0 h-24 md:h-28 bg-gradient-to-t from-[rgba(78,46,140,1)] via-[rgba(78,46,140,0.6)] to-transparent pointer-events-none z-[1]"></div>

      {/* Main Content Grid - FILLS the frame */}
      <div className="relative z-10 h-full grid grid-cols-1 md:grid-cols-2 w-full gap-0 m-0 p-0">

        {/* LEFT SIDE - Portrait Collage with Badge */}
        <div className="relative h-[280px] md:h-full overflow-hidden m-0 p-0">
          {/* Light gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-white/5 to-transparent pointer-events-none z-5"></div>
          <div className="relative w-full h-full m-0 p-0">

            {/* Portrait 1 - Top Left */}
            <div className="absolute top-[-2%] left-[8%] md:top-[-4%] md:left-[2%] z-10">
              <img
                src="/images/profile-1.png"
                alt="Classmate 1"
                className="w-[75px] h-[75px] md:w-[140px] md:h-[140px] rounded-full object-cover border-4 border-white shadow-xl"
              />
            </div>

            {/* Portrait 2 - Top Center */}
            <div className="absolute top-[8%] left-[38%] md:top-[4%] md:left-[31%] z-10">
              <img
                src="/images/profile-2.png"
                alt="Classmate 2"
                className="w-[85px] h-[85px] md:w-[150px] md:h-[150px] rounded-full object-cover border-4 border-white shadow-xl"
              />
            </div>

            {/* Portrait 3 - Top Right (LARGEST) */}
            <div className="absolute top-[12%] left-[72%] md:top-[6%] md:left-[65%] z-10">
              <img
                src="/images/profile-3.png"
                alt="Classmate 3"
                className="w-[100px] h-[100px] md:w-[190px] md:h-[190px] rounded-full object-cover border-4 border-white shadow-xl"
              />
            </div>

            {/* Portrait 4 - Bottom Left - Half Circle Effect */}
            <div className="absolute bottom-[18%] left-[-10%] md:bottom-[10%] md:left-[-8%] z-10 w-[130px] h-[130px] md:w-[234px] md:h-[234px]">
              <img
                src="/images/profile-6.png"
                alt="Classmate 4"
                className="w-full h-full rounded-full object-contain border-15 border-white shadow-xl aspect-square"
              />
            </div>

            {/* Portrait 5 - Bottom Center */}
            <div className="absolute bottom-[-6%] left-[52%] md:bottom-[-45px] md:left-[22%] z-10">
              <img
                src="/images/profile-5.png"
                alt="Classmate 5"
                className="w-[85px] h-[85px] md:w-[168px] md:h-[168px] rounded-full object-contain border-4 border-white shadow-xl"
              />
            </div>

            {/* Portrait 6 - Bottom Right */}
            <div className="absolute bottom-[12%] left-[68%] md:bottom-[-20px] md:left-[67%] z-10 w-[110px] h-[110px] md:w-[220px] md:h-[220px]">
              <img
                src="/images/profile-4.png"
                alt="Classmate 6"
                className="w-full h-full rounded-full object-cover border-4 border-white shadow-xl aspect-square"
              />
            </div>

            {/* Badge - "CLASS OF 2000 MONTFORT" */}
            <div className="absolute top-[50%] left-[43%] md:top-[41%] md:left-[44%] z-20" style={{transform: 'translateX(-50%) rotate(-15deg)'}}>
              <div className="relative w-[75px] h-[75px] md:w-[110px] md:h-[110px]">
                {/* Starburst background */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-full h-full" suppressHydrationWarning>
                    <circle cx="100" cy="100" r="95" fill="white" />
                    <line x1="100" y1="100" x2="190" y2="100" stroke="rgba(217,81,100,1)" strokeWidth="2" />
                    <line x1="100" y1="100" x2="186.60254037844387" y2="123.47759065022574" stroke="rgba(217,81,100,1)" strokeWidth="2" />
                    <line x1="100" y1="100" x2="177.78174593052023" y2="145.04844339512095" stroke="rgba(217,81,100,1)" strokeWidth="2" />
                    <line x1="100" y1="100" x2="163.63961030678928" y2="163.63961030678928" stroke="rgba(217,81,100,1)" strokeWidth="2" />
                    <line x1="100" y1="100" x2="145.04844339512095" y2="177.78174593052023" stroke="rgba(217,81,100,1)" strokeWidth="2" />
                    <line x1="100" y1="100" x2="123.47759065022574" y2="186.60254037844387" stroke="rgba(217,81,100,1)" strokeWidth="2" />
                    <line x1="100" y1="100" x2="100" y2="190" stroke="rgba(217,81,100,1)" strokeWidth="2" />
                    <line x1="100" y1="100" x2="76.52240934977426" y2="186.60254037844387" stroke="rgba(217,81,100,1)" strokeWidth="2" />
                    <line x1="100" y1="100" x2="54.95155660487905" y2="177.78174593052023" stroke="rgba(217,81,100,1)" strokeWidth="2" />
                    <line x1="100" y1="100" x2="36.360389693210715" y2="163.63961030678928" stroke="rgba(217,81,100,1)" strokeWidth="2" />
                    <line x1="100" y1="100" x2="22.21825406947977" y2="145.04844339512095" stroke="rgba(217,81,100,1)" strokeWidth="2" />
                    <line x1="100" y1="100" x2="13.397459621556133" y2="123.47759065022574" stroke="rgba(217,81,100,1)" strokeWidth="2" />
                    <line x1="100" y1="100" x2="10" y2="100" stroke="rgba(217,81,100,1)" strokeWidth="2" />
                    <line x1="100" y1="100" x2="13.397459621556133" y2="76.52240934977426" stroke="rgba(217,81,100,1)" strokeWidth="2" />
                    <line x1="100" y1="100" x2="22.21825406947977" y2="54.95155660487905" stroke="rgba(217,81,100,1)" strokeWidth="2" />
                    <line x1="100" y1="100" x2="36.360389693210715" y2="36.360389693210715" stroke="rgba(217,81,100,1)" strokeWidth="2" />
                    <line x1="100" y1="100" x2="54.95155660487905" y2="22.21825406947977" stroke="rgba(217,81,100,1)" strokeWidth="2" />
                    <line x1="100" y1="100" x2="76.52240934977426" y2="13.397459621556133" stroke="rgba(217,81,100,1)" strokeWidth="2" />
                    <line x1="100" y1="100" x2="100" y2="10" stroke="rgba(217,81,100,1)" strokeWidth="2" />
                    <line x1="100" y1="100" x2="123.47759065022574" y2="13.397459621556133" stroke="rgba(217,81,100,1)" strokeWidth="2" />
                    <line x1="100" y1="100" x2="145.04844339512095" y2="22.21825406947977" stroke="rgba(217,81,100,1)" strokeWidth="2" />
                    <line x1="100" y1="100" x2="163.63961030678928" y2="36.360389693210715" stroke="rgba(217,81,100,1)" strokeWidth="2" />
                    <line x1="100" y1="100" x2="177.78174593052023" y2="54.95155660487905" stroke="rgba(217,81,100,1)" strokeWidth="2" />
                    <line x1="100" y1="100" x2="186.60254037844387" y2="76.52240934977426" stroke="rgba(217,81,100,1)" strokeWidth="2" />
                    <circle cx="100" cy="100" r="85" fill="white" stroke="rgba(217,81,100,1)" strokeWidth="3" />
                  </svg>
                </div>

                {/* Badge text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-[rgba(217,81,100,1)] text-[7px] md:text-[10px] font-bold tracking-wider">
                    CLASS OF
                  </div>
                  <div className="text-[rgba(217,81,100,1)] text-[24px] md:text-[38px] font-black leading-none">
                    2000
                  </div>
                  <div className="text-[rgba(217,81,100,1)] text-[6px] md:text-[9px] font-bold tracking-widest">
                    MONTFORT
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT SIDE - Text Content */}
        <div className="relative h-auto md:h-full flex items-center justify-center py-5 md:py-0">

          {/* Decorative Birds - Top Right */}
          <div className="absolute top-[8%] right-[12%] z-10 opacity-50 hidden md:block">
            <svg width="80" height="40" viewBox="0 0 80 40" fill="none">
              <path d="M10 20 Q15 15, 20 20 Q25 25, 30 20" stroke="rgba(217,81,100,0.5)" strokeWidth="2" fill="none"/>
              <path d="M50 15 Q55 10, 60 15 Q65 20, 70 15" stroke="rgba(217,81,100,0.5)" strokeWidth="2" fill="none"/>
            </svg>
          </div>

          {/* Text Content */}
          <div className="w-full px-6 md:px-8 lg:px-10 space-y-4 md:space-y-5">

            {/* Heading */}
            <h2
              id="directory-heading"
              className="text-[rgba(217,81,100,1)] font-bold leading-tight text-center md:text-left"
              style={{ fontSize: 'clamp(20px, 4vw, 42px)', lineHeight: '1.25' }}
            >
              From Yercaud to New York, here's what we're all up to now.
            </h2>

            {/* Description */}
            <p
              className="text-[rgba(254,249,232,1)] font-normal leading-relaxed text-center md:text-left"
              style={{ fontSize: 'clamp(14px, 1.6vw, 18px)', lineHeight: '1.7' }}
            >
              Browse profiles, spot familiar faces, revisit a few inside jokes.
              Whether you're checking in or catching up, this is where it all comes together.
            </p>

            {/* CTA Button */}
            <div className="flex justify-center md:justify-start pt-1 md:pt-2">
              <Link href="/directory">
                <button className="bg-white text-[rgba(78,46,140,1)] font-black text-sm md:text-base px-8 md:px-12 lg:px-16 py-2.5 md:py-3 !rounded-full hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg">
                  Browse the Directory
                </button>
              </Link>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default DirectorySectionV2;
