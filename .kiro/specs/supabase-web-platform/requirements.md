# Requirements Document

## Introduction

This feature migrates the Audiobookshelf client from a Nuxt 2 app that connects to a self-hosted server into a web application deployed on Vercel, backed entirely by Supabase (Auth, Database, Storage, and Realtime). The scope is limited to the browser-based web platform, including browser-based offline download capability via PWA/service worker and browser storage APIs (Cache API or IndexedDB).

**Explicitly deferred to a future phase:**

- Capacitor native builds (Android and iOS)
- Apple OAuth (Sign in with Apple)
- Data migration from a self-hosted Audiobookshelf server

## Glossary

- **App**: The Audiobookshelf web application served from Vercel and accessed in a browser.
- **Auth_Service**: The Supabase-backed authentication module responsible for user identity and session management.
- **Storage_Service**: The Supabase Storage module responsible for storing and serving audiobook, ebook, cover image, and other media assets.
- **Database_Service**: The Supabase PostgreSQL database and its client SDK, used for all structured data (libraries, items, progress, bookmarks, playlists, collections, preferences).
- **Realtime_Service**: The Supabase Realtime module used to push live updates (progress sync, library changes) to connected clients.
- **Player**: The in-browser audio playback engine responsible for streaming audiobook tracks.
- **Ebook_Reader**: The in-browser reader component supporting EPUB, PDF, MOBI, and CBZ/CBR formats.
- **Library**: A named collection of media items (audiobooks or podcasts) owned by a user.
- **Library_Item**: A single audiobook, podcast, or ebook entry within a Library, including its metadata and associated media files.
- **Media_Progress**: A record tracking a user's playback or reading position and completion status for a Library_Item or podcast episode.
- **Bookmark**: A named timestamp saved by a user within an audiobook track.
- **Playlist**: A user-created ordered list of Library_Items or podcast episodes.
- **Collection**: A named grouping of Library_Items within a Library.
- **Series**: A named grouping of Library_Items that form a sequential series.
- **Vercel**: The cloud platform used to host and serve the App.
- **Supabase**: The open-source backend-as-a-service platform providing Auth_Service, Database_Service, Storage_Service, and Realtime_Service.
- **RLS**: Row-Level Security — Supabase PostgreSQL policies that restrict data access per authenticated user.
- **JWT**: JSON Web Token issued by Auth_Service to authenticate API and database requests.
- **PWA**: Progressive Web App — a web application installable to the home screen via a browser manifest and service worker.
- **Download_Manager**: The browser-side module responsible for fetching audiobook files from Storage_Service and persisting them to browser storage for offline playback.
- **Browser_Storage**: The browser-native storage layer used for offline files, implemented via the Cache API or IndexedDB depending on file type and browser support.
- **Service_Worker**: The background script registered by the App that intercepts network requests and serves cached media files when the browser is offline.

---

## Requirements

### Requirement 1: User Authentication

**User Story:** As a user, I want to sign up, log in, and manage my session, so that my library and progress are securely tied to my account.

#### Acceptance Criteria

1. THE Auth_Service SHALL support email/password registration and login.
2. WHEN a user submits valid credentials, THE Auth_Service SHALL return a JWT and a refresh token within 3 seconds.
3. WHEN a user submits invalid credentials, THE Auth_Service SHALL return a descriptive error message without revealing whether the email or password was incorrect.
4. WHEN a JWT expires, THE Auth_Service SHALL automatically refresh the session using the stored refresh token without requiring the user to log in again.
5. IF the refresh token is invalid or expired, THEN THE Auth_Service SHALL clear the session and redirect the user to the login screen.
6. WHEN a user logs out, THE Auth_Service SHALL invalidate the current session and clear all locally stored tokens.
7. THE Auth_Service SHALL support OAuth login via Google.
8. THE Auth_Service SHALL enforce email verification before granting full account access.
9. WHILE a user session is active, THE App SHALL include the JWT in all Database_Service and Storage_Service requests.
10. WHEN a web user is authenticated, THE App SHALL persist the session in browser storage so that the user remains logged in across page refreshes.

---

### Requirement 2: Library Management

**User Story:** As a user, I want to create and manage libraries of audiobooks and podcasts, so that I can organize my media collection.

#### Acceptance Criteria

1. THE Database_Service SHALL store Library records with at minimum: id, owner_user_id, name, media_type (audiobook | podcast), created_at, updated_at.
2. WHEN a user creates a Library, THE Database_Service SHALL associate the Library with the authenticated user's id and return the created Library record within 3 seconds.
3. WHEN a user requests their libraries, THE Database_Service SHALL return only Libraries where the RLS policy grants the authenticated user read access.
4. WHEN a user updates a Library name, THE Database_Service SHALL persist the change and return the updated record.
5. WHEN a user deletes a Library, THE Database_Service SHALL cascade-delete all associated Library_Items, Media_Progress records, Bookmarks, Playlists, and Collections belonging to that Library.
6. THE Database_Service SHALL enforce RLS policies so that a user cannot read, update, or delete Libraries owned by other users.

