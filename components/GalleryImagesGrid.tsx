'use client';

import React, { useState } from 'react';
import ImageLightbox from './ImageLightbox';
import { useAlbumImages } from '@/lib/hooks/use-album-images';
import { useInfiniteScroll } from '@/lib/hooks/use-infinite-scroll';
import { GALLERY_CONFIG } from '@/lib/config/gallery-config';

interface GalleryImagesGridProps {
  albumSlug: string;
  /**
   * Expose hook return values for parent component integration
   * Optional - if not provided, component manages its own state
   */
  externalState?: ReturnType<typeof useAlbumImages>;
}

const GalleryImagesGrid: React.FC<GalleryImagesGridProps> = ({
  albumSlug,
  externalState,
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Use external state if provided, otherwise use internal hook
  const internalState = useAlbumImages(albumSlug);
  const {
    images,
    loading,
    error,
    hasMore,
    total,
    autoLoadCount,
    loadMore,
    retry,
  } = externalState || internalState;

  // Setup infinite scroll sentinel
  const sentinelRef = useInfiniteScroll({
    onLoadMore: loadMore,
    enabled: autoLoadCount < GALLERY_CONFIG.MAX_AUTO_LOADS,
    loading,
    hasMore,
    autoLoadCount,
  });

  // Transform images for lightbox
  const galleryImages = images.map(img => ({
    src: img.image_url,
    alt: img.caption || `Gallery image ${img.id}`,
  }));

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => Math.min(prev + 1, galleryImages.length - 1));
  };

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleClose = () => {
    setLightboxOpen(false);
  };

  // Initial loading state (no images loaded yet)
  if (loading && galleryImages.length === 0) {
    return (
      <section className="flex flex-col items-center w-full px-4 sm:px-6 md:px-8 pb-12 lg:pb-8">
        <div className="flex justify-center items-center py-20 mt-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </section>
    );
  }

  // Error state (no images loaded)
  if (error && galleryImages.length === 0) {
    return (
      <section className="flex flex-col items-center w-full px-4 sm:px-6 md:px-8 pb-12 lg:pb-8">
        <div className="text-center py-20 mt-12">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={retry}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  // Empty state
  if (!loading && galleryImages.length === 0) {
    return (
      <section className="flex flex-col items-center w-full px-4 sm:px-6 md:px-8 pb-12 lg:pb-8">
        <div className="text-center py-20 mt-12">
          <p className="text-gray-600 text-lg">No images in this album yet.</p>
        </div>
      </section>
    );
  }

  const isVideo = (src: string) => /\.(mp4|mov|webm|avi)$/i.test(src);

  // Responsive grid - 2 columns mobile, 3 tablet, 4 desktop
  const renderGrid = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 w-full mt-8 sm:mt-12 md:mt-16 lg:mt-20">
        {galleryImages.map((image, index) => (
          <div key={index} className="w-full aspect-square">
            {isVideo(image.src) ? (
              <video
                src={image.src}
                controls
                muted
                playsInline
                className="w-full h-full object-cover rounded-lg shadow-md"
              />
            ) : (
              <img
                src={image.src}
                alt={image.alt}
                onClick={() => handleImageClick(index)}
                className="w-full h-full object-cover rounded-lg hover:opacity-80 hover:scale-105 transition-all duration-300 cursor-pointer shadow-md"
                loading="lazy"
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <section className="flex flex-col items-center w-full px-4 sm:px-6 md:px-8 lg:px-10 pb-10 sm:pb-12 lg:pb-16">
        {/* Responsive Grid */}
        {renderGrid()}

        {/* Infinite scroll sentinel - invisible trigger for auto-loading */}
        <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />

        {/* Loading indicator during auto-scroll */}
        {loading && galleryImages.length > 0 && autoLoadCount < GALLERY_CONFIG.MAX_AUTO_LOADS && (
          <div className="flex flex-col items-center gap-3 mt-10 sm:mt-12 mb-6 sm:mb-8">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-purple-600"></div>
            <p className="text-gray-600 text-sm sm:text-base">Loading more images...</p>
          </div>
        )}

        {/* End of results message */}
        {!loading && !hasMore && galleryImages.length > 0 && (
          <div className="text-center mt-10 sm:mt-12 mb-6 sm:mb-8">
            <p className="text-gray-500 text-sm sm:text-base">
              You've reached the end - All {total} images shown
            </p>
          </div>
        )}

        {/* Error message during loading more */}
        {error && galleryImages.length > 0 && (
          <div className="text-center mt-10 sm:mt-12 mb-6 sm:mb-8">
            <p className="text-red-600 text-sm sm:text-base mb-3 sm:mb-4">{error}</p>
            <button
              onClick={retry}
              className="px-6 py-3 min-h-[44px] bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors text-sm sm:text-base font-medium"
            >
              Try Again
            </button>
          </div>
        )}
      </section>

      <ImageLightbox
        images={galleryImages}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={handleClose}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </>
  );
};

export default GalleryImagesGrid;
