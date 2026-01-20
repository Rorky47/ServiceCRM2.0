# Deployment Guide

## Quick Deploy to Vercel (Recommended)

Vercel is the easiest option for Next.js apps and offers free hosting.

### Step 1: Prepare Your Code

1. **Initialize Git** (if not already done):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. **Push to GitHub**:
```bash
# Create a new repository on GitHub, then:
git remote add origin https://github.com/yourusername/your-repo.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

**Option A: Via Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings
5. Click "Deploy"

**Option B: Via Vercel CLI**
```bash
npm install -g vercel
vercel
# Follow the prompts
```

### Step 3: Initialize Data

After deployment, you have two options:

**Option A: Use API Endpoint** (temporary, resets on redeploy)
- Visit: `https://your-app.vercel.app/api/init`
- Or use: `curl https://your-app.vercel.app/api/init`

**Option B: Commit Data Folder** (persistent, recommended)
```bash
# Run locally to create data files
npx tsx scripts/init-data.ts

# Commit the data folder
git add data/
git commit -m "Add initial data"
git push
```

### Step 4: Configure Environment Variables (Optional)

If using Cloudinary for images:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. Redeploy

---

## Alternative Deployment Options

### Netlify

1. **Install Netlify CLI**:
```bash
npm install -g netlify-cli
```

2. **Build and Deploy**:
```bash
npm run build
netlify deploy --prod
```

3. **Or connect via GitHub**: Go to [netlify.com](https://netlify.com), import your repo

**Note**: Netlify also has ephemeral file system. Commit `data/` folder to git.

### Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Railway auto-detects Next.js
5. Add environment variables if needed

**Note**: Railway has persistent storage, so file writes will persist.

### Render

1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Settings:
   - Build Command: `npm run build`
   - Start Command: `npm start`
5. Deploy

### Self-Hosted (VPS/Docker)

**Using Docker**:

1. Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

2. Build and run:
```bash
docker build -t service-crm .
docker run -p 3000:3000 service-crm
```

**Using PM2** (on VPS):
```bash
# Install PM2
npm install -g pm2

# Build
npm run build

# Start with PM2
pm2 start npm --name "service-crm" -- start
pm2 save
pm2 startup
```

---

## Important Notes for All Platforms

### File System Persistence

- **Vercel/Netlify**: File writes are **ephemeral** (reset on each deployment)
  - ✅ Solution: Commit `data/` folder to git
  - ✅ Or use a database (PostgreSQL, MongoDB, etc.)

- **Railway/Render/VPS**: File writes **persist**
  - ✅ Can use JSON files as-is
  - ✅ Still recommend database for production

### Database Migration (Recommended for Production)

For production, consider migrating from JSON files to a database:

1. **PostgreSQL** (recommended):
   - Use Vercel Postgres, Supabase, or Railway Postgres
   - Update `lib/data.ts` to use database queries

2. **MongoDB**:
   - Use MongoDB Atlas (free tier available)
   - Update `lib/data.ts` to use MongoDB client

3. **SQLite** (simple alternative):
   - Works well for small deployments
   - File-based, persists on most platforms

### Environment Variables

Set these in your hosting platform's dashboard:

**Required**: None (works out of the box)

**Optional** (for Cloudinary):
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

---

## Post-Deployment Checklist

- [ ] Initialize sample data (via `/api/init` or commit `data/` folder)
- [ ] Test both sites: `/site/plumber` and `/site/electrician`
- [ ] Test admin mode: Add `?admin=true` to URLs
- [ ] Test contact form submissions
- [ ] Verify leads appear in `/admin/[slug]/leads`
- [ ] Test image uploads
- [ ] Test section reordering in admin mode
- [ ] Configure custom domain (if needed)
- [ ] Set up SSL/HTTPS (usually automatic on Vercel/Netlify)
- [ ] Monitor error logs

---

## Troubleshooting

### Data Not Persisting
- **Problem**: Changes disappear after redeploy
- **Solution**: Commit `data/` folder to git, or migrate to database

### Build Fails
- **Problem**: TypeScript or build errors
- **Solution**: Run `npm run build` locally first to catch errors

### Images Not Loading
- **Problem**: External images blocked
- **Solution**: Check `next.config.js` remotePatterns, or use Cloudinary

### API Routes Not Working
- **Problem**: 404 on `/api/*` routes
- **Solution**: Ensure you're using Next.js App Router (not Pages Router)

---

## Production Considerations

For production use, consider:

1. **Database**: Replace JSON files with PostgreSQL/MongoDB
2. **Image Hosting**: Set up Cloudinary for proper image optimization
3. **Rate Limiting**: Add rate limiting to API routes
4. **Validation**: Add input validation to forms
5. **Monitoring**: Set up error tracking (Sentry, LogRocket)
6. **Analytics**: Add analytics (Google Analytics, Plausible)
7. **Backup**: Regular backups of data
8. **Security**: Add basic security headers
9. **Performance**: Enable Next.js Image Optimization
10. **SEO**: Add proper meta tags and sitemap

---

## Quick Start Commands

```bash
# Local development
npm install
npx tsx scripts/init-data.ts
npm run dev

# Build for production
npm run build
npm start

# Deploy to Vercel
vercel

# Deploy to Netlify
netlify deploy --prod
```
