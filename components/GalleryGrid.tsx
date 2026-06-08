'use client';

import React from 'react';
import GalleryCard from './GalleryCard';
import { useGalleryAlbums } from '@/lib/hooks/use-gallery-albums';
import { useInfiniteScroll } from '@/lib/hooks/use-infinite-scroll';
import { GALLERY_CONFIG } from '@/lib/config/gallery-config';

type GalleryState = ReturnType<typeof useGalleryAlbums>;

interface GalleryGridProps {
  externalState?: GalleryState;
}

// ── Inner UI (no data-fetching hooks) ────────────────────────────────────────
const GalleryGridInner: React.FC<GalleryState> = ({
  albums,
  loading,
  error,
  hasMore,
  autoLoadCount,
  loadMore,
  retry,
}) => {
  const sentinelRef = useInfiniteScroll({
    onLoadMore: loadMore,
    enabled: autoLoadCount < GALLERY_CONFIG.MAX_AUTO_LOADS,
    loading,
    hasMore,
    autoLoadCount,
  });

  if (loading && albums.length === 0) {
    return (
      <section className="w-full max-w-[900px] mx-auto px-4 sm:px-6 md:px-8 mt-8 sm:mt-10 md:mt-12" aria-label="Photo gallery">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
        </div>
      </section>
    );
  }

  if (error && albums.length === 0) {
    return (
      <section className="w-full max-w-[900px] mx-auto px-4 sm:px-6 md:px-8 mt-8 sm:mt-10 md:mt-12" aria-label="Photo gallery">
        <div className="text-center py-12">
          <p className="text-red-400 text-lg">{error}</p>
          <button
            onClick={retry}
            className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  if (!loading && albums.length === 0) {
    return (
      <section className="w-full max-w-[900px] mx-auto px-4 sm:px-6 md:px-8 mt-8 sm:mt-10 md:mt-12" aria-label="Photo gallery">
        <div className="text-center py-12">
          <p className="text-white text-lg">No gallery albums available yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-[900px] mx-auto px-4 sm:px-6 md:px-8 mt-8 sm:mt-10 md:mt-12" aria-label="Photo gallery">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {albums.map((album) => (
          <div key={album.id} className="w-full">
            <GalleryCard
              title={album.name}
              imageSrc={album.thumbnail_url || '/placeholder-gallery.jpg'}
              href={`/gallery/${album.slug}`}
            />
          </div>
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-px" aria-hidden="true" />

      {loading && albums.length > 0 && autoLoadCount < GALLERY_CONFIG.MAX_AUTO_LOADS && (
        <div className="flex flex-col items-center gap-3 mt-12 mb-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
          <p className="text-white/70 text-sm">Loading more albums...</p>
        </div>
      )}

      {error && albums.length > 0 && (
        <div className="text-center mt-12 mb-8">
          <p className="text-red-400 text-sm mb-3">{error}</p>
          <button
            onClick={retry}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      )}
    </section>
  );
};

// ── Self-managed wrapper (only mounts when no externalState) ──────────────────
const GalleryGridManaged: React.FC = () => {
  const state = useGalleryAlbums();
  return <GalleryGridInner {...state} />;
};

// ── Public API ────────────────────────────────────────────────────────────────
const GalleryGrid: React.FC<GalleryGridProps> = ({ externalState }) => {
  if (externalState) return <GalleryGridInner {...externalState} />;
  return <GalleryGridManaged />;
};

export default GalleryGrid;
