-- Migration: Create page_content table
-- Description: Stores admin-editable content for marketing/long-form pages as
-- JSON keyed by slug (e.g. 'reunion-2025'). The app keeps a canonical default
-- in code (lib/reunion-content.ts); a row here overrides it once an admin saves.

CREATE TABLE IF NOT EXISTS page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_content_slug ON page_content(slug);

-- Enable Row Level Security
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Service role has full access (admin API routes use the service key)
DROP POLICY IF EXISTS "Service role has full access" ON page_content;
CREATE POLICY "Service role has full access" ON page_content
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policy: Public can read page content (public pages render it)
DROP POLICY IF EXISTS "Public can read page content" ON page_content;
CREATE POLICY "Public can read page content" ON page_content
  FOR SELECT
  USING (true);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_page_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_page_content_updated_at ON page_content;
CREATE TRIGGER trigger_update_page_content_updated_at
  BEFORE UPDATE ON page_content
  FOR EACH ROW
  EXECUTE FUNCTION update_page_content_updated_at();

-- Documentation
COMMENT ON TABLE page_content IS 'Admin-editable JSON content for long-form pages, keyed by slug';
COMMENT ON COLUMN page_content.slug IS 'Page identifier, e.g. reunion-2025';
COMMENT ON COLUMN page_content.content IS 'Structured page content (see lib/reunion-content.ts ReunionContent)';
