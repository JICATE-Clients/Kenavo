'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Heart } from 'lucide-react';

// Coral brand accent — the same colour the Reunion/Treasure pages use. The
// small filled heart marks the two "special" memory pages in the nav.
const HEART = 'rgba(217,81,100,1)';
const FavHeart = ({ size = 12 }: { size?: number }) => (
  <Heart size={size} aria-hidden className="shrink-0" style={{ color: HEART, fill: HEART }} />
);

/**
 * Sub-pages that live under the "Echoes & Memories" section. This is the one
 * place to add more memory pages later — append an item and it appears in the
 * dropdown on every breakpoint automatically.
 */
const MEMORIES_ITEMS: { label: string; href: string }[] = [
  { label: 'Rewind: The Songs We Grew Up On', href: '/echoes-and-memories/rewind' },
];

/**
 * Accessible nav dropdown. Opens on hover (pointer) and on click/Enter
 * (keyboard), closes on Escape, outside-click, or selecting an item.
 */
function MemoriesDropdown({ label, linkClassName }: { label: string; linkClassName: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`inline-flex items-center gap-1 ${linkClassName}`}
      >
        {label}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>

      {open && (
        // Positioned container sits flush under the button (top-full) with a
        // transparent pt-2 "bridge" so the mouse never crosses a dead gap on its
        // way to the menu — the visible card lives inside.
        <div className="absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-2">
          <div
            role="menu"
            className="rounded-xl border border-black/5 bg-white p-1.5 shadow-xl"
          >
            {MEMORIES_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-[13px] font-medium normal-case tracking-normal text-neutral-700 transition-colors hover:bg-[#4E2E8C]/8 hover:text-[#4E2E8C]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Renders the memories section as a dropdown so its sub-pages (e.g. "Rewind:
 * The Songs We Grew Up On") are reachable from the nav. Falls back to a plain
 * link only if the section has no sub-pages at all.
 */
function MemoriesNav({ label, linkClassName }: { label: string; linkClassName: string }) {
  if (MEMORIES_ITEMS.length === 0) {
    return (
      <Link href="/echoes-and-memories" className={linkClassName}>
        {label}
      </Link>
    );
  }
  return <MemoriesDropdown label={label} linkClassName={linkClassName} />;
}

const Header = () => {
  return (
    <header className="bg-white flex w-full flex-col text-sm text-black font-semibold leading-none px-0 py-3 sm:py-4 md:py-4 lg:py-5 sticky top-0 z-50">
      <div className="flex w-full max-w-[1400px] items-center justify-between px-3 sm:px-5 md:px-10 lg:px-16 xl:px-20 mx-auto">
        <Link href="/">
          <img
            src="https://api.builder.io/api/v1/image/assets/b95740542f8a4181a070e70dfc13758e/1786e1fe8a5eb8ea616d009a830f24f5eda8fa46?placeholderIfAbsent=true"
            alt="Kenavo Logo"
            className="aspect-[1.98] object-contain w-[120px] sm:w-[150px] md:w-[200px] lg:w-[231px] cursor-pointer transition-all"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 xl:gap-12" role="navigation" aria-label="Main navigation">
          <Link href="/about" className="hover:text-gray-600 transition-colors whitespace-nowrap text-[13px] lg:text-sm tracking-wide">
            ABOUT KENAVO
          </Link>
          <Link href="/directory" className="hover:text-gray-600 transition-colors whitespace-nowrap text-[13px] lg:text-sm tracking-wide">
            DIRECTORY
          </Link>
          <Link href="/gallery" className="hover:text-gray-600 transition-colors whitespace-nowrap text-[13px] lg:text-sm tracking-wide">
            GALLERY
          </Link>
          <Link href="/reunion-2025" className="inline-flex items-center gap-1.5 hover:text-gray-600 transition-colors whitespace-nowrap text-[13px] lg:text-sm tracking-wide">
            <FavHeart />
            REUNION &apos;25
          </Link>
          <Link href="/our-treasure" className="inline-flex items-center gap-1.5 hover:text-gray-600 transition-colors whitespace-nowrap text-[13px] lg:text-sm tracking-wide">
            <FavHeart />
            OUR TREASURE
          </Link>
          <MemoriesNav
            label={'ECHOES & MEMORIES'}
            linkClassName="hover:text-gray-600 transition-colors whitespace-nowrap text-[13px] lg:text-sm tracking-wide font-semibold"
          />
          <Link href="/contact" className="hover:text-gray-600 transition-colors whitespace-nowrap text-[13px] lg:text-sm tracking-wide">
            CONTACT
          </Link>
        </nav>

        {/* Tablet Navigation */}
        <nav className="hidden md:flex lg:hidden items-center gap-6" role="navigation" aria-label="Tablet navigation">
          <Link href="/about" className="hover:text-gray-600 transition-colors whitespace-nowrap text-xs tracking-wide">
            ABOUT
          </Link>
          <Link href="/directory" className="hover:text-gray-600 transition-colors whitespace-nowrap text-xs tracking-wide">
            DIRECTORY
          </Link>
          <Link href="/gallery" className="hover:text-gray-600 transition-colors whitespace-nowrap text-xs tracking-wide">
            GALLERY
          </Link>
          <Link href="/reunion-2025" className="inline-flex items-center gap-1 hover:text-gray-600 transition-colors whitespace-nowrap text-xs tracking-wide">
            <FavHeart size={11} />
            REUNION
          </Link>
          <Link href="/our-treasure" className="inline-flex items-center gap-1 hover:text-gray-600 transition-colors whitespace-nowrap text-xs tracking-wide">
            <FavHeart size={11} />
            TREASURE
          </Link>
          <MemoriesNav
            label="MEMORIES"
            linkClassName="hover:text-gray-600 transition-colors whitespace-nowrap text-xs tracking-wide font-semibold"
          />
          <Link href="/contact" className="hover:text-gray-600 transition-colors whitespace-nowrap text-xs tracking-wide">
            CONTACT
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
