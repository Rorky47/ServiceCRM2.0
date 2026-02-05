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

For Cloudinary image uploads:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

If not set, images will use base64 data URLs (works for MVP).

## Deployment

**Railway (recommended):** See [RAILWAY_SETUP.md](RAILWAY_SETUP.md) for setup. Railway runs `db:setup` then `npm start` on each deploy; set `DATABASE_URL` and optionally `SKIP_JSON_MIGRATION=true` after first deploy.

After deployment, initialize sample data by visiting `https://your-app-url/api/init`, or run locally: `npx tsx scripts/init-data.ts`.

