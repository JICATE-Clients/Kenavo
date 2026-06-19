-- Migration: Allow video uploads in the gallery-images bucket
-- Purpose: The bucket was originally restricted to images at 5MB (migration 011).
--          Gallery now supports videos (manual upload + Google Drive sync), so the
--          bucket must permit video MIME types and a larger file size limit.
-- Date: 2026-06-18

-- ==============================================
-- UPDATE gallery-images BUCKET LIMITS
-- ==============================================

UPDATE storage.buckets
SET
  file_size_limit = 52428800,  -- 50MB (covers videos; large videos should use Drive sync)
  allowed_mime_types = ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'
  ]
WHERE id = 'gallery-images';

-- ==============================================
-- MIGRATION COMPLETE
-- ==============================================
-- Summary:
-- ✅ Raised gallery-images file size limit from 5MB to 50MB
-- ✅ Added video MIME types: MP4, MOV (quicktime), WebM, AVI (x-msvideo)
-- Note: Manual uploads of very large videos may still hit the hosting request-body
--       limit (e.g. Vercel ~4.5MB). Use the Drive folder + Sync flow for large videos.
