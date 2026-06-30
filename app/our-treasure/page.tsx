import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OurTreasureArticle from '@/components/treasure/OurTreasureArticle';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  DEFAULT_OUR_TREASURE_CONTENT,
  OUR_TREASURE_SLUG,
  type OurTreasureContent,
} from '@/lib/treasure-content';

// Content is admin-editable and read from the database per request, so the
// page must render dynamically rather than be statically cached at build time.
export const dynamic = 'force-dynamic';

/**
 * Load the stored content for the "Our Treasure" page, falling back to the
 * canonical default whenever there is no row yet or the database is unreachable.
 * The page must never be blank, so any failure resolves to the default.
 */
async function getTreasureContent(): Promise<OurTreasureContent> {
  try {
    const { data, error } = await supabaseAdmin
      .from('page_content')
      .select('content')
      .eq('slug', OUR_TREASURE_SLUG)
      .maybeSingle();

    if (error || !data?.content) return DEFAULT_OUR_TREASURE_CONTENT;
    return data.content as OurTreasureContent;
  } catch {
    return DEFAULT_OUR_TREASURE_CONTENT;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await getTreasureContent();
  return {
    title: content.hero?.title || 'Our Treasure',
    description: content.hero?.byline || 'The moments we will always hold close.',
  };
}

export default async function OurTreasurePage() {
  const content = await getTreasureContent();

  return (
    <div className="bg-[rgba(78,46,140,1)] flex flex-col min-h-screen overflow-x-hidden">
      <Header />
      <main className="flex-1 w-full">
        <OurTreasureArticle content={content} />
      </main>
      <Footer />
    </div>
  );
}
