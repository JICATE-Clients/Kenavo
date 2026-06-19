'use client';

import React, { useState } from 'react';
import {
  List,
  Upload,
  UserPlus,
  Image as ImageIcon,
  Mail,
  Users,
  Sparkles,
  ShieldCheck,
  FileText,
  Music,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react';

/** Brand anchor — kept deliberately as a single flat purple, no gradients. */
const PURPLE = '#4E2E8C';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/**
 * Grouping encodes real structure: the admin's job splits into managing
 * alumni records, the public-facing community surfaces, who can sign in, and
 * the AI knowledge base. The labels are signposts, not decoration.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Records',
    items: [
      { id: 'manage', label: 'Profiles', icon: List },
      { id: 'single', label: 'Create', icon: UserPlus },
      { id: 'bulkUpdate', label: 'Import', icon: Upload },
    ],
  },
  {
    label: 'Community',
    items: [
      { id: 'gallery', label: 'Gallery', icon: ImageIcon },
      { id: 'contact', label: 'Messages', icon: Mail },
    ],
  },
  {
    label: 'Content',
    items: [
      { id: 'reunion', label: 'Reunion Page', icon: FileText },
      { id: 'rewind', label: 'Rewind Songs', icon: Music },
    ],
  },
  {
    label: 'Access',
    items: [
      { id: 'users', label: 'Users', icon: Users },
      { id: 'auth-accounts', label: 'Logins', icon: ShieldCheck },
    ],
  },
  {
    label: 'Knowledge',
    items: [{ id: 'ai-documents', label: 'AI Docs', icon: Sparkles }],
  },
];

function currentLabel(activeTab: string): string {
  for (const group of NAV_GROUPS) {
    const found = group.items.find((i) => i.id === activeTab);
    if (found) return found.label;
  }
  return 'Admin';
}

interface AdminShellProps {
  activeTab: string;
  onTabChange: (id: string) => void;
  onLogout: () => void;
  loggingOut: boolean;
  children: React.ReactNode;
}

export default function AdminShell({
  activeTab,
  onTabChange,
  onLogout,
  loggingOut,
  children,
}: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (id: string) => {
    onTabChange(id);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f6f5fb] text-neutral-800">
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-neutral-900/40 lg:hidden"
        />
      )}

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-neutral-200 bg-white transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 motion-reduce:transition-none ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Brand */}
          <div className="flex h-16 items-center gap-3 border-b border-neutral-200 px-5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg text-base font-bold text-white"
              style={{ backgroundColor: PURPLE }}
            >
              K
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-neutral-900">Kenavo</div>
              <div className="text-xs text-neutral-500">Admin</div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
              className="ml-auto rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="mb-5 last:mb-0">
                <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  {group.label}
                </div>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = activeTab === item.id;
                    const Icon = item.icon;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => handleNav(item.id)}
                          aria-current={active ? 'page' : undefined}
                          className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4E2E8C]/40 ${
                            active
                              ? 'font-semibold text-[#4E2E8C]'
                              : 'font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                          }`}
                          style={active ? { backgroundColor: 'rgba(78,46,140,0.08)' } : undefined}
                        >
                          {active && (
                            <span
                              aria-hidden
                              className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full"
                              style={{ backgroundColor: PURPLE }}
                            />
                          )}
                          <Icon size={18} className="shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-neutral-200 bg-white px-4 sm:px-6">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="rounded-md p-2 text-neutral-600 hover:bg-neutral-100 lg:hidden"
            >
              <Menu size={20} />
            </button>

            <h1 className="text-base font-semibold text-neutral-900">
              {currentLabel(activeTab)}
            </h1>

            <button
              onClick={onLogout}
              disabled={loggingOut}
              className="ml-auto inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3.5 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-50 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4E2E8C]/40"
            >
              <LogOut size={16} />
              <span>{loggingOut ? 'Signing out…' : 'Sign out'}</span>
            </button>
          </header>

          {/* Content */}
          <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-screen-2xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
