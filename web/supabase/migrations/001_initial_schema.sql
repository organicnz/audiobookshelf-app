-- Migration: 001_initial_schema.sql
-- Creates all 9 core tables for the Audiobookshelf web platform.

-- ============================================================
-- libraries
-- ============================================================
CREATE TABLE libraries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          text NOT NULL,
  media_type    text NOT NULL CHECK (media_type IN ('audiobook', 'podcast')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- library_items
-- ============================================================
CREATE TABLE library_items (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id       uuid NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  title            text NOT NULL,
  author           text,
  narrator         text,
  series           text,
  series_sequence  text,
  genres           text[] DEFAULT '{}',
  tags             text[] DEFAULT '{}',
  description      text,
  cover_image_path text,
  duration_seconds numeric,
  published_year   int,
  added_at         timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX library_items_library_id_idx ON library_items(library_id);
CREATE INDEX library_items_title_idx ON library_items USING gin(to_tsvector('english', title));

-- ============================================================
-- media_files
-- ============================================================
CREATE TABLE media_files (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  library_item_id  uuid NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
  storage_path     text NOT NULL,
  filename         text NOT NULL,
  mime_type        text NOT NULL,
  size_bytes       bigint,
  track_index      int DEFAULT 0,
  duration_seconds numeric,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- media_progress
-- ============================================================
CREATE TABLE media_progress (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  library_item_id  uuid NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
  episode_id       uuid,
  current_time     numeric NOT NULL DEFAULT 0,
  duration         numeric,
  progress         numeric NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 1),
  is_finished      boolean NOT NULL DEFAULT false,
  ebook_location   text,
  ebook_progress   numeric CHECK (ebook_progress >= 0 AND ebook_progress <= 1),
  last_update      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, library_item_id, episode_id)
);

CREATE INDEX media_progress_user_id_idx ON media_progress(user_id);

-- ============================================================
-- bookmarks
-- ============================================================
CREATE TABLE bookmarks (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  library_item_id  uuid NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
  time_seconds     numeric NOT NULL,
  title            text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- playlists
-- ============================================================
CREATE TABLE playlists (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- playlist_items
-- ============================================================
CREATE TABLE playlist_items (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id      uuid NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  library_item_id  uuid NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
  episode_id       uuid,
  sort_order       int NOT NULL DEFAULT 0
);

CREATE INDEX playlist_items_playlist_id_idx ON playlist_items(playlist_id, sort_order);

-- ============================================================
-- collections
-- ============================================================
CREATE TABLE collections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id  uuid NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- collection_books
-- ============================================================
CREATE TABLE collection_books (
  collection_id    uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  library_item_id  uuid NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
  PRIMARY KEY (collection_id, library_item_id)
);

-- ============================================================
-- user_preferences
-- ============================================================
CREATE TABLE user_preferences (
  user_id               uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  playback_rate         numeric NOT NULL DEFAULT 1.0,
  jump_forward_seconds  int NOT NULL DEFAULT 30,
  jump_backward_seconds int NOT NULL DEFAULT 10,
  theme                 text NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  order_by              text NOT NULL DEFAULT 'added_at',
  order_desc            boolean NOT NULL DEFAULT true,
  filter_by             text,
  collapse_series       boolean NOT NULL DEFAULT false,
  updated_at            timestamptz NOT NULL DEFAULT now()
);
