'use client';

import { useState } from 'react';
import GalleryCard from './GalleryCard';
import { GALLERY_CONFIG } from '@/lib/config/gallery-config';

interface Album {
  id: number;
  name: string;
  slug: string;
  thumbnail_url: string | null;
  display_order: number;
}

interface GalleryClientProps {
  initialAlbums: Album[];
  initialHasMore: boolean;
  initialTotal: number;
}

export default function GalleryClient({
  initialAlbums,
  initialHasMore,
  initialTotal,
}: GalleryClientProps) {
  const [albums, setAlbums]   = useState<Album[]>(initialAlbums);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [total, setTotal]     = useState(initialTotal);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(
        `/api/gallery/albums?page=${nextPage}&limit=${GALLERY_CONFIG.ITEMS_PER_PAGE}`
      );
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setAlbums(prev => [...prev, ...data.albums]);
      setHasMore(data.hasMore);
      setPage(nextPage);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to load more albums:', err);
    } finally {
      setLoading(false);
    }
  };

  const remaining = total - albums.length;

  if (albums.length === 0) {
    return (
      <section className="w-full max-w-[900px] mx-auto px-4 sm:px-6 md:px-8 mt-8 sm:mt-10 md:mt-12">
        <p className="text-white text-center py-12 text-lg">No gallery albums available yet.</p>
      </section>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <section
        className="w-full max-w-[900px] mx-auto px-4 sm:px-6 md:px-8 mt-8 sm:mt-10 md:mt-12"
        aria-label="Photo gallery"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {albums.map((album) => (
            <div key={album.id} className="w-full">
              <GalleryCard
                title={album.name}
                imageSrc={album.thumbnail_url || '/placeholder-gallery.svg'}
                href={`/gallery/${album.slug}`}
              />
            </div>
          ))}
        </div>
      </section>

      {hasMore && (
        <div className="w-full flex justify-center mb-10 sm:mb-12 md:mb-14">
          <div className="flex flex-col items-center gap-2 mt-6 sm:mt-8">
            <button
              onClick={loadMore}
              disabled={loading}
              className="bg-[rgba(217,81,100,1)] px-6 py-2 text-sm text-white font-semibold rounded-full hover:bg-[rgba(197,61,80,1)] active:scale-95 transition-all disabled:opacity-50 shadow-md"
            >
              {loading ? 'Loading…' : 'Load more'}
            </button>
            {!loading && remaining > 0 && (
              <p className="text-white/50 text-xs">
                {remaining} more {remaining === 1 ? 'item' : 'items'} available
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
