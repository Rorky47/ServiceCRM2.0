# Railway Deployment - Automatic Database Setup

## 🚀 Quick Setup

The database setup now runs **automatically on every deploy**! No manual steps needed.

### Steps:

1. **Create PostgreSQL Database**
   - Railway Dashboard → New → Database → PostgreSQL
   - Railway automatically creates the database

2. **Set Environment Variable**
   - Railway automatically links `DATABASE_URL` if services are in the same project
   - Or manually: Copy `DATABASE_URL` from PostgreSQL service → Add to Next.js service variables

3. **Deploy**
   - Push to GitHub (Railway auto-deploys)
   - Database setup runs automatically before app starts
   - ✅ Done!

## 🔧 How It Works

### Automatic Setup on Deploy

The `railway.json` file configures Railway to:
1. Build the Next.js app
2. Run `npm run db:setup` (creates tables + migrates data)
3. Start the app with `npm start`

### What `db:setup` Does

1. **Checks for DATABASE_URL**
   - If not set: Skips setup (uses JSON files)
   - If set: Continues with database setup

2. **Creates Tables** (if they don't exist)
   - `sites` table
   - `pages` table  
   - `leads` table
   - Indexes for performance

3. **Migrates JSON Files** (if they exist)
   - Reads JSON files from `data/` folder
   - Inserts into database (only if not already exists)
   - Safe to run multiple times (idempotent)

4. **Graceful Failure**
   - If setup fails, app still starts
   - Falls back to JSON files if database unavailable

## 📋 Configuration Files

### `railway.json`
The repo uses a start command that runs database setup then starts the app. Example (see your project's railway.json):
- `SKIP_JSON_MIGRATION=true npm run db:setup && npm start` — skips JSON migration on every deploy (faster; use after first deploy).
- Or `npm run db:setup && npm start` for first deploy so JSON files are migrated once.

This ensures database setup runs before the app starts.

### `scripts/setup-db.ts`
- Combined init + migrate script
- Idempotent (safe to run multiple times)
- Handles errors gracefully

## 🧪 Testing Locally

```bash
# Set DATABASE_URL
export DATABASE_URL="postgresql://..."

# Test setup
npm run db:setup

# Start app
npm start
```

## ✅ Verification

After deployment, check Railway logs:
- Look for "🔧 Setting up database..."
- Should see "✅ Tables created/verified"
- Should see migration messages (if JSON files exist)

## 🔄 Subsequent Deploys

- Tables already exist? ✅ No problem (IF NOT EXISTS)
- Data already migrated? ✅ No problem (checks before insert)
- New JSON files? ✅ Automatically migrates them

**Every deploy is safe!**

## 🐛 Troubleshooting

### Setup Not Running
- Check Railway logs for errors
- Verify `railway.json` is committed to git
- Check that `DATABASE_URL` is set

### Tables Not Created
- Check Railway logs for database connection errors
- Verify `DATABASE_URL` is correct
- Check PostgreSQL service is running

### Migration Not Working
- JSON files must be in `data/` folder
- Files must be valid JSON
- Check Railway logs for specific errors

## 📝 Manual Commands (If Needed)

```bash
# Initialize tables only
npm run db:init

# Migrate JSON files only  
npm run db:migrate

# Both (what runs on deploy)
npm run db:setup
```

## ⚡ Build optimization

- **SKIP_JSON_MIGRATION**: After your first successful deploy, set `SKIP_JSON_MIGRATION=true` in Railway so subsequent deploys skip JSON file migration (~2–3 min faster startup).
- **First deploy**: Deploy without `SKIP_JSON_MIGRATION` once so JSON in `data/` is migrated; then add the variable.
- **.nixpacks.toml**: Uses `npm ci --prefer-offline --no-audit --no-fund` for faster installs; Railway caches the build.

## 📋 Deployment checklist

Before each deploy:
- [ ] `npm run lint` and `npm run build` pass locally
- [ ] `npm run validate-env` (optional)
- [ ] DATABASE_URL and any required vars set in Railway
- [ ] After first deploy: set `SKIP_JSON_MIGRATION=true` for faster restarts

After deploy:
- [ ] Check Railway logs for "✅ Tables created/verified" or "ℹ️ Skipping JSON migration"
- [ ] Hit `/api/health` — should return 200
- [ ] Rollback: Railway Dashboard → Deployments → last working → Redeploy

## 🎯 Summary

**Before**: Manual database setup required
**Now**: Automatic on every deploy! 🎉

Just set `DATABASE_URL` and deploy. Everything else is automatic.

