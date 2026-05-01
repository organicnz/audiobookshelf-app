-- Migration: 003_storage.sql
-- Creates Supabase Storage buckets and RLS policies for media and cover files.

-- ============================================================
-- Storage buckets
-- ============================================================

-- Private bucket for audio, ebook, and cover source files.
-- Access is controlled entirely by RLS policies below.
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', false);

-- Public bucket for cover images served directly to browsers.
-- Reads are open to all; writes are restricted to the owning user.
INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true);

-- ============================================================
-- RLS policies for the `media` bucket (private)
-- Path convention: {user_id}/{library_item_id}/...
-- All operations are restricted to the authenticated user's own prefix.
-- ============================================================

CREATE POLICY "media: authenticated users can read own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "media: authenticated users can upload own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "media: authenticated users can update own files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "media: authenticated users can delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- RLS policies for the `covers` bucket (public reads)
-- Path convention: {user_id}/{library_item_id}/cover.jpg
-- Reads are public; writes are restricted to the owning user.
-- ============================================================

CREATE POLICY "covers: public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'covers');

CREATE POLICY "covers: authenticated users can upload own covers"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'covers'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "covers: authenticated users can update own covers"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'covers'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "covers: authenticated users can delete own covers"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'covers'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
