-- Migration: 002_rls_policies.sql
-- Enables Row Level Security on all tables and adds access policies.
-- Pattern: users can only read/write their own data.

-- ============================================================
-- libraries — 4 separate policies (SELECT/INSERT/UPDATE/DELETE)
-- ============================================================
ALTER TABLE libraries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own libraries"
  ON libraries FOR SELECT
  USING (owner_user_id = auth.uid());

CREATE POLICY "Users can insert own libraries"
  ON libraries FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users can update own libraries"
  ON libraries FOR UPDATE
  USING (owner_user_id = auth.uid());

CREATE POLICY "Users can delete own libraries"
  ON libraries FOR DELETE
  USING (owner_user_id = auth.uid());

-- ============================================================
-- library_items — ALL via ownership chain through libraries
-- ============================================================
ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access items in own libraries"
  ON library_items FOR ALL
  USING (
    library_id IN (
      SELECT id FROM libraries WHERE owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    library_id IN (
      SELECT id FROM libraries WHERE owner_user_id = auth.uid()
    )
  );

-- ============================================================
-- media_files — ALL via ownership chain: media_files → library_items → libraries
-- ============================================================
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access media files in own libraries"
  ON media_files FOR ALL
  USING (
    library_item_id IN (
      SELECT li.id FROM library_items li
      JOIN libraries l ON l.id = li.library_id
      WHERE l.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    library_item_id IN (
      SELECT li.id FROM library_items li
      JOIN libraries l ON l.id = li.library_id
      WHERE l.owner_user_id = auth.uid()
    )
  );

-- ============================================================
-- media_progress — ALL via direct user_id
-- ============================================================
ALTER TABLE media_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own media progress"
  ON media_progress FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- bookmarks — ALL via direct user_id
-- ============================================================
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own bookmarks"
  ON bookmarks FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- playlists — ALL via direct user_id
-- ============================================================
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own playlists"
  ON playlists FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- playlist_items — ALL via ownership chain: playlist_items → playlists
-- ============================================================
ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access items in own playlists"
  ON playlist_items FOR ALL
  USING (
    playlist_id IN (
      SELECT id FROM playlists WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    playlist_id IN (
      SELECT id FROM playlists WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- collections — ALL via direct user_id
-- ============================================================
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own collections"
  ON collections FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- collection_books — ALL via ownership chain: collection_books → collections
-- ============================================================
ALTER TABLE collection_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access books in own collections"
  ON collection_books FOR ALL
  USING (
    collection_id IN (
      SELECT id FROM collections WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    collection_id IN (
      SELECT id FROM collections WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- user_preferences — ALL via direct user_id (PK)
-- ============================================================
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own preferences"
  ON user_preferences FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
