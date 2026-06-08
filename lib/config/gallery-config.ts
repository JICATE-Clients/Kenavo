/**
 * Gallery Configuration Constants
 * Centralized configuration for gallery pagination and infinite scroll behavior
 */

export const GALLERY_CONFIG = {
  // Number of items to load per page/batch
  ITEMS_PER_PAGE: 8,

  // Maximum number of automatic loads before showing manual Load More button
  // 0 auto-loads = No automatic loading, Load More button shows immediately
  MAX_AUTO_LOADS: 0,

  // Scroll threshold for triggering auto-load (0.0 to 1.0)
  // 0.8 means trigger when 80% scrolled to bottom
  SCROLL_THRESHOLD: 0.8,

  // Debounce delay for scroll events (milliseconds)
  DEBOUNCE_MS: 300,

  // Intersection observer root margin
  // Positive value triggers earlier, negative value triggers later
  ROOT_MARGIN: '100px',

  // Minimum threshold for intersection (0.0 to 1.0)
  // How much of the sentinel element must be visible to trigger
  INTERSECTION_THRESHOLD: 0.1,
} as const;

// TypeScript type export
export type GalleryConfig = typeof GALLERY_CONFIG;
