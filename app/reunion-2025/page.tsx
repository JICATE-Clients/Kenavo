import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReunionArticle from '@/components/reunion/ReunionArticle';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  DEFAULT_REUNION_CONTENT,
  REUNION_SLUG,
  type ReunionContent,
} from '@/lib/reunion-content';

// Content is admin-editable and read from the database per request, so the
// page must render dynamically rather than be statically cached at build time.
export const dynamic = 'force-dynamic';

/**
 * Load the stored content for the reunion page, falling back to the canonical
 * default whenever there is no row yet or the database is unreachable. The page
 * must never be blank, so any failure resolves to DEFAULT_REUNION_CONTENT.
 */
async function getReunionContent(): Promise<ReunionContent> {
  try {
    const { data, error } = await supabaseAdmin
      .from('page_content')
      .select('content')
      .eq('slug', REUNION_SLUG)
      .maybeSingle();

    if (error || !data?.content) return DEFAULT_REUNION_CONTENT;
    return data.content as ReunionContent;
  } catch {
    return DEFAULT_REUNION_CONTENT;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await getReunionContent();
  return {
    title: content.hero?.title || 'KENAVO 25th Reunion: A Weekend That Turned Back Time',
    description:
      'A Weekend That Turned Back Time — The KENAVO 25th Reunion, November 7–9, 2025, at Montfort School, Yercaud.',
  };
}

export default async function Reunion2025Page() {
  const content = await getReunionContent();

  return (
    <div className="bg-[rgba(78,46,140,1)] flex flex-col min-h-screen overflow-x-hidden">
      <Header />
      <main className="flex-1 w-full">
        <ReunionArticle content={content} />
      </main>
      <Footer />
    </div>
  );
}
