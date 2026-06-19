'use client';

import React, { useEffect, useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxItem {
  src: string;
  alt: string;
  kind?: 'image' | 'drive-video' | 'video';
  embedSrc?: string;
}

interface ImageLightboxProps {
  images: LightboxItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrevious,
}) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px) to trigger navigation
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < images.length - 1) {
      onNext();
    }
    if (isRightSwipe && currentIndex > 0) {
      onPrevious();
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrevious();
      if (e.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrevious]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentImage = images[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 z-[101] p-2 sm:p-2.5 md:p-3 min-h-[44px] min-w-[44px] rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
        aria-label="Close lightbox"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
      </button>

      {/* Image Counter */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 md:top-6 md:left-6 z-[101] bg-white/10 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full">
        <span className="text-white text-xs sm:text-sm md:text-base font-medium">
          {currentIndex + 1} / {images.length}
        </span>
      </div>

      {/* Previous Button - Hidden on mobile, visible on tablet+ */}
      {hasPrevious && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          className="hidden sm:flex absolute left-3 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-[101] p-2 sm:p-3 md:p-4 min-h-[44px] min-w-[44px] rounded-full bg-white/10 hover:bg-white/20 transition-colors items-center justify-center"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
        </button>
      )}

      {/* Next Button - Hidden on mobile, visible on tablet+ */}
      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="hidden sm:flex absolute right-3 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-[101] p-2 sm:p-3 md:p-4 min-h-[44px] min-w-[44px] rounded-full bg-white/10 hover:bg-white/20 transition-colors items-center justify-center"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
        </button>
      )}

      {/* Image Container */}
      <div
        ref={imageContainerRef}
        className="relative w-full h-full flex items-center justify-center p-4 sm:p-6 md:p-10 lg:p-12"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {currentImage.kind === 'drive-video' ? (
          <iframe
            key={currentImage.embedSrc}
            src={currentImage.embedSrc}
            allow="autoplay; fullscreen"
            allowFullScreen
            title={currentImage.alt}
            className="w-full max-w-5xl aspect-video rounded-lg shadow-2xl border-0 bg-black"
          />
        ) : currentImage.kind === 'video' ? (
          <video
            key={currentImage.embedSrc}
            src={currentImage.embedSrc}
            controls
            autoPlay
            playsInline
            className="max-w-full max-h-full rounded-lg shadow-2xl bg-black"
          />
        ) : (
          <img
            src={currentImage.src}
            alt={currentImage.alt}
            className="max-w-full max-h-full object-contain rounded-lg select-none shadow-2xl"
            loading="eager"
            draggable={false}
          />
        )}
      </div>

      {/* Swipe Instructions (Mobile Only) */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-[101] bg-white/10 backdrop-blur-sm px-4 py-2 sm:px-5 sm:py-2.5 rounded-full sm:hidden">
        <span className="text-white text-xs sm:text-sm">Swipe left/right to navigate</span>
      </div>

      {/* Keyboard Instructions (Desktop Only) */}
      <div className="hidden lg:block absolute bottom-4 left-1/2 -translate-x-1/2 z-[101] bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full">
        <span className="text-white text-sm">Use arrow keys or click arrows to navigate</span>
      </div>
    </div>
  );
};

export default ImageLightbox;
