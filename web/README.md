# Audiobookshelf Web

A web-native rebuild of the Audiobookshelf client, deployed on **Vercel** and backed by **Supabase** (Auth, PostgreSQL, Storage, Realtime).

## Stack

| Layer      | Technology                                      |
| ---------- | ----------------------------------------------- |
| Frontend   | Nuxt 3 (Vue 3) + TypeScript                     |
| Styling    | Tailwind CSS                                    |
| State      | Pinia                                           |
| Backend    | Supabase (Auth + Postgres + Storage + Realtime) |
| Deployment | Vercel (Node.js runtime)                        |
| PWA        | @vite-pwa/nuxt + Workbox                        |

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [Vercel](https://vercel.com) account (for deployment)

## Local Development

1. **Clone and install**

   ```bash
   cd web
   npm install
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env and fill in your Supabase URL and anon key
   ```

3. **Run database migrations**

   ```bash
   # Install Supabase CLI if needed: https://supabase.com/docs/guides/cli
   supabase start
   supabase db push
   ```

4. **Start the dev server**
   ```bash
   npm run dev
   # App runs at http://localhost:3000
   ```

## Vercel Deployment

### 1. Set environment variables in Vercel

In your Vercel project → **Settings → Environment Variables**, add:

| Variable                        | Value                         |
| ------------------------------- | ----------------------------- |
| `NUXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL     |
| `NUXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase public anon key |

### 2. Deploy

```bash
# Via Vercel CLI
npx vercel --prod

# Or connect your GitHub repo in the Vercel dashboard and push to main
```

The `vercel.json` in this directory configures:

- Build command: `nuxt build`
- Output directory: `.output/public`
- Service Worker headers (`Cache-Control: no-cache`, `Service-Worker-Allowed: /`)

### 3. Configure Supabase OAuth redirect URLs

In your Supabase project → **Authentication → URL Configuration**, add:

- **Site URL**: `https://your-vercel-domain.vercel.app`
- **Redirect URLs**: `https://your-vercel-domain.vercel.app/confirm`

## Database Migrations

Migrations live in `supabase/migrations/`. Apply them with:

```bash
supabase db push
```

Or run them manually in the Supabase SQL editor.

## Testing

```bash
# Unit + integration tests
npm test

# E2E tests (requires a running dev server)
npm run test:e2e

# Type checking
npm run typecheck
```

## Project Structure

```
web/
├── pages/              # Nuxt file-based routing
├── components/         # Vue components (player/, reader/, library/, etc.)
├── composables/        # Shared logic (useAuth, usePlayer, useProgress, etc.)
├── stores/             # Pinia stores
├── plugins/            # Nuxt plugins (Supabase client, PWA)
├── middleware/         # Route middleware (auth guard)
├── supabase/
│   └── migrations/     # SQL migrations
├── public/             # Static assets + PWA manifest
├── tests/              # Unit, integration, and E2E tests
├── nuxt.config.ts      # Nuxt configuration
├── vercel.json         # Vercel deployment config
└── tailwind.config.ts  # Tailwind CSS config
```
