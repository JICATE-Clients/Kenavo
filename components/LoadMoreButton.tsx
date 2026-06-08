'use client';

import React from 'react';
import { GALLERY_CONFIG } from '@/lib/config/gallery-config';

interface LoadMoreButtonProps {
  /**
   * Callback function executed when button is clicked
   */
  onLoadMore: () => void | Promise<void>;

  /**
   * Whether data is currently being loaded
   */
  loading: boolean;

  /**
   * Whether there are more items to load
   * Button is hidden when false
   */
  hasMore: boolean;

  /**
   * Current number of auto-loads that have occurred
   * Button only shows after maxAutoLoads is reached
   */
  autoLoadCount: number;

  /**
   * Maximum number of auto-loads before showing button
   * Defaults to GALLERY_CONFIG.MAX_AUTO_LOADS
   */
  maxAutoLoads?: number;

  /**
   * Total number of items available
   * Used to calculate remaining count
   */
  total?: number;

  /**
   * Number of items currently displayed
   * Used to calculate remaining count
   */
  currentCount?: number;

  /**
   * Custom text for the button
   * Defaults to "Load more"
   */
  buttonText?: string;
}

/**
 * Functional Load More button for gallery pagination
 *
 * Features:
 * - Only shows after auto-load limit reached
 * - Shows remaining item count
 * - Loading state with spinner
 * - Responsive design
 * - Accessible ARIA labels
 *
 * @example
 * ```tsx
 * <LoadMoreButton
 *   onLoadMore={loadMore}
 *   loading={loading}
 *   hasMore={hasMore}
 *   autoLoadCount={autoLoadCount}
 *   total={total}
 *   currentCount={albums.length}
 * />
 * ```
 */
const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  onLoadMore,
  loading,
  hasMore,
  autoLoadCount,
  maxAutoLoads = GALLERY_CONFIG.MAX_AUTO_LOADS,
  total,
  currentCount,
  buttonText = 'Load more',
}) => {
  // Don't show button if:
  // 1. No more items to load, OR
  // 2. Auto-loading is still active (haven't reached maxAutoLoads yet)
  if (!hasMore || autoLoadCount < maxAutoLoads) {
    return null;
  }

  // Calculate remaining items
  const remaining = total && currentCount ? total - currentCount : null;

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4">
      <button
        onClick={onLoadMore}
        disabled={loading}
        className="bg-[rgba(217,81,100,1)] flex flex-row items-center justify-center gap-2 px-6 py-2 text-sm text-white font-semibold text-center leading-none whitespace-nowrap rounded-full hover:bg-[rgba(197,61,80,1)] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md mt-6 sm:mt-8 mb-2"
        aria-label={loading ? 'Loading more items' : `Load more items${remaining ? ` (${remaining} remaining)` : ''}`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </span>
        ) : (
          buttonText
        )}
      </button>

      {/* Show remaining count if available */}
      {!loading && remaining !== null && remaining > 0 && (
        <p className="text-white/50 text-xs">
          {remaining} more {remaining === 1 ? 'item' : 'items'} available
        </p>
      )}
    </div>
  );
};

export default LoadMoreButton;