---

### Requirement 3: Library Item Management

**User Story:** As a user, I want to add, browse, and manage audiobooks and podcasts in my library, so that I can access my media collection.

#### Acceptance Criteria

1. THE Database_Service SHALL store Library_Item records with at minimum: id, library_id, title, author, narrator, series, series_sequence, genres, tags, description, cover_image_path, duration_seconds, added_at, updated_at.
2. WHEN a user adds a Library_Item, THE Database_Service SHALL validate that the library_id belongs to the authenticated user before inserting the record.
3. WHEN a user requests Library_Items for a Library, THE Database_Service SHALL return paginated results with a configurable page size between 10 and 100 items.
4. WHEN a user applies a filter (by author, series, genre, tag, or progress status), THE Database_Service SHALL return only Library_Items matching all specified filter criteria.
5. WHEN a user applies a sort order (by title, author, added date, duration, or published year), THE Database_Service SHALL return Library_Items in the specified order.
6. WHEN a user searches within a Library, THE Database_Service SHALL return Library_Items whose title, author, narrator, series, or description contain the search term (case-insensitive).
7. WHEN a user deletes a Library_Item, THE Database_Service SHALL cascade-delete all associated Media_Progress records, Bookmarks, and Playlist entries for that item.

---

### Requirement 4: Media File Upload and Storage

**User Story:** As a user, I want to upload audiobook and ebook files to my library, so that I can stream them in the browser.

#### Acceptance Criteria

1. THE Storage_Service SHALL accept audio file uploads in MP3, M4A, M4B, OGG, FLAC, and AAC formats.
2. THE Storage_Service SHALL accept ebook file uploads in EPUB, PDF, MOBI, and CBZ/CBR formats.
3. THE Storage_Service SHALL accept cover image uploads in JPEG, PNG, and WebP formats with a maximum file size of 10 MB.
4. WHEN a user uploads a media file, THE Storage_Service SHALL store the file under a path scoped to the authenticated user's id to enforce isolation.
5. WHEN a file upload completes, THE Storage_Service SHALL return a storage path that THE App SHALL persist in the corresponding Library_Item record.
6. IF a file upload fails due to a network error, THEN THE App SHALL retry the upload up to 3 times with exponential backoff before presenting an error to the user.
7. WHEN a user deletes a Library_Item, THE Storage_Service SHALL delete all associated media files and cover images for that item.
8. THE Storage_Service SHALL enforce RLS policies so that a user cannot access files stored under another user's path.
9. WHEN a user requests a media file URL, THE Storage_Service SHALL return a signed URL valid for 1 hour for streaming.

---

### Requirement 5: Audio Playback and Streaming

**User Story:** As a user, I want to stream audiobooks in the browser with full playback controls, so that I can listen without installing anything.

#### Acceptance Criteria

1. WHEN a user initiates playback of a Library_Item, THE Player SHALL begin streaming the audio from the signed Storage_Service URL within 5 seconds on a connection of 1 Mbps or greater.
2. THE Player SHALL support playback speeds of 0.5×, 0.75×, 1×, 1.25×, 1.5×, 1.75×, and 2×.
3. THE Player SHALL support configurable jump-forward and jump-backward intervals between 5 and 60 seconds.
4. WHEN a user sets a sleep timer, THE Player SHALL pause playback after the specified duration in minutes or at the end of the current chapter.
5. WHEN a multi-track audiobook is playing and a track ends, THE Player SHALL automatically advance to the next track without user interaction.
6. WHEN a user seeks to a chapter, THE Player SHALL resume playback from the start of that chapter.
7. WHILE the App is running in the browser, THE Player SHALL use the Media Session API to expose playback controls to the browser where supported.
8. WHEN a user bookmarks a position, THE Player SHALL save a Bookmark record to THE Database_Service with the current timestamp and an optional user-supplied title.

---

### Requirement 6: Playback Progress Synchronization

**User Story:** As a user, I want my listening progress to sync across all my browser sessions in real time, so that I can switch between devices without losing my place.

#### Acceptance Criteria

1. WHEN a user's playback position changes by 10 seconds or more, THE App SHALL upsert a Media_Progress record in THE Database_Service with the current position, duration, and is_finished flag.
2. WHEN a Media_Progress record is updated, THE Realtime_Service SHALL broadcast the change to all other active sessions for the same user within 2 seconds.
3. WHEN THE App receives a real-time Media_Progress update for the currently playing item, THE Player SHALL update the displayed progress without interrupting playback.
4. WHEN THE App launches and a user is authenticated, THE App SHALL fetch the latest Media_Progress records for all Library_Items from THE Database_Service before displaying the library.

---

### Requirement 7: Ebook Reading

**User Story:** As a user, I want to read ebooks in my library using an in-browser reader, so that I can access all my media in one place.

#### Acceptance Criteria

