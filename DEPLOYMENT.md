# Deployment Guide

## Railway (recommended)

**Primary setup:** See [RAILWAY_SETUP.md](RAILWAY_SETUP.md) for full Railway deployment, database setup, and build optimization.

- Push to GitHub; Railway auto-deploys.
- Set `DATABASE_URL` (and optionally `SKIP_JSON_MIGRATION=true` after first deploy).
- Initialize sample data via `https://your-app-url/api/init` or run `npx tsx scripts/init-data.ts` locally and migrate.

---

## Other platforms

### Vercel

1. Connect repo at [vercel.com](https://vercel.com); Vercel auto-detects Next.js.
2. After deploy, initialize data: visit `https://your-app.vercel.app/api/init` or commit the `data/` folder (run `npx tsx scripts/init-data.ts` locally, then `git add data/`).
3. Optional: set Cloudinary env vars for image uploads.

**Note:** Vercel has ephemeral file system; commit `data/` or use a database for persistence.

### Netlify

1. Connect repo at [netlify.com](https://netlify.com) or use CLI: `npm run build` then `netlify deploy --prod`.
2. Build command: `npm run build`; publish directory: `.next` (or use Next.js runtime plugin).
3. Initialize data via `/api/init` or commit `data/` folder.

**Note:** Netlify also has ephemeral file system; commit `data/` or use a database.

### Self-hosted

- **Docker:** Build with `npm run build`, run with `npm start`; ensure `DATABASE_URL` is set if using PostgreSQL.
- **PM2/VPS:** `npm run build` then `pm2 start npm --name "service-crm" -- start`.

For database setup on any platform, run `npm run db:setup` once (or let Railway run it via start command). See [DATABASE.md](DATABASE.md) and [RAILWAY_SETUP.md](RAILWAY_SETUP.md).
