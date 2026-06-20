'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Image, Mail, Plus, Info, Star, Music, X, ChevronDown } from 'lucide-react';

const MobileBottomNav = () => {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);
  // "Echoes & Memories" is a collapsible parent (mirrors the desktop dropdown):
  // collapsed by default, tapping it reveals its sub-pages — it never navigates
  // on its own, so it can't hit the non-existent /echoes-and-memories page (404).
  const [showMemories, setShowMemories] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/directory', icon: Users, label: 'Directory' },
    { href: '/gallery', icon: Image, label: 'Gallery' },
    { href: '/contact', icon: Mail, label: 'Contact' },
  ];

  const isActive = (href: string) => {
    if (!isMounted) return false;
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // This floating bar + FAB are the PUBLIC site's navigation. The admin panel
  // ships its own chrome (AdminShell's sidebar + topbar hamburger), so the
  // public nav must never bleed into it — otherwise mobile admins see website
  // links (Home/Directory/…) layered over the dashboard.
  const onAdminPanel = pathname.startsWith('/admin-panel');

  // Don't render navigation during SSR to prevent hydration mismatch,
  // and never render it inside the admin panel.
  if (!isMounted || onAdminPanel) {
    return null;
  }

  return (
    <>
      {/* Main Navigation Container - 4 Navigation Items */}
      <nav
        className="fixed bottom-2 left-3 right-14 bg-gradient-to-r from-[rgba(78,46,140,0.9)] to-[rgba(108,66,160,0.85)] backdrop-blur-xl border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.25)] rounded-full lg:hidden z-50"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around h-9 px-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center transition-all duration-300 ease-out active:scale-95"
              >
                {/* Active: Horizontal Pill (Icon + Label) | Inactive: Just Icon */}
                {active ? (
                  <div className="flex flex-row items-center justify-center gap-1 px-2 py-1 rounded-xl bg-[rgba(50,30,90,0.8)] backdrop-blur-md shadow-md border border-white/15 transition-all duration-300">
                    <Icon size={14} strokeWidth={2.5} className="text-white transition-all duration-300" />
                    <span className="text-[10px] font-semibold text-white whitespace-nowrap">
                      {item.label}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-0.5">
                    <Icon
                      size={14}
                      strokeWidth={2}
                      className="text-white/70 hover:text-white/90 transition-all duration-300"
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Separate Plus Button Container */}
      <div className="fixed bottom-2 right-3 lg:hidden z-50">
        <button
          onClick={() => {
            const next = !showMenu;
            setShowMenu(next);
            if (!next) setShowMemories(false);
          }}
          className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[rgba(217,81,100,1)] to-[rgba(217,81,100,0.85)] shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 border border-white/20"
          aria-label="More options"
        >
          {showMenu ? (
            <X size={12} strokeWidth={2.5} className="text-white" />
          ) : (
            <Plus size={12} strokeWidth={2.5} className="text-white" />
          )}
        </button>
      </div>

      {/* FAB Menu - Bottom Sheet */}
      {showMenu && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          onClick={() => setShowMenu(false)}
        >
          <div
            className="absolute bottom-12 right-3 bg-[rgba(78,46,140,0.98)] backdrop-blur-lg rounded-xl shadow-xl border border-white/15 overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col p-1.5 min-w-[180px]">
              <Link
                href="/about"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/10 rounded-lg transition-all duration-200 active:scale-95"
              >
                <Info size={14} className="text-white/90" />
                <span className="text-xs font-medium text-white">About</span>
              </Link>
              <Link
                href="/reunion-2025"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/10 rounded-lg transition-all duration-200 active:scale-95"
              >
                <Star size={14} className="text-white/90" />
                <span className="text-xs font-medium text-white">Reunion &apos;25</span>
              </Link>

              {/* Echoes & Memories — collapsible section parent (mirrors the
                  desktop dropdown). Tapping toggles its sub-pages; it never
                  navigates itself. Add more sub-pages inside as the section grows. */}
              <button
                type="button"
                onClick={() => setShowMemories((o) => !o)}
                aria-expanded={showMemories}
                className="mt-0.5 flex w-full items-center gap-2.5 px-3 py-2.5 hover:bg-white/10 rounded-lg transition-all duration-200 active:scale-95"
              >
                <Music size={14} className="text-white/90" />
                <span className="flex-1 text-left text-xs font-medium text-white">Echoes &amp; Memories</span>
                <ChevronDown
                  size={14}
                  className={`text-white/70 transition-transform duration-200 ${showMemories ? 'rotate-180' : ''}`}
                />
              </button>
              {showMemories && (
                <Link
                  href="/echoes-and-memories/rewind"
                  onClick={() => setShowMenu(false)}
                  className="ml-6 flex items-center gap-2.5 border-l border-white/15 px-3 py-2.5 hover:bg-white/10 rounded-lg transition-all duration-200 active:scale-95 animate-in fade-in slide-in-from-top-1 duration-200"
                >
                  <span className="text-xs font-medium text-white">Rewind: The Songs We Grew Up On</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileBottomNav;
