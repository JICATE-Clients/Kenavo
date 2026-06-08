import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GalleryClient from '@/components/GalleryClient';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { GALLERY_CONFIG } from '@/lib/config/gallery-config';

export default async function GalleryPage() {
  const limit = GALLERY_CONFIG.ITEMS_PER_PAGE;

  // Fetch directly from Supabase on the server — no API roundtrip, no client spinner
  const { data, count } = await supabaseAdmin
    .from('gallery_albums')
    .select('id, name, slug, thumbnail_url, display_order', { count: 'exact' })
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .range(0, limit - 1);

  const albums  = data ?? [];
  const total   = count ?? 0;
  const hasMore = total > albums.length;

  return (
    <div className="bg-[rgba(78,46,140,1)] flex flex-col overflow-hidden items-center min-h-screen">
      <Header />

      <main className="flex flex-col items-center w-full px-4 sm:px-6 lg:px-8">
        <section className="w-full max-w-[1000px] mt-8 sm:mt-10 md:mt-12">
          <h1
            className="text-[rgba(217,81,100,1)] font-bold leading-[1.15] text-center"
            style={{ fontSize: 'clamp(24px, 4vw, 42px)' }}
          >
            Photo Gallery
          </h1>
          <p className="text-white text-[14px] sm:text-[15px] md:text-[17px] lg:text-[18px] mt-3 sm:mt-4 md:mt-5 text-center leading-[1.5]">
            School days. Reunions. Everything in between.
          </p>
        </section>

        <GalleryClient
          initialAlbums={albums}
          initialHasMore={hasMore}
          initialTotal={total}
        />
      </main>

      <Footer />
    </div>
  );
}
