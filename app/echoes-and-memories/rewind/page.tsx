import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RewindArticle from '@/components/echoes/RewindArticle';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  DEFAULT_REWIND_CONTENT,
  REWIND_SLUG,
  type RewindContent,
} from '@/lib/rewind-content';

// Content is admin-editable and read from the database per request, so the page
// must render dynamically rather than be statically cached at build time.
export const dynamic = 'force-dynamic';

/**
 * Load the stored content for the Rewind page, falling back to the canonical
 * default whenever there is no row yet or the database is unreachable. The page
 * must never be blank, so any failure resolves to DEFAULT_REWIND_CONTENT.
 */
async function getRewindContent(): Promise<RewindContent> {
  try {
    const { data, error } = await supabaseAdmin
      .from('page_content')
      .select('content')
      .eq('slug', REWIND_SLUG)
      .maybeSingle();

    if (error || !data?.content) return DEFAULT_REWIND_CONTENT;
    return data.content as RewindContent;
  } catch {
    return DEFAULT_REWIND_CONTENT;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await getRewindContent();
  return {
    title: content.hero?.title || 'Rewind: The Songs We Grew Up On',
    description:
      'Echoes & Memories — Rewind: the shared playlist of songs that scored our years.',
  };
}

export default async function RewindPage() {
  const content = await getRewindContent();

  return (
    <div className="bg-[rgba(78,46,140,1)] flex flex-col min-h-screen overflow-x-hidden">
      <Header />
      <main className="flex-1 w-full">
        <RewindArticle content={content} />
      </main>
      <Footer />
    </div>
  );
}
