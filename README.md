# Service CRM - Multi-Site Website Builder MVP

A fast MVP for building and managing multiple service business websites from a single Next.js codebase.

## Features

- ✅ JSON-driven pages
- ✅ Admin edit mode (`?admin=true`)
- ✅ Editable text and images
- ✅ Contact form → leads inbox
- ✅ Section reordering (drag & drop)
- ✅ Multi-site support

## Setup

1. Install dependencies:
```bash
npm install
```

2. Initialize sample data (choose one):
   - **With database:** Visit `https://your-app-url/api/init` after deploy, or run `npm run db:setup` then `npm run dev` locally with `DATABASE_URL` set.
   - **Local JSON only:** `npx tsx scripts/init-data.ts`

3. Run development server:
```bash
npm run dev
```

4. Visit:
- Plumber site: http://localhost:3000/site/plumber
- Electrician site: http://localhost:3000/site/electrician
- Admin mode: Add `?admin=true` to any URL

## Environment Variables (Optional)

**API key (mutations):** Set `API_KEY` in your environment. Requests to `POST /api/pages`, `DELETE /api/pages`, and `POST /api/sites` must include header `x-api-key: <API_KEY>`. If `API_KEY` is not set, those endpoints return 503 (API key not configured). The contact form (`POST /api/leads`) remains public.

**Cloudinary image uploads:**
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

If not set, images will use base64 data URLs (works for MVP).

## Google / Facebook integration (custom domains)

When you DNS-route your domain to the app, the site uses the **public** (custom) URL for SEO and sharing:

- **Canonical URL and Open Graph** – If you set a primary domain in Admin → Settings → Domains, canonical and `og:url` use that domain so Google and Facebook see your brand URL.
- **Analytics** – In Admin → Settings → **Analytics**, enter your Google Analytics 4 ID (e.g. `G-XXXXXXXXXX`), Google Tag Manager ID (e.g. `GTM-XXXXXXX`), and/or Facebook Pixel ID. Scripts are injected automatically; no need to paste snippets in custom head code. Clear the field and save to disable a provider.
- **SEO & verification** – In Admin → Settings → **SEO** you can set a social share image (OG image), Google Site Verification meta (from Search Console), and Facebook App ID for domain verification and link previews.

## Deployment

**Railway (recommended):** See [RAILWAY_SETUP.md](RAILWAY_SETUP.md) for setup. Railway runs `db:setup` then `npm start` on each deploy; set `DATABASE_URL` and optionally `SKIP_JSON_MIGRATION=true` after first deploy.

After deployment, initialize sample data by visiting `https://your-app-url/api/init`, or run locally: `npx tsx scripts/init-data.ts`.

