import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer
      className="bg-[rgba(217,81,100,1)] flex w-full flex-col items-center justify-center py-5 sm:py-6 md:py-7 lg:py-8"
      role="contentinfo"
    >
      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20">
        {/* Two-column layout: Text + Logo */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-6">
          {/* Left: Tagline */}
          <h2 className="text-[rgba(254,249,232,1)] text-[18px] sm:text-[24px] md:text-[30px] lg:text-[36px] xl:text-[42px] font-bold leading-[1.2] sm:leading-[1.25] md:leading-[1.3] text-center md:text-left md:flex-1">
            Built by the boys of Kenavo with grown-up skills and leftover nostalgia.
          </h2>

          {/* Right: Logo */}
          <div className="flex justify-center md:justify-end flex-shrink-0">
            <Image
              src="/kenavo-logo.png"
              alt="Kenavo 25 Year Reunion 2025 Logo"
              width={180}
              height={180}
              className="w-[100px] h-auto sm:w-[120px] md:w-[140px] lg:w-[160px]"
            />
          </div>
        </div>

        {/* Copyright for mobile view */}
        <div className="lg:hidden text-center mt-4 text-white/80 text-xs">
          © {new Date().getFullYear()} Kenavo. All rights reserved.
        </div>

        {/* Divider and navigation - hidden on mobile, visible on desktop */}
        <div className="hidden lg:block w-full h-px bg-white/30 mt-4 lg:mt-5" />
        <nav
          className="hidden lg:flex flex-col sm:flex-row items-center sm:items-stretch gap-3 sm:gap-4 md:gap-6 lg:gap-8 text-[10px] sm:text-xs md:text-sm text-white font-normal leading-none mt-4 lg:mt-5 justify-center md:justify-start"
          role="navigation"
          aria-label="Footer navigation"
        >
          <Link href="/about" className="hover:text-gray-200 hover:underline transition-all whitespace-nowrap">
            ABOUT KENAVO
          </Link>
          <Link href="/directory" className="hover:text-gray-200 hover:underline transition-all whitespace-nowrap">
            DIRECTORY
          </Link>
          <Link href="/gallery" className="hover:text-gray-200 hover:underline transition-all whitespace-nowrap">
            GALLERY
          </Link>
          <Link href="/contact" className="hover:text-gray-200 hover:underline transition-all whitespace-nowrap">
            CONTACT
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