1. WHEN a user opens an EPUB Library_Item, THE Ebook_Reader SHALL render the ebook content with configurable font size and theme (light, dark, sepia).
2. WHEN a user opens a PDF Library_Item, THE Ebook_Reader SHALL render the PDF with page navigation controls.
3. WHEN a user opens a MOBI Library_Item, THE Ebook_Reader SHALL render the converted content.
4. WHEN a user opens a CBZ or CBR Library_Item, THE Ebook_Reader SHALL display comic pages with navigation controls.
5. WHEN a user changes their reading position in THE Ebook_Reader, THE App SHALL upsert an ebook Media_Progress record in THE Database_Service with the current location and progress percentage.
6. WHEN a user reopens an ebook Library_Item, THE Ebook_Reader SHALL restore the last saved reading position from THE Database_Service.

---

### Requirement 8: Playlists and Collections

**User Story:** As a user, I want to create playlists and collections to organize and queue my media, so that I can listen to curated sequences.

#### Acceptance Criteria

1. THE Database_Service SHALL store Playlist records with at minimum: id, user_id, name, description, items (ordered list of library_item_id and optional episode_id), created_at, updated_at.
2. WHEN a user creates a Playlist, THE Database_Service SHALL associate it with the authenticated user and return the created record.
3. WHEN a user adds a Library_Item to a Playlist, THE Database_Service SHALL append the item to the playlist's ordered item list and return the updated Playlist.
4. WHEN a user reorders Playlist items, THE Database_Service SHALL persist the new order.
5. WHEN a user plays a Playlist, THE Player SHALL play items in the playlist's defined order, advancing automatically between items.
6. THE Database_Service SHALL store Collection records with at minimum: id, library_id, user_id, name, books (list of library_item_ids), created_at, updated_at.
7. WHEN a user creates a Collection, THE Database_Service SHALL validate that all referenced library_item_ids belong to the specified library_id before inserting.

---

### Requirement 9: Web Platform Deployment

**User Story:** As a user, I want to access the app from a web browser without installing anything, so that I can use it on any device.

#### Acceptance Criteria

1. THE App SHALL be deployable to Vercel as a static or server-side rendered web application.
2. WHEN a web user navigates to the App URL, THE App SHALL load and display the login screen within 3 seconds on a 10 Mbps connection.
3. THE App SHALL be fully functional in the latest stable versions of Chrome, Firefox, Safari, and Edge.
4. THE App SHALL be responsive and usable on viewport widths from 320 px to 2560 px.
5. THE App SHALL achieve a Lighthouse performance score of 75 or above on the home/library page when measured on a simulated mid-tier mobile device.
6. WHERE the browser supports PWA installation, THE App SHALL provide a web app manifest and service worker to enable home screen installation.

---

### Requirement 10: Settings and User Preferences

**User Story:** As a user, I want to configure app behavior and appearance, so that the app suits my personal preferences.

#### Acceptance Criteria

1. THE Database_Service SHALL store user preference records with at minimum: user_id, playback_rate, jump_forward_seconds, jump_backward_seconds, theme (light | dark | system), order_by, order_desc, filter_by, collapse_series, updated_at.
2. WHEN a user updates a preference, THE App SHALL persist the change to THE Database_Service within 5 seconds.
3. WHEN THE App launches and a user is authenticated, THE App SHALL load preferences from THE Database_Service and apply them before rendering the library view.
4. IF THE Database_Service is unreachable at launch, THEN THE App SHALL apply the last locally cached preferences stored in browser storage.

---

### Requirement 11: Browser-Based Offline Downloads

**User Story:** As a user, I want to download audiobook files from Supabase Storage to my browser's local storage, so that I can play them back when I am offline.

#### Acceptance Criteria

1. WHEN a user initiates a download for a Library_Item, THE Download_Manager SHALL fetch all associated audio files from THE Storage_Service and persist them to Browser_Storage using the Cache API or IndexedDB.
2. WHILE a download is in progress, THE App SHALL display the download progress as a percentage of total bytes transferred for that Library_Item.
3. IF a download is interrupted due to a network error, THEN THE Download_Manager SHALL resume the download from the last successfully persisted byte when connectivity is restored, up to 3 automatic retry attempts.
4. WHEN a download completes, THE App SHALL mark the Library_Item as available offline in THE Database_Service's local cache and update the UI to reflect the downloaded state.
5. WHEN a user initiates playback of a downloaded Library_Item and the browser is offline, THE Player SHALL stream the audio from Browser_Storage via THE Service_Worker without making requests to THE Storage_Service.
6. WHEN a user initiates playback of a downloaded Library_Item and the browser is online, THE Player SHALL prefer Browser_Storage over THE Storage_Service to avoid unnecessary network usage.
7. WHEN a user deletes a downloaded Library_Item, THE Download_Manager SHALL remove all associated audio files from Browser_Storage and update the UI to reflect the non-downloaded state.
8. THE App SHALL display the total storage space consumed by downloaded files and the estimated remaining browser storage quota available.
9. THE Download_Manager SHALL only store files under a storage key scoped to the authenticated user's id to prevent one user's downloads from being accessible to another user on the same browser.
10. WHERE the browser does not support the Cache API or IndexedDB with sufficient quota, THE App SHALL inform the user that offline downloads are unavailable on their current browser.
