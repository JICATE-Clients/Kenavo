import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer
      className="bg-[rgba(217,81,100,1)] flex w-full flex-col items-center justify-center pt-4 sm:pt-5 md:pt-6 pb-20 lg:pb-6"
      role="contentinfo"
    >
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
        {/* Two-column layout: Text + Logo */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
          {/* Left: Tagline */}
          <h2 className="text-[rgba(254,249,232,1)] text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] font-bold leading-[1.35] text-center md:text-left md:max-w-[65%]">
            Built by the boys of Kenavo with grown-up skills and leftover nostalgia.
          </h2>

          {/* Right: Logo */}
          <div className="flex justify-center md:justify-end flex-shrink-0">
            <Image
              src="/kenavo-logo.png"
              alt="Kenavo 25 Year Reunion 2025 Logo"
              width={140}
              height={140}
              className="w-[60px] h-auto sm:w-[70px] md:w-[80px] lg:w-[90px]"
            />
          </div>
        </div>

        {/* Divider */}
        <hr className="border-0 bg-white/30 h-px w-full mt-5 md:mt-6" />

        {/* Bottom row: Navigation + Copyright */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4 md:mt-5">
          {/* Navigation Links */}
          <nav
            className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-5 md:gap-6 text-[11px] sm:text-xs text-white/90 font-medium tracking-wide"
            role="navigation"
            aria-label="Footer navigation"
          >
            <Link href="/about" className="hover:text-white hover:underline transition-all whitespace-nowrap">
              ABOUT
            </Link>
            <Link href="/directory" className="hover:text-white hover:underline transition-all whitespace-nowrap">
              DIRECTORY
            </Link>
            <Link href="/gallery" className="hover:text-white hover:underline transition-all whitespace-nowrap">
              GALLERY
            </Link>
            <Link href="/contact" className="hover:text-white hover:underline transition-all whitespace-nowrap">
              CONTACT
            </Link>
          </nav>

          {/* Copyright */}
          <div className="text-center md:text-right text-white/70 text-[10px] sm:text-xs" suppressHydrationWarning>
            © {new Date().getFullYear()} Kenavo. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
