-- Add Google Drive folder ID to gallery albums
ALTER TABLE gallery_albums ADD COLUMN IF NOT EXISTS drive_folder_id TEXT;

-- Create the three Reunion '25 albums
INSERT INTO gallery_albums (name, slug, description, display_order, is_active)
VALUES
  ('Reunion''25 - HomeComing',    'reunion25-homecoming',    'Reunion 2025 HomeComing event photos',    1, true),
  ('Reunion''25 - Luminaries',    'reunion25-luminaries',    'Reunion 2025 Luminaries event photos',    2, true),
  ('Reunion''25 - TheBeginning',  'reunion25-thebeginning',  'Reunion 2025 TheBeginning event photos',  3, true)
ON CONFLICT (slug) DO NOTHING;
